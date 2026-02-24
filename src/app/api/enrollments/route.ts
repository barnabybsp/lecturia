import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function DELETE(request: Request) {
  const supabase = await createClient()
  const adminClient = createAdminClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized. Please sign in first.' },
      { status: 401 }
    )
  }

  const { data: userProfile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  if (userProfile?.role !== 'student') {
    return NextResponse.json(
      { error: 'Only students can leave classes.' },
      { status: 403 }
    )
  }

  const body = await request.json().catch(() => ({}))
  const courseId = typeof body.courseId === 'string' ? body.courseId : ''

  if (!courseId) {
    return NextResponse.json(
      { error: 'Course ID is required.' },
      { status: 400 }
    )
  }

  const { data: enrollment } = await adminClient
    .from('course_enrollments')
    .select('id')
    .eq('course_id', courseId)
    .eq('student_id', user.id)
    .maybeSingle()

  if (!enrollment) {
    return NextResponse.json(
      { error: 'You are not enrolled in this class.' },
      { status: 404 }
    )
  }

  const { error: conversationsDeleteError } = await adminClient
    .from('conversations')
    .delete()
    .eq('course_id', courseId)
    .eq('student_id', user.id)

  if (conversationsDeleteError) {
    return NextResponse.json(
      { error: 'Could not remove class conversations.' },
      { status: 500 }
    )
  }

  const { error: enrollmentDeleteError } = await adminClient
    .from('course_enrollments')
    .delete()
    .eq('course_id', courseId)
    .eq('student_id', user.id)

  if (enrollmentDeleteError) {
    return NextResponse.json(
      { error: 'Failed to leave class.' },
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true })
}
