'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

export function NavBar() {
  const [user, setUser] = useState<User | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const supabaseRef = useRef(createClient())
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const supabase = supabaseRef.current
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
      checkAdmin(data.user?.email)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
      checkAdmin(session?.user?.email)
    })
    return () => subscription.unsubscribe()
  }, [])

  function checkAdmin(email?: string | null) {
    const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || ''
    setIsAdmin(!!email && !!adminEmail && email.toLowerCase() === adminEmail.toLowerCase())
  }

  useEffect(() => setMenuOpen(false), [pathname])

  async function handleLogout() {
    await supabaseRef.current.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const linkStyle = (path: string) => ({
    color: pathname === path || pathname.startsWith(path + '/') ? 'var(--gold)' : 'var(--text)',
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
          {user ? (
            <>
              <NavLink href="/book" style={linkStyle('/book')}>Buchen</NavLink>
              <NavLink href="/dashboard" style={linkStyle('/dashboard')}>Meine Termine</NavLink>
              {isAdmin && <NavLink href="/admin" style={linkStyle('/admin')}>Admin</NavLink>}
              <button onClick={handleLogout}
                className="ml-2 px-3 py-1.5 rounded-lg text-sm transition-opacity hover:opacity-70"
                style={{ background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                Abmelden
              </button>
            </>
          ) : (
            <NavLink href="/login" style={linkStyle('/login')}>Anmelden</NavLink>
          )}
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

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="sm:hidden border-t px-4 py-3 flex flex-col gap-1"
          style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
          {user ? (
            <>
              <MobileLink href="/book">Buchen</MobileLink>
              <MobileLink href="/dashboard">Meine Termine</MobileLink>
              {isAdmin && <MobileLink href="/admin">Admin</MobileLink>}
              <button onClick={handleLogout} className="text-left px-3 py-2.5 rounded-lg text-sm mt-1"
                style={{ color: 'var(--text-muted)' }}>
                Abmelden
              </button>
            </>
          ) : (
            <>
              <MobileLink href="/login">Anmelden</MobileLink>
            </>
          )}
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

function MobileLink({ href, children, gold }: { href: string; children: React.ReactNode; gold?: boolean }) {
  return (
    <Link href={href}
      className="px-3 py-2.5 rounded-lg text-sm font-medium"
      style={{ color: gold ? 'var(--gold)' : 'var(--text)' }}>
      {children}
    </Link>
  )
}
