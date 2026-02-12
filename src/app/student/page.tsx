import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import { StudentDashboardLayout } from '@/components/student/StudentDashboardLayout'
import type { Course } from '@/types/database'

export const dynamic = 'force-dynamic'

export default async function StudentDashboard() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const adminClient = createAdminClient()

  const { data: enrollments } = await adminClient
    .from('course_enrollments')
    .select('course_id, courses(*)')
    .eq('student_id', user.id)
    .order('enrolled_at', { ascending: false })

  const courses = (enrollments
    ?.map((enrollment) => enrollment.courses as unknown as Course)
    .filter((course): course is Course => course !== null)) ?? []

  // Get user metadata for display (with fallback for development)
  const userName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'Student'
  const userEmail = user?.email || 'student@lecturia.dev'

  return <StudentDashboardLayout courses={courses} userName={userName} userEmail={userEmail} />
}

