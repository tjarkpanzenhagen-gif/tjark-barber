import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const { email, password, full_name } = await request.json()
  if (!email || !password || !full_name) {
    return NextResponse.json({ error: 'Fehlende Felder' }, { status: 400 })
  }
  if (password.length < 6) {
    return NextResponse.json({ error: 'Passwort muss mindestens 6 Zeichen haben' }, { status: 400 })
  }

  const supabase = await createAdminClient()
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    user_metadata: { full_name },
    email_confirm: true, // direkt bestätigt, kein E-Mail Confirm nötig
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ user: data.user }, { status: 201 })
}
