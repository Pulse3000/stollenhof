import {
  CalendarDays,
  Beef,
  Droplets,
  CheckSquare,
  TrendingUp,
  Users,
  Home,
  AlertCircle,
} from 'lucide-react'
import Link from 'next/link'

const stats = [
  {
    label: 'Aktive Buchungen',
    value: '4',
    sub: 'im Mai 2026',
    icon: CalendarDays,
    color: 'text-green-700',
    bg: 'bg-green-50',
    href: '/buchungen',
  },
  {
    label: 'Tiere gesamt',
    value: '47',
    sub: '35 Kühe · 12 Hühner',
    icon: Beef,
    color: 'text-amber-700',
    bg: 'bg-amber-50',
    href: '/tiere',
  },
  {
    label: 'Milch (April)',
    value: '18.240 kg',
    sub: '+4,2 % zum Vormonat',
    icon: Droplets,
    color: 'text-blue-700',
    bg: 'bg-blue-50',
    href: '/milch',
  },
  {
    label: 'Offene Aufgaben',
    value: '6',
    sub: '2 dringend',
    icon: CheckSquare,
    color: 'text-red-600',
    bg: 'bg-red-50',
    href: '/aufgaben',
  },
]

const recentBookings = [
  { id: 1, gast: 'Familie Müller', anreise: '10.05.2026', abreise: '17.05.2026', personen: 4, status: 'Bestätigt' },
  { id: 2, gast: 'Herr & Frau Bauer', anreise: '18.05.2026', abreise: '22.05.2026', personen: 2, status: 'Bestätigt' },
  { id: 3, gast: 'Familie Weber', anreise: '24.05.2026', abreise: '31.05.2026', personen: 5, status: 'Ausstehend' },
  { id: 4, gast: 'Familie Schmitt', anreise: '02.06.2026', abreise: '09.06.2026', personen: 3, status: 'Bestätigt' },
]

const upcomingEvents = [
  { datum: '17.05.2026', titel: 'Pizzabacken auf dem Hof', ort: 'Backofen beim Stall' },
  { datum: '25.05.2026', titel: 'Hofführung für Schulklasse', ort: 'Gesamter Hof' },
  { datum: '14.06.2026', titel: 'Demeter-Betriebsbesichtigung', ort: 'Oberer Stollenhof' },
]

const statusColors: Record<string, string> = {
  Bestätigt: 'bg-green-100 text-green-800',
  Ausstehend: 'bg-amber-100 text-amber-800',
  Abgesagt: 'bg-red-100 text-red-800',
}

export default function DashboardPage() {
  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Willkommen zurück</h1>
        <p className="text-stone-500 mt-1">Oberer Stollenhof · Montag, 4. Mai 2026</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="bg-white rounded-xl border border-stone-200 p-5 hover:shadow-md transition-shadow group"
          >
            <div className={`inline-flex p-2.5 rounded-lg ${s.bg} mb-3`}>
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
            <p className="text-2xl font-bold text-stone-900 group-hover:text-green-700 transition-colors">{s.value}</p>
            <p className="text-sm font-medium text-stone-600 mt-0.5">{s.label}</p>
            <p className="text-xs text-stone-400 mt-1">{s.sub}</p>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Bookings */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-stone-200">
          <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
            <h2 className="font-semibold text-stone-900">Aktuelle Buchungen</h2>
            <Link href="/buchungen" className="text-sm text-green-700 hover:text-green-800 font-medium">
              Alle anzeigen →
            </Link>
          </div>
          <div className="divide-y divide-stone-50">
            {recentBookings.map((b) => (
              <div key={b.id} className="px-6 py-4 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-medium text-stone-900 truncate">{b.gast}</p>
                  <p className="text-sm text-stone-500 mt-0.5">
                    {b.anreise} – {b.abreise} · {b.personen} {b.personen === 1 ? 'Person' : 'Personen'}
                  </p>
                </div>
                <span className={`shrink-0 text-xs px-2.5 py-1 rounded-full font-medium ${statusColors[b.status]}`}>
                  {b.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Upcoming Events */}
          <div className="bg-white rounded-xl border border-stone-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
              <h2 className="font-semibold text-stone-900">Veranstaltungen</h2>
              <Link href="/veranstaltungen" className="text-sm text-green-700 hover:text-green-800 font-medium">
                Alle →
              </Link>
            </div>
            <div className="divide-y divide-stone-50">
              {upcomingEvents.map((e) => (
                <div key={e.titel} className="px-5 py-3.5">
                  <p className="text-xs text-green-700 font-medium">{e.datum}</p>
                  <p className="text-sm font-medium text-stone-900 mt-0.5">{e.titel}</p>
                  <p className="text-xs text-stone-400 mt-0.5">{e.ort}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Info */}
          <div className="bg-green-700 rounded-xl p-5 text-white">
            <div className="flex items-start gap-3">
              <Home className="w-5 h-5 mt-0.5 text-green-300 shrink-0" />
              <div>
                <p className="font-semibold text-sm">Siloturm</p>
                <p className="text-green-200 text-sm mt-0.5">Aktuell belegt</p>
                <p className="text-green-300 text-xs mt-2">Abreise: 09.05.2026</p>
              </div>
            </div>
          </div>

          {/* Alert */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-800">Tierarzttermin</p>
              <p className="text-xs text-amber-600 mt-0.5">Kuh Nr. 14 – Nachkontrolle 08.05.2026</p>
            </div>
          </div>
        </div>
      </div>

      {/* Milch Schnellübersicht */}
      <div className="bg-white rounded-xl border border-stone-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
          <h2 className="font-semibold text-stone-900">Milchproduktion – Überblick 2026</h2>
          <Link href="/milch" className="text-sm text-green-700 hover:text-green-800 font-medium">
            Details →
          </Link>
        </div>
        <div className="px-6 py-4">
          <div className="grid grid-cols-4 gap-4">
            {[
              { monat: 'Feb', menge: '16.820', trend: '+' },
              { monat: 'März', menge: '17.490', trend: '+' },
              { monat: 'April', menge: '18.240', trend: '+' },
              { monat: 'Mai', menge: '–', trend: '' },
            ].map((m) => (
              <div key={m.monat} className="text-center">
                <p className="text-xs text-stone-400 mb-1">{m.monat}</p>
                <div
                  className="mx-auto rounded-md flex items-center justify-center text-xs font-semibold"
                  style={{
                    height: '48px',
                    background: m.menge === '–' ? '#f5f5f4' : '#dcfce7',
                    color: m.menge === '–' ? '#a8a29e' : '#166534',
                  }}
                >
                  {m.menge === '–' ? '–' : `${m.menge} kg`}
                </div>
                {m.trend && (
                  <div className="flex items-center justify-center gap-1 mt-1">
                    <TrendingUp className="w-3 h-3 text-green-600" />
                    <span className="text-xs text-green-600">Gestiegen</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
