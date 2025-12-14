import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import CourseDetails from '@/components/lecturer/CourseDetails'

export default async function CoursePage({
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

  const { data: course } = await supabase
    .from('courses')
    .select('*')
    .eq('id', id)
    .eq('lecturer_id', user.id)
    .single()

  if (!course) {
    notFound()
  }

  const { data: documents } = await supabase
    .from('documents')
    .select('*')
    .eq('course_id', id)
    .order('uploaded_at', { ascending: false })

  const { data: enrollments } = await supabase
    .from('course_enrollments')
    .select('*, users(email)')
    .eq('course_id', id)

  return (
    <CourseDetails
      course={course}
      documents={documents || []}
      enrollments={enrollments || []}
    />
  )
}

