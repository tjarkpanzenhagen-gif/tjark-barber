import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { isAdminAuthed } from '@/lib/admin-auth'

// GET /api/bookings — admin only
export async function GET(request: NextRequest) {
  if (!await isAdminAuthed()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = await createAdminClient()
  const { searchParams } = new URL(request.url)
  const date = searchParams.get('date')

  let query = admin
    .from('bookings')
    .select('*')
    .order('date', { ascending: true })
    .order('time', { ascending: true })

  if (date) query = query.eq('date', date)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// POST /api/bookings — public, just needs a name
export async function POST(request: NextRequest) {
  const body = await request.json()
  const { date, time, customer_name } = body

  if (!date || !time || !customer_name?.trim()) {
    return NextResponse.json({ error: 'Fehlende Felder' }, { status: 400 })
  }

  const admin = await createAdminClient()

  const { data: dayData } = await admin
    .from('available_days')
    .select('*')
    .eq('date', date)
    .eq('is_available', true)
    .single()

  if (!dayData) return NextResponse.json({ error: 'Tag nicht verfügbar' }, { status: 400 })

  if (time < dayData.start_time || time >= dayData.end_time) {
    return NextResponse.json({ error: 'Zeitslot außerhalb der Öffnungszeiten' }, { status: 400 })
  }

  const { data: existingBookings } = await admin
    .from('bookings')
    .select('time')
    .eq('date', date)
    .eq('status', 'active')

  const bookedTimes = existingBookings?.map(b => b.time) ?? []

  if (bookedTimes.includes(time)) {
    return NextResponse.json({ error: 'Zeitslot bereits belegt' }, { status: 409 })
  }

  // Enforce max 30-min gap from last booking
  if (bookedTimes.length > 0) {
    const lastMins = Math.max(...bookedTimes.map(t => {
      const [h, m] = t.split(':').map(Number)
      return h * 60 + m
    }))
    const [th, tm] = time.split(':').map(Number)
    const reqMins = th * 60 + tm
    if (reqMins > lastMins + 60) {
      return NextResponse.json({ error: 'Zeitslot zu weit von letzter Buchung entfernt' }, { status: 400 })
    }
  }

  const { data: booking, error } = await admin
    .from('bookings')
    .insert({ date, time, status: 'active', customer_name: customer_name.trim() })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') return NextResponse.json({ error: 'Zeitslot bereits belegt' }, { status: 409 })
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json(booking, { status: 201 })
}
