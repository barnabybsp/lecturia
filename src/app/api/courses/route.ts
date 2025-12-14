import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { name, description } = await request.json()

  if (!name) {
    return NextResponse.json(
      { error: 'Course name is required' },
      { status: 400 }
    )
  }

  // Generate unique invite code
  const adminClient = createAdminClient()
  const { data: inviteCodeData } = await adminClient.rpc('generate_invite_code')
  const inviteCode = inviteCodeData || Math.random().toString(36).substring(2, 10).toUpperCase()

  const { data, error } = await supabase
    .from('courses')
    .insert({
      lecturer_id: user.id,
      name,
      description: description || null,
      invite_code: inviteCode,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json(data)
}

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('lecturer_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json(data)
}

