import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { inviteCode } = await request.json()

  if (!inviteCode) {
    return NextResponse.json(
      { error: 'Invite code is required' },
      { status: 400 }
    )
  }

  // Find course by invite code
  const { data: course, error: courseError } = await supabase
    .from('courses')
    .select('id')
    .eq('invite_code', inviteCode)
    .single()

  if (courseError || !course) {
    return NextResponse.json(
      { error: 'Invalid invite code' },
      { status: 404 }
    )
  }

  // Check if already enrolled
  const { data: existingEnrollment } = await supabase
    .from('course_enrollments')
    .select('id')
    .eq('course_id', course.id)
    .eq('student_id', user.id)
    .single()

  if (existingEnrollment) {
    return NextResponse.json(
      { error: 'Already enrolled in this course' },
      { status: 400 }
    )
  }

  // Enroll student
  const { data: enrollment, error: enrollError } = await supabase
    .from('course_enrollments')
    .insert({
      course_id: course.id,
      student_id: user.id,
    })
    .select()
    .single()

  if (enrollError) {
    return NextResponse.json({ error: enrollError.message }, { status: 400 })
  }

  return NextResponse.json({ success: true, enrollment })
}

