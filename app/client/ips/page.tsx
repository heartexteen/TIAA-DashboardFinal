"use client"

import {
  FileText,
  Download,
  TrendingUp,
  DollarSign,
  Target,
  Clock,
  Building,
  ChevronRight,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
  Info,
  PieChart,
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
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AdvisorLayout } from "@/components/advisor-layout"
import { useClient } from "@/lib/client-context"
import Link from "next/link"

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#6b7280"]

export default function IPSDashboard() {
  const { ipsData, currentClient } = useClient()
  const { clientProfile, investmentObjectives, riskTolerance, timeHorizon, liquidityNeeds, returnGoal, targetAssetAllocation, advisorNotes, benchmarks } = ipsData

  // Prepare pie chart data
  const pieChartData = targetAssetAllocation.allocations.map((a) => ({
    name: a.assetClass,
    value: a.targetAllocation,
  }))

  // Prepare range chart data
  const rangeChartData = targetAssetAllocation.allocations.map((a) => ({
    name: a.assetClass,
    target: a.targetAllocation,
    min: a.allowableMin,
    max: a.allowableMax,
    range: a.allowableMax - a.allowableMin,
  }))

  return (
    <AdvisorLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <Link href="/" className="hover:text-foreground">Overview</Link>
              <ChevronRight className="w-4 h-4" />
              <span className="text-foreground">Investment Policy Statement</span>
            </div>
            <h1 className="text-2xl font-semibold text-foreground">IPS Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              {clientProfile.clientName} - Investment Policy Statement Analysis
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              className="gap-2"
              onClick={() => window.open("/documents/Carina_IPS.pdf", "_blank")}
            >
              <ExternalLink className="w-4 h-4" />
              View Original
            </Button>
            <Button 
              variant="outline" 
              className="gap-2"
              asChild
            >
              <a href="/documents/Carina_IPS.pdf" download>
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
                  <DollarSign className="w-5 h-5 text-primary" />
                </div>
              </div>
              <div className="text-2xl font-semibold text-foreground mb-1">
                ${(clientProfile.totalPortfolioValue / 1000000).toFixed(2)}M
              </div>
              <div className="text-sm text-muted-foreground">Total Portfolio Value</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                  <Target className="w-5 h-5 text-amber-600" />
                </div>
              </div>
              <div className="text-2xl font-semibold text-foreground mb-1">{riskTolerance}</div>
              <div className="text-sm text-muted-foreground">Risk Tolerance</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
              </div>
              <div className="text-2xl font-semibold text-foreground mb-1">7-9%</div>
              <div className="text-sm text-muted-foreground">Target Annual Return</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <div className="text-2xl font-semibold text-foreground mb-1">{timeHorizon}</div>
              <div className="text-sm text-muted-foreground">Investment Horizon</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="allocation">Asset Allocation</TabsTrigger>
            <TabsTrigger value="accounts">Accounts</TabsTrigger>
            <TabsTrigger value="json">JSON Data</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-3 gap-8">
              {/* Left Column */}
              <div className="col-span-2 space-y-6">
                {/* Investment Objectives */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Investment Objectives</CardTitle>
                    <CardDescription>Client&apos;s stated investment goals</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {investmentObjectives.map((objective, index) => (
                        <Badge key={index} variant="secondary" className="px-3 py-1">
                          <CheckCircle2 className="w-3 h-3 mr-2" />
                          {objective}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Return Goal */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Return Goal</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{returnGoal}</p>
                  </CardContent>
                </Card>

                {/* Liquidity Needs */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Liquidity Needs</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-start gap-3">
                      <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                      <p className="text-muted-foreground">{liquidityNeeds}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Advisor Notes */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Advisor Notes</CardTitle>
                    <CardDescription>Important considerations from the advisor</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {advisorNotes.map((note, index) => (
                      <div key={index} className="p-4 rounded-lg bg-muted/50 border-l-4 border-primary">
                        <h4 className="font-semibold text-foreground mb-2">{note.title}</h4>
                        <p className="text-sm text-muted-foreground">{note.content}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Benchmarks */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Performance Benchmarks</CardTitle>
                    <CardDescription>Indices used to measure portfolio performance</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Asset Class</TableHead>
                          <TableHead>Benchmark</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {benchmarks.map((benchmark, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{benchmark.assetClass}</TableCell>
                            <TableCell className="text-muted-foreground">{benchmark.benchmark}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Portfolio Profile */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Portfolio Profile</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 rounded-lg bg-primary/5 text-center">
                      <p className="text-sm text-muted-foreground mb-1">Strategy Type</p>
                      <p className="text-xl font-semibold text-primary">{targetAssetAllocation.portfolioProfile}</p>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Risk Tolerance</span>
                        <Badge className="bg-amber-100 text-amber-700">{riskTolerance}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Time Horizon</span>
                        <span className="text-sm font-medium">{timeHorizon}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Target Return</span>
                        <span className="text-sm font-medium">7-9% annually</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Allocation Pie Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Target Allocation</CardTitle>
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
                            formatter={(value: number) => [`${value}%`, ""]}
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
              </div>
            </div>
          </TabsContent>

          <TabsContent value="allocation" className="space-y-6">
            <div className="grid grid-cols-2 gap-8">
              {/* Allocation Table */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Strategic Asset Allocation</CardTitle>
                  <CardDescription>Target allocations and allowable ranges</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Asset Class</TableHead>
                        <TableHead className="text-right">Target</TableHead>
                        <TableHead className="text-right">Min</TableHead>
                        <TableHead className="text-right">Max</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {targetAssetAllocation.allocations.map((allocation, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: COLORS[index % COLORS.length] }}
                              />
                              {allocation.assetClass}
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-medium">{allocation.targetAllocation}%</TableCell>
                          <TableCell className="text-right text-muted-foreground">{allocation.allowableMin}%</TableCell>
                          <TableCell className="text-right text-muted-foreground">{allocation.allowableMax}%</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Allocation Range Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Allocation Ranges</CardTitle>
                  <CardDescription>Target allocation with allowable drift ranges</CardDescription>
                </CardHeader>
                <CardContent>
<div className="h-64 w-full min-h-0">
                      <ResponsiveContainer width="100%" height={256} minWidth={0}>
                      <BarChart data={rangeChartData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis type="number" domain={[0, 100]} stroke="#6b7280" fontSize={12} />
                        <YAxis dataKey="name" type="category" stroke="#6b7280" fontSize={12} width={100} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "white",
                            border: "1px solid #e5e7eb",
                            borderRadius: "8px",
                          }}
                          formatter={(value: number, name: string) => [`${value}%`, name === "target" ? "Target" : name]}
                        />
                        <Bar dataKey="target" fill="#3b82f6" name="Target" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Visual Allocation Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Allocation Breakdown with Ranges</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {targetAssetAllocation.allocations.map((allocation, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="font-medium">{allocation.assetClass}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {allocation.allowableMin}% - {allocation.allowableMax}%
                      </span>
                    </div>
                    <div className="relative h-4 bg-muted rounded-full overflow-hidden">
                      <div
                        className="absolute h-full bg-muted-foreground/20 rounded-full"
                        style={{
                          left: `${allocation.allowableMin}%`,
                          width: `${allocation.allowableMax - allocation.allowableMin}%`,
                        }}
                      />
                      <div
                        className="absolute h-full w-1 rounded-full"
                        style={{
                          left: `${allocation.targetAllocation}%`,
                          backgroundColor: COLORS[index % COLORS.length],
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-center mt-1">
                      <span className="text-xs text-muted-foreground">Target: {allocation.targetAllocation}%</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="accounts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Managed Accounts</CardTitle>
                <CardDescription>Accounts governed by this Investment Policy Statement</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {clientProfile.accounts.map((account, index) => (
                    <div key={index} className="flex items-center justify-between p-4 rounded-lg border border-border">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Building className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{account.accountName}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary">{account.accountType}</Badge>
                            <span className="text-sm text-muted-foreground">{account.institution}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-semibold text-foreground">
                          ${account.approximateValue.toLocaleString()}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {((account.approximateValue / clientProfile.totalPortfolioValue) * 100).toFixed(1)}% of portfolio
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground">Total Portfolio Value</span>
                    <span className="text-xl font-bold text-foreground">
                      ${clientProfile.totalPortfolioValue.toLocaleString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="json" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Extracted JSON Data</CardTitle>
                <CardDescription>Raw extracted data from the Investment Policy Statement document</CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="p-4 rounded-lg bg-muted text-sm overflow-auto max-h-[600px]">
                  {JSON.stringify(ipsData, null, 2)}
                </pre>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdvisorLayout>
  )
}
