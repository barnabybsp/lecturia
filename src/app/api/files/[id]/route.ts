import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: courseId } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized. Create or sign in with a lecturer account first.' },
      { status: 401 }
    )
  }

  const adminClient = createAdminClient()

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

  const { data, error } = await adminClient
    .from('documents')
    .select('*')
    .eq('course_id', courseId)
    .order('uploaded_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json(data || [])
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get document and verify ownership
  const { data: document } = await supabase
    .from('documents')
    .select('*, courses(lecturer_id)')
    .eq('id', id)
    .single()

  if (!document) {
    return NextResponse.json({ error: 'Document not found' }, { status: 404 })
  }

  const course = document.courses as { lecturer_id: string } | null
  if (!course || course.lecturer_id !== user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const adminClient = createAdminClient()

  // Delete from storage
  await adminClient.storage
    .from('course-documents')
    .remove([document.storage_path])

  // Delete chunks
  await supabase.from('document_chunks').delete().eq('document_id', id)

  // Delete document record
  const { error } = await supabase.from('documents').delete().eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}
