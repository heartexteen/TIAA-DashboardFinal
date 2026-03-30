import { NextResponse } from "next/server"
import { createAgent1SeedGraph } from "@/lib/agents/agent1/graph"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/**
 * POST /api/agent1/seed
 *
 * Manually triggers Agent 1 seed-mode.
 * Useful if you want explicit control instead of relying on /api/clients auto-seed.
 */
export async function POST() {
  try {
    const g = createAgent1SeedGraph()
    const result = await g.run({})
    return NextResponse.json({ ok: true, result }, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || String(err) }, { status: 500 })
  }
}

