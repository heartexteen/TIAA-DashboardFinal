import { getTiaaS3Config } from "@/lib/aws/config"
import { s3GetBytes, s3ListKeys } from "@/lib/aws/s3"
import { nonPdfClientData } from "@/lib/non-pdf-client-data/non-pdf"
import type { MockClientKey } from "@/lib/non-pdf-client-data/types"
import type { Agent1PipelineState } from "./types"

// ---------------------------------------------------------------------------
// loadPdfBytes — tries multiple S3 key candidates for a single PDF
// ---------------------------------------------------------------------------

async function loadPdfBytes(args: {
  clientKey: MockClientKey
  fileName: string
  relativeKey: string
}): Promise<Uint8Array> {
  const cfg = getTiaaS3Config()
  const candidates = [
    args.relativeKey,
    `${args.clientKey}/${args.fileName}`,
    `${cfg.agent1.inputPrefix}${args.relativeKey}`,
    `${cfg.agent1.inputPrefix}${args.clientKey}/${args.fileName}`,
  ]

  let lastError: unknown = null
  for (const key of candidates) {
    try {
      const bytes = await s3GetBytes({ bucket: cfg.bucket, key })
      if (bytes.length > 0) return bytes
    } catch (err) {
      lastError = err
    }
  }

  throw new Error(
    `Unable to load PDF for ${args.clientKey}/${args.fileName}. Tried keys: ${candidates.join(", ")}. Last error: ${
      lastError instanceof Error ? lastError.message : String(lastError)
    }`,
  )
}

// ---------------------------------------------------------------------------
// discoverPdfsFromS3 — find PDFs in S3 when no hardcoded source docs exist
// ---------------------------------------------------------------------------

async function discoverPdfsFromS3(clientKey: MockClientKey): Promise<{
  ipsKey?: string
  rtqKey?: string
  estateKey?: string
}> {
  const cfg = getTiaaS3Config()
  const prefix = `${cfg.agent1.inputPrefix}${clientKey}/`
  const keys = await s3ListKeys({ bucket: cfg.bucket, prefix })
  const pdfKeys = keys.filter((k) => k.toLowerCase().endsWith(".pdf"))

  return {
    ipsKey: pdfKeys.find((k) => /ips|investment.?policy/i.test(k)),
    rtqKey: pdfKeys.find((k) => /rtq|risk.?tolerance/i.test(k)),
    estateKey: pdfKeys.find((k) => /estate/i.test(k)),
  }
}

// ---------------------------------------------------------------------------
// Node: load_pdfs
// ---------------------------------------------------------------------------

export async function loadPdfsNode(
  state: Agent1PipelineState,
): Promise<Partial<Agent1PipelineState>> {
  const clientKey = state.clientKey
  if (!clientKey) throw new Error("loadPdfsNode: clientKey is not set on state.")

  const base = nonPdfClientData[clientKey]
  if (!base) throw new Error(`loadPdfsNode: no nonPdfClientData for client "${clientKey}".`)

  const cfg = getTiaaS3Config()
  const hasHardcodedDocs = !!(base.sourceDocuments.ips && base.sourceDocuments.rtq && base.sourceDocuments.estate)

  if (hasHardcodedDocs) {
    // Use hardcoded source document metadata
    const ipsDoc = base.sourceDocuments.ips!
    const rtqDoc = base.sourceDocuments.rtq!
    const estateDoc = base.sourceDocuments.estate!

    const [ipsResult, rtqResult, estateResult] = await Promise.all([
      loadPdfBytes({ clientKey, fileName: ipsDoc.fileName, relativeKey: ipsDoc.s3Key }).catch((err) => {
        console.warn(`[load_pdfs] IPS load failed for ${clientKey}:`, err)
        return undefined
      }),
      loadPdfBytes({ clientKey, fileName: rtqDoc.fileName, relativeKey: rtqDoc.s3Key }).catch((err) => {
        console.warn(`[load_pdfs] RTQ load failed for ${clientKey}:`, err)
        return undefined
      }),
      loadPdfBytes({ clientKey, fileName: estateDoc.fileName, relativeKey: estateDoc.s3Key }).catch((err) => {
        console.warn(`[load_pdfs] Estate load failed for ${clientKey}:`, err)
        return undefined
      }),
    ])

    return { ipsBytes: ipsResult, rtqBytes: rtqResult, estateBytes: estateResult }
  }

  // Discover PDFs from S3 input folder (for clients without hardcoded docs)
  const discovered = await discoverPdfsFromS3(clientKey)

  const loadKey = async (key?: string) => {
    if (!key) return undefined
    try {
      return await s3GetBytes({ bucket: cfg.bucket, key })
    } catch (err) {
      console.warn(`[load_pdfs] Failed to load ${key}:`, err)
      return undefined
    }
  }

  const [ipsResult, rtqResult, estateResult] = await Promise.all([
    loadKey(discovered.ipsKey),
    loadKey(discovered.rtqKey),
    loadKey(discovered.estateKey),
  ])

  return { ipsBytes: ipsResult, rtqBytes: rtqResult, estateBytes: estateResult }
}
