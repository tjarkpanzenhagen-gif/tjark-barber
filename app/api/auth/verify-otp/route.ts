import { NextRequest, NextResponse } from 'next/server'
import { createAuthClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const { email, token } = await request.json()
  if (!email || !token) return NextResponse.json({ error: 'Fehlende Felder' }, { status: 400 })

  const supabase = await createAuthClient()
  const { data, error } = await supabase.auth.verifyOtp({ email, token, type: 'magiclink' })
  if (error) {
    console.error('verifyOtp error:', error)
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  const isNew = !data.user?.user_metadata?.full_name
  return NextResponse.json({ isNew })
}
