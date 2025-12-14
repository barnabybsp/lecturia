import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import { getProcessor, canProcessFile, chunkText } from '@/lib/file-processors'
import { generateEmbeddings } from '@/lib/embeddings/openai'

export async function POST(request: Request) {
  const { documentIds } = await request.json()

  if (!documentIds || !Array.isArray(documentIds)) {
    return NextResponse.json(
      { error: 'documentIds array is required' },
      { status: 400 }
    )
  }

  const adminClient = createAdminClient()

  for (const documentId of documentIds) {
    try {
      // Get document
      const { data: document } = await adminClient
        .from('documents')
        .select('*, courses(id)')
        .eq('id', documentId)
        .single()

      if (!document) {
        console.error(`Document ${documentId} not found`)
        continue
      }

      const course = document.courses as { id: string }

      // Check if chunks already exist
      const { data: existingChunks } = await adminClient
        .from('document_chunks')
        .select('id')
        .eq('document_id', documentId)
        .limit(1)

      if (existingChunks && existingChunks.length > 0) {
        console.log(`Document ${documentId} already has chunks`)
        continue
      }

      // Download file from storage
      const { data: fileData, error: downloadError } = await adminClient.storage
        .from('course-documents')
        .download(document.storage_path)

      if (downloadError || !fileData) {
        console.error(`Failed to download file: ${downloadError}`)
        continue
      }

      const buffer = Buffer.from(await fileData.arrayBuffer())

      // Extract text
      if (!canProcessFile(document.file_type)) {
        console.log(`Cannot process file type: ${document.file_type}`)
        continue
      }

      const processor = getProcessor(document.file_type)
      if (!processor) {
        console.log(`No processor for file type: ${document.file_type}`)
        continue
      }

      const text = await processor.extractText(buffer)

      if (!text || text.trim().length === 0) {
        console.log(`No text extracted from document ${documentId}`)
        continue
      }

      // Chunk text
      const chunks = chunkText(text, 1000, 200)

      if (chunks.length === 0) {
        console.log(`No chunks created for document ${documentId}`)
        continue
      }

      // Generate embeddings in batches
      const batchSize = 100
      for (let i = 0; i < chunks.length; i += batchSize) {
        const batch = chunks.slice(i, i + batchSize)
        const embeddings = await generateEmbeddings(batch)

        // Insert chunks with embeddings
        const chunkRecords = batch.map((chunk, index) => ({
          document_id: documentId,
          course_id: course.id,
          content: chunk,
          chunk_index: i + index,
          embedding: embeddings[index],
        }))

        const { error: insertError } = await adminClient
          .from('document_chunks')
          .insert(chunkRecords)

        if (insertError) {
          console.error(`Error inserting chunks: ${insertError}`)
        }
      }

      console.log(`Processed ${chunks.length} chunks for document ${documentId}`)
    } catch (error) {
      console.error(`Error processing document ${documentId}:`, error)
      continue
    }
  }

  return NextResponse.json({ success: true })
}

