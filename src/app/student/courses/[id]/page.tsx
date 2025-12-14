import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import ChatInterface from '@/components/student/ChatInterface'

export default async function StudentCoursePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Verify enrollment
  const { data: enrollment } = await supabase
    .from('course_enrollments')
    .select('*, courses(*)')
    .eq('course_id', id)
    .eq('student_id', user.id)
    .single()

  if (!enrollment) {
    notFound()
  }

  const course = enrollment.courses as any

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

