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
 * Extraction mode:
 * - If client.json files don't exist yet, we auto-run Agent 1
 *   so it extracts the source PDFs from S3 and writes JSON artifacts.
 *
 * IMPORTANT:
 * - Agent 1 is the extraction pipeline writing these artifacts.
 */
export async function GET() {
  const autoExtract =
    (process.env.TIAA_AUTO_EXTRACT_FROM_S3_PDFS || "").toLowerCase() === "true" ||
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

  // If folders exist but JSON artifacts are missing (or no folders yet), run Agent 1 extraction.
  if (autoExtract && (clientKeys.length === 0 || missing.length > 0)) {
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
      extractedFromS3Pdfs: autoExtract && (missing.length > 0 || clientKeys.length === 0) ? true : undefined,
    },
    { status: 200 },
  )
}
