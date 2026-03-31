/**
 * Agent 3 - Daily Summary (Advisor Briefing)
 *
 * Graph:
 *   START
 *     -> load_client_context_from_s3
 *     -> fetch_news_tool (Lambda)
 *     -> build_prompt
 *     -> bedrock_summarize
 *   END
 *
 * Output: Structured JSON summary cached in S3 as daily-summary.json
 */

import { BedrockRuntimeClient, ConverseCommand } from "@aws-sdk/client-bedrock-runtime"
import { AgentGraph } from "@/lib/agentic/graph"
import { getTiaaS3Config } from "@/lib/aws/config"
import { s3PutJson } from "@/lib/aws/s3"
import { loadClientContextBundleFromS3, type ClientContextBundle } from "@/lib/agents/shared/client-store"
import { inferAsOf, invokeNewsFetcher, type NewsItem } from "@/lib/agents/shared/news-fetcher"

export type DailySummaryData = {
  generatedAt: string
  asOf: string
  marketOverview: Array<{ headline: string; detail: string; source: string }>
  portfolioImpact: Array<{ area: string; impact: string; severity: "high" | "medium" | "low" }>
  clientActions: Array<{ action: string; rationale: string; priority: "high" | "medium" | "low" }>
  riskAlerts: Array<{ alert: string; severity: "high" | "medium" | "low" }>
  sources: Array<{ title: string; url: string }>
}

export type Agent3DailySummaryState = {
  clientKey: string
  clientContext?: ClientContextBundle
  rssUrl?: string
  newsItems?: NewsItem[]
  asOf?: string
  systemPrompt?: string
  modelId?: string
  summaryData?: DailySummaryData
  __trace?: string[]
}

function getDefaultModelId() {
  return process.env.BEDROCK_MODEL_ID || "amazon.nova-pro-v1:0"
}

function extractHoldingsSummary(ipsData: any): string {
  const accounts = ipsData?.currentHoldings?.accounts
  if (!Array.isArray(accounts) || accounts.length === 0) return "No holdings data available."

  const lines: string[] = []
  for (const acct of accounts) {
    const holdings = Array.isArray(acct.holdings) ? acct.holdings : []
    const tickers = holdings
      .map((h: any) => h.ticker || h.name)
      .filter(Boolean)
      .slice(0, 8)
      .join(", ")
    const total = holdings.reduce((sum: number, h: any) => sum + (Number(h.marketValue) || 0), 0)
    if (tickers) {
      lines.push(`${acct.accountName || acct.accountType} ($${Math.round(total / 1000)}K): ${tickers}`)
    }
  }
  return lines.length > 0 ? lines.join("\n") : "No specific holdings found."
}

function extractAllocationSummary(ipsData: any): string {
  const allocs = ipsData?.targetAssetAllocation?.allocations
  if (!Array.isArray(allocs)) return ""
  return allocs
    .map((a: any) => `${a.assetClass}: ${a.targetAllocation}% target`)
    .join(", ")
}

function buildSystemPrompt(args: {
  asOf: string
  newsItems: NewsItem[]
  clientContext: ClientContextBundle
}) {
  const { asOf, newsItems, clientContext } = args
  const client = clientContext.currentClient
  const ipsData = clientContext.ipsData as any
  const rtqData = clientContext.rtqData as any
  const compactNews = newsItems.slice(0, 15).map((i) => ({
    title: i.title || "",
    url: i.link || "",
    publishedAt: i.publishedAt || "",
    source: i.source || "",
    snippet: (i as any).snippet || "",
  }))

  const holdingsSummary = extractHoldingsSummary(ipsData)
  const allocationSummary = extractAllocationSummary(ipsData)
  const riskProfile = ipsData?.riskTolerance || "Unknown"
  const rtqRisk = rtqData?.riskAssessment?.riskProfile || "Unknown"
  const rtqScore = rtqData?.riskAssessment?.totalScore || 0
  const timeHorizon = ipsData?.timeHorizon || "Unknown"
  const totalAssets = client?.totalAssets || 0
  const returnGoal = ipsData?.returnGoal || ""
  const liquidityNeeds = ipsData?.liquidityNeeds || ""

  const advisorNotes = Array.isArray(ipsData?.advisorNotes)
    ? ipsData.advisorNotes.map((n: any) => `${n.title}: ${n.content}`).join("\n")
    : ""

  return [
    "You are a wealth-advisor AI assistant generating a daily briefing for a financial advisor's dashboard.",
    "",
    "=== CLIENT PROFILE ===",
    `Name: ${client?.name || "Unknown"}`,
    `Total AUM: $${(totalAssets / 1_000_000).toFixed(2)}M`,
    `Risk Profile (IPS): ${riskProfile}`,
    `Risk Profile (RTQ): ${rtqRisk} (Score: ${rtqScore})`,
    `Time Horizon: ${timeHorizon}`,
    `Return Goal: ${returnGoal}`,
    `Liquidity Needs: ${liquidityNeeds}`,
    "",
    "=== TARGET ALLOCATION ===",
    allocationSummary,
    "",
    "=== CURRENT HOLDINGS ===",
    holdingsSummary,
    "",
    advisorNotes ? `=== ADVISOR NOTES ===\n${advisorNotes}` : "",
    "",
    `=== TODAY'S FINANCIAL NEWS (as of ${asOf}) ===`,
    JSON.stringify(compactNews, null, 0),
    "",
    "=== OUTPUT INSTRUCTIONS ===",
    "Return a JSON object with these exact keys:",
    "",
    '1. "marketOverview": Array of 3-5 objects, each with:',
    '   - "headline": 1-sentence summary of a key market event (max 120 chars)',
    '   - "detail": 1-sentence explanation of why it matters (max 150 chars)',
    '   - "source": The news source name (e.g., "MarketWatch", "CNBC")',
    "",
    '2. "portfolioImpact": Array of 2-4 objects, each with:',
    '   - "area": Which part of the client\'s portfolio is affected (e.g., "Equity — IVV, VTI", "Fixed Income — AGG", "Energy Exposure")',
    '   - "impact": How this specific client is affected, referencing their actual holdings or allocation (max 150 chars)',
    '   - "severity": "high", "medium", or "low"',
    "",
    '3. "clientActions": Array of 2-4 objects, each with:',
    '   - "action": A specific recommendation for the advisor to consider TODAY (max 120 chars)',
    '   - "rationale": Why this matters for this specific client (max 150 chars)',
    '   - "priority": "high", "medium", or "low"',
    "",
    '4. "riskAlerts": Array of 0-3 objects (empty array if no alerts), each with:',
    '   - "alert": A specific risk warning for this client (max 120 chars)',
    '   - "severity": "high", "medium", or "low"',
    "",
    '5. "sources": Array of up to 6 objects, each with:',
    '   - "title": Source article title',
    '   - "url": Source URL',
    "",
    "RULES:",
    "- Return ONLY valid JSON, no markdown fencing, no commentary.",
    "- Reference the client's ACTUAL holdings, allocations, and risk profile — do not be generic.",
    "- Be specific: say 'IVV (S&P 500 ETF) may see pressure' not just 'equities may decline'.",
    "- Keep it calm, professional, advisor-appropriate.",
    "- This is informational context, not personalized investment advice.",
    "- Do not invent news — use only the provided items.",
  ].filter(Boolean).join("\n")
}

function parseJsonResponse(text: string): DailySummaryData | null {
  try {
    const trimmed = text.trim()
    const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i)
    const jsonStr = fenced?.[1] || trimmed

    const firstBrace = jsonStr.indexOf("{")
    const lastBrace = jsonStr.lastIndexOf("}")
    if (firstBrace < 0 || lastBrace <= firstBrace) return null

    const parsed = JSON.parse(jsonStr.slice(firstBrace, lastBrace + 1))

    const ensure = (arr: unknown) => (Array.isArray(arr) ? arr : [])

    return {
      generatedAt: new Date().toISOString(),
      asOf: "",
      marketOverview: ensure(parsed.marketOverview).slice(0, 5).map((item: any) => ({
        headline: String(item?.headline || item?.title || ""),
        detail: String(item?.detail || item?.description || ""),
        source: String(item?.source || ""),
      })),
      portfolioImpact: ensure(parsed.portfolioImpact).slice(0, 4).map((item: any) => ({
        area: String(item?.area || ""),
        impact: String(item?.impact || ""),
        severity: (["high", "medium", "low"].includes(item?.severity) ? item.severity : "medium") as "high" | "medium" | "low",
      })),
      clientActions: ensure(parsed.clientActions).slice(0, 4).map((item: any) => ({
        action: String(item?.action || ""),
        rationale: String(item?.rationale || ""),
        priority: (["high", "medium", "low"].includes(item?.priority) ? item.priority : "medium") as "high" | "medium" | "low",
      })),
      riskAlerts: ensure(parsed.riskAlerts).slice(0, 3).map((item: any) => ({
        alert: String(item?.alert || ""),
        severity: (["high", "medium", "low"].includes(item?.severity) ? item.severity : "medium") as "high" | "medium" | "low",
      })),
      sources: ensure(parsed.sources).slice(0, 6).map((item: any) => ({
        title: String(item?.title || ""),
        url: String(item?.url || item?.link || ""),
      })),
    }
  } catch {
    return null
  }
}

function fallbackSummary(asOf: string): DailySummaryData {
  return {
    generatedAt: new Date().toISOString(),
    asOf,
    marketOverview: [{ headline: "Unable to generate market overview", detail: "Please click Refresh to try again.", source: "" }],
    portfolioImpact: [],
    clientActions: [],
    riskAlerts: [],
    sources: [],
  }
}

async function bedrockSummarize(args: { modelId: string; systemPrompt: string }) {
  const cfg = getTiaaS3Config()
  const bedrock = new BedrockRuntimeClient({ region: cfg.region })

  const command = new ConverseCommand({
    modelId: args.modelId,
    system: [{ text: args.systemPrompt }],
    messages: [
      {
        role: "user",
        content: [{ text: "Generate the daily summary JSON now." }],
      },
    ],
    inferenceConfig: { maxTokens: 1500, temperature: 0.2 },
  })

  const resp: any = await bedrock.send(command)
  const blocks = resp?.output?.message?.content
  const text = Array.isArray(blocks) ? blocks.map((b: any) => b?.text).filter(Boolean).join("") : ""
  if (!text) throw new Error("Bedrock returned empty summary.")
  return text.trim()
}

export function createAgent3DailySummaryGraph() {
  const g = new AgentGraph<Agent3DailySummaryState>()

  g.addNode("load_client_context_from_s3", async (state) => {
    const clientContext = await loadClientContextBundleFromS3(state.clientKey)
    return { clientContext }
  })

  g.addNode("fetch_news_tool", async () => {
    const { items, rssUrl } = await invokeNewsFetcher()
    const asOf = inferAsOf(items)
    return { newsItems: items, rssUrl, asOf }
  })

  g.addNode("build_prompt", async (state) => {
    if (!state.clientContext) throw new Error("Missing clientContext")
    const newsItems = Array.isArray(state.newsItems) ? state.newsItems : []
    const systemPrompt = buildSystemPrompt({
      asOf: state.asOf || new Date().toISOString(),
      newsItems,
      clientContext: state.clientContext,
    })
    return { systemPrompt, modelId: state.modelId || getDefaultModelId() }
  })

  g.addNode("bedrock_summarize", async (state) => {
    const modelId = state.modelId || getDefaultModelId()
    const systemPrompt = state.systemPrompt || ""
    const asOf = state.asOf || new Date().toISOString()

    let summaryData: DailySummaryData
    try {
      const rawText = await bedrockSummarize({ modelId, systemPrompt })
      const parsed = parseJsonResponse(rawText)
      summaryData = parsed || fallbackSummary(asOf)
    } catch {
      summaryData = fallbackSummary(asOf)
    }

    summaryData.asOf = asOf
    summaryData.generatedAt = new Date().toISOString()

    // Cache to S3
    const cfg = getTiaaS3Config()
    const key = `${cfg.agent1.outputPrefix}${state.clientKey}/daily-summary.json`
    try {
      await s3PutJson({ bucket: cfg.bucket, key, value: summaryData })
    } catch (err) {
      console.warn("[agent3] Failed to cache daily summary to S3:", err)
    }

    return { summaryData }
  })

  g.setStart("load_client_context_from_s3")
  g.addEdge("load_client_context_from_s3", "fetch_news_tool")
  g.addEdge("fetch_news_tool", "build_prompt")
  g.addEdge("build_prompt", "bedrock_summarize")

  return g
}
