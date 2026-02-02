import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  const { email, password } = await request.json()
  const requestUrl = new URL(request.url)

  if (!email || !password) {
    return NextResponse.json(
      { error: 'Email and password are required' },
      { status: 400 }
    )
  }

  // Create response with redirect to dashboard (will be updated based on role)
  const redirectUrl = new URL('/dashboard', requestUrl.origin)
  let response = NextResponse.redirect(redirectUrl)

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

  // Session is automatically set via cookies in the response
  return response
}
