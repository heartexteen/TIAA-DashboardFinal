/**
 * Agent 1 (Extractor) - Graph definition.
 *
 * In seed-mode (today):
 *   START -> seed_from_local_mock -> END
 *
 * In real extraction mode (future):
 *   START -> list_pdfs_from_s3 -> extract_fields_with_llm -> validate_schema -> write_json -> END
 */

import { AgentGraph } from "@/lib/agentic/graph"
import { seedAgent1OutputsFromS3MockData } from "./seed-from-s3-mock"

export type Agent1SeedState = {
  // When true, Agent 1 did work (useful for debugging).
  seeded?: boolean
  wroteKeys?: string[]
  error?: string
  __trace?: string[]
}

export function createAgent1SeedGraph() {
  const g = new AgentGraph<Agent1SeedState>()

  g.addNode("seed_from_s3_mock_ts", async () => {
    const result = await seedAgent1OutputsFromS3MockData()
    const wroteKeys = result.wrote.flatMap((w) => w.keys)
    return { seeded: true, wroteKeys }
  })

  // Single-node flow for now.
  g.setStart("seed_from_s3_mock_ts")

  return g
}
