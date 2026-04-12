import { NextRequest, NextResponse } from 'next/server'
import { isAdminAuthed, getAdminPassword } from '@/lib/admin-auth'

const COOKIE = 'admin_session'

// GET — check if already authed
export async function GET() {
  const authed = await isAdminAuthed()
  if (!authed) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return NextResponse.json({ authed: true })
}

// POST — validate password and set cookie
export async function POST(request: NextRequest) {
  const { password } = await request.json()
  const pw = getAdminPassword()
  if (!pw || password !== pw) {
    return NextResponse.json({ error: 'Falsches Passwort' }, { status: 401 })
  }
  const res = NextResponse.json({ success: true })
  res.cookies.set(COOKIE, pw, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })
  return res
}
