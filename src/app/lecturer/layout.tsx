import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import LecturerNav from '@/components/lecturer/LecturerNav'

export default async function LecturerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (userData?.role !== 'lecturer') {
    redirect('/student')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <LecturerNav />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
}

