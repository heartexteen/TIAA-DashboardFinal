/**
 * Shared domain types for the Wealth Advisor dashboard.
 *
 * Keep this file "runtime safe" for both client + server imports:
 * - No AWS SDK imports
 * - No Node-only APIs
 *
 * The goal is to decouple UI code from `lib/mock-data.ts` so we can delete/move the seed file later.
 */

export type DocumentType = "IPS" | "RTQ" | "Estate" | "Tax" | "Other" | string
export type DocumentStatus = "processed" | "processing" | "pending" | string

export interface Document {
  id: string
  name: string
  type: DocumentType
  uploadedAt: string
  status: DocumentStatus
  extractedData?: Record<string, unknown>
  pdfPath?: string
}

export interface Alert {
  id: string
  type: "mismatch" | "action_required" | "info" | "warning" | string
  title: string
  description: string
  priority: "high" | "medium" | "low" | string
  createdAt: string
}

export interface ClientRecord {
  id: string // Should match S3 folder key in the new system ("carina", "john", ...)
  name: string
  email: string
  phone: string
  advisor: string
  status: "active" | "pending" | "inactive" | string
  totalAssets: number
  lastMeeting: string
  nextMeeting: string
  documents: Document[]
  alerts: Alert[]
}

/**
 * Holdings types used by the overview page.
 * Agent 1 can produce these later from an actual holdings data source.
 */
export interface Holding {
  name: string
  // Many datasets use ticker instead of symbol.
  ticker?: string
  symbol?: string
  // Some holdings (like your mock data) include a stable id.
  id?: string
  assetClass: string
  marketValue: number
  allocationPct: number
  market?: string
  instrumentType?: string
  currency?: string
  units?: number
  price?: number
  costBasis?: number
  unrealizedGain?: number
  expenseRatio?: number
  yield?: number
  durationYears?: number
  creditQuality?: string
  sector?: string
  region?: string
  notes?: string
}

export interface HoldingsAccountSnapshot {
  accountName: string
  accountType: "Tax-Deferred" | "Tax-Free" | "Taxable"
  institution: string
  holdings: Holding[]
}

export interface HoldingsSnapshot {
  asOf: string
  currency: "USD"
  accounts: HoldingsAccountSnapshot[]
}
