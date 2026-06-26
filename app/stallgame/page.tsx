'use client'

import { useEffect, useMemo, useState } from 'react'
import { Gamepad2, RotateCcw, Trophy, Timer, MousePointer, Sparkles } from 'lucide-react'
import { usePersistedState } from '@/lib/use-persisted-state'
import { STORAGE_KEYS, initialKuehe, type Kuh } from '@/lib/data'

const BEST_KEY = 'stollenhof-stallgame-best'
const PAIRS = 8 // 16 Karten = 4×4

type Card = {
  id: number      // eindeutige Karten-ID (0..15)
  pairId: number  // Index in der ausgewählten Kuh-Liste (0..PAIRS-1)
  kuh: Kuh
  flipped: boolean
  matched: boolean
}

type BestScore = { moves: number; seconds: number } | null

function shuffleSeed(seed: number) {
  let s = seed
  return () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
}

function buildDeck(kuehe: Kuh[], seed: number): Card[] {
  const rand = shuffleSeed(seed)
  const pool = [...kuehe].sort(() => rand() - 0.5).slice(0, PAIRS)
  const doubled = pool.flatMap((k, i) => [
    { id: i * 2, pairId: i, kuh: k },
    { id: i * 2 + 1, pairId: i, kuh: k },
  ])
  const mixed = doubled.sort(() => rand() - 0.5)
  return mixed.map((c) => ({ ...c, flipped: false, matched: false }))
}

const STATUS_EMOJI: Record<string, string> = {
  Gesund: '🐄',
  Trächtig: '🤰',
  'In Behandlung': '💊',
  Trockengestellt: '❄️',
}

const STATUS_BG: Record<string, string> = {
  Gesund: 'from-green-400 to-green-600',
  Trächtig: 'from-amber-400 to-amber-600',
  'In Behandlung': 'from-red-400 to-red-600',
  Trockengestellt: 'from-sky-400 to-sky-600',
}

export default function StallGamePage() {
  const [kuehe] = usePersistedState<Kuh[]>(STORAGE_KEYS.tiere, initialKuehe)
  const [best, setBest] = usePersistedState<BestScore>(BEST_KEY, null)

  const [seed, setSeed] = useState(1)
  const [deck, setDeck] = useState<Card[]>([])
  const [flipped, setFlipped] = useState<number[]>([])
  const [moves, setMoves] = useState(0)
  const [started, setStarted] = useState<number | null>(null)
  const [now, setNow] = useState(0)
  const [won, setWon] = useState(false)
  const [busy, setBusy] = useState(false)

  // Init / Reset
  useEffect(() => {
    setDeck(buildDeck(kuehe, seed))
    setFlipped([])
    setMoves(0)
    setStarted(null)
    setNow(0)
    setWon(false)
    setBusy(false)
  }, [seed, kuehe])

  // Timer
  useEffect(() => {
    if (started === null || won) return
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [started, won])

  const elapsed = started ? Math.floor(((now || Date.now()) - started) / 1000) : 0

  // Win-Check
  useEffect(() => {
    if (deck.length > 0 && deck.every((c) => c.matched) && !won) {
      setWon(true)
      const score = { moves, seconds: elapsed }
      if (!best || moves < best.moves || (moves === best.moves && elapsed < best.seconds)) {
        setBest(score)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deck])

  function flip(id: number) {
    if (busy || won) return
    const card = deck.find((c) => c.id === id)
    if (!card || card.flipped || card.matched) return
    if (started === null) setStarted(Date.now())

    const newFlipped = [...flipped, id]
    setDeck((prev) => prev.map((c) => (c.id === id ? { ...c, flipped: true } : c)))
    setFlipped(newFlipped)

    if (newFlipped.length === 2) {
      setMoves((m) => m + 1)
      const [a, b] = newFlipped
      const cardA = deck.find((c) => c.id === a)!
      const cardB = deck.find((c) => c.id === id)!
      if (cardA.pairId === cardB.pairId) {
        // Match
        setTimeout(() => {
          setDeck((prev) => prev.map((c) => (newFlipped.includes(c.id) ? { ...c, matched: true } : c)))
          setFlipped([])
        }, 400)
      } else {
        // Kein Match
        setBusy(true)
        setTimeout(() => {
          setDeck((prev) => prev.map((c) => (newFlipped.includes(c.id) ? { ...c, flipped: false } : c)))
          setFlipped([])
          setBusy(false)
        }, 900)
      }
    }
  }

  function newGame() {
    setSeed((s) => s + 1)
  }

  const matchedCount = deck.filter((c) => c.matched).length / 2

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 flex items-center gap-2">
            <Gamepad2 className="w-6 h-6 text-green-700" />
            Kuh-Memory
          </h1>
          <p className="text-stone-500 mt-0.5 text-sm">
            Finde die passenden Kuh-Paare · {PAIRS} Paare · {PAIRS * 2} Karten
          </p>
        </div>
        <button
          onClick={newGame}
          className="flex items-center gap-2 bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-800 shadow-sm"
        >
          <RotateCcw className="w-4 h-4" /> Neues Spiel
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Stat icon={<MousePointer className="w-4 h-4" />} label="Züge" value={String(moves)} color="text-stone-700" />
        <Stat icon={<Timer className="w-4 h-4" />} label="Zeit" value={`${elapsed} s`} color="text-blue-700" />
        <Stat icon={<Sparkles className="w-4 h-4" />} label="Paare" value={`${matchedCount} / ${PAIRS}`} color="text-amber-700" />
        <Stat
          icon={<Trophy className="w-4 h-4" />}
          label="Bestzeit"
          value={best ? `${best.moves} · ${best.seconds}s` : '–'}
          color="text-green-700"
        />
      </div>

      {/* Win-Banner */}
      {won && (
        <div className="rounded-xl bg-gradient-to-r from-amber-100 via-green-100 to-amber-100 border border-green-300 p-5 flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-500">
          <Trophy className="w-8 h-8 text-amber-600 animate-bounce" />
          <div className="flex-1">
            <p className="font-bold text-stone-900">Geschafft! Alle Kühe gefunden.</p>
            <p className="text-sm text-stone-600">
              {moves} Züge in {elapsed} Sekunden
              {best?.moves === moves && best?.seconds === elapsed && ' · Neuer Bestwert! 🎉'}
            </p>
          </div>
          <button
            onClick={newGame}
            className="bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-800"
          >
            Nochmal
          </button>
        </div>
      )}

      {/* Spielfeld */}
      <div className="bg-stone-100 rounded-2xl border border-stone-200 p-4 sm:p-6 shadow-inner">
        <div className="grid grid-cols-4 gap-2 sm:gap-3 max-w-2xl mx-auto">
          {deck.map((card) => {
            const show = card.flipped || card.matched
            const bg = STATUS_BG[card.kuh.status] ?? 'from-stone-400 to-stone-600'
            return (
              <button
                key={card.id}
                onClick={() => flip(card.id)}
                disabled={show || busy || won}
                className="aspect-[3/4] relative perspective-1000"
              >
                <div
                  className={`relative w-full h-full transition-transform duration-500`}
                  style={{
                    transformStyle: 'preserve-3d',
                    transform: show ? 'rotateY(180deg)' : 'rotateY(0deg)',
                  }}
                >
                  {/* Rückseite */}
                  <div
                    className="absolute inset-0 rounded-xl bg-gradient-to-br from-green-700 to-green-900 shadow-md flex items-center justify-center border-2 border-green-800/50"
                    style={{ backfaceVisibility: 'hidden' }}
                  >
                    <div className="text-3xl sm:text-4xl">🌾</div>
                  </div>

                  {/* Vorderseite */}
                  <div
                    className={`absolute inset-0 rounded-xl bg-gradient-to-br ${bg} shadow-md overflow-hidden text-white border-2 ${card.matched ? 'border-yellow-300 ring-2 ring-yellow-400 ring-offset-2' : 'border-white/30'}`}
                    style={{
                      backfaceVisibility: 'hidden',
                      transform: 'rotateY(180deg)',
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`/assets/kuh_bilder/${card.kuh.nr}.png`}
                      alt={card.kuh.name}
                      className="absolute inset-0 w-full h-full object-cover"
                      onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                    <div className="absolute top-1 left-1 text-base sm:text-xl drop-shadow">{STATUS_EMOJI[card.kuh.status] ?? '🐄'}</div>
                    <div className="absolute bottom-1 left-1 right-1 text-center">
                      <div className="font-bold text-xs sm:text-sm leading-tight drop-shadow">{card.kuh.name}</div>
                      <div className="text-[10px] opacity-90 drop-shadow">Nr. {String(card.kuh.nr).padStart(2, '0')}</div>
                    </div>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-stone-200 p-4 text-xs text-stone-600">
        <p>
          <strong className="text-stone-800">So geht's:</strong> Decke 2 Karten auf. Stimmen Name &amp; Nummer überein,
          bleiben sie sichtbar. Ziel: alle {PAIRS} Paare mit möglichst wenigen Zügen finden. Deine Kühe stammen aus
          den aktuellen Stammdaten – das Memory ändert sich mit der Herde.
        </p>
      </div>
    </div>
  )
}

function Stat({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode
  label: string
  value: string
  color: string
}) {
  return (
    <div className="bg-white rounded-xl border border-stone-200 p-4">
      <div className={`flex items-center gap-1.5 text-xs ${color}`}>
        {icon}
        <span className="font-medium uppercase tracking-wide">{label}</span>
      </div>
      <p className="text-xl font-bold text-stone-900 mt-1.5">{value}</p>
    </div>
  )
}
