"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Spinner } from "@/components/ui/spinner"
import {
  Send, Bot, User, Stethoscope, AlertCircle, Info
} from "lucide-react"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

interface ChatSidebarProps {
  hasImage: boolean
}

export function ChatSidebar({ hasImage }: ChatSidebarProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hello! I'm your AI diagnostic assistant. Upload an X-ray image and I'll help you analyze it. You can ask me questions about the image or request specific area analysis.",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef       = useRef<HTMLTextAreaElement>(null)

  // auto scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isLoading])

  // auto grow textarea height
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    const el = e.target
    el.style.height = "auto"
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`
  }

  const simulateResponse = async (userMessage: string): Promise<string> => {
    await new Promise((resolve) => setTimeout(resolve, 1500))
    if (!hasImage) return "Please upload an X-ray image first so I can provide a detailed analysis."
    return "Simulated response: this is a demo :D."
  }

  const handleSubmit = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    // reset text area height
    if (inputRef.current) {
      inputRef.current.style.height = "auto"
    }
    setIsLoading(true)

    try {
      const response = await simulateResponse(userMessage.content)
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: "assistant", content: response, timestamp: new Date() },
      ])
    } finally {
      setIsLoading(false)
      inputRef.current?.focus()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // send on Enter 
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <Card className="flex flex-col h-full min-h-0 border-border bg-card">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-border bg-secondary/30 shrink-0">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary">
          <Stethoscope className="w-5 h-5 text-primary-foreground" />
        </div>
        <div>
          <h2 className="font-semibold text-card-foreground">AI Diagnostic Assistant</h2>
          <p className="text-xs text-muted-foreground">Powered by medical AI</p>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mx-3 mt-3 shrink-0">
        <div className="p-3 rounded-lg bg-accent/10 border border-accent/20">
          <div className="flex gap-2">
            <AlertCircle className="w-4 h-4 text-accent shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground">Disclaimer:</span> This AI assistant provides educational insights only. All findings must be verified by a qualified radiologist.
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto p-3">
        <div className="flex flex-col gap-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : ""}`}
            >
              <Avatar className={`w-8 h-8 shrink-0 ${message.role === "assistant" ? "bg-primary" : "bg-secondary"}`}>
                <AvatarFallback className={message.role === "assistant" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}>
                  {message.role === "assistant" ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </AvatarFallback>
              </Avatar>
              <div className={`flex-1 rounded-lg p-3 ${
                message.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground"
              }`}>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                <p className={`text-xs mt-2 ${message.role === "user" ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                  {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3">
              <Avatar className="w-8 h-8 bg-primary shrink-0">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  <Bot className="w-4 h-4" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 rounded-lg p-3 bg-secondary">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Spinner className="w-4 h-4" />
                  <span className="text-sm">Analyzing...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="px-3 py-2 border-t border-border shrink-0">
        <div className={`flex items-center gap-2 text-xs ${hasImage ? "text-accent" : "text-muted-foreground"}`}>
          <Info className="w-3 h-3" />
          <span>{hasImage ? "X-ray image loaded and ready for analysis" : "No image uploaded yet"}</span>
        </div>
      </div>

      <div className="p-3 border-t border-border bg-secondary/20 shrink-0">
        <div className="flex gap-2 items-end">
          <textarea
            ref={inputRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Ask about the X-ray…  (Enter to send, Shift+Enter for newline)"
            disabled={isLoading}
            rows={1}
            className="flex-1 resize-none overflow-y-auto bg-input border border-border rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50"
            style={{ minHeight: "38px", maxHeight: "120px" }}
          />
          <Button
            type="button"
            size="icon"
            onClick={handleSubmit}
            disabled={isLoading || !input.trim()}
            className="shrink-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  )
}
