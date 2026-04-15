import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// POST — save a push subscription
export async function POST(request: NextRequest) {
  const subscription = await request.json()
  if (!subscription?.endpoint) return NextResponse.json({ error: 'Invalid subscription' }, { status: 400 })

  const admin = await createAdminClient()
  await admin.from('push_subscriptions').upsert(
    { endpoint: subscription.endpoint, subscription: JSON.stringify(subscription) },
    { onConflict: 'endpoint' }
  )
  return NextResponse.json({ success: true })
}

// DELETE — remove a push subscription
export async function DELETE(request: NextRequest) {
  const { endpoint } = await request.json()
  if (!endpoint) return NextResponse.json({ error: 'Missing endpoint' }, { status: 400 })

  const admin = await createAdminClient()
  await admin.from('push_subscriptions').delete().eq('endpoint', endpoint)
  return NextResponse.json({ success: true })
}
