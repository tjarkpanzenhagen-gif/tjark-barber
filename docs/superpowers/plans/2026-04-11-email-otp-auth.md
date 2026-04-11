# Email OTP Auth Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace email/password auth with a combined login/register Email OTP flow using Supabase's built-in `signInWithOtp`.

**Architecture:** Single `/login` page with three internal states (email → OTP code → name for new users). All auth calls go directly to the Supabase client SDK — no custom API routes. Old auth pages and API routes are deleted.

**Tech Stack:** Next.js 15, TypeScript, Supabase JS (`@supabase/supabase-js`, `@supabase/ssr`), Tailwind CSS

---

## File Map

| Action | File | What changes |
|--------|------|-------------|
| Modify | `app/login/page.tsx` | Full rewrite — OTP flow replaces email/password form |
| Modify | `app/page.tsx` | Remove `/register` button, keep only `/login` for unauthenticated users |
| Modify | `components/NavBar.tsx` | Remove `/register` links (desktop + mobile) |
| Delete | `app/register/page.tsx` | No longer needed |
| Delete | `app/forgot-password/page.tsx` | No longer needed |
| Delete | `app/reset-password/page.tsx` | No longer needed |
| Delete | `app/api/auth/login/route.ts` | Auth is now client-side |
| Delete | `app/api/auth/register/route.ts` | Merged into OTP flow |
| Delete | `app/api/auth/reset-password/route.ts` | No passwords |
| Keep | `app/api/auth/callback/route.ts` | Still needed for Supabase session |

---

## Task 1: Delete obsolete pages and API routes

**Files:**
- Delete: `app/register/page.tsx`
- Delete: `app/forgot-password/page.tsx`
- Delete: `app/reset-password/page.tsx`
- Delete: `app/api/auth/login/route.ts`
- Delete: `app/api/auth/register/route.ts`
- Delete: `app/api/auth/reset-password/route.ts`

- [ ] **Step 1: Delete the files**

```bash
rm app/register/page.tsx
rm app/forgot-password/page.tsx
rm app/reset-password/page.tsx
rm app/api/auth/login/route.ts
rm app/api/auth/register/route.ts
rm app/api/auth/reset-password/route.ts
```

- [ ] **Step 2: Verify deletion**

```bash
ls app/register 2>/dev/null && echo "EXISTS" || echo "deleted ok"
ls app/forgot-password 2>/dev/null && echo "EXISTS" || echo "deleted ok"
ls app/reset-password 2>/dev/null && echo "EXISTS" || echo "deleted ok"
ls app/api/auth/login 2>/dev/null && echo "EXISTS" || echo "deleted ok"
ls app/api/auth/register 2>/dev/null && echo "EXISTS" || echo "deleted ok"
ls app/api/auth/reset-password 2>/dev/null && echo "EXISTS" || echo "deleted ok"
```

Expected: all six print `deleted ok`

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "chore: delete obsolete auth pages and API routes"
```

---

## Task 2: Rewrite `app/login/page.tsx` — Email OTP flow

**Files:**
- Modify: `app/login/page.tsx`

The page has three states driven by a `step` variable:
- `'email'` — user enters their email address
- `'otp'` — user enters the 6-digit code from their inbox
- `'name'` — new users enter their display name (only shown if `full_name` is missing from Supabase user metadata after OTP verification)

- [ ] **Step 1: Replace the file with the OTP page**

Replace the entire contents of `app/login/page.tsx` with:

```tsx
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
  const router = useRouter()
  const supabase = createClient()

  async function sendOtp(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    })
    setLoading(false)
    if (error) { setError(error.message); return }
    setStep('otp')
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
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add app/login/page.tsx
git commit -m "feat: replace email/password login with email OTP flow"
```

---

## Task 3: Remove `/register` links from NavBar and home page

**Files:**
- Modify: `components/NavBar.tsx`
- Modify: `app/page.tsx`

- [ ] **Step 1: Update NavBar — remove Register links**

In `components/NavBar.tsx`, replace the unauthenticated desktop section (lines 70–78):

```tsx
// BEFORE
) : (
  <>
    <NavLink href="/login" style={linkStyle('/login')}>Anmelden</NavLink>
    <Link href="/register"
      className="ml-2 px-4 py-1.5 rounded-lg text-sm font-semibold transition-opacity hover:opacity-90"
      style={{ background: 'var(--gold)', color: '#000' }}>
      Registrieren
    </Link>
  </>
)}
```

```tsx
// AFTER
) : (
  <NavLink href="/login" style={linkStyle('/login')}>Anmelden</NavLink>
)}
```

And the unauthenticated mobile section (lines 118–120):

```tsx
// BEFORE
<MobileLink href="/login">Anmelden</MobileLink>
<MobileLink href="/register" gold>Registrieren</MobileLink>
```

```tsx
// AFTER
<MobileLink href="/login">Anmelden</MobileLink>
```

- [ ] **Step 2: Update home page — remove Register button**

In `app/page.tsx`, replace the unauthenticated button group:

```tsx
// BEFORE
) : (
  <>
    <Link href="/register"
      className="px-6 py-2.5 rounded-xl font-semibold text-black"
      style={{ background: 'var(--gold)' }}>
      Registrieren
    </Link>
    <Link href="/login"
      className="px-6 py-2.5 rounded-xl font-medium"
      style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}>
      Anmelden
    </Link>
  </>
)}
```

```tsx
// AFTER
) : (
  <Link href="/login"
    className="px-6 py-2.5 rounded-xl font-semibold text-black"
    style={{ background: 'var(--gold)' }}>
    Anmelden
  </Link>
)}
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 4: Commit**

```bash
git add components/NavBar.tsx app/page.tsx
git commit -m "feat: remove register links, single entry point via /login"
```

---

## Task 4: Manual smoke test

- [ ] **Step 1: Start the dev server**

```bash
npm run dev
```

- [ ] **Step 2: Test new user flow**

1. Open `http://localhost:3002`
2. Click "Anmelden" — should land on `/login`
3. Enter an email that has no Supabase account
4. Click "Code senden" → page should switch to 6-digit input
5. Check that email inbox receives a 6-digit OTP from Supabase
6. Enter the code → should advance to the name step
7. Enter a name → should redirect to `/book`

- [ ] **Step 3: Test returning user flow**

1. Log out (NavBar → Abmelden)
2. Visit `/login` again
3. Enter the same email as before
4. Enter the new OTP code → should redirect directly to `/book` (no name step)

- [ ] **Step 4: Verify deleted routes return 404**

Visit each of the following — each should show the 404 page:
- `http://localhost:3002/register`
- `http://localhost:3002/forgot-password`
- `http://localhost:3002/reset-password`

- [ ] **Step 5: Verify nav has no Register link**

While logged out, check desktop nav and mobile hamburger menu — only "Anmelden" should appear, no "Registrieren".
