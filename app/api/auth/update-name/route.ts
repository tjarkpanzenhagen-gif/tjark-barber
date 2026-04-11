import { NextRequest, NextResponse } from 'next/server'
import { createAuthClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const { name } = await request.json()
  if (!name?.trim()) return NextResponse.json({ error: 'Name erforderlich' }, { status: 400 })

  const supabase = await createAuthClient()
  const { error } = await supabase.auth.updateUser({ data: { full_name: name.trim() } })
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ success: true })
}
