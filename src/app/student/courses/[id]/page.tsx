import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import ChatInterface from '@/components/student/ChatInterface'

export default async function StudentCoursePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  // TEMPORARILY DISABLED FOR DEVELOPMENT - Authentication checks commented out
  // TODO: Re-enable authentication once lecturer and student dashboards are built
  
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // if (!user) {
  //   redirect('/auth/login')
  // }

  // Verify enrollment - Temporarily fetch course directly for development
  const { data: course } = await supabase
    .from('courses')
    .select('*')
    .eq('id', id)
    .single()

  // const { data: enrollment } = await supabase
  //   .from('course_enrollments')
  //   .select('*, courses(*)')
  //   .eq('course_id', id)
  //   .eq('student_id', user.id) // Temporarily disabled for development
  //   .single()

  if (!course) {
    notFound()
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-semibold text-gray-900">{course.name}</h1>
        {course.description && (
          <p className="mt-2 text-sm text-gray-600">{course.description}</p>
        )}
      </div>
      <ChatInterface courseId={id} />
    </div>
  )
}

