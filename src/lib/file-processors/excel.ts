import * as XLSX from 'xlsx'

export async function extractTextFromExcel(buffer: Buffer): Promise<string> {
  try {
    const workbook = XLSX.read(buffer, { type: 'buffer' })
    let text = ''

    workbook.SheetNames.forEach((sheetName) => {
      const sheet = workbook.Sheets[sheetName]
      const sheetData = XLSX.utils.sheet_to_json(sheet, { header: 1 })
      
      sheetData.forEach((row: any) => {
        if (Array.isArray(row)) {
          text += row.join(' ') + '\n'
        }
      })
    })

    return text
  } catch (error) {
    throw new Error(`Failed to extract text from Excel file: ${error}`)
  }
}

