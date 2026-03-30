import { BedrockRuntimeClient, ConverseCommand, ConverseStreamCommand } from "@aws-sdk/client-bedrock-runtime"
import { createAgent2ChatPrepareGraph, type ChatMessage } from "@/lib/agents/agent2/chat-prepare-graph"
import { getTiaaS3Config } from "@/lib/aws/config"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

type ChatRequestBody = {
  clientKey: string
  messages: ChatMessage[]
  modelId?: string
  temperature?: number
  maxTokens?: number
}

function getDefaultModelId() {
  // Default to the Nova Pro model id. If your account/region doesn't support on-demand invocation,
  // set BEDROCK_MODEL_ID to an inference profile id/ARN that contains this model.
  return process.env.BEDROCK_MODEL_ID || "amazon.nova-pro-v1:0"
}

function createBedrockClient() {
  const cfg = getTiaaS3Config()
  return new BedrockRuntimeClient({ region: cfg.region })
}

async function readConverseText(output: unknown): Promise<string> {
  const out = output as any
  const blocks = out?.output?.message?.content
  if (!Array.isArray(blocks)) return ""
  return blocks.map((b: any) => b?.text).filter(Boolean).join("")
}

export async function POST(req: Request) {
  let body: ChatRequestBody
  try {
    body = (await req.json()) as ChatRequestBody
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 })
  }

  const rawMessages = Array.isArray(body.messages) ? body.messages : []
  if (rawMessages.length === 0) {
    return Response.json({ error: "Missing messages." }, { status: 400 })
  }

  const clientKey = typeof body.clientKey === "string" && body.clientKey.trim() ? body.clientKey.trim() : ""
  if (!clientKey) {
    return Response.json({ error: "Missing clientKey." }, { status: 400 })
  }

  const modelId = body.modelId || getDefaultModelId()
  const temperature = typeof body.temperature === "number" ? body.temperature : 0.3
  const maxTokens = typeof body.maxTokens === "number" ? body.maxTokens : 800

  const bedrock = createBedrockClient()

  // Agent 2: load context from S3 + prepare prompt/messages.
  const agent2 = createAgent2ChatPrepareGraph()
  const prepared = await agent2.run({ clientKey, messages: rawMessages })

  const conversation = prepared.conversation || []
  if (conversation.length === 0 || !prepared.bedrockMessages) {
    return Response.json({ error: "No user message found to start the conversation." }, { status: 400 })
  }

  const system = prepared.system || "You are an AI assistant."

  const responseStream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const encoder = new TextEncoder()

      const sendText = (text: string) => controller.enqueue(encoder.encode(text))

      try {
        const command = new ConverseStreamCommand({
          modelId,
          system: [{ text: system }],
          messages: prepared.bedrockMessages,
          inferenceConfig: { maxTokens, temperature },
        })

        const resp: any = await bedrock.send(command)
        const stream: AsyncIterable<any> | undefined = resp?.stream
        if (!stream) throw new Error("No stream returned from Bedrock.")

        for await (const event of stream) {
          const deltaText = event?.contentBlockDelta?.delta?.text
          if (typeof deltaText === "string" && deltaText.length > 0) {
            sendText(deltaText)
          }
        }
      } catch (streamErr) {
        try {
          const command = new ConverseCommand({
            modelId,
            system: [{ text: system }],
            messages: prepared.bedrockMessages,
            inferenceConfig: { maxTokens, temperature },
          })
          const resp: any = await bedrock.send(command)
          const text = await readConverseText(resp)
          sendText(text || "")
        } catch (fallbackErr: any) {
          sendText(`\n\n[Error calling Bedrock: ${fallbackErr?.message || String(fallbackErr)}]`)
        }
      } finally {
        controller.close()
      }
    },
  })

  return new Response(responseStream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
  })
}
