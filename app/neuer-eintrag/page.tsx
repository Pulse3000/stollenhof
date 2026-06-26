'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Plus, Beef, Bell, CheckCircle2, Sparkles } from 'lucide-react'
import { usePersistedState } from '@/lib/use-persisted-state'
import {
  STORAGE_KEYS,
  initialKuehe,
  initialStallwacheEvents,
  TODAY_ISO,
  type Kuh,
  type KuhStatus,
  type StallwacheEvent,
  type StallwacheEventTyp,
} from '@/lib/data'

type Mode = 'tier' | 'ereignis'

const RASSEN = ['Braunvieh', 'Fleckvieh', 'Allgäuer', 'Holstein', 'Sonstige']
const TIER_STATUS = ['Laktierend', 'Trockengestellt', 'Abkalbebox', 'In Besamung', 'Gesund', 'Krank']

const EVENT_TYPEN: StallwacheEventTyp[] = [
  'Kalbung erkannt',
  'Aktivität',
  'System gestartet',
  'System gestoppt',
  'Telegram-Alert',
  'Fehler',
]

const STATUS_MAP: Record<string, KuhStatus> = {
  Laktierend: 'Gesund',
  Trockengestellt: 'Trockengestellt',
  Abkalbebox: 'Trächtig',
  'In Besamung': 'Gesund',
  Gesund: 'Gesund',
  Krank: 'In Behandlung',
}

export default function NeuerEintragPage() {
  const router = useRouter()
  const [kuehe, setKuehe] = usePersistedState<Kuh[]>(STORAGE_KEYS.tiere, initialKuehe)
  const [events, setEvents] = usePersistedState<StallwacheEvent[]>(
    STORAGE_KEYS.stallwacheEvents,
    initialStallwacheEvents,
  )

  const [mode, setMode] = useState<Mode>('tier')
  const [toast, setToast] = useState('')

  const [tName, setTName] = useState('')
  const [tOhrmarke, setTOhrmarke] = useState('')
  const [tRasse, setTRasse] = useState('Braunvieh')
  const [tGeburt, setTGeburt] = useState('')
  const [tLaktation, setTLaktation] = useState('1')
  const [tStatus, setTStatus] = useState('Laktierend')
  const [tGewicht, setTGewicht] = useState('')
  const [tBemerkung, setTBemerkung] = useState('')

  const [eTyp, setETyp] = useState<StallwacheEventTyp>('Aktivität')
  const [eZeit, setEZeit] = useState(() => new Date().toISOString().slice(0, 16))
  const [eKonfidenz, setEKonfidenz] = useState('')
  const [eKuhNr, setEKuhNr] = useState(0)
  const [eBeschreibung, setEBeschreibung] = useState('')
  const [eBestaetigt, setEBestaetigt] = useState(false)

  const tierValid = tName.trim() !== '' && tOhrmarke.trim() !== ''
  const eventValid = eBeschreibung.trim() !== '' && eZeit !== ''

  function flash(msg: string, redirect: string) {
    setToast(msg)
    setTimeout(() => {
      setToast('')
      router.push(redirect)
    }, 1200)
  }

  function saveTier(e: React.FormEvent) {
    e.preventDefault()
    if (!tierValid) return
    const parsedNr = parseInt(tOhrmarke, 10)
    const usedNrs = new Set(kuehe.map((k) => k.nr))
    const nr =
      !Number.isNaN(parsedNr) && !usedNrs.has(parsedNr)
        ? parsedNr
        : Math.max(0, ...kuehe.map((k) => k.nr)) + 1

    const alter = tGeburt
      ? Math.max(0, Math.floor((new Date(TODAY_ISO).getTime() - new Date(tGeburt).getTime()) / (365.25 * 864e5)))
      : 3
    const status = STATUS_MAP[tStatus] ?? 'Gesund'
    const milch = status === 'Trockengestellt' || tStatus === 'Abkalbebox' ? 0 : 20
    const notizTeile = [
      tBemerkung.trim(),
      tStatus !== STATUS_MAP[tStatus] ? `Status (Erfassung): ${tStatus}` : '',
      tGewicht ? `Gewicht: ${tGewicht} kg` : '',
    ].filter(Boolean)

    const neu: Kuh = {
      nr,
      name: tName.trim(),
      alter,
      rasse: tRasse,
      status,
      laktation: parseInt(tLaktation, 10) || 1,
      letzteUntersuchung: TODAY_ISO,
      milchTagesleistung: milch,
      notiz: notizTeile.join(' · ') || undefined,
    }
    setKuehe((prev) => [neu, ...prev])
    flash(`${neu.name} wurde aufgenommen.`, '/tiere')
  }

  function saveEreignis(e: React.FormEvent) {
    e.preventDefault()
    if (!eventValid) return
    const newId = Math.max(0, ...events.map((ev) => ev.id)) + 1
    const eintrag: StallwacheEvent = {
      id: newId,
      zeitstempel: eZeit,
      typ: eTyp,
      konfidenz: eKonfidenz === '' ? undefined : Math.min(1, Math.max(0, parseFloat(eKonfidenz))),
      kuhNr: eKuhNr === 0 ? undefined : eKuhNr,
      beschreibung: eBeschreibung.trim(),
      bestaetigt: eBestaetigt,
    }
    setEvents((prev) => [eintrag, ...prev])
    flash('Ereignis gespeichert.', '/stallwache')
  }

  return (
    <div className="min-h-screen bg-stone-50 p-6 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-green-700/10 flex items-center justify-center">
          <Plus className="w-5 h-5 text-green-700" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Neuer Eintrag</h1>
          <p className="text-sm text-stone-500">Tier oder Ereignis erfassen und speichern</p>
        </div>
      </div>

      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 rounded-xl border border-green-200 bg-white shadow-lg p-3 px-5 flex items-center gap-2 text-sm text-green-800 animate-in slide-in-from-top-4 fade-in duration-300">
          <CheckCircle2 className="w-5 h-5 text-green-600" />
          <span className="font-medium">{toast}</span>
          <Sparkles className="w-4 h-4 text-amber-500" />
        </div>
      )}

      <div className="flex items-center gap-1 bg-stone-200/60 rounded-xl p-1">
        <button
          onClick={() => setMode('tier')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
            mode === 'tier'
              ? 'bg-white text-stone-900 shadow-sm'
              : 'text-stone-500 hover:text-stone-700'
          }`}
        >
          <Beef className="w-3.5 h-3.5" /> Neues Tier
        </button>
        <button
          onClick={() => setMode('ereignis')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
            mode === 'ereignis'
              ? 'bg-white text-stone-900 shadow-sm'
              : 'text-stone-500 hover:text-stone-700'
          }`}
        >
          <Bell className="w-3.5 h-3.5" /> Neues Ereignis
        </button>
      </div>

      {mode === 'tier' && (
        <form className="space-y-4" onSubmit={saveTier}>
          <div className="rounded-xl bg-white border border-stone-200 shadow-sm">
            <div className="flex flex-col space-y-1.5 p-6 pb-3 border-b border-stone-100 bg-stone-50/30 rounded-t-xl">
              <div className="text-sm font-semibold text-stone-900 flex items-center gap-2">
                <Beef className="w-4 h-4 text-green-700" /> Tier-Stammdaten
              </div>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Name *">
                  <input
                    className={inputCls}
                    required
                    placeholder="z.B. Bella"
                    value={tName}
                    onChange={(e) => setTName(e.target.value)}
                  />
                </Field>
                <Field label="Ohrmarken-Nr. *">
                  <input
                    className={inputCls}
                    required
                    placeholder="z.B. 07"
                    value={tOhrmarke}
                    onChange={(e) => setTOhrmarke(e.target.value)}
                  />
                </Field>
              </div>

              <Field label="Rasse">
                <PillGroup options={RASSEN} value={tRasse} onChange={setTRasse} />
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Geburtsdatum">
                  <input type="date" className={inputCls} value={tGeburt} onChange={(e) => setTGeburt(e.target.value)} />
                </Field>
                <Field label="Laktationsnummer">
                  <input
                    type="number"
                    min={0}
                    max={20}
                    className={inputCls}
                    value={tLaktation}
                    onChange={(e) => setTLaktation(e.target.value)}
                  />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Status">
                  <PillGroup options={TIER_STATUS} value={tStatus} onChange={setTStatus} />
                </Field>
                <Field label="Gewicht (kg)">
                  <input
                    type="number"
                    className={inputCls}
                    placeholder="z.B. 620"
                    value={tGewicht}
                    onChange={(e) => setTGewicht(e.target.value)}
                  />
                </Field>
              </div>

              <Field label="Bemerkung">
                <textarea
                  rows={2}
                  placeholder="Optionale Notiz..."
                  className="w-full rounded-md border border-stone-200 bg-white px-3 py-2 text-sm placeholder:text-stone-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-700/40 resize-none"
                  value={tBemerkung}
                  onChange={(e) => setTBemerkung(e.target.value)}
                />
              </Field>
            </div>
          </div>
          <button
            type="submit"
            disabled={!tierValid}
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 bg-green-700 text-white shadow hover:bg-green-800 h-10 px-4 py-2 w-full"
          >
            Tier speichern
          </button>
        </form>
      )}

      {mode === 'ereignis' && (
        <form className="space-y-4" onSubmit={saveEreignis}>
          <div className="rounded-xl bg-white border border-stone-200 shadow-sm">
            <div className="flex flex-col space-y-1.5 p-6 pb-3 border-b border-stone-100 bg-stone-50/30 rounded-t-xl">
              <div className="text-sm font-semibold text-stone-900 flex items-center gap-2">
                <Bell className="w-4 h-4 text-green-700" /> Stallwache-Ereignis
              </div>
            </div>
            <div className="p-5 space-y-4">
              <Field label="Ereignistyp">
                <PillGroup
                  options={EVENT_TYPEN}
                  value={eTyp}
                  onChange={(v) => setETyp(v as StallwacheEventTyp)}
                />
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Zeitstempel *">
                  <input type="datetime-local" className={inputCls} value={eZeit} onChange={(e) => setEZeit(e.target.value)} />
                </Field>
                <Field label="Konfidenz (0–1, optional)">
                  <input
                    type="number"
                    step="0.01"
                    min={0}
                    max={1}
                    className={inputCls}
                    placeholder="z.B. 0.92"
                    value={eKonfidenz}
                    onChange={(e) => setEKonfidenz(e.target.value)}
                  />
                </Field>
              </div>

              <Field label="Verknüpfte Kuh (optional)">
                <select
                  className={inputCls}
                  value={eKuhNr}
                  onChange={(e) => setEKuhNr(parseInt(e.target.value) || 0)}
                >
                  <option value={0}>– keine –</option>
                  {kuehe.map((k) => (
                    <option key={k.nr} value={k.nr}>
                      Nr. {String(k.nr).padStart(2, '0')} · {k.name}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Beschreibung *">
                <textarea
                  rows={2}
                  placeholder="Was wurde beobachtet?"
                  className="w-full rounded-md border border-stone-200 bg-white px-3 py-2 text-sm placeholder:text-stone-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-700/40 resize-none"
                  value={eBeschreibung}
                  onChange={(e) => setEBeschreibung(e.target.value)}
                />
              </Field>

              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={eBestaetigt}
                  onChange={(e) => setEBestaetigt(e.target.checked)}
                  className="w-4 h-4 rounded border-stone-300 text-green-700 focus:ring-green-700"
                />
                Bereits bestätigt
              </label>
            </div>
          </div>
          <button
            type="submit"
            disabled={!eventValid}
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 bg-green-700 text-white shadow hover:bg-green-800 h-10 px-4 py-2 w-full"
          >
            Ereignis speichern
          </button>
        </form>
      )}

      <p className="text-xs text-stone-500">
        Neue Einträge erscheinen sofort unter{' '}
        <Link href="/tiere" className="underline hover:text-stone-900">Tiere</Link>{' '}bzw. in der{' '}
        <Link href="/stallwache" className="underline hover:text-stone-900">Stallwache</Link>.
      </p>
    </div>
  )
}

const inputCls =
  'flex h-9 w-full rounded-md border border-stone-200 bg-white px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-stone-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-green-700/50 disabled:cursor-not-allowed disabled:opacity-50'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-stone-500 uppercase tracking-wide block">{label}</label>
      {children}
    </div>
  )
}

function PillGroup({
  options,
  value,
  onChange,
}: {
  options: string[]
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
            value === opt
              ? 'bg-green-700 text-white border-green-700 shadow-sm'
              : 'bg-white text-stone-700 border-stone-200 hover:border-green-700/50'
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  )
}
