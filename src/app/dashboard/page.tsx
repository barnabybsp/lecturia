import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
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

  // if (userData?.role === 'lecturer') {
  //   redirect('/lecturer')
  // } else {
  //   redirect('/student')
  // }

  // Temporarily redirect to lecturer dashboard for development
  redirect('/lecturer')
}

