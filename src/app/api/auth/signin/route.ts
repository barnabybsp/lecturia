import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  const { email, role } = await request.json()
  const requestUrl = new URL(request.url)

  if (!email || !role) {
    return NextResponse.json(
      { error: 'Email and role are required' },
      { status: 400 }
    )
  }

  if (role !== 'lecturer' && role !== 'student') {
    return NextResponse.json(
      { error: 'Invalid role' },
      { status: 400 }
    )
  }

  const adminClient = createAdminClient()
  
  // List users and find by email
  const { data: usersData, error: listError } = await adminClient.auth.admin.listUsers()
  
  if (listError) {
    return NextResponse.json(
      { error: 'Failed to check users' },
      { status: 500 }
    )
  }

  const existingUser = usersData.users.find(u => u.email === email)
  
  if (!existingUser) {
    return NextResponse.json(
      { error: 'User not found. Please contact an administrator to create your account.' },
      { status: 404 }
    )
  }

  // Update user role in users table
  await adminClient
    .from('users')
    .upsert({
      id: existingUser.id,
      email: existingUser.email!,
      role,
    }, {
      onConflict: 'id'
    })

  // Generate a magic link for the user to sign in
  const { data: linkData, error: linkError } = await adminClient.auth.admin.generateLink({
    type: 'magiclink',
    email: email,
    options: {
      redirectTo: `${requestUrl.origin}/api/auth/callback?role=${role}`,
    }
  })

  if (linkError || !linkData) {
    return NextResponse.json(
      { error: linkError?.message || 'Failed to generate sign-in link' },
      { status: 400 }
    )
  }

  // For development, we can use the token directly to create a session
  // In production, you would send this link via email
  const { data: sessionData, error: verifyError } = await adminClient.auth.verifyOtp({
    token_hash: linkData.properties.hashed_token,
    type: 'magiclink',
  })

  if (verifyError || !sessionData.session) {
    return NextResponse.json(
      { error: verifyError?.message || 'Failed to verify sign-in' },
      { status: 400 }
    )
  }

  // Create response with redirect to appropriate dashboard
  const dashboardPath = role === 'lecturer' ? '/lecturer' : '/student'
  const redirectUrl = new URL(dashboardPath, requestUrl.origin)
  let response = NextResponse.redirect(redirectUrl)

  // Set session using the regular client to properly handle cookies
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

  // Set the session
  const { error: setSessionError } = await supabase.auth.setSession({
    access_token: sessionData.session.access_token,
    refresh_token: sessionData.session.refresh_token,
  })

  if (setSessionError) {
    return NextResponse.json(
      { error: setSessionError.message || 'Failed to set session' },
      { status: 400 }
    )
  }

  return response
}
