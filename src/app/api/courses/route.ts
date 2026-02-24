import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: Request) {
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

  const { data: userProfile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (userProfile?.role !== 'lecturer') {
    return NextResponse.json(
      { error: 'Only lecturers can create courses.' },
      { status: 403 }
    )
  }

  const adminClient = createAdminClient()
  const lecturerId = user.id

  const { name, description } = await request.json()

  if (!name) {
    return NextResponse.json(
      { error: 'Course name is required' },
      { status: 400 }
    )
  }

  // Generate unique invite code
  const { data: inviteCodeData } = await adminClient.rpc('generate_invite_code')
  const inviteCode = inviteCodeData || Math.random().toString(36).substring(2, 10).toUpperCase()

  // Use admin client to bypass RLS and avoid infinite recursion in policies
  // We've already verified the user is authenticated, so this is safe
  const { data, error } = await adminClient
    .from('courses')
    .insert({
      lecturer_id: lecturerId,
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
    return NextResponse.json(
      { error: 'Unauthorized. Create or sign in with a lecturer account first.' },
      { status: 401 }
    )
  }

  const { data: userProfile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (userProfile?.role !== 'lecturer') {
    return NextResponse.json(
      { error: 'Only lecturers can view their courses.' },
      { status: 403 }
    )
  }

  const adminClient = createAdminClient()
  const lecturerId = user.id

  const { data: courses, error } = await adminClient
    .from('courses')
    .select('*')
    .eq('lecturer_id', lecturerId)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  const courseIds = (courses || []).map((course) => course.id)
  let enrollmentCountByCourse = new Map<string, number>()

  if (courseIds.length > 0) {
    const { data: enrollments, error: enrollmentError } = await adminClient
      .from('course_enrollments')
      .select('course_id')
      .in('course_id', courseIds)

    if (enrollmentError) {
      return NextResponse.json({ error: enrollmentError.message }, { status: 400 })
    }

    enrollmentCountByCourse = (enrollments || []).reduce<Map<string, number>>((acc, enrollment) => {
      const current = acc.get(enrollment.course_id) || 0
      acc.set(enrollment.course_id, current + 1)
      return acc
    }, new Map<string, number>())
  }

  const coursesWithEnrollment = (courses || []).map((course) => ({
    ...course,
    enrollment_count: enrollmentCountByCourse.get(course.id) || 0,
  }))

  return NextResponse.json(coursesWithEnrollment)
}

export async function DELETE(request: Request) {
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

  const { data: userProfile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (userProfile?.role !== 'lecturer') {
    return NextResponse.json(
      { error: 'Only lecturers can delete courses.' },
      { status: 403 }
    )
  }

  const adminClient = createAdminClient()
  const lecturerId = user.id

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
  // Verify the user owns this course
  const { data: course } = await adminClient
    .from('courses')
    .select('lecturer_id')
    .eq('id', courseId)
    .single()

  if (!course) {
    return NextResponse.json({ error: 'Course not found' }, { status: 404 })
  }

  if (course.lecturer_id !== lecturerId) {
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
