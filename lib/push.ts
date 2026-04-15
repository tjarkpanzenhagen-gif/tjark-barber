import webpush from 'web-push'
import { createAdminClient } from '@/lib/supabase/server'

webpush.setVapidDetails(
  process.env.VAPID_EMAIL!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
)

export async function sendPushToAdmin(title: string, body: string) {
  const admin = await createAdminClient()
  const { data: subs } = await admin.from('admin_push_subscriptions').select('endpoint, subscription')
  if (!subs?.length) return

  await Promise.allSettled(
    subs.map(row =>
      webpush.sendNotification(JSON.parse(row.subscription), JSON.stringify({ title, body }))
        .catch(() => {
          admin.from('admin_push_subscriptions').delete().eq('endpoint', row.endpoint)
        })
    )
  )
}

export async function sendPushToAll(title: string, body: string) {
  const admin = await createAdminClient()
  const { data: subs } = await admin.from('push_subscriptions').select('endpoint, subscription')
  if (!subs?.length) return

  await Promise.allSettled(
    subs.map(row =>
      webpush.sendNotification(JSON.parse(row.subscription), JSON.stringify({ title, body }))
        .catch(() => {
          // Remove dead subscriptions
          admin.from('push_subscriptions').delete().eq('endpoint', row.endpoint)
        })
    )
  )
}
