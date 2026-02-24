import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import LecturerDashboard from '@/components/lecturer/LecturerDashboard'

export const dynamic = 'force-dynamic'

export default async function LecturerPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: userProfile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (userProfile?.role !== 'lecturer') {
    redirect('/student')
  }

  const adminClient = createAdminClient()

  // Fetch only courses owned by this lecturer.
  const { data: courses } = await adminClient
    .from('courses')
    .select('*')
    .eq('lecturer_id', user.id)
    .order('created_at', { ascending: false })

  const courseIds = (courses || []).map((course) => course.id)
  let enrollmentCountByCourse = new Map<string, number>()

  if (courseIds.length > 0) {
    const { data: enrollments } = await adminClient
      .from('course_enrollments')
      .select('course_id')
      .in('course_id', courseIds)

    enrollmentCountByCourse = (enrollments || []).reduce<Map<string, number>>((acc, enrollment) => {
      const current = acc.get(enrollment.course_id) || 0
      acc.set(enrollment.course_id, current + 1)
      return acc
    }, new Map<string, number>())
  }

  // Transform the data to include enrollment_count
  const coursesWithEnrollment = (courses || []).map(course => ({
    ...course,
    enrollment_count: enrollmentCountByCourse.get(course.id) || 0,
  }))

  return (
    <LecturerDashboard
      initialCourses={coursesWithEnrollment}
      userEmail={user.email || 'lecturer@lecturia.dev'}
    />
  )
}
