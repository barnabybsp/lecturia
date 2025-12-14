export async function extractTextFromText(buffer: Buffer): Promise<string> {
  try {
    return buffer.toString('utf-8')
  } catch (error) {
    throw new Error(`Failed to extract text from text file: ${error}`)
  }
}

