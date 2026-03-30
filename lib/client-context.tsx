"use client"

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react"

/**
 * ClientContext (REVAMP)
 * ---------------------
 *
 * Old world:
 * - UI imported `lib/mock-data.ts`
 * - Everything was local/static
 *
 * New world (agentic + S3-backed):
 * - Agent 1 writes per-client JSON artifacts to S3:
 *     s3://<bucket>/agent1(extractor)-output(json)/<clientKey>/client.json
 *     s3://<bucket>/agent1(extractor)-output(json)/<clientKey>/ips.json
 *     ...
 * - The browser NEVER talks to S3 directly (no AWS creds in the frontend).
 * - The browser calls Next.js API routes:
 *     GET  /api/clients
 *     GET  /api/clients/:clientKey/context
 *
 * Dev convenience:
 * - If S3 output is empty, GET /api/clients may auto-run Agent 1 "seed mode"
 *   to populate S3 from local mock data (temporary until PDF extraction exists).
 */

export type ClientRecord = {
  id: string // In the new system this matches the S3 folder key (e.g. "carina", "john")
  name: string
  email: string
  phone: string
  advisor: string
  status: string
  totalAssets: number
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
  alerts: Array<{
    id: string
    type: string
    title: string
    description: string
    priority: string
    createdAt: string
  }>
}

export type ClientContextBundle = {
  clientKey: string
  currentClient: ClientRecord
  ipsData: any
  rtqData: any
  estateData: any
  profileComparison: any
  aiSuggestions: any
  meetingTopics: any
}

export type ClientContextType = {
  // List & selection
  clients: ClientRecord[]
  selectedClientId: string
  setSelectedClientId: (id: string) => void

  // Selected client bundle (same “shape” your pages already use)
  currentClient: ClientRecord
  ipsData: any
  rtqData: any
  estateData: any
  profileComparison: any
  aiSuggestions: any
  meetingTopics: any

  // UX state
  isLoadingClients: boolean
  isLoadingContext: boolean
  error: string | null

  // Utility
  refresh: () => void
}

const ClientContext = createContext<ClientContextType | undefined>(undefined)

function emptyClient(): ClientRecord {
  return {
    id: "loading",
    name: "Loading…",
    email: "",
    phone: "",
    advisor: "",
    status: "loading",
    totalAssets: 0,
    lastMeeting: "",
    nextMeeting: "",
    documents: [],
    alerts: [],
  }
}

function emptyBundle(): ClientContextBundle {
  return {
    clientKey: "loading",
    currentClient: emptyClient(),
    // These defaults are shaped to prevent build-time prerender crashes.
    // Pages should still show "Loading…" until real data arrives from S3.
    ipsData: {
      clientProfile: { clientName: "Loading…", accounts: [], totalPortfolioValue: 0 },
      investmentObjectives: [],
      riskTolerance: "Loading…",
      timeHorizon: "Loading…",
      liquidityNeeds: "",
      returnGoal: "",
      targetAssetAllocation: {
        portfolioProfile: "Loading…",
        // Provide a stable shape so pages that index into allocations don't crash during prerender.
        allocations: [
          { assetClass: "Equity", targetAllocation: 0, allowableMin: 0, allowableMax: 100 },
          { assetClass: "Fixed Income", targetAllocation: 0, allowableMin: 0, allowableMax: 100 },
          { assetClass: "Alternatives", targetAllocation: 0, allowableMin: 0, allowableMax: 100 },
          { assetClass: "Cash & Equivalents", targetAllocation: 0, allowableMin: 0, allowableMax: 100 },
        ],
      },
      advisorNotes: [],
      benchmarks: [],
    },
    rtqData: {
      client: { name: "Loading…", document: "" },
      financialProfile: {},
      investmentPreferences: {
        timeHorizon: { selected: "Loading…", points: 0 },
        primaryInvestmentObjective: { selected: "Loading…", points: 0 },
        annualSpendingPolicy: { selected: "Loading…", points: 0 },
        returnExpectation: { selected: "Loading…", points: 0 },
        investmentApproach: { selected: "Loading…", points: 0 },
        reactionToLoss: { scenario: "", selected: "Loading…", points: 0 },
        mostFearedEvent: { selected: "Loading…", points: 0 },
        investmentKnowledge: { selected: "Loading…", points: 0 },
      },
      riskAssessment: { totalScore: 0, riskProfile: "Loading…", scoreRange: "", description: "" },
      suggestedAssetAllocation: { equity: 0, fixedIncome: 0, alternatives: 0, cash: 0 },
      investmentConstraints: { esgPreference: false, notes: [] },
    },
    estateData: {
      personalInformation: { name: "Loading…", maritalStatus: "", children: [], stateOfResidence: "" },
      powerOfAttorney: { primary: "", alternate: "" },
      beneficiaries: { qualified: "", primary: [], secondary: [] },
      taxExemption: "",
      assetsAndRecipients: [],
      trusteeDuties: [],
      documentsNeeded: [],
      actionItems: [],
    },
    profileComparison: [],
    aiSuggestions: [],
    meetingTopics: [],
  }
}

function getInitialClientId(): string {
  if (typeof window === "undefined") return "carina"
  const stored = localStorage.getItem("selectedClientId")
  return stored || "carina"
}

export function ClientProvider({ children }: { children: ReactNode }) {
  const [selectedClientId, setSelectedClientIdState] = useState(getInitialClientId())
  const [clients, setClients] = useState<ClientRecord[]>([])
  const [bundle, setBundle] = useState<ClientContextBundle>(() => emptyBundle())

  const [isLoadingClients, setIsLoadingClients] = useState(true)
  const [isLoadingContext, setIsLoadingContext] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Bump this to refresh list + context.
  const [refreshNonce, setRefreshNonce] = useState(0)

  // 1) Load client list (S3 scan via server route).
  useEffect(() => {
    let cancelled = false
    async function run() {
      setIsLoadingClients(true)
      setError(null)
      try {
        const res = await fetch("/api/clients", { cache: "no-store" })
        const json = await res.json()
        if (!res.ok) throw new Error(json?.error || `Failed to load clients (${res.status})`)

        const list = Array.isArray(json?.clients) ? (json.clients as ClientRecord[]) : []
        if (cancelled) return

        setClients(list)

        // If current selection is invalid, pick first client.
        if (list.length > 0 && !list.some((c) => c.id === selectedClientId)) {
          setSelectedClientIdState(list[0].id)
          localStorage.setItem("selectedClientId", list[0].id)
        }
      } catch (err: any) {
        if (cancelled) return
        setClients([])
        setError(err?.message || String(err))
      } finally {
        if (!cancelled) setIsLoadingClients(false)
      }
    }
    run()
    return () => {
      cancelled = true
    }
  }, [refreshNonce])

  // 2) Load selected client context bundle.
  useEffect(() => {
    let cancelled = false
    async function run() {
      setIsLoadingContext(true)
      setError(null)
      try {
        if (typeof window !== "undefined") {
          localStorage.setItem("selectedClientId", selectedClientId)
        }

        const res = await fetch(`/api/clients/${encodeURIComponent(selectedClientId)}/context`, { cache: "no-store" })
        const json = await res.json()
        if (!res.ok) throw new Error(json?.error || `Failed to load client context (${res.status})`)
        if (cancelled) return
        setBundle(json as ClientContextBundle)
      } catch (err: any) {
        if (cancelled) return
        setBundle(emptyBundle())
        setError(err?.message || String(err))
      } finally {
        if (!cancelled) setIsLoadingContext(false)
      }
    }

    if (selectedClientId) run()
    return () => {
      cancelled = true
    }
  }, [selectedClientId, refreshNonce])

  const setSelectedClientId = (id: string) => {
    setSelectedClientIdState(id)
  }

  // Prefer bundle.currentClient (authoritative) but fall back to list.
  const currentClient = useMemo(() => {
    if (bundle?.currentClient?.id && bundle.currentClient.id !== "loading") return bundle.currentClient
    return clients.find((c) => c.id === selectedClientId) || emptyClient()
  }, [bundle, clients, selectedClientId])

  const value: ClientContextType = {
    clients,
    selectedClientId,
    setSelectedClientId,

    currentClient,
    ipsData: bundle.ipsData,
    rtqData: bundle.rtqData,
    estateData: bundle.estateData,
    profileComparison: bundle.profileComparison,
    aiSuggestions: bundle.aiSuggestions,
    meetingTopics: bundle.meetingTopics,

    isLoadingClients,
    isLoadingContext,
    error,

    refresh: () => setRefreshNonce((n) => n + 1),
  }

  return <ClientContext.Provider value={value}>{children}</ClientContext.Provider>
}

export function useClient() {
  const context = useContext(ClientContext)
  if (context === undefined) {
    throw new Error("useClient must be used within a ClientProvider")
  }
  return context
}
