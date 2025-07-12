import { useState, useEffect, useRef } from "react"
import { Send, Bot, User, FileText, Clock, Zap } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { sendQuery, getChatHistory } from "@/api/chat"
import { useToast } from "@/hooks/useToast"

interface ChatMessage {
  _id: string
  type: "user" | "assistant"
  content: string
  timestamp: string
  sources?: Array<{
    document: string
    page?: number
    chunk: string
    relevance: number
  }>
  responseTime?: number
}

export function ChatPage() {
  const { toast } = useToast()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadChatHistory()
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const loadChatHistory = async () => {
    try {
      console.log("Loading chat history...")
      const response = await getChatHistory()
      setMessages(response.messages)
    } catch (error) {
      console.error("Error loading chat history:", error)
      toast({
        title: "Error",
        description: "Failed to load chat history",
        variant: "destructive",
      })
    } finally {
      setInitialLoading(false)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSendMessage = async () => {
    if (!input.trim() || loading) return

    const userMessage: ChatMessage = {
      _id: Date.now().toString(),
      type: "user",
      content: input.trim(),
      timestamp: new Date().toISOString(),
    }

    setMessages(prev => [...prev, userMessage])
    setInput("")
    setLoading(true)

    try {
      console.log("Sending query:", input.trim())
      const response = await sendQuery({ question: input.trim() })
      
      const assistantMessage: ChatMessage = {
        _id: (Date.now() + 1).toString(),
        type: "assistant",
        content: response.answer,
        timestamp: new Date().toISOString(),
        sources: response.sources,
        responseTime: response.responseTime,
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error("Error sending message:", error)
      toast({
        title: "Error",
        description: "Failed to get response from AI",
        variant: "destructive",
      })
      
      const errorMessage: ChatMessage = {
        _id: (Date.now() + 1).toString(),
        type: "assistant",
        content: "I apologize, but I encountered an error while processing your question. Please try again.",
        timestamp: new Date().toISOString(),
      }
      
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  if (initialLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
        <div className="h-96 bg-gray-200 rounded-lg"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          AI Chat Assistant
        </h1>
        <p className="text-muted-foreground">
          Ask questions about your uploaded documents
        </p>
      </div>

      {/* Chat Container */}
      <Card className="flex-1 bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border-gray-200/50 flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-blue-600" />
            Chat with your documents
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col p-0">
          {/* Messages */}
          <ScrollArea className="flex-1 p-6">
            <div className="space-y-6">
              {messages.length === 0 ? (
                <div className="text-center py-12">
                  <Bot className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Start a conversation</h3>
                  <p className="text-muted-foreground">
                    Ask me anything about your uploaded documents
                  </p>
                </div>
              ) : (
                messages.map((message) => (
                  <div key={message._id} className="space-y-3">
                    <div className={`flex gap-3 ${message.type === "user" ? "justify-end" : "justify-start"}`}>
                      {message.type === "assistant" && (
                        <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full">
                          <Bot className="h-4 w-4 text-white" />
                        </div>
                      )}
                      <div className={`max-w-3xl ${message.type === "user" ? "order-first" : ""}`}>
                        <div
                          className={`p-4 rounded-lg ${
                            message.type === "user"
                              ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white ml-auto"
                              : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                          }`}
                        >
                          <p className="whitespace-pre-wrap">{message.content}</p>
                        </div>
                        
                        {/* Message metadata */}
                        <div className={`flex items-center gap-2 mt-2 text-xs text-muted-foreground ${
                          message.type === "user" ? "justify-end" : "justify-start"
                        }`}>
                          <Clock className="h-3 w-3" />
                          <span>{new Date(message.timestamp).toLocaleTimeString()}</span>
                          {message.responseTime && (
                            <>
                              <Separator orientation="vertical" className="h-3" />
                              <Zap className="h-3 w-3" />
                              <span>{message.responseTime}ms</span>
                            </>
                          )}
                        </div>

                        {/* Sources */}
                        {message.sources && message.sources.length > 0 && (
                          <div className="mt-3 space-y-2">
                            <p className="text-sm font-medium text-muted-foreground">Sources:</p>
                            <div className="space-y-2">
                              {message.sources.map((source, index) => (
                                <div
                                  key={index}
                                  className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200/50 dark:border-blue-700/50"
                                >
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                      <FileText className="h-4 w-4 text-blue-600" />
                                      <span className="text-sm font-medium">{source.document}</span>
                                      {source.page && (
                                        <Badge variant="outline" className="text-xs">
                                          Page {source.page}
                                        </Badge>
                                      )}
                                    </div>
                                    <Badge variant="secondary" className="text-xs">
                                      {Math.round(source.relevance * 100)}% match
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-muted-foreground line-clamp-2">
                                    {source.chunk}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      {message.type === "user" && (
                        <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full">
                          <User className="h-4 w-4 text-white" />
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
              
              {loading && (
                <div className="flex gap-3 justify-start">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      <span className="text-sm text-muted-foreground">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="p-6 border-t bg-white/50 dark:bg-gray-900/50">
            <div className="flex gap-3">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask a question about your documents..."
                disabled={loading}
                className="flex-1"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!input.trim() || loading}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}