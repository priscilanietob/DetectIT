"use client"

import { useState, useRef, useEffect } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Spinner } from "@/components/ui/spinner"
import {
  Send, Bot, User, Stethoscope, AlertCircle, Info, Brain
} from "lucide-react"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

interface CnnResult {
  class_name: string
  confidence: number
  probabilities: Record<string, number>
  cnn_summary: string
}

interface ChatSidebarProps {
  hasImage: boolean
  imageData?: string | null
  cnnResult?: CnnResult | null
}

const INITIAL_MESSAGE: Message = {
  id: "init",
  role: "assistant",
  content:
    "Hola, soy tu asistente de diagnóstico por IA. Sube una radiografía y te ayudaré a interpretarla. Si el servidor CNN está activo, también recibirás el análisis automático del modelo con sus probabilidades de confianza.",
  timestamp: new Date(),
}

function ConfidenceBadge({ confidence }: { confidence: number }) {
  const pct   = Math.round(confidence * 100)
  const color =
    pct >= 85 ? "text-green-400" :
    pct >= 60 ? "text-yellow-400" :
                "text-red-400"
  return <span className={`font-semibold ${color}`}>{pct}%</span>
}

export function ChatSidebar({ hasImage, imageData, cnnResult }: ChatSidebarProps) {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE])
  const [input, setInput]       = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef       = useRef<HTMLTextAreaElement>(null)

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isLoading])

  // When a new CNN result arrives, inject a summary message automatically
  useEffect(() => {
    if (!cnnResult) return
    const pct = Math.round(cnnResult.confidence * 100)
    const autoMsg: Message = {
      id:        `cnn-${Date.now()}`,
      role:      "assistant",
      content:
        `Resultado del modelo CNN:\n` +
        `• Clasificación: **${cnnResult.class_name}**\n` +
        `• Confianza: ${pct}%\n` +
        `• Nódulo: ${Math.round(cnnResult.probabilities["nodule"] * 100)}% | ` +
        `Masa: ${Math.round(cnnResult.probabilities["mass"] * 100)}% | ` +
        `Normal: ${Math.round(cnnResult.probabilities["normal"] * 100)}%\n\n` +
        `Puedes preguntarme qué significa esto clínicamente o pedirme que analice la imagen.`,
      timestamp: new Date(),
    }
    setMessages((prev) => {
      // avoid duplicates if effect fires twice
      if (prev.some((m) => m.id.startsWith("cnn-"))) return prev
      return [...prev, autoMsg]
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cnnResult])

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    const el = e.target
    el.style.height = "auto"
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`
  }

  const callChat = async (userMessage: string): Promise<string> => {
    // Build history from current messages (skip init + CNN auto-messages)
    const history = messages
      .filter((m) => m.id !== "init" && !m.id.startsWith("cnn-"))
      .map((m) => ({ role: m.role, content: m.content }))

    const res = await fetch("/api/chat", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({
        message:   userMessage,
        imageData: imageData ?? null,
        cnnResult: cnnResult ?? null,
        history,
      }),
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data.error ?? "Error desconocido")
    return data.response as string
  }

  const handleSubmit = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id:        Date.now().toString(),
      role:      "user",
      content:   input.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    if (inputRef.current) inputRef.current.style.height = "auto"
    setIsLoading(true)

    try {
      const response = await callChat(userMessage.content)
      setMessages((prev) => [
        ...prev,
        {
          id:        (Date.now() + 1).toString(),
          role:      "assistant",
          content:   response,
          timestamp: new Date(),
        },
      ])
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error desconocido"
      setMessages((prev) => [
        ...prev,
        {
          id:        (Date.now() + 1).toString(),
          role:      "assistant",
          content:   `⚠️ ${msg}`,
          timestamp: new Date(),
        },
      ])
    } finally {
      setIsLoading(false)
      inputRef.current?.focus()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <Card className="flex flex-col h-full min-h-0 border-border bg-card">
      {/* Header */}
      <div className="flex flex-col gap-2 p-4 border-b border-border bg-secondary/30 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary">
            <Stethoscope className="w-5 h-5 text-primary-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-card-foreground">AI Diagnostic Assistant</h2>
            <p className="text-xs text-muted-foreground">Llama 4 · Especializado en radiología</p>
          </div>
          {cnnResult && (
            <div className="flex items-center gap-1 text-xs bg-primary/10 border border-primary/20 rounded-md px-2 py-1">
              <Brain className="w-3 h-3 text-primary" />
              <span className="text-primary font-medium">CNN</span>
              <ConfidenceBadge confidence={cnnResult.confidence} />
            </div>
          )}
        </div>

        {/* Disclaimer */}
        <div className="flex gap-2 px-1">
          <AlertCircle className="w-3.5 h-3.5 text-accent shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground leading-snug">
            <span className="font-medium text-foreground">Aviso:</span> Este asistente es solo de apoyo educativo. Todos los hallazgos deben ser verificados por un radiólogo certificado.
          </p>
        </div>
      </div>

      {/* Messages */}
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
                {message.role === "assistant" ? (
                  <div className="text-sm leading-relaxed">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        h1: ({ children }) => <p className="text-sm font-bold mt-3 mb-1.5 first:mt-0">{children}</p>,
                        h2: ({ children }) => <p className="text-sm font-bold mt-2.5 mb-1 first:mt-0">{children}</p>,
                        h3: ({ children }) => <p className="text-sm font-semibold mt-2 mb-1 first:mt-0">{children}</p>,
                        p:  ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                        ul: ({ children }) => <ul className="mb-2 pl-4 space-y-0.5 last:mb-0">{children}</ul>,
                        ol: ({ children }) => <ol className="mb-2 pl-4 list-decimal space-y-0.5 last:mb-0">{children}</ol>,
                        li: ({ children }) => <li className="list-disc">{children}</li>,
                        strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                        hr: () => <hr className="border-border my-2" />,
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <p className="text-sm leading-relaxed">{message.content}</p>
                )}
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
                  <span className="text-sm">Analizando…</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Status bar */}
      <div className="px-3 py-2 border-t border-border shrink-0">
        <div className={`flex items-center gap-2 text-xs ${hasImage ? "text-accent" : "text-muted-foreground"}`}>
          <Info className="w-3 h-3" />
          <span>
            {hasImage
              ? cnnResult
                ? `Imagen cargada · CNN: ${cnnResult.class_name} (${Math.round(cnnResult.confidence * 100)}%)`
                : "Imagen cargada · esperando resultado CNN…"
              : "Sin imagen — sube una radiografía para análisis completo"}
          </span>
        </div>
      </div>

      {/* Input */}
      <div className="p-3 border-t border-border bg-secondary/20 shrink-0">
        <div className="flex gap-2 items-end">
          <textarea
            ref={inputRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Pregunta sobre la radiografía…  (Enter para enviar)"
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
