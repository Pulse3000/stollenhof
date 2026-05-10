'use client'

import Link from 'next/link'
import {
  Warehouse,
  Droplets,
  Beef,
  AlertTriangle,
  CheckCircle2,
  Sun,
  Sunset,
  Cloud,
  Baby,
  Activity,
  Stethoscope,
  Plus,
  Trees,
  Eye,
  Wifi,
  WifiOff,
} from 'lucide-react'
import { usePersistedState } from '@/lib/use-persisted-state'
import {
  STORAGE_KEYS,
  initialKuehe,
  initialMelkungen,
  initialStallroutine,
  initialAufgaben,
  initialWeiden,
  initialStallwacheEvents,
  defaultStallwacheConfig,
  defaultStallwacheStatus,
  TODAY_ISO,
  formatDate,
  daysUntil,
  relativeTime,
  type Kuh,
  type Melkung,
  type Stallroutine,
  type Aufgabe,
  type RoutineSlot,
  type Weide,
  type StallwacheEvent,
  type StallwacheConfig,
  type StallwacheStatus,
} from '@/lib/data'

const slotIcon: Record<RoutineSlot, typeof Sun> = {
  Morgens: Sun,
  Mittags: Cloud,
  Abends: Sunset,
}

const slotColor: Record<RoutineSlot, string> = {
  Morgens: 'text-amber-600 bg-amber-50 border-amber-200',
  Mittags: 'text-sky-600 bg-sky-50 border-sky-200',
  Abends: 'text-indigo-600 bg-indigo-50 border-indigo-200',
}

export default function StallPage() {
  const [kuehe] = usePersistedState<Kuh[]>(STORAGE_KEYS.tiere, initialKuehe)
  const [melkungen, setMelkungen] = usePersistedState<Melkung[]>(STORAGE_KEYS.melkungen, initialMelkungen)
  const [routine, setRoutine] = usePersistedState<Stallroutine[]>(STORAGE_KEYS.stallroutine, initialStallroutine)
  const [aufgaben] = usePersistedState<Aufgabe[]>(STORAGE_KEYS.aufgaben, initialAufgaben)
  const [weiden] = usePersistedState<Weide[]>(STORAGE_KEYS.weiden, initialWeiden)
  const [stallwacheConfig] = usePersistedState<StallwacheConfig>(
    STORAGE_KEYS.stallwacheConfig,
    defaultStallwacheConfig,
  )
  const [stallwacheStatus] = usePersistedState<StallwacheStatus>(
    STORAGE_KEYS.stallwacheStatus,
    defaultStallwacheStatus,
  )
  const [stallwacheEvents] = usePersistedState<StallwacheEvent[]>(
    STORAGE_KEYS.stallwacheEvents,
    initialStallwacheEvents,
  )

  const today = melkungen.find((m) => m.datum === TODAY_ISO) ?? { datum: TODAY_ISO, morgens: 0, abends: 0 }
  const yesterday = melkungen.find((m) => {
    const d = new Date(TODAY_ISO + 'T00:00:00')
    d.setDate(d.getDate() - 1)
    return m.datum === d.toISOString().slice(0, 10)
  })
  const todaySum = today.morgens + today.abends
  const yesterdaySum = yesterday ? yesterday.morgens + yesterday.abends : 0
  const diff = yesterdaySum > 0 ? todaySum - yesterdaySum : 0

  const inBehandlung = kuehe.filter((k) => k.status === 'In Behandlung')
  const traechtig = kuehe.filter((k) => k.status === 'Trächtig')
  const trockengestellt = kuehe.filter((k) => k.status === 'Trockengestellt')
  const gesund = kuehe.filter((k) => k.status === 'Gesund')
  const melkende = kuehe.filter((k) => k.milchTagesleistung > 0)
  const erwarteteTagesleistung = melkende.reduce((s, k) => s + k.milchTagesleistung, 0)

  const naechsteKalbungen = kuehe
    .filter((k) => k.kalbungVoraussichtlich)
    .map((k) => ({ ...k, daysUntil: daysUntil(k.kalbungVoraussichtlich!) }))
    .filter((k) => k.daysUntil >= 0)
    .sort((a, b) => a.daysUntil - b.daysUntil)

  const offeneStallaufgaben = aufgaben.filter((a) => !a.erledigt && (a.kategorie === 'Stall' || a.kategorie === 'Feld'))
  const aktiveWeiden = weiden.filter((w) => w.status === 'In Nutzung')
  const tiereAufWeide = aktiveWeiden.reduce((s, w) => s + w.herdeAnzahl, 0)
  const stallwacheLetzte = [...stallwacheEvents]
    .sort((a, b) => b.zeitstempel.localeCompare(a.zeitstempel))
    .find((e) => e.typ === 'Kalbung erkannt' || e.typ === 'Aktivität')
  const stallwacheUnbestaetigt = stallwacheEvents.filter((e) => !e.bestaetigt).length
  const stallwacheOnline = stallwacheConfig.enabled && stallwacheStatus.online

  const routineErledigt = routine.filter((r) => r.erledigt).length
  const routineFortschritt = Math.round((routineErledigt / routine.length) * 100)

  function toggleRoutine(id: number) {
    setRoutine((prev) => prev.map((r) => (r.id === id ? { ...r, erledigt: !r.erledigt } : r)))
  }

  function logEvening(value: number) {
    const v = Math.max(0, value)
    setMelkungen((prev) => {
      const exists = prev.some((m) => m.datum === TODAY_ISO)
      if (exists) return prev.map((m) => (m.datum === TODAY_ISO ? { ...m, abends: v } : m))
      return [{ datum: TODAY_ISO, morgens: 0, abends: v }, ...prev]
    })
  }

  function logMorning(value: number) {
    const v = Math.max(0, value)
    setMelkungen((prev) => {
      const exists = prev.some((m) => m.datum === TODAY_ISO)
      if (exists) return prev.map((m) => (m.datum === TODAY_ISO ? { ...m, morgens: v } : m))
      return [{ datum: TODAY_ISO, morgens: v, abends: 0 }, ...prev]
    })
  }

  const slots: RoutineSlot[] = ['Morgens', 'Mittags', 'Abends']

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 flex items-center gap-2">
            <Warehouse className="w-6 h-6 text-green-700" />
            Stallbuch
          </h1>
          <p className="text-stone-500 mt-0.5 text-sm">
            Tagesübersicht · {formatDate(TODAY_ISO)} · {kuehe.length} Tiere im Stall
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/tiere" className="text-sm font-medium px-3 py-2 rounded-lg border border-stone-200 bg-white hover:bg-stone-100 text-stone-700 transition-colors flex items-center gap-1.5">
            <Beef className="w-3.5 h-3.5" /> Tierdetails
          </Link>
          <Link href="/aufgaben" className="text-sm font-medium px-3 py-2 rounded-lg border border-stone-200 bg-white hover:bg-stone-100 text-stone-700 transition-colors flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5" /> Aufgabe
          </Link>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-stone-200 p-5">
          <div className="inline-flex p-2.5 rounded-lg bg-blue-50 mb-3">
            <Droplets className="w-5 h-5 text-blue-700" />
          </div>
          <p className="text-2xl font-bold text-stone-900">{todaySum} L</p>
          <p className="text-sm font-medium text-stone-600 mt-0.5">Milch heute</p>
          <p className="text-xs text-stone-400 mt-1">
            {diff > 0 ? `+${diff} L zum Vortag` : diff < 0 ? `${diff} L zum Vortag` : 'Keine Vergleichsdaten'}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-stone-200 p-5">
          <div className="inline-flex p-2.5 rounded-lg bg-green-50 mb-3">
            <Beef className="w-5 h-5 text-green-700" />
          </div>
          <p className="text-2xl font-bold text-stone-900">{melkende.length}</p>
          <p className="text-sm font-medium text-stone-600 mt-0.5">Aktiv melkende Kühe</p>
          <p className="text-xs text-stone-400 mt-1">Ø Erwartung {erwarteteTagesleistung} L/Tag</p>
        </div>

        <div className="bg-white rounded-xl border border-stone-200 p-5">
          <div className={`inline-flex p-2.5 rounded-lg mb-3 ${inBehandlung.length > 0 ? 'bg-red-50' : 'bg-stone-50'}`}>
            <Stethoscope className={`w-5 h-5 ${inBehandlung.length > 0 ? 'text-red-600' : 'text-stone-500'}`} />
          </div>
          <p className="text-2xl font-bold text-stone-900">{inBehandlung.length}</p>
          <p className="text-sm font-medium text-stone-600 mt-0.5">In Behandlung</p>
          <p className="text-xs text-stone-400 mt-1">{gesund.length} Kühe gesund</p>
        </div>

        <div className="bg-white rounded-xl border border-stone-200 p-5">
          <div className="inline-flex p-2.5 rounded-lg bg-amber-50 mb-3">
            <Activity className="w-5 h-5 text-amber-700" />
          </div>
          <p className="text-2xl font-bold text-stone-900">{routineFortschritt}%</p>
          <p className="text-sm font-medium text-stone-600 mt-0.5">Tagesroutine</p>
          <p className="text-xs text-stone-400 mt-1">{routineErledigt}/{routine.length} Aufgaben erledigt</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Tagesroutine */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-stone-200">
          <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-stone-900">Tagesablauf im Stall</h2>
              <p className="text-xs text-stone-400 mt-0.5">Morgens · Mittags · Abends</p>
            </div>
            <div className="text-right">
              <div className="h-2 w-32 bg-stone-100 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 transition-all" style={{ width: `${routineFortschritt}%` }} />
              </div>
            </div>
          </div>
          <div className="p-6 space-y-5">
            {slots.map((slot) => {
              const items = routine.filter((r) => r.slot === slot)
              const Icon = slotIcon[slot]
              return (
                <div key={slot}>
                  <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-md border text-xs font-semibold mb-2 ${slotColor[slot]}`}>
                    <Icon className="w-3.5 h-3.5" />
                    {slot}
                  </div>
                  <div className="space-y-1.5">
                    {items.map((r) => (
                      <label
                        key={r.id}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer hover:bg-stone-50 transition-colors ${
                          r.erledigt ? 'opacity-60' : ''
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={r.erledigt}
                          onChange={() => toggleRoutine(r.id)}
                          className="w-4 h-4 rounded border-stone-300 text-green-700 focus:ring-green-600"
                        />
                        <span className="text-xs font-mono text-stone-400 tabular-nums">{r.uhrzeit}</span>
                        <span className={`text-sm ${r.erledigt ? 'line-through text-stone-400' : 'text-stone-800'}`}>
                          {r.aufgabe}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Melkprotokoll heute */}
          <div className="bg-white rounded-xl border border-stone-200 p-5">
            <div className="flex items-center gap-2 mb-3">
              <Droplets className="w-4 h-4 text-blue-600" />
              <h2 className="font-semibold text-stone-900 text-sm">Melkprotokoll heute</h2>
            </div>
            <div className="space-y-3">
              <label className="block">
                <span className="text-xs text-stone-500 flex items-center gap-1.5">
                  <Sun className="w-3 h-3 text-amber-500" />
                  Morgenmelkzeit (L)
                </span>
                <input
                  type="number"
                  min={0}
                  value={today.morgens}
                  onChange={(e) => logMorning(parseInt(e.target.value) || 0)}
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-green-100 focus:border-green-500"
                />
              </label>
              <label className="block">
                <span className="text-xs text-stone-500 flex items-center gap-1.5">
                  <Sunset className="w-3 h-3 text-indigo-500" />
                  Abendmelkzeit (L)
                </span>
                <input
                  type="number"
                  min={0}
                  value={today.abends}
                  onChange={(e) => logEvening(parseInt(e.target.value) || 0)}
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-green-100 focus:border-green-500"
                />
              </label>
              <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-sm">
                <span className="text-stone-500">Tagessumme</span>
                <span className="font-bold text-blue-700">{todaySum} L</span>
              </div>
              <Link href="/milch" className="block text-xs text-green-700 hover:text-green-800">
                Volle Milchstatistik →
              </Link>
            </div>
          </div>

          {/* In Behandlung */}
          {inBehandlung.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <h2 className="font-semibold text-red-800 text-sm">In Behandlung</h2>
              </div>
              <div className="space-y-2">
                {inBehandlung.map((k) => (
                  <div key={k.nr} className="text-sm">
                    <p className="font-medium text-red-900">
                      Nr. {String(k.nr).padStart(2, '0')} · {k.name}
                    </p>
                    {k.notiz && <p className="text-xs text-red-700 mt-0.5">{k.notiz}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Stallwache */}
          <Link
            href="/stallwache"
            className={`block rounded-xl border p-5 hover:shadow-md transition-all ${
              stallwacheOnline
                ? 'bg-green-700 border-green-700 text-white'
                : 'bg-stone-100 border-stone-200 text-stone-700'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <Eye className="w-4 h-4" />
              <h2 className="font-semibold text-sm flex-1">Stallwache</h2>
              {stallwacheOnline ? (
                <span className="inline-flex items-center gap-1 text-[10px] bg-green-500 px-1.5 py-0.5 rounded-full font-semibold">
                  <Wifi className="w-2.5 h-2.5" /> LIVE
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] bg-stone-300 text-stone-700 px-1.5 py-0.5 rounded-full font-semibold">
                  <WifiOff className="w-2.5 h-2.5" /> OFFLINE
                </span>
              )}
            </div>
            {stallwacheOnline ? (
              <>
                <p className={`text-xs ${stallwacheOnline ? 'text-green-100' : 'text-stone-500'} mb-2`}>
                  {stallwacheConfig.cameraName} · {stallwacheStatus.fps.toFixed(1)} FPS
                </p>
                {stallwacheLetzte && (
                  <p className={`text-xs ${stallwacheOnline ? 'text-green-200' : 'text-stone-500'} truncate`}>
                    Letzt. Erkennung: {relativeTime(stallwacheLetzte.zeitstempel)}
                  </p>
                )}
                {stallwacheUnbestaetigt > 0 && (
                  <p className="text-xs mt-2 inline-flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded-full">
                    <AlertTriangle className="w-3 h-3" />
                    {stallwacheUnbestaetigt} unbestätigt
                  </p>
                )}
              </>
            ) : (
              <p className="text-xs text-stone-500">KI-Kalbungswache deaktiviert</p>
            )}
          </Link>

          {/* Weide aktuell */}
          {aktiveWeiden.length > 0 && (
            <div className="bg-white rounded-xl border border-stone-200 p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-stone-900 text-sm flex items-center gap-2">
                  <Trees className="w-4 h-4 text-green-600" /> Auf der Weide
                </h2>
                <Link href="/weide" className="text-xs text-green-700 hover:text-green-800 font-medium">
                  Alle →
                </Link>
              </div>
              <p className="text-xs text-stone-500 mb-2">
                {tiereAufWeide} Tiere auf {aktiveWeiden.length} {aktiveWeiden.length === 1 ? 'Koppel' : 'Koppeln'}
              </p>
              <div className="space-y-1.5 text-sm">
                {aktiveWeiden.map((w) => (
                  <div key={w.id} className="flex items-center justify-between text-xs">
                    <span className="text-stone-700 font-medium truncate">{w.name}</span>
                    <span className="text-stone-400 ml-2 shrink-0">
                      {w.herdeAnzahl} · {w.hektar} ha
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Herde-Status kompakt */}
          <div className="bg-white rounded-xl border border-stone-200 p-5">
            <h2 className="font-semibold text-stone-900 text-sm mb-3">Herdenstatus</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-stone-500">Gesund & melkend</span>
                <span className="font-semibold text-green-700">{gesund.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Trächtig</span>
                <span className="font-semibold text-blue-700">{traechtig.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Trockengestellt</span>
                <span className="font-semibold text-stone-600">{trockengestellt.length}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-stone-100">
                <span className="text-stone-500">In Behandlung</span>
                <span className={`font-semibold ${inBehandlung.length > 0 ? 'text-red-700' : 'text-stone-600'}`}>
                  {inBehandlung.length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Untere Reihe: Kalbungen + Aufgaben */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-stone-200">
          <div className="px-5 py-4 border-b border-stone-100 flex items-center gap-2">
            <Baby className="w-4 h-4 text-pink-600" />
            <h2 className="font-semibold text-stone-900">Anstehende Kalbungen</h2>
          </div>
          {naechsteKalbungen.length === 0 ? (
            <p className="px-5 py-6 text-sm text-stone-400">Keine Kalbungen geplant.</p>
          ) : (
            <div className="divide-y divide-stone-50">
              {naechsteKalbungen.map((k) => {
                const akut = k.daysUntil <= 14
                return (
                  <div key={k.nr} className="px-5 py-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium text-stone-900 text-sm">
                        Nr. {String(k.nr).padStart(2, '0')} · {k.name}
                      </p>
                      <p className="text-xs text-stone-400 mt-0.5">{formatDate(k.kalbungVoraussichtlich!)}</p>
                    </div>
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-medium whitespace-nowrap ${
                        akut ? 'bg-pink-100 text-pink-800' : 'bg-stone-100 text-stone-600'
                      }`}
                    >
                      in {k.daysUntil} {k.daysUntil === 1 ? 'Tag' : 'Tagen'}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-stone-200">
          <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <h2 className="font-semibold text-stone-900">Offene Stallaufgaben</h2>
            </div>
            <Link href="/aufgaben" className="text-xs text-green-700 hover:text-green-800 font-medium">
              Alle →
            </Link>
          </div>
          {offeneStallaufgaben.length === 0 ? (
            <p className="px-5 py-6 text-sm text-stone-400">Keine offenen Stallaufgaben.</p>
          ) : (
            <div className="divide-y divide-stone-50">
              {offeneStallaufgaben.slice(0, 6).map((a) => (
                <div key={a.id} className="px-5 py-3 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-stone-900 truncate">{a.titel}</p>
                    <p className="text-xs text-stone-400 mt-0.5">
                      {a.faellig} · {a.verantwortlich}
                    </p>
                  </div>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${
                      a.prioritaet === 'Hoch'
                        ? 'bg-red-100 text-red-800'
                        : a.prioritaet === 'Mittel'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-stone-100 text-stone-600'
                    }`}
                  >
                    {a.prioritaet}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
