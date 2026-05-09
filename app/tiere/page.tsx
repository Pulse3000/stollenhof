'use client'

import { useState } from 'react'
import { Beef, Bird, AlertCircle, CheckCircle, Activity, Baby, Droplets } from 'lucide-react'
import { usePersistedState } from '@/lib/use-persisted-state'
import { STORAGE_KEYS, initialKuehe, formatDate, daysUntil, type Kuh, type KuhStatus } from '@/lib/data'

const statusConfig: Record<KuhStatus, { color: string; icon: typeof CheckCircle }> = {
  Gesund: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
  Trächtig: { color: 'bg-blue-100 text-blue-800', icon: Activity },
  'In Behandlung': { color: 'bg-red-100 text-red-800', icon: AlertCircle },
  Trockengestellt: { color: 'bg-stone-100 text-stone-600', icon: Activity },
}

export default function TierePage() {
  const [kuehe] = usePersistedState<Kuh[]>(STORAGE_KEYS.tiere, initialKuehe)
  const [filter, setFilter] = useState<KuhStatus | 'Alle'>('Alle')

  const filtered = filter === 'Alle' ? kuehe : kuehe.filter((k) => k.status === filter)

  const counts = {
    Gesund: kuehe.filter((k) => k.status === 'Gesund').length,
    Trächtig: kuehe.filter((k) => k.status === 'Trächtig').length,
    'In Behandlung': kuehe.filter((k) => k.status === 'In Behandlung').length,
    Trockengestellt: kuehe.filter((k) => k.status === 'Trockengestellt').length,
  }

  const melkende = kuehe.filter((k) => k.milchTagesleistung > 0)
  const erwartet = melkende.reduce((s, k) => s + k.milchTagesleistung, 0)
  const durchschnitt = melkende.length > 0 ? Math.round((erwartet / melkende.length) * 10) / 10 : 0

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Tiere</h1>
        <p className="text-stone-500 mt-0.5 text-sm">{kuehe.length} Milchkühe (Fleckvieh) · 12 Hühner · Demeter-Betrieb</p>
      </div>

      {/* Herd summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {(Object.entries(counts) as [KuhStatus, number][]).map(([status, count]) => {
          const cfg = statusConfig[status]
          return (
            <button
              key={status}
              onClick={() => setFilter(filter === status ? 'Alle' : status)}
              className={`bg-white rounded-xl border p-4 text-left transition-all hover:shadow-md ${filter === status ? 'border-green-500 ring-2 ring-green-100' : 'border-stone-200'}`}
            >
              <p className="text-2xl font-bold text-stone-900">{count}</p>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cfg.color}`}>{status}</span>
            </button>
          )
        })}
      </div>

      {/* Milchleistung Übersicht */}
      <div className="bg-white rounded-xl border border-stone-200 p-5">
        <div className="flex items-center gap-2 mb-3">
          <Droplets className="w-4 h-4 text-blue-600" />
          <h2 className="font-semibold text-stone-900 text-sm">Aktuelle Tagesleistung der Herde</h2>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-2xl font-bold text-stone-900">{melkende.length}</p>
            <p className="text-xs text-stone-500">Aktiv melkende Kühe</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-blue-700">{erwartet} L</p>
            <p className="text-xs text-stone-500">Erwartete Tagesleistung</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-700">{durchschnitt} L</p>
            <p className="text-xs text-stone-500">Ø pro Kuh und Tag</p>
          </div>
        </div>
      </div>

      {/* Cattle table */}
      <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <Beef className="w-4 h-4 text-amber-600" />
            <h2 className="font-semibold text-stone-900">Milchkühe</h2>
            <span className="text-sm text-stone-400">({filtered.length})</span>
          </div>
          {filter !== 'Alle' && (
            <button onClick={() => setFilter('Alle')} className="text-xs text-green-700 hover:text-green-800">
              Filter aufheben ×
            </button>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-100 bg-stone-50">
                <th className="text-left px-5 py-3 font-semibold text-stone-600">Nr.</th>
                <th className="text-left px-4 py-3 font-semibold text-stone-600">Name</th>
                <th className="text-left px-4 py-3 font-semibold text-stone-600">Alter</th>
                <th className="text-left px-4 py-3 font-semibold text-stone-600">Laktation</th>
                <th className="text-left px-4 py-3 font-semibold text-stone-600">Status</th>
                <th className="text-right px-4 py-3 font-semibold text-stone-600">Milch/Tag</th>
                <th className="text-left px-4 py-3 font-semibold text-stone-600">Kalbung</th>
                <th className="text-left px-4 py-3 font-semibold text-stone-600">Letzte Untersuchung</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {filtered.map((k) => {
                const cfg = statusConfig[k.status]
                const tage = k.kalbungVoraussichtlich ? daysUntil(k.kalbungVoraussichtlich) : null
                return (
                  <tr key={k.nr} className="hover:bg-stone-50 transition-colors">
                    <td className="px-5 py-3 text-stone-400 font-mono text-xs">{String(k.nr).padStart(2, '0')}</td>
                    <td className="px-4 py-3 font-medium text-stone-900">{k.name}</td>
                    <td className="px-4 py-3 text-stone-600">{k.alter} J.</td>
                    <td className="px-4 py-3 text-stone-600">{k.laktation}.</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${cfg.color}`}>{k.status}</span>
                    </td>
                    <td className="px-4 py-3 text-right font-medium tabular-nums">
                      {k.milchTagesleistung > 0 ? (
                        <span className="text-blue-700">{k.milchTagesleistung} L</span>
                      ) : (
                        <span className="text-stone-300">–</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-stone-600 text-xs">
                      {k.kalbungVoraussichtlich ? (
                        <span className="inline-flex items-center gap-1">
                          <Baby className="w-3 h-3 text-pink-500" />
                          {formatDate(k.kalbungVoraussichtlich)}
                          {tage !== null && tage >= 0 && (
                            <span className="text-stone-400">({tage} T.)</span>
                          )}
                        </span>
                      ) : (
                        <span className="text-stone-300">–</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-stone-500 text-xs">{formatDate(k.letzteUntersuchung)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Notizen für Kühe mit Behandlung/Notiz */}
      {kuehe.some((k) => k.notiz) && (
        <div className="bg-white rounded-xl border border-stone-200 p-5">
          <h2 className="font-semibold text-stone-900 mb-3">Anmerkungen zu einzelnen Tieren</h2>
          <div className="space-y-2 text-sm">
            {kuehe
              .filter((k) => k.notiz)
              .map((k) => (
                <div key={k.nr} className="flex items-start gap-3 py-1.5">
                  <span className="font-mono text-xs text-stone-400 mt-0.5 shrink-0">
                    Nr. {String(k.nr).padStart(2, '0')}
                  </span>
                  <span className="font-medium text-stone-700 shrink-0">{k.name}</span>
                  <span className="text-stone-500">{k.notiz}</span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Chickens */}
      <div className="bg-white rounded-xl border border-stone-200 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Bird className="w-4 h-4 text-amber-500" />
          <h2 className="font-semibold text-stone-900">Hühner</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-amber-50 rounded-lg p-4">
            <p className="text-2xl font-bold text-amber-800">12</p>
            <p className="text-sm text-amber-700">Hennen gesamt</p>
          </div>
          <div className="bg-amber-50 rounded-lg p-4">
            <p className="text-2xl font-bold text-amber-800">~10</p>
            <p className="text-sm text-amber-700">Eier pro Tag</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <p className="text-2xl font-bold text-green-800">Gesund</p>
            <p className="text-sm text-green-700">Herdengesundheit</p>
          </div>
          <div className="bg-stone-50 rounded-lg p-4">
            <p className="text-2xl font-bold text-stone-700">Freiland</p>
            <p className="text-sm text-stone-500">Haltungsform</p>
          </div>
        </div>
      </div>
    </div>
  )
}
