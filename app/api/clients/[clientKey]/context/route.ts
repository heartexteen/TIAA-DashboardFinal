import { NextResponse } from "next/server"
import { loadClientContextBundleFromS3 } from "@/lib/agents/shared/client-store"
import { createAgent1SeedGraph } from "@/lib/agents/agent1/graph"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/**
 * GET /api/clients/:clientKey/context
 *
 * Returns the complete context bundle used by the UI and Agent 2/3.
 */
export async function GET(_req: Request, ctx: { params: Promise<{ clientKey: string }> }) {
  // Next.js generates types expecting `params` to be a Promise in this project setup.
  const { clientKey } = await ctx.params
  const autoExtract =
    (process.env.TIAA_AUTO_EXTRACT_FROM_S3_PDFS || "").toLowerCase() === "true" ||
    process.env.NODE_ENV !== "production"
  try {
    const bundle = await loadClientContextBundleFromS3(clientKey)
    return NextResponse.json(bundle, { status: 200 })
  } catch (err: any) {
    if (autoExtract) {
      try {
        const g = createAgent1SeedGraph()
        await g.run({})
        const bundle = await loadClientContextBundleFromS3(clientKey)
        return NextResponse.json(bundle, { status: 200 })
      } catch (retryErr: any) {
        return NextResponse.json({ error: retryErr?.message || String(retryErr) }, { status: 500 })
      }
    }
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 })
  }
}
