# Trebelcafé Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a complete Next.js website for the Trebelcafé Tribsees with a warm "Cozy Editorial" design — cream backgrounds, terracotta accents, Playfair Display headlines, smooth scroll animations, and full German content.

**Architecture:** Greenfield Next.js 14 App Router project with Tailwind CSS for styling and Framer Motion for animations. Static content lives in a single `lib/content.ts` file. Components are split by page section with shared UI primitives in `components/ui/`.

**Tech Stack:** Next.js 14 (App Router), TypeScript, Tailwind CSS, Framer Motion, Google Fonts (Playfair Display, DM Sans, Cormorant Garamond)

**Design Spec:** See `docs/superpowers/specs/2026-04-15-trebelcafe-website-design.md`

---

## File Structure

```
trebelcafe/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout: fonts, Nav, Footer, metadata
│   │   ├── page.tsx                # Homepage assembly
│   │   ├── speisekarte/page.tsx    # Menu page
│   │   ├── ueber-uns/page.tsx      # About page
│   │   ├── galerie/page.tsx        # Gallery page
│   │   ├── reservierung/page.tsx   # Reservation page
│   │   ├── impressum/page.tsx      # Legal
│   │   └── datenschutz/page.tsx    # Privacy
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navigation.tsx      # Sticky nav with scroll transition
│   │   │   └── Footer.tsx          # Hours, contact, legal links
│   │   ├── home/
│   │   │   ├── Hero.tsx            # Full-bleed hero with Ken-Burns
│   │   │   ├── Promise.tsx         # "Unser Versprechen" 3 cards
│   │   │   ├── WeeklyMenu.tsx      # Weekly specials preview
│   │   │   ├── AboutTeaser.tsx     # Split photo + text teaser
│   │   │   ├── BuffetDates.tsx     # Upcoming buffet event cards
│   │   │   └── ContactSection.tsx  # Hours + contact info dark section
│   │   └── ui/
│   │       ├── AnimatedSection.tsx # Scroll fade-in-up wrapper
│   │       ├── Button.tsx          # Terracotta / outline variants
│   │       └── SectionLabel.tsx    # Cormorant Garamond italic labels
│   └── lib/
│       └── content.ts              # All static content (menu, dates, contact)
├── public/
│   └── images/                     # Placeholder images (Unsplash URLs via next/image)
├── tailwind.config.ts
└── next.config.ts
```

---

## Task 1: Project Setup

**Files:**
- Create: `trebelcafe/` (new Next.js project)
- Modify: `tailwind.config.ts`
- Modify: `next.config.ts`

- [ ] **Step 1: Scaffold Next.js project**

```bash
npx create-next-app@latest trebelcafe \
  --typescript \
  --tailwind \
  --app \
  --src-dir \
  --import-alias "@/*" \
  --no-git
cd trebelcafe
```

- [ ] **Step 2: Install dependencies**

```bash
npm install framer-motion
```

- [ ] **Step 3: Configure next.config.ts for remote images**

Replace contents of `next.config.ts`:

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "dastrebelcafetribsees.de",
      },
    ],
  },
};

export default nextConfig;
```

- [ ] **Step 4: Verify dev server starts**

```bash
npm run dev
```

Expected: server running at http://localhost:3000 with default Next.js page.

- [ ] **Step 5: Commit**

```bash
git init
git add .
git commit -m "feat: scaffold Next.js project for Trebelcafé"
```

---

## Task 2: Design System — Tailwind Config & Global Styles

**Files:**
- Modify: `tailwind.config.ts`
- Modify: `src/app/globals.css`

- [ ] **Step 1: Extend Tailwind with brand colors and fonts**

Replace `tailwind.config.ts`:

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: "#FAF6F0",
        espresso: "#2C1810",
        terracotta: "#C4724A",
        sand: "#E8D5C0",
        sage: "#6B7C5E",
      },
      fontFamily: {
        playfair: ["var(--font-playfair)", "Georgia", "serif"],
        dm: ["var(--font-dm-sans)", "system-ui", "sans-serif"],
        cormorant: ["var(--font-cormorant)", "Georgia", "serif"],
      },
      keyframes: {
        kenBurns: {
          "0%": { transform: "scale(1)" },
          "100%": { transform: "scale(1.08)" },
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseRing: {
          "0%": { boxShadow: "0 0 0 0 rgba(196, 114, 74, 0.4)" },
          "70%": { boxShadow: "0 0 0 8px rgba(196, 114, 74, 0)" },
          "100%": { boxShadow: "0 0 0 0 rgba(196, 114, 74, 0)" },
        },
      },
      animation: {
        "ken-burns": "kenBurns 20s ease-in-out infinite alternate",
        "fade-in-up": "fadeInUp 0.6s ease-out forwards",
        "pulse-ring": "pulseRing 2s ease-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
```

- [ ] **Step 2: Set up global CSS with grain overlay and base styles**

Replace `src/app/globals.css`:

```css
@import "tailwindcss";

@layer base {
  body {
    background-color: #FAF6F0;
    color: #2C1810;
  }

  /* Grain texture overlay */
  body::before {
    content: "";
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 9999;
    opacity: 0.025;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
    background-repeat: repeat;
    background-size: 128px 128px;
  }

  h1, h2, h3 {
    font-family: var(--font-playfair), Georgia, serif;
  }
}

@layer utilities {
  .section-divider {
    border-top: 1px solid #C4724A;
    opacity: 0.3;
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add tailwind.config.ts src/app/globals.css
git commit -m "feat: add brand design system — colors, fonts, animations"
```

---

## Task 3: Root Layout with Fonts

**Files:**
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Write root layout with Google Fonts**

Replace `src/app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import { Playfair_Display, DM_Sans, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/layout/Navigation";
import Footer from "@/components/layout/Footer";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Trebelcafé Tribsees — Selbstgebackenes mit Herz",
  description:
    "Familiäres Café in Tribsees mit selbstgebackenem Kuchen, Frühstück und wechselndem Mittagstisch. Geöffnet Do–Mo 9–17 Uhr.",
  openGraph: {
    title: "Trebelcafé Tribsees",
    description: "Selbstgebackenes mit Herz — mitten in Tribsees.",
    locale: "de_DE",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de" className={`${playfair.variable} ${dmSans.variable} ${cormorant.variable}`}>
      <body className="font-dm bg-cream text-espresso antialiased">
        <Navigation />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Create placeholder component files so layout compiles**

Create `src/components/layout/Navigation.tsx`:

```tsx
export default function Navigation() {
  return <nav className="h-16 bg-cream" />;
}
```

Create `src/components/layout/Footer.tsx`:

```tsx
export default function Footer() {
  return <footer className="bg-espresso text-cream p-8" />;
}
```

- [ ] **Step 3: Verify build**

```bash
npm run dev
```

Expected: no TypeScript errors, page loads with cream background.

- [ ] **Step 4: Commit**

```bash
git add src/app/layout.tsx src/components/
git commit -m "feat: root layout with Google Fonts (Playfair, DM Sans, Cormorant)"
```

---

## Task 4: Static Content — lib/content.ts

**Files:**
- Create: `src/lib/content.ts`

- [ ] **Step 1: Write all static content**

Create `src/lib/content.ts`:

```ts
export const contact = {
  phone: "038320 649921",
  email: "trebelcafe@gmx.de",
  address: "Tribsees, Mecklenburg-Vorpommern",
  mapsUrl: "https://maps.google.com/?q=Tribsees,+Mecklenburg-Vorpommern",
};

export const hours = {
  open: "Donnerstag – Montag: 9:00 – 17:00 Uhr",
  closed: "Dienstag & Mittwoch: geschlossen",
};

export const closures2026 = [
  "14. – 23. Juli 2026",
  "13. – 28. Oktober 2026",
  "21. Dezember 2026 – 6. Januar 2027",
];

export const weeklyMenu = [
  {
    name: "Käse-Schinken-Salat",
    description: "Frischer Salat mit würzigem Käse und feinem Schinken",
    price: "9,90 €",
  },
  {
    name: "Ofenkartoffel mit Quark",
    description: "Knusprige Ofenkartoffel mit hausgemachtem Kräuterquark",
    price: "10,50 €",
  },
  {
    name: "Bauerfrühstück",
    description: "Herzhaftes Frühstück mit Ei, Speck und frischem Brot",
    price: "16,50 €",
  },
];

export const fullMenu = {
  wochenkarte: [
    { name: "Käse-Schinken-Salat", price: "9,90 €", description: "Frischer Salat mit würzigem Käse und feinem Schinken" },
    { name: "Ofenkartoffel mit Quark", price: "10,50 €", description: "Knusprige Ofenkartoffel mit hausgemachtem Kräuterquark" },
    { name: "Kartoffelpuffer mit Fisch", price: "13,90 €", description: "Goldbraune Kartoffelpuffer mit Räucherfischfilet" },
    { name: "Ziegenkäse-Salat", price: "12,50 €", description: "Gemischter Salat mit warmem Ziegenkäse und Walnüssen" },
    { name: "Bauerfrühstück", price: "16,50 €", description: "Herzhaftes Frühstück mit Ei, Speck und frischem Brot" },
  ],
  kuchenUndGebaeck: [
    { name: "Hausgemachter Kuchen des Tages", price: "3,50 €", description: "Täglich wechselnd, alles selbst gebacken" },
    { name: "Käsekuchen", price: "3,80 €", description: "Cremig und leicht, nach Familienrezept" },
    { name: "Streuselkuchen", price: "3,50 €", description: "Buttrig-knuspriger Streuselkuchen vom Blech" },
    { name: "Brot & Brötchen", price: "ab 1,20 €", description: "Frisch gebacken, täglich" },
  ],
  getraenke: [
    { name: "Filterkaffee", price: "2,50 €", description: "Frisch gebrüht" },
    { name: "Cappuccino", price: "3,20 €", description: "Mit cremigem Milchschaum" },
    { name: "Latte Macchiato", price: "3,50 €", description: "Groß und samtig" },
    { name: "Tee (Kanne)", price: "3,00 €", description: "Auswahl an Sorten" },
    { name: "Hausgemachte Limonade", price: "3,80 €", description: "Zitrone-Minze oder Holunder" },
    { name: "Kuchen & Kaffee (Set)", price: "6,50 €", description: "Ein Stück Kuchen + Filterkaffee" },
  ],
};

export const buffetDates = [
  {
    date: "April 2026",
    detail: "Datum auf Anfrage",
    note: "Reservierung erforderlich",
  },
  {
    date: "November 2026",
    detail: "Datum auf Anfrage",
    note: "Reservierung erforderlich",
  },
  {
    date: "Dezember 2026",
    detail: "Datum auf Anfrage",
    note: "Reservierung erforderlich",
  },
];

export const promises = [
  {
    icon: "🥐",
    title: "Alles selbst gebacken",
    text: "Jeder Kuchen, jedes Brot und jedes Brötchen entsteht in unserer eigenen Küche — mit Liebe und ohne Kompromisse.",
  },
  {
    icon: "👨‍👩‍👧",
    title: "Familienbetrieb",
    text: "Das Trebelcafé wird von Familie Wendel-Bigalke geführt. Persönlich, herzlich und mit echtem Engagement.",
  },
  {
    icon: "☕",
    title: "Gemütliche Atmosphäre",
    text: "Ein Ort zum Ankommen, Verweilen und Genießen — ob allein, zu zweit oder mit der ganzen Familie.",
  },
];
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/content.ts
git commit -m "feat: add static content (menu, hours, buffet dates, promises)"
```

---

## Task 5: Shared UI Components

**Files:**
- Create: `src/components/ui/AnimatedSection.tsx`
- Create: `src/components/ui/Button.tsx`
- Create: `src/components/ui/SectionLabel.tsx`

- [ ] **Step 1: Create AnimatedSection (scroll fade-in-up wrapper)**

Create `src/components/ui/AnimatedSection.tsx`:

```tsx
"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface AnimatedSectionProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export default function AnimatedSection({
  children,
  className = "",
  delay = 0,
}: AnimatedSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
```

- [ ] **Step 2: Create Button component**

Create `src/components/ui/Button.tsx`:

```tsx
import Link from "next/link";
import { ReactNode } from "react";

interface ButtonProps {
  href: string;
  variant?: "filled" | "outline" | "outline-light";
  children: ReactNode;
  className?: string;
}

export default function Button({
  href,
  variant = "filled",
  children,
  className = "",
}: ButtonProps) {
  const base =
    "inline-block px-6 py-3 rounded-full text-sm font-dm font-medium tracking-wide transition-all duration-300";

  const variants = {
    filled:
      "bg-terracotta text-white hover:bg-[#b3623c] hover:shadow-lg hover:-translate-y-0.5",
    outline:
      "border-2 border-terracotta text-terracotta hover:bg-terracotta hover:text-white",
    "outline-light":
      "border-2 border-white text-white hover:bg-white hover:text-espresso",
  };

  return (
    <Link href={href} className={`${base} ${variants[variant]} ${className}`}>
      {children}
    </Link>
  );
}
```

- [ ] **Step 3: Create SectionLabel component**

Create `src/components/ui/SectionLabel.tsx`:

```tsx
interface SectionLabelProps {
  children: string;
  light?: boolean;
}

export default function SectionLabel({ children, light = false }: SectionLabelProps) {
  return (
    <p
      className={`font-cormorant italic text-lg tracking-widest mb-3 ${
        light ? "text-sand" : "text-terracotta"
      }`}
    >
      {children}
    </p>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/
git commit -m "feat: add shared UI components (AnimatedSection, Button, SectionLabel)"
```

---

## Task 6: Navigation Component

**Files:**
- Modify: `src/components/layout/Navigation.tsx`

- [ ] **Step 1: Build the full sticky Navigation**

Replace `src/components/layout/Navigation.tsx`:

```tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { href: "/speisekarte", label: "Speisekarte" },
  { href: "/ueber-uns", label: "Über uns" },
  { href: "/galerie", label: "Galerie" },
  { href: "/reservierung", label: "Reservierung" },
];

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const navBg =
    isHome && !scrolled
      ? "bg-transparent"
      : "bg-cream/95 backdrop-blur-sm shadow-sm";

  const linkColor =
    isHome && !scrolled ? "text-white" : "text-espresso";

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${navBg}`}
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className={`font-playfair text-xl font-semibold ${linkColor} transition-colors duration-300`}
          >
            Trebelcafé
          </Link>

          {/* Desktop links */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`relative text-sm tracking-wide ${linkColor} transition-colors duration-300 group`}
              >
                {link.label}
                <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-terracotta transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
            <Link
              href="/reservierung"
              className="ml-2 px-5 py-2 rounded-full bg-terracotta text-white text-sm font-medium hover:bg-[#b3623c] transition-all duration-300 animate-pulse-ring"
            >
              Tisch reservieren
            </Link>
          </nav>

          {/* Mobile hamburger */}
          <button
            className={`md:hidden flex flex-col gap-1.5 ${linkColor}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menü öffnen"
          >
            <span className={`block w-6 h-px bg-current transition-all duration-300 ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
            <span className={`block w-6 h-px bg-current transition-all duration-300 ${menuOpen ? "opacity-0" : ""}`} />
            <span className={`block w-6 h-px bg-current transition-all duration-300 ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
          </button>
        </div>
      </header>

      {/* Mobile fullscreen overlay */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-cream flex flex-col items-center justify-center gap-8"
          >
            {navLinks.map((link, i) => (
              <motion.div
                key={link.href}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Link
                  href={link.href}
                  className="font-playfair text-3xl text-espresso"
                >
                  {link.label}
                </Link>
              </motion.div>
            ))}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: navLinks.length * 0.1 }}
            >
              <Link
                href="/reservierung"
                className="mt-4 px-8 py-3 rounded-full bg-terracotta text-white font-medium text-lg"
              >
                Tisch reservieren
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
```

- [ ] **Step 2: Verify nav renders without errors**

```bash
npm run dev
```

Expected: sticky nav visible, transparent on home hero, solid cream on scroll.

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/Navigation.tsx
git commit -m "feat: sticky navigation with scroll transition and mobile overlay"
```

---

## Task 7: Footer Component

**Files:**
- Modify: `src/components/layout/Footer.tsx`

- [ ] **Step 1: Build full Footer**

Replace `src/components/layout/Footer.tsx`:

```tsx
import Link from "next/link";
import { contact, hours, closures2026 } from "@/lib/content";

export default function Footer() {
  return (
    <footer className="bg-espresso text-cream/80 font-dm">
      <div className="max-w-6xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-3 gap-12">
        {/* Brand */}
        <div>
          <h3 className="font-playfair text-cream text-2xl mb-3">Trebelcafé</h3>
          <p className="text-sm leading-relaxed italic font-cormorant text-sand text-lg">
            Selbstgebackenes mit Herz — mitten in Tribsees.
          </p>
        </div>

        {/* Hours */}
        <div>
          <h4 className="font-playfair text-cream text-lg mb-4">Öffnungszeiten</h4>
          <p className="text-sm mb-1">{hours.open}</p>
          <p className="text-sm mb-4">{hours.closed}</p>
          <p className="text-xs text-cream/50 font-medium uppercase tracking-wider mb-2">Schließzeiten 2026</p>
          {closures2026.map((c) => (
            <p key={c} className="text-xs text-cream/60">{c}</p>
          ))}
        </div>

        {/* Contact */}
        <div>
          <h4 className="font-playfair text-cream text-lg mb-4">Kontakt</h4>
          <p className="text-sm mb-1">{contact.address}</p>
          <a href={`tel:${contact.phone}`} className="block text-sm hover:text-cream transition-colors mb-1">
            {contact.phone}
          </a>
          <a href={`mailto:${contact.email}`} className="block text-sm hover:text-cream transition-colors mb-4">
            {contact.email}
          </a>
          <a
            href={contact.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-terracotta hover:text-[#d4845c] transition-colors"
          >
            Auf Google Maps öffnen →
          </a>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-cream/10 py-6 px-6 max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-cream/40">
        <p>© {new Date().getFullYear()} Trebelcafé Tribsees — Familie Wendel-Bigalke</p>
        <div className="flex gap-6">
          <Link href="/impressum" className="hover:text-cream transition-colors">Impressum</Link>
          <Link href="/datenschutz" className="hover:text-cream transition-colors">Datenschutz</Link>
        </div>
      </div>
    </footer>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/layout/Footer.tsx
git commit -m "feat: footer with hours, contact, closures, and legal links"
```

---

## Task 8: Hero Component

**Files:**
- Create: `src/components/home/Hero.tsx`

- [ ] **Step 1: Build the full-bleed Hero with Ken-Burns effect**

Create `src/components/home/Hero.tsx`:

```tsx
import Image from "next/image";
import Button from "@/components/ui/Button";

export default function Hero() {
  return (
    <section className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden">
      {/* Background image with Ken-Burns */}
      <div className="absolute inset-0 overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=1600&q=80"
          alt="Gemütliches Café-Interieur mit warmem Licht"
          fill
          priority
          className="object-cover animate-ken-burns"
          sizes="100vw"
        />
      </div>

      {/* Warm overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-espresso/50 via-espresso/40 to-espresso/60" />

      {/* Grain overlay */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundSize: "128px 128px",
        }}
      />

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        <p className="font-cormorant italic text-sand text-xl tracking-[0.2em] mb-4 opacity-90">
          Herzlich willkommen
        </p>
        <h1 className="font-playfair text-white text-4xl md:text-6xl lg:text-7xl font-semibold leading-tight mb-6">
          Selbstgebackenes mit Herz —<br />
          <span className="text-sand">mitten in Tribsees.</span>
        </h1>
        <p className="font-dm text-cream/80 text-lg md:text-xl mb-10 max-w-xl mx-auto leading-relaxed">
          Familie Wendel-Bigalke begrüßt euch{" "}
          <span className="text-sand font-medium">Do – Mo von 9 bis 17 Uhr</span>.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button href="/speisekarte" variant="filled">
            Speisekarte entdecken
          </Button>
          <Button href="/reservierung" variant="outline-light">
            Tisch reservieren
          </Button>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-cream/50">
        <p className="text-xs tracking-widest uppercase font-dm">Scroll</p>
        <div className="w-px h-8 bg-cream/30 animate-pulse" />
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/home/Hero.tsx
git commit -m "feat: hero section with Ken-Burns background and dual CTA"
```

---

## Task 9: Homepage Sections

**Files:**
- Create: `src/components/home/Promise.tsx`
- Create: `src/components/home/WeeklyMenu.tsx`
- Create: `src/components/home/AboutTeaser.tsx`
- Create: `src/components/home/BuffetDates.tsx`
- Create: `src/components/home/ContactSection.tsx`

- [ ] **Step 1: Create Promise section ("Unser Versprechen")**

Create `src/components/home/Promise.tsx`:

```tsx
import AnimatedSection from "@/components/ui/AnimatedSection";
import SectionLabel from "@/components/ui/SectionLabel";
import { promises } from "@/lib/content";

export default function Promise() {
  return (
    <section className="bg-sand/40 py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <AnimatedSection className="text-center mb-12">
          <SectionLabel>Was uns ausmacht</SectionLabel>
          <h2 className="font-playfair text-3xl md:text-4xl text-espresso">
            Unser Versprechen
          </h2>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {promises.map((p, i) => (
            <AnimatedSection key={p.title} delay={i * 0.15}>
              <div className="bg-cream rounded-2xl p-8 shadow-sm hover:-translate-y-1 hover:shadow-md transition-all duration-300 text-center">
                <div className="text-4xl mb-4">{p.icon}</div>
                <h3 className="font-playfair text-xl text-espresso mb-3">{p.title}</h3>
                <p className="font-dm text-sm text-espresso/70 leading-relaxed">{p.text}</p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Create WeeklyMenu section**

Create `src/components/home/WeeklyMenu.tsx`:

```tsx
import AnimatedSection from "@/components/ui/AnimatedSection";
import SectionLabel from "@/components/ui/SectionLabel";
import Button from "@/components/ui/Button";
import { weeklyMenu } from "@/lib/content";

export default function WeeklyMenu() {
  return (
    <section className="py-20 px-6 bg-cream">
      <div className="max-w-6xl mx-auto">
        <AnimatedSection className="text-center mb-12">
          <SectionLabel>Frisch & wechselnd</SectionLabel>
          <h2 className="font-playfair text-3xl md:text-4xl text-espresso">
            Was kocht diese Woche?
          </h2>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {weeklyMenu.map((dish, i) => (
            <AnimatedSection key={dish.name} delay={i * 0.12}>
              <div className="border border-sand rounded-2xl p-6 hover:-translate-y-1 hover:shadow-md transition-all duration-300 bg-cream group">
                <div className="w-8 h-px bg-terracotta mb-4 group-hover:w-16 transition-all duration-300" />
                <h3 className="font-playfair text-xl text-espresso mb-2">{dish.name}</h3>
                <p className="font-dm text-sm text-espresso/60 mb-4 leading-relaxed">{dish.description}</p>
                <p className="font-playfair text-terracotta text-lg font-semibold">{dish.price}</p>
              </div>
            </AnimatedSection>
          ))}
        </div>

        <AnimatedSection className="text-center">
          <Button href="/speisekarte" variant="outline">
            Zur vollen Speisekarte →
          </Button>
        </AnimatedSection>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Create AboutTeaser section**

Create `src/components/home/AboutTeaser.tsx`:

```tsx
import Image from "next/image";
import AnimatedSection from "@/components/ui/AnimatedSection";
import SectionLabel from "@/components/ui/SectionLabel";
import Button from "@/components/ui/Button";

export default function AboutTeaser() {
  return (
    <section className="py-20 px-6 bg-sand/20">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        {/* Photo */}
        <AnimatedSection>
          <div className="relative h-80 md:h-[460px] rounded-2xl overflow-hidden shadow-lg">
            <Image
              src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&q=80"
              alt="Gemütliches Café-Ambiente im Trebelcafé"
              fill
              className="object-cover hover:scale-105 transition-transform duration-700"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        </AnimatedSection>

        {/* Text */}
        <AnimatedSection delay={0.2} className="flex flex-col justify-center">
          <SectionLabel>Unsere Geschichte</SectionLabel>
          <h2 className="font-playfair text-3xl md:text-4xl text-espresso mb-6 leading-snug">
            Ein Café mit Seele — geführt von Familie Wendel-Bigalke.
          </h2>
          <p className="font-dm text-espresso/70 leading-relaxed mb-4">
            Im Herzen von Tribsees liegt unser kleines, gemütliches Café. Wir empfangen euch
            mit frisch gebackenem Kuchen, hausgemachten Gerichten und der Wärme, die man nur
            in einem echten Familienbetrieb findet.
          </p>
          <blockquote className="border-l-2 border-terracotta pl-4 mb-6">
            <p className="font-cormorant italic text-xl text-espresso/80">
              "Wir backen alles selbst — das ist kein Versprechen, das ist unser Alltag."
            </p>
          </blockquote>
          <Button href="/ueber-uns" variant="filled">
            Mehr über uns →
          </Button>
        </AnimatedSection>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Create BuffetDates section**

Create `src/components/home/BuffetDates.tsx`:

```tsx
import AnimatedSection from "@/components/ui/AnimatedSection";
import SectionLabel from "@/components/ui/SectionLabel";
import Button from "@/components/ui/Button";
import { buffetDates } from "@/lib/content";

export default function BuffetDates() {
  return (
    <section className="py-20 px-6 bg-cream">
      <div className="max-w-6xl mx-auto">
        <AnimatedSection className="text-center mb-12">
          <SectionLabel>Besondere Momente</SectionLabel>
          <h2 className="font-playfair text-3xl md:text-4xl text-espresso mb-4">
            Nächste Frühstücksbuffets
          </h2>
          <p className="font-dm text-espresso/60 max-w-md mx-auto">
            Unser Frühstücksbuffet ist ein besonderes Erlebnis — und Plätze sind begrenzt.
          </p>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {buffetDates.map((event, i) => (
            <AnimatedSection key={event.date} delay={i * 0.15}>
              <div className="relative bg-sand/40 rounded-2xl p-8 border border-sand text-center hover:-translate-y-1 hover:shadow-md transition-all duration-300">
                <div className="w-12 h-12 rounded-full bg-terracotta/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🍳</span>
                </div>
                <h3 className="font-playfair text-2xl text-espresso mb-1">{event.date}</h3>
                <p className="font-cormorant italic text-terracotta mb-3">{event.detail}</p>
                <p className="font-dm text-xs text-espresso/50 uppercase tracking-wider">{event.note}</p>
              </div>
            </AnimatedSection>
          ))}
        </div>

        <AnimatedSection className="text-center">
          <Button href="/reservierung" variant="filled">
            Jetzt reservieren →
          </Button>
        </AnimatedSection>
      </div>
    </section>
  );
}
```

- [ ] **Step 5: Create ContactSection**

Create `src/components/home/ContactSection.tsx`:

```tsx
import AnimatedSection from "@/components/ui/AnimatedSection";
import { contact, hours, closures2026 } from "@/lib/content";

export default function ContactSection() {
  return (
    <section className="bg-espresso text-cream py-20 px-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Hours */}
        <AnimatedSection>
          <p className="font-cormorant italic text-sand text-lg tracking-widest mb-4">
            Wann ihr uns findet
          </p>
          <h2 className="font-playfair text-3xl text-cream mb-6">Öffnungszeiten</h2>
          <p className="font-dm text-cream/80 mb-2">{hours.open}</p>
          <p className="font-dm text-cream/60 mb-8">{hours.closed}</p>
          <p className="text-xs text-cream/40 uppercase tracking-widest mb-3">Schließzeiten 2026</p>
          {closures2026.map((c) => (
            <p key={c} className="font-dm text-sm text-cream/50 mb-1">{c}</p>
          ))}
        </AnimatedSection>

        {/* Contact */}
        <AnimatedSection delay={0.2}>
          <p className="font-cormorant italic text-sand text-lg tracking-widest mb-4">
            So erreicht ihr uns
          </p>
          <h2 className="font-playfair text-3xl text-cream mb-6">Kontakt & Anfahrt</h2>
          <p className="font-dm text-cream/70 mb-4">{contact.address}</p>
          <a
            href={`tel:${contact.phone}`}
            className="block font-dm text-lg text-cream hover:text-sand transition-colors mb-2"
          >
            📞 {contact.phone}
          </a>
          <a
            href={`mailto:${contact.email}`}
            className="block font-dm text-cream/70 hover:text-cream transition-colors mb-8"
          >
            ✉️ {contact.email}
          </a>
          <a
            href={contact.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block border border-terracotta text-terracotta px-6 py-3 rounded-full text-sm hover:bg-terracotta hover:text-white transition-all duration-300"
          >
            Auf Google Maps öffnen →
          </a>
        </AnimatedSection>
      </div>
    </section>
  );
}
```

- [ ] **Step 6: Commit**

```bash
git add src/components/home/
git commit -m "feat: all homepage section components (Promise, WeeklyMenu, AboutTeaser, BuffetDates, ContactSection)"
```

---

## Task 10: Assemble Homepage

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Assemble all sections into the homepage**

Replace `src/app/page.tsx`:

```tsx
import Hero from "@/components/home/Hero";
import Promise from "@/components/home/Promise";
import WeeklyMenu from "@/components/home/WeeklyMenu";
import AboutTeaser from "@/components/home/AboutTeaser";
import BuffetDates from "@/components/home/BuffetDates";
import ContactSection from "@/components/home/ContactSection";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Promise />
      <WeeklyMenu />
      <AboutTeaser />
      <BuffetDates />
      <ContactSection />
    </>
  );
}
```

- [ ] **Step 2: Verify full homepage in browser**

```bash
npm run dev
```

Open http://localhost:3000 and check:
- Hero with Ken-Burns animation visible
- Nav transparent → solid on scroll
- All sections render with correct colors and fonts
- Animations trigger on scroll
- Mobile layout looks good (test at 375px width)

- [ ] **Step 3: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: assemble homepage from all section components"
```

---

## Task 11: Speisekarte Page

**Files:**
- Modify: `src/app/speisekarte/page.tsx`

- [ ] **Step 1: Build the menu page with tabs**

Replace `src/app/speisekarte/page.tsx`:

```tsx
import type { Metadata } from "next";
import AnimatedSection from "@/components/ui/AnimatedSection";
import SectionLabel from "@/components/ui/SectionLabel";
import { fullMenu } from "@/lib/content";

export const metadata: Metadata = {
  title: "Speisekarte — Trebelcafé Tribsees",
  description: "Unsere Wochenkarte, selbstgebackener Kuchen, Getränke und Frühstück. Alles frisch und hausgemacht.",
};

function MenuCard({ name, description, price }: { name: string; description: string; price: string }) {
  return (
    <div className="border border-sand rounded-2xl p-6 bg-cream hover:-translate-y-1 hover:shadow-md transition-all duration-300 group">
      <div className="w-6 h-px bg-terracotta mb-4 group-hover:w-12 transition-all duration-300" />
      <h3 className="font-playfair text-lg text-espresso mb-2">{name}</h3>
      <p className="font-dm text-sm text-espresso/60 mb-4 leading-relaxed">{description}</p>
      <p className="font-playfair text-terracotta font-semibold">{price}</p>
    </div>
  );
}

function MenuSection({ title, label, items }: { title: string; label: string; items: { name: string; description: string; price: string }[] }) {
  return (
    <section className="py-16">
      <AnimatedSection className="mb-10">
        <SectionLabel>{label}</SectionLabel>
        <h2 className="font-playfair text-3xl text-espresso">{title}</h2>
        <div className="w-16 h-px bg-terracotta mt-4" />
      </AnimatedSection>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item, i) => (
          <AnimatedSection key={item.name} delay={i * 0.08}>
            <MenuCard {...item} />
          </AnimatedSection>
        ))}
      </div>
    </section>
  );
}

export default function SpeisekartePage() {
  return (
    <div className="pt-24 px-6 bg-cream min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Page header */}
        <AnimatedSection className="text-center py-16">
          <SectionLabel>Alles selbst gemacht</SectionLabel>
          <h1 className="font-playfair text-5xl md:text-6xl text-espresso mb-4">Speisekarte</h1>
          <p className="font-dm text-espresso/60 max-w-md mx-auto">
            Unsere Wochenkarte wechselt regelmäßig. Alle Gerichte werden frisch zubereitet.
          </p>
        </AnimatedSection>

        <div className="section-divider" />

        <MenuSection
          label="Frisch & wechselnd"
          title="Wochenkarte"
          items={fullMenu.wochenkarte}
        />

        <div className="section-divider" />

        <MenuSection
          label="Aus unserer Backstube"
          title="Kuchen & Gebäck"
          items={fullMenu.kuchenUndGebaeck}
        />

        <div className="section-divider" />

        <MenuSection
          label="Heiß & kalt"
          title="Getränke"
          items={fullMenu.getraenke}
        />

        {/* Note */}
        <AnimatedSection className="py-12 text-center">
          <p className="font-cormorant italic text-xl text-espresso/60">
            Alle Preise inkl. MwSt. — Saisonale Änderungen vorbehalten.
          </p>
        </AnimatedSection>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify page at http://localhost:3000/speisekarte**

Expected: all menu sections render with correct grouping and styling.

- [ ] **Step 3: Commit**

```bash
git add src/app/speisekarte/
git commit -m "feat: Speisekarte page with menu sections"
```

---

## Task 12: Über uns Page

**Files:**
- Modify: `src/app/ueber-uns/page.tsx`

- [ ] **Step 1: Build the About page**

Replace `src/app/ueber-uns/page.tsx`:

```tsx
import type { Metadata } from "next";
import Image from "next/image";
import AnimatedSection from "@/components/ui/AnimatedSection";
import SectionLabel from "@/components/ui/SectionLabel";
import { promises } from "@/lib/content";

export const metadata: Metadata = {
  title: "Über uns — Trebelcafé Tribsees",
  description: "Familie Wendel-Bigalke und die Geschichte des Trebelcafés. Wir backen alles selbst — seit dem ersten Tag.",
};

export default function UeberUnsPage() {
  return (
    <div className="pt-16 bg-cream min-h-screen">
      {/* Hero image */}
      <div className="relative h-64 md:h-96 overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1442975631134-d6106c90a05e?w=1400&q=80"
          alt="Gemütliche Café-Atmosphäre"
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-espresso/50 flex items-end pb-12 px-6">
          <div className="max-w-6xl mx-auto w-full">
            <SectionLabel light>Wer wir sind</SectionLabel>
            <h1 className="font-playfair text-4xl md:text-5xl text-white">Über uns</h1>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-20">
        {/* Story */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center mb-20">
          <AnimatedSection>
            <SectionLabel>Unsere Geschichte</SectionLabel>
            <h2 className="font-playfair text-3xl text-espresso mb-6">Familie Wendel-Bigalke</h2>
            <p className="font-dm text-espresso/70 leading-relaxed mb-4">
              Im Herzen von Tribsees, unweit der ruhigen Trebel, öffneten wir einst die Türen
              unseres kleinen Cafés. Was als Herzensprojekt begann, ist heute ein Ort, an dem
              Menschen zusammenkommen, verweilen und Gutes genießen.
            </p>
            <p className="font-dm text-espresso/70 leading-relaxed mb-6">
              Unser Grundsatz war von Anfang an simpel: Wir backen alles selbst. Kein Tiefkühlkuchen,
              keine Fertigmischungen — nur ehrliche Zutaten, Erfahrung und Liebe zum Handwerk.
            </p>
            <blockquote className="border-l-2 border-terracotta pl-6 py-2">
              <p className="font-cormorant italic text-2xl text-espresso leading-relaxed">
                "Ein Café ist für uns kein Geschäft — es ist eine Einladung."
              </p>
              <footer className="font-dm text-sm text-espresso/50 mt-2">
                — Familie Wendel-Bigalke
              </footer>
            </blockquote>
          </AnimatedSection>

          <AnimatedSection delay={0.2}>
            <div className="relative h-96 rounded-2xl overflow-hidden shadow-xl">
              <Image
                src="https://images.unsplash.com/photo-1600093463592-8e36ae95ef56?w=800&q=80"
                alt="Frisch gebackener Kuchen aus unserer Backstube"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </AnimatedSection>
        </div>

        {/* Promises */}
        <AnimatedSection className="text-center mb-12">
          <div className="w-16 h-px bg-terracotta mx-auto mb-8" />
          <h2 className="font-playfair text-3xl text-espresso">Warum das Trebelcafé?</h2>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {promises.map((p, i) => (
            <AnimatedSection key={p.title} delay={i * 0.15}>
              <div className="text-center p-8 bg-sand/30 rounded-2xl hover:-translate-y-1 hover:shadow-md transition-all duration-300">
                <div className="text-4xl mb-4">{p.icon}</div>
                <h3 className="font-playfair text-xl text-espresso mb-3">{p.title}</h3>
                <p className="font-dm text-sm text-espresso/60 leading-relaxed">{p.text}</p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/ueber-uns/
git commit -m "feat: Über uns page with family story and values"
```

---

## Task 13: Galerie Page

**Files:**
- Modify: `src/app/galerie/page.tsx`

- [ ] **Step 1: Build the photo gallery with masonry-style grid**

Replace `src/app/galerie/page.tsx`:

```tsx
import type { Metadata } from "next";
import Image from "next/image";
import AnimatedSection from "@/components/ui/AnimatedSection";
import SectionLabel from "@/components/ui/SectionLabel";

export const metadata: Metadata = {
  title: "Galerie — Trebelcafé Tribsees",
  description: "Bilder aus dem Trebelcafé — Atmosphäre, Kuchen und gemütliche Momente.",
};

const galleryImages = [
  { src: "https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=800&q=80", alt: "Gemütliche Café-Atmosphäre", tall: true },
  { src: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80", alt: "Frisch gebackener Kuchen", tall: false },
  { src: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=800&q=80", alt: "Cappuccino mit Herz", tall: false },
  { src: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&q=80", alt: "Café-Innenraum mit warmem Licht", tall: true },
  { src: "https://images.unsplash.com/photo-1612544448445-b8232cff3b6c?w=800&q=80", alt: "Selbstgebackene Brötchen", tall: false },
  { src: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80", alt: "Kaffeespezialitäten", tall: false },
  { src: "https://images.unsplash.com/photo-1600093463592-8e36ae95ef56?w=800&q=80", alt: "Kuchenvitrine", tall: true },
  { src: "https://images.unsplash.com/photo-1442975631134-d6106c90a05e?w=800&q=80", alt: "Tischgedeck im Café", tall: false },
  { src: "https://images.unsplash.com/photo-1507133750040-4a8f57021571?w=800&q=80", alt: "Frühstücksset", tall: false },
];

export default function GaleriePage() {
  return (
    <div className="pt-24 px-6 bg-cream min-h-screen">
      <div className="max-w-6xl mx-auto">
        <AnimatedSection className="text-center py-12">
          <SectionLabel>Einblicke</SectionLabel>
          <h1 className="font-playfair text-5xl text-espresso mb-4">Galerie</h1>
          <p className="font-dm text-espresso/60 max-w-sm mx-auto">
            Atmosphäre, Kuchen und gemütliche Momente aus dem Trebelcafé.
          </p>
        </AnimatedSection>

        {/* Masonry-style grid using CSS columns */}
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 py-8">
          {galleryImages.map((img, i) => (
            <AnimatedSection key={img.src} delay={i * 0.06} className="break-inside-avoid mb-4">
              <div
                className={`relative overflow-hidden rounded-2xl group cursor-pointer ${
                  img.tall ? "h-80" : "h-56"
                }`}
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-espresso/0 group-hover:bg-espresso/30 transition-colors duration-300 flex items-end p-4">
                  <p className="font-cormorant italic text-white text-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-2 group-hover:translate-y-0 transition-transform">
                    {img.alt}
                  </p>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/galerie/
git commit -m "feat: Galerie page with masonry grid and hover effects"
```

---

## Task 14: Reservierung Page

**Files:**
- Modify: `src/app/reservierung/page.tsx`

- [ ] **Step 1: Build reservation page with form**

Replace `src/app/reservierung/page.tsx`:

```tsx
import type { Metadata } from "next";
import AnimatedSection from "@/components/ui/AnimatedSection";
import SectionLabel from "@/components/ui/SectionLabel";
import { contact, buffetDates } from "@/lib/content";

export const metadata: Metadata = {
  title: "Reservierung — Trebelcafé Tribsees",
  description: "Tisch reservieren im Trebelcafé Tribsees. Auch für unsere Frühstücksbuffets.",
};

export default function ReservierungPage() {
  return (
    <div className="pt-24 px-6 bg-cream min-h-screen">
      <div className="max-w-4xl mx-auto py-16">
        <AnimatedSection className="text-center mb-16">
          <SectionLabel>Wir freuen uns auf euch</SectionLabel>
          <h1 className="font-playfair text-5xl text-espresso mb-4">Reservierung</h1>
          <p className="font-dm text-espresso/60 max-w-md mx-auto">
            Reserviert euren Tisch bequem per Telefon, E-Mail — oder über das Formular.
          </p>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Form */}
          <AnimatedSection>
            <form className="space-y-5">
              <div>
                <label className="block font-dm text-sm text-espresso/70 mb-2">Euer Name *</label>
                <input
                  type="text"
                  required
                  className="w-full border border-sand rounded-xl px-4 py-3 font-dm text-sm bg-cream focus:outline-none focus:border-terracotta transition-colors"
                  placeholder="Vorname Nachname"
                />
              </div>
              <div>
                <label className="block font-dm text-sm text-espresso/70 mb-2">Telefon oder E-Mail *</label>
                <input
                  type="text"
                  required
                  className="w-full border border-sand rounded-xl px-4 py-3 font-dm text-sm bg-cream focus:outline-none focus:border-terracotta transition-colors"
                  placeholder="Wie können wir euch erreichen?"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-dm text-sm text-espresso/70 mb-2">Datum *</label>
                  <input
                    type="date"
                    required
                    className="w-full border border-sand rounded-xl px-4 py-3 font-dm text-sm bg-cream focus:outline-none focus:border-terracotta transition-colors"
                  />
                </div>
                <div>
                  <label className="block font-dm text-sm text-espresso/70 mb-2">Uhrzeit *</label>
                  <select className="w-full border border-sand rounded-xl px-4 py-3 font-dm text-sm bg-cream focus:outline-none focus:border-terracotta transition-colors">
                    {["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00"].map((t) => (
                      <option key={t}>{t} Uhr</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block font-dm text-sm text-espresso/70 mb-2">Personenzahl *</label>
                <select className="w-full border border-sand rounded-xl px-4 py-3 font-dm text-sm bg-cream focus:outline-none focus:border-terracotta transition-colors">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                    <option key={n}>{n} {n === 1 ? "Person" : "Personen"}</option>
                  ))}
                  <option>Mehr als 8 (bitte Nachricht hinterlassen)</option>
                </select>
              </div>
              <div>
                <label className="block font-dm text-sm text-espresso/70 mb-2">Nachricht (optional)</label>
                <textarea
                  rows={4}
                  className="w-full border border-sand rounded-xl px-4 py-3 font-dm text-sm bg-cream focus:outline-none focus:border-terracotta transition-colors resize-none"
                  placeholder="Besondere Anlässe, Allergien, Wünsche..."
                />
              </div>
              <button
                type="submit"
                className="w-full bg-terracotta text-white py-4 rounded-xl font-dm font-medium hover:bg-[#b3623c] transition-colors duration-300"
              >
                Reservierungsanfrage senden
              </button>
              <p className="text-xs text-espresso/40 text-center font-dm">
                Wir melden uns schnellstmöglich zur Bestätigung.
              </p>
            </form>
          </AnimatedSection>

          {/* Direct contact + buffet dates */}
          <AnimatedSection delay={0.2} className="space-y-10">
            {/* Direct */}
            <div className="bg-sand/30 rounded-2xl p-8">
              <h3 className="font-playfair text-xl text-espresso mb-4">Direkt erreichen</h3>
              <a href={`tel:${contact.phone}`} className="block font-dm text-espresso hover:text-terracotta transition-colors mb-2">
                📞 {contact.phone}
              </a>
              <a href={`mailto:${contact.email}`} className="block font-dm text-espresso/70 hover:text-terracotta transition-colors">
                ✉️ {contact.email}
              </a>
            </div>

            {/* Buffet dates */}
            <div>
              <h3 className="font-playfair text-xl text-espresso mb-6">Nächste Frühstücksbuffets</h3>
              <div className="space-y-4">
                {buffetDates.map((event) => (
                  <div key={event.date} className="border-l-2 border-terracotta pl-4">
                    <p className="font-playfair text-lg text-espresso">{event.date}</p>
                    <p className="font-cormorant italic text-terracotta">{event.detail}</p>
                    <p className="font-dm text-xs text-espresso/50">{event.note}</p>
                  </div>
                ))}
              </div>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/reservierung/
git commit -m "feat: Reservierung page with form and direct contact info"
```

---

## Task 15: Legal Pages (Impressum & Datenschutz)

**Files:**
- Modify: `src/app/impressum/page.tsx`
- Modify: `src/app/datenschutz/page.tsx`

- [ ] **Step 1: Create Impressum page**

Replace `src/app/impressum/page.tsx`:

```tsx
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Impressum — Trebelcafé Tribsees" };

export default function ImpressumPage() {
  return (
    <div className="pt-24 px-6 bg-cream min-h-screen">
      <div className="max-w-2xl mx-auto py-16">
        <h1 className="font-playfair text-4xl text-espresso mb-8">Impressum</h1>
        <div className="font-dm text-espresso/70 space-y-4 text-sm leading-relaxed">
          <p><strong className="text-espresso">Angaben gemäß § 5 TMG</strong></p>
          <p>Familie Wendel-Bigalke<br />Trebelcafé Tribsees<br />Tribsees, Mecklenburg-Vorpommern</p>
          <p><strong className="text-espresso">Kontakt</strong><br />
            Telefon: 038320 649921<br />
            E-Mail: trebelcafe@gmx.de
          </p>
          <p className="text-espresso/50 text-xs pt-4">
            Haftungshinweis: Trotz sorgfältiger inhaltlicher Kontrolle übernehmen wir keine Haftung für die Inhalte externer Links.
          </p>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create Datenschutz page**

Replace `src/app/datenschutz/page.tsx`:

```tsx
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Datenschutz — Trebelcafé Tribsees" };

export default function DatenschutzPage() {
  return (
    <div className="pt-24 px-6 bg-cream min-h-screen">
      <div className="max-w-2xl mx-auto py-16">
        <h1 className="font-playfair text-4xl text-espresso mb-8">Datenschutzerklärung</h1>
        <div className="font-dm text-espresso/70 space-y-6 text-sm leading-relaxed">
          <section>
            <h2 className="font-playfair text-xl text-espresso mb-3">1. Datenschutz auf einen Blick</h2>
            <p>Diese Website erhebt keine personenbezogenen Daten ohne Ihre Einwilligung. Es werden keine Tracking-Tools, Cookies oder externe Analysedienste eingesetzt.</p>
          </section>
          <section>
            <h2 className="font-playfair text-xl text-espresso mb-3">2. Kontaktformular</h2>
            <p>Wenn Sie das Reservierungsformular nutzen, werden Ihre Angaben zur Bearbeitung der Anfrage verwendet und nicht an Dritte weitergegeben.</p>
          </section>
          <section>
            <h2 className="font-playfair text-xl text-espresso mb-3">3. Google Maps</h2>
            <p>Diese Website enthält Links zu Google Maps. Beim Aufruf des Links gelten die Datenschutzbestimmungen von Google (google.com/privacy).</p>
          </section>
          <section>
            <h2 className="font-playfair text-xl text-espresso mb-3">4. Ihre Rechte</h2>
            <p>Sie haben das Recht auf Auskunft, Berichtigung und Löschung Ihrer Daten. Kontakt: trebelcafe@gmx.de</p>
          </section>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/impressum/ src/app/datenschutz/
git commit -m "feat: Impressum and Datenschutz legal pages"
```

---

## Task 16: Final Check & Production Build

- [ ] **Step 1: Run TypeScript type check**

```bash
npm run build
```

Expected: build succeeds with no type errors. Fix any errors before continuing.

- [ ] **Step 2: Check all pages in browser**

Visit each route and verify:
- `/` — Hero, all 5 sections, correct fonts/colors
- `/speisekarte` — 3 menu sections with all items
- `/ueber-uns` — hero image, story, promises
- `/galerie` — masonry grid with 9 images
- `/reservierung` — form + direct contact + buffet dates
- `/impressum` — legal text
- `/datenschutz` — privacy text

- [ ] **Step 3: Mobile check (375px)**

In Chrome DevTools (iPhone SE size), verify:
- Nav hamburger opens/closes fullscreen overlay
- Hero text is readable and not clipped
- All grids collapse to single column
- Buttons are tappable (min 44px height)
- Footer wraps cleanly

- [ ] **Step 4: Final commit**

```bash
git add .
git commit -m "feat: complete Trebelcafé website — all pages, design system, animations"
```

---

## Quick Reference

| Color | Hex | Tailwind Class |
|-------|-----|----------------|
| Background | `#FAF6F0` | `bg-cream` |
| Text | `#2C1810` | `text-espresso` |
| Accent | `#C4724A` | `text-terracotta` / `bg-terracotta` |
| Sand | `#E8D5C0` | `bg-sand` |
| Sage | `#6B7C5E` | `text-sage` |

| Font | Variable | Tailwind Class |
|------|----------|----------------|
| Playfair Display | `--font-playfair` | `font-playfair` |
| DM Sans | `--font-dm-sans` | `font-dm` |
| Cormorant Garamond | `--font-cormorant` | `font-cormorant` |
