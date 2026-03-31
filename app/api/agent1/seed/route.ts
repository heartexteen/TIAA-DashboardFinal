import { NextRequest, NextResponse } from "next/server"
import { extractAgent1ForClient, extractAgent1OutputsFromS3Pdfs } from "@/lib/agents/agent1/pipeline"
import type { MockClientKey } from "@/lib/non-pdf-client-data/types"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/**
 * POST /api/agent1/seed
 *
 * Manually triggers Agent 1 extraction.
 * - With body { clientKey: "john" } → extracts only that client
 * - Without body or empty → extracts all clients
 */
export async function POST(request: NextRequest) {
  try {
    let clientKey: string | undefined
    try {
      const body = await request.json()
      clientKey = body?.clientKey
    } catch {
      // No body or invalid JSON — extract all clients
    }

    if (clientKey) {
      const result = await extractAgent1ForClient(clientKey as MockClientKey)
      return NextResponse.json({ ok: true, result }, { status: 200 })
    }

    const result = await extractAgent1OutputsFromS3Pdfs()
    return NextResponse.json({ ok: true, result }, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || String(err) }, { status: 500 })
  }
}
