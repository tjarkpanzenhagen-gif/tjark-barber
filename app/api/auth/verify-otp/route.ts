import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const { email, token } = await request.json()
  if (!email || !token) return NextResponse.json({ error: 'Fehlende Felder' }, { status: 400 })

  const supabase = await createClient()
  const { data, error } = await supabase.auth.verifyOtp({ email, token, type: 'email' })
  if (error) return NextResponse.json({ error: 'Code ungültig oder abgelaufen.' }, { status: 400 })

  const isNew = !data.user?.user_metadata?.full_name
  return NextResponse.json({ isNew })
}
