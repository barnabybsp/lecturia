"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Send, Sparkles, FileText, Zap, Paperclip, BookOpen } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { JoinClassDialog } from "@/components/student/JoinClassDialog"
import { cn } from "@/lib/utils"

interface ChatAreaProps {
  activeClass: string
  courseId?: string
  conversationId?: string | null
  onConversationIdChange?: (conversationId: string | null) => void
}

type Message = {
  id: string
  role: "user" | "assistant"
  content: string
}

const createWelcomeMessage = (className: string): Message => ({
  id: `welcome-${className}`,
  role: "assistant",
  content: `Hi! I'm your AI study assistant for ${className}. Ask me anything about your coursework, or use the Generate button to create practice materials.`,
})

export function ChatArea({
  activeClass,
  courseId,
  conversationId,
  onConversationIdChange,
}: ChatAreaProps) {
  const [messages, setMessages] = useState<Message[]>([
    createWelcomeMessage(activeClass),
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [loadingHistory, setLoadingHistory] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  useEffect(() => {
    if (!courseId) {
      setMessages([createWelcomeMessage(activeClass)])
      return
    }

    if (!conversationId) {
      setMessages([createWelcomeMessage(activeClass)])
      return
    }

    const controller = new AbortController()

    const loadConversation = async () => {
      setLoadingHistory(true)
      try {
        const response = await fetch(
          `/api/conversations?conversationId=${conversationId}`,
          { signal: controller.signal }
        )
        if (!response.ok) {
          throw new Error("Failed to load conversation")
        }

        const data = await response.json()
        const loadedMessages = (data.messages || []).map(
          (message: { id: string; role: "user" | "assistant"; content: string }) => ({
            id: message.id,
            role: message.role,
            content: message.content,
          })
        )

        if (loadedMessages.length > 0) {
          setMessages(loadedMessages)
        } else {
          setMessages([createWelcomeMessage(activeClass)])
        }
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return
        }
        console.error("Error loading conversation:", error)
        setMessages([createWelcomeMessage(activeClass)])
      } finally {
        setLoadingHistory(false)
      }
    }

    loadConversation()

    return () => controller.abort()
  }, [conversationId, courseId, activeClass])

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!input.trim() || loading || !courseId || loadingHistory) return

    const userMessage = input.trim()
    setInput("")
    setLoading(true)

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: userMessage
    }
    const assistantMessageId = crypto.randomUUID()
    const assistantPlaceholder: Message = {
      id: assistantMessageId,
      role: "assistant",
      content: "",
    }
    setMessages((prev) => [...prev, userMsg, assistantPlaceholder])

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          conversationId: conversationId ?? undefined,
          courseId,
          provider: 'openai',
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) {
        throw new Error('No response body')
      }

      let assistantMessage = ''
      let finalConversationId = conversationId || null
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        // Keep the last (potentially incomplete) line in the buffer
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))
              if (data.chunk) {
                assistantMessage += data.chunk
                setMessages((prev) =>
                  prev.map((message) =>
                    message.id === assistantMessageId
                      ? { ...message, content: assistantMessage }
                      : message
                  )
                )
              }
              if (data.done && data.conversationId) {
                finalConversationId = data.conversationId
                onConversationIdChange?.(finalConversationId)
              }
            } catch (e) {
              // Ignore parse errors
            }
          }
        }
      }
    } catch (error) {
      console.error('Error:', error)
      setMessages((prev) =>
        prev.map((message) =>
          message.id === assistantMessageId
            ? {
                ...message,
                content: 'Sorry, I encountered an error. Please try again.',
              }
            : message
        )
      )
    } finally {
      setLoading(false)
    }
  }

  const handleFileClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      console.log("Files selected:", files)
    }
  }

  return (
    <main className="relative flex w-full flex-col h-full overflow-hidden bg-background">
      {!courseId ? (
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto flex w-full max-w-3xl flex-col items-center px-6 py-12">
            <div className="w-full overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
              <div className="relative px-8 pb-8 pt-10">
                <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-r from-primary/15 via-primary/5 to-transparent" />
                <div className="absolute -left-20 -top-24 h-48 w-48 rounded-full bg-primary/20 blur-3xl" />
                <div className="absolute -right-16 top-10 h-40 w-40 rounded-full bg-chart-4/20 blur-3xl" />

                <div className="relative">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <Sparkles className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                        Get Started
                      </p>
                      <h1 className="text-2xl font-display font-semibold text-foreground">
                        Join a class to unlock your study assistant
                      </h1>
                    </div>
                  </div>

                  <p className="mt-4 max-w-xl text-sm text-muted-foreground">
                    You are not connected to any courses yet. Enter your lecturer&apos;s invite code to access
                    personalized materials, practice tools, and the AI assistant tailored to your class.
                  </p>

                  <div className="mt-6 grid gap-4 sm:grid-cols-[1.2fr_0.8fr]">
                    <div className="rounded-2xl border border-border bg-background/60 p-5">
                      <h2 className="text-sm font-semibold text-foreground">What you get</h2>
                      <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-start gap-2">
                          <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                          Course-specific explanations and study support
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                          Practice quizzes, flashcards, and review guides
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                          Access to materials uploaded by your lecturer
                        </li>
                      </ul>
                    </div>

                    <div className="rounded-2xl border border-dashed border-primary/30 bg-primary/5 p-5">
                      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary/70">
                        Ready to join
                      </p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Have your invite code handy? Join your class in seconds.
                      </p>
                      <div className="mt-4">
                        <JoinClassDialog
                          trigger={(
                            <Button className="w-full gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm">
                              <BookOpen className="h-4 w-4" />
                              <span>Join a Class</span>
                            </Button>
                          )}
                        />
                      </div>
                      <p className="mt-3 text-xs text-muted-foreground/80">
                        Invite codes are provided by your lecturer.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Header Bar */}
          <div className="border-b border-border px-6 py-4 bg-card shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-lg font-display font-semibold text-foreground">{activeClass}</h1>
                  <p className="text-sm text-muted-foreground">Ask questions or request study materials</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="gap-2 shadow-sm">
                  <FileText className="h-4 w-4" />
                  <span className="hidden sm:inline">Past Materials</span>
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" className="gap-2 bg-primary hover:bg-primary/90 shadow-sm">
                      <Zap className="h-4 w-4" />
                      <span>Generate</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem className="cursor-pointer">
                      <FileText className="mr-2 h-4 w-4 text-primary" />
                      <span>Practice Exam</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer">
                      <Zap className="mr-2 h-4 w-4 text-chart-3" />
                      <span>Quick Quiz</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer">
                      <Sparkles className="mr-2 h-4 w-4 text-chart-4" />
                      <span>Flashcards</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>

          {/* Chat Messages */}
          <ScrollArea className="flex-1 min-h-0">
            <div className="mx-auto max-w-3xl px-6 py-6 space-y-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-3",
                    message.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  {message.role === "assistant" && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
                      <Sparkles className="h-4 w-4 text-primary" />
                    </div>
                  )}
                  <div
                    className={cn(
                      "rounded-2xl px-4 py-3 max-w-[80%]",
                      message.role === "user"
                        ? "bg-primary text-primary-foreground rounded-br-md"
                        : "bg-card border border-border rounded-bl-md shadow-sm"
                    )}
                  >
                    {message.content ? (
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                    ) : loading && message.role === "assistant" ? (
                      <div className="flex gap-1.5 py-1">
                        <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce [animation-delay:0.1s]" />
                        <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce [animation-delay:0.2s]" />
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}
              <div ref={scrollRef} />
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="border-t border-border p-4 bg-card shrink-0">
            <form onSubmit={handleSend} className="mx-auto max-w-3xl">
              <div className="flex gap-2 items-center bg-background border border-border rounded-xl p-2 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/50 transition-all">
                <Button
                  type="button"
                  onClick={handleFileClick}
                  size="icon"
                  variant="ghost"
                  className="shrink-0 h-9 w-9 rounded-lg hover:bg-muted"
                >
                  <Paperclip className="h-4 w-4 text-muted-foreground" />
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
                />
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend(e)}
                  placeholder={courseId ? "Ask a question about your coursework..." : "Select a course to start chatting"}
                  className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/60"
                  disabled={loading || loadingHistory || !courseId}
                />
                <Button
                  type="submit"
                  size="icon"
                  className="shrink-0 h-9 w-9 rounded-lg bg-primary hover:bg-primary/90 shadow-sm"
                  disabled={loading || loadingHistory || !input.trim() || !courseId}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-center text-muted-foreground mt-2">
                AI responses are generated from your course materials
              </p>
            </form>
          </div>
        </>
      )}
    </main>
  )
}
