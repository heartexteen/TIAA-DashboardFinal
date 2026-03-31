import { BedrockRuntimeClient, ConverseCommand } from "@aws-sdk/client-bedrock-runtime"
import { mergeWithTemplate, templateForDocument, type Agent1DocumentType } from "../contracts"
import {
  extractionSystemPrompt,
  ipsExtractionPrompt,
  rtqExtractionPrompt,
  estateExtractionPrompt,
} from "../prompts"
import { sanitizeExtractedDocument } from "../sanitizers"
import { getTiaaS3Config } from "@/lib/aws/config"
import { nonPdfClientData } from "@/lib/non-pdf-client-data/non-pdf"
import type { Agent1PipelineState } from "./types"

// ---------------------------------------------------------------------------
// Bedrock helpers
// ---------------------------------------------------------------------------

function getExtractionModelId(): string {
  return (
    process.env.BEDROCK_EXTRACTION_MODEL_ID ||
    process.env.BEDROCK_MODEL_ID ||
    "amazon.nova-pro-v1:0"
  )
}

function createBedrockClient(): BedrockRuntimeClient {
  const cfg = getTiaaS3Config()
  return new BedrockRuntimeClient({ region: cfg.region })
}

async function readConverseText(output: unknown): Promise<string> {
  const out = output as any
  const blocks = out?.output?.message?.content
  if (!Array.isArray(blocks)) return ""
  return blocks.map((b: any) => b?.text).filter(Boolean).join("")
}

function parseJsonText(text: string): any {
  const trimmed = text.trim()
  if (!trimmed) throw new Error("Model returned empty content.")

  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i)
  if (fenced?.[1]) return JSON.parse(fenced[1])

  const firstBrace = trimmed.indexOf("{")
  const lastBrace = trimmed.lastIndexOf("}")
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    return JSON.parse(trimmed.slice(firstBrace, lastBrace + 1))
  }

  throw new Error("Model response did not contain parseable JSON.")
}

// ---------------------------------------------------------------------------
// Single-document extraction via Bedrock Converse
// ---------------------------------------------------------------------------

async function invokeDocumentExtraction(args: {
  clientName: string
  documentType: Agent1DocumentType
  pdfBytes: Uint8Array
}): Promise<Record<string, unknown>> {
  const bedrock = createBedrockClient()
  const modelId = getExtractionModelId()

  const system =
    args.documentType === "ips"
      ? extractionSystemPrompt("PDF Investment Policy Statement")
      : args.documentType === "rtq"
        ? extractionSystemPrompt("PDF Risk Tolerance Questionnaire")
        : extractionSystemPrompt("PDF Estate Planning document")

  const prompt =
    args.documentType === "ips"
      ? ipsExtractionPrompt(args.clientName)
      : args.documentType === "rtq"
        ? rtqExtractionPrompt(args.clientName)
        : estateExtractionPrompt(args.clientName)

  const command = new ConverseCommand({
    modelId,
    system: [{ text: system }],
    messages: [
      {
        role: "user",
        content: [
          { text: prompt },
          {
            document: {
              format: "pdf",
              name: "Source Document",
              source: { bytes: args.pdfBytes },
            },
          },
        ],
      },
    ],
    inferenceConfig: {
      maxTokens: 4000,
      temperature: 0,
    },
  })

  const resp = await bedrock.send(command)
  const text = await readConverseText(resp)
  const parsed = parseJsonText(text)
  return sanitizeExtractedDocument(
    args.documentType,
    mergeWithTemplate(templateForDocument(args.documentType), parsed),
  ) as Record<string, unknown>
}

// ---------------------------------------------------------------------------
// IPS supplement merge
// ---------------------------------------------------------------------------

function applyIpsSupplement(
  ipsData: Record<string, unknown>,
  supplement?: Record<string, unknown>,
): Record<string, unknown> {
  if (!supplement) return ipsData
  return { ...ipsData, ...supplement }
}

// ---------------------------------------------------------------------------
// Node: extract_documents
// ---------------------------------------------------------------------------

export async function extractDocumentsNode(
  state: Agent1PipelineState,
): Promise<Partial<Agent1PipelineState>> {
  const clientKey = state.clientKey
  if (!clientKey) throw new Error("extractDocumentsNode: clientKey is not set on state.")

  const base = nonPdfClientData[clientKey]
  if (!base) throw new Error(`extractDocumentsNode: no nonPdfClientData for client "${clientKey}".`)

  const clientName = base.client.name

  // Run all 3 extractions in parallel. Each is independently wrapped in
  // try/catch so one failure does not block the others.
  const [ipsResult, rtqResult, estateResult] = await Promise.all([
    state.ipsBytes
      ? invokeDocumentExtraction({ clientName, documentType: "ips", pdfBytes: state.ipsBytes }).catch((err) => {
          console.warn(`[extract_documents] IPS extraction failed for ${clientKey}:`, err)
          return undefined
        })
      : Promise.resolve(undefined),
    state.rtqBytes
      ? invokeDocumentExtraction({ clientName, documentType: "rtq", pdfBytes: state.rtqBytes }).catch((err) => {
          console.warn(`[extract_documents] RTQ extraction failed for ${clientKey}:`, err)
          return undefined
        })
      : Promise.resolve(undefined),
    state.estateBytes
      ? invokeDocumentExtraction({ clientName, documentType: "estate", pdfBytes: state.estateBytes }).catch((err) => {
          console.warn(`[extract_documents] Estate extraction failed for ${clientKey}:`, err)
          return undefined
        })
      : Promise.resolve(undefined),
  ])

  // Apply ipsSupplement from nonPdfClientData if present
  const rawIps = ipsResult
    ? applyIpsSupplement(ipsResult, base.ipsSupplement)
    : undefined

  return {
    rawIpsData: rawIps,
    rawRtqData: rtqResult,
    rawEstateData: estateResult,
  }
}
