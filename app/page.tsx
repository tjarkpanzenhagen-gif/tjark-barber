import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4">
      <div className="text-center">
        <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '8px' }}>
          Terminbuchung
        </h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '32px', fontSize: '15px' }}>
          Buch dir einen Slot.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {user ? (
            <>
              <Link href="/book"
                className="px-6 py-2.5 rounded-xl font-semibold text-black"
                style={{ background: 'var(--gold)' }}>
                Termin buchen
              </Link>
              <Link href="/dashboard"
                className="px-6 py-2.5 rounded-xl font-medium"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}>
                Meine Termine
              </Link>
            </>
          ) : (
            <Link href="/login"
              className="px-6 py-2.5 rounded-xl font-semibold text-black"
              style={{ background: 'var(--gold)' }}>
              Anmelden
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
