import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import CoursesList from '@/components/student/CoursesList'

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

  const courses = enrollments?.map((enrollment) => enrollment.courses) || []

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-3xl font-semibold text-gray-900">My Courses</h1>
          <p className="mt-2 text-sm text-gray-700">
            Access your enrolled courses and chat with AI about course materials
          </p>
        </div>
      </div>
      <div className="mt-8">
        <CoursesList courses={courses} />
      </div>
    </div>
  )
}

