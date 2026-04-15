import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

function generateSlots(startTime: string, endTime: string): string[] {
  const slots: string[] = []
  const [startH, startM] = startTime.split(':').map(Number)
  const [endH, endM] = endTime.split(':').map(Number)
  let current = startH * 60 + startM
  const end = endH * 60 + endM

  while (current < end) {
    const h = Math.floor(current / 60).toString().padStart(2, '0')
    const m = (current % 60).toString().padStart(2, '0')
    slots.push(`${h}:${m}:00`)
    current += 30
  }
  return slots
}

// GET /api/slots?date=YYYY-MM-DD
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const date = searchParams.get('date')
  if (!date) return NextResponse.json({ error: 'date required' }, { status: 400 })

  const supabase = await createClient()

  const { data: day } = await supabase
    .from('available_days')
    .select('*')
    .eq('date', date)
    .eq('is_available', true)
    .single()

  if (!day) return NextResponse.json({ slots: [] })

  // For today: filter out slots that have already passed (Berlin time = UTC+1/+2)
  const nowUtc = new Date()
  const berlinOffset = nowUtc.toLocaleString('en', { timeZone: 'Europe/Berlin', hour12: false }).split(',')[1]
  const berlinNow = new Date(nowUtc.toLocaleString('en-US', { timeZone: 'Europe/Berlin' }))
  const isToday = date === berlinNow.toISOString().split('T')[0]
  const nowMins = isToday ? berlinNow.getHours() * 60 + berlinNow.getMinutes() : null

  const allSlots = generateSlots(day.start_time, day.end_time)
    .filter(time => {
      if (nowMins === null) return true
      const [h, m] = time.split(':').map(Number)
      return h * 60 + m >= nowMins
    })

  const { data: bookings } = await supabase
    .from('bookings')
    .select('time, customer_name')
    .eq('date', date)
    .eq('status', 'active')

  const bookedTimes = bookings?.map(b => b.time) ?? []
  const blocked = new Set<string>(bookedTimes)
  const nameByTime = new Map(bookings?.map(b => [b.time, b.customer_name]) ?? [])

  // If there are existing bookings, only show slots within 30 min of the last booking
  // (haircut = 30 min, prevents gaps where the barber would just be waiting)
  const lastBookingMins = bookedTimes.length > 0
    ? Math.max(...bookedTimes.map(t => { const [h, m] = t.split(':').map(Number); return h * 60 + m }))
    : null

  const slots = allSlots.map(time => {
    if (blocked.has(time)) return { time, available: false, status: 'booked', customer_name: nameByTime.get(time) ?? null }
    if (lastBookingMins !== null) {
      const [h, m] = time.split(':').map(Number)
      const tMins = h * 60 + m
      if (tMins > lastBookingMins + 60) return { time, available: false, status: 'too-far', customer_name: null }
    }
    return { time, available: true, status: 'available', customer_name: null }
  })

  return NextResponse.json({ slots, start_time: day.start_time, end_time: day.end_time })
}
