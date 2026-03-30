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
 * Notes on efficiency:
 * - Only ONE LLM call (Bedrock Converse) per refresh.
 * - Data processing stays deterministic in code (news compacting, as-of inference).
 * - No polling loops inside the model.
 */

import { BedrockRuntimeClient, ConverseCommand } from "@aws-sdk/client-bedrock-runtime"
import { AgentGraph } from "@/lib/agentic/graph"
import { getTiaaS3Config } from "@/lib/aws/config"
import { loadClientContextBundleFromS3, type ClientContextBundle } from "@/lib/agents/shared/client-store"
import { inferAsOf, invokeNewsFetcher, type NewsItem } from "@/lib/agents/shared/news-fetcher"

export type Agent3DailySummaryState = {
  clientKey: string
  // Loaded artifacts
  clientContext?: ClientContextBundle
  // Tool outputs
  rssUrl?: string
  newsItems?: NewsItem[]
  asOf?: string
  // LLM prompt + result
  systemPrompt?: string
  modelId?: string
  summaryText?: string
  // Debug
  __trace?: string[]
}

function getDefaultModelId() {
  // Default to the Nova Pro model id. You can override with BEDROCK_MODEL_ID.
  return process.env.BEDROCK_MODEL_ID || "amazon.nova-pro-v1:0"
}

function buildSystemPromptPlainText(args: {
  asOf: string
  rssUrl?: string
  newsItems: NewsItem[]
  clientContext: ClientContextBundle
}) {
  const { asOf, rssUrl, newsItems, clientContext } = args

  // We compact the news to reduce tokens + keep the LLM grounded.
  const compactNews = newsItems.slice(0, 12).map((i) => ({
    title: i.title || "",
    url: i.link || "",
    publishedAt: i.publishedAt || "",
    source: i.source || "",
  }))

  // We only pass the most relevant portion of the client context (the same bundle used by the UI).
  // This is still somewhat large; later we can split into smaller "facts packets".
  const contextJson = JSON.stringify(
    {
      client: clientContext.currentClient,
      ipsData: clientContext.ipsData,
      rtqData: clientContext.rtqData,
      estateData: clientContext.estateData,
      profileComparison: clientContext.profileComparison,
    },
    null,
    0,
  )

  // Hard cap to prevent extreme prompt sizes.
  let contextText = contextJson
  const maxContextChars = 35_000
  if (contextText.length > maxContextChars) contextText = contextText.slice(0, maxContextChars) + "...(truncated)"

  return [
    "You are an AI assistant for an advisor-facing Client Overview dashboard.",
    "Use ONLY the provided news items and the provided client JSON context. Do not invent news.",
    "Goal: produce a concise daily summary plus portfolio impact and risk-guidance tailored to the client's risk profile.",
    "",
    "Output format: PLAIN TEXT with EXACT section headers on their own lines, in this order:",
    "AS_OF: <ISO timestamp>",
    "GLOBAL:",
    "- <3-5 bullets>",
    "IMPACT:",
    "- <3-5 bullets: what this means for this client's portfolio>",
    "GUIDANCE:",
    "- <2-4 bullets tailored to risk tolerance; high tolerance = stay disciplined, low tolerance = consider de-risking options like higher-quality bonds/cash, avoid panic selling>",
    "WARNINGS:",
    "- <0-3 bullets; if none, write '- None'>",
    "SOURCES:",
    "- <up to 6 bullets: Title — URL>",
    "",
    "Constraints:",
    "- Each bullet must be <= 140 characters.",
    "- Avoid quotes inside bullets.",
    "- Keep it calm and advisor-appropriate.",
    "- Return ONLY the formatted sections; no extra commentary.",
    "",
    `As-of: ${asOf}`,
    rssUrl ? `RSS: ${rssUrl}` : "",
    "",
    "News items (JSON):",
    JSON.stringify(compactNews),
    "",
    "Client context (JSON):",
    contextText || "{}",
    "",
    "Safety/quality rules:",
    "- Be clear this is informational, not personalized investment advice.",
    "- If client context lacks holdings/exposures, say so and keep impact statements general.",
    "- Prefer actionable, calm guidance over alarmist language.",
  ]
    .filter(Boolean)
    .join("\n")
}

async function bedrockSummarizePlainText(args: { modelId: string; systemPrompt: string }) {
  const cfg = getTiaaS3Config()
  const bedrock = new BedrockRuntimeClient({ region: cfg.region })

  const command = new ConverseCommand({
    modelId: args.modelId,
    system: [{ text: args.systemPrompt }],
    messages: [
      {
        role: "user",
        content: [{ text: "Return the daily summary in the required plain-text format now." }],
      },
    ],
    inferenceConfig: { maxTokens: 900, temperature: 0.2 },
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
    const systemPrompt = buildSystemPromptPlainText({
      asOf: state.asOf || new Date().toISOString(),
      rssUrl: state.rssUrl,
      newsItems,
      clientContext: state.clientContext,
    })
    return { systemPrompt, modelId: state.modelId || getDefaultModelId() }
  })

  g.addNode("bedrock_summarize", async (state) => {
    const modelId = state.modelId || getDefaultModelId()
    const systemPrompt = state.systemPrompt || ""
    const summaryText = await bedrockSummarizePlainText({ modelId, systemPrompt })
    return { summaryText }
  })

  g.setStart("load_client_context_from_s3")
  g.addEdge("load_client_context_from_s3", "fetch_news_tool")
  g.addEdge("fetch_news_tool", "build_prompt")
  g.addEdge("build_prompt", "bedrock_summarize")

  return g
}
