'use client'

import { useState } from 'react'
import { Beef, Bird, AlertCircle, CheckCircle, Activity } from 'lucide-react'

type Kuh = {
  nr: number
  name: string
  alter: number
  rasse: string
  status: 'Gesund' | 'In Behandlung' | 'Trächtig' | 'Trockengestellt'
  laktation: number
  letzteUntersuchung: string
}

const kuehe: Kuh[] = [
  { nr: 1, name: 'Alma', alter: 6, rasse: 'Fleckvieh', status: 'Gesund', laktation: 4, letzteUntersuchung: '12.04.2026' },
  { nr: 2, name: 'Berta', alter: 4, rasse: 'Fleckvieh', status: 'Trächtig', laktation: 2, letzteUntersuchung: '01.05.2026' },
  { nr: 3, name: 'Clara', alter: 7, rasse: 'Fleckvieh', status: 'Gesund', laktation: 5, letzteUntersuchung: '15.04.2026' },
  { nr: 4, name: 'Dora', alter: 5, rasse: 'Fleckvieh', status: 'Gesund', laktation: 3, letzteUntersuchung: '10.04.2026' },
  { nr: 5, name: 'Ella', alter: 3, rasse: 'Fleckvieh', status: 'Gesund', laktation: 1, letzteUntersuchung: '20.04.2026' },
  { nr: 6, name: 'Flora', alter: 8, rasse: 'Fleckvieh', status: 'Trockengestellt', laktation: 6, letzteUntersuchung: '05.04.2026' },
  { nr: 7, name: 'Greta', alter: 5, rasse: 'Fleckvieh', status: 'Gesund', laktation: 3, letzteUntersuchung: '18.04.2026' },
  { nr: 8, name: 'Hanna', alter: 4, rasse: 'Fleckvieh', status: 'Gesund', laktation: 2, letzteUntersuchung: '22.04.2026' },
  { nr: 9, name: 'Ida', alter: 6, rasse: 'Fleckvieh', status: 'Trächtig', laktation: 4, letzteUntersuchung: '02.05.2026' },
  { nr: 10, name: 'Julia', alter: 5, rasse: 'Fleckvieh', status: 'Gesund', laktation: 3, letzteUntersuchung: '25.04.2026' },
  { nr: 11, name: 'Klara', alter: 7, rasse: 'Fleckvieh', status: 'Gesund', laktation: 5, letzteUntersuchung: '14.04.2026' },
  { nr: 12, name: 'Lisa', alter: 3, rasse: 'Fleckvieh', status: 'Gesund', laktation: 1, letzteUntersuchung: '28.04.2026' },
  { nr: 13, name: 'Maria', alter: 6, rasse: 'Fleckvieh', status: 'Gesund', laktation: 4, letzteUntersuchung: '09.04.2026' },
  { nr: 14, name: 'Nora', alter: 4, rasse: 'Fleckvieh', status: 'In Behandlung', laktation: 2, letzteUntersuchung: '03.05.2026' },
  { nr: 15, name: 'Olga', alter: 8, rasse: 'Fleckvieh', status: 'Gesund', laktation: 6, letzteUntersuchung: '07.04.2026' },
  { nr: 16, name: 'Paula', alter: 5, rasse: 'Fleckvieh', status: 'Gesund', laktation: 3, letzteUntersuchung: '19.04.2026' },
  { nr: 17, name: 'Rosa', alter: 4, rasse: 'Fleckvieh', status: 'Trächtig', laktation: 2, letzteUntersuchung: '30.04.2026' },
  { nr: 18, name: 'Sabine', alter: 6, rasse: 'Fleckvieh', status: 'Gesund', laktation: 4, letzteUntersuchung: '11.04.2026' },
  { nr: 19, name: 'Tina', alter: 3, rasse: 'Fleckvieh', status: 'Gesund', laktation: 1, letzteUntersuchung: '24.04.2026' },
  { nr: 20, name: 'Ursula', alter: 7, rasse: 'Fleckvieh', status: 'Gesund', laktation: 5, letzteUntersuchung: '16.04.2026' },
  { nr: 21, name: 'Vera', alter: 5, rasse: 'Fleckvieh', status: 'Gesund', laktation: 3, letzteUntersuchung: '21.04.2026' },
  { nr: 22, name: 'Wanda', alter: 4, rasse: 'Fleckvieh', status: 'Gesund', laktation: 2, letzteUntersuchung: '26.04.2026' },
  { nr: 23, name: 'Xenia', alter: 6, rasse: 'Fleckvieh', status: 'Trockengestellt', laktation: 4, letzteUntersuchung: '08.04.2026' },
  { nr: 24, name: 'Yvonne', alter: 5, rasse: 'Fleckvieh', status: 'Gesund', laktation: 3, letzteUntersuchung: '17.04.2026' },
  { nr: 25, name: 'Zelda', alter: 3, rasse: 'Fleckvieh', status: 'Gesund', laktation: 1, letzteUntersuchung: '29.04.2026' },
  { nr: 26, name: 'Anna', alter: 7, rasse: 'Fleckvieh', status: 'Gesund', laktation: 5, letzteUntersuchung: '13.04.2026' },
  { nr: 27, name: 'Britta', alter: 4, rasse: 'Fleckvieh', status: 'Gesund', laktation: 2, letzteUntersuchung: '23.04.2026' },
  { nr: 28, name: 'Claudia', alter: 6, rasse: 'Fleckvieh', status: 'Gesund', laktation: 4, letzteUntersuchung: '06.04.2026' },
  { nr: 29, name: 'Diana', alter: 5, rasse: 'Fleckvieh', status: 'Trächtig', laktation: 3, letzteUntersuchung: '01.05.2026' },
  { nr: 30, name: 'Eva', alter: 8, rasse: 'Fleckvieh', status: 'Gesund', laktation: 6, letzteUntersuchung: '04.04.2026' },
  { nr: 31, name: 'Frieda', alter: 4, rasse: 'Fleckvieh', status: 'Gesund', laktation: 2, letzteUntersuchung: '27.04.2026' },
  { nr: 32, name: 'Gerda', alter: 6, rasse: 'Fleckvieh', status: 'Gesund', laktation: 4, letzteUntersuchung: '10.04.2026' },
  { nr: 33, name: 'Helga', alter: 3, rasse: 'Fleckvieh', status: 'Gesund', laktation: 1, letzteUntersuchung: '22.04.2026' },
  { nr: 34, name: 'Inge', alter: 5, rasse: 'Fleckvieh', status: 'Gesund', laktation: 3, letzteUntersuchung: '18.04.2026' },
  { nr: 35, name: 'Jana', alter: 7, rasse: 'Fleckvieh', status: 'Gesund', laktation: 5, letzteUntersuchung: '15.04.2026' },
]

const statusConfig: Record<Kuh['status'], { color: string; icon: typeof CheckCircle }> = {
  Gesund: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
  Trächtig: { color: 'bg-blue-100 text-blue-800', icon: Activity },
  'In Behandlung': { color: 'bg-red-100 text-red-800', icon: AlertCircle },
  Trockengestellt: { color: 'bg-stone-100 text-stone-600', icon: Activity },
}

export default function TierePage() {
  const [filter, setFilter] = useState<Kuh['status'] | 'Alle'>('Alle')

  const filtered = filter === 'Alle' ? kuehe : kuehe.filter((k) => k.status === filter)

  const counts = {
    Gesund: kuehe.filter((k) => k.status === 'Gesund').length,
    Trächtig: kuehe.filter((k) => k.status === 'Trächtig').length,
    'In Behandlung': kuehe.filter((k) => k.status === 'In Behandlung').length,
    Trockengestellt: kuehe.filter((k) => k.status === 'Trockengestellt').length,
  }

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Tiere</h1>
        <p className="text-stone-500 mt-0.5 text-sm">35 Milchkühe (Fleckvieh) · 12 Hühner · Demeter-Betrieb</p>
      </div>

      {/* Herd summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {(Object.entries(counts) as [Kuh['status'], number][]).map(([status, count]) => {
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
                <th className="text-left px-4 py-3 font-semibold text-stone-600">Letzte Untersuchung</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {filtered.map((k) => {
                const cfg = statusConfig[k.status]
                return (
                  <tr key={k.nr} className="hover:bg-stone-50 transition-colors">
                    <td className="px-5 py-3 text-stone-400 font-mono text-xs">{String(k.nr).padStart(2, '0')}</td>
                    <td className="px-4 py-3 font-medium text-stone-900">{k.name}</td>
                    <td className="px-4 py-3 text-stone-600">{k.alter} Jahre</td>
                    <td className="px-4 py-3 text-stone-600">{k.laktation}. Laktation</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${cfg.color}`}>{k.status}</span>
                    </td>
                    <td className="px-4 py-3 text-stone-500">{k.letzteUntersuchung}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

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
