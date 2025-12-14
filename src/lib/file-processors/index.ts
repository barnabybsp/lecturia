import { extractTextFromPDF } from './pdf'
import { extractTextFromWord } from './word'
import { extractTextFromExcel } from './excel'
import { extractTextFromText } from './text'

export interface FileProcessor {
  extractText: (buffer: Buffer) => Promise<string>
}

const processors: Record<string, FileProcessor> = {
  'application/pdf': { extractText: extractTextFromPDF },
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': {
    extractText: extractTextFromWord,
  },
  'application/msword': { extractText: extractTextFromWord },
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': {
    extractText: extractTextFromExcel,
  },
  'application/vnd.ms-excel': { extractText: extractTextFromExcel },
  'text/plain': { extractText: extractTextFromText },
  'text/markdown': { extractText: extractTextFromText },
  'text/csv': { extractText: extractTextFromText },
}

// File extension to mime type mapping
const extensionToMimeType: Record<string, string> = {
  pdf: 'application/pdf',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  doc: 'application/msword',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  xls: 'application/vnd.ms-excel',
  txt: 'text/plain',
  md: 'text/markdown',
  csv: 'text/csv',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  ppt: 'application/vnd.ms-powerpoint',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
}

export function getMimeType(filename: string): string {
  const extension = filename.split('.').pop()?.toLowerCase() || ''
  return extensionToMimeType[extension] || 'application/octet-stream'
}

export function getProcessor(mimeType: string): FileProcessor | null {
  return processors[mimeType] || null
}

export function canProcessFile(mimeType: string): boolean {
  return mimeType in processors
}

// Chunk text into smaller pieces for embedding
export function chunkText(text: string, chunkSize: number = 1000, overlap: number = 200): string[] {
  const chunks: string[] = []
  let start = 0

  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length)
    let chunk = text.slice(start, end)

    // Try to break at sentence boundaries
    if (end < text.length) {
      const lastPeriod = chunk.lastIndexOf('.')
      const lastNewline = chunk.lastIndexOf('\n')
      const breakPoint = Math.max(lastPeriod, lastNewline)
      
      if (breakPoint > chunkSize * 0.5) {
        chunk = chunk.slice(0, breakPoint + 1)
        start += breakPoint + 1 - overlap
      } else {
        start = end - overlap
      }
    } else {
      start = end
    }

    chunks.push(chunk.trim())
  }

  return chunks.filter((chunk) => chunk.length > 0)
}

