import { useState, useEffect } from "react"
import { Save, Brain, Database, Sliders, Shield, Download, Upload } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { getSettings, updateSettings, getAvailableModels } from "@/api/settings"
import { useToast } from "@/hooks/useToast"

interface Settings {
  modelName: string
  embeddingModel: string
  chunkSize: number
  chunkOverlap: number
  maxRetrievalResults: number
  similarityThreshold: number
  responseMaxLength: number
  temperature: number
  enableStreaming: boolean
  enableCaching: boolean
  storageLocation: string
}

interface Model {
  name: string
  size: string
  status: "available" | "downloading" | "not_downloaded"
  description: string
}

export function SettingsPage() {
  const { toast } = useToast()
  const [settings, setSettings] = useState<Settings | null>(null)
  const [availableModels, setAvailableModels] = useState<Model[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadSettings()
    loadAvailableModels()
  }, [])

  const loadSettings = async () => {
    try {
      console.log("Loading settings...")
      const response = await getSettings()
      setSettings(response.settings)
    } catch (error) {
      console.error("Error loading settings:", error)
      toast({
        title: "Error",
        description: "Failed to load settings",
        variant: "destructive",
      })
    }
  }

  const loadAvailableModels = async () => {
    try {
      console.log("Loading available models...")
      const response = await getAvailableModels()
      setAvailableModels(response.models)
    } catch (error) {
      console.error("Error loading models:", error)
      toast({
        title: "Error",
        description: "Failed to load available models",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSaveSettings = async () => {
    if (!settings) return

    setSaving(true)
    try {
      console.log("Saving settings...")
      await updateSettings(settings)
      toast({
        title: "Success",
        description: "Settings saved successfully",
      })
    } catch (error) {
      console.error("Error saving settings:", error)
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    if (!settings) return
    setSettings({ ...settings, [key]: value })
  }

  const getModelStatusColor = (status: string) => {
    switch (status) {
      case "available": return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
      case "downloading": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
      case "not_downloaded": return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300"
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300"
    }
  }

  if (loading || !settings) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
        <div className="grid gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Settings
          </h1>
          <p className="text-muted-foreground">
            Configure your LocalGPT RAG system
          </p>
        </div>
        <Button
          onClick={handleSaveSettings}
          disabled={saving}
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
        >
          <Save className="h-4 w-4 mr-2" />
          {saving ? "Saving..." : "Save Settings"}
        </Button>
      </div>

      <div className="grid gap-6">
        {/* AI Models */}
        <Card className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border-gray-200/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-blue-600" />
              AI Models
            </CardTitle>
            <CardDescription>
              Configure the language and embedding models
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="modelName">Language Model</Label>
                <Select
                  value={settings.modelName}
                  onValueChange={(value) => updateSetting("modelName", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select language model" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableModels
                      .filter(model => model.name.includes("llama") || model.name.includes("mistral"))
                      .map((model) => (
                        <SelectItem key={model.name} value={model.name}>
                          <div className="flex items-center justify-between w-full">
                            <span>{model.name}</span>
                            <Badge className={getModelStatusColor(model.status)}>
                              {model.status}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="embeddingModel">Embedding Model</Label>
                <Select
                  value={settings.embeddingModel}
                  onValueChange={(value) => updateSetting("embeddingModel", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select embedding model" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableModels
                      .filter(model => model.name.includes("embedding") || model.name.includes("sentence"))
                      .map((model) => (
                        <SelectItem key={model.name} value={model.name}>
                          <div className="flex items-center justify-between w-full">
                            <span>{model.name}</span>
                            <Badge className={getModelStatusColor(model.status)}>
                              {model.status}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Temperature: {settings.temperature}</Label>
                <Slider
                  value={[settings.temperature]}
                  onValueChange={([value]) => updateSetting("temperature", value)}
                  max={2}
                  min={0}
                  step={0.1}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Controls randomness in responses. Lower values are more focused, higher values are more creative.
                </p>
              </div>

              <div className="space-y-2">
                <Label>Response Max Length: {settings.responseMaxLength}</Label>
                <Slider
                  value={[settings.responseMaxLength]}
                  onValueChange={([value]) => updateSetting("responseMaxLength", value)}
                  max={4000}
                  min={100}
                  step={100}
                  className="w-full"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Document Processing */}
        <Card className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border-gray-200/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-purple-600" />
              Document Processing
            </CardTitle>
            <CardDescription>
              Configure how documents are processed and chunked
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Chunk Size: {settings.chunkSize}</Label>
                <Slider
                  value={[settings.chunkSize]}
                  onValueChange={([value]) => updateSetting("chunkSize", value)}
                  max={2000}
                  min={200}
                  step={100}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Size of text chunks for processing
                </p>
              </div>

              <div className="space-y-2">
                <Label>Chunk Overlap: {settings.chunkOverlap}</Label>
                <Slider
                  value={[settings.chunkOverlap]}
                  onValueChange={([value]) => updateSetting("chunkOverlap", value)}
                  max={500}
                  min={0}
                  step={50}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Overlap between consecutive chunks
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="storageLocation">Storage Location</Label>
              <Input
                id="storageLocation"
                value={settings.storageLocation}
                onChange={(e) => updateSetting("storageLocation", e.target.value)}
                placeholder="/path/to/storage"
              />
              <p className="text-xs text-muted-foreground">
                Directory where documents and indexes are stored
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Retrieval Settings */}
        <Card className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border-gray-200/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sliders className="h-5 w-5 text-green-600" />
              Retrieval Settings
            </CardTitle>
            <CardDescription>
              Configure how relevant documents are found and ranked
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Max Retrieval Results: {settings.maxRetrievalResults}</Label>
                <Slider
                  value={[settings.maxRetrievalResults]}
                  onValueChange={([value]) => updateSetting("maxRetrievalResults", value)}
                  max={20}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Number of document chunks to retrieve for each query
                </p>
              </div>

              <div className="space-y-2">
                <Label>Similarity Threshold: {settings.similarityThreshold}</Label>
                <Slider
                  value={[settings.similarityThreshold]}
                  onValueChange={([value]) => updateSetting("similarityThreshold", value)}
                  max={1}
                  min={0}
                  step={0.05}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Minimum similarity score for including results
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Settings */}
        <Card className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border-gray-200/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-orange-600" />
              System Settings
            </CardTitle>
            <CardDescription>
              Performance and privacy settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable Streaming Responses</Label>
                <p className="text-xs text-muted-foreground">
                  Stream responses in real-time for better user experience
                </p>
              </div>
              <Switch
                checked={settings.enableStreaming}
                onCheckedChange={(checked) => updateSetting("enableStreaming", checked)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable Response Caching</Label>
                <p className="text-xs text-muted-foreground">
                  Cache responses to improve performance for repeated queries
                </p>
              </div>
              <Switch
                checked={settings.enableCaching}
                onCheckedChange={(checked) => updateSetting("enableCaching", checked)}
              />
            </div>

            <Separator />

            <div className="flex gap-4">
              <Button variant="outline" className="flex-1">
                <Download className="h-4 w-4 mr-2" />
                Export Settings
              </Button>
              <Button variant="outline" className="flex-1">
                <Upload className="h-4 w-4 mr-2" />
                Import Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}