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

  const allSlots = generateSlots(day.start_time, day.end_time)

  const { data: bookings } = await supabase
    .from('bookings')
    .select('time')
    .eq('date', date)
    .eq('status', 'active')

  const bookedTimes = bookings?.map(b => b.time) ?? []
  const booked = new Set(bookedTimes)

  // Each booking blocks itself + the next 30-min slot (haircut = 1h)
  const blocked = new Set<string>()
  for (const t of bookedTimes) {
    blocked.add(t)
    const [h, m] = t.split(':').map(Number)
    const nextMins = h * 60 + m + 30
    const nh = Math.floor(nextMins / 60).toString().padStart(2, '0')
    const nm = (nextMins % 60).toString().padStart(2, '0')
    blocked.add(`${nh}:${nm}:00`)
  }

  // If there are existing bookings, only show slots within 60 min of the last booking
  // (prevents 3-hour gaps where the barber would just be waiting)
  const lastBookingMins = bookedTimes.length > 0
    ? Math.max(...bookedTimes.map(t => { const [h, m] = t.split(':').map(Number); return h * 60 + m }))
    : null

  const slots = allSlots.map(time => {
    if (blocked.has(time)) return { time, available: false }
    if (lastBookingMins !== null) {
      const [h, m] = time.split(':').map(Number)
      const tMins = h * 60 + m
      if (tMins > lastBookingMins + 60) return { time, available: false }
    }
    return { time, available: true }
  })

  return NextResponse.json({ slots, start_time: day.start_time, end_time: day.end_time })
}
