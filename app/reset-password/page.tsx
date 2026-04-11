'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function ResetPasswordPage() {
  const [ready, setReady] = useState(false)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = useRef(createClient()).current

  useEffect(() => {
    async function init() {
      const params = new URLSearchParams(window.location.search)
      const hashParams = new URLSearchParams(window.location.hash.replace('#', ''))

      // Fehler von Supabase abfangen
      if (params.get('error') || hashParams.get('error')) {
        setError('expired')
        setReady(true)
        return
      }

      // PKCE Flow: ?code= Parameter → eintauschen
      const code = params.get('code')
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (error) { setError('expired'); setReady(true); return }
        setReady(true)
        return
      }

      // Implicit Flow: #access_token im Hash
      if (hashParams.get('access_token')) {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
          if ((event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') && session) {
            setReady(true)
            subscription.unsubscribe()
          }
        })
        return
      }

      // Bestehende Session prüfen
      const { data: { session } } = await supabase.auth.getSession()
      if (session) { setReady(true); return }

      // Kein Token gefunden
      setError('expired')
      setReady(true)
    }

    init()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (password.length < 6) { setError('Passwort muss mindestens 6 Zeichen haben.'); return }
    if (password !== confirm) { setError('Passwörter stimmen nicht überein.'); return }
    setLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) { setError(error.message); return }
      await supabase.auth.signOut()
      router.push('/login')
    } catch {
      setError('Verbindungsfehler. Bitte nochmal versuchen.')
    } finally {
      setLoading(false)
    }
  }

  if (!ready) {
    return (
      <div className="flex items-center justify-center min-h-[80vh] px-4">
        <div className="text-center">
          <div className="w-8 h-8 rounded-full border-2 animate-spin mx-auto mb-4"
            style={{ borderColor: 'var(--gold)', borderTopColor: 'transparent' }} />
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Link wird geprüft…</p>
        </div>
      </div>
    )
  }

  if (error === 'expired') {
    return (
      <div className="flex items-center justify-center min-h-[80vh] px-4">
        <div className="w-full max-w-sm text-center">
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>⏱️</div>
          <h2 className="text-xl font-bold mb-2">Link abgelaufen</h2>
          <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
            Der Reset-Link ist nicht mehr gültig.
          </p>
          <Link href="/forgot-password"
            className="px-6 py-2.5 rounded-xl font-semibold text-black inline-block"
            style={{ background: 'var(--gold)' }}>
            Neuen Link anfordern
          </Link>
        </div>
      </div>
    )
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
            <p className="text-sm px-3 py-2 rounded-xl" style={{ background: '#1a0a0a', color: '#ff7070', border: '1px solid #5a1a1a' }}>
              {error}
            </p>
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
