import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { StudentDashboardLayout } from '@/components/student/StudentDashboardLayout'
import type { Course } from '@/types/database'

export default async function StudentDashboard() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: enrollments } = await supabase
    .from('course_enrollments')
    .select('*, courses(*)')
    .eq('student_id', user.id)
    .order('enrolled_at', { ascending: false })

  const courses = (enrollments?.map((enrollment) => enrollment.courses).filter((course): course is Course => course !== null) || []) as Course[]

  // Get user metadata for display
  const userName = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0]
  const userEmail = user.email

  return <StudentDashboardLayout courses={courses} userName={userName} userEmail={userEmail} />
}

