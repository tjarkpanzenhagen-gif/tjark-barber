'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
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
  const supabaseRef = useRef(createClient())
  const [user, setUser] = useState<User | null>(null)
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
  const router = useRouter()

  useEffect(() => {
    supabaseRef.current.auth.getUser().then(({ data }) => {
      if (!data.user) { router.push('/login'); return }
      setUser(data.user)
      setName(data.user.user_metadata?.full_name || '')
    })
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
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '24px' }}>
            Bestätigung wurde per E-Mail gesendet. Stornierung bis 2h vorher möglich.
          </p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => { setSuccess(null); setSelectedDate(null); setSelectedSlot(null); fetch('/api/available-days').then(r => r.json()).then(d => setAvailableDays(Array.isArray(d) ? d : [])) }}
              className="px-5 py-2.5 rounded-xl font-medium text-black"
              style={{ background: 'var(--gold)' }}>
              Weiterer Termin
            </button>
            <button onClick={() => router.push('/dashboard')}
              className="px-5 py-2.5 rounded-xl font-medium"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              Meine Termine
            </button>
          </div>
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
          {/* Month navigation */}
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => setMonth(m => subMonths(m, 1))}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:opacity-70"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              ‹
            </button>
            <span style={{ fontWeight: 600 }}>
              {format(month, 'MMMM yyyy', { locale: de })}
            </span>
            <button onClick={() => setMonth(m => addMonths(m, 1))}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:opacity-70"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              ›
            </button>
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
                      border: `1px solid ${sel ? 'var(--gold)' : taken ? 'var(--border)' : 'var(--border)'}`,
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
            <div className="rounded-xl px-4 py-3 mb-4" style={{ background: '#1a0a0a', border: '1px solid #5a1a1a', color: '#ff7070', fontSize: '14px' }}>
              {error}
            </div>
          )}

          <button onClick={handleBook} disabled={booking || !name.trim()}
            className="w-full py-3.5 rounded-xl font-semibold text-black transition-opacity hover:opacity-90 disabled:opacity-40"
            style={{ background: 'var(--gold)', fontSize: '1rem' }}>
            {booking ? 'Buchung wird erstellt…' : 'Verbindlich buchen'}
          </button>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', marginTop: '10px' }}>
            Stornierung bis 2 Stunden vor dem Termin möglich
          </p>
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
