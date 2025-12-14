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
    content: `You are a helpful AI assistant for a course. Answer questions based on the provided course materials. 
    
Context from course materials:
${context}

Use the context above to answer questions. If the answer is not in the context, say so. Be concise and helpful.`,
  }

  const stream = await openai.chat.completions.create({
    model: 'gpt-4o-mini', // or 'gpt-4o' for better quality
    messages: [systemMessage, ...messages],
    stream: true,
    temperature: 0.7,
  })

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content || ''
    if (content) {
      yield content
    }
  }
}

