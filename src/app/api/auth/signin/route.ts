import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  const { email, password } = await request.json()
  const requestUrl = new URL(request.url)
  if (!email || !password) {
    return NextResponse.json(
      { error: 'Email and password are required' },
      { status: 400 }
    )
  }

  // Create JSON response so fetch() callers can parse it reliably
  // Client will handle redirect after successful sign-in.
  const redirectUrl = new URL('/dashboard', requestUrl.origin)
  let response = NextResponse.json({ success: true, redirectTo: redirectUrl.pathname })

  // Create Supabase client for authentication
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

  // Sign in with email and password
  const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (signInError) {
    return NextResponse.json(
      { error: signInError.message || 'Invalid email or password' },
      { status: 401 }
    )
  }

  if (!authData.session || !authData.user) {
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    )
  }

  try {
    const adminClient = createAdminClient()
    const roleFromMetadata = authData.user.user_metadata?.role
    if (roleFromMetadata) {
      const { error } = await adminClient
        .from('users')
        .upsert(
          {
            id: authData.user.id,
            email: authData.user.email!,
            role: roleFromMetadata,
          },
          {
            onConflict: 'id',
          }
        )

      if (error) {
        console.error('Failed to sync user profile:', error)
      }
    }
  } catch (error) {
    console.error('Failed to sync user profile:', error)
  }

  // Session is automatically set via cookies in the response
  return response
}
