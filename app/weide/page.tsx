'use client'

import { useState } from 'react'
import {
  Trees,
  MapPin,
  Beef,
  Plus,
  Pencil,
  Trash2,
  Wheat,
  Pause,
  Sprout,
  Scissors,
} from 'lucide-react'
import { usePersistedState } from '@/lib/use-persisted-state'
import {
  STORAGE_KEYS,
  initialWeiden,
  formatDate,
  daysUntil,
  TODAY_ISO,
  type Weide,
  type WeideStatus,
  type WeideZustand,
} from '@/lib/data'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

const statusConfig: Record<WeideStatus, { color: string; icon: typeof Wheat }> = {
  'In Nutzung': { color: 'bg-green-100 text-green-800 border-green-200', icon: Beef },
  Ruhend: { color: 'bg-stone-100 text-stone-700 border-stone-200', icon: Pause },
  Gemäht: { color: 'bg-amber-100 text-amber-800 border-amber-200', icon: Scissors },
  Nachwuchs: { color: 'bg-emerald-50 text-emerald-800 border-emerald-200', icon: Sprout },
}

const zustandColor: Record<WeideZustand, string> = {
  'Sehr gut': 'bg-green-500',
  Gut: 'bg-emerald-400',
  Mäßig: 'bg-amber-400',
  Schlecht: 'bg-red-400',
}

const emptyForm = (): Omit<Weide, 'id'> => ({
  name: '',
  hektar: 0,
  status: 'Ruhend',
  zustand: 'Gut',
  letzteNutzung: TODAY_ISO,
  herdeAnzahl: 0,
  bemerkung: '',
})

export default function WeidePage() {
  const [weiden, setWeiden] = usePersistedState<Weide[]>(STORAGE_KEYS.weiden, initialWeiden)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  const [form, setForm] = useState(emptyForm())

  function openNew() {
    setEditId(null)
    setForm(emptyForm())
    setDialogOpen(true)
  }

  function openEdit(w: Weide) {
    setEditId(w.id)
    setForm({
      name: w.name,
      hektar: w.hektar,
      status: w.status,
      zustand: w.zustand,
      letzteNutzung: w.letzteNutzung,
      herdeAnzahl: w.herdeAnzahl,
      bemerkung: w.bemerkung,
    })
    setDialogOpen(true)
  }

  function save() {
    if (!form.name) return
    if (editId !== null) {
      setWeiden((prev) => prev.map((w) => (w.id === editId ? { ...form, id: editId } : w)))
    } else {
      const newId = Math.max(0, ...weiden.map((w) => w.id)) + 1
      setWeiden((prev) => [...prev, { ...form, id: newId }])
    }
    setDialogOpen(false)
  }

  function remove(id: number) {
    setWeiden((prev) => prev.filter((w) => w.id !== id))
  }

  const inNutzung = weiden.filter((w) => w.status === 'In Nutzung')
  const ruhend = weiden.filter((w) => w.status === 'Ruhend')
  const tiereAufWeide = inNutzung.reduce((s, w) => s + w.herdeAnzahl, 0)
  const flaecheTotal = weiden.reduce((s, w) => s + w.hektar, 0)
  const flaecheNutzung = inNutzung.reduce((s, w) => s + w.hektar, 0)

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 flex items-center gap-2">
            <Trees className="w-6 h-6 text-green-700" />
            Weidemanagement
          </h1>
          <p className="text-stone-500 mt-0.5 text-sm">
            Rotationsweide · {weiden.length} Flächen · {flaecheTotal.toFixed(1)} ha gesamt
          </p>
        </div>
        <Button onClick={openNew} className="bg-green-700 hover:bg-green-800 text-white gap-2">
          <Plus className="w-4 h-4" /> Fläche
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-stone-200 p-5">
          <div className="inline-flex p-2.5 rounded-lg bg-green-50 mb-3">
            <Beef className="w-5 h-5 text-green-700" />
          </div>
          <p className="text-2xl font-bold text-stone-900">{tiereAufWeide}</p>
          <p className="text-sm font-medium text-stone-600 mt-0.5">Tiere auf Weide</p>
          <p className="text-xs text-stone-400 mt-1">{inNutzung.length} Koppeln in Nutzung</p>
        </div>

        <div className="bg-white rounded-xl border border-stone-200 p-5">
          <div className="inline-flex p-2.5 rounded-lg bg-amber-50 mb-3">
            <MapPin className="w-5 h-5 text-amber-700" />
          </div>
          <p className="text-2xl font-bold text-stone-900">{flaecheNutzung.toFixed(1)} ha</p>
          <p className="text-sm font-medium text-stone-600 mt-0.5">Aktiv beweidet</p>
          <p className="text-xs text-stone-400 mt-1">{flaecheTotal.toFixed(1)} ha gesamt</p>
        </div>

        <div className="bg-white rounded-xl border border-stone-200 p-5">
          <div className="inline-flex p-2.5 rounded-lg bg-stone-100 mb-3">
            <Pause className="w-5 h-5 text-stone-600" />
          </div>
          <p className="text-2xl font-bold text-stone-900">{ruhend.length}</p>
          <p className="text-sm font-medium text-stone-600 mt-0.5">Flächen ruhend</p>
          <p className="text-xs text-stone-400 mt-1">In Erholungsphase</p>
        </div>

        <div className="bg-white rounded-xl border border-stone-200 p-5">
          <div className="inline-flex p-2.5 rounded-lg bg-blue-50 mb-3">
            <Wheat className="w-5 h-5 text-blue-700" />
          </div>
          <p className="text-2xl font-bold text-stone-900">
            {tiereAufWeide > 0 ? (flaecheNutzung / tiereAufWeide).toFixed(2) : '–'}
          </p>
          <p className="text-sm font-medium text-stone-600 mt-0.5">ha pro Tier</p>
          <p className="text-xs text-stone-400 mt-1">Aktuelle Besatzdichte</p>
        </div>
      </div>

      {/* Weiden-Karten */}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {weiden.map((w) => {
          const cfg = statusConfig[w.status]
          const ruhetage = daysUntil(TODAY_ISO, w.letzteNutzung) * -1
          return (
            <div key={w.id} className="bg-white rounded-xl border border-stone-200 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-stone-900">{w.name}</p>
                  <p className="text-xs text-stone-400 mt-0.5">{w.hektar} ha</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => openEdit(w)}
                    className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => remove(w.id)}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-stone-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className={`rounded-lg px-3 py-2 mb-3 border inline-flex items-center gap-2 ${cfg.color}`}>
                <cfg.icon className="w-3.5 h-3.5" />
                <span className="text-sm font-medium">{w.status}</span>
                {w.status === 'In Nutzung' && w.herdeAnzahl > 0 && (
                  <span className="text-xs">· {w.herdeAnzahl} {w.herdeAnzahl === 1 ? 'Tier' : 'Tiere'}</span>
                )}
              </div>

              <div className="space-y-2.5 text-xs text-stone-500">
                <div className="flex items-center justify-between">
                  <span>Grasbestand</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-stone-700">{w.zustand}</span>
                    <span className={`w-2 h-2 rounded-full ${zustandColor[w.zustand]}`} />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span>Letzte Nutzung</span>
                  <span className="font-medium text-stone-700">{formatDate(w.letzteNutzung)}</span>
                </div>
                {w.status === 'Ruhend' && ruhetage > 0 && (
                  <div className="flex items-center justify-between">
                    <span>Ruhezeit</span>
                    <span className={`font-medium ${ruhetage >= 21 ? 'text-green-700' : 'text-amber-700'}`}>
                      {ruhetage} Tage
                    </span>
                  </div>
                )}
              </div>

              {w.bemerkung && (
                <p className="text-xs text-stone-600 mt-3 pt-3 border-t border-stone-100 leading-relaxed">
                  {w.bemerkung}
                </p>
              )}
            </div>
          )
        })}
      </div>

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editId !== null ? 'Fläche bearbeiten' : 'Neue Weidefläche'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label>Name *</Label>
              <Input
                className="mt-1"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="z.B. Stollenwiese Ost"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Größe (ha)</Label>
                <Input
                  type="number"
                  step="0.1"
                  min={0}
                  className="mt-1"
                  value={form.hektar}
                  onChange={(e) => setForm({ ...form, hektar: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label>Status</Label>
                <select
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-stone-300 text-sm bg-white"
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as WeideStatus })}
                >
                  {(['In Nutzung', 'Ruhend', 'Gemäht', 'Nachwuchs'] as WeideStatus[]).map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Grasbestand</Label>
                <select
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-stone-300 text-sm bg-white"
                  value={form.zustand}
                  onChange={(e) => setForm({ ...form, zustand: e.target.value as WeideZustand })}
                >
                  {(['Sehr gut', 'Gut', 'Mäßig', 'Schlecht'] as WeideZustand[]).map((z) => (
                    <option key={z} value={z}>
                      {z}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Anzahl Tiere</Label>
                <Input
                  type="number"
                  min={0}
                  className="mt-1"
                  value={form.herdeAnzahl}
                  onChange={(e) => setForm({ ...form, herdeAnzahl: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="col-span-2">
                <Label>Letzte Nutzung</Label>
                <Input
                  type="date"
                  className="mt-1"
                  value={form.letzteNutzung}
                  onChange={(e) => setForm({ ...form, letzteNutzung: e.target.value })}
                />
              </div>
              <div className="col-span-2">
                <Label>Bemerkung</Label>
                <textarea
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-stone-300 text-sm min-h-[70px]"
                  value={form.bemerkung}
                  onChange={(e) => setForm({ ...form, bemerkung: e.target.value })}
                  placeholder="z.B. Klee dominant, Beweidung ab ..."
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Abbrechen
              </Button>
              <Button onClick={save} className="bg-green-700 hover:bg-green-800 text-white">
                {editId !== null ? 'Speichern' : 'Anlegen'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
