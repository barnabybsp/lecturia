import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import CoursesList from '@/components/lecturer/CoursesList'
import CreateCourseButton from '@/components/lecturer/CreateCourseButton'

export default async function LecturerDashboard() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: courses } = await supabase
    .from('courses')
    .select('*')
    .eq('lecturer_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-3xl font-semibold text-gray-900">My Courses</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage your courses and upload materials for students
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <CreateCourseButton />
        </div>
      </div>
      <div className="mt-8">
        <CoursesList courses={courses || []} />
      </div>
    </div>
  )
}

