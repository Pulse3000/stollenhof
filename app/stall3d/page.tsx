'use client'

import { useState } from 'react'
import {
  Beef,
  Boxes,
  AlertTriangle,
  CheckCircle2,
  RotateCcw,
} from 'lucide-react'
import { usePersistedState } from '@/lib/use-persisted-state'
import {
  STORAGE_KEYS,
  initialKuehe,
  daysUntil,
  formatDate,
  type Kuh,
  type KuhStatus,
} from '@/lib/data'

const statusStyle: Record<KuhStatus, { badge: string; dot: string; box: string }> = {
  Gesund: { badge: 'bg-green-100 text-green-800 border-green-200', dot: 'bg-green-500', box: 'bg-green-50 border-green-300 hover:border-green-500' },
  'In Behandlung': { badge: 'bg-red-100 text-red-800 border-red-200', dot: 'bg-red-500', box: 'bg-red-50 border-red-300 hover:border-red-500' },
  Trächtig: { badge: 'bg-amber-100 text-amber-800 border-amber-200', dot: 'bg-amber-500', box: 'bg-amber-50 border-amber-300 hover:border-amber-500' },
  Trockengestellt: { badge: 'bg-sky-100 text-sky-800 border-sky-200', dot: 'bg-sky-500', box: 'bg-sky-50 border-sky-300 hover:border-sky-500' },
}

export default function Stall3DPage() {
  const [kuehe] = usePersistedState<Kuh[]>(STORAGE_KEYS.tiere, initialKuehe)
  const [selected, setSelected] = useState<Kuh | null>(null)
  const [tilt, setTilt] = useState(34)

  const rows = 4
  const cols = 9
  const placed = kuehe.slice(0, rows * cols)

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 flex items-center gap-2">
            <Boxes className="w-6 h-6 text-green-700" />
            3D-Stall
          </h1>
          <p className="text-stone-500 mt-0.5 text-sm">
            Interaktiver Stallplan · Liegeboxen nach Tierstatus eingefärbt
          </p>
        </div>
        <button
          onClick={() => setTilt((t) => (t >= 50 ? 10 : t + 10))}
          className="flex items-center gap-2 bg-white border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-600 hover:bg-stone-50"
        >
          <RotateCcw className="w-4 h-4" /> Perspektive
        </button>
      </div>

      {/* Legende */}
      <div className="flex items-center gap-4 text-xs flex-wrap">
        {(['Gesund', 'Trächtig', 'In Behandlung', 'Trockengestellt'] as KuhStatus[]).map((s) => (
          <span key={s} className="inline-flex items-center gap-1.5 text-stone-600">
            <span className={`w-3 h-3 rounded ${statusStyle[s].dot}`} />
            {s} ({kuehe.filter((k) => k.status === s).length})
          </span>
        ))}
        <span className="text-stone-400 ml-auto">
          {placed.length} Boxen belegt · Klick für Details
        </span>
      </div>

      {/* Pseudo-3D Stallplan */}
      <div className="bg-gradient-to-b from-stone-100 to-stone-200 rounded-2xl border border-stone-300 p-8 overflow-x-auto">
        <div
          className="mx-auto transition-transform duration-500"
          style={{
            transform: `perspective(1100px) rotateX(${tilt}deg)`,
            transformStyle: 'preserve-3d',
            width: 'fit-content',
          }}
        >
          <div className="mb-3 h-6 rounded bg-amber-800/80 text-amber-50 text-[10px] flex items-center justify-center tracking-widest uppercase shadow-md">
            Futtertisch
          </div>

          <div className="space-y-2">
            {Array.from({ length: rows }).map((_, r) => (
              <div key={r} className="flex gap-2 justify-center">
                {Array.from({ length: cols }).map((_, c) => {
                  const kuh = placed[r * cols + c]
                  if (!kuh) {
                    return (
                      <div
                        key={c}
                        className="w-12 h-12 rounded-lg border-2 border-dashed border-stone-300 bg-white/40"
                      />
                    )
                  }
                  const st = statusStyle[kuh.status]
                  const isSel = selected?.nr === kuh.nr
                  return (
                    <button
                      key={c}
                      onClick={() => setSelected(kuh)}
                      title={`${kuh.name} (Nr. ${kuh.nr})`}
                      className={`w-12 h-12 rounded-lg border-2 flex flex-col items-center justify-center transition-all shadow-sm ${st.box} ${isSel ? 'ring-2 ring-green-600 scale-110 z-10' : ''}`}
                      style={{ transform: 'translateZ(8px)' }}
                    >
                      <Beef className="w-4 h-4 text-stone-700" />
                      <span className="text-[9px] font-bold text-stone-700 leading-none mt-0.5">
                        {kuh.nr}
                      </span>
                    </button>
                  )
                })}
              </div>
            ))}
          </div>

          <div className="mt-3 h-5 rounded bg-stone-400/60 text-stone-700 text-[10px] flex items-center justify-center tracking-widest uppercase shadow">
            Laufgang
          </div>
        </div>
      </div>

      {/* Detail-Panel */}
      {selected ? (
        <div className="bg-white rounded-xl border border-stone-200 p-5">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${statusStyle[selected.status].badge}`}>
                <Beef className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-stone-900">
                  Nr. {String(selected.nr).padStart(2, '0')} · {selected.name}
                </h3>
                <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-full border mt-1 ${statusStyle[selected.status].badge}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${statusStyle[selected.status].dot}`} />
                  {selected.status}
                </span>
              </div>
            </div>
            <button
              onClick={() => setSelected(null)}
              className="text-stone-400 hover:text-stone-700 text-sm"
            >
              schließen
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
            <Field label="Rasse" value={selected.rasse} />
            <Field label="Alter" value={`${selected.alter} Jahre`} />
            <Field label="Laktation" value={`${selected.laktation}.`} />
            <Field label="Milch/Tag" value={selected.milchTagesleistung > 0 ? `${selected.milchTagesleistung} l` : '–'} />
            <Field label="Letzte Untersuchung" value={formatDate(selected.letzteUntersuchung)} />
            {selected.kalbungVoraussichtlich && (
              <Field label="Kalbung erwartet" value={`${formatDate(selected.kalbungVoraussichtlich)} (in ${daysUntil(selected.kalbungVoraussichtlich)} T.)`} />
            )}
          </div>
          {selected.notiz && (
            <div className="mt-4 flex items-start gap-2 bg-stone-50 rounded-lg p-3 text-sm text-stone-600">
              {selected.status === 'In Behandlung' ? (
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
              )}
              <p>{selected.notiz}</p>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-stone-200 p-6 text-center text-sm text-stone-400">
          Wähle eine Box im Stallplan, um Details zur Kuh zu sehen.
        </div>
      )}
    </div>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-stone-400">{label}</p>
      <p className="font-medium text-stone-800 mt-0.5">{value}</p>
    </div>
  )
}
