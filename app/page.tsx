"use client"

import { useEffect, useState } from "react"
import {
  AlertTriangle,
  TrendingUp,
  Calendar,
  FileText,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  DollarSign,
  User,
  Building,
  RefreshCcw,
} from "lucide-react"
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AdvisorLayout } from "@/components/advisor-layout"
import { useClient } from "@/lib/client-context"
import type { Holding, HoldingsSnapshot } from "@/lib/domain/types"
import Link from "next/link"

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#6b7280"]

type DailySummarySections = {
  asOf?: string
  globalEvents: string[]
  portfolioImpact: string[]
  riskGuidance: string[]
  warnings: string[]
  sources: Array<{ title: string; url: string }>
  raw: string
}

function parseDailySummarySections(text: string): DailySummarySections {
  const sections: DailySummarySections = {
    asOf: undefined,
    globalEvents: [],
    portfolioImpact: [],
    riskGuidance: [],
    warnings: [],
    sources: [],
    raw: text,
  }

  const lines = text
    .split(/\r?\n/g)
    .map((l) => l.trim())
    .filter((l) => l.length > 0)

  type SectionKey = "global" | "impact" | "guidance" | "warnings" | "sources" | null
  let current: SectionKey = null

  for (const line of lines) {
    const upper = line.toUpperCase()
    if (upper.startsWith("AS_OF:")) {
      const value = line.slice(6).trim()
      sections.asOf = value || undefined
      continue
    }
    if (upper === "GLOBAL:" || upper.startsWith("GLOBAL:")) {
      current = "global"
      continue
    }
    if (upper === "IMPACT:" || upper.startsWith("IMPACT:")) {
      current = "impact"
      continue
    }
    if (upper === "GUIDANCE:" || upper.startsWith("GUIDANCE:")) {
      current = "guidance"
      continue
    }
    if (upper === "WARNINGS:" || upper.startsWith("WARNINGS:")) {
      current = "warnings"
      continue
    }
    if (upper === "SOURCES:" || upper.startsWith("SOURCES:")) {
      current = "sources"
      continue
    }

    const bulletMatch = line.match(/^[-•]\s+(.*)$/)
    if (!bulletMatch) continue
    const bullet = bulletMatch[1].trim()
    if (!bullet) continue

    if (current === "global") sections.globalEvents.push(bullet)
    else if (current === "impact") sections.portfolioImpact.push(bullet)
    else if (current === "guidance") sections.riskGuidance.push(bullet)
    else if (current === "warnings") sections.warnings.push(bullet)
    else if (current === "sources") {
      if (/^none$/i.test(bullet)) continue
      const urlMatch = bullet.match(/https?:\/\/\S+/)
      const url = urlMatch?.[0]
      if (!url) continue
      const title = bullet.replace(url, "").replace(/[—-]\s*$/, "").trim() || url
      sections.sources.push({ title, url })
    }
  }

  return sections
}

export default function ClientOverviewDashboard() {
  const {
    selectedClientId,
    currentClient,
    ipsData,
    rtqData,
    aiSuggestions,
  } = useClient()

  // Prepare allocation comparison data for chart
  const allocationComparisonData = (ipsData.targetAssetAllocation.allocations as any[]).map((alloc: any) => {
    const rtqKey = alloc.assetClass.toLowerCase().replace(/\s+/g, "") as keyof typeof rtqData.suggestedAssetAllocation
    // Handle different naming conventions
    let rtqValue = 0
    if (alloc.assetClass === "Equity") {
      rtqValue = rtqData.suggestedAssetAllocation.equity
    } else if (alloc.assetClass === "Fixed Income") {
      rtqValue = rtqData.suggestedAssetAllocation.fixedIncome
    } else if (alloc.assetClass === "Alternatives" || alloc.assetClass === "Real Assets") {
      rtqValue = (rtqData.suggestedAssetAllocation as Record<string, number>).alternatives || 
                 (rtqData.suggestedAssetAllocation as Record<string, number>).realAssets || 0
    } else if (alloc.assetClass === "Cash" || alloc.assetClass === "Cash & Equivalents") {
      rtqValue = rtqData.suggestedAssetAllocation.cash
    }
    return {
      name: alloc.assetClass,
      IPS: alloc.targetAllocation,
      RTQ: rtqValue,
    }
  })

  // Prepare pie chart data for IPS allocation
  const pieChartData = (ipsData.targetAssetAllocation.allocations as any[]).map((a: any) => ({
    name: a.assetClass,
    value: a.targetAllocation,
  }))

  const highPriorityAlerts = (currentClient.alerts as any[]).filter((a: any) => a.priority === "high")

  const holdingsSnapshot = (ipsData as any).currentHoldings as HoldingsSnapshot | undefined
  const moneyFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  })

  const holdingsModels = (() => {
    if (!holdingsSnapshot) return null

    const holdingsWithAccount = (holdingsSnapshot.accounts as any[]).flatMap((account: any) =>
      (account.holdings as any[]).map((h: any) => ({
        ...h,
        accountName: account.accountName,
        accountType: account.accountType,
        institution: account.institution,
      })),
    )

    const total = holdingsWithAccount.reduce((sum: number, h: any) => sum + (h.marketValue || 0), 0)

    const valueByAssetClass = new Map<string, number>()
    for (const h of holdingsWithAccount) {
      valueByAssetClass.set(h.assetClass, (valueByAssetClass.get(h.assetClass) || 0) + (h.marketValue || 0))
    }

    const models = (ipsData.targetAssetAllocation.allocations as any[]).map((alloc: any) => {
      const currentValue = valueByAssetClass.get(alloc.assetClass) || 0
      const currentPct = total > 0 ? (currentValue / total) * 100 : 0
      const driftPct = currentPct - alloc.targetAllocation
      const inRange = currentPct >= alloc.allowableMin && currentPct <= alloc.allowableMax

      const allHoldings = holdingsWithAccount
        .filter((h: any) => h.assetClass === alloc.assetClass)
        .sort((a: any, b: any) => (b.marketValue || 0) - (a.marketValue || 0))

      const accounts = (holdingsSnapshot.accounts as any[])
        .map((a: any) => {
          const value = (a.holdings as any[])
            .filter((h: any) => h.assetClass === alloc.assetClass)
            .reduce((sum: number, h: any) => sum + (h.marketValue || 0), 0)
          return { accountName: a.accountName, institution: a.institution, value }
        })
        .filter((a: any) => a.value > 0)
        .sort((a: any, b: any) => b.value - a.value)

      const topHoldings = allHoldings.slice(0, 4)

      return {
        assetClass: alloc.assetClass,
        targetPct: alloc.targetAllocation,
        minPct: alloc.allowableMin,
        maxPct: alloc.allowableMax,
        currentValue,
        currentPct,
        driftPct,
        inRange,
        accounts,
        allHoldings,
        topHoldings,
      }
    })

    const outOfRangeCount = models.filter((m: any) => !m.inRange).length
    const driftScore =
      models.reduce((sum: number, m: any) => sum + Math.abs((m.currentPct || 0) - (m.targetPct || 0)), 0) / 2

    return { total, outOfRangeCount, driftScore, models }
  })()

  const [dailySummary, setDailySummary] = useState<DailySummarySections | null>(null)
  const [dailySummaryLoading, setDailySummaryLoading] = useState(false)
  const [dailySummaryError, setDailySummaryError] = useState<string | null>(null)
  const [refreshNonce, setRefreshNonce] = useState(0)
  const [expandedAccountsByAssetClass, setExpandedAccountsByAssetClass] = useState<Record<string, boolean>>({})
  const [expandedHoldingsByAssetClass, setExpandedHoldingsByAssetClass] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const controller = new AbortController()
    const timeoutMs = 45_000
    const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs)

    async function run() {
      setDailySummaryLoading(true)
      setDailySummaryError(null)
      try {
        const res = await fetch("/api/daily-summary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            clientKey: selectedClientId,
          }),
          signal: controller.signal,
        })

        if (!res.ok) {
          const contentType = res.headers.get("content-type") || ""
          if (contentType.includes("application/json")) {
            const json = await res.json()
            throw new Error(json?.error || `Failed to load daily summary (${res.status}).`)
          }
          const text = await res.text()
          throw new Error(text || `Failed to load daily summary (${res.status}).`)
        }

        const text = await res.text()
        setDailySummary(parseDailySummarySections(text))
      } catch (err: any) {
        if (controller.signal.aborted) {
          setDailySummaryLoading(false)
          return
        }
        setDailySummary(null)
        setDailySummaryError(err?.message || String(err))
      } finally {
        setDailySummaryLoading(false)
      }
    }

    run()
    return () => {
      window.clearTimeout(timeoutId)
      controller.abort()
    }
  }, [selectedClientId, refreshNonce])

  // Format next meeting date
  const formatNextMeeting = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }

  const asOfLabel = (() => {
    if (!dailySummary?.asOf) return "Latest headlines"
    const d = new Date(dailySummary.asOf)
    return Number.isNaN(d.valueOf()) ? `As of ${dailySummary.asOf}` : `As of ${d.toLocaleString()}`
  })()

  return (
    <AdvisorLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Client Overview</h1>
            <p className="text-muted-foreground mt-1">
              Comprehensive view of {currentClient.name}&apos;s financial profile and documents
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="gap-2">
              <Calendar className="w-4 h-4" />
              Schedule Meeting
            </Button>
            <Button className="gap-2 bg-primary hover:bg-primary/90">
              <FileText className="w-4 h-4" />
              Upload Document
            </Button>
          </div>
        </div>

        {/* AI Daily Summary Banner */}
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-foreground">AI Daily Summary</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {asOfLabel}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => setRefreshNonce((n) => n + 1)}
                  >
                    <RefreshCcw className="w-4 h-4" />
                    Refresh
                  </Button>
                </div>

                {dailySummaryLoading && (
                  <p className="text-sm text-muted-foreground mt-3">Generating summary…</p>
                )}

                {!dailySummaryLoading && dailySummaryError && (
                  <div className="mt-3 space-y-1">
                    <p className="text-sm text-muted-foreground">
                      Couldn&apos;t load the daily summary: {dailySummaryError}
                    </p>
                    {highPriorityAlerts.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {highPriorityAlerts.map((alert) => (
                          <p key={alert.id} className="text-sm text-muted-foreground flex items-center gap-2">
                            <AlertCircle className="w-3 h-3 text-destructive" />
                            {alert.description}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {!dailySummaryLoading && !dailySummaryError && dailySummary && (
                  <>
                    {dailySummary.globalEvents.length +
                      dailySummary.portfolioImpact.length +
                      dailySummary.riskGuidance.length +
                      dailySummary.warnings.length +
                      dailySummary.sources.length ===
                    0 ? (
                      <pre className="mt-3 text-sm text-muted-foreground whitespace-pre-wrap">
                        {dailySummary.raw}
                      </pre>
                    ) : (
                      <div className="mt-3 grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs font-medium text-foreground">Global events</p>
                      <ul className="mt-2 space-y-1">
                        {dailySummary.globalEvents?.slice(0, 5).map((t, idx) => (
                          <li key={`ge-${idx}`} className="text-sm text-muted-foreground flex items-start gap-2">
                            <AlertCircle className="w-3 h-3 mt-1 text-primary" />
                            <span>{t}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-foreground">Portfolio impact</p>
                      <ul className="mt-2 space-y-1">
                        {dailySummary.portfolioImpact?.slice(0, 5).map((t, idx) => (
                          <li key={`pi-${idx}`} className="text-sm text-muted-foreground flex items-start gap-2">
                            <AlertCircle className="w-3 h-3 mt-1 text-primary" />
                            <span>{t}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-foreground">Risk guidance</p>
                      <ul className="mt-2 space-y-1">
                        {dailySummary.riskGuidance?.slice(0, 5).map((t, idx) => (
                          <li key={`rg-${idx}`} className="text-sm text-muted-foreground flex items-start gap-2">
                            <CheckCircle2 className="w-3 h-3 mt-1 text-green-600" />
                            <span>{t}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    {Array.isArray(dailySummary.warnings) &&
                      dailySummary.warnings.filter((w) => !/^none$/i.test(w.trim())).length > 0 && (
                      <div className="col-span-3 mt-2">
                        <p className="text-xs font-medium text-foreground">Warnings</p>
                        <ul className="mt-2 space-y-1">
                          {dailySummary.warnings
                            .filter((w) => !/^none$/i.test(w.trim()))
                            .slice(0, 3)
                            .map((t, idx) => (
                            <li key={`w-${idx}`} className="text-sm text-muted-foreground flex items-start gap-2">
                              <AlertTriangle className="w-3 h-3 mt-1 text-amber-600" />
                              <span>{t}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {Array.isArray(dailySummary.sources) && dailySummary.sources.length > 0 && (
                      <div className="col-span-3 mt-2">
                        <p className="text-xs font-medium text-foreground">Sources</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {dailySummary.sources.slice(0, 6).map((s, idx) => (
                            <a
                              key={`src-${idx}`}
                              href={s.url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs text-primary hover:underline"
                            >
                              {s.title || s.url}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Metrics */}
        <div className="grid grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-primary" />
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-700">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Active
                </Badge>
              </div>
              <div className="text-2xl font-semibold text-foreground mb-1">
                ${(currentClient.totalAssets / 1000000).toFixed(2)}M
              </div>
              <div className="text-sm text-muted-foreground">Total Assets Under Management</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                  <RefreshCcw className="w-5 h-5 text-amber-600" />
                </div>
                <Badge
                  variant="secondary"
                  className={
                    !holdingsModels
                      ? "bg-slate-100 text-slate-700"
                      : holdingsModels.outOfRangeCount
                        ? "bg-amber-100 text-amber-700"
                        : "bg-green-100 text-green-700"
                  }
                >
                  {!holdingsModels
                    ? "N/A"
                    : holdingsModels.outOfRangeCount
                      ? `${holdingsModels.outOfRangeCount} out of range`
                      : "Within ranges"}
                </Badge>
              </div>
              <div className="text-2xl font-semibold text-foreground mb-1">
                {holdingsModels?.outOfRangeCount ? "Needs Rebalance" : "On Track"}
              </div>
              <div className="text-sm text-muted-foreground">
                {holdingsModels ? `${holdingsModels.driftScore.toFixed(1)}% allocation drift vs IPS` : "Holdings not available"}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <div className="text-2xl font-semibold text-foreground mb-1">{currentClient.documents.length}</div>
              <div className="text-sm text-muted-foreground">Documents Processed</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-green-600" />
                </div>
              </div>
              <div className="text-2xl font-semibold text-foreground mb-1">
                {formatNextMeeting(currentClient.nextMeeting)}
              </div>
              <div className="text-sm text-muted-foreground">Next Scheduled Meeting</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="col-span-2 space-y-8">
            {/* Profile Comparison */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Current Holdings</CardTitle>
                    <CardDescription>
                      Holdings breakdown by asset class and account (aligned to IPS targets)
                      {holdingsSnapshot?.asOf ? ` • As of ${holdingsSnapshot.asOf}` : ""}
                    </CardDescription>
                  </div>
                  <Link href="/client/ips">
                    <Button variant="ghost" size="sm" className="gap-1">
                      View IPS <ChevronRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {!holdingsModels ? (
                  <div className="text-sm text-muted-foreground">No holdings data available for this client.</div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <div className="text-muted-foreground">
                        Total portfolio value:{" "}
                        <span className="text-foreground font-medium">
                          {moneyFormatter.format(holdingsModels.total)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="secondary"
                          className={
                            holdingsModels.outOfRangeCount ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"
                          }
                        >
                          {holdingsModels.outOfRangeCount ? `${holdingsModels.outOfRangeCount} out of range` : "Within ranges"}
                        </Badge>
                        <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                          Drift: {holdingsModels.driftScore.toFixed(1)}%
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {(holdingsModels.models as any[]).map((m: any) => (
                        <Card key={m.assetClass} className="shadow-sm">
                          <CardContent className="p-4 space-y-3">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <div className="font-medium text-foreground truncate">{m.assetClass}</div>
                                <div className="text-xs text-muted-foreground">
                                  {m.currentPct.toFixed(1)}% current • {m.targetPct}% target • Range {m.minPct}–{m.maxPct}%
                                </div>
                              </div>
                              <Badge
                                variant={m.inRange ? "secondary" : "destructive"}
                                className={m.inRange ? "bg-green-100 text-green-700" : ""}
                              >
                                {m.inRange ? "In Range" : "Out of Range"}
                              </Badge>
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="text-sm text-muted-foreground">Market value</div>
                              <div className="text-sm font-medium text-foreground">
                                {moneyFormatter.format(m.currentValue)}
                              </div>
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="text-sm text-muted-foreground">Drift</div>
                              <div className="text-sm font-medium text-foreground">
                                {m.driftPct >= 0 ? "+" : ""}
                                {m.driftPct.toFixed(1)}%
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <div className="text-xs font-medium text-muted-foreground mb-1">Accounts</div>
                                <div className="space-y-1">
                                  {(expandedAccountsByAssetClass[m.assetClass] ? m.accounts : m.accounts.slice(0, 3)).map((a: any) => (
                                    <div key={a.accountName} className="flex items-center justify-between text-xs">
                                      <span className="truncate text-foreground" title={a.accountName}>
                                        {a.accountName}
                                      </span>
                                      <span className="text-muted-foreground">{moneyFormatter.format(a.value)}</span>
                                    </div>
                                  ))}
                                  {m.accounts.length > 3 && (
                                    <button
                                      type="button"
                                      className="text-xs text-primary hover:underline"
                                      onClick={() =>
                                        setExpandedAccountsByAssetClass((prev) => ({
                                          ...prev,
                                          [m.assetClass]: !prev[m.assetClass],
                                        }))
                                      }
                                    >
                                      {expandedAccountsByAssetClass[m.assetClass]
                                        ? "Show less"
                                        : `+${m.accounts.length - 3} more`}
                                    </button>
                                  )}
                                </div>
                              </div>

                              <div>
                                <div className="text-xs font-medium text-muted-foreground mb-1">Top holdings</div>
                                <div className="space-y-1">
                                  {(expandedHoldingsByAssetClass[m.assetClass] ? m.allHoldings : m.topHoldings).map(
                                    (h: Holding & { accountName: string }) => (
                                    <div key={h.id} className="flex items-center justify-between text-xs">
                                      <span className="truncate text-foreground" title={`${h.name} • ${h.accountName}`}>
                                        {h.ticker ? `${h.ticker} — ${h.name}` : h.name}
                                      </span>
                                      <span className="text-muted-foreground">{moneyFormatter.format(h.marketValue)}</span>
                                    </div>
                                  ))}
                                  {m.allHoldings.length > 4 && (
                                    <button
                                      type="button"
                                      className="text-xs text-primary hover:underline"
                                      onClick={() =>
                                        setExpandedHoldingsByAssetClass((prev) => ({
                                          ...prev,
                                          [m.assetClass]: !prev[m.assetClass],
                                        }))
                                      }
                                    >
                                      {expandedHoldingsByAssetClass[m.assetClass]
                                        ? "Show less"
                                        : `+${m.allHoldings.length - 4} more`}
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Allocation Comparison Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Asset Allocation Comparison</CardTitle>
                <CardDescription>IPS Target vs RTQ Recommended Allocation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80 w-full min-h-0">
                  <ResponsiveContainer width="100%" height={320} minWidth={0}>
                    <BarChart data={allocationComparisonData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis type="number" domain={[0, 80]} stroke="#6b7280" fontSize={12} />
                      <YAxis dataKey="name" type="category" stroke="#6b7280" fontSize={12} width={100} />
	                      <Tooltip
	                        contentStyle={{
	                          backgroundColor: "white",
	                          border: "1px solid #e5e7eb",
	                          borderRadius: "8px",
	                          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
	                        }}
	                        formatter={(value: any) => [`${typeof value === "number" ? value : Number(value)}%`, ""]}
	                      />
                      <Legend />
                      <Bar dataKey="IPS" fill="#3b82f6" name="IPS Target" radius={[0, 4, 4, 0]} />
                      <Bar dataKey="RTQ" fill="#10b981" name="RTQ Suggested" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Account Summary */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Account Summary</CardTitle>
                    <CardDescription>Portfolio accounts and beneficiary status</CardDescription>
                  </div>
                  <Link href="/client/ips">
                    <Button variant="ghost" size="sm" className="gap-1">
                      View IPS <ChevronRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(ipsData.clientProfile.accounts as any[]).map((account: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-4 rounded-lg border border-border">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Building className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{account.accountName}</p>
                          <p className="text-sm text-muted-foreground">{account.accountType}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-foreground">
                          ${account.approximateValue.toLocaleString()}
                        </p>
                        <Badge
                          variant="secondary"
                          className={
                            account.beneficiaryStatus === "complete"
                              ? "bg-green-100 text-green-700"
                              : "bg-amber-100 text-amber-700"
                          }
                        >
                          {account.beneficiaryStatus === "complete" ? "Beneficiary Set" : "Beneficiary Needed"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Client Profile Card */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Client Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{currentClient.name}</h3>
                    <p className="text-sm text-muted-foreground">{currentClient.email}</p>
                    <p className="text-sm text-muted-foreground">{currentClient.phone}</p>
                  </div>
                </div>
                <div className="pt-4 border-t border-border space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Risk Profile (IPS)</span>
                    <Badge className="bg-primary/10 text-primary">{ipsData.riskTolerance}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Risk Profile (RTQ)</span>
                    <Badge variant="secondary">{rtqData.riskAssessment.riskProfile}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Time Horizon (IPS)</span>
                    <span className="text-sm font-medium">{ipsData.timeHorizon}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">ESG Preference</span>
                    <Badge variant="secondary" className={rtqData.investmentConstraints.esgPreference ? "bg-green-100 text-green-700" : "bg-muted"}>
                      {rtqData.investmentConstraints.esgPreference ? "Yes" : "No"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* IPS Allocation Pie Chart */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Target Allocation (IPS)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48 w-full min-h-0">
                  <ResponsiveContainer width="100%" height={192} minWidth={0}>
                    <RechartsPieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {(pieChartData as any[]).map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
	                      <Tooltip
	                        contentStyle={{
	                          backgroundColor: "white",
	                          border: "1px solid #e5e7eb",
	                          borderRadius: "8px",
	                        }}
	                        formatter={(value: any) => [`${typeof value === "number" ? value : Number(value)}%`, ""]}
	                      />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {(pieChartData as any[]).map((item: any, index: number) => (
                    <div key={item.name} className="flex items-center gap-2 text-sm">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="text-muted-foreground">{item.name}</span>
                      <span className="font-medium ml-auto">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* AI Suggested Actions */}
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">AI Suggestions</CardTitle>
                  <Link href="/assistant">
                    <Button variant="ghost" size="sm" className="gap-1">
                      Ask AI <ChevronRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {(aiSuggestions as any[]).slice(0, 4).map((action: any) => (
                  <div
                    key={action.id}
                    className="p-3 rounded-lg bg-muted/50 border-l-4"
                    style={{
                      borderLeftColor:
                        action.priority === "high"
                          ? "#ef4444"
                          : action.priority === "medium"
                            ? "#f59e0b"
                            : "#6b7280",
                    }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium text-foreground">{action.action}</p>
                        <Badge variant="secondary" className="mt-1 text-xs">
                          {action.category}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdvisorLayout>
  )
}
