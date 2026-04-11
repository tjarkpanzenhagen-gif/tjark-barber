import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { sendBookingConfirmation, sendAdminNewBooking } from '@/lib/email'
import { isAdminEmail } from '@/lib/admin'

// GET /api/bookings — list bookings (admin: all, user: own)
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (isAdminEmail(user.email)) {
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

  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('user_id', user.id)
    .order('date', { ascending: true })
    .order('time', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// POST /api/bookings — create a booking
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { date, time, customer_name } = body

  if (!date || !time || !customer_name) {
    return NextResponse.json({ error: 'Fehlende Felder' }, { status: 400 })
  }

  // Check that the day is available
  const { data: dayData } = await supabase
    .from('available_days')
    .select('*')
    .eq('date', date)
    .eq('is_available', true)
    .single()

  if (!dayData) {
    return NextResponse.json({ error: 'Tag nicht verfügbar' }, { status: 400 })
  }

  // Check slot is within range
  if (time < dayData.start_time || time >= dayData.end_time) {
    return NextResponse.json({ error: 'Zeitslot außerhalb der Öffnungszeiten' }, { status: 400 })
  }

  // Check slot not already taken
  const { data: existingBooking } = await supabase
    .from('bookings')
    .select('id')
    .eq('date', date)
    .eq('time', time)
    .eq('status', 'active')
    .single()

  if (existingBooking) {
    return NextResponse.json({ error: 'Zeitslot bereits belegt' }, { status: 409 })
  }

  const admin = await createAdminClient()
  const { data: booking, error } = await admin
    .from('bookings')
    .insert({
      user_id: user.id,
      date,
      time,
      status: 'active',
      customer_name,
      customer_email: user.email!,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Send emails (fire and forget)
  try {
    await Promise.all([
      sendBookingConfirmation(user.email!, { date, time, name: customer_name }),
      sendAdminNewBooking({ customerEmail: user.email!, customerName: customer_name, date, time }),
    ])
  } catch (e) {
    console.error('Email error:', e)
  }

  return NextResponse.json(booking, { status: 201 })
}
