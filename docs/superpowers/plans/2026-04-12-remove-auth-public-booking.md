# Remove Auth — Public Booking + Password-Protected Admin

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove all email/Supabase auth so anyone can book by just entering their name; protect the admin panel with a simple env-var password.

**Architecture:** Supabase is kept as the database only (no auth.users). The booking flow becomes fully public (name → date → time → confirm). The admin panel has its own password form that sets a cookie; all admin API routes check that cookie against `ADMIN_PASSWORD` env var.

**Tech Stack:** Next.js 15 App Router, TypeScript, Supabase (DB only via service-role key for writes), @supabase/ssr for read queries

---

## File Map

**Delete:**
- `app/login/page.tsx`
- `app/dashboard/page.tsx`
- `app/api/auth/otp/route.ts`
- `app/api/auth/verify-otp/route.ts`
- `app/api/auth/update-name/route.ts`
- `app/api/auth/callback/route.ts`
- `lib/admin.ts`

**Create:**
- `lib/admin-auth.ts` — server-side helper: reads `admin_session` cookie, compares to `ADMIN_PASSWORD`
- `app/api/auth/admin/route.ts` — POST: validate password → set cookie; GET: check cookie

**Modify:**
- `middleware.ts` — strip all Supabase auth; just pass through (no redirects)
- `lib/supabase/middleware.ts` — remove (or gut to no-op); middleware no longer needs Supabase
- `components/NavBar.tsx` — static links: "Buchen" always visible, no auth state, no logout
- `app/book/page.tsx` — remove Supabase auth check + redirect; remove `user` state; name input stays
- `app/admin/page.tsx` — replace Supabase auth check with password form + cookie check via API
- `app/api/bookings/route.ts` — GET: admin cookie; POST: no auth, no user_id, no email sending
- `app/api/bookings/[id]/route.ts` — PATCH: admin cookie only (no user ownership check)
- `app/api/available-days/route.ts` — GET: public; POST: admin cookie
- `app/api/available-days/[id]/route.ts` — PATCH/DELETE: admin cookie
- `app/api/slots/route.ts` — keep as-is (already public reads)

---

## Task 1: Database Migration

**Files:** Run SQL in Supabase Dashboard → SQL Editor

- [ ] **Step 1: Open Supabase Dashboard → SQL Editor and run:**

```sql
ALTER TABLE bookings ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE bookings ALTER COLUMN customer_email DROP NOT NULL;
```

This allows inserting bookings without a logged-in user.

- [ ] **Step 2: Verify no error in the SQL editor output**

- [ ] **Step 3: Commit (no code changed yet, just note the migration was done)**

```bash
git commit --allow-empty -m "chore: note DB migration — user_id and customer_email now nullable"
```

---

## Task 2: Admin Auth Helper + API Route

**Files:**
- Create: `lib/admin-auth.ts`
- Create: `app/api/auth/admin/route.ts`

- [ ] **Step 1: Create `lib/admin-auth.ts`**

```typescript
import { cookies } from 'next/headers'

const COOKIE = 'admin_session'

export function getAdminPassword(): string {
  return process.env.ADMIN_PASSWORD || ''
}

export async function isAdminAuthed(): Promise<boolean> {
  const cookieStore = await cookies()
  const value = cookieStore.get(COOKIE)?.value || ''
  const pw = getAdminPassword()
  return !!pw && value === pw
}
```

- [ ] **Step 2: Create `app/api/auth/admin/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { isAdminAuthed, getAdminPassword } from '@/lib/admin-auth'

const COOKIE = 'admin_session'

// GET — check if already authed
export async function GET() {
  const authed = await isAdminAuthed()
  if (!authed) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return NextResponse.json({ authed: true })
}

// POST — validate password and set cookie
export async function POST(request: NextRequest) {
  const { password } = await request.json()
  const pw = getAdminPassword()
  if (!pw || password !== pw) {
    return NextResponse.json({ error: 'Falsches Passwort' }, { status: 401 })
  }
  const res = NextResponse.json({ success: true })
  res.cookies.set(COOKIE, pw, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  })
  return res
}
```

- [ ] **Step 3: Add `ADMIN_PASSWORD` to `.env.local`**

Open `.env.local` and add:
```
ADMIN_PASSWORD=dein-geheimes-passwort
```

- [ ] **Step 4: Commit**

```bash
git add lib/admin-auth.ts app/api/auth/admin/route.ts .env.local
git commit -m "feat: admin password auth helper and API route"
```

---

## Task 3: Simplify Middleware

**Files:**
- Modify: `middleware.ts`
- Modify: `lib/supabase/middleware.ts`

The current middleware calls `supabase.auth.getUser()` on every request, causing a Supabase round-trip. We don't need this anymore.

- [ ] **Step 1: Replace `middleware.ts` with:**

```typescript
import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
```

- [ ] **Step 2: Replace `lib/supabase/middleware.ts` with:**

```typescript
// No longer used — middleware simplified to no-op
export {}
```

- [ ] **Step 3: Commit**

```bash
git add middleware.ts lib/supabase/middleware.ts
git commit -m "fix: simplify middleware — remove Supabase auth round-trip"
```

---

## Task 4: Rewrite Book Page (Remove Auth)

**Files:**
- Modify: `app/book/page.tsx`

The book page already has a name input. We just need to remove the Supabase auth check and `user` state.

- [ ] **Step 1: Replace `app/book/page.tsx` with:**

```typescript
'use client'

import { useEffect, useState } from 'react'
import {
  format, addMonths, subMonths,
  startOfMonth, endOfMonth, eachDayOfInterval,
  isSameMonth, isToday, isBefore, startOfDay, getDay,
} from 'date-fns'
import { de } from 'date-fns/locale'

interface AvailableDay {
  id: string
  date: string
  start_time: string
  end_time: string
  is_available: boolean
}

interface Slot { time: string; available: boolean }

const WEEKDAYS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']
const fmt = (t: string) => t.slice(0, 5)

export default function BookPage() {
  const [name, setName] = useState('')
  const [month, setMonth] = useState(new Date())
  const [availableDays, setAvailableDays] = useState<AvailableDay[]>([])
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [slots, setSlots] = useState<Slot[]>([])
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [booking, setBooking] = useState(false)
  const [success, setSuccess] = useState<{ date: string; time: string } | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/available-days').then(r => r.json()).then(d => setAvailableDays(Array.isArray(d) ? d : []))
  }, [])

  useEffect(() => {
    if (!selectedDate) { setSlots([]); return }
    setLoadingSlots(true)
    setSelectedSlot(null)
    fetch(`/api/slots?date=${selectedDate}`)
      .then(r => r.json())
      .then(d => { setSlots(d.slots || []); setLoadingSlots(false) })
  }, [selectedDate])

  const availableSet = new Set(availableDays.filter(d => d.is_available).map(d => d.date))
  const days = eachDayOfInterval({ start: startOfMonth(month), end: endOfMonth(month) })
  const pad = (getDay(startOfMonth(month)) + 6) % 7

  async function handleBook() {
    if (!selectedDate || !selectedSlot || !name.trim()) return
    setBooking(true); setError('')
    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: selectedDate, time: selectedSlot, customer_name: name.trim() }),
    })
    const data = await res.json()
    setBooking(false)
    if (!res.ok) { setError(data.error || 'Fehler beim Buchen'); return }
    setSuccess({ date: selectedDate, time: selectedSlot })
  }

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-[80vh] px-4">
        <div className="w-full max-w-sm text-center">
          <div style={{ fontSize: '4rem', marginBottom: '16px' }}>🎉</div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '8px' }}>Termin gebucht!</h2>
          <div className="rounded-xl p-4 my-6" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <p style={{ fontWeight: 600 }}>
              {format(new Date(success.date + 'T12:00:00'), 'EEEE, d. MMMM yyyy', { locale: de })}
            </p>
            <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--gold)' }}>{fmt(success.time)} Uhr</p>
          </div>
          <button
            onClick={() => {
              setSuccess(null); setSelectedDate(null); setSelectedSlot(null)
              fetch('/api/available-days').then(r => r.json()).then(d => setAvailableDays(Array.isArray(d) ? d : []))
            }}
            className="px-5 py-2.5 rounded-xl font-medium text-black"
            style={{ background: 'var(--gold)' }}>
            Weiterer Termin
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '4px' }}>Termin buchen</h1>
      <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '32px' }}>
        Wähle einen verfügbaren Tag und Uhrzeit.
      </p>

      {/* Step 1: Name */}
      <Step n={1} label="Dein Name" done={!!name.trim()}>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Max Mustermann"
          className="w-full sm:w-72 px-3 py-2.5 rounded-xl text-sm outline-none"
          style={{ background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text)' }}
        />
      </Step>

      {/* Step 2: Date */}
      <Step n={2} label="Datum wählen" done={!!selectedDate}>
        <div className="rounded-xl p-4" style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}>
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => setMonth(m => subMonths(m, 1))}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:opacity-70"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>‹</button>
            <span style={{ fontWeight: 600 }}>{format(month, 'MMMM yyyy', { locale: de })}</span>
            <button onClick={() => setMonth(m => addMonths(m, 1))}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:opacity-70"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>›</button>
          </div>

          <div className="grid grid-cols-7 mb-1">
            {WEEKDAYS.map(d => (
              <div key={d} className="text-center py-1" style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: pad }).map((_, i) => <div key={`p${i}`} />)}
            {days.map(day => {
              const ds = format(day, 'yyyy-MM-dd')
              const avail = availableSet.has(ds)
              const past = isBefore(startOfDay(day), startOfDay(new Date()))
              const inM = isSameMonth(day, month)
              const sel = selectedDate === ds
              const clickable = avail && !past && inM
              return (
                <button key={ds} disabled={!clickable} onClick={() => setSelectedDate(sel ? null : ds)}
                  className="aspect-square rounded-lg text-sm font-medium transition-all flex items-center justify-center"
                  style={{
                    background: sel ? 'var(--gold)' : avail && !past && inM ? 'rgba(212,168,83,0.12)' : 'transparent',
                    color: sel ? '#000' : !inM || (past && !avail) ? 'var(--border)' : avail && !past ? 'var(--text)' : 'var(--text-muted)',
                    border: isToday(day) && !sel ? '1px solid var(--gold)' : '1px solid transparent',
                    cursor: clickable ? 'pointer' : 'default',
                    opacity: !inM ? 0.25 : 1,
                  }}>
                  {format(day, 'd')}
                </button>
              )
            })}
          </div>

          <div className="flex items-center gap-4 mt-4" style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded" style={{ background: 'rgba(212,168,83,0.3)' }} />Verfügbar
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded border" style={{ borderColor: 'var(--gold)', background: 'transparent' }} />Heute
            </span>
          </div>
        </div>
      </Step>

      {/* Step 3: Time slot */}
      {selectedDate && (
        <Step n={3} label={`Uhrzeit – ${format(new Date(selectedDate + 'T12:00:00'), 'EEEE, d. MMMM', { locale: de })}`} done={!!selectedSlot}>
          {loadingSlots ? (
            <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Lade Zeitslots…</div>
          ) : slots.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Keine Zeitslots verfügbar.</div>
          ) : (
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {slots.map(slot => {
                const taken = !slot.available
                const sel = selectedSlot === slot.time
                return (
                  <button key={slot.time} disabled={taken} onClick={() => setSelectedSlot(s => s === slot.time ? null : slot.time)}
                    className="py-2.5 rounded-xl text-sm font-medium transition-all"
                    style={{
                      background: sel ? 'var(--gold)' : taken ? 'var(--surface)' : 'var(--surface2)',
                      color: sel ? '#000' : taken ? 'var(--border)' : 'var(--text)',
                      border: `1px solid ${sel ? 'var(--gold)' : 'var(--border)'}`,
                      cursor: taken ? 'not-allowed' : 'pointer',
                      textDecoration: taken ? 'line-through' : 'none',
                      opacity: taken ? 0.5 : 1,
                    }}>
                    {fmt(slot.time)}
                  </button>
                )
              })}
            </div>
          )}
        </Step>
      )}

      {/* Confirm */}
      {selectedDate && selectedSlot && (
        <div className="rounded-2xl p-5 mt-2" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <h3 style={{ fontWeight: 600, marginBottom: '12px', fontSize: '15px' }}>Zusammenfassung</h3>
          <div className="flex flex-col gap-1 mb-5" style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
            <p>👤 <span style={{ color: 'var(--text)' }}>{name}</span></p>
            <p>📅 <span style={{ color: 'var(--text)' }}>
              {format(new Date(selectedDate + 'T12:00:00'), 'EEEE, d. MMMM yyyy', { locale: de })}
            </span></p>
            <p>🕐 <span style={{ color: 'var(--gold)', fontWeight: 700, fontSize: '1.1rem' }}>{fmt(selectedSlot)} Uhr</span></p>
          </div>
          {error && (
            <div className="rounded-xl px-4 py-3 mb-4"
              style={{ background: '#1a0a0a', border: '1px solid #5a1a1a', color: '#ff7070', fontSize: '14px' }}>
              {error}
            </div>
          )}
          <button onClick={handleBook} disabled={booking || !name.trim()}
            className="w-full py-3.5 rounded-xl font-semibold text-black transition-opacity hover:opacity-90 disabled:opacity-40"
            style={{ background: 'var(--gold)', fontSize: '1rem' }}>
            {booking ? 'Buchung wird erstellt…' : 'Verbindlich buchen'}
          </button>
        </div>
      )}
    </div>
  )
}

function Step({ n, label, done, children }: { n: number; label: string; done: boolean; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
          style={{
            background: done ? 'var(--gold)' : 'var(--surface)',
            border: done ? 'none' : '1px solid var(--border)',
            color: done ? '#000' : 'var(--text-muted)',
          }}>
          {done ? '✓' : n}
        </div>
        <span style={{ fontWeight: 600, fontSize: '15px' }}>{label}</span>
      </div>
      <div style={{ paddingLeft: '40px' }}>{children}</div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add app/book/page.tsx
git commit -m "feat: book page no longer requires auth"
```

---

## Task 5: Rewrite Admin Page (Password Form)

**Files:**
- Modify: `app/admin/page.tsx`

- [ ] **Step 1: Replace `app/admin/page.tsx` with:**

```typescript
'use client'

import { useEffect, useState } from 'react'
import {
  format, addMonths, subMonths,
  startOfMonth, endOfMonth, eachDayOfInterval,
  isSameMonth, isToday, getDay,
} from 'date-fns'
import { de } from 'date-fns/locale'

interface AvailableDay {
  id: string; date: string; start_time: string; end_time: string; is_available: boolean
}
interface Booking {
  id: string; date: string; time: string; status: 'active' | 'cancelled'
  customer_name: string; customer_email: string; created_at: string
}

const WEEKDAYS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']
const fmt = (t: string) => t.slice(0, 5)

function slotCount(start: string, end: string) {
  const [sh, sm] = start.split(':').map(Number)
  const [eh, em] = end.split(':').map(Number)
  return Math.max(0, Math.floor(((eh * 60 + em) - (sh * 60 + sm)) / 30))
}

export default function AdminPage() {
  const [authed, setAuthed] = useState<boolean | null>(null) // null = loading
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)

  const [tab, setTab] = useState<'calendar' | 'bookings'>('calendar')
  const [month, setMonth] = useState(new Date())
  const [days, setDays] = useState<AvailableDay[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [form, setForm] = useState({ start_time: '09:00', end_time: '18:00', is_available: true })
  const [saving, setSaving] = useState(false)
  const [cancelling, setCancelling] = useState<string | null>(null)
  const [filterDate, setFilterDate] = useState('')
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)

  useEffect(() => {
    fetch('/api/auth/admin').then(r => {
      setAuthed(r.ok)
    })
  }, [])

  useEffect(() => { if (authed) { loadDays(); loadBookings() } }, [authed])
  useEffect(() => { if (authed) loadBookings() }, [filterDate])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoginError(''); setLoginLoading(true)
    const res = await fetch('/api/auth/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
    setLoginLoading(false)
    if (res.ok) { setAuthed(true) }
    else { const d = await res.json(); setLoginError(d.error || 'Falsches Passwort') }
  }

  async function loadDays() {
    const res = await fetch('/api/available-days')
    const data = await res.json()
    setDays(Array.isArray(data) ? data : [])
  }

  async function loadBookings() {
    const url = filterDate ? `/api/bookings?date=${filterDate}` : '/api/bookings'
    const res = await fetch(url)
    const data = await res.json()
    setBookings(Array.isArray(data) ? data : [])
  }

  function showToast(msg: string, ok = true) {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3000)
  }

  function selectDate(dateStr: string) {
    setSelectedDate(dateStr)
    const existing = days.find(d => d.date === dateStr)
    setForm(existing
      ? { start_time: existing.start_time.slice(0, 5), end_time: existing.end_time.slice(0, 5), is_available: existing.is_available }
      : { start_time: '09:00', end_time: '18:00', is_available: true }
    )
  }

  async function saveDay() {
    if (!selectedDate) return
    setSaving(true)
    const res = await fetch('/api/available-days', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: selectedDate, ...form }),
    })
    setSaving(false)
    if (res.ok) { showToast('Gespeichert!'); loadDays() }
    else { const d = await res.json(); showToast(d.error || 'Fehler', false) }
  }

  async function deleteDay() {
    if (!selectedDate) return
    const existing = days.find(d => d.date === selectedDate)
    if (!existing || !confirm('Tag entfernen?')) return
    setSaving(true)
    await fetch(`/api/available-days/${existing.id}`, { method: 'DELETE' })
    setSaving(false)
    setSelectedDate(null)
    loadDays()
  }

  async function cancelBooking(id: string) {
    if (!confirm('Buchung stornieren?')) return
    setCancelling(id)
    await fetch(`/api/bookings/${id}`, { method: 'PATCH' })
    setCancelling(null)
    loadBookings()
  }

  // Loading state
  if (authed === null) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Lade…</div>
      </div>
    )
  }

  // Password form
  if (!authed) {
    return (
      <div className="flex items-center justify-center min-h-[80vh] px-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold">Admin</h1>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Passwort eingeben</p>
          </div>
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoFocus
              placeholder="Passwort"
              className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
              style={{ background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text)' }}
            />
            {loginError && (
              <p className="text-sm px-3 py-2 rounded-xl"
                style={{ background: '#1a0a0a', color: '#ff7070', border: '1px solid #5a1a1a' }}>
                {loginError}
              </p>
            )}
            <button type="submit" disabled={loginLoading}
              className="w-full py-2.5 rounded-xl font-semibold text-black transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ background: 'var(--gold)' }}>
              {loginLoading ? 'Prüfe…' : 'Einloggen'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  const availableSet = new Set(days.filter(d => d.is_available).map(d => d.date))
  const blockedSet = new Set(days.filter(d => !d.is_available).map(d => d.date))
  const calDays = eachDayOfInterval({ start: startOfMonth(month), end: endOfMonth(month) })
  const pad = (getDay(startOfMonth(month)) + 6) % 7
  const activeBookings = bookings.filter(b => b.status === 'active')
  const cancelledBookings = bookings.filter(b => b.status === 'cancelled')

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {toast && (
        <div className="fixed top-16 right-4 z-50 px-4 py-3 rounded-xl text-sm font-medium shadow-lg"
          style={{
            background: toast.ok ? '#0f2a0f' : '#2a0a0a',
            border: `1px solid ${toast.ok ? '#2a5a2a' : '#5a1a1a'}`,
            color: toast.ok ? '#6bff6b' : '#ff7070',
          }}>
          {toast.msg}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '4px' }}>Admin</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Verfügbarkeiten & Buchungen verwalten</p>
        </div>
        <div className="flex rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
          {(['calendar', 'bookings'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className="px-4 py-2 text-sm font-medium transition-colors"
              style={{
                background: tab === t ? 'var(--gold)' : 'var(--surface)',
                color: tab === t ? '#000' : 'var(--text)',
              }}>
              {t === 'calendar' ? 'Kalender' : `Buchungen${activeBookings.length ? ` (${activeBookings.length})` : ''}`}
            </button>
          ))}
        </div>
      </div>

      {tab === 'calendar' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-2xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <div className="flex items-center justify-between mb-4">
              <button onClick={() => setMonth(m => subMonths(m, 1))}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:opacity-70"
                style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}>‹</button>
              <span style={{ fontWeight: 600 }}>{format(month, 'MMMM yyyy', { locale: de })}</span>
              <button onClick={() => setMonth(m => addMonths(m, 1))}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:opacity-70"
                style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}>›</button>
            </div>
            <div className="grid grid-cols-7 mb-1">
              {WEEKDAYS.map(d => (
                <div key={d} className="text-center py-1" style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: pad }).map((_, i) => <div key={`p${i}`} />)}
              {calDays.map(day => {
                const ds = format(day, 'yyyy-MM-dd')
                const inM = isSameMonth(day, month)
                const isAvail = availableSet.has(ds)
                const isBlocked = blockedSet.has(ds)
                const isSel = selectedDate === ds
                return (
                  <button key={ds} disabled={!inM} onClick={() => inM && selectDate(ds)}
                    className="aspect-square rounded-lg text-sm font-medium transition-all flex items-center justify-center"
                    style={{
                      background: isSel ? 'var(--gold)' : isAvail ? '#0f2a0f' : isBlocked ? '#2a0a0a' : 'var(--surface2)',
                      color: isSel ? '#000' : !inM ? 'var(--border)' : 'var(--text)',
                      border: isToday(day) && !isSel ? '1px solid var(--gold)' : '1px solid transparent',
                      cursor: inM ? 'pointer' : 'default',
                      opacity: !inM ? 0.2 : 1,
                    }}>
                    {format(day, 'd')}
                  </button>
                )
              })}
            </div>
            <div className="flex flex-wrap gap-3 mt-4" style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded" style={{ background: '#0f2a0f', border: '1px solid #2a5a2a' }} />Freigegeben
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded" style={{ background: '#2a0a0a', border: '1px solid #5a1a1a' }} />Gesperrt
              </span>
            </div>
          </div>

          <div className="rounded-2xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            {!selectedDate ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <div style={{ fontSize: '3rem', marginBottom: '12px' }}>📅</div>
                <p style={{ fontWeight: 600, marginBottom: '6px' }}>Tag auswählen</p>
                <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                  Klicke im Kalender auf einen Tag um ihn zu konfigurieren.
                </p>
              </div>
            ) : (
              <>
                <h2 style={{ fontWeight: 700, marginBottom: '20px', fontSize: '1.1rem' }}>
                  {format(new Date(selectedDate + 'T12:00:00'), 'EEEE, d. MMMM yyyy', { locale: de })}
                </h2>
                <label className="flex items-center gap-3 cursor-pointer mb-5">
                  <div className="relative" onClick={() => setForm(f => ({ ...f, is_available: !f.is_available }))}>
                    <div className="w-11 h-6 rounded-full transition-colors"
                      style={{ background: form.is_available ? 'var(--gold)' : 'var(--border)' }} />
                    <div className="absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform"
                      style={{ transform: form.is_available ? 'translateX(20px)' : 'none' }} />
                  </div>
                  <span style={{ fontWeight: 500 }}>{form.is_available ? 'Tag freigegeben' : 'Tag gesperrt'}</span>
                </label>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {[{ label: 'Öffnet', key: 'start_time' }, { label: 'Schließt', key: 'end_time' }].map(({ label, key }) => (
                    <div key={key}>
                      <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>{label}</label>
                      <input type="time"
                        value={form[key as keyof typeof form] as string}
                        onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                        className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                        style={{ background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text)' }} />
                    </div>
                  ))}
                </div>
                <div className="rounded-lg px-3 py-2 mb-5" style={{ background: 'var(--surface2)', fontSize: '13px', color: 'var(--text-muted)' }}>
                  {slotCount(form.start_time, form.end_time)} Slots à 30 Min · {fmt(form.start_time)} – {fmt(form.end_time)} Uhr
                </div>
                <div className="flex gap-2">
                  <button onClick={saveDay} disabled={saving}
                    className="flex-1 py-2.5 rounded-xl font-semibold text-black transition-opacity hover:opacity-90 disabled:opacity-40"
                    style={{ background: 'var(--gold)' }}>
                    {saving ? 'Speichern…' : 'Speichern'}
                  </button>
                  {days.find(d => d.date === selectedDate) && (
                    <button onClick={deleteDay} disabled={saving}
                      className="px-4 py-2.5 rounded-xl text-sm hover:opacity-70 transition-opacity"
                      style={{ background: '#1a0a0a', border: '1px solid #5a1a1a', color: '#ff7070' }}>
                      Entfernen
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {tab === 'bookings' && (
        <div>
          <div className="flex flex-wrap gap-3 items-end mb-6">
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                Nach Datum filtern
              </label>
              <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)}
                className="px-3 py-2 rounded-xl text-sm outline-none"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }} />
            </div>
            {filterDate && (
              <button onClick={() => setFilterDate('')}
                className="px-3 py-2 rounded-xl text-sm hover:opacity-70"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                × Filter löschen
              </button>
            )}
          </div>

          {bookings.length === 0 ? (
            <div className="rounded-2xl p-10 text-center" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '12px' }}>📭</div>
              <p style={{ color: 'var(--text-muted)' }}>Keine Buchungen gefunden.</p>
            </div>
          ) : (
            <>
              {activeBookings.length > 0 && (
                <section className="mb-8">
                  <h2 style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.08em', marginBottom: '12px' }}>
                    AKTIVE BUCHUNGEN ({activeBookings.length})
                  </h2>
                  <div className="flex flex-col gap-3">
                    {activeBookings.map(b => (
                      <div key={b.id} className="rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                        <div className="flex items-center gap-4">
                          <div className="rounded-xl p-2.5 text-center flex-shrink-0"
                            style={{ background: 'var(--surface2)', minWidth: '60px' }}>
                            <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                              {format(new Date(b.date + 'T12:00:00'), 'dd. MMM', { locale: de })}
                            </p>
                            <p style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--gold)' }}>{fmt(b.time)}</p>
                          </div>
                          <div>
                            <p style={{ fontWeight: 600 }}>{b.customer_name}</p>
                          </div>
                        </div>
                        <button onClick={() => cancelBooking(b.id)} disabled={cancelling === b.id}
                          className="px-4 py-2 rounded-xl text-sm hover:opacity-70 transition-opacity disabled:opacity-40 whitespace-nowrap"
                          style={{ background: '#1a0a0a', border: '1px solid #5a1a1a', color: '#ff7070' }}>
                          {cancelling === b.id ? '…' : 'Stornieren'}
                        </button>
                      </div>
                    ))}
                  </div>
                </section>
              )}
              {cancelledBookings.length > 0 && (
                <section>
                  <h2 style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.08em', marginBottom: '12px' }}>
                    STORNIERT ({cancelledBookings.length})
                  </h2>
                  <div className="flex flex-col gap-2" style={{ opacity: 0.5 }}>
                    {cancelledBookings.map(b => (
                      <div key={b.id} className="rounded-xl px-4 py-3 flex items-center justify-between"
                        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                        <p style={{ fontSize: '14px' }}>
                          {b.customer_name} · {format(new Date(b.date + 'T12:00:00'), 'd. MMM yyyy', { locale: de })} · {fmt(b.time)} Uhr
                        </p>
                        <span style={{ fontSize: '12px', padding: '2px 8px', borderRadius: '999px', background: '#2a0a0a', color: '#ff6b6b' }}>
                          Storniert
                        </span>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add app/admin/page.tsx
git commit -m "feat: admin page uses password form instead of Supabase auth"
```

---

## Task 6: Rewrite API Routes

**Files:**
- Modify: `app/api/bookings/route.ts`
- Modify: `app/api/bookings/[id]/route.ts`
- Modify: `app/api/available-days/route.ts`
- Modify: `app/api/available-days/[id]/route.ts`

- [ ] **Step 1: Replace `app/api/bookings/route.ts` with:**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { isAdminAuthed } from '@/lib/admin-auth'

// GET /api/bookings — admin only
export async function GET(request: NextRequest) {
  if (!await isAdminAuthed()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = await createAdminClient()
  const { searchParams } = new URL(request.url)
  const date = searchParams.get('date')

  let query = admin
    .from('bookings')
    .select('*')
    .order('date', { ascending: true })
    .order('time', { ascending: true })

  if (date) query = query.eq('date', date)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// POST /api/bookings — public, just needs a name
export async function POST(request: NextRequest) {
  const body = await request.json()
  const { date, time, customer_name } = body

  if (!date || !time || !customer_name?.trim()) {
    return NextResponse.json({ error: 'Fehlende Felder' }, { status: 400 })
  }

  const admin = await createAdminClient()

  const { data: dayData } = await admin
    .from('available_days')
    .select('*')
    .eq('date', date)
    .eq('is_available', true)
    .single()

  if (!dayData) return NextResponse.json({ error: 'Tag nicht verfügbar' }, { status: 400 })

  if (time < dayData.start_time || time >= dayData.end_time) {
    return NextResponse.json({ error: 'Zeitslot außerhalb der Öffnungszeiten' }, { status: 400 })
  }

  const { data: existing } = await admin
    .from('bookings')
    .select('id')
    .eq('date', date)
    .eq('time', time)
    .eq('status', 'active')
    .single()

  if (existing) return NextResponse.json({ error: 'Zeitslot bereits belegt' }, { status: 409 })

  const { data: booking, error } = await admin
    .from('bookings')
    .insert({ date, time, status: 'active', customer_name: customer_name.trim() })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(booking, { status: 201 })
}
```

- [ ] **Step 2: Replace `app/api/bookings/[id]/route.ts` with:**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { isAdminAuthed } from '@/lib/admin-auth'

// PATCH /api/bookings/[id] — admin only, cancel a booking
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await isAdminAuthed()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const admin = await createAdminClient()

  const { error } = await admin
    .from('bookings')
    .update({ status: 'cancelled' })
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
```

- [ ] **Step 3: Replace `app/api/available-days/route.ts` with:**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { isAdminAuthed } from '@/lib/admin-auth'

// GET — public
export async function GET() {
  const admin = await createAdminClient()
  const { data, error } = await admin
    .from('available_days')
    .select('*')
    .gte('date', new Date().toISOString().split('T')[0])
    .order('date', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// POST — admin only
export async function POST(request: NextRequest) {
  if (!await isAdminAuthed()) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

  const body = await request.json()
  const { date, start_time, end_time, is_available } = body
  if (!date || !start_time || !end_time) return NextResponse.json({ error: 'Fehlende Felder' }, { status: 400 })

  const admin = await createAdminClient()
  const { data, error } = await admin
    .from('available_days')
    .upsert({ date, start_time, end_time, is_available: is_available ?? true }, { onConflict: 'date' })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
```

- [ ] **Step 4: Replace `app/api/available-days/[id]/route.ts` with:**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { isAdminAuthed } from '@/lib/admin-auth'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await isAdminAuthed()) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

  const { id } = await params
  const body = await request.json()
  const admin = await createAdminClient()

  const { data, error } = await admin
    .from('available_days')
    .update(body)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await isAdminAuthed()) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

  const { id } = await params
  const admin = await createAdminClient()
  const { error } = await admin.from('available_days').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
```

- [ ] **Step 5: Commit**

```bash
git add app/api/bookings/route.ts app/api/bookings/[id]/route.ts app/api/available-days/route.ts "app/api/available-days/[id]/route.ts"
git commit -m "feat: API routes use admin cookie auth, bookings POST is now public"
```

---

## Task 7: Simplify NavBar

**Files:**
- Modify: `components/NavBar.tsx`

- [ ] **Step 1: Replace `components/NavBar.tsx` with:**

```typescript
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'

export function NavBar() {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => setMenuOpen(false), [pathname])

  const linkStyle = (path: string) => ({
    color: pathname === path ? 'var(--gold)' : 'var(--text)',
  })

  return (
    <nav style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}
      className="sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg"
          style={{ color: 'var(--gold)' }}>
          <span className="hidden sm:inline">{process.env.NEXT_PUBLIC_SHOP_NAME || 'Barber'}</span>
        </Link>

        {/* Desktop */}
        <div className="hidden sm:flex items-center gap-1">
          <NavLink href="/book" style={linkStyle('/book')}>Buchen</NavLink>
        </div>

        {/* Mobile hamburger */}
        <button className="sm:hidden p-2 rounded-lg"
          style={{ background: menuOpen ? 'var(--surface2)' : 'transparent' }}
          onClick={() => setMenuOpen(v => !v)}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            {menuOpen ? (
              <>
                <line x1="4" y1="4" x2="16" y2="16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="16" y1="4" x2="4" y2="16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </>
            ) : (
              <>
                <line x1="3" y1="6" x2="17" y2="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="3" y1="10" x2="17" y2="10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="3" y1="14" x2="17" y2="14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </>
            )}
          </svg>
        </button>
      </div>

      {menuOpen && (
        <div className="sm:hidden border-t px-4 py-3 flex flex-col gap-1"
          style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
          <MobileLink href="/book">Buchen</MobileLink>
        </div>
      )}
    </nav>
  )
}

function NavLink({ href, children, style }: { href: string; children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <Link href={href}
      className="px-3 py-1.5 rounded-lg text-sm font-medium transition-opacity hover:opacity-70"
      style={style}>
      {children}
    </Link>
  )
}

function MobileLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href}
      className="px-3 py-2.5 rounded-lg text-sm font-medium"
      style={{ color: 'var(--text)' }}>
      {children}
    </Link>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/NavBar.tsx
git commit -m "feat: simplify NavBar — no auth state, just Buchen link"
```

---

## Task 8: Delete Dead Files

**Files to delete:**
- `app/login/page.tsx`
- `app/dashboard/page.tsx`
- `app/api/auth/otp/route.ts`
- `app/api/auth/verify-otp/route.ts`
- `app/api/auth/update-name/route.ts`
- `app/api/auth/callback/route.ts`
- `lib/admin.ts`
- `lib/email.ts`

- [ ] **Step 1: Delete the files**

```bash
rm app/login/page.tsx
rm app/dashboard/page.tsx
rm app/api/auth/otp/route.ts
rm app/api/auth/verify-otp/route.ts
rm app/api/auth/update-name/route.ts
rm app/api/auth/callback/route.ts
rm lib/admin.ts
rm lib/email.ts
```

- [ ] **Step 2: Check for any remaining imports of deleted files**

```bash
grep -r "from '@/lib/admin'" app/ lib/
grep -r "from '@/lib/supabase/client'" app/ components/
```

Expected: no matches (or only in files we've already rewritten)

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "chore: delete auth pages, auth API routes, and old admin helper"
```

---

## Task 9: Add ADMIN_PASSWORD to Vercel

- [ ] **Step 1: Go to Vercel Dashboard → your project → Settings → Environment Variables**

- [ ] **Step 2: Add:**
  - Key: `ADMIN_PASSWORD`
  - Value: your chosen password
  - Environment: Production + Preview

- [ ] **Step 3: Push everything and trigger redeploy**

```bash
git push
```

- [ ] **Step 4: Test on production:**
  1. Go to `tjark-barber.vercel.app/book` — should load without login
  2. Enter a name, pick a date and slot, book — should succeed
  3. Go to `tjark-barber.vercel.app/admin` — should show password form
  4. Enter wrong password — should show error
  5. Enter correct password — should show admin panel
  6. Booking should appear in admin bookings tab
