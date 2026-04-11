'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type State = 'loading' | 'ready' | 'error'

export default function ResetPasswordPage() {
  const [state, setState] = useState<State>('loading')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = useRef(createClient()).current

  useEffect(() => {
    // Supabase erkennt den Token automatisch aus dem URL-Hash oder Cookie
    // und feuert PASSWORD_RECOVERY sobald die Session steht
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || (event === 'SIGNED_IN' && session)) {
        setState('ready')
      }
    })

    // Fallback: Session schon vorhanden (z.B. via Callback Route gesetzt)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setState('ready')
    })

    // Timeout falls kein Token erkannt wird
    const timeout = setTimeout(() => {
      setState(s => s === 'loading' ? 'error' : s)
    }, 5000)

    return () => {
      subscription.unsubscribe()
      clearTimeout(timeout)
    }
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
    } finally {
      setLoading(false)
    }
  }

  if (state === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-[80vh] px-4">
        <div className="text-center">
          <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin mx-auto mb-4"
            style={{ borderColor: 'var(--gold)', borderTopColor: 'transparent' }} />
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Link wird geprüft…</p>
        </div>
      </div>
    )
  }

  if (state === 'error') {
    return (
      <div className="flex items-center justify-center min-h-[80vh] px-4">
        <div className="w-full max-w-sm text-center">
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>⚠️</div>
          <h2 className="text-xl font-bold mb-2">Link ungültig</h2>
          <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
            Dieser Link ist abgelaufen oder bereits benutzt worden.
          </p>
          <a href="/forgot-password"
            className="px-6 py-2.5 rounded-xl font-semibold text-black inline-block"
            style={{ background: 'var(--gold)' }}>
            Neuen Link anfordern
          </a>
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
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoFocus
              className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
              style={{ background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text)' }}
              placeholder="Min. 6 Zeichen"
            />
          </div>

          <div>
            <label className="block text-sm mb-1.5" style={{ color: 'var(--text-muted)' }}>Passwort bestätigen</label>
            <input
              type="password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              required
              className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
              style={{ background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text)' }}
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-sm px-3 py-2 rounded-xl" style={{ background: '#1a0a0a', color: '#ff7070', border: '1px solid #5a1a1a' }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl font-semibold text-black transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ background: 'var(--gold)' }}>
            {loading ? 'Speichern…' : 'Passwort speichern'}
          </button>
        </form>
      </div>
    </div>
  )
}
