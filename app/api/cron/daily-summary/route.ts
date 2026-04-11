import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { sendDailySummary } from '@/lib/email'

// GET /api/cron/daily-summary — called by Vercel Cron at 18:00 daily
export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = await createAdminClient()

  // Get tomorrow's date
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const tomorrowStr = tomorrow.toISOString().split('T')[0]

  const { data: bookings, error } = await admin
    .from('bookings')
    .select('customer_name, customer_email, time')
    .eq('date', tomorrowStr)
    .eq('status', 'active')
    .order('time', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (!bookings || bookings.length === 0) {
    return NextResponse.json({ message: 'Keine Termine morgen' })
  }

  await sendDailySummary(
    bookings.map(b => ({ name: b.customer_name, time: b.time, email: b.customer_email })),
    tomorrowStr
  )

  return NextResponse.json({ sent: true, count: bookings.length })
}
