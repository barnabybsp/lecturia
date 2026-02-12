import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const adminClient = createAdminClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json(
      { error: 'You must be logged in to join a class.' },
      { status: 401 }
    )
  }

  const { inviteCode } = await request.json()

  const normalizedCode =
    typeof inviteCode === 'string'
      ? inviteCode.replace(/\s+/g, '').toUpperCase()
      : ''

  if (!normalizedCode) {
    return NextResponse.json(
      { error: 'Invite code is required.' },
      { status: 400 }
    )
  }

  // Find course by invite code (use admin client to bypass RLS)
  const { data: course, error: courseError } = await adminClient
    .from('courses')
    .select('id')
    .eq('invite_code', normalizedCode)
    .single()

  if (courseError || !course) {
    return NextResponse.json(
      {
        error:
          'That invite code does not match any class. Copy it from the lecturer dashboard and try again.',
      },
      { status: 404 }
    )
  }

  // Check if already enrolled
  const { data: existingEnrollment } = await adminClient
    .from('course_enrollments')
    .select('id')
    .eq('course_id', course.id)
    .eq('student_id', user.id)
    .maybeSingle()

  if (existingEnrollment) {
    return NextResponse.json(
      { error: 'Already enrolled in this course' },
      { status: 400 }
    )
  }

  // Enroll student (use admin client to bypass RLS recursion)
  const { data: enrollment, error: enrollError } = await adminClient
    .from('course_enrollments')
    .upsert(
      {
        course_id: course.id,
        student_id: user.id,
      },
      {
        onConflict: 'course_id,student_id',
      }
    )
    .select()
    .single()

  if (enrollError) {
    return NextResponse.json({ error: enrollError.message }, { status: 400 })
  }

  return NextResponse.json({ success: true, enrollment })
}

