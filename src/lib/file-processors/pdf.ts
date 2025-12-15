import { PDFParse } from 'pdf-parse'

export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    const parser = new PDFParse({ data: new Uint8Array(buffer) })
    const result = await parser.getText()
    await parser.destroy()
    return result.text
  } catch (error) {
    throw new Error(`Failed to extract text from PDF: ${error}`)
  }
}
