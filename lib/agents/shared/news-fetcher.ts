/**
 * Shared "tool" wrapper around a Lambda-based news fetcher.
 *
 * This is intentionally NOT an LLM tool-calling loop.
 * The backend deterministically calls this tool, gets structured news items,
 * and then passes them into the LLM summarizer (Agent 3).
 */

import { InvokeCommand, LambdaClient } from "@aws-sdk/client-lambda"
import { getTiaaS3Config } from "@/lib/aws/config"

export type NewsItem = {
  title?: string
  link?: string
  publishedAt?: string
  source?: string
}

function getRegion() {
  const cfg = getTiaaS3Config()
  return cfg.region
}

function safeJsonParse(text: string) {
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

/**
 * Invokes the Lambda function that returns:
 *   { rssUrl?: string, items: NewsItem[] }
 *
 * Supports "Lambda proxy" shape as well:
 *   { statusCode, body: "..." }
 */
export async function invokeNewsFetcher(): Promise<{ rssUrl?: string; items: NewsItem[] }> {
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

  const bodyText = typeof outer?.body === "string" ? outer.body : undefined
  const body = bodyText ? safeJsonParse(bodyText) : outer

  const rssUrl = body?.rssUrl
  const items: NewsItem[] = Array.isArray(body?.items) ? body.items : []
  return { rssUrl, items }
}

export function inferAsOf(items: NewsItem[]) {
  const dates = items
    .map((i) => i.publishedAt)
    .filter(Boolean)
    .map((d) => new Date(String(d)))
    .filter((d) => !Number.isNaN(d.valueOf()))
    .sort((a, b) => b.valueOf() - a.valueOf())
  return dates[0] ? dates[0].toISOString() : new Date().toISOString()
}

