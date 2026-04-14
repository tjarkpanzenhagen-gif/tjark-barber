import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4">
      <div className="text-center">
        <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '8px' }}>
          Terminbuchung
        </h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '32px', fontSize: '15px' }}>
          Buch dir einen Slot.
        </p>
        <Link href="/book"
          className="px-6 py-2.5 rounded-xl font-semibold text-black"
          style={{ background: 'var(--gold)' }}>
          Termin buchen
        </Link>
      </div>
    </div>
  )
}
