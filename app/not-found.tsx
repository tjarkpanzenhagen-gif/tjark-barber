import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4 text-center">
      <div>
        <p style={{ fontSize: '5rem', fontWeight: 800, color: 'var(--border)', lineHeight: 1 }}>404</p>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, margin: '16px 0 8px' }}>Seite nicht gefunden</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px' }}>
          Diese Seite existiert nicht.
        </p>
        <Link href="/" className="px-6 py-2.5 rounded-xl font-medium text-black inline-block"
          style={{ background: 'var(--gold)' }}>
          Zur Startseite
        </Link>
      </div>
    </div>
  )
}
