import { createBrowserClient } from '@supabase/ssr'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!.split('\n')[0].trim()
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!.split('\n')[0].trim()

export function createClient() {
  return createBrowserClient(url, key)
}
