import { BedrockRuntimeClient, ConverseCommand } from "@aws-sdk/client-bedrock-runtime"
import { DERIVED_INSIGHTS_SCHEMA } from "../contracts"
import { derivedInsightsPrompt, derivedInsightsSystemPrompt } from "../prompts"
import { getTiaaS3Config } from "@/lib/aws/config"
import { nonPdfClientData } from "@/lib/non-pdf-client-data/non-pdf"
import { referenceData } from "../reference-data"
import type { Agent1PipelineState } from "./types"

// ---------------------------------------------------------------------------
// Bedrock helpers (shared with extract-documents, duplicated here to keep
// each pipeline module self-contained — could be extracted to a shared util)
// ---------------------------------------------------------------------------

function getExtractionModelId(): string {
  return (
    process.env.BEDROCK_EXTRACTION_MODEL_ID ||
    process.env.BEDROCK_MODEL_ID ||
    "amazon.nova-pro-v1:0"
  )
}

function createBedrockClient(): BedrockRuntimeClient {
  const cfg = getTiaaS3Config()
  return new BedrockRuntimeClient({ region: cfg.region })
}

async function readConverseText(output: unknown): Promise<string> {
  const out = output as any
  const blocks = out?.output?.message?.content
  if (!Array.isArray(blocks)) return ""
  return blocks.map((b: any) => b?.text).filter(Boolean).join("")
}

function parseJsonText(text: string): any {
  const trimmed = text.trim()
  if (!trimmed) throw new Error("Model returned empty content.")

  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i)
  if (fenced?.[1]) return JSON.parse(fenced[1])

  const firstBrace = trimmed.indexOf("{")
  const lastBrace = trimmed.lastIndexOf("}")
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    return JSON.parse(trimmed.slice(firstBrace, lastBrace + 1))
  }

  throw new Error("Model response did not contain parseable JSON.")
}

// ---------------------------------------------------------------------------
// Pure helpers
// ---------------------------------------------------------------------------

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10)
}

function normalizePriority(value: unknown): "high" | "medium" | "low" {
  const raw = String(value || "")
    .trim()
    .toLowerCase()
  if (!raw) return "medium"
  if (raw.includes("high") || raw.includes("urgent") || raw.includes("critical")) return "high"
  if (raw.includes("low")) return "low"
  return "medium"
}

function asObject(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null
}

function firstString(source: Record<string, unknown> | null, keys: string[]): string {
  if (!source) return ""
  for (const key of keys) {
    const value = source[key]
    if (typeof value === "string" && value.trim()) return value.trim()
  }
  return ""
}

function firstArray(source: Record<string, unknown> | null, keys: string[]): unknown[] {
  if (!source) return []
  for (const key of keys) {
    const value = source[key]
    if (Array.isArray(value)) return value
  }
  return []
}

// ---------------------------------------------------------------------------
// buildProfileComparison — deterministic IPS vs RTQ comparison rows
// ---------------------------------------------------------------------------

function buildProfileComparison(
  ipsData: any,
  rtqData: any,
): Array<{ category: string; ipsValue: string; rtqValue: string; status: string; note?: string }> {
  const rows: Array<{
    category: string
    ipsValue: string
    rtqValue: string
    status: string
    note?: string
  }> = []

  const ipsRisk = String(ipsData?.riskTolerance || "")
  const rtqRisk = String(rtqData?.riskAssessment?.riskProfile || "")
  if (ipsRisk || rtqRisk) {
    rows.push({
      category: "Risk Tolerance",
      ipsValue: ipsRisk || "Unknown",
      rtqValue: rtqRisk || "Unknown",
      status: ipsRisk && rtqRisk && ipsRisk !== rtqRisk ? "mismatch" : "aligned",
      note: "Derived from IPS riskTolerance and RTQ riskAssessment.riskProfile",
    })
  }

  const ipsHorizon = String(ipsData?.timeHorizon || "")
  const rtqHorizon = String(
    rtqData?.investmentPreferences?.timeHorizon?.selected || "",
  )
  if (ipsHorizon || rtqHorizon) {
    rows.push({
      category: "Time Horizon",
      ipsValue: ipsHorizon || "Unknown",
      rtqValue: rtqHorizon || "Unknown",
      status:
        ipsHorizon && rtqHorizon && ipsHorizon !== rtqHorizon
          ? "mismatch"
          : "aligned",
      note: "Derived from IPS timeHorizon and RTQ investmentPreferences.timeHorizon.selected",
    })
  }

  const ipsAllocs = Array.isArray(ipsData?.targetAssetAllocation?.allocations)
    ? ipsData.targetAssetAllocation.allocations
    : []
  const rtqAlloc = rtqData?.suggestedAssetAllocation || {}

  for (const alloc of ipsAllocs) {
    const assetClass = String(alloc?.assetClass || "Unknown")
    const ipsPct = Number(alloc?.targetAllocation || 0)

    let rtqPct = 0
    if (/equity/i.test(assetClass)) rtqPct = Number(rtqAlloc.equity || 0)
    else if (/fixed/i.test(assetClass)) rtqPct = Number(rtqAlloc.fixedIncome || 0)
    else if (/cash/i.test(assetClass)) rtqPct = Number(rtqAlloc.cash || 0)
    else rtqPct = Number(rtqAlloc.alternatives || rtqAlloc.realAssets || 0)

    const diff = Math.abs(ipsPct - rtqPct)
    rows.push({
      category: `${assetClass} Allocation`,
      ipsValue: `${ipsPct}%`,
      rtqValue: `${rtqPct}%`,
      status: diff >= 15 ? "mismatch" : diff >= 7 ? "warning" : "aligned",
      note: "Derived from IPS targetAssetAllocation vs RTQ suggestedAssetAllocation",
    })
  }

  return rows
}

// ---------------------------------------------------------------------------
// normalizeAlerts / normalizeSuggestions — shape arrays for the dashboard
// ---------------------------------------------------------------------------

function normalizeAlerts(
  clientKey: string,
  alerts: Array<{ type: string; title: string; description: string; priority: string }>,
) {
  return alerts.map((alert, index) => ({
    id: `${clientKey}-alert-${index + 1}`,
    type: alert.type,
    title: alert.title,
    description: alert.description,
    priority: alert.priority,
    createdAt: todayIsoDate(),
  }))
}

function normalizeSuggestions(
  suggestions: Array<{
    priority: string
    action: string
    rationale: string
    category: string
  }>,
) {
  return suggestions.map((suggestion, index) => ({
    id: index + 1,
    ...suggestion,
  }))
}

// ---------------------------------------------------------------------------
// Deterministic fallback when LLM insights are incomplete or fail
// ---------------------------------------------------------------------------

function fallbackDerivedInsights(args: {
  currentClient: any
  ipsData: any
  rtqData: any
  estateData: any
}): {
  alerts: Array<{ type: string; title: string; description: string; priority: string }>
  aiSuggestions: Array<{
    priority: string
    action: string
    rationale: string
    category: string
  }>
  meetingTopics: string[]
} {
  const alerts: Array<{
    type: string
    title: string
    description: string
    priority: string
  }> = []
  const aiSuggestions: Array<{
    priority: string
    action: string
    rationale: string
    category: string
  }> = []
  const meetingTopics: string[] = []

  // Risk-profile mismatch
  const ipsRisk = String(args.ipsData?.riskTolerance || "").trim()
  const rtqRisk = String(
    args.rtqData?.riskAssessment?.riskProfile || "",
  ).trim()
  if (ipsRisk && rtqRisk && ipsRisk !== rtqRisk) {
    alerts.push({
      type: "mismatch",
      title: "Risk profile mismatch",
      description: `IPS shows ${ipsRisk} while RTQ shows ${rtqRisk}.`,
      priority: "high",
    })
    aiSuggestions.push({
      priority: "high",
      action: "Confirm which risk profile should govern the portfolio",
      rationale: `The IPS and RTQ indicate different risk stances (${ipsRisk} vs ${rtqRisk}).`,
      category: "Risk Alignment",
    })
    meetingTopics.push("Review IPS versus RTQ risk-profile differences")
  }

  // Incomplete beneficiary designations
  const accounts = Array.isArray(args.ipsData?.clientProfile?.accounts)
    ? args.ipsData.clientProfile.accounts
    : []
  const incompleteAccounts = accounts.filter((account: any) =>
    String(account?.beneficiaryStatus || "")
      .trim()
      .toLowerCase()
      .includes("incomplete"),
  )
  if (incompleteAccounts.length > 0) {
    alerts.push({
      type: "action_required",
      title: "Beneficiary designations need review",
      description: `${incompleteAccounts.length} account(s) show incomplete beneficiary information.`,
      priority: "high",
    })
    aiSuggestions.push({
      priority: "high",
      action: "Update beneficiary designations on incomplete accounts",
      rationale:
        "Incomplete beneficiary records can create avoidable estate-administration issues.",
      category: "Estate Planning",
    })
    meetingTopics.push("Confirm beneficiary designations across all accounts")
  }

  // Pending estate documents
  const docsNeeded = Array.isArray(args.estateData?.documentsNeeded)
    ? args.estateData.documentsNeeded
    : []
  const highPriorityDocs = docsNeeded.filter(
    (item: any) => normalizePriority(item?.priority) === "high",
  )
  if (highPriorityDocs.length > 0) {
    alerts.push({
      type: "action_required",
      title: "Estate documents are still pending",
      description: `${highPriorityDocs.length} high-priority estate document item(s) remain open.`,
      priority: "medium",
    })
    aiSuggestions.push({
      priority: "medium",
      action: "Prioritize outstanding estate-planning documents",
      rationale:
        "The estate worksheet still lists important unfinished documents or actions.",
      category: "Estate Planning",
    })
    meetingTopics.push("Review remaining estate-planning document gaps")
  }

  // Allocation divergence
  const targetAllocations = Array.isArray(
    args.ipsData?.targetAssetAllocation?.allocations,
  )
    ? args.ipsData.targetAssetAllocation.allocations
    : []
  const rtqSuggested = args.rtqData?.suggestedAssetAllocation || {}
  for (const allocation of targetAllocations) {
    const assetClass = String(allocation?.assetClass || "").trim()
    const ipsTarget = Number(allocation?.targetAllocation || 0)
    let rtqTarget = 0
    if (/equity/i.test(assetClass))
      rtqTarget = Number(rtqSuggested.equity || 0)
    else if (/fixed/i.test(assetClass))
      rtqTarget = Number(rtqSuggested.fixedIncome || 0)
    else if (/cash/i.test(assetClass))
      rtqTarget = Number(rtqSuggested.cash || 0)
    else
      rtqTarget = Number(
        rtqSuggested.alternatives || rtqSuggested.realAssets || 0,
      )

    if (Math.abs(ipsTarget - rtqTarget) >= 15) {
      alerts.push({
        type: "warning",
        title: `${assetClass} allocation divergence`,
        description: `IPS target is ${ipsTarget}% while RTQ suggests ${rtqTarget}%.`,
        priority: "medium",
      })
      aiSuggestions.push({
        priority: "medium",
        action: `Reconcile ${assetClass} allocation target`,
        rationale: `The IPS and RTQ differ materially on ${assetClass} allocation (${ipsTarget}% vs ${rtqTarget}%).`,
        category: "Portfolio Construction",
      })
      meetingTopics.push(
        `Discuss ${assetClass} allocation differences between IPS and RTQ`,
      )
      break
    }
  }

  // Ensure at least one item in each bucket
  if (meetingTopics.length === 0) {
    meetingTopics.push(
      "Review key planning priorities from IPS, RTQ, and estate documents",
    )
  }

  if (aiSuggestions.length === 0) {
    aiSuggestions.push({
      priority: "medium",
      action: "Review extracted planning data for completeness",
      rationale:
        "A structured review helps confirm the extracted documents align with the client record.",
      category: "Data Review",
    })
  }

  if (alerts.length === 0) {
    alerts.push({
      type: "info",
      title: "Documents processed successfully",
      description: `Agent 1 generated dashboard data for ${String(args.currentClient?.name || "the client")}.`,
      priority: "low",
    })
  }

  return {
    alerts: alerts.slice(0, 6),
    aiSuggestions: aiSuggestions.slice(0, 8),
    meetingTopics: meetingTopics.slice(0, 10),
  }
}

// ---------------------------------------------------------------------------
// normalizeDerivedInsights — coerce free-form LLM JSON into the schema
// ---------------------------------------------------------------------------

function normalizeDerivedInsights(
  parsed: unknown,
  args: {
    currentClient: unknown
    ipsData: unknown
    rtqData: unknown
    estateData: unknown
  },
) {
  const root = asObject(parsed)
  const normalized = {
    alerts: [] as Array<{
      type: string
      title: string
      description: string
      priority: string
    }>,
    aiSuggestions: [] as Array<{
      priority: string
      action: string
      rationale: string
      category: string
    }>,
    meetingTopics: [] as string[],
  }

  for (const item of firstArray(root, [
    "alerts",
    "alert",
    "issues",
    "warnings",
  ]).slice(0, 6)) {
    const obj = asObject(item)
    const title = firstString(obj, ["title", "label", "headline", "issue"])
    const description = firstString(obj, [
      "description",
      "detail",
      "details",
      "message",
      "summary",
    ])
    if (!title && !description) continue
    normalized.alerts.push({
      type: firstString(obj, ["type", "kind", "category"]) || "info",
      title: title || "Planning alert",
      description: description || title || "Review this planning item.",
      priority: normalizePriority(
        firstString(obj, ["priority", "severity", "urgency"]),
      ),
    })
  }

  const suggestionItems = firstArray(root, [
    "aiSuggestions",
    "suggestions",
    "recommendations",
    "actions",
  ]).slice(0, 10)
  for (const item of suggestionItems) {
    if (typeof item === "string" && item.trim()) {
      normalized.aiSuggestions.push({
        priority: "medium",
        action: item.trim(),
        rationale: item.trim(),
        category: "General Planning",
      })
      continue
    }

    const obj = asObject(item)
    const action = firstString(obj, [
      "action",
      "title",
      "recommendation",
      "suggestion",
      "task",
      "nextStep",
      "headline",
    ])
    const rationale = firstString(obj, [
      "rationale",
      "reason",
      "why",
      "description",
      "detail",
      "details",
      "summary",
    ])
    if (!action && !rationale) continue
    normalized.aiSuggestions.push({
      priority: normalizePriority(
        firstString(obj, ["priority", "severity", "urgency"]),
      ),
      action: action || rationale || "Review planning recommendation",
      rationale:
        rationale ||
        action ||
        "This recommendation was derived from the extracted planning documents.",
      category:
        firstString(obj, ["category", "type", "theme", "area"]) ||
        "General Planning",
    })
  }

  const topicItems = firstArray(root, [
    "meetingTopics",
    "topics",
    "discussionTopics",
    "questions",
  ]).slice(0, 12)
  for (const item of topicItems) {
    if (typeof item === "string" && item.trim()) {
      normalized.meetingTopics.push(item.trim())
      continue
    }
    const obj = asObject(item)
    const topic = firstString(obj, ["topic", "title", "question", "summary"])
    if (topic) normalized.meetingTopics.push(topic)
  }

  // Fill gaps with deterministic fallback
  if (
    normalized.alerts.length === 0 ||
    normalized.aiSuggestions.length === 0 ||
    normalized.meetingTopics.length === 0
  ) {
    const fallback = fallbackDerivedInsights({
      currentClient: args.currentClient,
      ipsData: args.ipsData,
      rtqData: args.rtqData,
      estateData: args.estateData,
    })

    if (normalized.alerts.length === 0) normalized.alerts = fallback.alerts
    if (normalized.aiSuggestions.length === 0)
      normalized.aiSuggestions = fallback.aiSuggestions
    if (normalized.meetingTopics.length === 0)
      normalized.meetingTopics = fallback.meetingTopics
  }

  const result = DERIVED_INSIGHTS_SCHEMA.safeParse(normalized)
  if (result.success) return result.data

  // Zod validation failed — fall back to deterministic insights
  const safeFallback = fallbackDerivedInsights({
    currentClient: args.currentClient,
    ipsData: args.ipsData,
    rtqData: args.rtqData,
    estateData: args.estateData,
  })
  return DERIVED_INSIGHTS_SCHEMA.parse(safeFallback)
}

// ---------------------------------------------------------------------------
// LLM-based insight derivation
// ---------------------------------------------------------------------------

async function invokeDerivedInsights(args: {
  clientKey: string
  currentClient: unknown
  ipsData: unknown
  rtqData: unknown
  estateData: unknown
}) {
  const bedrock = createBedrockClient()
  const modelId = getExtractionModelId()

  const command = new ConverseCommand({
    modelId,
    system: [{ text: derivedInsightsSystemPrompt() }],
    messages: [
      {
        role: "user",
        content: [
          {
            text: derivedInsightsPrompt({
              clientName: String(
                (args.currentClient as any)?.name || args.clientKey,
              ),
              clientKey: args.clientKey,
              currentClient: args.currentClient,
              ipsData: args.ipsData,
              rtqData: args.rtqData,
              estateData: args.estateData,
            }),
          },
        ],
      },
    ],
    inferenceConfig: {
      maxTokens: 2500,
      temperature: 0.2,
    },
  })

  const resp = await bedrock.send(command)
  const text = await readConverseText(resp)
  const parsed = parseJsonText(text)
  return normalizeDerivedInsights(parsed, args)
}

// ---------------------------------------------------------------------------
// Node: derive_insights
// ---------------------------------------------------------------------------

export async function deriveInsightsNode(
  state: Agent1PipelineState,
): Promise<Partial<Agent1PipelineState>> {
  const clientKey = state.clientKey
  if (!clientKey) throw new Error("deriveInsightsNode: clientKey is not set on state.")

  const base = nonPdfClientData[clientKey]
  if (!base) throw new Error(`deriveInsightsNode: no nonPdfClientData for client "${clientKey}".`)

  const ipsData = state.ipsData ?? {}
  const rtqData = state.rtqData ?? {}
  const estateData = state.estateData ?? {}

  // Deterministic profile comparison (always succeeds)
  const profileComparison = buildProfileComparison(ipsData, rtqData)

  // Try LLM-derived insights first
  let derived: {
    alerts: Array<{ type: string; title: string; description: string; priority: string }>
    aiSuggestions: Array<{ priority: string; action: string; rationale: string; category: string }>
    meetingTopics: string[]
  }

  try {
    derived = await invokeDerivedInsights({
      clientKey,
      currentClient: base.client,
      ipsData,
      rtqData,
      estateData,
    })
  } catch (llmErr) {
    console.warn(`[derive_insights] LLM insights failed for ${clientKey}, using deterministic fallback:`, llmErr)

    // Second tier: deterministic fallback from data
    try {
      derived = fallbackDerivedInsights({
        currentClient: base.client,
        ipsData,
        rtqData,
        estateData,
      })
    } catch (fallbackErr) {
      console.warn(`[derive_insights] Deterministic fallback also failed for ${clientKey}, using reference data:`, fallbackErr)

      // Final tier: use reference data aiSuggestions and meetingTopics
      const ref = referenceData[clientKey]
      derived = {
        alerts: [
          {
            type: "info",
            title: "Documents processed successfully",
            description: `Agent 1 generated dashboard data for ${base.client.name}.`,
            priority: "low",
          },
        ],
        aiSuggestions: ref
          ? ref.aiSuggestions.map((s) => ({
              priority: s.priority,
              action: s.action,
              rationale: s.rationale,
              category: s.category,
            }))
          : [
              {
                priority: "medium",
                action: "Review extracted planning data for completeness",
                rationale: "A structured review helps confirm the extracted documents align with the client record.",
                category: "Data Review",
              },
            ],
        meetingTopics: ref?.meetingTopics ?? [
          "Review key planning priorities from IPS, RTQ, and estate documents",
        ],
      }
    }
  }

  return {
    profileComparison,
    alerts: normalizeAlerts(clientKey, derived.alerts),
    aiSuggestions: normalizeSuggestions(derived.aiSuggestions),
    meetingTopics: derived.meetingTopics,
  }
}
