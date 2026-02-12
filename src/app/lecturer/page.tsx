import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import LecturerDashboard from '@/components/lecturer/LecturerDashboard'

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

  // Fetch courses with enrollment counts
  // Fetch only courses owned by the lecturer
  const coursesQuery = supabase
    .from('courses')
    .select(`
      *,
      course_enrollments(count)
    `)
    .order('created_at', { ascending: false })

  const { data: courses } = await coursesQuery.eq('lecturer_id', user.id)

  // Transform the data to include enrollment_count
  const coursesWithEnrollment = (courses || []).map(course => ({
    ...course,
    enrollment_count: course.course_enrollments?.[0]?.count || 0,
  }))

  return (
    <LecturerDashboard
      initialCourses={coursesWithEnrollment}
      userEmail={user.email || 'lecturer@lecturia.dev'}
    />
  )
}
