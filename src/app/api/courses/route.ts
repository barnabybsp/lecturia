import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { name, description } = await request.json()

  if (!name) {
    return NextResponse.json(
      { error: 'Course name is required' },
      { status: 400 }
    )
  }

  // Generate unique invite code
  const adminClient = createAdminClient()
  const { data: inviteCodeData } = await adminClient.rpc('generate_invite_code')
  const inviteCode = inviteCodeData || Math.random().toString(36).substring(2, 10).toUpperCase()

  // Use admin client to bypass RLS and avoid infinite recursion in policies
  // We've already verified the user is authenticated, so this is safe
  const { data, error } = await adminClient
    .from('courses')
    .insert({
      lecturer_id: user.id,
      name,
      description: description || null,
      invite_code: inviteCode,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json(data)
}

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('lecturer_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json(data)
}

export async function DELETE(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const courseId = searchParams.get('id')

  if (!courseId) {
    return NextResponse.json(
      { error: 'Course ID is required' },
      { status: 400 }
    )
  }

  // Use admin client to bypass RLS for both verification and deletion
  // We've already verified the user is authenticated, so this is safe
  const adminClient = createAdminClient()
  
  // Verify the user owns this course
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

  // Delete the course
  const { error } = await adminClient
    .from('courses')
    .delete()
    .eq('id', courseId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}

