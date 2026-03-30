import { NextResponse } from "next/server"
import { listClientKeysFromS3, loadClientRecordFromS3 } from "@/lib/agents/shared/client-store"
import { createAgent1SeedGraph } from "@/lib/agents/agent1/graph"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/**
 * GET /api/clients
 *
 * Agentic behavior:
 * - Scans S3 `agent1(extractor)-output(json)/` for client folders (prefixes).
 * - Loads each client's `client.json`.
 *
 * Seed mode (temporary):
 * - If client.json files don't exist yet, we auto-run Agent 1 seed graph
 *   to populate S3 output from local mock data.
 *
 * IMPORTANT:
 * - Auto-seeding is meant for development only.
 * - In production, Agent 1 should be a real extraction pipeline writing these artifacts.
 */
export async function GET() {
  const autoSeed =
    (process.env.TIAA_AUTO_SEED_FROM_LOCAL_MOCK_DATA || "").toLowerCase() === "true" ||
    process.env.NODE_ENV !== "production"

  let clientKeys = await listClientKeysFromS3()

  // Helper: attempt to load all clients, tracking any missing artifacts.
  const tryLoad = async () => {
    const clients = []
    const missing: string[] = []

    for (const key of clientKeys) {
      try {
        clients.push(await loadClientRecordFromS3(key))
      } catch {
        missing.push(key)
      }
    }

    return { clients, missing }
  }

  let { clients, missing } = await tryLoad()

  // If folders exist but JSON artifacts are missing (or no folders yet), seed.
  if (autoSeed && (clientKeys.length === 0 || missing.length > 0)) {
    const g = createAgent1SeedGraph()
    await g.run({})

    // Re-scan and reload after seeding.
    clientKeys = await listClientKeysFromS3()
    ;({ clients, missing } = await tryLoad())
  }

  // If still missing, return partial list with an explanation for debugging.
  return NextResponse.json(
    {
      clientKeys,
      clients,
      missingClientArtifacts: missing,
      seededFromLocalMockData: autoSeed && (missing.length > 0 || clientKeys.length === 0) ? true : undefined,
    },
    { status: 200 },
  )
}

