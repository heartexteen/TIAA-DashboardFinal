import { NextRequest, NextResponse } from "next/server"
import { getTiaaS3Config } from "@/lib/aws/config"
import { s3PutBytes } from "@/lib/aws/s3"
import { extractAgent1ForClient } from "@/lib/agents/agent1/pipeline"
import type { MockClientKey } from "@/lib/non-pdf-client-data/types"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const VALID_DOC_TYPES = ["ips", "rtq", "estate"] as const
type DocType = (typeof VALID_DOC_TYPES)[number]

/**
 * POST /api/documents/upload
 *
 * Accepts multipart form data with:
 * - file: PDF file
 * - clientKey: e.g. "maria"
 * - docType: "ips" | "rtq" | "estate"
 *
 * Uploads PDF to S3 input folder, then runs full extraction pipeline for the client.
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File | null
    const clientKey = formData.get("clientKey") as string | null
    const docType = formData.get("docType") as string | null

    if (!file) return NextResponse.json({ error: "No file provided." }, { status: 400 })
    if (!clientKey) return NextResponse.json({ error: "Missing clientKey." }, { status: 400 })
    if (!docType || !VALID_DOC_TYPES.includes(docType as DocType)) {
      return NextResponse.json({ error: `Invalid docType. Must be one of: ${VALID_DOC_TYPES.join(", ")}` }, { status: 400 })
    }
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      return NextResponse.json({ error: "Only PDF files are accepted." }, { status: 400 })
    }

    // Read file bytes
    const arrayBuffer = await file.arrayBuffer()
    const bytes = new Uint8Array(arrayBuffer)

    // Upload to S3 input folder: agent1(extractor)-input(PDF)/{clientKey}/{filename}
    const cfg = getTiaaS3Config()
    const s3Key = `${cfg.agent1.inputPrefix}${clientKey}/${file.name}`
    await s3PutBytes({
      bucket: cfg.bucket,
      key: s3Key,
      bytes,
      contentType: "application/pdf",
    })

    // Run full extraction pipeline for this client
    const result = await extractAgent1ForClient(clientKey as MockClientKey)

    return NextResponse.json({
      ok: true,
      uploaded: { key: s3Key, fileName: file.name, docType, clientKey },
      extraction: result,
    })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || String(err) }, { status: 500 })
  }
}
