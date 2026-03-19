"use client"

import { useState, useRef, useEffect, useMemo } from "react"
import {
  Send,
  User,
  Bot,
  Sparkles,
  FileText,
  AlertTriangle,
  Target,
  ChevronRight,
  Lightbulb,
  MessageSquare,
  RefreshCw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { AdvisorLayout } from "@/components/advisor-layout"
import { useClient } from "@/lib/client-context"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

export default function AIAssistantPage() {
  const { currentClient, ipsData, rtqData, estateData, profileComparison, aiSuggestions, meetingTopics } = useClient()
  
  // Dynamic suggested questions based on client
  const suggestedQuestions = useMemo(() => [
    `What risks should I discuss with ${currentClient.name}?`,
    `What investment recommendations might fit ${currentClient.name.split(' ')[0]}'s profile?`,
    `Are there inconsistencies between ${currentClient.name.split(' ')[0]}'s RTQ and IPS?`,
    "What topics should I bring up in the next meeting?",
    "How should I address the concentrated stock position?",
    "What estate planning items need immediate attention?",
  ], [currentClient.name])

  // Get mismatches from profile comparison
  const mismatches = profileComparison.filter((p) => p.status === "mismatch")
  const highPriorityAlerts = currentClient.alerts.filter((a) => a.priority === "high")

  // Initial message based on current client
  const getInitialMessage = (): Message => ({
    id: "1",
    role: "assistant",
    content: `Hello! I'm your AI Advisor Assistant. I have access to ${currentClient.name}'s financial documents including their IPS, RTQ, and Estate Planning Worksheet.

I've identified several key insights:
${mismatches.length > 0 ? `- **Profile Discrepancies**: ${mismatches.length} mismatch(es) found between IPS and RTQ` : '- **Profiles Aligned**: IPS and RTQ are consistent'}
${highPriorityAlerts.length > 0 ? `- **${highPriorityAlerts.length} High Priority Alert(s)**: ${highPriorityAlerts[0]?.title}` : '- **No urgent alerts**'}
- **Total AUM**: $${(currentClient.totalAssets / 1000000).toFixed(2)}M

How can I help you prepare for your next client meeting?`,
    timestamp: new Date(),
  })

  const [messages, setMessages] = useState<Message[]>([getInitialMessage()])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const buildClientContext = () => ({
    client: currentClient,
    ips: ipsData,
    rtq: rtqData,
    estate: estateData,
    profileComparison,
    aiSuggestions,
    meetingTopics,
  })

  // Reset messages when client changes
  useEffect(() => {
    setMessages([getInitialMessage()])
  }, [currentClient.id])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const question = input
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: question,
      timestamp: new Date(),
    }

    setInput("")
    setIsLoading(true)

    const assistantMessageId = (Date.now() + 1).toString()
    const assistantTimestamp = new Date()
    const nextConversationAll = [...messages, userMessage].map(({ role, content }) => ({ role, content }))
    const firstUserIndex = nextConversationAll.findIndex((m) => m.role === "user")
    const nextConversation =
      firstUserIndex >= 0 ? nextConversationAll.slice(firstUserIndex) : [{ role: "user", content: question }]

    setMessages((prev) => [
      ...prev,
      userMessage,
      { id: assistantMessageId, role: "assistant", content: "", timestamp: assistantTimestamp },
    ])

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextConversation,
          clientContext: buildClientContext(),
        }),
      })

      if (!res.ok) {
        const maybeJson = await res.json().catch(() => null)
        const errText = maybeJson?.error || `Request failed with status ${res.status}`
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantMessageId ? { ...m, content: errText } : m))
        )
        return
      }

      const reader = res.body?.getReader()
      if (!reader) {
        const text = await res.text()
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantMessageId ? { ...m, content: text } : m))
        )
        return
      }

      const decoder = new TextDecoder()
      let assistantText = ""
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        assistantText += decoder.decode(value, { stream: true })
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantMessageId ? { ...m, content: assistantText } : m))
        )
      }
    } catch (err: any) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMessageId
            ? { ...m, content: `Network error: ${err?.message || String(err)}` }
            : m
        )
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleSuggestedQuestion = (question: string) => {
    setInput(question)
  }

  return (
    <AdvisorLayout>
      <div className="h-[calc(100vh-8rem)] flex gap-6">
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          <Card className="flex-1 flex flex-col">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">AI Advisor Assistant</CardTitle>
                    <CardDescription>Ask questions about {currentClient.name}&apos;s financial profile</CardDescription>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => setMessages([getInitialMessage()])}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Clear Chat
                </Button>
              </div>
            </CardHeader>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {message.role === "assistant" && (
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Bot className="w-4 h-4 text-primary" />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] rounded-lg p-4 ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      <div className="whitespace-pre-wrap text-sm leading-relaxed">
                        {message.content}
                      </div>
                      <div className={`text-xs mt-2 ${message.role === "user" ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    {message.role === "user" && (
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 text-primary-foreground" />
                      </div>
                    )}
                  </div>
                ))}
                {isLoading && (
                  <div className="flex gap-3 justify-start">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-primary" />
                    </div>
                    <div className="bg-muted rounded-lg p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                        <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                        <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Textarea
                  placeholder={`Ask about ${currentClient.name.split(' ')[0]}'s documents, risks, or recommendations...`}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      handleSend()
                    }
                  }}
                  className="min-h-[60px] resize-none"
                />
                <Button onClick={handleSend} disabled={isLoading || !input.trim()} className="px-4">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {suggestedQuestions.slice(0, 3).map((question, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => handleSuggestedQuestion(question)}
                  >
                    <MessageSquare className="w-3 h-3 mr-1" />
                    {question.length > 40 ? question.substring(0, 40) + "..." : question}
                  </Button>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="w-80 space-y-4 hidden xl:block">
          {/* Document Context */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Document Context
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {currentClient.documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                >
                  <span className="text-sm">{doc.name}</span>
                  <Badge variant="outline" className="text-xs">
                    {doc.status === "processed" ? "Ready" : doc.status}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Key Alerts */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Key Alerts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {currentClient.alerts.slice(0, 3).map((alert) => (
                <div
                  key={alert.id}
                  className={`p-2 rounded-lg text-sm ${
                    alert.priority === "high"
                      ? "bg-destructive/10 text-destructive"
                      : "bg-amber-500/10 text-amber-700 dark:text-amber-400"
                  }`}
                >
                  {alert.title}
                </div>
              ))}
              {currentClient.alerts.length === 0 && (
                <div className="p-2 rounded-lg text-sm bg-muted/50 text-muted-foreground">
                  No current alerts
                </div>
              )}
            </CardContent>
          </Card>

          {/* Priority Actions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Target className="w-4 h-4" />
                Priority Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {aiSuggestions.slice(0, 3).map((action) => (
                <div
                  key={action.id}
                  className="p-3 rounded-lg bg-muted/50 border-l-4"
                  style={{
                    borderLeftColor:
                      action.priority === "high"
                        ? "hsl(var(--destructive))"
                        : action.priority === "medium"
                        ? "hsl(45 93% 47%)"
                        : "hsl(var(--muted-foreground))",
                  }}
                >
                  <div className="text-sm font-medium">{action.action}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {action.category}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Suggested Questions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Lightbulb className="w-4 h-4" />
                Suggested Questions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {suggestedQuestions.map((question, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-left h-auto py-2 px-3"
                  onClick={() => handleSuggestedQuestion(question)}
                >
                  <ChevronRight className="w-3 h-3 mr-2 flex-shrink-0" />
                  <span className="text-xs">{question}</span>
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdvisorLayout>
  )
}
