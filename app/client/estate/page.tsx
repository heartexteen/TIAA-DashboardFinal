"use client"

import {
  FileText,
  Download,
  User,
  Users,
  Building,
  ChevronRight,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Clock,
  AlertCircle,
  FileCheck,
  Shield,
  DollarSign,
  Scale,
  Heart,
  Briefcase,
} from "lucide-react"
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
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

export default function EstateDashboard() {
  const { estateData, ipsData, currentClient } = useClient()
  const { personalInformation, powerOfAttorney, beneficiaries, taxExemption, assetsAndRecipients, trusteeDuties, documentsNeeded, actionItems } = estateData as typeof estateData & { trusteeDuties?: string[], documentsNeeded?: Array<{ name: string, status: string }> }

  // Calculate completion stats
  const totalDocs = documentsNeeded.length
  const completedDocs = documentsNeeded.filter((d) => d.status === "complete").length
  const completionPercent = Math.round((completedDocs / totalDocs) * 100)

  const totalActions = actionItems.length
  const completedActions = actionItems.filter((a) => a.status === "Complete").length

  // Prepare asset chart data
  const assetChartData = assetsAndRecipients.map((a) => ({
    name: a.asset.split(" ").slice(-2).join(" "),
    value: a.value,
  }))

  const totalAssets = assetsAndRecipients.reduce((sum, a) => sum + a.value, 0)

  // Count action required items
  const actionRequiredCount = assetsAndRecipients.filter((a) => a.status === "action_required").length

  return (
    <AdvisorLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <Link href="/" className="hover:text-foreground">Overview</Link>
              <ChevronRight className="w-4 h-4" />
              <span className="text-foreground">Estate Planning</span>
            </div>
            <h1 className="text-2xl font-semibold text-foreground">Estate Planning Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              {personalInformation.name} - Estate Planning Worksheet Analysis
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              className="gap-2"
              onClick={() => window.open("/documents/Carina_Estate.pdf", "_blank")}
            >
              <ExternalLink className="w-4 h-4" />
              View Original
            </Button>
            <Button 
              variant="outline" 
              className="gap-2"
              asChild
            >
              <a href="/documents/Carina_Estate.pdf" download>
                <Download className="w-4 h-4" />
                Export PDF
              </a>
            </Button>
          </div>
        </div>

        {/* Alert Banner */}
        {actionRequiredCount > 0 && (
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">
                    {actionRequiredCount} Assets Require Beneficiary Designations
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Critical estate planning documents are incomplete. Beneficiary designations should be updated for IRA accounts and brokerage accounts.
                  </p>
                </div>
                <Button variant="outline" size="sm" className="border-amber-300 text-amber-700 hover:bg-amber-100">
                  Review Action Items
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

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
                ${(totalAssets / 1000000).toFixed(2)}M
              </div>
              <div className="text-sm text-muted-foreground">Total Estate Value</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                  <FileCheck className="w-5 h-5 text-amber-600" />
                </div>
              </div>
              <div className="text-2xl font-semibold text-foreground mb-1">{completionPercent}%</div>
              <div className="text-sm text-muted-foreground">Documents Complete</div>
              <Progress value={completionPercent} className="mt-2 h-2" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                </div>
              </div>
              <div className="text-2xl font-semibold text-foreground mb-1">{actionRequiredCount}</div>
              <div className="text-sm text-muted-foreground">Actions Required</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-green-600" />
                </div>
              </div>
              <div className="text-2xl font-semibold text-foreground mb-1">No Tax</div>
              <div className="text-sm text-muted-foreground">Estate Tax Concern</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="assets">Assets & Recipients</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="actions">Action Items</TabsTrigger>
            <TabsTrigger value="json">JSON Data</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-3 gap-8">
              {/* Left Column */}
              <div className="col-span-2 space-y-6">
                {/* Personal Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Personal Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{personalInformation.name}</p>
                          <p className="text-sm text-muted-foreground">{personalInformation.maritalStatus}</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">State of Residence</span>
                          <span className="font-medium">{personalInformation.stateOfResidence}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Children</span>
                          <span className="font-medium">{personalInformation.children.length || "None"}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Power of Attorney */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Power of Attorney</CardTitle>
                    <CardDescription>Designated agents for financial matters</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-4 p-4 rounded-lg bg-amber-50 border border-amber-200">
                      <AlertTriangle className="w-5 h-5 text-amber-600" />
                      <div className="flex-1">
                        <p className="font-medium text-foreground">Primary Agent</p>
                        <p className="text-sm text-muted-foreground">{powerOfAttorney.primary}</p>
                      </div>
                      <Badge variant="secondary" className="bg-amber-100 text-amber-700">Pending</Badge>
                    </div>
                    <div className="flex items-center gap-4 p-4 rounded-lg bg-amber-50 border border-amber-200">
                      <AlertTriangle className="w-5 h-5 text-amber-600" />
                      <div className="flex-1">
                        <p className="font-medium text-foreground">Alternate Agent</p>
                        <p className="text-sm text-muted-foreground">{powerOfAttorney.alternate}</p>
                      </div>
                      <Badge variant="secondary" className="bg-amber-100 text-amber-700">Pending</Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Beneficiaries */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Beneficiaries</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-foreground">No Beneficiaries Designated</p>
                          <p className="text-sm text-muted-foreground mt-1">{beneficiaries.qualified}</p>
                          <p className="text-sm text-muted-foreground mt-2">
                            Client should designate primary and contingent beneficiaries for all accounts.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Tax Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Tax Considerations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-foreground">No Federal Estate Tax Concern</p>
                          <p className="text-sm text-muted-foreground mt-1">{taxExemption}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Trustee Duties */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Trustee&apos;s Basic Duties</CardTitle>
                    <CardDescription>Responsibilities when establishing a trust</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {trusteeDuties.map((duty, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <CheckCircle2 className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-1" />
                          <span className="text-sm text-muted-foreground">{duty}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Estate Value Breakdown */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Estate Value Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-48 w-full min-h-0">
                      <ResponsiveContainer width="100%" height={192} minWidth={0}>
                        <RechartsPieChart>
                          <Pie
                            data={assetChartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={70}
                            paddingAngle={2}
                            dataKey="value"
                          >
                            {assetChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                        </RechartsPieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="space-y-2 mt-4">
                      {assetChartData.map((item, index) => (
                        <div key={item.name} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: COLORS[index % COLORS.length] }}
                            />
                            <span className="text-sm text-muted-foreground">{item.name}</span>
                          </div>
                          <span className="text-sm font-medium">${(item.value / 1000).toFixed(0)}K</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 pt-4 border-t border-border">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Total</span>
                        <span className="font-semibold">${totalAssets.toLocaleString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Document Completion */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Document Status</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center p-4 rounded-lg bg-muted/50">
                      <div className="text-3xl font-bold text-foreground">{completedDocs}/{totalDocs}</div>
                      <p className="text-sm text-muted-foreground">Documents Complete</p>
                    </div>
                    <Progress value={completionPercent} className="h-3" />
                    <div className="space-y-2">
                      {documentsNeeded.filter((d) => d.priority === "High").slice(0, 4).map((doc, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">{doc.document}</span>
                          <Badge
                            variant="secondary"
                            className={
                              doc.status === "complete"
                                ? "bg-green-100 text-green-700"
                                : "bg-amber-100 text-amber-700"
                            }
                          >
                            {doc.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Stats */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Quick Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Total Assets</span>
                      <span className="font-medium">{assetsAndRecipients.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Action Required</span>
                      <Badge variant="destructive">{actionRequiredCount}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Pending Actions</span>
                      <Badge variant="secondary">{totalActions - completedActions}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">High Priority Docs</span>
                      <span className="font-medium">{documentsNeeded.filter((d) => d.priority === "High").length}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="assets" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Assets & Recipients</CardTitle>
                <CardDescription>Estate assets and their designated recipients</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {assetsAndRecipients.map((asset, index) => (
                    <div key={index} className="flex items-center justify-between p-4 rounded-lg border border-border">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Building className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{asset.asset}</p>
                          <p className="text-sm text-muted-foreground">{asset.recipient}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-semibold text-foreground">
                          ${asset.value.toLocaleString()}
                        </p>
                        <Badge
                          variant="secondary"
                          className={
                            asset.status === "complete"
                              ? "bg-green-100 text-green-700"
                              : asset.status === "action_required"
                                ? "bg-red-100 text-red-700"
                                : "bg-amber-100 text-amber-700"
                          }
                        >
                          {asset.status === "action_required" ? "Action Required" : asset.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground">Total Estate Value</span>
                    <span className="text-xl font-bold text-foreground">
                      ${totalAssets.toLocaleString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Required Documents</CardTitle>
                <CardDescription>Estate planning documents and their completion status</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Document</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {documentsNeeded.map((doc, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-muted-foreground" />
                            {doc.document}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={
                              doc.priority === "High"
                                ? "bg-red-100 text-red-700"
                                : "bg-blue-100 text-blue-700"
                            }
                          >
                            {doc.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={
                              doc.status === "complete"
                                ? "bg-green-100 text-green-700"
                                : "bg-amber-100 text-amber-700"
                            }
                          >
                            {doc.status === "complete" ? (
                              <><CheckCircle2 className="w-3 h-3 mr-1" /> Complete</>
                            ) : (
                              <><Clock className="w-3 h-3 mr-1" /> Pending</>
                            )}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="actions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Action Items</CardTitle>
                <CardDescription>Tasks to complete before attorney appointment</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {actionItems.map((item) => (
                    <div key={item.id} className="flex items-start gap-4 p-4 rounded-lg border border-border">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-medium">{item.id}</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{item.action}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Responsible: {item.responsible}
                        </p>
                      </div>
                      <Badge
                        variant="secondary"
                        className={
                          item.status === "Complete"
                            ? "bg-green-100 text-green-700"
                            : item.status === "Scheduled"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-amber-100 text-amber-700"
                        }
                      >
                        {item.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="json" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Extracted JSON Data</CardTitle>
                <CardDescription>Raw extracted data from the Estate Planning Worksheet</CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="p-4 rounded-lg bg-muted text-sm overflow-auto max-h-[600px]">
                  {JSON.stringify(estateData, null, 2)}
                </pre>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdvisorLayout>
  )
}
