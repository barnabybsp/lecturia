"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Send, Sparkles, FileText, Zap, Paperclip } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface ChatAreaProps {
  activeClass: string
  courseId?: string
}

type Message = {
  id: number
  role: "user" | "assistant"
  content: string
}

export function ChatArea({ activeClass, courseId }: ChatAreaProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: "assistant",
      content: `Hi! I'm here to help you with ${activeClass}. Ask me anything about your coursework, or use the Generate button to create practice materials.`,
    },
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!input.trim() || loading || !courseId) return

    const userMessage = input.trim()
    setInput("")
    setLoading(true)

    // Add user message to UI immediately
    const userMsg: Message = { 
      id: messages.length + 1, 
      role: "user", 
      content: userMessage 
    }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)

    // Add placeholder for assistant response
    const assistantPlaceholder: Message = {
      id: messages.length + 2,
      role: "assistant",
      content: "",
    }
    setMessages([...newMessages, assistantPlaceholder])

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          conversationId,
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
      let finalConversationId = conversationId

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))
              if (data.chunk) {
                assistantMessage += data.chunk
                setMessages([
                  ...newMessages,
                  { id: messages.length + 2, role: "assistant", content: assistantMessage },
                ])
              }
              if (data.done && data.conversationId) {
                finalConversationId = data.conversationId
                setConversationId(finalConversationId)
              }
            } catch (e) {
              // Ignore parse errors
            }
          }
        }
      }
    } catch (error) {
      console.error('Error:', error)
      setMessages([
        ...newMessages,
        {
          id: messages.length + 2,
          role: "assistant",
          content: 'Sorry, I encountered an error. Please try again.',
        },
      ])
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
      // File upload logic would go here
    }
  }

  return (
    <main className="relative flex w-full flex-col h-full overflow-hidden">
      <div className="absolute right-6 top-6 z-10 flex gap-2">
        <Button variant="outline" size="sm" className="gap-2 shadow-lg text-black bg-violet-700" style={{ borderColor: 'var(--accent)' }}>
          <FileText className="h-4 w-4" />
          <span>Past Materials</span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger className="border bg-violet-700" asChild>
            <Button size="sm" className="gap-2 bg-white border-black shadow-lg hover:bg-primary/90" style={{ backgroundColor: 'rgba(255, 255, 255, 1)', backgroundImage: 'none', background: '', borderColor: 'var(--color-black)', borderImage: 'none' }}>
              <Zap className="h-4 w-4" />
              <span>Generate</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem>
              <FileText className="mr-2 h-4 w-4" />
              <span>Practice Exam</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Zap className="mr-2 h-4 w-4" />
              <span>Quick Quiz</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Sparkles className="mr-2 h-4 w-4" />
              <span>Flashcards</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="border-b border-border px-6 py-4 bg-card-foreground shrink-0">
        <h1 className="text-lg font-semibold text-background">{activeClass}</h1>
        <p className="text-sm text-muted-foreground">Ask questions or request study materials</p>
      </div>

      <ScrollArea className="flex-1 px-6 bg-foreground min-h-0">
        <div className="mx-auto max-w-4xl space-y-6 py-6">
          {messages.map((message) => (
            <div key={message.id} className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              {message.role === "assistant" && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-700 border border-black" style={{ color: 'rgba(9, 9, 11, 1)', backgroundColor: 'rgba(158, 158, 158, 1)', borderWidth: '1px', borderColor: 'rgba(0, 0, 0, 1)' }}>
                  <Sparkles className="h-4 w-4 text-primary-foreground" />
                </div>
              )}
              <div
                className={`rounded-lg px-4 py-3 ${
                  message.role === "user" ? "bg-violet-500 text-white" : "bg-muted text-foreground"
                }`}
              >
                {message.content ? (
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                ) : loading && message.role === "assistant" ? (
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                ) : null}
              </div>
            </div>
          ))}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      <div className="border-t border-border p-4 bg-foreground shrink-0">
        <form onSubmit={handleSend} className="mx-auto flex max-w-4xl gap-2">
          <Button 
            type="button"
            onClick={handleFileClick} 
            size="icon" 
            variant="outline" 
            className="shrink-0 bg-transparent"
          >
            <Paperclip className="h-4 w-4" />
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
            className="flex-1 text-border bg-foreground"
            style={{ color: 'rgba(0, 0, 0, 1)', borderImage: 'none', borderColor: 'rgba(0, 0, 0, 1)' }}
            disabled={loading || !courseId}
          />
          <Button 
            type="submit"
            onClick={handleSend} 
            size="icon" 
            className="shrink-0 hover:bg-primary/90 bg-violet-700 border border-white" 
            style={{ backgroundColor: 'rgba(255, 255, 255, 1)', borderWidth: '1px', borderColor: 'rgba(0, 0, 0, 1)' }}
            disabled={loading || !input.trim() || !courseId}
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </main>
  )
}
