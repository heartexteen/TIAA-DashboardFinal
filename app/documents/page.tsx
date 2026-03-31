"use client"

import { useState, useCallback, useEffect } from "react"
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useClient } from "@/lib/client-context"
import {
  FileText,
  Upload,
  Eye,
  Search,
  X,
  CheckCircle,
  AlertCircle,
  File,
  RefreshCcw,
  Loader2,
} from "lucide-react"

type S3Document = {
  fileName: string
  s3Key: string
  type: "IPS" | "RTQ" | "Estate" | "Other"
  status: "processed" | "pending"
}

export default function DocumentsPage() {
  const { selectedClientId, currentClient, refresh } = useClient()
  const [searchQuery, setSearchQuery] = useState("")
  const [documents, setDocuments] = useState<S3Document[]>([])
  const [loading, setLoading] = useState(true)
  const [viewingDocument, setViewingDocument] = useState<S3Document | null>(null)

  // Upload state
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadDocType, setUploadDocType] = useState<string>("ips")
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null)

  // Load documents from S3
  const loadDocuments = useCallback(async () => {
    if (!selectedClientId) return
    setLoading(true)
    try {
      const res = await fetch(`/api/documents/list?clientKey=${encodeURIComponent(selectedClientId)}`)
      const json = await res.json()
      if (json.documents) {
        setDocuments(json.documents)
      }
    } catch {
      setDocuments([])
    } finally {
      setLoading(false)
    }
  }, [selectedClientId])

  useEffect(() => {
    loadDocuments()
  }, [loadDocuments])

  const filteredDocuments = documents.filter((doc) =>
    doc.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.type.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getStatusBadge = (status: string) => {
    if (status === "processed") {
      return (
        <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
          <CheckCircle className="w-3 h-3 mr-1" />
          Processed
        </Badge>
      )
    }
    return (
      <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
        <AlertCircle className="w-3 h-3 mr-1" />
        Pending
      </Badge>
    )
  }

  const getTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      IPS: "bg-primary/10 text-primary border-primary/20",
      RTQ: "bg-blue-500/10 text-blue-600 border-blue-500/20",
      Estate: "bg-purple-500/10 text-purple-600 border-purple-500/20",
      Other: "bg-gray-500/10 text-gray-600 border-gray-500/20",
    }
    return (
      <Badge variant="outline" className={colors[type] || colors.Other}>
        {type}
      </Badge>
    )
  }

  const handleUpload = async (file: File) => {
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setUploadError("Only PDF files are accepted.")
      return
    }

    setUploading(true)
    setUploadError(null)
    setUploadSuccess(null)

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("clientKey", selectedClientId)
      formData.append("docType", uploadDocType)

      const res = await fetch("/api/documents/upload", {
        method: "POST",
        body: formData,
      })

      const json = await res.json()
      if (!res.ok || !json.ok) {
        throw new Error(json.error || "Upload failed")
      }

      setUploadSuccess(`Uploaded ${file.name} and extracted successfully.`)
      await loadDocuments()
      refresh()
    } catch (err: any) {
      setUploadError(err?.message || "Upload failed")
    } finally {
      setUploading(false)
    }
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
    if (files[0]) handleUpload(files[0])
  }, [selectedClientId, uploadDocType])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      handleUpload(e.target.files[0])
      e.target.value = ""
    }
  }, [selectedClientId, uploadDocType])

  // Map doc type to local PDF path for viewing
  const getLocalPdfPath = (doc: S3Document) => {
    // Check if we have local copies in /documents/
    const name = doc.fileName
    if (name.includes("IPS") || name.includes("RTQ") || name.includes("Estate") || name.includes("Trust")) {
      return `/documents/${name}`
    }
    return null
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
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={loadDocuments}
              disabled={loading}
            >
              <RefreshCcw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Upload Area */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Upload Document</CardTitle>
            <CardDescription>
              Upload a PDF document (IPS, RTQ, or Estate) to extract and update the dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-4">
              <label className="text-sm font-medium text-foreground">Document Type:</label>
              <Select value={uploadDocType} onValueChange={setUploadDocType}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ips">Investment Policy Statement</SelectItem>
                  <SelectItem value="rtq">Risk Tolerance Questionnaire</SelectItem>
                  <SelectItem value="estate">Estate Planning Worksheet</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`
                relative border-2 border-dashed rounded-lg p-8 text-center transition-colors
                ${uploading ? "border-primary bg-primary/5 pointer-events-none" : ""}
                ${isDragging
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50 hover:bg-muted/50"
                }
              `}
            >
              {!uploading && (
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileInput}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              )}
              {uploading ? (
                <>
                  <Loader2 className="w-10 h-10 mx-auto mb-4 text-primary animate-spin" />
                  <p className="text-sm font-medium text-foreground mb-1">
                    Uploading and extracting...
                  </p>
                  <p className="text-xs text-muted-foreground">
                    This may take 15-30 seconds
                  </p>
                </>
              ) : (
                <>
                  <Upload className={`w-10 h-10 mx-auto mb-4 ${isDragging ? "text-primary" : "text-muted-foreground"}`} />
                  <p className="text-sm font-medium text-foreground mb-1">
                    {isDragging ? "Drop PDF here" : "Drag and drop a PDF here"}
                  </p>
                  <p className="text-xs text-muted-foreground mb-4">
                    or click to browse
                  </p>
                  <Badge variant="secondary">PDF only</Badge>
                </>
              )}
            </div>

            {uploadError && (
              <p className="mt-3 text-sm text-red-600 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {uploadError}
              </p>
            )}
            {uploadSuccess && (
              <p className="mt-3 text-sm text-green-600 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                {uploadSuccess}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Documents Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Client Documents</CardTitle>
            <CardDescription>
              {loading ? "Loading..." : `${filteredDocuments.length} document${filteredDocuments.length !== 1 ? "s" : ""} in S3`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Document</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      Loading documents from S3...
                    </TableCell>
                  </TableRow>
                ) : filteredDocuments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      No documents found. Upload a PDF to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDocuments.map((doc) => (
                    <TableRow key={doc.s3Key}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                            <FileText className="w-5 h-5 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-medium">{doc.fileName}</p>
                            <p className="text-xs text-muted-foreground truncate max-w-xs">
                              {doc.s3Key}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getTypeBadge(doc.type)}</TableCell>
                      <TableCell>{getStatusBadge(doc.status)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1"
                          onClick={() => setViewingDocument(doc)}
                          disabled={!getLocalPdfPath(doc)}
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </Button>
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
              {viewingDocument?.fileName}
            </DialogTitle>
            <DialogDescription>
              {viewingDocument?.type} document for {currentClient.name}
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 min-h-0">
            {viewingDocument && getLocalPdfPath(viewingDocument) ? (
              <iframe
                src={getLocalPdfPath(viewingDocument)!}
                className="w-full h-full rounded-lg border"
                title={viewingDocument.fileName}
              />
            ) : (
              <div className="flex items-center justify-center h-full bg-muted rounded-lg">
                <div className="text-center">
                  <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    Document preview not available locally
                  </p>
                </div>
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2 pt-4">
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
