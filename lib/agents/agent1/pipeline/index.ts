/**
 * Agent 1 Pipeline — orchestrates the 5-node extraction pipeline.
 *
 * Nodes run sequentially for each client:
 *   loadPdfs -> extractDocuments -> validate -> deriveInsights -> writeToS3
 *
 * This module is the single entry point that graph.ts calls.
 */

import { nonPdfClientData } from "@/lib/non-pdf-client-data/non-pdf"
import type { MockClientKey } from "@/lib/non-pdf-client-data/types"
import { IPS_TEMPLATE, RTQ_TEMPLATE, ESTATE_TEMPLATE } from "@/lib/agents/agent1/contracts"
import { getTiaaS3Config } from "@/lib/aws/config"
import { s3ListKeys } from "@/lib/aws/s3"
import { loadPdfsNode } from "./load-pdfs"
import { extractDocumentsNode } from "./extract-documents"
import { validateNode } from "./validate"
import { deriveInsightsNode } from "./derive-insights"
import { writeToS3Node } from "./write-to-s3"
import type { Agent1PipelineState } from "./types"

// Re-export types and deriveTotalAssets for external consumers
export type { Agent1PipelineState } from "./types"
export { deriveTotalAssets } from "./write-to-s3"

/**
 * Check if a client has source PDF documents — either hardcoded or in S3.
 */
async function clientHasPdfs(clientKey: MockClientKey): Promise<boolean> {
  // Check hardcoded source documents first
  const base = nonPdfClientData[clientKey]
  if (base) {
    const docs = base.sourceDocuments
    if (docs.ips && docs.rtq && docs.estate) return true
  }

  // Check S3 input folder for uploaded PDFs
  try {
    const cfg = getTiaaS3Config()
    const prefix = `${cfg.agent1.inputPrefix}${clientKey}/`
    const keys = await s3ListKeys({ bucket: cfg.bucket, prefix })
    const pdfKeys = keys.filter((k) => k.toLowerCase().endsWith(".pdf"))
    // Need at least 1 PDF that looks like IPS, RTQ, or Estate
    const hasIps = pdfKeys.some((k) => /ips|investment.?policy/i.test(k))
    const hasRtq = pdfKeys.some((k) => /rtq|risk.?tolerance/i.test(k))
    const hasEstate = pdfKeys.some((k) => /estate/i.test(k))
    return hasIps || hasRtq || hasEstate
  } catch {
    return false
  }
}

/**
 * Build minimal state for a client with no PDFs (holdings-only).
 * Uses empty templates + ipsSupplement so the overview page works.
 */
function buildNoPdfState(clientKey: MockClientKey): Agent1PipelineState {
  const base = nonPdfClientData[clientKey]
  const ipsData = base.ipsSupplement
    ? { ...structuredClone(IPS_TEMPLATE), ...base.ipsSupplement }
    : structuredClone(IPS_TEMPLATE)

  return {
    clientKey,
    ipsData: ipsData as Record<string, unknown>,
    rtqData: structuredClone(RTQ_TEMPLATE) as Record<string, unknown>,
    estateData: structuredClone(ESTATE_TEMPLATE) as Record<string, unknown>,
    profileComparison: [],
    alerts: [{
      type: "info",
      title: "Documents Pending",
      description: `Awaiting IPS, RTQ, and estate planning documents for ${base.client.name}. Upload documents to enable full dashboard analysis.`,
      priority: "medium",
    }],
    aiSuggestions: [
      { priority: "high", action: "Upload Investment Policy Statement", rationale: "IPS is needed to establish target asset allocation and risk parameters.", category: "Onboarding" },
      { priority: "high", action: "Complete Risk Tolerance Questionnaire", rationale: "RTQ establishes the client's risk profile and guides portfolio construction.", category: "Onboarding" },
      { priority: "medium", action: "Upload estate planning documents", rationale: "Estate worksheet enables beneficiary tracking and tax planning analysis.", category: "Onboarding" },
      { priority: "medium", action: "Review current holdings allocation", rationale: "Holdings data is available — review alignment with investment objectives.", category: "Portfolio Review" },
    ],
    meetingTopics: [
      "New client onboarding — review investment objectives",
      "Discuss risk tolerance and time horizon",
      "Review current holdings and allocation",
      "Identify estate planning needs",
      "Establish target asset allocation",
    ],
  }
}

/**
 * Run the Agent 1 extraction pipeline for a single client.
 */
export async function extractAgent1ForClient(clientKey: MockClientKey): Promise<{
  clientKey: string
  keys: string[]
}> {
  if (!nonPdfClientData[clientKey]) {
    throw new Error(`Unknown client key: ${clientKey}`)
  }

  // Clients without PDFs get minimal output from non-PDF data only
  if (!(await clientHasPdfs(clientKey))) {
    let state = buildNoPdfState(clientKey)
    state = { ...state, ...(await writeToS3Node(state)) }
    return { clientKey, keys: state.wroteKeys ?? [] }
  }

  // Full extraction pipeline for clients with PDFs
  let state: Agent1PipelineState = { clientKey }
  state = { ...state, ...(await loadPdfsNode(state)) }
  state = { ...state, ...(await extractDocumentsNode(state)) }
  state = { ...state, ...(await validateNode(state)) }
  state = { ...state, ...(await deriveInsightsNode(state)) }
  state = { ...state, ...(await writeToS3Node(state)) }

  return { clientKey, keys: state.wroteKeys ?? [] }
}

/**
 * Run the full Agent 1 extraction pipeline for all registered clients.
 */
export async function extractAgent1OutputsFromS3Pdfs(): Promise<{
  wrote: Array<{ clientKey: string; keys: string[] }>
}> {
  const wrote: Array<{ clientKey: string; keys: string[] }> = []

  for (const clientKey of Object.keys(nonPdfClientData) as MockClientKey[]) {
    const result = await extractAgent1ForClient(clientKey)
    wrote.push(result)
  }

  return { wrote }
}
