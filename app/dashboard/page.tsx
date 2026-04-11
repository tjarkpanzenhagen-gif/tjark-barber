'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'
import Link from 'next/link'

interface Booking {
  id: string
  date: string
  time: string
  status: 'active' | 'cancelled'
  customer_name: string
  created_at: string
}

const fmt = (t: string) => t.slice(0, 5)

function canCancel(date: string, time: string) {
  return new Date(`${date}T${time}`).getTime() - Date.now() > 2 * 3600 * 1000
}

function isUpcoming(b: Booking) {
  return b.status === 'active' && new Date(`${b.date}T${b.time}`) >= new Date()
}

export default function DashboardPage() {
  const supabaseRef = useRef(createClient())
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    supabaseRef.current.auth.getUser().then(({ data }) => {
      if (!data.user) { router.push('/login'); return }
      load()
    })
  }, [])

  async function load() {
    setLoading(true)
    const res = await fetch('/api/bookings')
    if (res.status === 401) { router.push('/login'); return }
    const data = await res.json()
    setBookings(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  async function handleCancel(id: string) {
    if (!confirm('Termin wirklich stornieren?')) return
    setCancelling(id)
    const res = await fetch(`/api/bookings/${id}`, { method: 'PATCH' })
    const data = await res.json()
    if (!res.ok) alert(data.error || 'Fehler')
    setCancelling(null)
    load()
  }

  const upcoming = bookings.filter(isUpcoming)
  const past = bookings.filter(b => !isUpcoming(b)).slice(0, 20)

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '4px' }}>Meine Termine</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
            {loading ? '' : `${upcoming.length} kommend${upcoming.length !== 1 ? 'e' : 'er'} Termin${upcoming.length !== 1 ? 'e' : ''}`}
          </p>
        </div>
        <Link href="/book"
          className="px-4 py-2 rounded-xl text-sm font-semibold text-black"
          style={{ background: 'var(--gold)' }}>
          + Buchen
        </Link>
      </div>

      {loading ? (
        <div className="flex flex-col gap-3">
          {[1, 2].map(i => (
            <div key={i} className="rounded-2xl h-20 animate-pulse" style={{ background: 'var(--surface)' }} />
          ))}
        </div>
      ) : (
        <>
          {upcoming.length === 0 && (
            <div className="rounded-2xl p-10 text-center mb-8"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '12px' }}>📅</div>
              <p style={{ fontWeight: 600, marginBottom: '6px' }}>Keine kommenden Termine</p>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '20px' }}>
                Buche jetzt deinen nächsten Termin.
              </p>
              <Link href="/book"
                className="px-6 py-2.5 rounded-xl font-semibold text-black inline-block"
                style={{ background: 'var(--gold)' }}>
                Termin buchen
              </Link>
            </div>
          )}

          {upcoming.length > 0 && (
            <section className="mb-8">
              <h2 style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.08em', marginBottom: '12px' }}>
                KOMMENDE TERMINE
              </h2>
              <div className="flex flex-col gap-3">
                {upcoming.map(b => (
                  <BookingCard key={b.id} booking={b} onCancel={handleCancel} cancelling={cancelling} />
                ))}
              </div>
            </section>
          )}

          {past.length > 0 && (
            <section>
              <h2 style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.08em', marginBottom: '12px' }}>
                VERGANGENE TERMINE
              </h2>
              <div className="flex flex-col gap-2">
                {past.map(b => (
                  <div key={b.id} className="rounded-2xl px-4 py-3 flex items-center justify-between"
                    style={{ background: 'var(--surface)', border: '1px solid var(--border)', opacity: 0.55 }}>
                    <div>
                      <p style={{ fontSize: '14px', fontWeight: 500 }}>
                        {format(new Date(b.date + 'T12:00:00'), 'd. MMMM yyyy', { locale: de })} · {fmt(b.time)} Uhr
                      </p>
                    </div>
                    <span style={{
                      fontSize: '12px', padding: '3px 10px', borderRadius: '999px',
                      background: b.status === 'cancelled' ? '#2a0a0a' : 'var(--surface2)',
                      color: b.status === 'cancelled' ? '#ff6b6b' : 'var(--text-muted)',
                      border: `1px solid ${b.status === 'cancelled' ? '#5a1a1a' : 'var(--border)'}`,
                    }}>
                      {b.status === 'cancelled' ? 'Storniert' : 'Vergangen'}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  )
}

function BookingCard({ booking: b, onCancel, cancelling }: {
  booking: Booking
  onCancel: (id: string) => void
  cancelling: string | null
}) {
  const cancellable = canCancel(b.date, b.time)

  return (
    <div className="rounded-2xl p-5"
      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '4px' }}>
            {format(new Date(b.date + 'T12:00:00'), 'EEEE, d. MMMM yyyy', { locale: de })}
          </p>
          <p style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--gold)', lineHeight: 1 }}>
            {fmt(b.time)}
            <span style={{ fontSize: '1rem', fontWeight: 400, color: 'var(--text-muted)' }}> Uhr</span>
          </p>
        </div>
        <div className="text-right">
          {cancellable ? (
            <button onClick={() => onCancel(b.id)} disabled={cancelling === b.id}
              className="px-3 py-1.5 rounded-lg text-sm transition-opacity hover:opacity-70 disabled:opacity-40"
              style={{ background: '#1a0a0a', border: '1px solid #5a1a1a', color: '#ff7070' }}>
              {cancelling === b.id ? '…' : 'Stornieren'}
            </button>
          ) : (
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', maxWidth: '120px', textAlign: 'right' }}>
              Stornierung nicht mehr möglich
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
