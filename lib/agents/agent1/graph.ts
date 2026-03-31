/**
 * Agent 1 (Extractor) - Graph definition.
 *
 * Pipeline:
 *   START -> extract_from_s3_pdfs -> END
 *
 * The extraction logic is decomposed into a multi-step pipeline
 * (see ./pipeline/) with validation against reference data.
 */

import { AgentGraph } from "@/lib/agentic/graph"
import { extractAgent1OutputsFromS3Pdfs } from "./pipeline"

export type Agent1SeedState = {
  seeded?: boolean
  wroteKeys?: string[]
  error?: string
  __trace?: string[]
}

export function createAgent1SeedGraph() {
  const g = new AgentGraph<Agent1SeedState>()

  g.addNode("extract_from_s3_pdfs", async () => {
    const result = await extractAgent1OutputsFromS3Pdfs()
    const wroteKeys = result.wrote.flatMap((w) => w.keys)
    return { seeded: true, wroteKeys }
  })

  g.setStart("extract_from_s3_pdfs")

  return g
}
