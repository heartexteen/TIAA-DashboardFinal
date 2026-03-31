import { NextRequest, NextResponse } from "next/server"
import { getTiaaS3Config } from "@/lib/aws/config"
import { s3ListKeys } from "@/lib/aws/s3"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

type S3Document = {
  fileName: string
  s3Key: string
  type: "IPS" | "RTQ" | "Estate" | "Other"
  status: "processed" | "pending"
}

function classifyDocType(fileName: string): "IPS" | "RTQ" | "Estate" | "Other" {
  const lower = fileName.toLowerCase()
  if (lower.includes("ips") || lower.includes("investment_policy") || lower.includes("investment-policy")) return "IPS"
  if (lower.includes("rtq") || lower.includes("risk_tolerance") || lower.includes("risk-tolerance")) return "RTQ"
  if (lower.includes("estate") || lower.includes("estate_planning") || lower.includes("estate-planning")) return "Estate"
  return "Other"
}

/**
 * GET /api/documents/list?clientKey=maria
 *
 * Lists all PDF files in the S3 input folder for a client.
 * Also checks if output JSON exists (= processed).
 */
export async function GET(request: NextRequest) {
  const clientKey = request.nextUrl.searchParams.get("clientKey")
  if (!clientKey) return NextResponse.json({ error: "Missing clientKey." }, { status: 400 })

  try {
    const cfg = getTiaaS3Config()

    // List PDFs in input folder
    const inputPrefix = `${cfg.agent1.inputPrefix}${clientKey}/`
    const inputKeys = await s3ListKeys({ bucket: cfg.bucket, prefix: inputPrefix })
    const pdfKeys = inputKeys.filter((k) => k.toLowerCase().endsWith(".pdf"))

    // Check which output JSONs exist (to determine "processed" status)
    const outputPrefix = `${cfg.agent1.outputPrefix}${clientKey}/`
    const outputKeys = await s3ListKeys({ bucket: cfg.bucket, prefix: outputPrefix })
    const hasIpsJson = outputKeys.some((k) => k.endsWith("/ips.json"))
    const hasRtqJson = outputKeys.some((k) => k.endsWith("/rtq.json"))
    const hasEstateJson = outputKeys.some((k) => k.endsWith("/estate.json"))

    const documents: S3Document[] = pdfKeys.map((key) => {
      const fileName = key.split("/").pop() || key
      const docType = classifyDocType(fileName)
      const isProcessed =
        (docType === "IPS" && hasIpsJson) ||
        (docType === "RTQ" && hasRtqJson) ||
        (docType === "Estate" && hasEstateJson)

      return {
        fileName,
        s3Key: key,
        type: docType,
        status: isProcessed ? "processed" : "pending",
      }
    })

    return NextResponse.json({ clientKey, documents })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 })
  }
}
