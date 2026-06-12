import type { ReactNode } from 'react'
import type { Metadata } from 'next'
import { Toaster } from '@/components/ui/sonner'
import { Sidebar } from '@/components/sidebar'
import './globals.css'

export const metadata: Metadata = {
  title: 'Oberer Stollenhof – Hofverwaltung',
  description: 'Verwaltungssystem für den Oberen Stollenhof – Biolandbau, Ferienwohnungen und Hofveranstaltungen in Rechberg, Baden-Württemberg.',
  verification: {
    google: 'yJA8LjELX2KFWQU-cvHjUcTQ1MMkl52qH6NK-p7FirE',
  },
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="de">
      <body className="antialiased">
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-y-auto bg-stone-50">
            {children}
          </main>
        </div>
        <Toaster />
      </body>
    </html>
  )
}
