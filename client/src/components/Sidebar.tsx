import { useNavigate, useLocation } from "react-router-dom"
import { Home, FileText, MessageSquare, Settings, Brain } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "./ui/button"

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Documents", href: "/documents", icon: FileText },
  { name: "Chat", href: "/chat", icon: MessageSquare },
  { name: "Settings", href: "/settings", icon: Settings },
]

export function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <div className="fixed left-0 top-16 z-40 w-64 h-[calc(100vh-4rem)] bg-white/70 dark:bg-gray-900/70 backdrop-blur-md border-r border-gray-200/50 dark:border-gray-700/50">
      <div className="flex flex-col h-full p-4">
        <nav className="flex-1 space-y-2">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href
            return (
              <Button
                key={item.name}
                variant={isActive ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3 h-12 text-left font-medium transition-all duration-200",
                  isActive
                    ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg hover:shadow-xl"
                    : "hover:bg-blue-50 dark:hover:bg-blue-900/20 text-gray-700 dark:text-gray-300"
                )}
                onClick={() => navigate(item.href)}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Button>
            )
          })}
        </nav>
        
        <div className="mt-auto p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200/50 dark:border-blue-700/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
              <Brain className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                AI Status
              </p>
              <p className="text-xs text-green-600 dark:text-green-400">
                Models Ready
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}