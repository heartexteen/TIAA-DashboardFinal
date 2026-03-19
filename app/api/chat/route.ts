import { BedrockRuntimeClient, ConverseCommand, ConverseStreamCommand } from "@aws-sdk/client-bedrock-runtime"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

type ChatMessage = {
  role?: "user" | "assistant" | string
  content: string
}

type ChatRequestBody = {
  messages: ChatMessage[]
  clientContext?: unknown
  modelId?: string
  temperature?: number
  maxTokens?: number
}

function getDefaultModelId() {
  // Default to the Nova Pro model id. If your account/region doesn't support on-demand invocation,
  // set BEDROCK_MODEL_ID to an inference profile id/ARN that contains this model.
  return process.env.BEDROCK_MODEL_ID || "amazon.nova-pro-v1:0"
}

function createSystemPrompt(clientContext?: unknown) {
  const base = [
    "You are an AI advisor assistant for a financial dashboard.",
    "Be helpful, accurate, and concise.",
    "If you are missing information, ask a clarifying question.",
    "If the user asks for something unrelated to the provided client context, you can still answer generally.",
  ].join("\n")

  if (clientContext == null) return base

  let contextText = ""
  try {
    contextText = JSON.stringify(clientContext)
  } catch {
    contextText = String(clientContext)
  }

  const maxChars = 35_000
  if (contextText.length > maxChars) {
    contextText = contextText.slice(0, maxChars) + "...(truncated)"
  }

  return `${base}\n\nClient context (JSON):\n${contextText}`
}

function normalizeMessages(messages: ChatMessage[]) {
  const normalized = messages
    .filter((m) => m && typeof m.content === "string" && m.content.trim().length > 0)
    .map((m) => {
      const role = m.role === "assistant" ? "assistant" : "user"
      return { role, content: m.content }
    })

  const firstUserIndex = normalized.findIndex((m) => m.role === "user")
  const leadingAssistantText =
    firstUserIndex > 0 ? normalized.slice(0, firstUserIndex).map((m) => m.content).join("\n\n") : ""
  const conversation = firstUserIndex >= 0 ? normalized.slice(firstUserIndex) : []

  return { conversation, leadingAssistantText }
}

function createBedrockClient() {
  const region = process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION
  if (!region) {
    throw new Error("Missing AWS region. Set AWS_REGION (or AWS_DEFAULT_REGION).")
  }
  return new BedrockRuntimeClient({ region })
}

function toBedrockMessages(messages: ChatMessage[]) {
  return messages.map((m) => ({
    role: m.role,
    content: [{ text: m.content }],
  }))
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

  const modelId = body.modelId || getDefaultModelId()
  const temperature = typeof body.temperature === "number" ? body.temperature : 0.3
  const maxTokens = typeof body.maxTokens === "number" ? body.maxTokens : 800

  const bedrock = createBedrockClient()
  const { conversation, leadingAssistantText } = normalizeMessages(rawMessages)
  if (conversation.length === 0) {
    return Response.json({ error: "No user message found to start the conversation." }, { status: 400 })
  }

  const systemBase = createSystemPrompt(body.clientContext)
  const system =
    leadingAssistantText.trim().length > 0
      ? `${systemBase}\n\nPrior assistant context:\n${leadingAssistantText}`
      : systemBase

  const responseStream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const encoder = new TextEncoder()

      const sendText = (text: string) => controller.enqueue(encoder.encode(text))

      try {
        const command = new ConverseStreamCommand({
          modelId,
          system: [{ text: system }],
          messages: toBedrockMessages(conversation),
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
            messages: toBedrockMessages(conversation),
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
