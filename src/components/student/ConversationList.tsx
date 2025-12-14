'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Conversation } from '@/types/database'

interface ConversationListProps {
  courseId: string
  currentConversationId: string | null
  onSelectConversation: (id: string) => void
}

export default function ConversationList({
  courseId,
  currentConversationId,
  onSelectConversation,
}: ConversationListProps) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const supabase = createClient()

  useEffect(() => {
    loadConversations()
  }, [courseId])

  const loadConversations = async () => {
    const { data } = await supabase
      .from('conversations')
      .select('*')
      .eq('course_id', courseId)
      .order('updated_at', { ascending: false })
      .limit(20)

    if (data) {
      setConversations(data)
    }
  }

  return (
    <div className="overflow-y-auto h-full">
      {conversations.length === 0 ? (
        <div className="p-4 text-sm text-gray-500 text-center">
          No conversations yet
        </div>
      ) : (
        <div className="divide-y">
          {conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => onSelectConversation(conv.id)}
              className={`w-full text-left p-3 hover:bg-gray-50 ${
                conv.id === currentConversationId ? 'bg-indigo-50' : ''
              }`}
            >
              <p className="text-sm font-medium text-gray-900 truncate">
                {conv.title}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(conv.updated_at).toLocaleDateString()}
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

