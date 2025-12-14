import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { searchSimilarChunks } from '@/lib/rag/search'
import { streamChatCompletion as streamOpenAI } from '@/lib/llm/openai'
import { streamChatCompletion as streamAnthropic } from '@/lib/llm/anthropic'

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { message, conversationId, courseId, provider = 'openai' } =
    await request.json()

  if (!message || !courseId) {
    return NextResponse.json(
      { error: 'Message and courseId are required' },
      { status: 400 }
    )
  }

  // Verify enrollment
  const { data: enrollment } = await supabase
    .from('course_enrollments')
    .select('id')
    .eq('course_id', courseId)
    .eq('student_id', user.id)
    .single()

  if (!enrollment) {
    return NextResponse.json({ error: 'Not enrolled in course' }, { status: 403 })
  }

  // Search for relevant chunks
  const relevantChunks = await searchSimilarChunks(message, courseId, 5)
  const context = relevantChunks
    .map((chunk) => chunk.content)
    .join('\n\n---\n\n')

  // Get conversation history if conversationId exists
  let conversationHistory: Array<{
    role: 'user' | 'assistant'
    content: string
  }> = []

  if (conversationId) {
    const { data: messages } = await supabase
      .from('messages')
      .select('role, content')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .limit(10) // Last 10 messages for context

    if (messages) {
      conversationHistory = messages.map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }))
    }
  }

  // Add current message
  conversationHistory.push({
    role: 'user',
    content: message,
  })

  // Create or get conversation
  let finalConversationId = conversationId
  if (!finalConversationId) {
    const title = message.substring(0, 50)
    const { data: newConversation } = await supabase
      .from('conversations')
      .insert({
        course_id: courseId,
        student_id: user.id,
        title,
      })
      .select()
      .single()

    if (newConversation) {
      finalConversationId = newConversation.id
    }
  }

  // Save user message
  if (finalConversationId) {
    await supabase.from('messages').insert({
      conversation_id: finalConversationId,
      role: 'user',
      content: message,
    })
  }

  // Stream response
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const streamGenerator =
          provider === 'anthropic'
            ? streamAnthropic(conversationHistory, context)
            : streamOpenAI(conversationHistory, context)

        let fullResponse = ''

        for await (const chunk of streamGenerator) {
          fullResponse += chunk
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ chunk })}\n\n`))
        }

        // Save assistant message
        if (finalConversationId && fullResponse) {
          await supabase.from('messages').insert({
            conversation_id: finalConversationId,
            role: 'assistant',
            content: fullResponse,
          })

          // Update conversation title if it's the first message
          if (!conversationId && message) {
            const title = message.substring(0, 50)
            await supabase
              .from('conversations')
              .update({ title, updated_at: new Date().toISOString() })
              .eq('id', finalConversationId)
          }
        }

        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ done: true, conversationId: finalConversationId })}\n\n`)
        )
        controller.close()
      } catch (error) {
        controller.error(error)
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}

