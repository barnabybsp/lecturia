import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function LecturerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // TEMPORARILY DISABLED FOR DEVELOPMENT - Authentication checks commented out
  // TODO: Re-enable authentication once lecturer and student dashboards are built
  
  // const supabase = await createClient()
  // const {
  //   data: { user },
  // } = await supabase.auth.getUser()

  // if (!user) {
  //   redirect('/auth/login')
  // }

  // const { data: userData } = await supabase
  //   .from('users')
  //   .select('role')
  //   .eq('id', user.id)
  //   .single()

  // if (userData?.role !== 'lecturer') {
  //   redirect('/student')
  // }

  // The new dashboard component handles its own layout
  return <>{children}</>
}
