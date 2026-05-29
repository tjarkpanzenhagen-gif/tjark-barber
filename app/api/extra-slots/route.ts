import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { isAdminAuthed } from '@/lib/admin-auth'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  if (!await isAdminAuthed()) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

  const { searchParams } = new URL(request.url)
  const date = searchParams.get('date')
  if (!date) return NextResponse.json({ error: 'date required' }, { status: 400 })

  const admin = await createAdminClient()
  const { data, error } = await admin
    .from('extra_slots')
    .select('*')
    .eq('date', date)
    .order('time', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  if (!await isAdminAuthed()) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

  const body = await request.json()
  const { date, time } = body
  if (!date || !time) return NextResponse.json({ error: 'Fehlende Felder' }, { status: 400 })

  const admin = await createAdminClient()
  const { data, error } = await admin
    .from('extra_slots')
    .insert({ date, time })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') return NextResponse.json({ error: 'Slot existiert bereits' }, { status: 409 })
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json(data)
}
