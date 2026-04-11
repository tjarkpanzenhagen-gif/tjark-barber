'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, full_name: name }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Fehler'); return }
      setDone(true)
    } catch {
      setError('Verbindungsfehler. Bitte nochmal versuchen.')
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className="flex items-center justify-center min-h-[80vh] px-4">
        <div className="w-full max-w-sm text-center">
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>✅</div>
          <h2 className="text-xl font-bold mb-2">Konto erstellt!</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px' }}>
            Du kannst dich jetzt anmelden.
          </p>
          <button onClick={() => router.push('/login')}
            className="px-6 py-2.5 rounded-xl font-semibold text-black inline-block"
            style={{ background: 'var(--gold)' }}>
            Zum Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">Konto erstellen</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Registriere dich kostenlos
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm mb-1.5" style={{ color: 'var(--text-muted)' }}>Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} required
              className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
              style={{ background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text)' }}
              placeholder="Max Mustermann" />
          </div>

          <div>
            <label className="block text-sm mb-1.5" style={{ color: 'var(--text-muted)' }}>E-Mail</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
              className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
              style={{ background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text)' }}
              placeholder="deine@email.de" />
          </div>

          <div>
            <label className="block text-sm mb-1.5" style={{ color: 'var(--text-muted)' }}>Passwort</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
              className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
              style={{ background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text)' }}
              placeholder="Min. 6 Zeichen" />
          </div>

          {error && (
            <p className="text-sm px-3 py-2 rounded-xl" style={{ background: '#1a0a0a', color: '#ff7070', border: '1px solid #5a1a1a' }}>
              {error}
            </p>
          )}

          <button type="submit" disabled={loading}
            className="w-full py-2.5 rounded-xl font-semibold text-black transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ background: 'var(--gold)' }}>
            {loading ? 'Registrieren…' : 'Registrieren'}
          </button>
        </form>

        <p className="text-center text-sm mt-6" style={{ color: 'var(--text-muted)' }}>
          Bereits ein Konto?{' '}
          <Link href="/login" style={{ color: 'var(--gold)' }} className="hover:underline">Anmelden</Link>
        </p>
      </div>
    </div>
  )
}
