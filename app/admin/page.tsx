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
  const [authed, setAuthed] = useState<boolean | null>(null)
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
  const [pushState, setPushState] = useState<'idle' | 'subscribed' | 'unsupported'>('idle')

  useEffect(() => {
    fetch('/api/auth/admin').then(r => setAuthed(r.ok))
  }, [])

  useEffect(() => {
    if (!authed) return
    if (!('Notification' in window) || !('serviceWorker' in navigator)) { setPushState('unsupported'); return }
    if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => {})
    navigator.serviceWorker.ready.then(reg =>
      reg.pushManager.getSubscription().then(sub => { if (sub) setPushState('subscribed') })
    )
  }, [authed])

  async function subscribePush() {
    try {
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      })
      await fetch('/api/push/admin', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(sub) })
      setPushState('subscribed')
      showToast('Benachrichtigungen aktiviert!')
    } catch { showToast('Fehler beim Aktivieren', false) }
  }

  async function unsubscribePush() {
    const reg = await navigator.serviceWorker.ready
    const sub = await reg.pushManager.getSubscription()
    if (sub) {
      await fetch('/api/push/admin', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ endpoint: sub.endpoint }) })
      await sub.unsubscribe()
    }
    setPushState('idle')
    showToast('Benachrichtigungen deaktiviert')
  }

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
    const res = await fetch(`/api/bookings/${id}`, { method: 'PATCH' })
    setCancelling(null)
    if (res.ok) { showToast('Buchung storniert'); loadBookings() }
    else { const d = await res.json().catch(() => ({})); showToast(d.error || 'Stornierung fehlgeschlagen', false) }
  }

  if (authed === null) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Lade…</div>
      </div>
    )
  }

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
          {pushState === 'unsupported' ? (
            <details className="mt-2" style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              <summary style={{ cursor: 'pointer', color: 'var(--gold)', fontWeight: 500 }}>
                🔔 Push aktivieren (iPhone-Anleitung)
              </summary>
              <ol style={{ paddingLeft: '16px', marginTop: '6px', lineHeight: 1.8 }}>
                <li>Öffne diese Seite in <strong style={{ color: 'var(--text)' }}>Safari</strong></li>
                <li>Tippe auf <strong style={{ color: 'var(--text)' }}>Teilen ⎋</strong> → <strong style={{ color: 'var(--text)' }}>„Zum Home-Bildschirm"</strong></li>
                <li>App vom Home-Bildschirm öffnen</li>
                <li>Dann erscheint hier der Aktivieren-Button</li>
              </ol>
            </details>
          ) : (
            <button
              onClick={pushState === 'subscribed' ? unsubscribePush : subscribePush}
              className="mt-2 px-3 py-1.5 rounded-lg text-xs font-medium"
              style={{
                background: pushState === 'subscribed' ? 'var(--surface2)' : 'rgba(212,168,83,0.15)',
                border: `1px solid ${pushState === 'subscribed' ? 'var(--border)' : 'rgba(212,168,83,0.4)'}`,
                color: pushState === 'subscribed' ? 'var(--text-muted)' : 'var(--gold)',
              }}>
              {pushState === 'subscribed' ? '🔔 Push aktiv — deaktivieren' : '🔔 Push bei Buchungen aktivieren'}
            </button>
          )}
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
                          <p style={{ fontWeight: 600 }}>{b.customer_name}</p>
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
