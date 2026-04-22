import { NextRequest, NextResponse } from "next/server"
import { getTiaaS3Config } from "@/lib/aws/config"
import { s3GetBytes, s3ListKeys } from "@/lib/aws/s3"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const DOC_TYPE_REGEX: Record<string, RegExp> = {
  ips: /ips|investment.?policy/i,
  rtq: /rtq|risk.?tolerance/i,
  estate: /estate/i,
}

/**
 * GET /api/documents/pdf?clientKey=maria&docType=ips
 *
 * Streams the source PDF for a given client + document type from S3.
 * Uses the same discovery logic as the Agent 1 extraction pipeline, so the
 * PDF shown here is always the one that was (or will be) extracted.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const clientKey = searchParams.get("clientKey")
    const docType = searchParams.get("docType")
    const disposition = searchParams.get("download") === "1" ? "attachment" : "inline"

    if (!clientKey) return NextResponse.json({ error: "Missing clientKey." }, { status: 400 })
    if (!docType || !DOC_TYPE_REGEX[docType]) {
      return NextResponse.json(
        { error: `Invalid docType. Must be one of: ${Object.keys(DOC_TYPE_REGEX).join(", ")}` },
        { status: 400 },
      )
    }

    const cfg = getTiaaS3Config()
    const prefix = `${cfg.agent1.inputPrefix}${clientKey}/`
    const keys = await s3ListKeys({ bucket: cfg.bucket, prefix })
    const pdfKeys = keys.filter((k) => k.toLowerCase().endsWith(".pdf"))
    const match = pdfKeys.find((k) => DOC_TYPE_REGEX[docType].test(k))

    if (!match) {
      return NextResponse.json(
        { error: `No ${docType.toUpperCase()} PDF found for "${clientKey}" under s3://${cfg.bucket}/${prefix}` },
        { status: 404 },
      )
    }

    const bytes = await s3GetBytes({ bucket: cfg.bucket, key: match })
    const fileName = match.split("/").pop() || `${clientKey}_${docType}.pdf`
    const body = new Blob([bytes as BlobPart], { type: "application/pdf" })

    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `${disposition}; filename="${fileName}"`,
        "Cache-Control": "no-store",
      },
    })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || String(err) }, { status: 500 })
  }
}
