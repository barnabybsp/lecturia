import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function* streamChatCompletion(
  messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
  context: string
): AsyncGenerator<string, void, unknown> {
  const systemMessage = {
    role: 'system' as const,
    content: `You are the AI study assistant for this class. Your job is to help the student learn clearly and confidently.

Use only the course materials provided in the context when answering. If the context does not contain the answer, say that you do not have it and suggest what the student should ask their lecturer or check in their notes.

Respond in short, student-friendly paragraphs. Use bullet points for steps or lists. If a question is unclear, ask a brief clarifying question.

Context from course materials:
${context || '[No course materials found for this question]'}
`,
  }

  const stream = await openai.chat.completions.create({
    model: 'gpt-4o-mini', // or 'gpt-4o' for better quality
    messages: [systemMessage, ...messages],
    stream: true,
    temperature: 0.2,
  })

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content || ''
    if (content) {
      yield content
    }
  }
}

