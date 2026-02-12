import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function* streamChatCompletion(
  messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
  context: string
): AsyncGenerator<string, void, unknown> {
  const systemPrompt = `You are the AI study assistant for this class. Your job is to help the student learn clearly and confidently.

Use only the course materials provided in the context when answering. If the context does not contain the answer, say that you do not have it and suggest what the student should ask their lecturer or check in their notes.

Respond in short, student-friendly paragraphs. Use bullet points for steps or lists. If a question is unclear, ask a brief clarifying question.

Context from course materials:
${context || '[No course materials found for this question]'}`

  // Convert messages to Anthropic format
  const anthropicMessages = messages
    .filter((m) => m.role !== 'system')
    .map((m) => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: m.content,
    }))

  const stream = await anthropic.messages.create({
    model: 'claude-sonnet-4-5-20250514',
    max_tokens: 1024,
    system: systemPrompt,
    messages: anthropicMessages as any,
    stream: true,
  })

  for await (const chunk of stream) {
    if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
      yield chunk.delta.text
    }
  }
}

