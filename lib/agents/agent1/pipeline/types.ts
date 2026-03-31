import type { MockClientKey } from "@/lib/non-pdf-client-data/types"
import type { ValidationReport } from "../validation"

export type Agent1PipelineState = {
  // Per-client state (set before each client run)
  clientKey?: MockClientKey

  // Node 1: load_pdfs
  ipsBytes?: Uint8Array
  rtqBytes?: Uint8Array
  estateBytes?: Uint8Array

  // Node 2: extract_documents
  rawIpsData?: Record<string, unknown>
  rawRtqData?: Record<string, unknown>
  rawEstateData?: Record<string, unknown>

  // Node 3: validate
  ipsData?: Record<string, unknown>
  rtqData?: Record<string, unknown>
  estateData?: Record<string, unknown>
  validationReports?: ValidationReport[]

  // Node 4: derive_insights
  profileComparison?: any[]
  alerts?: Array<{ type: string; title: string; description: string; priority: string }>
  aiSuggestions?: Array<{ priority: string; action: string; rationale: string; category: string }>
  meetingTopics?: string[]

  // Node 5: write_to_s3
  wroteKeys?: string[]

  // Control
  error?: string
  __trace?: string[]
}
