import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  const { email, password, role } = await request.json()
  const requestUrl = new URL(request.url)

  if (!email || !password) {
    return NextResponse.json(
      { error: 'Email and password are required' },
      { status: 400 }
    )
  }

  if (password.length < 6) {
    return NextResponse.json(
      { error: 'Password must be at least 6 characters' },
      { status: 400 }
    )
  }

  if (!role || (role !== 'lecturer' && role !== 'student')) {
    return NextResponse.json(
      { error: 'Valid role (lecturer or student) is required' },
      { status: 400 }
    )
  }

  let response = NextResponse.json({})

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

  // Sign up the user with Supabase Auth (no email confirmation required)
  const { data: authData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${requestUrl.origin}/api/auth/callback?next=/dashboard`,
      data: {
        role, // Store role in user metadata for later use
      },
      // Disable email confirmation requirement
      emailConfirmationRequired: false,
    },
  })

  if (signUpError) {
    return NextResponse.json(
      { error: signUpError.message || 'Failed to create account' },
      { status: 400 }
    )
  }

  if (!authData.user) {
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    )
  }

  // Store role in users table using admin client
  const adminClient = createAdminClient()
  const { error: userError } = await adminClient
    .from('users')
    .upsert({
      id: authData.user.id,
      email: authData.user.email!,
      role,
    }, {
      onConflict: 'id'
    })

  if (userError) {
    console.error('Failed to store user role:', userError)
    // Don't fail the signup if role storage fails - it can be set later
  }

  // Update response with success message
  response = NextResponse.json({
    message: 'Account created successfully. You are now signed in.',
    user: {
      id: authData.user.id,
      email: authData.user.email,
    },
    session: authData.session,
  })

  return response
}


