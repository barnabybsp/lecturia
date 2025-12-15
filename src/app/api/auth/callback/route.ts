import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/dashboard'

  if (code) {
    // Create the redirect response first - cookies will be set on this
    const redirectUrl = new URL(next, requestUrl.origin)
    let response = NextResponse.redirect(redirectUrl)
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              request.cookies.set(name, value)
              response.cookies.set(name, value, options)
            })
          },
        },
      }
    )
    
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('Auth callback error:', error)
      return NextResponse.redirect(new URL('/auth/login?error=auth_failed', requestUrl.origin))
    }

    if (data.user) {
      // Update user role if provided in metadata
      const role = data.user.user_metadata?.role
      if (role) {
        const adminClient = createAdminClient()
        await adminClient
          .from('users')
          .update({ role })
          .eq('id', data.user.id)
      }

      // Return the redirect response with cookies already set
      return response
    }
  }

  // Return error or redirect to login
  return NextResponse.redirect(new URL('/auth/login', requestUrl.origin))
}

