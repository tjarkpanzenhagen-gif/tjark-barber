'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'

export function NavBar() {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => setMenuOpen(false), [pathname])

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
          <Link href="/book"
            className="px-3 py-1.5 rounded-lg text-sm font-medium transition-opacity hover:opacity-70"
            style={{ color: pathname === '/book' ? 'var(--gold)' : 'var(--text)' }}>
            Buchen
          </Link>
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
          <Link href="/book"
            className="px-3 py-2.5 rounded-lg text-sm font-medium"
            style={{ color: 'var(--text)' }}>
            Buchen
          </Link>
        </div>
      )}
    </nav>
  )
}
