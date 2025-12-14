'use client'

import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/lib/hooks/use-auth'
import ConversationList from './ConversationList'

interface ChatInterfaceProps {
  courseId: string
}

export default function ChatInterface({ courseId }: ChatInterfaceProps) {
  const { user } = useAuth()
  const [messages, setMessages] = useState<
    Array<{ role: 'user' | 'assistant'; content: string }>
  >([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [provider, setProvider] = useState<'openai' | 'anthropic'>('openai')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [showConversations, setShowConversations] = useState(false)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput('')
    setLoading(true)

    // Add user message to UI immediately
    const newMessages = [...messages, { role: 'user' as const, content: userMessage }]
    setMessages(newMessages)

    // Add placeholder for assistant response
    setMessages([...newMessages, { role: 'assistant', content: '' }])

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          conversationId,
          courseId,
          provider,
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
                  { role: 'assistant', content: assistantMessage },
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
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const startNewChat = () => {
    setMessages([])
    setConversationId(null)
    setShowConversations(false)
  }

  const loadConversation = async (convId: string) => {
    setConversationId(convId)
    setShowConversations(false)

    try {
      const response = await fetch(`/api/conversations/${convId}/messages`)
      if (response.ok) {
        const data = await response.json()
        setMessages(data)
      }
    } catch (error) {
      console.error('Error loading conversation:', error)
    }
  }

  return (
    <div className="flex h-[calc(100vh-200px)]">
      {/* Conversations sidebar */}
      <div className={`w-64 border-r bg-white ${showConversations ? 'block' : 'hidden md:block'}`}>
        <div className="p-4 border-b">
          <button
            onClick={startNewChat}
            className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm font-medium"
          >
            New Chat
          </button>
        </div>
        <ConversationList
          courseId={courseId}
          currentConversationId={conversationId}
          onSelectConversation={loadConversation}
        />
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col">
        {/* Provider selector */}
        <div className="p-4 border-b bg-white flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowConversations(!showConversations)}
              className="md:hidden text-gray-600 hover:text-gray-900"
            >
              ☰ Conversations
            </button>
            <div className="flex gap-2">
              <button
                onClick={() => setProvider('openai')}
                className={`px-3 py-1 rounded text-sm ${
                  provider === 'openai'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                OpenAI
              </button>
              <button
                onClick={() => setProvider('anthropic')}
                className={`px-3 py-1 rounded text-sm ${
                  provider === 'anthropic'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                Anthropic
              </button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-gray-500 mt-8">
              <p className="text-lg font-medium mb-2">Start a conversation</p>
              <p className="text-sm">
                Ask questions about the course materials. The AI will answer based on
                documents uploaded by your lecturer.
              </p>
            </div>
          )}
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-3xl rounded-lg px-4 py-2 ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-lg px-4 py-2">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="p-4 border-t bg-white">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question about the course..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

