import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

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

  const supabase = await createAdminClient()

  const { data: day } = await supabase
    .from('available_days')
    .select('*')
    .eq('date', date)
    .eq('is_available', true)
    .single()

  if (!day) return NextResponse.json({ slots: [] })

  // For today: calculate current time in Berlin timezone
  const berlinNow = new Date(new Date().toLocaleString('en-US', { timeZone: 'Europe/Berlin' }))
  const berlinDateStr = `${berlinNow.getFullYear()}-${String(berlinNow.getMonth() + 1).padStart(2, '0')}-${String(berlinNow.getDate()).padStart(2, '0')}`
  const nowMins = date === berlinDateStr ? berlinNow.getHours() * 60 + berlinNow.getMinutes() : null

  const allSlots = generateSlots(day.start_time, day.end_time)

  const { data: bookings } = await supabase
    .from('bookings')
    .select('time, customer_name')
    .eq('date', date)
    .eq('status', 'active')

  // Normalize time to HH:MM:SS regardless of what Supabase returns
  const norm = (t: string) => t.length === 5 ? `${t}:00` : t
  const bookedTimes = bookings?.map(b => norm(b.time)) ?? []
  const blocked = new Set<string>(bookedTimes)
  const nameByTime = new Map(bookings?.map(b => [norm(b.time), b.customer_name]) ?? [])

  // If there are existing bookings, only show slots within 30 min of the last booking
  // (haircut = 30 min, prevents gaps where the barber would just be waiting)
  const lastBookingMins = bookedTimes.length > 0
    ? Math.max(...bookedTimes.map(t => { const [h, m] = t.split(':').map(Number); return h * 60 + m }))
    : null

  const slots = allSlots
    .filter(time => {
      // For today: hide past slots (booked or not)
      if (nowMins !== null) {
        const [h, m] = time.split(':').map(Number)
        if (h * 60 + m < nowMins) return false
      }
      return true
    })
    .map(time => {
      // Booked: available=false, customer_name set → frontend will hide it
      if (blocked.has(time)) return { time, available: false, customer_name: nameByTime.get(time) ?? null }
      // Too-far: available=false, no customer_name → frontend shows as locked
      if (lastBookingMins !== null) {
        const [h, m] = time.split(':').map(Number)
        if (h * 60 + m > lastBookingMins + 30) return { time, available: false, customer_name: null }
      }
      return { time, available: true, customer_name: null }
    })

  return NextResponse.json(
    { slots, start_time: day.start_time, end_time: day.end_time },
    { headers: { 'Cache-Control': 'no-store' } }
  )
}
