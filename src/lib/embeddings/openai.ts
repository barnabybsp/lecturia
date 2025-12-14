import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small', // or 'text-embedding-ada-002'
      input: text,
    })

    return response.data[0].embedding
  } catch (error) {
    throw new Error(`Failed to generate embedding: ${error}`)
  }
}

export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: texts,
    })

    return response.data.map((item) => item.embedding)
  } catch (error) {
    throw new Error(`Failed to generate embeddings: ${error}`)
  }
}

