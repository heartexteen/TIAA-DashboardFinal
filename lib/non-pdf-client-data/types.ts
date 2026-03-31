export type MockClientKey = "carina" | "john" | "maria"
export type MockSourceDocumentKey = "ips" | "rtq" | "estate" | "trust" | "tax"

export interface ClientBaseRecord {
  id: string
  name: string
  email: string
  phone: string
  advisor: string
  status: "active" | "pending" | "inactive" | string
  lastMeeting: string
  nextMeeting: string
  documents: Array<{
    id: string
    name: string
    type: string
    uploadedAt: string
    status: string
    pdfPath?: string
  }>
}

export interface MockSourceDocument {
  type: "IPS" | "RTQ" | "Estate" | "Tax" | "Trust" | "Other"
  fileName: string
  s3Key: string
  promptSlug: string
  localPdfPath?: string
  notes?: string
}

export interface MockClientNonPdfData {
  clientKey: MockClientKey
  client: ClientBaseRecord
  sourceDocuments: Partial<Record<MockSourceDocumentKey, MockSourceDocument>>
  ipsSupplement?: Record<string, unknown>
}
