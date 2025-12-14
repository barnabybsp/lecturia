import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/'

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      // Update user role if provided in metadata
      const role = data.user.user_metadata?.role
      if (role) {
        const adminClient = createAdminClient()
        await adminClient
          .from('users')
          .update({ role })
          .eq('id', data.user.id)
      }

      // Redirect to appropriate dashboard
      const redirectUrl = new URL(next, requestUrl.origin)
      return NextResponse.redirect(redirectUrl)
    }
  }

  // Return error or redirect to login
  return NextResponse.redirect(new URL('/auth/login', requestUrl.origin))
}

