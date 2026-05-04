'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, CalendarDays, PartyPopper } from 'lucide-react'
import Link from 'next/link'

const BUCHUNGEN = [
  { gast: 'Familie Müller', anreise: '2026-05-10', abreise: '2026-05-17', color: 'bg-green-200 text-green-900 border-green-300' },
  { gast: 'H. & Fr. Bauer', anreise: '2026-05-18', abreise: '2026-05-22', color: 'bg-green-200 text-green-900 border-green-300' },
  { gast: 'Familie Weber', anreise: '2026-05-24', abreise: '2026-05-31', color: 'bg-amber-100 text-amber-900 border-amber-300' },
  { gast: 'Familie Schmitt', anreise: '2026-06-02', abreise: '2026-06-09', color: 'bg-green-200 text-green-900 border-green-300' },
  { gast: 'Frau Hoffmann', anreise: '2026-06-14', abreise: '2026-06-21', color: 'bg-amber-100 text-amber-900 border-amber-300' },
  { gast: 'Familie Fischer', anreise: '2026-07-05', abreise: '2026-07-12', color: 'bg-green-200 text-green-900 border-green-300' },
]

const EVENTS = [
  { titel: 'Pizzabacken', datum: '2026-05-17', color: 'bg-purple-100 text-purple-800 border-purple-200' },
  { titel: 'Hofführung Schule', datum: '2026-05-25', color: 'bg-purple-100 text-purple-800 border-purple-200' },
  { titel: 'Demeter-Besichtigung', datum: '2026-06-14', color: 'bg-purple-100 text-purple-800 border-purple-200' },
  { titel: 'Käseworkshop', datum: '2026-06-28', color: 'bg-purple-100 text-purple-800 border-purple-200' },
  { titel: 'Sommerführung', datum: '2026-07-12', color: 'bg-purple-100 text-purple-800 border-purple-200' },
]

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function firstDayOfMonth(year: number, month: number) {
  const d = new Date(year, month, 1).getDay()
  return d === 0 ? 6 : d - 1 // Mon=0
}

function isoDate(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function isInRange(iso: string, start: string, end: string) {
  return iso >= start && iso < end
}

const MONTH_NAMES = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember']
const DAY_NAMES = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']

export default function KalenderPage() {
  const today = new Date()
  const [year, setYear] = useState(2026)
  const [month, setMonth] = useState(4) // 0-indexed, 4 = Mai

  function prev() {
    if (month === 0) { setMonth(11); setYear(y => y - 1) }
    else setMonth(m => m - 1)
  }
  function next() {
    if (month === 11) { setMonth(0); setYear(y => y + 1) }
    else setMonth(m => m + 1)
  }

  const totalDays = daysInMonth(year, month)
  const firstDay = firstDayOfMonth(year, month)

  // Build 6-week grid
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: totalDays }, (_, i) => i + 1),
  ]
  while (cells.length % 7 !== 0) cells.push(null)

  function getBookingsForDay(day: number) {
    const iso = isoDate(year, month, day)
    return BUCHUNGEN.filter((b) => isInRange(iso, b.anreise, b.abreise))
  }

  function getEventsForDay(day: number) {
    const iso = isoDate(year, month, day)
    return EVENTS.filter((e) => e.datum === iso)
  }

  function isToday(day: number) {
    return year === today.getFullYear() && month === today.getMonth() && day === today.getDate()
  }

  function isCheckIn(day: number) {
    const iso = isoDate(year, month, day)
    return BUCHUNGEN.some((b) => b.anreise === iso)
  }

  function isCheckOut(day: number) {
    const iso = isoDate(year, month, day)
    return BUCHUNGEN.some((b) => b.abreise === iso)
  }

  // Occupancy for month
  let occupiedDays = 0
  for (let d = 1; d <= totalDays; d++) {
    if (getBookingsForDay(d).length > 0) occupiedDays++
  }
  const occupancyPct = Math.round((occupiedDays / totalDays) * 100)

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Hofkalender</h1>
          <p className="text-stone-500 mt-0.5 text-sm">Buchungen & Veranstaltungen auf einen Blick</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={prev} className="p-2 rounded-lg border border-stone-200 hover:bg-stone-100 transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-semibold text-stone-900 min-w-[160px] text-center">
            {MONTH_NAMES[month]} {year}
          </span>
          <button onClick={next} className="p-2 rounded-lg border border-stone-200 hover:bg-stone-100 transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Occupancy bar */}
      <div className="bg-white rounded-xl border border-stone-200 p-4">
        <div className="flex items-center justify-between mb-2 text-sm">
          <span className="font-medium text-stone-700">Auslastung Siloturm – {MONTH_NAMES[month]}</span>
          <span className="font-bold text-green-700">{occupancyPct} % ({occupiedDays}/{totalDays} Tage)</span>
        </div>
        <div className="h-2.5 rounded-full bg-stone-100 overflow-hidden">
          <div
            className="h-full rounded-full bg-green-500 transition-all"
            style={{ width: `${occupancyPct}%` }}
          />
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-green-300 border border-green-400" />
          <span className="text-stone-500">Buchung bestätigt</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-amber-200 border border-amber-300" />
          <span className="text-stone-500">Buchung ausstehend</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-purple-200 border border-purple-300" />
          <span className="text-stone-500">Veranstaltung</span>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-stone-100">
          {DAY_NAMES.map((d) => (
            <div key={d} className={`py-2 text-center text-xs font-semibold ${d === 'Sa' || d === 'So' ? 'text-stone-400' : 'text-stone-500'}`}>
              {d}
            </div>
          ))}
        </div>

        {/* Weeks */}
        <div className="grid grid-cols-7">
          {cells.map((day, idx) => {
            if (day === null) {
              return <div key={`empty-${idx}`} className="min-h-[80px] border-b border-r border-stone-50 bg-stone-50/50" />
            }
            const bookings = getBookingsForDay(day)
            const events = getEventsForDay(day)
            const checkIn = isCheckIn(day)
            const checkOut = isCheckOut(day)
            const isWeekend = (idx % 7) >= 5

            return (
              <div
                key={day}
                className={`min-h-[80px] border-b border-r border-stone-100 p-1.5 ${isWeekend ? 'bg-stone-50/50' : ''}`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium mb-1
                  ${isToday(day) ? 'bg-green-700 text-white' : isWeekend ? 'text-stone-400' : 'text-stone-600'}`}>
                  {day}
                </div>

                {bookings.map((b, i) => (
                  <div key={i} className={`text-[10px] rounded px-1 py-0.5 mb-0.5 border truncate font-medium ${b.color}`}>
                    {checkIn && b.anreise === isoDate(year, month, day) ? '→ ' : ''}
                    {checkOut && b.abreise === isoDate(year, month, day) ? '← ' : ''}
                    {b.gast}
                  </div>
                ))}

                {events.map((e, i) => (
                  <div key={i} className={`text-[10px] rounded px-1 py-0.5 border truncate ${e.color}`}>
                    ★ {e.titel}
                  </div>
                ))}
              </div>
            )
          })}
        </div>
      </div>

      {/* Month summary */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-stone-200 p-5">
          <div className="flex items-center gap-2 mb-3">
            <CalendarDays className="w-4 h-4 text-green-600" />
            <h2 className="font-semibold text-stone-900">Buchungen im {MONTH_NAMES[month]}</h2>
          </div>
          {BUCHUNGEN.filter((b) => {
            const mStart = isoDate(year, month, 1)
            const mEnd = isoDate(year, month, totalDays)
            return b.anreise <= mEnd && b.abreise >= mStart
          }).length === 0 ? (
            <p className="text-sm text-stone-400">Keine Buchungen in diesem Monat.</p>
          ) : (
            <div className="space-y-2">
              {BUCHUNGEN.filter((b) => {
                const mStart = isoDate(year, month, 1)
                const mEnd = isoDate(year, month, totalDays)
                return b.anreise <= mEnd && b.abreise >= mStart
              }).map((b, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="font-medium text-stone-800">{b.gast}</span>
                  <span className="text-stone-400 text-xs">
                    {b.anreise.split('-').reverse().join('.')} – {b.abreise.split('-').reverse().join('.')}
                  </span>
                </div>
              ))}
            </div>
          )}
          <Link href="/buchungen" className="block mt-3 text-xs text-green-700 hover:text-green-800">
            Alle Buchungen verwalten →
          </Link>
        </div>

        <div className="bg-white rounded-xl border border-stone-200 p-5">
          <div className="flex items-center gap-2 mb-3">
            <PartyPopper className="w-4 h-4 text-purple-600" />
            <h2 className="font-semibold text-stone-900">Events im {MONTH_NAMES[month]}</h2>
          </div>
          {EVENTS.filter((e) => {
            const mStart = isoDate(year, month, 1)
            const mEnd = isoDate(year, month + 1, 0)
            return e.datum >= mStart && e.datum <= `${year}-${String(month + 1).padStart(2, '0')}-${String(daysInMonth(year, month)).padStart(2, '0')}`
          }).length === 0 ? (
            <p className="text-sm text-stone-400">Keine Veranstaltungen in diesem Monat.</p>
          ) : (
            <div className="space-y-2">
              {EVENTS.filter((e) =>
                e.datum >= isoDate(year, month, 1) &&
                e.datum <= isoDate(year, month, totalDays)
              ).map((e, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="font-medium text-stone-800">{e.titel}</span>
                  <span className="text-stone-400 text-xs">{e.datum.split('-').reverse().join('.')}</span>
                </div>
              ))}
            </div>
          )}
          <Link href="/veranstaltungen" className="block mt-3 text-xs text-purple-700 hover:text-purple-800">
            Alle Veranstaltungen verwalten →
          </Link>
        </div>
      </div>
    </div>
  )
}
