import { createAgent3DailySummaryGraph } from "@/lib/agents/agent3/daily-summary-graph"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

type DailySummaryRequestBody = {
  clientKey: string
  modelId?: string
}

export async function POST(req: Request) {
  let body: DailySummaryRequestBody
  try {
    body = (await req.json()) as DailySummaryRequestBody
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 })
  }

  try {
    const clientKey = typeof body.clientKey === "string" ? body.clientKey.trim() : ""
    if (!clientKey) return Response.json({ error: "Missing clientKey." }, { status: 400 })

    const g = createAgent3DailySummaryGraph()
    const result = await g.run({ clientKey, modelId: body.modelId })
    const summaryText = result.summaryText || ""
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
