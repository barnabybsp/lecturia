import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { StudentDashboardLayout } from '@/components/student/StudentDashboardLayout'
import type { Course } from '@/types/database'

export default async function StudentDashboard() {
  // TEMPORARILY DISABLED FOR DEVELOPMENT - Authentication checks commented out
  // TODO: Re-enable authentication once lecturer and student dashboards are built
  
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // if (!user) {
  //   redirect('/auth/login')
  // }

  // Temporarily fetch all courses for development (remove student_id filter)
  const { data: enrollments } = await supabase
    .from('course_enrollments')
    .select('*, courses(*)')
    // .eq('student_id', user.id) // Temporarily disabled for development
    .order('enrolled_at', { ascending: false })

  const courses = (enrollments?.map((enrollment) => enrollment.courses).filter((course): course is Course => course !== null) || []) as Course[]

  // Get user metadata for display (with fallback for development)
  const userName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'Student'
  const userEmail = user?.email || 'student@lecturia.dev'

  return <StudentDashboardLayout courses={courses} userName={userName} userEmail={userEmail} />
}

