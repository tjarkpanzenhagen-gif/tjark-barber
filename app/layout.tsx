import type { Metadata } from 'next'
import './globals.css'
import { NavBar } from '@/components/NavBar'
import { Analytics } from '@vercel/analytics/next'

export const metadata: Metadata = {
  title: 'Barber – Termin buchen',
  description: 'Buche deinen Haarschnitt online.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body className="min-h-screen flex flex-col">
        <NavBar />
        <main className="flex-1">{children}</main>
        <Analytics />
      </body>
    </html>
  )
}
