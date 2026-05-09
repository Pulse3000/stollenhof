'use client'

import {
  Beef,
  Droplets,
  CheckSquare,
  TrendingUp,
  AlertCircle,
  Stethoscope,
  Baby,
  Warehouse,
  Package,
  Plus,
  Sun,
  Sunset,
  CalendarDays,
  Home,
} from 'lucide-react'
import Link from 'next/link'
import { usePersistedState } from '@/lib/use-persisted-state'
import {
  STORAGE_KEYS,
  initialBuchungen,
  initialAufgaben,
  initialKuehe,
  initialMelkungen,
  initialStallroutine,
  formatDate,
  daysUntil,
  TODAY_ISO,
  type Buchung,
  type Aufgabe,
  type Kuh,
  type Melkung,
  type Stallroutine,
} from '@/lib/data'

type FutterItem = {
  id: number
  name: string
  lagerbestand: number
  mindestbestand: number
}

function dateLabel() {
  const d = new Date(TODAY_ISO + 'T00:00:00')
  return d.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

export default function DashboardPage() {
  const [buchungen] = usePersistedState<Buchung[]>(STORAGE_KEYS.buchungen, initialBuchungen)
  const [aufgaben] = usePersistedState<Aufgabe[]>(STORAGE_KEYS.aufgaben, initialAufgaben)
  const [kuehe] = usePersistedState<Kuh[]>(STORAGE_KEYS.tiere, initialKuehe)
  const [melkungen] = usePersistedState<Melkung[]>(STORAGE_KEYS.melkungen, initialMelkungen)
  const [routine] = usePersistedState<Stallroutine[]>(STORAGE_KEYS.stallroutine, initialStallroutine)
  const [futter] = usePersistedState<FutterItem[]>(STORAGE_KEYS.futter, [])

  // Stall KPIs
  const inBehandlung = kuehe.filter((k) => k.status === 'In Behandlung')
  const traechtig = kuehe.filter((k) => k.status === 'Trächtig')
  const melkende = kuehe.filter((k) => k.milchTagesleistung > 0)
  const today = melkungen.find((m) => m.datum === TODAY_ISO) ?? { datum: TODAY_ISO, morgens: 0, abends: 0 }
  const milchHeute = today.morgens + today.abends
  const offeneStallAufgaben = aufgaben.filter((a) => !a.erledigt && (a.kategorie === 'Stall' || a.kategorie === 'Feld' || a.kategorie === 'Wartung')).length
  const dringendeAufgaben = aufgaben.filter((a) => !a.erledigt && a.prioritaet === 'Hoch').length
  const futterKritisch = futter.filter((f) => f.lagerbestand < f.mindestbestand).length
  const routineErledigt = routine.filter((r) => r.erledigt).length
  const routineProzent = Math.round((routineErledigt / routine.length) * 100)

  const naechsteKalbungen = kuehe
    .filter((k) => k.kalbungVoraussichtlich)
    .map((k) => ({ ...k, daysUntil: daysUntil(k.kalbungVoraussichtlich!) }))
    .filter((k) => k.daysUntil >= 0)
    .sort((a, b) => a.daysUntil - b.daysUntil)
    .slice(0, 4)

  const dringendsteAufgaben = aufgaben
    .filter((a) => !a.erledigt)
    .sort((a, b) => {
      const order = { Hoch: 0, Mittel: 1, Niedrig: 2 }
      return order[a.prioritaet] - order[b.prioritaet]
    })
    .slice(0, 5)

  // Gäste-KPIs (kompakt)
  const aktuelleBuchung = buchungen.find((b) => b.anreise <= TODAY_ISO && b.abreise > TODAY_ISO && b.status === 'Bestätigt')
  const naechsteBuchung = buchungen
    .filter((b) => b.anreise >= TODAY_ISO && b.status !== 'Abgesagt')
    .sort((a, b) => a.anreise.localeCompare(b.anreise))[0]

  const stats = [
    {
      label: 'Tiere im Stall',
      value: String(kuehe.length),
      sub: `${melkende.length} aktiv melkend`,
      icon: Beef,
      color: 'text-amber-700',
      bg: 'bg-amber-50',
      href: '/tiere',
    },
    {
      label: 'Milch heute',
      value: `${milchHeute} L`,
      sub: melkende.length > 0 ? `Ø ${Math.round(milchHeute / melkende.length)} L pro Kuh` : '–',
      icon: Droplets,
      color: 'text-blue-700',
      bg: 'bg-blue-50',
      href: '/milch',
    },
    {
      label: 'Tagesroutine',
      value: `${routineProzent} %`,
      sub: `${routineErledigt}/${routine.length} erledigt`,
      icon: Warehouse,
      color: 'text-green-700',
      bg: 'bg-green-50',
      href: '/stall',
    },
    {
      label: 'Stall-Aufgaben',
      value: String(offeneStallAufgaben),
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
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Hofübersicht</h1>
          <p className="text-stone-500 mt-1">Oberer Stollenhof · {dateLabel()}</p>
        </div>
        <div className="hidden md:flex gap-2">
          <Link href="/stall" className="text-sm font-medium px-3 py-2 rounded-lg bg-green-700 hover:bg-green-800 text-white transition-colors flex items-center gap-1.5">
            <Warehouse className="w-3.5 h-3.5" /> Zum Stallbuch
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

      {/* Hauptbereich Stall */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Tagesproduktion */}
          <div className="bg-white rounded-xl border border-stone-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
              <h2 className="font-semibold text-stone-900 flex items-center gap-2">
                <Droplets className="w-4 h-4 text-blue-600" /> Melkprotokoll heute
              </h2>
              <Link href="/stall" className="text-sm text-green-700 hover:text-green-800 font-medium">
                Erfassen →
              </Link>
            </div>
            <div className="grid grid-cols-3 gap-0 divide-x divide-stone-100">
              <div className="p-5">
                <div className="flex items-center gap-1.5 text-xs text-stone-500 mb-2">
                  <Sun className="w-3 h-3 text-amber-500" /> Morgens
                </div>
                <p className="text-2xl font-bold text-stone-900">{today.morgens} L</p>
              </div>
              <div className="p-5">
                <div className="flex items-center gap-1.5 text-xs text-stone-500 mb-2">
                  <Sunset className="w-3 h-3 text-indigo-500" /> Abends
                </div>
                <p className="text-2xl font-bold text-stone-900">{today.abends} L</p>
              </div>
              <div className="p-5 bg-blue-50/50">
                <div className="flex items-center gap-1.5 text-xs text-blue-700 mb-2">
                  <TrendingUp className="w-3 h-3" /> Tagessumme
                </div>
                <p className="text-2xl font-bold text-blue-700">{milchHeute} L</p>
              </div>
            </div>
          </div>

          {/* Herdenstatus */}
          <div className="bg-white rounded-xl border border-stone-200">
            <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
              <h2 className="font-semibold text-stone-900 flex items-center gap-2">
                <Beef className="w-4 h-4 text-amber-600" /> Herdenstatus
              </h2>
              <Link href="/tiere" className="text-sm text-green-700 hover:text-green-800 font-medium">
                Alle Tiere →
              </Link>
            </div>

            <div className="p-6 space-y-4">
              {inBehandlung.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Stethoscope className="w-4 h-4 text-red-700" />
                    <p className="text-sm font-semibold text-red-900">
                      {inBehandlung.length} {inBehandlung.length === 1 ? 'Kuh' : 'Kühe'} in Behandlung
                    </p>
                  </div>
                  <div className="space-y-1">
                    {inBehandlung.map((k) => (
                      <div key={k.nr} className="text-xs text-red-800">
                        <span className="font-medium">Nr. {String(k.nr).padStart(2, '0')} {k.name}</span>
                        {k.notiz && <span className="text-red-600"> – {k.notiz}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-lg bg-green-50 p-3 text-center">
                  <p className="text-xl font-bold text-green-800">{kuehe.filter((k) => k.status === 'Gesund').length}</p>
                  <p className="text-xs text-green-700 mt-0.5">Gesund</p>
                </div>
                <div className="rounded-lg bg-blue-50 p-3 text-center">
                  <p className="text-xl font-bold text-blue-800">{traechtig.length}</p>
                  <p className="text-xs text-blue-700 mt-0.5">Trächtig</p>
                </div>
                <div className="rounded-lg bg-stone-100 p-3 text-center">
                  <p className="text-xl font-bold text-stone-700">{kuehe.filter((k) => k.status === 'Trockengestellt').length}</p>
                  <p className="text-xs text-stone-600 mt-0.5">Trockengestellt</p>
                </div>
              </div>
            </div>
          </div>

          {/* Anstehende Kalbungen */}
          {naechsteKalbungen.length > 0 && (
            <div className="bg-white rounded-xl border border-stone-200">
              <div className="px-6 py-4 border-b border-stone-100 flex items-center gap-2">
                <Baby className="w-4 h-4 text-pink-600" />
                <h2 className="font-semibold text-stone-900">Anstehende Kalbungen</h2>
              </div>
              <div className="divide-y divide-stone-50">
                {naechsteKalbungen.map((k) => {
                  const akut = k.daysUntil <= 14
                  return (
                    <div key={k.nr} className="px-6 py-3 flex items-center justify-between gap-3">
                      <div>
                        <p className="font-medium text-stone-900 text-sm">
                          Nr. {String(k.nr).padStart(2, '0')} · {k.name}
                        </p>
                        <p className="text-xs text-stone-400 mt-0.5">{formatDate(k.kalbungVoraussichtlich!)}</p>
                      </div>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        akut ? 'bg-pink-100 text-pink-800' : 'bg-stone-100 text-stone-600'
                      }`}>
                        in {k.daysUntil} {k.daysUntil === 1 ? 'Tag' : 'Tagen'}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Rechte Spalte */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-stone-200">
            <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between">
              <h2 className="font-semibold text-stone-900 text-sm">Aufgaben heute</h2>
              <Link href="/aufgaben" className="text-xs text-green-700 hover:text-green-800 font-medium">
                Alle →
              </Link>
            </div>
            {dringendsteAufgaben.length === 0 ? (
              <p className="px-5 py-6 text-sm text-stone-400">Keine offenen Aufgaben.</p>
            ) : (
              <div className="divide-y divide-stone-50">
                {dringendsteAufgaben.map((a) => (
                  <div key={a.id} className="px-5 py-3">
                    <p className="text-sm font-medium text-stone-900 leading-tight">{a.titel}</p>
                    <div className="flex items-center justify-between mt-1.5">
                      <p className="text-xs text-stone-400">{a.faellig}</p>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                        a.prioritaet === 'Hoch'
                          ? 'bg-red-100 text-red-800'
                          : a.prioritaet === 'Mittel'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-stone-100 text-stone-600'
                      }`}>
                        {a.prioritaet}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {futterKritisch > 0 && (
            <Link href="/futter" className="block bg-red-50 border border-red-200 rounded-xl p-4 hover:bg-red-100 transition-colors">
              <div className="flex items-start gap-3">
                <Package className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-800">
                    {futterKritisch} Futter-{futterKritisch === 1 ? 'Artikel' : 'Artikel'} unter Mindestbestand
                  </p>
                  <p className="text-xs text-red-600 mt-0.5">Nachbestellung dringend →</p>
                </div>
              </div>
            </Link>
          )}

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

          {/* Hofgäste – kompakt */}
          <div className="bg-white rounded-xl border border-stone-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-stone-900 text-sm flex items-center gap-2">
                <Home className="w-4 h-4 text-stone-500" /> Siloturm
              </h2>
              <Link href="/buchungen" className="text-xs text-green-700 hover:text-green-800 font-medium">
                Buchungen →
              </Link>
            </div>
            {aktuelleBuchung ? (
              <>
                <p className="text-sm font-medium text-stone-900 truncate">Belegt: {aktuelleBuchung.gast}</p>
                <p className="text-xs text-stone-500 mt-1">Abreise: {formatDate(aktuelleBuchung.abreise)}</p>
              </>
            ) : (
              <>
                <p className="text-sm font-medium text-stone-700">Aktuell frei</p>
                {naechsteBuchung && (
                  <p className="text-xs text-stone-500 mt-1 flex items-center gap-1">
                    <CalendarDays className="w-3 h-3" />
                    Nächste Anreise: {formatDate(naechsteBuchung.anreise)}
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
