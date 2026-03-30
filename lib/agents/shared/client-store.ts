/**
 * S3-backed "client store" used across agents and the Next.js app.
 *
 * Agent 1 writes artifacts here:
 *   s3://<bucket>/<agent1OutputPrefix>/<clientKey>/client.json
 *   s3://<bucket>/<agent1OutputPrefix>/<clientKey>/ips.json
 *   s3://<bucket>/<agent1OutputPrefix>/<clientKey>/rtq.json
 *   s3://<bucket>/<agent1OutputPrefix>/<clientKey>/estate.json
 *   s3://<bucket>/<agent1OutputPrefix>/<clientKey>/profile-comparison.json
 *   s3://<bucket>/<agent1OutputPrefix>/<clientKey>/ai-suggestions.json
 *   s3://<bucket>/<agent1OutputPrefix>/<clientKey>/meeting-topics.json
 *
 * Agent 2 and Agent 3 read these JSON files.
 *
 * Design notes:
 * - We keep files small and focused (instead of one huge blob) so future extraction can
 *   update only the changed parts.
 * - The UI expects the same "shape" as the old `useClient()` context.
 */

import { getTiaaS3Config } from "@/lib/aws/config"
import { s3GetJson, s3ListSubPrefixes } from "@/lib/aws/s3"

export type ClientKey = string

export type ClientRecord = {
  id: string
  name: string
  email: string
  phone: string
  advisor: string
  status: "active" | "pending" | "inactive" | string
  totalAssets: number
  lastMeeting: string
  nextMeeting: string
  documents: Array<{
    id: string
    name: string
    type: string
    uploadedAt: string
    status: string
    pdfPath?: string
  }>
  alerts: Array<{
    id: string
    type: string
    title: string
    description: string
    priority: "high" | "medium" | "low" | string
    createdAt: string
  }>
}

export type ClientContextBundle = {
  clientKey: ClientKey
  currentClient: ClientRecord
  ipsData: unknown
  rtqData: unknown
  estateData: unknown
  profileComparison: unknown
  aiSuggestions: unknown
  meetingTopics: unknown
}

function keyFor(args: { outputPrefix: string; clientKey: string; file: string }) {
  const prefix = args.outputPrefix.endsWith("/") ? args.outputPrefix : `${args.outputPrefix}/`
  return `${prefix}${args.clientKey}/${args.file}`
}

export async function listClientKeysFromS3(): Promise<ClientKey[]> {
  const cfg = getTiaaS3Config()
  return await s3ListSubPrefixes({ bucket: cfg.bucket, prefix: cfg.agent1.outputPrefix })
}

export async function loadClientRecordFromS3(clientKey: ClientKey): Promise<ClientRecord> {
  const cfg = getTiaaS3Config()
  return await s3GetJson<ClientRecord>({
    bucket: cfg.bucket,
    key: keyFor({ outputPrefix: cfg.agent1.outputPrefix, clientKey, file: "client.json" }),
  })
}

export async function loadClientContextBundleFromS3(clientKey: ClientKey): Promise<ClientContextBundle> {
  const cfg = getTiaaS3Config()
  const outputPrefix = cfg.agent1.outputPrefix
  const bucket = cfg.bucket

  // NOTE: Keep these reads explicit; later we can parallelize or batch if needed.
  const [currentClient, ipsData, rtqData, estateData, profileComparison, aiSuggestions, meetingTopics] =
    await Promise.all([
      s3GetJson<ClientRecord>({ bucket, key: keyFor({ outputPrefix, clientKey, file: "client.json" }) }),
      s3GetJson({ bucket, key: keyFor({ outputPrefix, clientKey, file: "ips.json" }) }),
      s3GetJson({ bucket, key: keyFor({ outputPrefix, clientKey, file: "rtq.json" }) }),
      s3GetJson({ bucket, key: keyFor({ outputPrefix, clientKey, file: "estate.json" }) }),
      s3GetJson({ bucket, key: keyFor({ outputPrefix, clientKey, file: "profile-comparison.json" }) }),
      s3GetJson({ bucket, key: keyFor({ outputPrefix, clientKey, file: "ai-suggestions.json" }) }),
      s3GetJson({ bucket, key: keyFor({ outputPrefix, clientKey, file: "meeting-topics.json" }) }),
    ])

  return {
    clientKey,
    currentClient,
    ipsData,
    rtqData,
    estateData,
    profileComparison,
    aiSuggestions,
    meetingTopics,
  }
}

