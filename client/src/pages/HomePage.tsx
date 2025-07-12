import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { FileText, MessageSquare, Brain, Upload, Zap, Shield, TrendingUp } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { getSystemStats, getRecentDocuments, getRecentQueries } from "@/api/dashboard"
import { useToast } from "@/hooks/useToast"

interface SystemStats {
  totalDocuments: number
  totalQueries: number
  modelStatus: string
  storageUsed: number
  storageTotal: number
}

interface RecentDocument {
  _id: string
  name: string
  uploadedAt: string
  status: string
  size: number
}

interface RecentQuery {
  _id: string
  question: string
  timestamp: string
  responseTime: number
}

export function HomePage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [stats, setStats] = useState<SystemStats | null>(null)
  const [recentDocs, setRecentDocs] = useState<RecentDocument[]>([])
  const [recentQueries, setRecentQueries] = useState<RecentQuery[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        console.log("Loading dashboard data...")
        const [statsData, docsData, queriesData] = await Promise.all([
          getSystemStats(),
          getRecentDocuments(),
          getRecentQueries()
        ])
        
        setStats(statsData.stats)
        setRecentDocs(docsData.documents)
        setRecentQueries(queriesData.queries)
      } catch (error) {
        console.error("Error loading dashboard data:", error)
        toast({
          title: "Error",
          description: "Failed to load dashboard data",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [toast])

  const storagePercentage = stats ? (stats.storageUsed / stats.storageTotal) * 100 : 0

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Welcome to LocalGPT RAG
        </h1>
        <p className="text-muted-foreground">
          Your private document AI assistant. Upload documents and ask questions securely.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200/50 hover:shadow-lg transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">
              Total Documents
            </CardTitle>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
              {stats?.totalDocuments || 0}
            </div>
            <p className="text-xs text-blue-600 dark:text-blue-400">
              Ready for queries
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200/50 hover:shadow-lg transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">
              Total Queries
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
              {stats?.totalQueries || 0}
            </div>
            <p className="text-xs text-purple-600 dark:text-purple-400">
              Questions answered
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200/50 hover:shadow-lg transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">
              AI Model Status
            </CardTitle>
            <Brain className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                {stats?.modelStatus || "Ready"}
              </Badge>
            </div>
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">
              All systems operational
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200/50 hover:shadow-lg transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-300">
              Storage Used
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">
              {storagePercentage.toFixed(1)}%
            </div>
            <Progress value={storagePercentage} className="mt-2" />
            <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
              {stats?.storageUsed || 0}GB of {stats?.storageTotal || 0}GB
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border-gray-200/50 hover:shadow-lg transition-all duration-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-blue-600" />
              Upload Documents
            </CardTitle>
            <CardDescription>
              Add new documents to your knowledge base
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => navigate("/documents")}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Files
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border-gray-200/50 hover:shadow-lg transition-all duration-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-purple-600" />
              Ask Questions
            </CardTitle>
            <CardDescription>
              Query your documents with natural language
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => navigate("/chat")}
              className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Start Chat
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border-gray-200/50 hover:shadow-lg transition-all duration-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-600" />
              Privacy First
            </CardTitle>
            <CardDescription>
              All processing happens locally on your machine
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                <Shield className="h-3 w-3 mr-1" />
                100% Local
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border-gray-200/50">
          <CardHeader>
            <CardTitle>Recent Documents</CardTitle>
            <CardDescription>
              Latest uploaded files
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentDocs.length > 0 ? (
                recentDocs.map((doc) => (
                  <div key={doc._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="h-4 w-4 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium">{doc.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(doc.uploadedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Badge variant={doc.status === "processed" ? "default" : "secondary"}>
                      {doc.status}
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No documents uploaded yet
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border-gray-200/50">
          <CardHeader>
            <CardTitle>Recent Queries</CardTitle>
            <CardDescription>
              Latest questions asked
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentQueries.length > 0 ? (
                recentQueries.map((query) => (
                  <div key={query._id} className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <p className="text-sm font-medium line-clamp-2">{query.question}</p>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs text-muted-foreground">
                        {new Date(query.timestamp).toLocaleString()}
                      </p>
                      <Badge variant="outline" className="text-xs">
                        {query.responseTime}ms
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No queries yet
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}