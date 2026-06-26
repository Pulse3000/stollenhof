'use client'

import Link from 'next/link'
import {
  Baby,
  CalendarDays,
  Clock,
  Snowflake,
  ChevronRight,
} from 'lucide-react'
import { usePersistedState } from '@/lib/use-persisted-state'
import {
  STORAGE_KEYS,
  initialKuehe,
  initialStallwacheEvents,
  daysUntil,
  formatDate,
  formatDateTime,
  TODAY_ISO,
  type Kuh,
  type StallwacheEvent,
} from '@/lib/data'

const MONTHS = [
  'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember',
]

export default function GeburtenkalenderPage() {
  const [kuehe] = usePersistedState<Kuh[]>(STORAGE_KEYS.tiere, initialKuehe)
  const [events] = usePersistedState<StallwacheEvent[]>(
    STORAGE_KEYS.stallwacheEvents,
    initialStallwacheEvents,
  )

  const erwartet = kuehe
    .filter((k) => k.kalbungVoraussichtlich)
    .sort((a, b) => (a.kalbungVoraussichtlich! < b.kalbungVoraussichtlich! ? -1 : 1))

  const kalbungen = events
    .filter((e) => e.typ === 'Kalbung erkannt')
    .sort((a, b) => b.zeitstempel.localeCompare(a.zeitstempel))

  const trockengestellt = kuehe.filter((k) => k.status === 'Trockengestellt')
  const naechste = erwartet[0]

  const months = Array.from(
    new Set(erwartet.map((k) => k.kalbungVoraussichtlich!.slice(0, 7))),
  ).sort()

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900 flex items-center gap-2">
          <CalendarDays className="w-6 h-6 text-green-700" />
          Geburtenkalender
        </h1>
        <p className="text-stone-500 mt-0.5 text-sm">
          Erwartete Abkalbungen &amp; KI-erkannte Geburten · Oberer Stollenhof
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Kpi color="amber" icon={<Baby className="w-5 h-5" />} value={String(erwartet.length)} label="Erwartete Geburten" sub={naechste ? `nächste: ${naechste.name}` : '–'} />
        <Kpi color="green" icon={<Clock className="w-5 h-5" />} value={naechste ? `${daysUntil(naechste.kalbungVoraussichtlich!)} T.` : '–'} label="Bis zur nächsten Geburt" sub={naechste ? formatDate(naechste.kalbungVoraussichtlich!) : ''} />
        <Kpi color="pink" icon={<Baby className="w-5 h-5" />} value={String(kalbungen.length)} label="Erkannte Kalbungen" sub="via KI-Stallwache" />
        <Kpi color="sky" icon={<Snowflake className="w-5 h-5" />} value={String(trockengestellt.length)} label="Trockengestellt" sub={trockengestellt.map((k) => k.name).join(', ') || 'keine'} />
      </div>

      <div className="bg-white rounded-xl border border-stone-200 p-5">
        <h2 className="font-semibold text-stone-900 mb-4 flex items-center gap-2">
          <CalendarDays className="w-4 h-4 text-amber-600" /> Kalenderansicht erwarteter Geburten
        </h2>
        {months.length === 0 ? (
          <p className="text-sm text-stone-400 py-6 text-center">Keine erwarteten Geburten terminiert.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {months.map((ym) => {
              const [y, m] = ym.split('-').map(Number)
              const birthsThisMonth = erwartet.filter((k) => k.kalbungVoraussichtlich!.startsWith(ym))
              return <MiniMonth key={ym} year={y} month={m} births={birthsThisMonth} />
            })}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-stone-200">
          <div className="px-5 py-4 border-b border-stone-100">
            <h2 className="font-semibold text-stone-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600" /> Erwartete Geburten
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">{erwartet.length} trächtige Kühe mit Termin</p>
          </div>
          <div className="p-4 space-y-3">
            {erwartet.map((k) => {
              const d = daysUntil(k.kalbungVoraussichtlich!)
              const urgent = d <= 14
              return (
                <Link
                  key={k.nr}
                  href="/tiere"
                  className={`block rounded-xl border p-4 transition-all ${urgent ? 'bg-amber-50 border-amber-200 hover:border-amber-400 hover:shadow-md' : 'bg-stone-50 border-stone-200 hover:border-stone-300 hover:shadow-sm'}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-stone-800">
                      Nr. {String(k.nr).padStart(2, '0')} · {k.name}
                    </span>
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${urgent ? 'bg-amber-200 text-amber-900 animate-pulse' : 'bg-stone-200 text-stone-700'}`}>
                      in {d} {d === 1 ? 'Tag' : 'Tagen'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-2 text-xs text-stone-500">
                    <span>Termin: {formatDate(k.kalbungVoraussichtlich!)}</span>
                    <span>{k.laktation}. Laktation · {k.alter} J.</span>
                  </div>
                  {k.notiz && <p className="text-xs text-stone-500 mt-2 italic">{k.notiz}</p>}
                </Link>
              )
            })}
            {erwartet.length === 0 && (
              <p className="py-6 text-sm text-stone-400 text-center">Keine erwarteten Geburten.</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-stone-200">
          <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-stone-900 flex items-center gap-2">
                <Baby className="w-4 h-4 text-pink-600" /> Erkannte Kalbungen
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">via KI-Stallwache erkannt</p>
            </div>
            <Link href="/stallwache" className="text-sm text-green-700 hover:text-green-800 font-medium flex items-center gap-0.5">
              Stallwache <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="p-4">
            <div className="relative pl-6">
              <div className="absolute left-[7px] top-1 bottom-1 w-px bg-stone-200" />
              {kalbungen.map((e) => {
                const kuh = kuehe.find((k) => k.nr === e.kuhNr)
                return (
                  <div key={e.id} className="relative pb-5 last:pb-0">
                    <span className="absolute -left-[22px] top-1 w-3.5 h-3.5 rounded-full bg-pink-500 border-2 border-white shadow-sm" />
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-stone-800">
                        {kuh ? `Nr. ${String(kuh.nr).padStart(2, '0')} · ${kuh.name}` : 'Unbekannt'}
                      </span>
                      {e.konfidenz !== undefined && (
                        <span className="text-xs font-mono text-pink-700 bg-pink-50 px-1.5 py-0.5 rounded">
                          {(e.konfidenz * 100).toFixed(0)} %
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-stone-600 mt-0.5">{e.beschreibung}</p>
                    <p className="text-xs text-stone-400 mt-0.5 font-mono">{formatDateTime(e.zeitstempel)}</p>
                  </div>
                )
              })}
              {kalbungen.length === 0 && (
                <p className="py-6 text-sm text-stone-400 text-center">Noch keine Kalbungen erkannt.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function MiniMonth({ year, month, births }: { year: number; month: number; births: Kuh[] }) {
  const first = new Date(year, month - 1, 1)
  const startWeekday = (first.getDay() + 6) % 7
  const daysInMonth = new Date(year, month, 0).getDate()
  const birthDays = new Map<number, Kuh>()
  births.forEach((k) => {
    const day = Number(k.kalbungVoraussichtlich!.slice(8, 10))
    birthDays.set(day, k)
  })

  const todayDay =
    TODAY_ISO.startsWith(`${year}-${String(month).padStart(2, '0')}`)
      ? Number(TODAY_ISO.slice(8, 10))
      : -1

  const cells: (number | null)[] = []
  for (let i = 0; i < startWeekday; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  return (
    <div className="border border-stone-200 rounded-lg p-3 hover:shadow-md transition-shadow">
      <p className="text-sm font-semibold text-stone-800 mb-2 text-center">
        {MONTHS[month - 1]} {year}
      </p>
      <div className="grid grid-cols-7 gap-1 text-[10px] text-stone-400 mb-1">
        {['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map((d) => (
          <div key={d} className="text-center">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((d, i) => {
          if (d === null) return <div key={i} />
          const kuh = birthDays.get(d)
          const isToday = d === todayDay
          return (
            <div
              key={i}
              title={kuh ? `${kuh.name} (Nr. ${kuh.nr})` : undefined}
              className={`aspect-square flex items-center justify-center text-[11px] rounded transition-transform ${
                kuh
                  ? 'bg-amber-500 text-white font-bold hover:scale-110 cursor-pointer'
                  : isToday
                    ? 'bg-green-100 text-green-800 font-semibold ring-2 ring-green-400'
                    : 'text-stone-600'
              }`}
            >
              {d}
            </div>
          )
        })}
      </div>
      <div className="mt-2 space-y-0.5">
        {births.map((k) => (
          <p key={k.nr} className="text-[10px] text-stone-500 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            {Number(k.kalbungVoraussichtlich!.slice(8, 10))}. · {k.name}
          </p>
        ))}
      </div>
    </div>
  )
}

function Kpi({
  icon,
  color,
  value,
  label,
  sub,
}: {
  icon: React.ReactNode
  color: 'green' | 'amber' | 'pink' | 'sky'
  value: string
  label: string
  sub: string
}) {
  const map = {
    green: 'bg-green-50 text-green-700',
    amber: 'bg-amber-50 text-amber-700',
    pink: 'bg-pink-50 text-pink-700',
    sky: 'bg-sky-50 text-sky-700',
  }
  return (
    <div className="bg-white rounded-xl border border-stone-200 p-5 hover:shadow-md transition-shadow">
      <div className={`inline-flex p-2.5 rounded-lg mb-3 ${map[color]}`}>{icon}</div>
      <p className="text-2xl font-bold text-stone-900">{value}</p>
      <p className="text-sm font-medium text-stone-600 mt-0.5">{label}</p>
      <p className="text-xs text-stone-400 mt-1 truncate">{sub}</p>
    </div>
  )
}
