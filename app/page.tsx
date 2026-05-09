'use client'

import {
  CalendarDays,
  Beef,
  Droplets,
  CheckSquare,
  TrendingUp,
  Users,
  Home,
  AlertCircle,
  PartyPopper,
  Plus,
} from 'lucide-react'
import Link from 'next/link'
import { usePersistedState } from '@/lib/use-persisted-state'
import {
  STORAGE_KEYS,
  initialBuchungen,
  initialAufgaben,
  initialEvents,
  formatDate,
  isPast,
  TODAY_ISO,
  type Buchung,
  type Aufgabe,
  type Event,
} from '@/lib/data'

const statusColors: Record<string, string> = {
  Bestätigt: 'bg-green-100 text-green-800',
  Ausstehend: 'bg-amber-100 text-amber-800',
  Abgesagt: 'bg-red-100 text-red-800',
}

const milchVorschau = [
  { monat: 'Feb', menge: '16.820', trend: '+' },
  { monat: 'März', menge: '17.490', trend: '+' },
  { monat: 'April', menge: '18.240', trend: '+' },
  { monat: 'Mai', menge: '–', trend: '' },
]

function dateLabel() {
  const d = new Date(TODAY_ISO + 'T00:00:00')
  return d.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

export default function DashboardPage() {
  const [buchungen] = usePersistedState<Buchung[]>(STORAGE_KEYS.buchungen, initialBuchungen)
  const [aufgaben] = usePersistedState<Aufgabe[]>(STORAGE_KEYS.aufgaben, initialAufgaben)
  const [events] = usePersistedState<Event[]>(STORAGE_KEYS.events, initialEvents)

  // Live-derived KPIs
  const aktiveBuchungen = buchungen.filter((b) => b.status !== 'Abgesagt' && b.abreise >= TODAY_ISO).length
  const offeneAufgaben = aufgaben.filter((a) => !a.erledigt).length
  const dringendeAufgaben = aufgaben.filter((a) => !a.erledigt && a.prioritaet === 'Hoch').length
  const naechsteEvents = events.filter((e) => !isPast(e.datum)).sort((a, b) => a.datum.localeCompare(b.datum))
  const aktuelleBuchung = buchungen.find((b) => b.anreise <= TODAY_ISO && b.abreise > TODAY_ISO && b.status === 'Bestätigt')
  const naechsteBuchungen = buchungen
    .filter((b) => b.anreise >= TODAY_ISO && b.status !== 'Abgesagt')
    .sort((a, b) => a.anreise.localeCompare(b.anreise))
    .slice(0, 5)

  const stats = [
    {
      label: 'Aktive Buchungen',
      value: String(aktiveBuchungen),
      sub: `von ${buchungen.length} insgesamt`,
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
      value: String(offeneAufgaben),
      sub: dringendeAufgaben > 0 ? `${dringendeAufgaben} dringend` : 'keine dringenden',
      icon: CheckSquare,
      color: dringendeAufgaben > 0 ? 'text-red-600' : 'text-stone-600',
      bg: dringendeAufgaben > 0 ? 'bg-red-50' : 'bg-stone-50',
      href: '/aufgaben',
    },
  ]

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Willkommen zurück</h1>
          <p className="text-stone-500 mt-1">Oberer Stollenhof · {dateLabel()}</p>
        </div>
        <div className="hidden md:flex gap-2">
          <Link href="/buchungen" className="text-sm font-medium px-3 py-2 rounded-lg border border-stone-200 bg-white hover:bg-stone-100 text-stone-700 transition-colors flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5" /> Buchung
          </Link>
          <Link href="/aufgaben" className="text-sm font-medium px-3 py-2 rounded-lg border border-stone-200 bg-white hover:bg-stone-100 text-stone-700 transition-colors flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5" /> Aufgabe
          </Link>
        </div>
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
        {/* Next bookings */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-stone-200">
          <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
            <h2 className="font-semibold text-stone-900">Nächste Buchungen</h2>
            <Link href="/buchungen" className="text-sm text-green-700 hover:text-green-800 font-medium">
              Alle anzeigen →
            </Link>
          </div>
          {naechsteBuchungen.length === 0 ? (
            <p className="px-6 py-8 text-stone-400 text-sm text-center">Keine bevorstehenden Buchungen.</p>
          ) : (
            <div className="divide-y divide-stone-50">
              {naechsteBuchungen.map((b) => (
                <div key={b.id} className="px-6 py-4 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-medium text-stone-900 truncate">{b.gast}</p>
                    <p className="text-sm text-stone-500 mt-0.5">
                      {formatDate(b.anreise)} – {formatDate(b.abreise)} · {b.personen} {b.personen === 1 ? 'Person' : 'Personen'}
                    </p>
                  </div>
                  <span className={`shrink-0 text-xs px-2.5 py-1 rounded-full font-medium ${statusColors[b.status]}`}>
                    {b.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Upcoming events */}
          <div className="bg-white rounded-xl border border-stone-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
              <h2 className="font-semibold text-stone-900">Veranstaltungen</h2>
              <Link href="/veranstaltungen" className="text-sm text-green-700 hover:text-green-800 font-medium">
                Alle →
              </Link>
            </div>
            {naechsteEvents.length === 0 ? (
              <p className="px-5 py-6 text-stone-400 text-sm">Keine kommenden Events.</p>
            ) : (
              <div className="divide-y divide-stone-50">
                {naechsteEvents.slice(0, 3).map((e) => (
                  <div key={e.id} className="px-5 py-3.5">
                    <p className="text-xs text-green-700 font-medium">{formatDate(e.datum)}</p>
                    <p className="text-sm font-medium text-stone-900 mt-0.5">{e.titel}</p>
                    <p className="text-xs text-stone-400 mt-0.5">{e.ort}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Siloturm status */}
          <div className="bg-green-700 rounded-xl p-5 text-white">
            <div className="flex items-start gap-3">
              <Home className="w-5 h-5 mt-0.5 text-green-300 shrink-0" />
              <div className="min-w-0">
                <p className="font-semibold text-sm">Siloturm</p>
                {aktuelleBuchung ? (
                  <>
                    <p className="text-green-200 text-sm mt-0.5 truncate">Belegt: {aktuelleBuchung.gast}</p>
                    <p className="text-green-300 text-xs mt-2">Abreise: {formatDate(aktuelleBuchung.abreise)}</p>
                  </>
                ) : (
                  <>
                    <p className="text-green-200 text-sm mt-0.5">Aktuell frei</p>
                    {naechsteBuchungen[0] && (
                      <p className="text-green-300 text-xs mt-2">Nächste Anreise: {formatDate(naechsteBuchungen[0].anreise)}</p>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Urgent task alert */}
          {dringendeAufgaben > 0 && (
            <Link href="/aufgaben" className="block bg-amber-50 border border-amber-200 rounded-xl p-4 hover:bg-amber-100 transition-colors">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-800">
                    {dringendeAufgaben} dringende {dringendeAufgaben === 1 ? 'Aufgabe' : 'Aufgaben'}
                  </p>
                  <p className="text-xs text-amber-600 mt-0.5">Klicken zum Bearbeiten →</p>
                </div>
              </div>
            </Link>
          )}
        </div>
      </div>

      {/* Milch overview */}
      <div className="bg-white rounded-xl border border-stone-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
          <h2 className="font-semibold text-stone-900">Milchproduktion – Überblick 2026</h2>
          <Link href="/milch" className="text-sm text-green-700 hover:text-green-800 font-medium">
            Details →
          </Link>
        </div>
        <div className="px-6 py-4">
          <div className="grid grid-cols-4 gap-4">
            {milchVorschau.map((m) => (
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
