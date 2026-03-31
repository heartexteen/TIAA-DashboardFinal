import { createAgent3DailySummaryGraph, type DailySummaryData } from "@/lib/agents/agent3/daily-summary-graph"
import { getTiaaS3Config } from "@/lib/aws/config"
import { s3GetJson } from "@/lib/aws/s3"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

type DailySummaryRequestBody = {
  clientKey: string
  modelId?: string
  force?: boolean
}

const CACHE_MAX_AGE_MS = 12 * 60 * 60 * 1000 // 12 hours

export async function POST(req: Request) {
  let body: DailySummaryRequestBody
  try {
    body = (await req.json()) as DailySummaryRequestBody
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 })
  }

  const clientKey = typeof body.clientKey === "string" ? body.clientKey.trim() : ""
  if (!clientKey) return Response.json({ error: "Missing clientKey." }, { status: 400 })

  // Try cached version first (unless force refresh)
  if (!body.force) {
    try {
      const cfg = getTiaaS3Config()
      const key = `${cfg.agent1.outputPrefix}${clientKey}/daily-summary.json`
      const cached = await s3GetJson<DailySummaryData>({ bucket: cfg.bucket, key })

      if (cached?.generatedAt) {
        const age = Date.now() - new Date(cached.generatedAt).getTime()
        if (age < CACHE_MAX_AGE_MS) {
          return Response.json(cached, {
            status: 200,
            headers: { "Cache-Control": "no-store" },
          })
        }
      }
    } catch {
      // No cache or error reading — generate fresh
    }
  }

  // Generate fresh summary
  try {
    const g = createAgent3DailySummaryGraph()
    const result = await g.run({ clientKey, modelId: body.modelId })
    const summaryData = result.summaryData

    if (!summaryData) {
      return Response.json(
        { error: "Daily summary will be available after the client data finishes generating." },
        { status: 200 },
      )
    }

    return Response.json(summaryData, {
      status: 200,
      headers: { "Cache-Control": "no-store" },
    })
  } catch (err: any) {
    const message = err?.message || String(err)
    if (
      /specified key does not exist/i.test(message) ||
      /NoSuchKey/i.test(message) ||
      /not found/i.test(message)
    ) {
      return Response.json(
        { error: "Daily summary will be available after the client data finishes generating." },
        { status: 200 },
      )
    }
    return Response.json({ error: message }, { status: 500 })
  }
}
