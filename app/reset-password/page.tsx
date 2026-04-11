'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (password.length < 6) { setError('Passwort muss mindestens 6 Zeichen haben.'); return }
    if (password !== confirm) { setError('Passwörter stimmen nicht überein.'); return }
    setLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) {
        if (error.message.includes('session')) {
          setError('Sitzung abgelaufen. Bitte neuen Reset-Link anfordern.')
        } else {
          setError(error.message)
        }
        return
      }
      await supabase.auth.signOut()
      router.push('/login')
    } catch {
      setError('Verbindungsfehler. Bitte nochmal versuchen.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-1">Neues Passwort</h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Wähle ein neues Passwort für dein Konto.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm mb-1.5" style={{ color: 'var(--text-muted)' }}>Neues Passwort</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              required autoFocus
              className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
              style={{ background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text)' }}
              placeholder="Min. 6 Zeichen" />
          </div>

          <div>
            <label className="block text-sm mb-1.5" style={{ color: 'var(--text-muted)' }}>Passwort bestätigen</label>
            <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)}
              required
              className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
              style={{ background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text)' }}
              placeholder="••••••••" />
          </div>

          {error && (
            <div className="text-sm px-3 py-2 rounded-xl" style={{ background: '#1a0a0a', color: '#ff7070', border: '1px solid #5a1a1a' }}>
              <p>{error}</p>
              {error.includes('abgelaufen') && (
                <Link href="/forgot-password" className="underline mt-1 block" style={{ color: 'var(--gold)' }}>
                  Neuen Link anfordern →
                </Link>
              )}
            </div>
          )}

          <button type="submit" disabled={loading}
            className="w-full py-2.5 rounded-xl font-semibold text-black transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ background: 'var(--gold)' }}>
            {loading ? 'Speichern…' : 'Passwort speichern'}
          </button>
        </form>
      </div>
    </div>
  )
}
