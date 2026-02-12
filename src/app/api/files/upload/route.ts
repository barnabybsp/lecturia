import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import { getMimeType } from '@/lib/file-processors'

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const formData = await request.formData()
  const files = [
    ...(formData.getAll('files') as File[]),
    formData.get('file') as File | null,
  ].filter(Boolean) as File[]
  const courseId = formData.get('courseId') as string

  if (!courseId) {
    return NextResponse.json(
      { error: 'Course ID is required' },
      { status: 400 }
    )
  }
  if (files.length === 0) {
    return NextResponse.json(
      { error: 'No files provided' },
      { status: 400 }
    )
  }

  const adminClient = createAdminClient()

  // Verify course exists and user is lecturer for this course (bypass RLS)
  const { data: course } = await adminClient
    .from('courses')
    .select('lecturer_id')
    .eq('id', courseId)
    .single()

  if (!course) {
    return NextResponse.json({ error: 'Course not found' }, { status: 404 })
  }

  if (course.lecturer_id !== user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const uploadedDocuments = []

  for (const file of files) {
    try {
      const mimeType = getMimeType(file.name)
      
      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `${courseId}/${fileName}`

      const fileBuffer = Buffer.from(await file.arrayBuffer())
      
      const { error: uploadError } = await adminClient.storage
        .from('course-documents')
        .upload(filePath, fileBuffer, {
          contentType: mimeType,
          upsert: false,
        })

      if (uploadError) {
        console.error('Storage upload error:', uploadError)
        continue
      }

      // Create document record
      const { data: document, error: docError } = await supabase
        .from('documents')
        .insert({
          course_id: courseId,
          name: file.name,
          file_type: mimeType,
          file_size: file.size,
          storage_path: filePath,
        })
        .select()
        .single()

      if (docError) {
        console.error('Document creation error:', docError)
        // Clean up uploaded file
        await adminClient.storage.from('course-documents').remove([filePath])
        continue
      }

      uploadedDocuments.push(document)
    } catch (error) {
      console.error('Error processing file:', error)
      continue
    }
  }

  // Trigger embedding generation for uploaded documents asynchronously
  if (uploadedDocuments.length > 0) {
    // Process embeddings in background (don't await)
    fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/files/generate-embeddings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(process.env.INTERNAL_API_KEY
          ? { 'x-internal-key': process.env.INTERNAL_API_KEY }
          : {}),
      },
      body: JSON.stringify({
        documentIds: uploadedDocuments.map((d) => d.id),
      }),
    }).catch((err) => {
      console.error('Failed to trigger embedding generation:', err)
    })
  }

  return NextResponse.json({
    success: true,
    documents: uploadedDocuments,
  })
}
