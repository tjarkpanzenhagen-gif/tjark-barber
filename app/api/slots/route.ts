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

  const booked = new Set(bookings?.map(b => b.time) ?? [])

  // Each booking blocks the next 30-min slot too (haircut takes ~1h)
  function isBlocked(time: string): boolean {
    if (booked.has(time)) return true
    const [h, m] = time.split(':').map(Number)
    const prevMins = h * 60 + m - 30
    if (prevMins >= 0) {
      const prev = `${Math.floor(prevMins / 60).toString().padStart(2, '0')}:${(prevMins % 60).toString().padStart(2, '0')}:00`
      if (booked.has(prev)) return true
    }
    return false
  }

  const slots = allSlots.map(time => ({ time, available: !isBlocked(time) }))

  return NextResponse.json({ slots, start_time: day.start_time, end_time: day.end_time })
}
