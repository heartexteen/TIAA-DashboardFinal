import { BedrockRuntimeClient, ConverseCommand } from "@aws-sdk/client-bedrock-runtime"
import { InvokeCommand, LambdaClient } from "@aws-sdk/client-lambda"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

type NewsItem = {
  title?: string
  link?: string
  publishedAt?: string
  source?: string
}

type DailySummaryRequestBody = {
  clientContext?: unknown
  modelId?: string
}

function getRegion() {
  const region = process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION
  if (!region) throw new Error("Missing AWS region. Set AWS_REGION (or AWS_DEFAULT_REGION).")
  return region
}

function getDefaultModelId() {
  return process.env.BEDROCK_MODEL_ID || "amazon.nova-pro-v1:0"
}

function safeJsonParse(text: string) {
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

async function invokeNewsFetcher(): Promise<{ rssUrl?: string; items: NewsItem[] }> {
  const region = getRegion()
  const functionName = process.env.NEWS_FETCHER_FUNCTION_NAME || "news-fetcher"

  const lambda = new LambdaClient({ region })
  const resp = await lambda.send(
    new InvokeCommand({
      FunctionName: functionName,
      Payload: new TextEncoder().encode(JSON.stringify({})),
    }),
  )

  const payloadBytes = resp.Payload ? new Uint8Array(resp.Payload) : undefined
  const payloadText = payloadBytes ? new TextDecoder().decode(payloadBytes) : ""
  if (!payloadText) throw new Error("news-fetcher returned empty payload.")

  let outer: any
  try {
    outer = JSON.parse(payloadText)
  } catch {
    throw new Error(`news-fetcher returned non-JSON payload: ${payloadText.slice(0, 200)}`)
  }

  // Supports Lambda proxy responses: { statusCode, body: "..." }
  const bodyText = typeof outer?.body === "string" ? outer.body : undefined
  const body = bodyText ? safeJsonParse(bodyText) : outer

  const rssUrl = body?.rssUrl
  const items: NewsItem[] = Array.isArray(body?.items) ? body.items : []
  return { rssUrl, items }
}

function inferAsOf(items: NewsItem[]) {
  const dates = items
    .map((i) => i.publishedAt)
    .filter(Boolean)
    .map((d) => new Date(String(d)))
    .filter((d) => !Number.isNaN(d.valueOf()))
    .sort((a, b) => b.valueOf() - a.valueOf())
  return dates[0] ? dates[0].toISOString() : new Date().toISOString()
}

function createSystemPromptPlainText(args: {
  asOf: string
  rssUrl?: string
  newsItems: NewsItem[]
  clientContext?: unknown
}) {
  const { asOf, rssUrl, newsItems, clientContext } = args

  let contextText = ""
  try {
    contextText = clientContext == null ? "" : JSON.stringify(clientContext)
  } catch {
    contextText = clientContext == null ? "" : String(clientContext)
  }

  const maxContextChars = 35_000
  if (contextText.length > maxContextChars) contextText = contextText.slice(0, maxContextChars) + "...(truncated)"

  const compactNews = newsItems.slice(0, 12).map((i) => ({
    title: i.title || "",
    url: i.link || "",
    publishedAt: i.publishedAt || "",
    source: i.source || "",
  }))

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

async function bedrockDailySummaryPlainText(args: { modelId: string; systemPrompt: string }) {
  const region = getRegion()
  const bedrock = new BedrockRuntimeClient({ region })

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

export async function POST(req: Request) {
  let body: DailySummaryRequestBody
  try {
    body = (await req.json()) as DailySummaryRequestBody
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 })
  }

  try {
    const { items, rssUrl } = await invokeNewsFetcher()
    const asOf = inferAsOf(items)
    const systemPrompt = createSystemPromptPlainText({
      asOf,
      rssUrl,
      newsItems: items,
      clientContext: body.clientContext,
    })

    const modelId = body.modelId || getDefaultModelId()
    const summaryText = await bedrockDailySummaryPlainText({ modelId, systemPrompt })

    return new Response(summaryText, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
      },
    })
  } catch (err: any) {
    return Response.json({ error: err?.message || String(err) }, { status: 500 })
  }
}

