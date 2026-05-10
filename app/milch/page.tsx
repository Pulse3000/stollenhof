'use client'

import { Droplets, TrendingUp, Award, Sun, Sunset, Pencil, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { usePersistedState } from '@/lib/use-persisted-state'
import { STORAGE_KEYS, initialMelkungen, formatDate, TODAY_ISO, type Melkung } from '@/lib/data'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

const monatsdaten = [
  { monat: 'Januar 2026', kg: 16100, qualitaet: 'A', fett: 4.1, eiweiss: 3.5, zellen: 102 },
  { monat: 'Februar 2026', kg: 16820, qualitaet: 'A', fett: 4.2, eiweiss: 3.6, zellen: 95 },
  { monat: 'März 2026', kg: 17490, qualitaet: 'A', fett: 4.0, eiweiss: 3.5, zellen: 88 },
  { monat: 'April 2026', kg: 18240, qualitaet: 'A', fett: 4.3, eiweiss: 3.7, zellen: 91 },
]

const lieferungen = [
  { datum: '30.04.2026', menge: '4.560 kg', molkerei: 'Molkerei Schrozberg', qualitaet: 'Demeter A', auszahlung: '1.687,20 €' },
  { datum: '15.04.2026', menge: '4.490 kg', molkerei: 'Molkerei Schrozberg', qualitaet: 'Demeter A', auszahlung: '1.661,30 €' },
  { datum: '31.03.2026', menge: '4.380 kg', molkerei: 'Molkerei Schrozberg', qualitaet: 'Demeter A', auszahlung: '1.620,60 €' },
  { datum: '15.03.2026', menge: '4.330 kg', molkerei: 'Molkerei Schrozberg', qualitaet: 'Demeter A', auszahlung: '1.602,10 €' },
  { datum: '28.02.2026', menge: '4.210 kg', molkerei: 'Molkerei Schrozberg', qualitaet: 'Demeter A', auszahlung: '1.557,70 €' },
  { datum: '15.02.2026', menge: '4.170 kg', molkerei: 'Molkerei Schrozberg', qualitaet: 'Demeter A', auszahlung: '1.542,90 €' },
]

const maxKg = Math.max(...monatsdaten.map((m) => m.kg))

const emptyForm = (): Melkung => ({ datum: TODAY_ISO, morgens: 0, abends: 0 })

export default function MilchPage() {
  const [melkungen, setMelkungen] = usePersistedState<Melkung[]>(STORAGE_KEYS.melkungen, initialMelkungen)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editDate, setEditDate] = useState<string | null>(null)
  const [form, setForm] = useState<Melkung>(emptyForm())

  const sortedMelkungen = [...melkungen].sort((a, b) => b.datum.localeCompare(a.datum))
  const maxLiter = Math.max(1, ...sortedMelkungen.slice(0, 14).map((m) => m.morgens + m.abends))
  const last7 = sortedMelkungen.slice(0, 7)
  const woche = last7.reduce((s, m) => s + m.morgens + m.abends, 0)
  const tagesschnitt = last7.length > 0 ? Math.round(woche / last7.length) : 0

  const letzterMonat = monatsdaten[monatsdaten.length - 1]
  const vorletzterMonat = monatsdaten[monatsdaten.length - 2]
  const diff = letzterMonat.kg - vorletzterMonat.kg
  const diffPct = ((diff / vorletzterMonat.kg) * 100).toFixed(1)
  const gesamt2026 = monatsdaten.reduce((s, m) => s + m.kg, 0)

  function openNew() {
    setEditDate(null)
    setForm(emptyForm())
    setDialogOpen(true)
  }

  function openEdit(m: Melkung) {
    setEditDate(m.datum)
    setForm({ ...m })
    setDialogOpen(true)
  }

  function save() {
    if (!form.datum) return
    setMelkungen((prev) => {
      const exists = prev.some((m) => m.datum === form.datum)
      if (exists) return prev.map((m) => (m.datum === form.datum ? { ...form } : m))
      return [...prev, { ...form }]
    })
    setDialogOpen(false)
  }

  function remove(datum: string) {
    setMelkungen((prev) => prev.filter((m) => m.datum !== datum))
  }

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Milchdaten</h1>
          <p className="text-stone-500 mt-0.5 text-sm">Lieferung an Molkerei Schrozberg · Demeter-Qualität</p>
        </div>
        <Button onClick={openNew} className="bg-green-700 hover:bg-green-800 text-white gap-2">
          + Tag erfassen
        </Button>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-stone-200 p-5">
          <div className="flex items-center gap-2 mb-2">
            <Droplets className="w-4 h-4 text-blue-500" />
            <span className="text-xs text-stone-500">7-Tage-Schnitt</span>
          </div>
          <p className="text-2xl font-bold text-stone-900">{tagesschnitt} L/Tag</p>
          <p className="text-xs text-stone-400 mt-1">{woche} L in {last7.length} Tagen</p>
        </div>

        <div className="bg-white rounded-xl border border-stone-200 p-5">
          <div className="flex items-center gap-2 mb-2">
            <Droplets className="w-4 h-4 text-blue-500" />
            <span className="text-xs text-stone-500">April 2026</span>
          </div>
          <p className="text-2xl font-bold text-stone-900">{letzterMonat.kg.toLocaleString('de-DE')} kg</p>
          <div className="flex items-center gap-1 mt-1">
            <TrendingUp className="w-3.5 h-3.5 text-green-600" />
            <span className="text-xs text-green-600">+{diffPct} % zum Vormonat</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-stone-200 p-5">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <span className="text-xs text-stone-500">Gesamt 2026</span>
          </div>
          <p className="text-2xl font-bold text-stone-900">{gesamt2026.toLocaleString('de-DE')} kg</p>
          <p className="text-xs text-stone-400 mt-1">Jan – Apr 2026</p>
        </div>

        <div className="bg-white rounded-xl border border-stone-200 p-5">
          <div className="flex items-center gap-2 mb-2">
            <Award className="w-4 h-4 text-amber-500" />
            <span className="text-xs text-stone-500">Qualitätsstufe</span>
          </div>
          <p className="text-2xl font-bold text-stone-900">Demeter A</p>
          <p className="text-xs text-stone-400 mt-1">Höchste Qualität</p>
        </div>
      </div>

      {/* Tageslog 14 Tage */}
      <div className="bg-white rounded-xl border border-stone-200">
        <div className="px-6 py-4 border-b border-stone-100">
          <h2 className="font-semibold text-stone-900">Melkprotokoll – letzte Tage</h2>
          <p className="text-xs text-stone-400 mt-0.5">
            Eingetragen im Stallbuch · Morgens (gelb) · Abends (blau)
          </p>
        </div>
        <div className="p-6">
          <div className="flex items-end gap-1.5 h-40">
            {sortedMelkungen
              .slice(0, 14)
              .reverse()
              .map((m) => {
                const summe = m.morgens + m.abends
                const morgensPct = (m.morgens / maxLiter) * 100
                const abendsPct = (m.abends / maxLiter) * 100
                const isToday = m.datum === TODAY_ISO
                const tag = m.datum.slice(8, 10)
                return (
                  <div key={m.datum} className="flex-1 flex flex-col items-center gap-1 min-w-0" title={`${formatDate(m.datum)}: ${summe} L`}>
                    <span className="text-[10px] font-medium text-stone-700">{summe || '–'}</span>
                    <div className="w-full flex flex-col-reverse h-32 rounded-t-md overflow-hidden bg-stone-50">
                      <div className="bg-amber-300" style={{ height: `${morgensPct}%` }} />
                      <div className="bg-blue-400" style={{ height: `${abendsPct}%` }} />
                    </div>
                    <span className={`text-[10px] ${isToday ? 'text-green-700 font-bold' : 'text-stone-400'}`}>
                      {tag}.
                    </span>
                  </div>
                )
              })}
          </div>
          <div className="flex gap-4 mt-4 text-xs text-stone-500">
            <span className="inline-flex items-center gap-1.5">
              <Sun className="w-3 h-3 text-amber-500" />
              <span className="w-2.5 h-2.5 rounded bg-amber-300" />
              Morgens
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Sunset className="w-3 h-3 text-blue-500" />
              <span className="w-2.5 h-2.5 rounded bg-blue-400" />
              Abends
            </span>
          </div>
        </div>
      </div>

      {/* Tageslog Tabelle */}
      <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-stone-100">
          <h2 className="font-semibold text-stone-900">Tagesprotokoll</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-100 bg-stone-50">
                <th className="text-left px-5 py-3 font-semibold text-stone-600">Datum</th>
                <th className="text-right px-4 py-3 font-semibold text-stone-600">Morgens</th>
                <th className="text-right px-4 py-3 font-semibold text-stone-600">Abends</th>
                <th className="text-right px-4 py-3 font-semibold text-stone-600">Tagessumme</th>
                <th className="px-2 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {sortedMelkungen.slice(0, 14).map((m) => {
                const summe = m.morgens + m.abends
                const isToday = m.datum === TODAY_ISO
                return (
                  <tr key={m.datum} className={`hover:bg-stone-50 ${isToday ? 'bg-green-50/30' : ''}`}>
                    <td className="px-5 py-2.5">
                      <span className={isToday ? 'font-semibold text-green-800' : 'text-stone-700'}>
                        {formatDate(m.datum)}
                      </span>
                      {isToday && <span className="ml-2 text-[10px] text-green-700 font-medium">Heute</span>}
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-stone-700">
                      {m.morgens > 0 ? `${m.morgens} L` : <span className="text-stone-300">–</span>}
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-stone-700">
                      {m.abends > 0 ? `${m.abends} L` : <span className="text-stone-300">–</span>}
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums font-semibold text-blue-700">{summe} L</td>
                    <td className="px-2 py-2.5 text-right">
                      <div className="flex gap-0.5 justify-end">
                        <button
                          onClick={() => openEdit(m)}
                          className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => remove(m.datum)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-stone-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Monthly bar chart */}
      <div className="bg-white rounded-xl border border-stone-200 p-6">
        <h2 className="font-semibold text-stone-900 mb-5">Monatsproduktion 2026 (Molkereiabrechnung)</h2>
        <div className="flex items-end gap-6 h-40">
          {monatsdaten.map((m, i) => {
            const heightPct = (m.kg / maxKg) * 100
            const isLast = i === monatsdaten.length - 1
            return (
              <div key={m.monat} className="flex-1 flex flex-col items-center gap-2">
                <span className="text-xs font-medium text-stone-700">{m.kg.toLocaleString('de-DE')} kg</span>
                <div
                  className={`w-full rounded-t-md transition-all ${isLast ? 'bg-green-500' : 'bg-green-200'}`}
                  style={{ height: `${heightPct}%` }}
                />
                <span className="text-xs text-stone-400 whitespace-nowrap">{m.monat.split(' ')[0]}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Quality table */}
      <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-stone-100">
          <h2 className="font-semibold text-stone-900">Qualitätswerte</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-100 bg-stone-50">
                <th className="text-left px-5 py-3 font-semibold text-stone-600">Monat</th>
                <th className="text-left px-4 py-3 font-semibold text-stone-600">Menge</th>
                <th className="text-left px-4 py-3 font-semibold text-stone-600">Fett %</th>
                <th className="text-left px-4 py-3 font-semibold text-stone-600">Eiweiß %</th>
                <th className="text-left px-4 py-3 font-semibold text-stone-600">Zellzahl (tsd.)</th>
                <th className="text-left px-4 py-3 font-semibold text-stone-600">Qualität</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {[...monatsdaten].reverse().map((m) => (
                <tr key={m.monat} className="hover:bg-stone-50">
                  <td className="px-5 py-3 font-medium text-stone-900">{m.monat}</td>
                  <td className="px-4 py-3 text-stone-700">{m.kg.toLocaleString('de-DE')} kg</td>
                  <td className="px-4 py-3 text-stone-700">{m.fett.toFixed(1)}</td>
                  <td className="px-4 py-3 text-stone-700">{m.eiweiss.toFixed(1)}</td>
                  <td className="px-4 py-3 text-stone-700">{m.zellen}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2.5 py-1 rounded-full bg-green-100 text-green-800 font-medium">
                      Demeter {m.qualitaet}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent deliveries */}
      <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-stone-100">
          <h2 className="font-semibold text-stone-900">Letzte Lieferungen an Molkerei</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-100 bg-stone-50">
                <th className="text-left px-5 py-3 font-semibold text-stone-600">Datum</th>
                <th className="text-left px-4 py-3 font-semibold text-stone-600">Menge</th>
                <th className="text-left px-4 py-3 font-semibold text-stone-600">Molkerei</th>
                <th className="text-left px-4 py-3 font-semibold text-stone-600">Qualität</th>
                <th className="text-left px-4 py-3 font-semibold text-stone-600">Auszahlung</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {lieferungen.map((l) => (
                <tr key={l.datum} className="hover:bg-stone-50">
                  <td className="px-5 py-3 text-stone-700">{l.datum}</td>
                  <td className="px-4 py-3 font-medium text-stone-900">{l.menge}</td>
                  <td className="px-4 py-3 text-stone-600">{l.molkerei}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2.5 py-1 rounded-full bg-green-100 text-green-800 font-medium">
                      {l.qualitaet}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium text-green-700">{l.auszahlung}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit-Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editDate ? 'Tag bearbeiten' : 'Melkung erfassen'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label>Datum *</Label>
              <Input
                type="date"
                className="mt-1"
                disabled={editDate !== null}
                value={form.datum}
                onChange={(e) => setForm({ ...form, datum: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Morgens (L)</Label>
                <Input
                  type="number"
                  min={0}
                  className="mt-1"
                  value={form.morgens}
                  onChange={(e) => setForm({ ...form, morgens: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label>Abends (L)</Label>
                <Input
                  type="number"
                  min={0}
                  className="mt-1"
                  value={form.abends}
                  onChange={(e) => setForm({ ...form, abends: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>
            <div className="bg-blue-50 rounded-lg p-3 text-sm">
              <span className="text-stone-600">Tagessumme: </span>
              <span className="font-bold text-blue-700">{form.morgens + form.abends} L</span>
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Abbrechen
              </Button>
              <Button onClick={save} className="bg-green-700 hover:bg-green-800 text-white">
                Speichern
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
