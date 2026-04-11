import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!.split('\n')[0].trim()
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!.split('\n')[0].trim()
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!.split('\n')[0].trim()

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(
    url,
    anonKey,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )
}

// Auth client with implicit flow — no PKCE code verifier needed across requests
export async function createAuthClient() {
  const cookieStore = await cookies()
  return createServerClient(
    url,
    anonKey,
    {
      auth: { flowType: 'implicit' },
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )
}

export async function createAdminClient() {
  const cookieStore = await cookies()
  return createServerClient(
    url,
    serviceKey,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )
}
