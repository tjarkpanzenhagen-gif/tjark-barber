import { NextRequest, NextResponse } from 'next/server'
import { createImplicitAuthClient, createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const { email, token } = await request.json()
  if (!email || !token) return NextResponse.json({ error: 'Fehlende Felder' }, { status: 400 })

  // Use the implicit client (bypasses @supabase/ssr's forced PKCE) to verify the OTP
  const implicitClient = createImplicitAuthClient()
  const { data, error } = await implicitClient.auth.verifyOtp({ email, token, type: 'magiclink' })
  if (error) {
    console.error('verifyOtp error:', error)
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  // Store the session in cookies via the SSR client so subsequent requests are authenticated
  if (data.session) {
    const supabase = await createClient()
    await supabase.auth.setSession({
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
    })
  }

  const isNew = !data.user?.user_metadata?.full_name
  return NextResponse.json({ isNew })
}
