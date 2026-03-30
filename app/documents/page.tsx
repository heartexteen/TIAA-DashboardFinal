"use client"

import { useState, useCallback } from "react"
import { AdvisorLayout } from "@/components/advisor-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useClient } from "@/lib/client-context"
import type { Document } from "@/lib/domain/types"
import {
  FileText,
  Upload,
  Eye,
  Download,
  MoreHorizontal,
  Search,
  X,
  CheckCircle,
  Clock,
  AlertCircle,
  File,
} from "lucide-react"

export default function DocumentsPage() {
  const { currentClient } = useClient()
  const [searchQuery, setSearchQuery] = useState("")
  const [viewingDocument, setViewingDocument] = useState<Document | null>(null)
  const [uploadedFiles, setUploadedFiles] = useState<Document[]>([])
  const [isDragging, setIsDragging] = useState(false)

  // Combine existing documents with uploaded ones
  const allDocuments = [...(currentClient.documents || []), ...uploadedFiles]

  // Filter documents based on search
  const filteredDocuments = allDocuments.filter((doc) =>
    doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.type.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getStatusBadge = (status: Document["status"]) => {
    switch (status) {
      case "processed":
        return (
          <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
            <CheckCircle className="w-3 h-3 mr-1" />
            Processed
          </Badge>
        )
      case "processing":
        return (
          <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20">
            <Clock className="w-3 h-3 mr-1" />
            Processing
          </Badge>
        )
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
            <AlertCircle className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        )
    }
  }

  const getTypeBadge = (type: Document["type"]) => {
    const colors: Record<Document["type"], string> = {
      IPS: "bg-primary/10 text-primary border-primary/20",
      RTQ: "bg-blue-500/10 text-blue-600 border-blue-500/20",
      Estate: "bg-purple-500/10 text-purple-600 border-purple-500/20",
      Tax: "bg-green-500/10 text-green-600 border-green-500/20",
      Other: "bg-gray-500/10 text-gray-600 border-gray-500/20",
    }
    return (
      <Badge variant="outline" className={colors[type]}>
        {type}
      </Badge>
    )
  }

  const handleViewDocument = (doc: Document) => {
    setViewingDocument(doc)
  }

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const files = Array.from(e.dataTransfer.files)
    handleFiles(files)
  }, [])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      handleFiles(files)
    }
  }, [])

  const handleFiles = (files: File[]) => {
    const validExtensions = [".pdf", ".docx", ".txt"]
    const validFiles = files.filter((file) => {
      const ext = "." + file.name.split(".").pop()?.toLowerCase()
      return validExtensions.includes(ext)
    })

    if (validFiles.length === 0) {
      alert("Please upload PDF, DOCX, or TXT files only.")
      return
    }

    const newDocuments: Document[] = validFiles.map((file, index) => ({
      id: `upload-${Date.now()}-${index}`,
      name: file.name.replace(/\.[^/.]+$/, ""),
      type: "Other" as const,
      uploadedAt: new Date().toISOString().split("T")[0],
      status: "processing" as const,
    }))

    setUploadedFiles((prev) => [...prev, ...newDocuments])

    // Simulate processing completion after 3 seconds
    setTimeout(() => {
      setUploadedFiles((prev) =>
        prev.map((doc) =>
          newDocuments.some((nd) => nd.id === doc.id)
            ? { ...doc, status: "processed" as const }
            : doc
        )
      )
    }, 3000)
  }

  return (
    <AdvisorLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Documents</h1>
            <p className="text-muted-foreground">
              Manage documents for {currentClient.name}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          </div>
        </div>

        {/* Upload Area */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Upload Documents</CardTitle>
            <CardDescription>
              Upload PDF, DOCX, or TXT files for processing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`
                relative border-2 border-dashed rounded-lg p-8 text-center transition-colors
                ${isDragging 
                  ? "border-primary bg-primary/5" 
                  : "border-border hover:border-primary/50 hover:bg-muted/50"
                }
              `}
            >
              <input
                type="file"
                accept=".pdf,.docx,.txt"
                multiple
                onChange={handleFileInput}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Upload className={`w-10 h-10 mx-auto mb-4 ${isDragging ? "text-primary" : "text-muted-foreground"}`} />
              <p className="text-sm font-medium text-foreground mb-1">
                {isDragging ? "Drop files here" : "Drag and drop files here"}
              </p>
              <p className="text-xs text-muted-foreground mb-4">
                or click to browse
              </p>
              <div className="flex items-center justify-center gap-2">
                <Badge variant="secondary">PDF</Badge>
                <Badge variant="secondary">DOCX</Badge>
                <Badge variant="secondary">TXT</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Documents Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Client Documents</CardTitle>
            <CardDescription>
              {filteredDocuments.length} document{filteredDocuments.length !== 1 ? "s" : ""} found
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Document</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Uploaded</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDocuments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No documents found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDocuments.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                            <FileText className="w-5 h-5 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-medium">{doc.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {doc.id}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getTypeBadge(doc.type)}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(doc.uploadedAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </TableCell>
                      <TableCell>{getStatusBadge(doc.status)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleViewDocument(doc)}
                              disabled={!doc.pdfPath}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View Original
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              disabled={!doc.pdfPath}
                              onClick={() => {
                                if (doc.pdfPath) {
                                  window.open(doc.pdfPath, "_blank")
                                }
                              }}
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Download
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Document Viewer Modal */}
      <Dialog open={!!viewingDocument} onOpenChange={() => setViewingDocument(null)}>
        <DialogContent className="max-w-5xl h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <File className="w-5 h-5" />
              {viewingDocument?.name}
            </DialogTitle>
            <DialogDescription>
              Original document uploaded on{" "}
              {viewingDocument && new Date(viewingDocument.uploadedAt).toLocaleDateString()}
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 min-h-0">
            {viewingDocument?.pdfPath ? (
              <iframe
                src={viewingDocument.pdfPath}
                className="w-full h-full rounded-lg border"
                title={viewingDocument.name}
              />
            ) : (
              <div className="flex items-center justify-center h-full bg-muted rounded-lg">
                <div className="text-center">
                  <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    No original document available
                  </p>
                </div>
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2 pt-4">
            {viewingDocument?.pdfPath && (
              <Button
                variant="outline"
                onClick={() => window.open(viewingDocument.pdfPath, "_blank")}
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            )}
            <Button variant="outline" onClick={() => setViewingDocument(null)}>
              <X className="w-4 h-4 mr-2" />
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AdvisorLayout>
  )
}
