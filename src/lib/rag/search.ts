import { createAdminClient } from '@/lib/supabase/admin'
import { generateEmbedding } from '@/lib/embeddings/openai'

export interface SearchResult {
  content: string
  document_id: string
  chunk_index: number
  similarity: number
}

export async function searchSimilarChunks(
  query: string,
  courseId: string,
  limit: number = 5
): Promise<SearchResult[]> {
  const adminClient = createAdminClient()

  // Generate embedding for query
  const queryEmbedding = await generateEmbedding(query)

  // Search for similar chunks using pgvector
  const { data, error } = await adminClient.rpc('match_document_chunks', {
    query_embedding: queryEmbedding,
    course_id: courseId,
    match_threshold: 0.7,
    match_count: limit,
  })

  if (error) {
    console.error('Vector search error:', error)
    return []
  }

  return (data || []).map((item: any) => ({
    content: item.content,
    document_id: item.document_id,
    chunk_index: item.chunk_index,
    similarity: item.similarity,
  }))
}

