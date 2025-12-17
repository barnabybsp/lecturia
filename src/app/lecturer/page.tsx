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

  // Fetch courses with enrollment counts
  const { data: courses } = await supabase
    .from('courses')
    .select(`
      *,
      course_enrollments(count)
    `)
    .eq('lecturer_id', user.id)
    .order('created_at', { ascending: false })

  // Transform the data to include enrollment_count
  const coursesWithEnrollment = (courses || []).map(course => ({
    ...course,
    enrollment_count: course.course_enrollments?.[0]?.count || 0,
  }))

  return (
    <LecturerDashboard 
      initialCourses={coursesWithEnrollment} 
      userEmail={user.email || ''} 
    />
  )
}
