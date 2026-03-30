/**
 * Agent 2 - Chatbot preparation graph.
 *
 * We keep chat "agentic" in a lightweight way:
 * - load client context from S3 (Agent 1 outputs)
 * - build a grounded system prompt
 * - normalize conversation messages (strip blanks, ensure roles)
 * - return a prepared payload for Bedrock Converse / ConverseStream
 *
 * The actual streaming is handled by the API route (Next.js Response stream).
 */

import { AgentGraph } from "@/lib/agentic/graph"
import { loadClientContextBundleFromS3, type ClientContextBundle } from "@/lib/agents/shared/client-store"
import { ConversationRole } from "@aws-sdk/client-bedrock-runtime"

export type ChatMessage = {
  role?: "user" | "assistant" | string
  content: string
}

export type Agent2ChatPrepareState = {
  clientKey: string
  messages: ChatMessage[]

  // Loaded artifacts
  clientContext?: ClientContextBundle

  // Prepared outputs
  system?: string
  conversation?: Array<{ role: "user" | "assistant"; content: string }>
  bedrockMessages?: Array<{ role: ConversationRole; content: Array<{ text: string }> }>

  __trace?: string[]
}

function createSystemPrompt(clientContext: ClientContextBundle) {
  const base = [
    "You are an AI advisor assistant for a wealth management dashboard.",
    "Be helpful, accurate, and concise.",
    "If you are missing information, ask a clarifying question.",
    "Do NOT invent client-specific facts. Use only the provided JSON context.",
  ].join("\n")

  // Keep this short-ish. In production you’d build a smaller “facts packet”.
  let contextText = ""
  try {
    contextText = JSON.stringify(
      {
        client: clientContext.currentClient,
        ips: clientContext.ipsData,
        rtq: clientContext.rtqData,
        estate: clientContext.estateData,
        profileComparison: clientContext.profileComparison,
        aiSuggestions: clientContext.aiSuggestions,
        meetingTopics: clientContext.meetingTopics,
      },
      null,
      0,
    )
  } catch {
    contextText = ""
  }

  const maxChars = 35_000
  if (contextText.length > maxChars) contextText = contextText.slice(0, maxChars) + "...(truncated)"

  return `${base}\n\nClient context (JSON):\n${contextText || "{}"}`
}

function normalizeMessages(messages: ChatMessage[]) {
  const normalized = (Array.isArray(messages) ? messages : [])
    .filter((m) => m && typeof m.content === "string" && m.content.trim().length > 0)
    .map((m) => {
      const role: "user" | "assistant" = m.role === "assistant" ? "assistant" : "user"
      return { role, content: m.content }
    })

  const firstUserIndex = normalized.findIndex((m) => m.role === "user")
  const conversation = firstUserIndex >= 0 ? normalized.slice(firstUserIndex) : []
  return conversation
}

function toBedrockMessages(conversation: Array<{ role: "user" | "assistant"; content: string }>) {
  return conversation.map((msg) => ({
    role: msg.role as ConversationRole,
    content: [{ text: msg.content }],
  }))
}

export function createAgent2ChatPrepareGraph() {
  const g = new AgentGraph<Agent2ChatPrepareState>()

  g.addNode("load_client_context_from_s3", async (state) => {
    const clientContext = await loadClientContextBundleFromS3(state.clientKey)
    return { clientContext }
  })

  g.addNode("prepare_prompt_and_messages", async (state) => {
    if (!state.clientContext) throw new Error("Missing clientContext")
    const system = createSystemPrompt(state.clientContext)
    const conversation = normalizeMessages(state.messages)
    const bedrockMessages = toBedrockMessages(conversation)
    return { system, conversation, bedrockMessages }
  })

  g.setStart("load_client_context_from_s3")
  g.addEdge("load_client_context_from_s3", "prepare_prompt_and_messages")

  return g
}
