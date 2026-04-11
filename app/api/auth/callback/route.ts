import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type')

  const supabase = await createClient()

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) return NextResponse.redirect(`${origin}/login?error=link_invalid`)
  } else if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as 'recovery' | 'email' | 'signup' | 'magiclink' | 'invite' | 'email_change',
    })
    if (error) return NextResponse.redirect(`${origin}/login?error=link_invalid`)
  } else {
    return NextResponse.redirect(`${origin}/login?error=link_invalid`)
  }

  // Check if new user (no name set yet)
  const { data: { user } } = await supabase.auth.getUser()
  const isNew = !user?.user_metadata?.full_name

  if (isNew) {
    return NextResponse.redirect(`${origin}/login?step=name`)
  }

  return NextResponse.redirect(`${origin}/book`)
}
