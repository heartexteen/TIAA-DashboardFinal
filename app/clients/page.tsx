"use client"

import {
  Search,
  Plus,
  Filter,
  MoreHorizontal,
  FileText,
  Calendar,
  AlertTriangle,
  ChevronRight,
  User,
  DollarSign,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { AdvisorLayout } from "@/components/advisor-layout"
import { clients } from "@/lib/mock-data"
import Link from "next/link"

export default function ClientsPage() {
  const totalAUM = clients.reduce((sum, c) => sum + c.totalAssets, 0)
  const activeClients = clients.filter((c) => c.status === "active").length
  const alertCount = clients.reduce((sum, c) => sum + c.alerts.filter((a) => a.priority === "high").length, 0)

  return (
    <AdvisorLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Client Management</h1>
            <p className="text-muted-foreground mt-1">
              Manage your client portfolio and access client documents
            </p>
          </div>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Add Client
          </Button>
        </div>

        {/* Summary Metrics */}
        <div className="grid grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <User className="w-5 h-5 text-primary" />
                </div>
              </div>
              <div className="text-2xl font-semibold text-foreground mb-1">{clients.length}</div>
              <div className="text-sm text-muted-foreground">Total Clients</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-green-600" />
                </div>
              </div>
              <div className="text-2xl font-semibold text-foreground mb-1">
                ${(totalAUM / 1000000).toFixed(2)}M
              </div>
              <div className="text-sm text-muted-foreground">Total AUM</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <div className="text-2xl font-semibold text-foreground mb-1">{activeClients}</div>
              <div className="text-sm text-muted-foreground">Active Clients</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
              </div>
              <div className="text-2xl font-semibold text-foreground mb-1">{alertCount}</div>
              <div className="text-sm text-muted-foreground">High Priority Alerts</div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input placeholder="Search clients..." className="pl-10" />
          </div>
          <Button variant="outline" className="gap-2">
            <Filter className="w-4 h-4" />
            Filter
          </Button>
        </div>

        {/* Client List */}
        <Card>
          <CardHeader>
            <CardTitle>All Clients</CardTitle>
            <CardDescription>Click on a client to view their detailed profile</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>AUM</TableHead>
                  <TableHead>Documents</TableHead>
                  <TableHead>Alerts</TableHead>
                  <TableHead>Next Meeting</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients.map((client) => (
                  <TableRow key={client.id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell>
                      <Link href="/" className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {client.name.split(" ").map((n) => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-foreground">{client.name}</p>
                          <p className="text-sm text-muted-foreground">{client.email}</p>
                        </div>
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={
                          client.status === "active"
                            ? "bg-green-100 text-green-700"
                            : client.status === "pending"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-gray-100 text-gray-700"
                        }
                      >
                        {client.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      ${(client.totalAssets / 1000000).toFixed(2)}M
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <FileText className="w-4 h-4 text-muted-foreground" />
                        <span>{client.documents.length}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {client.alerts.filter((a) => a.priority === "high").length > 0 ? (
                        <Badge variant="destructive">
                          {client.alerts.filter((a) => a.priority === "high").length} High
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">None</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        {new Date(client.nextMeeting).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>View Profile</DropdownMenuItem>
                          <DropdownMenuItem>View Documents</DropdownMenuItem>
                          <DropdownMenuItem>Schedule Meeting</DropdownMenuItem>
                          <DropdownMenuItem>Send Message</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Client Cards (Alternative View) */}
        <div className="grid grid-cols-3 gap-6">
          {clients.map((client) => (
            <Link key={client.id} href="/">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-12 h-12">
                        <AvatarFallback className="bg-primary/10 text-primary text-lg">
                          {client.name.split(" ").map((n) => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-foreground">{client.name}</p>
                        <p className="text-sm text-muted-foreground">{client.advisor}</p>
                      </div>
                    </div>
                    <Badge
                      variant="secondary"
                      className={
                        client.status === "active"
                          ? "bg-green-100 text-green-700"
                          : client.status === "pending"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-gray-100 text-gray-700"
                      }
                    >
                      {client.status}
                    </Badge>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Total AUM</span>
                      <span className="font-semibold">${(client.totalAssets / 1000000).toFixed(2)}M</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Documents</span>
                      <span className="font-medium">{client.documents.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Next Meeting</span>
                      <span className="text-sm">
                        {new Date(client.nextMeeting).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  </div>

                  {client.alerts.filter((a) => a.priority === "high").length > 0 && (
                    <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-600" />
                        <span className="text-sm text-red-700">
                          {client.alerts.filter((a) => a.priority === "high").length} high priority alert(s)
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="mt-4 flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">View Profile</span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </AdvisorLayout>
  )
}
