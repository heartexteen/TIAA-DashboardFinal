import { getTiaaS3Config } from "@/lib/aws/config"
import { s3PutJson } from "@/lib/aws/s3"
import { nonPdfClientData } from "@/lib/non-pdf-client-data/non-pdf"
import type { Agent1PipelineState } from "./types"

// ---------------------------------------------------------------------------
// deriveTotalAssets — best-effort from IPS, RTQ, or estate data
// ---------------------------------------------------------------------------

export function deriveTotalAssets(ipsData: any, rtqData: any, estateData: any): number {
  const ipsValue = Number(ipsData?.clientProfile?.totalPortfolioValue || 0)
  if (ipsValue > 0) return ipsValue

  const rtqValue = Number(
    rtqData?.financialProfile?.assetsUnderConsideration || 0,
  )
  if (rtqValue > 0) return rtqValue

  const estateValue = Array.isArray(estateData?.assetsAndRecipients)
    ? estateData.assetsAndRecipients.reduce(
        (sum: number, item: any) => sum + Number(item?.value || 0),
        0,
      )
    : 0
  return estateValue
}

// ---------------------------------------------------------------------------
// S3 key builder
// ---------------------------------------------------------------------------

function keyFor(clientKey: string, file: string): string {
  const cfg = getTiaaS3Config()
  return `${cfg.agent1.outputPrefix}${clientKey}/${file}`
}

// ---------------------------------------------------------------------------
// Node: write_to_s3
// ---------------------------------------------------------------------------

export async function writeToS3Node(
  state: Agent1PipelineState,
): Promise<Partial<Agent1PipelineState>> {
  const clientKey = state.clientKey
  if (!clientKey) throw new Error("writeToS3Node: clientKey is not set on state.")

  const base = nonPdfClientData[clientKey]
  if (!base) throw new Error(`writeToS3Node: no nonPdfClientData for client "${clientKey}".`)

  const cfg = getTiaaS3Config()
  const ipsData = state.ipsData ?? {}
  const rtqData = state.rtqData ?? {}
  const estateData = state.estateData ?? {}

  // Build the client record
  const clientRecord = {
    ...base.client,
    id: clientKey,
    totalAssets: deriveTotalAssets(ipsData, rtqData, estateData),
    alerts: state.alerts ?? [],
  }

  const keys: string[] = []

  const write = async (file: string, value: unknown) => {
    const key = keyFor(clientKey, file)
    await s3PutJson({ bucket: cfg.bucket, key, value })
    keys.push(key)
  }

  // Write all 7 JSON files — each write is independent
  await Promise.all([
    write("client.json", clientRecord),
    write("ips.json", ipsData),
    write("rtq.json", rtqData),
    write("estate.json", estateData),
    write("profile-comparison.json", state.profileComparison ?? []),
    write("ai-suggestions.json", state.aiSuggestions ?? []),
    write("meeting-topics.json", state.meetingTopics ?? []),
  ])

  return { wroteKeys: keys }
}
