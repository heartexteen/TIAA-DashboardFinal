"use client"

import {
  FileText,
  Download,
  Target,
  Clock,
  TrendingUp,
  AlertTriangle,
  ChevronRight,
  ExternalLink,
  CheckCircle2,
  Info,
  Scale,
  Gauge,
  Shield,
  DollarSign,
  AlertCircle,
} from "lucide-react"
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
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
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AdvisorLayout } from "@/components/advisor-layout"
import { useClient } from "@/lib/client-context"
import Link from "next/link"

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#6b7280"]

export default function RTQDashboard() {
  const { rtqData, ipsData, currentClient } = useClient()
  const { client, financialProfile, investmentPreferences, riskAssessment, suggestedAssetAllocation, investmentConstraints } = rtqData
  const employerStock = (financialProfile as any)?.employerStock as
    | { company: string; approxValue: number; note?: string }
    | undefined

  // Prepare pie chart data for suggested allocation
  const pieChartData = [
    { name: "Equity", value: suggestedAssetAllocation.equity },
    { name: "Fixed Income", value: suggestedAssetAllocation.fixedIncome },
    { name: "Alternatives", value: suggestedAssetAllocation.alternatives },
    { name: "Cash", value: suggestedAssetAllocation.cash },
  ]

  // Prepare radar chart data for risk factors
  const radarData = [
    { factor: "Time Horizon", score: investmentPreferences.timeHorizon.points, maxScore: 12 },
    { factor: "Objective", score: investmentPreferences.primaryInvestmentObjective.points, maxScore: 9 },
    { factor: "Spending", score: investmentPreferences.annualSpendingPolicy.points, maxScore: 9 },
    { factor: "Return Exp.", score: investmentPreferences.returnExpectation.points, maxScore: 12 },
    { factor: "Approach", score: investmentPreferences.investmentApproach.points, maxScore: 15 },
    { factor: "Loss Reaction", score: investmentPreferences.reactionToLoss.points, maxScore: 12 },
  ]

  // Question breakdown for scoring
  const questionBreakdown = [
    { question: "Time Horizon", answer: investmentPreferences.timeHorizon.selected, points: investmentPreferences.timeHorizon.points },
    { question: "Primary Objective", answer: investmentPreferences.primaryInvestmentObjective.selected, points: investmentPreferences.primaryInvestmentObjective.points },
    { question: "Annual Spending Policy", answer: investmentPreferences.annualSpendingPolicy.selected, points: investmentPreferences.annualSpendingPolicy.points },
    { question: "Return Expectation", answer: investmentPreferences.returnExpectation.selected, points: investmentPreferences.returnExpectation.points },
    { question: "Investment Approach", answer: investmentPreferences.investmentApproach.selected, points: investmentPreferences.investmentApproach.points },
    { question: "Reaction to 20% Loss", answer: investmentPreferences.reactionToLoss.selected, points: investmentPreferences.reactionToLoss.points },
    { question: "Most Feared Event", answer: investmentPreferences.mostFearedEvent.selected, points: investmentPreferences.mostFearedEvent.points },
    { question: "Investment Knowledge", answer: investmentPreferences.investmentKnowledge.selected, points: investmentPreferences.investmentKnowledge.points },
  ]

  // Comparison with IPS
  const allocationComparison = [
    { name: "Equity", RTQ: suggestedAssetAllocation.equity, IPS: ipsData.targetAssetAllocation.allocations[0].targetAllocation },
    { name: "Fixed Income", RTQ: suggestedAssetAllocation.fixedIncome, IPS: ipsData.targetAssetAllocation.allocations[1].targetAllocation },
    { name: ipsData.targetAssetAllocation.allocations[2].assetClass, RTQ: (suggestedAssetAllocation as Record<string, number>).alternatives || (suggestedAssetAllocation as Record<string, number>).realAssets || 0, IPS: ipsData.targetAssetAllocation.allocations[2].targetAllocation },
    { name: "Cash", RTQ: suggestedAssetAllocation.cash, IPS: ipsData.targetAssetAllocation.allocations[3].targetAllocation },
  ]

  return (
    <AdvisorLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <Link href="/" className="hover:text-foreground">Overview</Link>
              <ChevronRight className="w-4 h-4" />
              <span className="text-foreground">Risk Tolerance Questionnaire</span>
            </div>
            <h1 className="text-2xl font-semibold text-foreground">RTQ Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              {client.name} - {client.document}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              className="gap-2"
              onClick={() => window.open("/documents/Carina_RTQ.pdf", "_blank")}
            >
              <ExternalLink className="w-4 h-4" />
              View Original
            </Button>
            <Button 
              variant="outline" 
              className="gap-2"
              asChild
            >
              <a href="/documents/Carina_RTQ.pdf" download>
                <Download className="w-4 h-4" />
                Export PDF
              </a>
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Gauge className="w-5 h-5 text-primary" />
                </div>
              </div>
              <div className="text-2xl font-semibold text-foreground mb-1">{riskAssessment.totalScore}</div>
              <div className="text-sm text-muted-foreground">Risk Score ({riskAssessment.scoreRange})</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-green-600" />
                </div>
              </div>
              <div className="text-2xl font-semibold text-foreground mb-1">{riskAssessment.riskProfile}</div>
              <div className="text-sm text-muted-foreground">Risk Profile</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <div className="text-2xl font-semibold text-foreground mb-1">{investmentPreferences.timeHorizon.selected}</div>
              <div className="text-sm text-muted-foreground">Time Horizon</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-amber-600" />
                </div>
              </div>
              <div className="text-2xl font-semibold text-foreground mb-1">{investmentPreferences.returnExpectation.selected}</div>
              <div className="text-sm text-muted-foreground">Return Expectation</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="scoring">Scoring Breakdown</TabsTrigger>
            <TabsTrigger value="comparison">IPS Comparison</TabsTrigger>
            <TabsTrigger value="json">JSON Data</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-3 gap-8">
              {/* Left Column */}
              <div className="col-span-2 space-y-6">
                {/* Risk Assessment Result */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Risk Assessment Result</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-8">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                            <span className="text-2xl font-bold text-green-600">{riskAssessment.totalScore}</span>
                          </div>
                          <div>
                            <h3 className="text-xl font-semibold text-foreground">{riskAssessment.riskProfile}</h3>
                            <p className="text-sm text-muted-foreground">Score Range: {riskAssessment.scoreRange}</p>
                          </div>
                        </div>
                        <p className="text-muted-foreground">{riskAssessment.description}</p>
                      </div>
                      <div className="w-48">
                        <div className="relative pt-1">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-muted-foreground">Conservative</span>
                            <span className="text-xs text-muted-foreground">Aggressive</span>
                          </div>
                          <div className="h-4 bg-gradient-to-r from-green-200 via-yellow-200 to-red-200 rounded-full">
                            <div
                              className="absolute w-4 h-4 bg-foreground rounded-full -mt-0"
                              style={{ left: `${((riskAssessment.totalScore - 24) / (84 - 24)) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Investment Preferences Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Investment Preferences</CardTitle>
                    <CardDescription>Key responses from the questionnaire</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-2 mb-2">
                          <Target className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">Primary Objective</span>
                        </div>
                        <p className="font-medium">{investmentPreferences.primaryInvestmentObjective.selected}</p>
                      </div>
                      <div className="p-4 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">Time Horizon</span>
                        </div>
                        <p className="font-medium">{investmentPreferences.timeHorizon.selected}</p>
                        <p className="text-xs text-muted-foreground mt-1">{investmentPreferences.timeHorizon.note}</p>
                      </div>
                      <div className="p-4 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-2 mb-2">
                          <Scale className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">Investment Approach</span>
                        </div>
                        <p className="font-medium text-sm">{investmentPreferences.investmentApproach.selected}</p>
                      </div>
                      <div className="p-4 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertTriangle className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">Most Feared Event</span>
                        </div>
                        <p className="font-medium text-sm">{investmentPreferences.mostFearedEvent.selected}</p>
                      </div>
                    </div>

                    <div className="p-4 rounded-lg border border-amber-200 bg-amber-50">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-foreground">Reaction to 20% Portfolio Loss</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {investmentPreferences.reactionToLoss.selected}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Investment Constraints */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Investment Constraints</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {investmentConstraints.esgPreference && (
                    <div className="flex items-center gap-3 p-4 rounded-lg bg-green-50 border border-green-200">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="font-medium text-foreground">ESG Preference</p>
                        <p className="text-sm text-muted-foreground">Client prefers ESG-aligned investments when possible</p>
                      </div>
                    </div>
                    )}
                    {employerStock && (
                    <div className="flex items-center gap-3 p-4 rounded-lg bg-amber-50 border border-amber-200">
                      <AlertTriangle className="w-5 h-5 text-amber-600" />
                      <div>
                        <p className="font-medium text-foreground">Concentrated Position</p>
                        <p className="text-sm text-muted-foreground">
                          ~${employerStock.approxValue.toLocaleString()} in {employerStock.company} employer stock
                        </p>
                      </div>
                    </div>
                    )}
                    {investmentConstraints.notes && investmentConstraints.notes.length > 0 && (
                      <div className="space-y-2">
                        {investmentConstraints.notes.map((note: string, index: number) => (
                          <div key={index} className="flex items-start gap-2 p-3 rounded-lg bg-muted/50">
                            <CheckCircle2 className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                            <p className="text-sm text-muted-foreground">{note}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Suggested Allocation */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">RTQ Suggested Allocation</CardTitle>
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
                            {pieChartData.map((entry, index) => (
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
                    <div className="space-y-2 mt-4">
                      {pieChartData.map((item, index) => (
                        <div key={item.name} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: COLORS[index % COLORS.length] }}
                            />
                            <span className="text-sm text-muted-foreground">{item.name}</span>
                          </div>
                          <span className="text-sm font-medium">{item.value}%</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Financial Profile */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Financial Profile</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Assets Under Consideration</span>
                      <span className="font-semibold">${(financialProfile.assetsUnderConsideration / 1000000).toFixed(2)}M</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Spending Policy</span>
                      <span className="font-medium">{investmentPreferences.annualSpendingPolicy.selected}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Return Expectation</span>
                      <span className="font-medium">{investmentPreferences.returnExpectation.selected}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Investment Knowledge</span>
                      <Badge variant="secondary">{investmentPreferences.investmentKnowledge.selected.split("—")[0].trim()}</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="scoring" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Question-by-Question Scoring</CardTitle>
                <CardDescription>Detailed breakdown of RTQ responses and points</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Question</TableHead>
                      <TableHead>Response</TableHead>
                      <TableHead className="text-right">Points</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {questionBreakdown.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{item.question}</TableCell>
                        <TableCell className="text-muted-foreground max-w-md">{item.answer}</TableCell>
                        <TableCell className="text-right">
                          <Badge variant="secondary">{item.points} pts</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="bg-muted/50">
                      <TableCell colSpan={2} className="font-semibold">Total Score</TableCell>
                      <TableCell className="text-right">
                        <Badge className="bg-primary">{riskAssessment.totalScore} pts</Badge>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Risk Factor Radar */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Risk Factor Analysis</CardTitle>
                <CardDescription>Visual representation of risk factor scores</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80 w-full min-h-0">
                  <ResponsiveContainer width="100%" height={320} minWidth={0}>
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="#e5e7eb" />
                      <PolarAngleAxis dataKey="factor" tick={{ fill: "#6b7280", fontSize: 12 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 15]} tick={{ fill: "#6b7280", fontSize: 10 }} />
                      <Radar
                        name="Score"
                        dataKey="score"
                        stroke="#3b82f6"
                        fill="#3b82f6"
                        fillOpacity={0.3}
                        strokeWidth={2}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "white",
                          border: "1px solid #e5e7eb",
                          borderRadius: "8px",
                        }}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="comparison" className="space-y-6">
            {/* Allocation Comparison */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Asset Allocation Comparison</CardTitle>
                <CardDescription>RTQ Suggested vs IPS Target Allocation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80 w-full min-h-0">
                  <ResponsiveContainer width="100%" height={320} minWidth={0}>
                    <BarChart data={allocationComparison}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
                      <YAxis stroke="#6b7280" fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "white",
                          border: "1px solid #e5e7eb",
                          borderRadius: "8px",
                        }}
                        formatter={(value: any) => [`${typeof value === "number" ? value : Number(value)}%`, ""]}
                      />
                      <Legend />
                      <Bar dataKey="RTQ" fill="#10b981" name="RTQ Suggested" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="IPS" fill="#3b82f6" name="IPS Target" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

          </TabsContent>

          <TabsContent value="json" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Extracted JSON Data</CardTitle>
                <CardDescription>Raw extracted data from the Risk Tolerance Questionnaire</CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="p-4 rounded-lg bg-muted text-sm overflow-auto max-h-[600px]">
                  {JSON.stringify(rtqData, null, 2)}
                </pre>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdvisorLayout>
  )
}
