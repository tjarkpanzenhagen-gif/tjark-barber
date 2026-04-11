# Naturwerk Landschaftspflege Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a complete single-page marketing website for Naturwerk Landschaftspflege as a production-ready demo for the client.

**Architecture:** Next.js 15 App Router, pure static site (no backend). All sections are individual components assembled in `app/page.tsx`. Scroll animations via Intersection Observer + CSS classes.

**Tech Stack:** Next.js 15, Tailwind CSS v4, Hugeicons (`@hugeicons/react`), Author font (Fontshare CDN)

---

## File Map

| File | Purpose |
|------|---------|
| `app/layout.tsx` | Root layout: Author font import, metadata, body class |
| `app/globals.css` | Tailwind v4 `@theme`, CSS variables, Author `@font-face`, base styles |
| `app/page.tsx` | Assembles all section components |
| `app/impressum/page.tsx` | Placeholder Impressum page |
| `components/Nav.tsx` | Sticky nav with logo, scroll links, WhatsApp CTA |
| `components/Hero.tsx` | Fullscreen hero with bg image, headline, two CTAs |
| `components/About.tsx` | Company story section |
| `components/Services.tsx` | 8 service cards with Hugeicons |
| `components/Team.tsx` | 4 team member cards |
| `components/Gallery.tsx` | Image grid with hover effect |
| `components/Footer.tsx` | WhatsApp CTA, Instagram, address, Impressum link |
| `components/AnimatedSection.tsx` | Reusable scroll-triggered fade-in wrapper |
| `public/images/` | Placeholder images (hero-bg.jpg, team-*.jpg, gallery-*.jpg) |
| `next.config.ts` | Allow external image domains for placeholders |

---

## Task 1: Scaffold Next.js Project

**Files:**
- Create: `c:/Users/Drest/Desktop/mathias/` (new project root)

- [ ] **Step 1: Create Next.js project**

```bash
cd c:/Users/Drest/Desktop
npx create-next-app@latest mathias --typescript --tailwind --eslint --app --no-src-dir --import-alias "@/*"
cd mathias
```

When prompted, accept all defaults. Tailwind and TypeScript are included.

- [ ] **Step 2: Install Hugeicons**

```bash
npm install @hugeicons/react
```

- [ ] **Step 3: Verify dev server starts**

```bash
npm run dev
```

Open `http://localhost:3000` — should show default Next.js page. Stop server with Ctrl+C.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: scaffold Next.js project with Tailwind and Hugeicons"
```

---

## Task 2: Global Styles & Theme

**Files:**
- Modify: `app/globals.css`
- Modify: `app/layout.tsx`

- [ ] **Step 1: Replace globals.css entirely**

```css
/* app/globals.css */
@import "tailwindcss";

@font-face {
  font-family: 'Author';
  src: url('https://api.fontshare.com/v2/css?f[]=author@300,400,500,600,700&display=swap');
  font-display: swap;
}

@theme {
  --color-forest: #2C3E2D;
  --color-moss: #5C7A3E;
  --color-bark: #7A5C3A;
  --color-cream: #F5EDD8;
  --color-parchment: #EDE0C4;
  --color-soil: #3D2B1F;
  --font-author: 'Author', Georgia, serif;
}

* {
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  background-color: var(--color-cream);
  color: var(--color-soil);
  font-family: var(--font-author);
}

/* Grain texture overlay */
body::before {
  content: '';
  position: fixed;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
  pointer-events: none;
  z-index: 9999;
  opacity: 0.4;
}

/* Scroll animation classes */
.reveal {
  opacity: 0;
  transform: translateY(32px);
  transition: opacity 0.7s ease, transform 0.7s ease;
}

.reveal.visible {
  opacity: 1;
  transform: translateY(0);
}

.reveal-delay-1 { transition-delay: 0.1s; }
.reveal-delay-2 { transition-delay: 0.2s; }
.reveal-delay-3 { transition-delay: 0.3s; }
.reveal-delay-4 { transition-delay: 0.4s; }
.reveal-delay-5 { transition-delay: 0.5s; }
.reveal-delay-6 { transition-delay: 0.6s; }
.reveal-delay-7 { transition-delay: 0.7s; }
.reveal-delay-8 { transition-delay: 0.8s; }
```

Note: Fontshare doesn't support `@font-face` `src` URLs directly — use a `<link>` tag in the HTML head instead. The `@font-face` block above is a placeholder; the actual import is done in `layout.tsx` (see Step 2).

- [ ] **Step 2: Update app/layout.tsx**

```tsx
// app/layout.tsx
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Naturwerk Landschaftspflege',
  description: 'Professionelle Baum- und Gartenpflege — Naturwerk Landschaftspflege Bäcker & Martens GbR',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="de">
      <head>
        <link
          href="https://api.fontshare.com/v2/css?f[]=author@300,400,500,600,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  )
}
```

- [ ] **Step 3: Also remove the @font-face block from globals.css**

Remove these lines from `app/globals.css` (the font is loaded via `<link>` in layout.tsx, not @font-face):

```css
@font-face {
  font-family: 'Author';
  src: url('https://api.fontshare.com/v2/css?f[]=author@300,400,500,600,700&display=swap');
  font-display: swap;
}
```

- [ ] **Step 4: Update next.config.ts to allow placeholder image domain**

```ts
// next.config.ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
    ],
  },
}

export default nextConfig
```

- [ ] **Step 5: Start dev server and verify cream background + Author font loads**

```bash
npm run dev
```

Open `http://localhost:3000`. Background should be warm cream (#F5EDD8). Stop server.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add global theme, Author font, grain texture, scroll animation classes"
```

---

## Task 3: AnimatedSection Wrapper

**Files:**
- Create: `components/AnimatedSection.tsx`

- [ ] **Step 1: Create AnimatedSection.tsx**

```tsx
// components/AnimatedSection.tsx
'use client'

import { useEffect, useRef } from 'react'

interface AnimatedSectionProps {
  children: React.ReactNode
  className?: string
  delay?: number
}

export default function AnimatedSection({ children, className = '', delay = 0 }: AnimatedSectionProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('visible')
          observer.unobserve(el)
        }
      },
      { threshold: 0.15 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={`reveal ${className}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/AnimatedSection.tsx
git commit -m "feat: add AnimatedSection scroll-trigger wrapper"
```

---

## Task 4: Nav Component

**Files:**
- Create: `components/Nav.tsx`

- [ ] **Step 1: Create Nav.tsx**

```tsx
// components/Nav.tsx
'use client'

import { useState, useEffect } from 'react'
import { Whatsapp01Icon } from '@hugeicons/react'

const links = [
  { label: 'Über uns', href: '#about' },
  { label: 'Leistungen', href: '#services' },
  { label: 'Team', href: '#team' },
  { label: 'Galerie', href: '#gallery' },
  { label: 'Kontakt', href: '#footer' },
]

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-[var(--color-forest)]/95 backdrop-blur-sm shadow-lg py-3'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo / Brand */}
        <a
          href="#"
          className="text-[var(--color-cream)] font-bold text-lg tracking-wide"
          style={{ fontFamily: 'var(--font-author)' }}
        >
          Naturwerk
        </a>

        {/* Desktop links */}
        <ul className="hidden md:flex items-center gap-8">
          {links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="text-[var(--color-cream)]/80 hover:text-[var(--color-cream)] text-sm tracking-wide transition-colors duration-200"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        {/* WhatsApp CTA */}
        <a
          href="https://wa.me/49XXXXXXXXXX"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:flex items-center gap-2 bg-[var(--color-moss)] hover:bg-[var(--color-moss)]/80 text-white text-sm font-medium px-4 py-2 rounded-full transition-colors duration-200"
        >
          <Whatsapp01Icon size={16} />
          WhatsApp
        </a>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-[var(--color-cream)] flex flex-col gap-1.5 p-1"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menü öffnen"
        >
          <span className={`block w-6 h-0.5 bg-current transition-transform duration-300 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
          <span className={`block w-6 h-0.5 bg-current transition-opacity duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
          <span className={`block w-6 h-0.5 bg-current transition-transform duration-300 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-[var(--color-forest)] px-6 pb-4 pt-2">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="block py-2 text-[var(--color-cream)]/80 hover:text-[var(--color-cream)] text-sm tracking-wide border-b border-[var(--color-cream)]/10"
            >
              {link.label}
            </a>
          ))}
          <a
            href="https://wa.me/49XXXXXXXXXX"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 flex items-center gap-2 bg-[var(--color-moss)] text-white text-sm font-medium px-4 py-2 rounded-full w-fit"
          >
            <Whatsapp01Icon size={16} />
            WhatsApp
          </a>
        </div>
      )}
    </nav>
  )
}
```

Note: Replace `49XXXXXXXXXX` with the client's real WhatsApp number in E.164 format (e.g. `4917612345678`).

- [ ] **Step 2: Add Nav to page.tsx temporarily to test**

```tsx
// app/page.tsx
import Nav from '@/components/Nav'

export default function Home() {
  return (
    <main>
      <Nav />
      <div className="h-screen bg-[var(--color-cream)]" />
    </main>
  )
}
```

- [ ] **Step 3: Start dev server and verify Nav**

```bash
npm run dev
```

Check: Nav is transparent at top, turns forest-green on scroll, mobile hamburger works.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: add sticky Nav component with mobile menu and WhatsApp CTA"
```

---

## Task 5: Hero Component

**Files:**
- Create: `components/Hero.tsx`
- Note: Uses `https://picsum.photos/1920/1080?random=10` as placeholder hero bg. Replace with `/images/hero-bg.jpg` when client provides photo.

- [ ] **Step 1: Create Hero.tsx**

```tsx
// components/Hero.tsx
import { Whatsapp01Icon, InstagramIcon } from '@hugeicons/react'

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('https://picsum.photos/1920/1080?random=10')",
        }}
      />

      {/* Warm dark overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-soil)]/70 via-[var(--color-forest)]/60 to-[var(--color-soil)]/80" />

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        {/* Eyebrow */}
        <p
          className="text-[var(--color-parchment)]/70 text-sm tracking-[0.3em] uppercase mb-6"
          style={{ fontFamily: 'var(--font-author)' }}
        >
          Bäcker & Martens GbR
        </p>

        {/* Main headline */}
        <h1
          className="text-5xl md:text-7xl lg:text-8xl text-[var(--color-cream)] mb-6 leading-tight font-bold"
          style={{ fontFamily: 'var(--font-author)' }}
        >
          Naturwerk
          <br />
          <span className="text-[var(--color-parchment)]">Landschaftspflege</span>
        </h1>

        {/* Tagline */}
        <p
          className="text-[var(--color-parchment)]/80 text-lg md:text-xl mb-10 font-light"
          style={{ fontFamily: 'var(--font-author)' }}
        >
          Natur mit Erfahrung pflegen
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="https://wa.me/49XXXXXXXXXX"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 bg-[var(--color-moss)] hover:bg-[var(--color-moss)]/80 text-white px-8 py-4 rounded-full text-base font-medium transition-all duration-300 hover:scale-105 shadow-lg"
          >
            <Whatsapp01Icon size={20} />
            Jetzt anfragen
          </a>
          <a
            href="https://instagram.com/naturwerk.landschaftspflege"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 border border-[var(--color-cream)]/40 hover:border-[var(--color-cream)] text-[var(--color-cream)] px-8 py-4 rounded-full text-base font-medium transition-all duration-300 hover:bg-[var(--color-cream)]/10"
          >
            <InstagramIcon size={20} />
            Instagram
          </a>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[var(--color-cream)]/50">
        <span className="text-xs tracking-widest uppercase" style={{ fontFamily: 'var(--font-author)' }}>Scroll</span>
        <div className="w-px h-12 bg-gradient-to-b from-[var(--color-cream)]/50 to-transparent animate-pulse" />
      </div>
    </section>
  )
}
```

Note: Replace `49XXXXXXXXXX` with real WhatsApp number.

- [ ] **Step 2: Add Hero to page.tsx**

```tsx
// app/page.tsx
import Nav from '@/components/Nav'
import Hero from '@/components/Hero'

export default function Home() {
  return (
    <main>
      <Nav />
      <Hero />
    </main>
  )
}
```

- [ ] **Step 3: Verify in browser**

Run `npm run dev`. Check: fullscreen hero with warm overlay, both CTA buttons visible, scroll indicator animates.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: add Hero section with fullscreen bg, CTAs, scroll indicator"
```

---

## Task 6: About Section

**Files:**
- Create: `components/About.tsx`

- [ ] **Step 1: Create About.tsx**

```tsx
// components/About.tsx
import AnimatedSection from './AnimatedSection'
import { TreePlanting01Icon } from '@hugeicons/react'

export default function About() {
  return (
    <section id="about" className="py-24 px-6 bg-[var(--color-cream)]">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">

        {/* Image */}
        <AnimatedSection>
          <div className="relative">
            <div
              className="w-full aspect-[4/3] bg-cover bg-center rounded-2xl shadow-2xl"
              style={{ backgroundImage: "url('https://picsum.photos/800/600?random=20')" }}
            />
            {/* Decorative offset border */}
            <div className="absolute -bottom-4 -right-4 w-full h-full border-2 border-[var(--color-moss)]/30 rounded-2xl -z-10" />
          </div>
        </AnimatedSection>

        {/* Text */}
        <AnimatedSection delay={150}>
          <div className="flex items-center gap-3 mb-6">
            <TreePlanting01Icon size={24} className="text-[var(--color-moss)]" />
            <span
              className="text-[var(--color-moss)] text-sm tracking-[0.25em] uppercase font-medium"
              style={{ fontFamily: 'var(--font-author)' }}
            >
              Über uns
            </span>
          </div>

          <h2
            className="text-4xl md:text-5xl text-[var(--color-forest)] font-bold mb-6 leading-tight"
            style={{ fontFamily: 'var(--font-author)' }}
          >
            Gemeinsam mehr
            <br />
            erreichen
          </h2>

          <p
            className="text-[var(--color-soil)]/80 text-lg leading-relaxed mb-4 font-light"
            style={{ fontFamily: 'var(--font-author)' }}
          >
            Naturwerk Landschaftspflege entstand aus dem Zusammenschluss zweier erfahrener Betriebe. 
            Mathias Bäcker bringt jahrelange Erfahrung im Baum- und Forstservice mit, 
            John Martens ist zertifizierter Forstwirt mit Spezialisierung in der Baumpflege.
          </p>

          <p
            className="text-[var(--color-soil)]/70 text-base leading-relaxed font-light"
            style={{ fontFamily: 'var(--font-author)' }}
          >
            Gemeinsam bieten wir Ihnen professionelle Pflege für Ihren Garten, Ihre Bäume und Grünanlagen — 
            zuverlässig, persönlich und mit echter Leidenschaft für die Natur.
          </p>
        </AnimatedSection>

      </div>
    </section>
  )
}
```

- [ ] **Step 2: Add About to page.tsx**

```tsx
// app/page.tsx
import Nav from '@/components/Nav'
import Hero from '@/components/Hero'
import About from '@/components/About'

export default function Home() {
  return (
    <main>
      <Nav />
      <Hero />
      <About />
    </main>
  )
}
```

- [ ] **Step 3: Verify: section fades in on scroll**

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: add About section with team intro and scroll animation"
```

---

## Task 7: Services Section

**Files:**
- Create: `components/Services.tsx`

- [ ] **Step 1: Create Services.tsx**

```tsx
// components/Services.tsx
import AnimatedSection from './AnimatedSection'
import {
  Tree01Icon,
  ChopIcon,
  CheckmarkBadge01Icon,
  ForestIcon,
  StormIcon,
  Garden01Icon,
  FlowerPotIcon,
  Apple01Icon,
} from '@hugeicons/react'

const services = [
  {
    icon: Tree01Icon,
    title: 'Baumpflege',
    description: 'Professionelle Pflege und Formschnitt für gesunde, standortsichere Bäume.',
  },
  {
    icon: ChopIcon,
    title: 'Baumfällung',
    description: 'Sichere Fällung von Bäumen auch in engen Verhältnissen und Stückabtragung.',
  },
  {
    icon: CheckmarkBadge01Icon,
    title: 'Baumkontrolle',
    description: 'Zertifizierte Sichtkontrollen und Baumgutachten nach FLL-Richtlinien.',
  },
  {
    icon: ForestIcon,
    title: 'Forstarbeiten',
    description: 'Durchforstung, Holzeinschlag und Pflege von Waldflächen aller Größen.',
  },
  {
    icon: StormIcon,
    title: 'Sturmschäden',
    description: 'Schnelle und sichere Beseitigung von Sturmschäden — auch im Notfall.',
  },
  {
    icon: Garden01Icon,
    title: 'Grünflächenpflege',
    description: 'Regelmäßige Pflege von Gärten, Parks und gewerblichen Grünanlagen.',
  },
  {
    icon: FlowerPotIcon,
    title: 'Heckenschnitt',
    description: 'Formschnitt und Pflege von Hecken aller Arten — exakt und sauber.',
  },
  {
    icon: Apple01Icon,
    title: 'Obstbaumschnitt',
    description: 'Fachgerechter Schnitt für optimale Fruchtqualität und Baumlanglebigkeit.',
  },
]

export default function Services() {
  return (
    <section
      id="services"
      className="py-24 px-6"
      style={{ backgroundColor: 'var(--color-parchment)' }}
    >
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <AnimatedSection className="text-center mb-16">
          <span
            className="text-[var(--color-moss)] text-sm tracking-[0.25em] uppercase font-medium"
            style={{ fontFamily: 'var(--font-author)' }}
          >
            Was wir tun
          </span>
          <h2
            className="text-4xl md:text-5xl text-[var(--color-forest)] font-bold mt-3"
            style={{ fontFamily: 'var(--font-author)' }}
          >
            Unsere Leistungen
          </h2>
        </AnimatedSection>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, i) => (
            <AnimatedSection key={service.title} delay={i * 80}>
              <div className="group bg-[var(--color-cream)] rounded-2xl p-6 hover:bg-[var(--color-forest)] transition-colors duration-300 cursor-default h-full">
                <service.icon
                  size={32}
                  className="text-[var(--color-moss)] group-hover:text-[var(--color-parchment)] mb-4 transition-colors duration-300"
                />
                <h3
                  className="text-[var(--color-forest)] group-hover:text-[var(--color-cream)] font-bold text-lg mb-2 transition-colors duration-300"
                  style={{ fontFamily: 'var(--font-author)' }}
                >
                  {service.title}
                </h3>
                <p
                  className="text-[var(--color-soil)]/70 group-hover:text-[var(--color-cream)]/70 text-sm leading-relaxed font-light transition-colors duration-300"
                  style={{ fontFamily: 'var(--font-author)' }}
                >
                  {service.description}
                </p>
              </div>
            </AnimatedSection>
          ))}
        </div>

      </div>
    </section>
  )
}
```

**Note on icons:** The exact icon names (`ChopIcon`, `ForestIcon`, `StormIcon`) may differ in `@hugeicons/react`. If an import fails, replace with a working alternative from the library. Check available icons at `node_modules/@hugeicons/react/dist/index.d.ts` or the Hugeicons website. Fallback for any missing icon: `Tree01Icon`.

- [ ] **Step 2: Add Services to page.tsx**

```tsx
// app/page.tsx
import Nav from '@/components/Nav'
import Hero from '@/components/Hero'
import About from '@/components/About'
import Services from '@/components/Services'

export default function Home() {
  return (
    <main>
      <Nav />
      <Hero />
      <About />
      <Services />
    </main>
  )
}
```

- [ ] **Step 3: Fix any icon import errors**

If TypeScript shows an error for a specific icon name, open `node_modules/@hugeicons/react/dist/index.d.ts` and search for a similar name. Replace the failing import with a working one.

- [ ] **Step 4: Verify cards animate in staggered, hover inverts colors**

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add Services section with 8 service cards and hover effects"
```

---

## Task 8: Team Section

**Files:**
- Create: `components/Team.tsx`

- [ ] **Step 1: Create Team.tsx**

```tsx
// components/Team.tsx
import AnimatedSection from './AnimatedSection'

const team = [
  {
    name: 'Mathias Bäcker',
    role: 'Geschäftsführer',
    description: 'Gründer und erfahrener Fachmann im Baum- und Forstservice.',
    image: 'https://picsum.photos/400/400?random=31',
  },
  {
    name: 'John Martens',
    role: 'Geschäftsführer',
    description: 'Zertifizierter Forstwirt mit Spezialisierung in der Baumpflege.',
    image: 'https://picsum.photos/400/400?random=32',
  },
  {
    name: 'Denise',
    role: 'Administration',
    description: 'Zuständig für Organisation, Terminplanung und Kundenkommunikation.',
    image: 'https://picsum.photos/400/400?random=33',
  },
  {
    name: 'Lydia',
    role: 'Finanzen',
    description: 'Verantwortlich für Buchhaltung und finanzielle Planung.',
    image: 'https://picsum.photos/400/400?random=34',
  },
]

export default function Team() {
  return (
    <section id="team" className="py-24 px-6 bg-[var(--color-cream)]">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <AnimatedSection className="text-center mb-16">
          <span
            className="text-[var(--color-moss)] text-sm tracking-[0.25em] uppercase font-medium"
            style={{ fontFamily: 'var(--font-author)' }}
          >
            Die Menschen dahinter
          </span>
          <h2
            className="text-4xl md:text-5xl text-[var(--color-forest)] font-bold mt-3"
            style={{ fontFamily: 'var(--font-author)' }}
          >
            Unser Team
          </h2>
        </AnimatedSection>

        {/* Team grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {team.map((member, i) => (
            <AnimatedSection key={member.name} delay={i * 100}>
              <div className="text-center">
                <div className="relative mx-auto w-40 h-40 mb-5">
                  <div
                    className="w-full h-full rounded-full bg-cover bg-center border-4 border-[var(--color-parchment)] shadow-lg"
                    style={{ backgroundImage: `url('${member.image}')` }}
                  />
                  {/* Decorative ring */}
                  <div className="absolute inset-0 rounded-full border-2 border-[var(--color-moss)]/20 scale-110" />
                </div>
                <h3
                  className="text-[var(--color-forest)] font-bold text-xl mb-1"
                  style={{ fontFamily: 'var(--font-author)' }}
                >
                  {member.name}
                </h3>
                <p
                  className="text-[var(--color-moss)] text-sm font-medium mb-3 tracking-wide"
                  style={{ fontFamily: 'var(--font-author)' }}
                >
                  {member.role}
                </p>
                <p
                  className="text-[var(--color-soil)]/70 text-sm leading-relaxed font-light"
                  style={{ fontFamily: 'var(--font-author)' }}
                >
                  {member.description}
                </p>
              </div>
            </AnimatedSection>
          ))}
        </div>

      </div>
    </section>
  )
}
```

- [ ] **Step 2: Add Team to page.tsx**

```tsx
// app/page.tsx
import Nav from '@/components/Nav'
import Hero from '@/components/Hero'
import About from '@/components/About'
import Services from '@/components/Services'
import Team from '@/components/Team'

export default function Home() {
  return (
    <main>
      <Nav />
      <Hero />
      <About />
      <Services />
      <Team />
    </main>
  )
}
```

- [ ] **Step 3: Verify team cards render with circular photos**

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: add Team section with 4 member cards"
```

---

## Task 9: Gallery Section

**Files:**
- Create: `components/Gallery.tsx`

- [ ] **Step 1: Create Gallery.tsx**

```tsx
// components/Gallery.tsx
'use client'

import { useState } from 'react'
import AnimatedSection from './AnimatedSection'
import { ZoomInAreaIcon } from '@hugeicons/react'

const images = [
  { src: 'https://picsum.photos/600/400?random=41', alt: 'Baumpflege Einsatz' },
  { src: 'https://picsum.photos/600/800?random=42', alt: 'Baumfällung' },
  { src: 'https://picsum.photos/600/400?random=43', alt: 'Gartenpflege' },
  { src: 'https://picsum.photos/600/600?random=44', alt: 'Forstarbeiten' },
  { src: 'https://picsum.photos/600/400?random=45', alt: 'Heckenschnitt' },
  { src: 'https://picsum.photos/600/500?random=46', alt: 'Sturmschaden' },
  { src: 'https://picsum.photos/600/400?random=47', alt: 'Grünflächenpflege' },
  { src: 'https://picsum.photos/600/600?random=48', alt: 'Obstbaumschnitt' },
]

export default function Gallery() {
  const [lightbox, setLightbox] = useState<string | null>(null)

  return (
    <section
      id="gallery"
      className="py-24 px-6"
      style={{ backgroundColor: 'var(--color-parchment)' }}
    >
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <AnimatedSection className="text-center mb-16">
          <span
            className="text-[var(--color-moss)] text-sm tracking-[0.25em] uppercase font-medium"
            style={{ fontFamily: 'var(--font-author)' }}
          >
            Unsere Arbeiten
          </span>
          <h2
            className="text-4xl md:text-5xl text-[var(--color-forest)] font-bold mt-3"
            style={{ fontFamily: 'var(--font-author)' }}
          >
            Galerie
          </h2>
        </AnimatedSection>

        {/* Grid */}
        <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
          {images.map((image, i) => (
            <AnimatedSection key={image.src} delay={i * 60} className="break-inside-avoid">
              <button
                className="group relative w-full block overflow-hidden rounded-xl cursor-zoom-in"
                onClick={() => setLightbox(image.src)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image.src}
                  alt={image.alt}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-[var(--color-soil)]/0 group-hover:bg-[var(--color-soil)]/40 transition-colors duration-300 flex items-center justify-center">
                  <ZoomInAreaIcon
                    size={32}
                    className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  />
                </div>
              </button>
            </AnimatedSection>
          ))}
        </div>

      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightbox}
            alt="Galerie Vollansicht"
            className="max-w-full max-h-full object-contain rounded-lg"
          />
          <button
            className="absolute top-6 right-6 text-white text-3xl leading-none hover:text-gray-300 transition-colors"
            onClick={() => setLightbox(null)}
          >
            ×
          </button>
        </div>
      )}
    </section>
  )
}
```

- [ ] **Step 2: Add Gallery to page.tsx**

```tsx
// app/page.tsx
import Nav from '@/components/Nav'
import Hero from '@/components/Hero'
import About from '@/components/About'
import Services from '@/components/Services'
import Team from '@/components/Team'
import Gallery from '@/components/Gallery'

export default function Home() {
  return (
    <main>
      <Nav />
      <Hero />
      <About />
      <Services />
      <Team />
      <Gallery />
    </main>
  )
}
```

- [ ] **Step 3: Verify masonry grid and lightbox open/close**

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: add Gallery section with masonry grid and lightbox"
```

---

## Task 10: Footer / Kontakt

**Files:**
- Create: `components/Footer.tsx`

- [ ] **Step 1: Create Footer.tsx**

```tsx
// components/Footer.tsx
import { Whatsapp01Icon, InstagramIcon } from '@hugeicons/react'

export default function Footer() {
  return (
    <footer id="footer" className="bg-[var(--color-forest)] py-20 px-6">
      <div className="max-w-4xl mx-auto text-center">

        {/* Main CTA */}
        <h2
          className="text-3xl md:text-5xl text-[var(--color-cream)] font-bold mb-4"
          style={{ fontFamily: 'var(--font-author)' }}
        >
          Bereit für Ihr Projekt?
        </h2>
        <p
          className="text-[var(--color-parchment)]/70 text-lg mb-10 font-light"
          style={{ fontFamily: 'var(--font-author)' }}
        >
          Schreiben Sie uns direkt — wir antworten schnell.
        </p>

        {/* WhatsApp Button */}
        <a
          href="https://wa.me/49XXXXXXXXXX"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 bg-[var(--color-moss)] hover:bg-[var(--color-moss)]/80 text-white px-10 py-5 rounded-full text-lg font-medium transition-all duration-300 hover:scale-105 shadow-xl mb-8"
          style={{ fontFamily: 'var(--font-author)' }}
        >
          <Whatsapp01Icon size={24} />
          Auf WhatsApp schreiben
        </a>

        {/* Instagram */}
        <div className="mb-12">
          <a
            href="https://instagram.com/naturwerk.landschaftspflege"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-[var(--color-parchment)]/60 hover:text-[var(--color-parchment)] transition-colors duration-200 text-sm"
            style={{ fontFamily: 'var(--font-author)' }}
          >
            <InstagramIcon size={18} />
            @naturwerk.landschaftspflege
          </a>
        </div>

        {/* Divider */}
        <div className="border-t border-[var(--color-cream)]/10 pt-8">
          <p
            className="text-[var(--color-parchment)]/50 text-sm mb-2"
            style={{ fontFamily: 'var(--font-author)' }}
          >
            Naturwerk Landschaftspflege Bäcker & Martens GbR
          </p>
          <div className="flex items-center justify-center gap-4 text-[var(--color-parchment)]/40 text-xs" style={{ fontFamily: 'var(--font-author)' }}>
            <span>© {new Date().getFullYear()}</span>
            <span>·</span>
            <a
              href="/impressum"
              className="hover:text-[var(--color-parchment)]/70 transition-colors"
            >
              Impressum
            </a>
          </div>
        </div>

      </div>
    </footer>
  )
}
```

- [ ] **Step 2: Assemble final page.tsx**

```tsx
// app/page.tsx
import Nav from '@/components/Nav'
import Hero from '@/components/Hero'
import About from '@/components/About'
import Services from '@/components/Services'
import Team from '@/components/Team'
import Gallery from '@/components/Gallery'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <main>
      <Nav />
      <Hero />
      <About />
      <Services />
      <Team />
      <Gallery />
      <Footer />
    </main>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: add Footer with WhatsApp CTA, Instagram link, Impressum"
```

---

## Task 11: Impressum Placeholder Page

**Files:**
- Create: `app/impressum/page.tsx`

- [ ] **Step 1: Create impressum/page.tsx**

```tsx
// app/impressum/page.tsx
export default function Impressum() {
  return (
    <main className="min-h-screen bg-[var(--color-cream)] py-32 px-6">
      <div className="max-w-2xl mx-auto">
        <h1
          className="text-4xl text-[var(--color-forest)] font-bold mb-8"
          style={{ fontFamily: 'var(--font-author)' }}
        >
          Impressum
        </h1>
        <p
          className="text-[var(--color-soil)]/60 text-base font-light"
          style={{ fontFamily: 'var(--font-author)' }}
        >
          Diese Seite wird noch befüllt.
        </p>
        <a
          href="/"
          className="mt-8 inline-block text-[var(--color-moss)] hover:underline text-sm"
          style={{ fontFamily: 'var(--font-author)' }}
        >
          ← Zurück zur Startseite
        </a>
      </div>
    </main>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add app/impressum/page.tsx
git commit -m "feat: add Impressum placeholder page"
```

---

## Task 12: Production Build & Final Check

- [ ] **Step 1: Run production build**

```bash
npm run build
```

Expected: no errors. Warnings about `<img>` usage are acceptable.

- [ ] **Step 2: Fix any TypeScript or build errors**

Most common issues:
- Missing icon name → replace with `Tree01Icon`
- `'use client'` missing on components that use hooks → add at top of file

- [ ] **Step 3: Run production server**

```bash
npm run start
```

Open `http://localhost:3000`. Walk through the page:
- Nav turns green on scroll ✓
- Hero CTA buttons link correctly ✓
- All 6 sections visible ✓
- Gallery lightbox opens and closes ✓
- Footer WhatsApp button present ✓
- Impressum page reachable at `/impressum` ✓
- No console errors ✓

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "chore: production build verified, mathias demo complete"
```

---

## Quick Reference: What to Replace for Real Client Data

| Location | Placeholder | Replace with |
|----------|------------|--------------|
| `Nav.tsx`, `Hero.tsx`, `Footer.tsx` | `https://wa.me/49XXXXXXXXXX` | Real WhatsApp number |
| `Hero.tsx` hero bg | `picsum.photos/1920/1080?random=10` | `/images/hero-bg.jpg` |
| `About.tsx` image | `picsum.photos/800/600?random=20` | `/images/about.jpg` |
| `Team.tsx` 4× image | `picsum.photos/400/400?random=3X` | `/images/team-mathias.jpg` etc. |
| `Gallery.tsx` 8× images | `picsum.photos/...?random=4X` | `/images/gallery-1.jpg` etc. |
| `About.tsx` | Company description text | Real text from client |
| `Team.tsx` | Member descriptions | Real bios from client |
