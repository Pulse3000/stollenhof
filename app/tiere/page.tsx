'use client'

import { useState } from 'react'
import {
  Beef,
  Bird,
  AlertCircle,
  CheckCircle,
  Activity,
  Baby,
  Droplets,
  Pencil,
  Stethoscope,
  Plus,
  CalendarCheck,
  Trash2,
} from 'lucide-react'
import { usePersistedState } from '@/lib/use-persisted-state'
import {
  STORAGE_KEYS,
  initialKuehe,
  initialTierarztJournal,
  formatDate,
  daysUntil,
  TODAY_ISO,
  type Kuh,
  type KuhStatus,
  type TierarztEintrag,
} from '@/lib/data'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

const statusConfig: Record<KuhStatus, { color: string; icon: typeof CheckCircle }> = {
  Gesund: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
  Trächtig: { color: 'bg-blue-100 text-blue-800', icon: Activity },
  'In Behandlung': { color: 'bg-red-100 text-red-800', icon: AlertCircle },
  Trockengestellt: { color: 'bg-stone-100 text-stone-600', icon: Activity },
}

type Tab = 'herde' | 'tierarzt'

const emptyVet = (kuhNr = 0, kuhName = ''): Omit<TierarztEintrag, 'id'> => ({
  datum: TODAY_ISO,
  kuhNr,
  kuhName,
  diagnose: '',
  behandlung: '',
  tierarzt: 'Dr. Baum',
  folgetermin: '',
  abgeschlossen: false,
})

export default function TierePage() {
  const [kuehe, setKuehe] = usePersistedState<Kuh[]>(STORAGE_KEYS.tiere, initialKuehe)
  const [journal, setJournal] = usePersistedState<TierarztEintrag[]>(
    STORAGE_KEYS.tierarztJournal,
    initialTierarztJournal,
  )
  const [tab, setTab] = useState<Tab>('herde')
  const [filter, setFilter] = useState<KuhStatus | 'Alle'>('Alle')

  const [editKuh, setEditKuh] = useState<Kuh | null>(null)
  const [vetEditId, setVetEditId] = useState<number | null>(null)
  const [vetForm, setVetForm] = useState<Omit<TierarztEintrag, 'id'>>(emptyVet())
  const [vetOpen, setVetOpen] = useState(false)

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

  function saveKuh() {
    if (!editKuh) return
    setKuehe((prev) => prev.map((k) => (k.nr === editKuh.nr ? editKuh : k)))
    setEditKuh(null)
  }

  function openVetNew(kuh?: Kuh) {
    setVetEditId(null)
    setVetForm(emptyVet(kuh?.nr ?? 0, kuh?.name ?? ''))
    setVetOpen(true)
  }

  function openVetEdit(e: TierarztEintrag) {
    setVetEditId(e.id)
    setVetForm({
      datum: e.datum,
      kuhNr: e.kuhNr,
      kuhName: e.kuhName,
      diagnose: e.diagnose,
      behandlung: e.behandlung,
      tierarzt: e.tierarzt,
      folgetermin: e.folgetermin ?? '',
      abgeschlossen: e.abgeschlossen,
    })
    setVetOpen(true)
  }

  function saveVet() {
    if (!vetForm.kuhName || !vetForm.diagnose) return
    if (vetEditId !== null) {
      setJournal((prev) =>
        prev.map((j) => (j.id === vetEditId ? { ...vetForm, id: vetEditId, folgetermin: vetForm.folgetermin || undefined } : j)),
      )
    } else {
      const newId = Math.max(0, ...journal.map((j) => j.id)) + 1
      setJournal((prev) => [{ ...vetForm, id: newId, folgetermin: vetForm.folgetermin || undefined }, ...prev])
    }
    setVetOpen(false)
  }

  function removeVet(id: number) {
    setJournal((prev) => prev.filter((j) => j.id !== id))
  }

  function toggleVetDone(id: number) {
    setJournal((prev) => prev.map((j) => (j.id === id ? { ...j, abgeschlossen: !j.abgeschlossen } : j)))
  }

  // Sortierte Journale: offene zuerst, dann nach Datum absteigend
  const sortedJournal = [...journal].sort((a, b) => {
    if (a.abgeschlossen !== b.abgeschlossen) return a.abgeschlossen ? 1 : -1
    return b.datum.localeCompare(a.datum)
  })
  const offeneFolgetermine = journal.filter(
    (j) => !j.abgeschlossen && j.folgetermin && j.folgetermin >= TODAY_ISO,
  ).length

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Tiere</h1>
          <p className="text-stone-500 mt-0.5 text-sm">
            {kuehe.length} Milchkühe (Fleckvieh) · 12 Hühner · Demeter-Betrieb
          </p>
        </div>
        {tab === 'tierarzt' && (
          <Button onClick={() => openVetNew()} className="bg-green-700 hover:bg-green-800 text-white gap-2">
            <Plus className="w-4 h-4" /> Eintrag
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-stone-200 flex gap-1">
        <button
          onClick={() => setTab('herde')}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
            tab === 'herde'
              ? 'border-green-700 text-green-800'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <Beef className="w-4 h-4 inline mr-1.5" />
          Herde
        </button>
        <button
          onClick={() => setTab('tierarzt')}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
            tab === 'tierarzt'
              ? 'border-green-700 text-green-800'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <Stethoscope className="w-4 h-4 inline mr-1.5" />
          Tierarzt-Journal
          {offeneFolgetermine > 0 && (
            <span className="ml-1.5 inline-flex items-center justify-center text-[10px] bg-red-100 text-red-700 rounded-full w-5 h-5 font-semibold">
              {offeneFolgetermine}
            </span>
          )}
        </button>
      </div>

      {tab === 'herde' && (
        <>
          {/* Herd summary */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {(Object.entries(counts) as [KuhStatus, number][]).map(([status, count]) => {
              const cfg = statusConfig[status]
              return (
                <button
                  key={status}
                  onClick={() => setFilter(filter === status ? 'Alle' : status)}
                  className={`bg-white rounded-xl border p-4 text-left transition-all hover:shadow-md ${
                    filter === status ? 'border-green-500 ring-2 ring-green-100' : 'border-stone-200'
                  }`}
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
                    <th className="text-left px-4 py-3 font-semibold text-stone-600">Lakt.</th>
                    <th className="text-left px-4 py-3 font-semibold text-stone-600">Status</th>
                    <th className="text-right px-4 py-3 font-semibold text-stone-600">Milch/Tag</th>
                    <th className="text-left px-4 py-3 font-semibold text-stone-600">Kalbung</th>
                    <th className="text-left px-4 py-3 font-semibold text-stone-600">Letzte Untersuchung</th>
                    <th className="px-2 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-50">
                  {filtered.map((k) => {
                    const cfg = statusConfig[k.status]
                    const tage = k.kalbungVoraussichtlich ? daysUntil(k.kalbungVoraussichtlich) : null
                    return (
                      <tr key={k.nr} className="hover:bg-stone-50 transition-colors">
                        <td className="px-5 py-3 text-stone-400 font-mono text-xs">
                          {String(k.nr).padStart(2, '0')}
                        </td>
                        <td className="px-4 py-3 font-medium text-stone-900">{k.name}</td>
                        <td className="px-4 py-3 text-stone-600">{k.alter} J.</td>
                        <td className="px-4 py-3 text-stone-600">{k.laktation}.</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${cfg.color}`}>
                            {k.status}
                          </span>
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
                        <td className="px-2 py-3 text-right">
                          <div className="flex justify-end gap-0.5">
                            <button
                              onClick={() => openVetNew(k)}
                              title="Tierarzt-Eintrag anlegen"
                              className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors"
                            >
                              <Stethoscope className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setEditKuh(k)}
                              title="Bearbeiten"
                              className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors"
                            >
                              <Pencil className="w-3.5 h-3.5" />
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

          {/* Notizen */}
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
        </>
      )}

      {tab === 'tierarzt' && (
        <div className="space-y-6">
          {/* Folgetermin-Hinweis */}
          {offeneFolgetermine > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
              <CalendarCheck className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-900">
                  {offeneFolgetermine} {offeneFolgetermine === 1 ? 'offener Folgetermin' : 'offene Folgetermine'}
                </p>
                <p className="text-sm text-amber-700 mt-0.5">Behandlungen mit ausstehender Nachkontrolle.</p>
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-stone-100 flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-stone-500" />
              <h2 className="font-semibold text-stone-900">Behandlungs-Journal</h2>
              <span className="text-sm text-stone-400">({journal.length})</span>
            </div>
            {sortedJournal.length === 0 ? (
              <p className="px-5 py-8 text-sm text-stone-400 text-center">Noch keine Einträge.</p>
            ) : (
              <div className="divide-y divide-stone-50">
                {sortedJournal.map((j) => {
                  const folgeAkut = j.folgetermin && !j.abgeschlossen && daysUntil(j.folgetermin) <= 3
                  return (
                    <div key={j.id} className={`px-5 py-4 ${j.abgeschlossen ? 'opacity-60' : ''}`}>
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                            <span className="text-xs font-mono text-stone-400">
                              Nr. {String(j.kuhNr).padStart(2, '0')}
                            </span>
                            <span className="font-semibold text-stone-900">{j.kuhName}</span>
                            <span className="text-xs text-stone-400">·</span>
                            <span className="text-xs text-stone-500">{formatDate(j.datum)}</span>
                            <span className="text-xs text-stone-400">·</span>
                            <span className="text-xs text-stone-500">{j.tierarzt}</span>
                            {j.abgeschlossen && (
                              <span className="text-xs px-1.5 py-0.5 rounded-full bg-green-100 text-green-800 font-medium">
                                Abgeschlossen
                              </span>
                            )}
                          </div>
                          <p className="text-sm font-medium text-stone-800 mb-1">{j.diagnose}</p>
                          <p className="text-sm text-stone-600">{j.behandlung}</p>
                          {j.folgetermin && (
                            <p
                              className={`text-xs mt-2 inline-flex items-center gap-1 ${
                                folgeAkut ? 'text-amber-700 font-medium' : 'text-stone-500'
                              }`}
                            >
                              <CalendarCheck className="w-3 h-3" />
                              Folgetermin: {formatDate(j.folgetermin)}
                              {folgeAkut && ` (in ${daysUntil(j.folgetermin)} Tagen)`}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <button
                            onClick={() => toggleVetDone(j.id)}
                            title={j.abgeschlossen ? 'Wieder öffnen' : 'Als abgeschlossen markieren'}
                            className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-green-600 transition-colors"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => openVetEdit(j)}
                            className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => removeVet(j.id)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-stone-400 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit-Dialog Kuh */}
      <Dialog open={editKuh !== null} onOpenChange={(o) => !o && setEditKuh(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editKuh && `Nr. ${String(editKuh.nr).padStart(2, '0')} · ${editKuh.name}`}
            </DialogTitle>
          </DialogHeader>
          {editKuh && (
            <div className="space-y-4 mt-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Status</Label>
                  <select
                    className="mt-1 w-full px-3 py-2 rounded-lg border border-stone-300 text-sm bg-white"
                    value={editKuh.status}
                    onChange={(e) => setEditKuh({ ...editKuh, status: e.target.value as KuhStatus })}
                  >
                    {(['Gesund', 'Trächtig', 'In Behandlung', 'Trockengestellt'] as KuhStatus[]).map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>Laktation</Label>
                  <Input
                    type="number"
                    min={0}
                    className="mt-1"
                    value={editKuh.laktation}
                    onChange={(e) => setEditKuh({ ...editKuh, laktation: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label>Milchleistung (L/Tag)</Label>
                  <Input
                    type="number"
                    min={0}
                    className="mt-1"
                    value={editKuh.milchTagesleistung}
                    onChange={(e) =>
                      setEditKuh({ ...editKuh, milchTagesleistung: parseInt(e.target.value) || 0 })
                    }
                  />
                </div>
                <div>
                  <Label>Letzte Untersuchung</Label>
                  <Input
                    type="date"
                    className="mt-1"
                    value={editKuh.letzteUntersuchung}
                    onChange={(e) => setEditKuh({ ...editKuh, letzteUntersuchung: e.target.value })}
                  />
                </div>
                <div className="col-span-2">
                  <Label>Voraussichtl. Kalbung</Label>
                  <Input
                    type="date"
                    className="mt-1"
                    value={editKuh.kalbungVoraussichtlich ?? ''}
                    onChange={(e) =>
                      setEditKuh({ ...editKuh, kalbungVoraussichtlich: e.target.value || undefined })
                    }
                  />
                </div>
                <div className="col-span-2">
                  <Label>Notiz</Label>
                  <textarea
                    className="mt-1 w-full px-3 py-2 rounded-lg border border-stone-300 text-sm min-h-[70px]"
                    value={editKuh.notiz ?? ''}
                    onChange={(e) => setEditKuh({ ...editKuh, notiz: e.target.value })}
                    placeholder="z.B. Mastitis-Verdacht, Antibiotikum, Milch separat"
                  />
                </div>
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <Button variant="outline" onClick={() => setEditKuh(null)}>
                  Abbrechen
                </Button>
                <Button onClick={saveKuh} className="bg-green-700 hover:bg-green-800 text-white">
                  Speichern
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Tierarzt-Dialog */}
      <Dialog open={vetOpen} onOpenChange={setVetOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {vetEditId !== null ? 'Eintrag bearbeiten' : 'Neuer Tierarzt-Eintrag'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label>Kuh *</Label>
                <select
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-stone-300 text-sm bg-white"
                  value={vetForm.kuhNr}
                  onChange={(e) => {
                    const nr = parseInt(e.target.value) || 0
                    const k = kuehe.find((c) => c.nr === nr)
                    setVetForm({ ...vetForm, kuhNr: nr, kuhName: k?.name ?? '' })
                  }}
                >
                  <option value={0}>– auswählen –</option>
                  {kuehe.map((k) => (
                    <option key={k.nr} value={k.nr}>
                      Nr. {String(k.nr).padStart(2, '0')} · {k.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Datum *</Label>
                <Input
                  type="date"
                  className="mt-1"
                  value={vetForm.datum}
                  onChange={(e) => setVetForm({ ...vetForm, datum: e.target.value })}
                />
              </div>
              <div>
                <Label>Tierarzt</Label>
                <Input
                  className="mt-1"
                  value={vetForm.tierarzt}
                  onChange={(e) => setVetForm({ ...vetForm, tierarzt: e.target.value })}
                />
              </div>
              <div className="col-span-2">
                <Label>Diagnose *</Label>
                <Input
                  className="mt-1"
                  value={vetForm.diagnose}
                  onChange={(e) => setVetForm({ ...vetForm, diagnose: e.target.value })}
                  placeholder="z.B. Mastitis-Verdacht Vorderviertel rechts"
                />
              </div>
              <div className="col-span-2">
                <Label>Behandlung</Label>
                <textarea
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-stone-300 text-sm min-h-[70px]"
                  value={vetForm.behandlung}
                  onChange={(e) => setVetForm({ ...vetForm, behandlung: e.target.value })}
                />
              </div>
              <div className="col-span-2">
                <Label>Folgetermin (optional)</Label>
                <Input
                  type="date"
                  className="mt-1"
                  value={vetForm.folgetermin ?? ''}
                  onChange={(e) => setVetForm({ ...vetForm, folgetermin: e.target.value })}
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <Button variant="outline" onClick={() => setVetOpen(false)}>
                Abbrechen
              </Button>
              <Button onClick={saveVet} className="bg-green-700 hover:bg-green-800 text-white">
                {vetEditId !== null ? 'Speichern' : 'Anlegen'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
