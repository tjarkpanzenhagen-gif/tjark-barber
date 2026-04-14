import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { isAdminAuthed } from '@/lib/admin-auth'

// GET — public
export async function GET() {
  const admin = await createAdminClient()
  const { data, error } = await admin
    .from('available_days')
    .select('*')
    .gte('date', new Date().toISOString().split('T')[0])
    .order('date', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// POST — admin only
export async function POST(request: NextRequest) {
  if (!await isAdminAuthed()) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

  const body = await request.json()
  const { date, start_time, end_time, is_available } = body
  if (!date || !start_time || !end_time) return NextResponse.json({ error: 'Fehlende Felder' }, { status: 400 })

  const admin = await createAdminClient()
  const { data, error } = await admin
    .from('available_days')
    .upsert({ date, start_time, end_time, is_available: is_available ?? true }, { onConflict: 'date' })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
