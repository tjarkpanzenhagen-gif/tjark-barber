'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Fehler'); setPassword(''); return }
      router.push('/book')
      router.refresh()
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
          <h1 className="text-2xl font-bold">Anmelden</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Meld dich an um Termine zu buchen
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm mb-1.5" style={{ color: 'var(--text-muted)' }}>E-Mail</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
              className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
              style={{ background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text)' }}
              placeholder="deine@email.de" />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm" style={{ color: 'var(--text-muted)' }}>Passwort</label>
              <Link href="/forgot-password" className="text-xs hover:underline" style={{ color: 'var(--gold)' }}>
                Vergessen?
              </Link>
            </div>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
              className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
              style={{ background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text)' }}
              placeholder="••••••••" />
          </div>

          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <div className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0"
              onClick={() => setRemember(r => !r)}
              style={{
                background: remember ? 'var(--gold)' : 'var(--surface2)',
                border: `1px solid ${remember ? 'var(--gold)' : 'var(--border)'}`,
                cursor: 'pointer',
              }}>
              {remember && (
                <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                  <path d="M1 4l3 3 5-6" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Angemeldet bleiben</span>
          </label>

          {error && (
            <p className="text-sm px-3 py-2 rounded-xl" style={{ background: '#1a0a0a', color: '#ff7070', border: '1px solid #5a1a1a' }}>
              {error}
            </p>
          )}

          <button type="submit" disabled={loading}
            className="w-full py-2.5 rounded-xl font-semibold text-black transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ background: 'var(--gold)' }}>
            {loading ? 'Anmelden…' : 'Anmelden'}
          </button>
        </form>

        <p className="text-center text-sm mt-6" style={{ color: 'var(--text-muted)' }}>
          Noch kein Konto?{' '}
          <Link href="/register" style={{ color: 'var(--gold)' }} className="hover:underline">Registrieren</Link>
        </p>
      </div>
    </div>
  )
}
