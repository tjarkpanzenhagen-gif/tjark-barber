import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { isAdminEmail } from '@/lib/admin'

// GET /api/available-days — list all available days
export async function GET() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('available_days')
    .select('*')
    .gte('date', new Date().toISOString().split('T')[0])
    .order('date', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// POST /api/available-days — admin creates/updates a day
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !isAdminEmail(user.email)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const body = await request.json()
  const { date, start_time, end_time, is_available } = body

  if (!date || !start_time || !end_time) {
    return NextResponse.json({ error: 'Fehlende Felder' }, { status: 400 })
  }

  const admin = await createAdminClient()
  const { data, error } = await admin
    .from('available_days')
    .upsert({ date, start_time, end_time, is_available: is_available ?? true }, { onConflict: 'date' })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
