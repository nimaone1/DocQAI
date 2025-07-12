import { useState, useCallback } from "react"
import { Upload, X, FileText, AlertCircle, CheckCircle } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { uploadDocument } from "@/api/documents"
import { useToast } from "@/hooks/useToast"

interface DocumentUploadProps {
  onClose: () => void
  onUploadComplete: () => void
}

interface UploadFile {
  file: File
  id: string
  status: "pending" | "uploading" | "processing" | "completed" | "error"
  progress: number
  error?: string
}

export function DocumentUpload({ onClose, onUploadComplete }: DocumentUploadProps) {
  const { toast } = useToast()
  const [files, setFiles] = useState<UploadFile[]>([])
  const [dragActive, setDragActive] = useState(false)

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const droppedFiles = Array.from(e.dataTransfer.files)
    addFiles(droppedFiles)
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files)
      addFiles(selectedFiles)
    }
  }

  const addFiles = (newFiles: File[]) => {
    const validTypes = ['.pdf', '.txt', '.docx', '.doc', '.rtf']
    const maxSize = 50 * 1024 * 1024 // 50MB

    const processedFiles = newFiles
      .filter(file => {
        const extension = '.' + file.name.split('.').pop()?.toLowerCase()
        if (!validTypes.includes(extension)) {
          toast({
            title: "Invalid file type",
            description: `${file.name} is not a supported file type`,
            variant: "destructive",
          })
          return false
        }
        if (file.size > maxSize) {
          toast({
            title: "File too large",
            description: `${file.name} exceeds the 50MB limit`,
            variant: "destructive",
          })
          return false
        }
        return true
      })
      .map(file => ({
        file,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        status: "pending" as const,
        progress: 0,
      }))

    setFiles(prev => [...prev, ...processedFiles])
  }

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id))
  }

  const uploadFiles = async () => {
    const pendingFiles = files.filter(f => f.status === "pending")
    
    for (const uploadFile of pendingFiles) {
      try {
        console.log("Uploading file:", uploadFile.file.name)
        
        // Update status to uploading
        setFiles(prev => prev.map(f => 
          f.id === uploadFile.id 
            ? { ...f, status: "uploading", progress: 0 }
            : f
        ))

        // Create FormData
        const formData = new FormData()
        formData.append('document', uploadFile.file)

        // Upload with progress tracking
        await uploadDocument(formData, (progress) => {
          setFiles(prev => prev.map(f => 
            f.id === uploadFile.id 
              ? { ...f, progress }
              : f
          ))
        })

        // Mark as processing
        setFiles(prev => prev.map(f => 
          f.id === uploadFile.id 
            ? { ...f, status: "processing", progress: 100 }
            : f
        ))

        // Simulate processing time
        setTimeout(() => {
          setFiles(prev => prev.map(f => 
            f.id === uploadFile.id 
              ? { ...f, status: "completed" }
              : f
          ))
        }, 2000)

      } catch (error) {
        console.error("Upload error:", error)
        setFiles(prev => prev.map(f => 
          f.id === uploadFile.id 
            ? { ...f, status: "error", error: error instanceof Error ? error.message : "Upload failed" }
            : f
        ))
      }
    }

    // Refresh parent component
    setTimeout(() => {
      onUploadComplete()
    }, 3000)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle className="h-4 w-4 text-green-600" />
      case "error": return <AlertCircle className="h-4 w-4 text-red-600" />
      case "uploading":
      case "processing": return <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
      default: return <FileText className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
      case "error": return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
      case "uploading": return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
      case "processing": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300"
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const allCompleted = files.length > 0 && files.every(f => f.status === "completed" || f.status === "error")
  const hasUploading = files.some(f => f.status === "uploading" || f.status === "processing")

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden bg-white dark:bg-gray-900">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-blue-600" />
            Upload Documents
          </DialogTitle>
          <DialogDescription>
            Upload PDF, TXT, DOCX, or RTF files to add to your knowledge base
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Drop Zone */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive
                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-medium mb-2">Drop files here or click to browse</p>
            <p className="text-sm text-muted-foreground mb-4">
              Supports PDF, TXT, DOCX, DOC, RTF files up to 50MB each
            </p>
            <input
              type="file"
              multiple
              accept=".pdf,.txt,.docx,.doc,.rtf"
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
            />
            <Button asChild variant="outline">
              <label htmlFor="file-upload" className="cursor-pointer">
                Select Files
              </label>
            </Button>
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {files.map((uploadFile) => (
                <div key={uploadFile.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <div className="flex-shrink-0">
                    {getStatusIcon(uploadFile.status)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium truncate">{uploadFile.file.name}</p>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(uploadFile.status)}>
                          {uploadFile.status}
                        </Badge>
                        {uploadFile.status === "pending" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(uploadFile.id)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{formatFileSize(uploadFile.file.size)}</span>
                      {(uploadFile.status === "uploading" || uploadFile.status === "processing") && (
                        <span>{uploadFile.progress}%</span>
                      )}
                    </div>
                    {(uploadFile.status === "uploading" || uploadFile.status === "processing") && (
                      <Progress value={uploadFile.progress} className="h-1 mt-2" />
                    )}
                    {uploadFile.error && (
                      <p className="text-xs text-red-600 mt-1">{uploadFile.error}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose} disabled={hasUploading}>
              {allCompleted ? "Close" : "Cancel"}
            </Button>
            {files.length > 0 && !allCompleted && (
              <Button
                onClick={uploadFiles}
                disabled={hasUploading || files.filter(f => f.status === "pending").length === 0}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Files
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}