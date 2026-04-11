import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { sendCancellationConfirmation, sendAdminCancellation } from '@/lib/email'
import { isAdminEmail } from '@/lib/admin'

// PATCH /api/bookings/[id] — cancel a booking
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = await createAdminClient()

  // Fetch booking
  const { data: booking, error: fetchError } = await admin
    .from('bookings')
    .select('*')
    .eq('id', id)
    .single()

  if (fetchError || !booking) {
    return NextResponse.json({ error: 'Buchung nicht gefunden' }, { status: 404 })
  }

  const isAdmin = isAdminEmail(user.email)

  // Check ownership (unless admin)
  if (!isAdmin && booking.user_id !== user.id) {
    return NextResponse.json({ error: 'Keine Berechtigung' }, { status: 403 })
  }

  // Check 2-hour cancellation window (customers only)
  if (!isAdmin) {
    const bookingDateTime = new Date(`${booking.date}T${booking.time}`)
    const now = new Date()
    const diffMs = bookingDateTime.getTime() - now.getTime()
    const diffHours = diffMs / (1000 * 60 * 60)
    if (diffHours < 2) {
      return NextResponse.json({ error: 'Stornierung nur bis 2 Stunden vor dem Termin möglich' }, { status: 400 })
    }
  }

  const { error } = await admin
    .from('bookings')
    .update({ status: 'cancelled' })
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Send emails
  try {
    await Promise.all([
      sendCancellationConfirmation(booking.customer_email, {
        date: booking.date,
        time: booking.time,
        name: booking.customer_name,
      }),
      sendAdminCancellation({
        customerEmail: booking.customer_email,
        customerName: booking.customer_name,
        date: booking.date,
        time: booking.time,
      }),
    ])
  } catch (e) {
    console.error('Email error:', e)
  }

  return NextResponse.json({ success: true })
}
