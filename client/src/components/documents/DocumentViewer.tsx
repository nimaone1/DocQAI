import { useState, useEffect } from "react"
import { X, FileText, Download, Eye, Calendar, Database } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getDocumentContent, getDocumentChunks } from "@/api/documents"
import { useToast } from "@/hooks/useToast"

interface Document {
  _id: string
  name: string
  type: string
  size: number
  uploadedAt: string
  status: "processing" | "processed" | "error"
  processingProgress?: number
  chunks?: number
  errorMessage?: string
}

interface DocumentChunk {
  _id: string
  content: string
  chunkIndex: number
  metadata?: {
    page?: number
    section?: string
  }
}

interface DocumentViewerProps {
  document: Document
  onClose: () => void
}

export function DocumentViewer({ document, onClose }: DocumentViewerProps) {
  const { toast } = useToast()
  const [content, setContent] = useState<string>("")
  const [chunks, setChunks] = useState<DocumentChunk[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"content" | "chunks">("content")

  useEffect(() => {
    loadDocumentData()
  }, [document._id])

  const loadDocumentData = async () => {
    try {
      console.log("Loading document data for:", document._id)
      const [contentResponse, chunksResponse] = await Promise.all([
        getDocumentContent(document._id),
        getDocumentChunks(document._id)
      ])

      setContent(contentResponse.content)
      setChunks(chunksResponse.chunks)
    } catch (error) {
      console.error("Error loading document data:", error)
      toast({
        title: "Error",
        description: "Failed to load document content",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "processed": return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
      case "processing": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
      case "error": return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300"
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden bg-white dark:bg-gray-900">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-blue-600" />
              <span>{document.name}</span>
              <Badge className={getStatusColor(document.status)}>
                {document.status}
              </Badge>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Document Info */}
          <Card className="bg-gray-50 dark:bg-gray-800/50">
            <CardContent className="pt-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Type:</span>
                  <span className="font-medium">{document.type.toUpperCase()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Size:</span>
                  <span className="font-medium">{formatFileSize(document.size)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Uploaded:</span>
                  <span className="font-medium">{new Date(document.uploadedAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Chunks:</span>
                  <span className="font-medium">{document.chunks || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <div className="flex gap-2 border-b">
            <Button
              variant={activeTab === "content" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("content")}
              className={activeTab === "content" ? "bg-gradient-to-r from-blue-500 to-purple-600" : ""}
            >
              <FileText className="h-4 w-4 mr-2" />
              Content
            </Button>
            <Button
              variant={activeTab === "chunks" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("chunks")}
              className={activeTab === "chunks" ? "bg-gradient-to-r from-blue-500 to-purple-600" : ""}
            >
              <Database className="h-4 w-4 mr-2" />
              Chunks ({chunks.length})
            </Button>
          </div>

          {/* Content */}
          <div className="h-96">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <ScrollArea className="h-full">
                {activeTab === "content" ? (
                  <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    {content ? (
                      <pre className="whitespace-pre-wrap text-sm font-mono">{content}</pre>
                    ) : (
                      <p className="text-muted-foreground text-center py-8">
                        No content available for preview
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {chunks.length > 0 ? (
                      chunks.map((chunk, index) => (
                        <Card key={chunk._id} className="bg-gray-50 dark:bg-gray-800/50">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm flex items-center justify-between">
                              <span>Chunk {chunk.chunkIndex + 1}</span>
                              <div className="flex items-center gap-2">
                                {chunk.metadata?.page && (
                                  <Badge variant="outline" className="text-xs">
                                    Page {chunk.metadata.page}
                                  </Badge>
                                )}
                                {chunk.metadata?.section && (
                                  <Badge variant="outline" className="text-xs">
                                    {chunk.metadata.section}
                                  </Badge>
                                )}
                              </div>
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-muted-foreground line-clamp-4">
                              {chunk.content}
                            </p>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <p className="text-muted-foreground text-center py-8">
                        No chunks available
                      </p>
                    )}
                  </div>
                )}
              </ScrollArea>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}