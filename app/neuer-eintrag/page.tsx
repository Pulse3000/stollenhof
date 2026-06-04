'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ClipboardList, CheckCircle2, ArrowLeft, Baby, Activity, Power, Send, AlertTriangle } from 'lucide-react'
import { usePersistedState } from '@/lib/use-persisted-state'
import {
  STORAGE_KEYS,
  initialStallwacheEvents,
  initialKuehe,
  type StallwacheEvent,
  type StallwacheEventTyp,
  type Kuh,
} from '@/lib/data'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const TYPEN: { typ: StallwacheEventTyp; icon: typeof Baby; color: string }[] = [
  { typ: 'Kalbung erkannt', icon: Baby, color: 'border-pink-300 bg-pink-50 text-pink-800' },
  { typ: 'Aktivität', icon: Activity, color: 'border-amber-300 bg-amber-50 text-amber-800' },
  { typ: 'System gestartet', icon: Power, color: 'border-green-300 bg-green-50 text-green-800' },
  { typ: 'System gestoppt', icon: Power, color: 'border-stone-300 bg-stone-50 text-stone-700' },
  { typ: 'Telegram-Alert', icon: Send, color: 'border-blue-300 bg-blue-50 text-blue-800' },
  { typ: 'Fehler', icon: AlertTriangle, color: 'border-red-300 bg-red-50 text-red-800' },
]

export default function NeuerEintragPage() {
  const router = useRouter()
  const [events, setEvents] = usePersistedState<StallwacheEvent[]>(
    STORAGE_KEYS.stallwacheEvents,
    initialStallwacheEvents,
  )
  const [kuehe] = usePersistedState<Kuh[]>(STORAGE_KEYS.tiere, initialKuehe)

  const [zeitstempel, setZeitstempel] = useState(() => new Date().toISOString().slice(0, 16))
  const [typ, setTyp] = useState<StallwacheEventTyp>('Aktivität')
  const [konfidenz, setKonfidenz] = useState<string>('')
  const [kuhNr, setKuhNr] = useState<number>(0)
  const [beschreibung, setBeschreibung] = useState('')
  const [bestaetigt, setBestaetigt] = useState(false)
  const [saved, setSaved] = useState(false)

  const valid = beschreibung.trim() !== '' && zeitstempel !== ''

  function save(addAnother: boolean) {
    if (!valid) return
    const newId = Math.max(0, ...events.map((e) => e.id)) + 1
    const eintrag: StallwacheEvent = {
      id: newId,
      zeitstempel,
      typ,
      konfidenz: konfidenz === '' ? undefined : Math.min(1, Math.max(0, parseFloat(konfidenz))),
      kuhNr: kuhNr === 0 ? undefined : kuhNr,
      beschreibung: beschreibung.trim(),
      bestaetigt,
    }
    setEvents((prev) => [eintrag, ...prev])
    if (addAnother) {
      setSaved(true)
      setBeschreibung('')
      setKonfidenz('')
      setKuhNr(0)
      setBestaetigt(false)
      setZeitstempel(new Date().toISOString().slice(0, 16))
      setTimeout(() => setSaved(false), 2500)
    } else {
      router.push('/stallwache')
    }
  }

  return (
    <div className="p-6 md:p-8 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-green-700" />
            Neuer Eintrag
          </h1>
          <p className="text-stone-500 mt-0.5 text-sm">
            Stallwache-Ereignis manuell erfassen
          </p>
        </div>
        <Link
          href="/stallwache"
          className="text-sm text-stone-500 hover:text-stone-800 flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" /> zur Stallwache
        </Link>
      </div>

      {saved && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center gap-2 text-sm text-green-800">
          <CheckCircle2 className="w-4 h-4" /> Eintrag gespeichert.
        </div>
      )}

      <div className="bg-white rounded-xl border border-stone-200 p-6 space-y-5">
        {/* Typ-Auswahl */}
        <div>
          <Label className="mb-2 block">Ereignistyp</Label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {TYPEN.map(({ typ: t, icon: Icon, color }) => (
              <button
                key={t}
                type="button"
                onClick={() => setTyp(t)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-xs font-medium text-left transition-all ${
                  typ === t ? `${color} ring-2 ring-offset-1 ring-green-600/40` : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-50'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="zeit">Zeitstempel *</Label>
            <Input
              id="zeit"
              type="datetime-local"
              className="mt-1"
              value={zeitstempel}
              onChange={(e) => setZeitstempel(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="konf">Konfidenz (0–1, optional)</Label>
            <Input
              id="konf"
              type="number"
              step="0.01"
              min={0}
              max={1}
              className="mt-1"
              value={konfidenz}
              placeholder="z. B. 0.92"
              onChange={(e) => setKonfidenz(e.target.value)}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="kuh">Verknüpfte Kuh (optional)</Label>
          <select
            id="kuh"
            className="mt-1 w-full px-3 py-2 rounded-lg border border-stone-300 text-sm bg-white"
            value={kuhNr}
            onChange={(e) => setKuhNr(parseInt(e.target.value) || 0)}
          >
            <option value={0}>– keine –</option>
            {kuehe.map((k) => (
              <option key={k.nr} value={k.nr}>
                Nr. {String(k.nr).padStart(2, '0')} · {k.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label htmlFor="besch">Beschreibung *</Label>
          <textarea
            id="besch"
            className="mt-1 w-full px-3 py-2 rounded-lg border border-stone-300 text-sm min-h-[90px] focus:outline-none focus:ring-2 focus:ring-green-600/30"
            value={beschreibung}
            placeholder="Was wurde beobachtet?"
            onChange={(e) => setBeschreibung(e.target.value)}
          />
        </div>

        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={bestaetigt}
            onChange={(e) => setBestaetigt(e.target.checked)}
            className="w-4 h-4 rounded border-stone-300 text-green-700 focus:ring-green-600"
          />
          Bereits bestätigt
        </label>

        <div className="flex gap-2 justify-end pt-2 border-t border-stone-100">
          <Button
            variant="outline"
            onClick={() => save(true)}
            disabled={!valid}
          >
            Speichern & weiter
          </Button>
          <Button
            onClick={() => save(false)}
            disabled={!valid}
            className="bg-green-700 hover:bg-green-800 text-white"
          >
            Speichern
          </Button>
        </div>
      </div>

      <p className="text-xs text-stone-400">
        Neue Einträge erscheinen sofort in der{' '}
        <Link href="/stallwache" className="underline hover:text-stone-600">
          Stallwache
        </Link>{' '}
        und im{' '}
        <Link href="/geburten" className="underline hover:text-stone-600">
          Geburtenkalender
        </Link>
        .
      </p>
    </div>
  )
}
