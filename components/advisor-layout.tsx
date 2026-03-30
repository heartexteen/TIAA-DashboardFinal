"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  Search,
  Bell,
  Home,
  Users,
	  FileText,
	  MessageSquare,
	  ChevronDown,
	  ChevronRight,
	  LogOut,
	  User,
	  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { useClient } from "@/lib/client-context"
import { cn } from "@/lib/utils"

interface AdvisorLayoutProps {
  children: React.ReactNode
}

	// Global navigation (top bar) - pages that involve multiple clients
	const globalNavigation = [
	  { name: "Clients", href: "/clients", icon: Users },
	]

// Client-specific navigation (sidebar) - pages for selected client
const clientNavigation = [
  { name: "Overview", href: "/", icon: Home },
  { name: "All Documents", href: "/documents", icon: FileText },
]

const documentNavigation = [
  { name: "IPS Dashboard", href: "/client/ips" },
  { name: "RTQ Dashboard", href: "/client/rtq" },
  { name: "Estate Dashboard", href: "/client/estate" },
]

export function AdvisorLayout({ children }: AdvisorLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { clients, selectedClientId, setSelectedClientId, currentClient } = useClient()
  const [clientSearch, setClientSearch] = useState("")
  const [documentsOpen, setDocumentsOpen] = useState(true)
  
  const alertCount = currentClient.alerts.filter((a) => a.priority === "high").length

  // Filter clients based on search
  const filteredClients = useMemo(() => {
    if (!clientSearch.trim()) return clients
    const searchLower = clientSearch.toLowerCase()
    return clients.filter((client) =>
      client.name.toLowerCase().includes(searchLower) ||
      client.email.toLowerCase().includes(searchLower)
    )
  }, [clientSearch, clients])

  const handleClientChange = (clientId: string) => {
    setSelectedClientId(clientId)
    if (pathname === "/clients") {
      router.push("/")
    }
  }

  // Check if current page is a global page (doesn't need client context)
  const isGlobalPage = pathname === "/clients" || pathname === "/analytics" || pathname === "/settings"

  // Check if we're on a documents page
  const isDocumentsPage = pathname.startsWith("/client/")

  return (
    <div className="min-h-screen bg-background">
	      {/* Top Navigation Bar */}
	      <header className="h-16 border-b border-border bg-background px-6 flex items-center justify-between sticky top-0 z-50">
	        <div className="flex items-center gap-4">
	          {/* Logo */}
	          <Link href="/" className="flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-ring rounded-md">
	            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
	              <span className="text-primary-foreground font-bold text-sm">WA</span>
	            </div>
	            <span className="font-semibold text-foreground">Wealth Advisor</span>
	          </Link>
	          
	          <div className="h-6 w-px bg-border mx-2" />
          
          {/* Client Selector with Search */}
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2 min-w-[200px] justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar className="w-6 h-6">
                      <AvatarFallback className="text-xs bg-primary/10 text-primary">
                        {currentClient.name.split(" ").map((n) => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{currentClient.name}</span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-[280px]">
                <div className="p-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Search clients..."
                      value={clientSearch}
                      onChange={(e) => setClientSearch(e.target.value)}
                      className="pl-9 h-9 text-sm"
                    />
                    {clientSearch && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1/2 transform -translate-y-1/2 w-6 h-6"
                        onClick={() => setClientSearch("")}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </div>
                <DropdownMenuSeparator />
                <div className="max-h-[300px] overflow-y-auto">
                  {filteredClients.length === 0 ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      No clients found
                    </div>
                  ) : (
                    filteredClients.map((client) => (
                      <DropdownMenuItem
                        key={client.id}
                        onClick={() => {
                          handleClientChange(client.id)
                          setClientSearch("")
                        }}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <Avatar className="w-6 h-6">
                          <AvatarFallback className="text-xs">
                            {client.name.split(" ").map((n) => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{client.name}</p>
                          <p className="text-xs text-muted-foreground">
                            ${(client.totalAssets / 1000000).toFixed(1)}M AUM
                          </p>
                        </div>
                        {client.id === selectedClientId && (
                          <Badge variant="secondary" className="text-xs shrink-0">Current</Badge>
                        )}
                      </DropdownMenuItem>
                    ))
                  )}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

          </div>

          <div className="h-6 w-px bg-border mx-2" />

          {/* Global Navigation Links */}
          <nav className="flex items-center gap-1">
            {globalNavigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-4 h-4" />
            {alertCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground rounded-full text-xs flex items-center justify-center">
                {alertCount}
              </span>
            )}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Avatar className="w-8 h-8">
                  <AvatarImage src="/placeholder-user.jpg" />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>James Davidson</DropdownMenuLabel>
              <p className="px-2 pb-2 text-xs text-muted-foreground">Senior Wealth Advisor</p>
              <DropdownMenuSeparator />
	              <DropdownMenuItem>
	                <User className="w-4 h-4 mr-2" />
	                Profile
	              </DropdownMenuItem>
	              <DropdownMenuSeparator />
	              <DropdownMenuItem className="text-destructive">
	                <LogOut className="w-4 h-4 mr-2" />
	                Sign out
	              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <div className="flex">
        {/* Left Sidebar - Client-Specific Navigation */}
        {!isGlobalPage && (
          <aside className="w-60 border-r border-border bg-background h-[calc(100vh-4rem)] overflow-y-auto sticky top-16">
            <div className="p-4">
              {/* Client Context Header */}
              <div className="mb-6 p-3 bg-muted/50 rounded-lg">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                  Viewing Client
                </p>
                <p className="font-semibold text-foreground">{currentClient.name}</p>
                <p className="text-xs text-muted-foreground">
                  ${(currentClient.totalAssets / 1000000).toFixed(2)}M AUM
                </p>
              </div>

              {/* Client Navigation */}
              <nav className="space-y-1">
                {clientNavigation.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        "flex items-center w-full justify-start px-3 py-2 rounded-md text-sm font-medium transition-colors",
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <item.icon className="w-4 h-4 mr-3" />
                      {item.name}
                    </Link>
                  )
                })}

                {/* Documents Section - Collapsible */}
                <Collapsible open={documentsOpen} onOpenChange={setDocumentsOpen}>
                  <CollapsibleTrigger asChild>
                    <button
                      className={cn(
                        "flex items-center w-full justify-start px-3 py-2 rounded-md text-sm font-medium transition-colors",
                        isDocumentsPage
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <FileText className="w-4 h-4 mr-3" />
                      Documents
                      <ChevronRight className={cn(
                        "w-4 h-4 ml-auto transition-transform",
                        documentsOpen && "rotate-90"
                      )} />
                    </button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pl-7 mt-1 space-y-1">
                    {documentNavigation.map((item) => {
                      const isActive = pathname === item.href
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          className={cn(
                            "flex items-center w-full justify-start px-3 py-2 rounded-md text-sm transition-colors",
                            isActive
                              ? "bg-primary/10 text-primary font-medium"
                              : "text-muted-foreground hover:bg-muted hover:text-foreground"
                          )}
                        >
                          {item.name}
                        </Link>
                      )
                    })}
                  </CollapsibleContent>
                </Collapsible>

                {/* AI Assistant */}
                <Link
                  href="/assistant"
                  className={cn(
                    "flex items-center w-full justify-start px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    pathname === "/assistant"
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <MessageSquare className="w-4 h-4 mr-3" />
                  AI Assistant
                </Link>
              </nav>

              {/* Alerts Summary */}
              {alertCount > 0 && (
                <div className="mt-8 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <p className="text-xs font-semibold text-destructive uppercase tracking-wider mb-2">
                    {alertCount} High Priority Alert{alertCount > 1 ? "s" : ""}
                  </p>
                  <div className="space-y-2">
                    {currentClient.alerts
                      .filter((a) => a.priority === "high")
                      .slice(0, 2)
                      .map((alert) => (
                        <p key={alert.id} className="text-xs text-muted-foreground line-clamp-2">
                          {alert.title}
                        </p>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </aside>
        )}

        {/* Main Content */}
        <main className={cn(
          "flex-1 p-8 bg-muted/30 min-h-[calc(100vh-4rem)]",
          isGlobalPage && "max-w-7xl mx-auto"
        )}>
          {children}
        </main>
      </div>
    </div>
  )
}
