'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Step = 'email' | 'otp' | 'name'

export default function LoginPage() {
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [digits, setDigits] = useState(['', '', '', '', '', ''])
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const digitRefs = useRef<(HTMLInputElement | null)[]>([])
  const supabaseRef = useRef(createClient())
  const router = useRouter()
  const supabase = supabaseRef.current

  async function sendOtp(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      console.log('URL repr:', JSON.stringify(url))
      console.log('Key length:', key?.length, 'last char code:', key?.charCodeAt(key.length - 1))
      const { error } = await supabase.auth.signInWithOtp({ email })
      if (error) { setError(error.message); return }
      setStep('otp')
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }

  async function verifyOtp(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const token = digits.join('')
    const { data, error } = await supabase.auth.verifyOtp({ email, token, type: 'email' })
    setLoading(false)
    if (error) { setError('Code ungültig oder abgelaufen.'); return }
    const isNew = !data.user?.user_metadata?.full_name
    if (isNew) {
      setStep('name')
    } else {
      router.push('/book')
      router.refresh()
    }
  }

  async function saveName(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ data: { full_name: name.trim() } })
    setLoading(false)
    if (error) { setError(error.message); return }
    router.push('/book')
    router.refresh()
  }

  function handleDigitChange(index: number, value: string) {
    const digit = value.replace(/\D/g, '').slice(-1)
    const next = [...digits]
    next[index] = digit
    setDigits(next)
    if (digit && index < 5) digitRefs.current[index + 1]?.focus()
  }

  function handleDigitKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      digitRefs.current[index - 1]?.focus()
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    const next = ['', '', '', '', '', '']
    pasted.split('').forEach((d, i) => { next[i] = d })
    setDigits(next)
    const focusIndex = Math.min(pasted.length, 5)
    digitRefs.current[focusIndex]?.focus()
  }

  const inputStyle = {
    background: 'var(--surface2)',
    border: '1px solid var(--border)',
    color: 'var(--text)',
  }

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4">
      <div className="w-full max-w-sm">

        {/* ── Step: email ── */}
        {step === 'email' && (
          <>
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold">Anmelden</h1>
              <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                Gib deine E-Mail ein – wir schicken dir einen Code.
              </p>
            </div>
            <form onSubmit={sendOtp} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm mb-1.5" style={{ color: 'var(--text-muted)' }}>
                  E-Mail
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoFocus
                  placeholder="deine@email.de"
                  className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                  style={inputStyle}
                />
              </div>
              {error && <ErrorBox message={error} />}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl font-semibold text-black transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{ background: 'var(--gold)' }}
              >
                {loading ? 'Sende Code…' : 'Code senden'}
              </button>
            </form>
          </>
        )}

        {/* ── Step: otp ── */}
        {step === 'otp' && (
          <>
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold">Code eingeben</h1>
              <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                Wir haben einen 6-stelligen Code an <strong>{email}</strong> gesendet.
              </p>
            </div>
            <form onSubmit={verifyOtp} className="flex flex-col gap-4">
              <div className="flex gap-2 justify-center" onPaste={handlePaste}>
                {digits.map((d, i) => (
                  <input
                    key={i}
                    ref={el => { digitRefs.current[i] = el }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={d}
                    onChange={e => handleDigitChange(i, e.target.value)}
                    onKeyDown={e => handleDigitKeyDown(i, e)}
                    autoFocus={i === 0}
                    className="w-11 h-14 text-center text-xl font-bold rounded-xl outline-none"
                    style={inputStyle}
                  />
                ))}
              </div>
              {error && <ErrorBox message={error} />}
              <button
                type="submit"
                disabled={loading || digits.some(d => !d)}
                className="w-full py-2.5 rounded-xl font-semibold text-black transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{ background: 'var(--gold)' }}
              >
                {loading ? 'Prüfe Code…' : 'Bestätigen'}
              </button>
              <button
                type="button"
                onClick={() => { setStep('email'); setDigits(['', '', '', '', '', '']); setError('') }}
                className="text-sm text-center hover:underline"
                style={{ color: 'var(--text-muted)' }}
              >
                Andere E-Mail verwenden
              </button>
            </form>
          </>
        )}

        {/* ── Step: name ── */}
        {step === 'name' && (
          <>
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold">Wie heißt du?</h1>
              <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                Einmalig – damit wir deinen Termin zuordnen können.
              </p>
            </div>
            <form onSubmit={saveName} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm mb-1.5" style={{ color: 'var(--text-muted)' }}>
                  Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  autoFocus
                  placeholder="Max Mustermann"
                  className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                  style={inputStyle}
                />
              </div>
              {error && <ErrorBox message={error} />}
              <button
                type="submit"
                disabled={loading || !name.trim()}
                className="w-full py-2.5 rounded-xl font-semibold text-black transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{ background: 'var(--gold)' }}
              >
                {loading ? 'Speichern…' : 'Weiter'}
              </button>
            </form>
          </>
        )}

      </div>
    </div>
  )
}

function ErrorBox({ message }: { message: string }) {
  return (
    <p
      className="text-sm px-3 py-2 rounded-xl"
      style={{ background: '#1a0a0a', color: '#ff7070', border: '1px solid #5a1a1a' }}
    >
      {message}
    </p>
  )
}
