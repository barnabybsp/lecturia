import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

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

  const course = document.courses as { lecturer_id: string }
  if (course.lecturer_id !== user.id) {
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

