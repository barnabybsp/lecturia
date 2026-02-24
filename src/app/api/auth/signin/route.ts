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
    let effectiveRole: 'lecturer' | 'student' | null =
      roleFromMetadata === 'lecturer' || roleFromMetadata === 'student'
        ? roleFromMetadata
        : null

    if (!effectiveRole) {
      const { data: existingProfile } = await adminClient
        .from('users')
        .select('role')
        .eq('id', authData.user.id)
        .maybeSingle()

      if (existingProfile?.role === 'lecturer' || existingProfile?.role === 'student') {
        effectiveRole = existingProfile.role
      }
    }

    if (effectiveRole) {
      const { error } = await adminClient
        .from('users')
        .upsert(
          {
            id: authData.user.id,
            email: authData.user.email!,
            role: effectiveRole,
          },
          {
            onConflict: 'id',
          }
        )

      if (error) {
        console.error('Failed to sync user profile:', error)
      }

      // If this account exists under older user IDs with the same email,
      // reassign owned records to the current authenticated user ID.
      if (authData.user.email) {
        const { data: matchingUsers, error: matchingUsersError } = await adminClient
          .from('users')
          .select('id')
          .eq('role', effectiveRole)
          .ilike('email', authData.user.email)

        if (matchingUsersError) {
          console.error('Failed to lookup matching user profiles:', matchingUsersError)
        } else {
          const legacyUserIds = (matchingUsers || [])
            .map((row) => row.id)
            .filter((id) => id !== authData.user.id)

          if (legacyUserIds.length > 0) {
            if (effectiveRole === 'lecturer') {
              const { error: migrationError } = await adminClient
                .from('courses')
                .update({ lecturer_id: authData.user.id })
                .in('lecturer_id', legacyUserIds)

              if (migrationError) {
                console.error('Failed to migrate lecturer courses:', migrationError)
              }
            }

            if (effectiveRole === 'student') {
              const { data: legacyEnrollments, error: legacyEnrollmentsError } = await adminClient
                .from('course_enrollments')
                .select('id, course_id')
                .in('student_id', legacyUserIds)

              if (legacyEnrollmentsError) {
                console.error('Failed to lookup legacy student enrollments:', legacyEnrollmentsError)
              } else {
                const { data: currentEnrollments, error: currentEnrollmentsError } = await adminClient
                  .from('course_enrollments')
                  .select('course_id')
                  .eq('student_id', authData.user.id)

                if (currentEnrollmentsError) {
                  console.error('Failed to lookup current student enrollments:', currentEnrollmentsError)
                } else {
                  const currentCourseIds = new Set(
                    (currentEnrollments || []).map((enrollment) => enrollment.course_id)
                  )
                  const duplicateLegacyEnrollmentIds = (legacyEnrollments || [])
                    .filter((enrollment) => currentCourseIds.has(enrollment.course_id))
                    .map((enrollment) => enrollment.id)
                  const migratableLegacyEnrollmentIds = (legacyEnrollments || [])
                    .filter((enrollment) => !currentCourseIds.has(enrollment.course_id))
                    .map((enrollment) => enrollment.id)

                  if (duplicateLegacyEnrollmentIds.length > 0) {
                    const { error: duplicateDeleteError } = await adminClient
                      .from('course_enrollments')
                      .delete()
                      .in('id', duplicateLegacyEnrollmentIds)

                    if (duplicateDeleteError) {
                      console.error('Failed to remove duplicate student enrollments:', duplicateDeleteError)
                    }
                  }

                  if (migratableLegacyEnrollmentIds.length > 0) {
                    const { error: enrollmentMigrationError } = await adminClient
                      .from('course_enrollments')
                      .update({ student_id: authData.user.id })
                      .in('id', migratableLegacyEnrollmentIds)

                    if (enrollmentMigrationError) {
                      console.error('Failed to migrate student enrollments:', enrollmentMigrationError)
                    }
                  }
                }
              }

              const { error: conversationMigrationError } = await adminClient
                .from('conversations')
                .update({ student_id: authData.user.id })
                .in('student_id', legacyUserIds)

              if (conversationMigrationError) {
                console.error('Failed to migrate student conversations:', conversationMigrationError)
              }
            }
          }
        }
      }
    }
  } catch (error) {
    console.error('Failed to sync user profile:', error)
  }

  // Session is automatically set via cookies in the response
  return response
}
