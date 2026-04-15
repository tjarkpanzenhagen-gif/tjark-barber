import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { isAdminAuthed } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  if (!await isAdminAuthed()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const subscription = await request.json()
  if (!subscription?.endpoint) return NextResponse.json({ error: 'Invalid' }, { status: 400 })

  const admin = await createAdminClient()
  await admin.from('admin_push_subscriptions').upsert(
    { endpoint: subscription.endpoint, subscription: JSON.stringify(subscription) },
    { onConflict: 'endpoint' }
  )
  return NextResponse.json({ success: true })
}

export async function DELETE(request: NextRequest) {
  if (!await isAdminAuthed()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { endpoint } = await request.json()
  const admin = await createAdminClient()
  await admin.from('admin_push_subscriptions').delete().eq('endpoint', endpoint)
  return NextResponse.json({ success: true })
}
