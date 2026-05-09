import Link from 'next/link'
import { Leaf, Home } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-green-100 mb-6">
          <Leaf className="w-8 h-8 text-green-700" />
        </div>
        <p className="text-7xl font-bold text-green-700 mb-2">404</p>
        <h1 className="text-2xl font-bold text-stone-900 mb-2">Seite nicht gefunden</h1>
        <p className="text-stone-500 mb-8">
          Die gesuchte Seite existiert nicht oder wurde verschoben.
          Vielleicht hat sich die Kuh ins Heu verirrt?
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-green-700 hover:bg-green-800 text-white font-medium transition-colors"
        >
          <Home className="w-4 h-4" />
          Zurück zur Übersicht
        </Link>
      </div>
    </div>
  )
}
