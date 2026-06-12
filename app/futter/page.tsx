'use client'

import { useState } from 'react'
import { usePersistedState } from '@/lib/use-persisted-state'
import { STORAGE_KEYS } from '@/lib/data'
import { Plus, Pencil, Trash2, Package, AlertTriangle, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

type FutterItem = {
  id: number
  name: string
  typ: 'Heu' | 'Pellets' | 'Kraftfutter' | 'Stroh' | 'Vitamine' | 'Sonstiges'
  lagerbestand: number
  einheit: string
  mindestbestand: number
  lieferant: string
  preis: number
  letzteBestellung: string
  bestellmenge: number
}

const initialFutter: FutterItem[] = [
  { id: 1, name: 'Heu (Qualität A)', typ: 'Heu', lagerbestand: 480, einheit: 'Ballen', mindestbestand: 100, lieferant: 'Wiese & Sohn', preis: 4.50, letzteBestellung: '2026-04-15', bestellmenge: 200 },
  { id: 2, name: 'Kraftfutter Demeter', typ: 'Kraftfutter', lagerbestand: 2400, einheit: 'kg', mindestbestand: 800, lieferant: 'Bio-Futter GmbH', preis: 0.48, letzteBestellung: '2026-04-20', bestellmenge: 1000 },
  { id: 3, name: 'Pellets (Luzerne)', typ: 'Pellets', lagerbestand: 1800, einheit: 'kg', mindestbestand: 600, lieferant: 'Müller Futtermittel', preis: 0.52, letzteBestellung: '2026-04-18', bestellmenge: 1000 },
  { id: 4, name: 'Stroh (gehäckselt)', typ: 'Stroh', lagerbestand: 120, einheit: 'Ballen', mindestbestand: 50, lieferant: 'Wiese & Sohn', preis: 2.00, letzteBestellung: '2026-03-10', bestellmenge: 100 },
  { id: 5, name: 'Mineralfutter', typ: 'Vitamine', lagerbestand: 250, einheit: 'kg', mindestbestand: 100, lieferant: 'Schimmel Tierernährung', preis: 1.80, letzteBestellung: '2026-04-25', bestellmenge: 200 },
  { id: 6, name: 'Hühnerfutter Bio', typ: 'Sonstiges', lagerbestand: 150, einheit: 'kg', mindestbestand: 50, lieferant: 'Bio-Futter GmbH', preis: 0.75, letzteBestellung: '2026-04-22', bestellmenge: 150 },
]

const emptyForm = (): Omit<FutterItem, 'id'> => ({
  name: '', typ: 'Sonstiges', lagerbestand: 0, einheit: 'kg', mindestbestand: 0,
  lieferant: '', preis: 0, letzteBestellung: '', bestellmenge: 0,
})

function getStatusColor(aktuell: number, minimum: number) {
  if (aktuell < minimum) return 'text-red-700 bg-red-50'
  if (aktuell < minimum * 1.5) return 'text-amber-700 bg-amber-50'
  return 'text-green-700 bg-green-50'
}

function getStatusLabel(aktuell: number, minimum: number) {
  if (aktuell < minimum) return 'Kritisch – Bestellung dringend'
  if (aktuell < minimum * 1.5) return 'Niedrig – Bestellung empfohlen'
  return 'Ausreichend'
}

export default function FutterPage() {
  const [futter, setFutter] = usePersistedState<FutterItem[]>(STORAGE_KEYS.futter, initialFutter)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  const [form, setForm] = useState(emptyForm())

  function openNew() {
    setEditId(null)
    setForm(emptyForm())
    setDialogOpen(true)
  }

  function openEdit(f: FutterItem) {
    setEditId(f.id)
    setForm({ name: f.name, typ: f.typ, lagerbestand: f.lagerbestand, einheit: f.einheit, mindestbestand: f.mindestbestand, lieferant: f.lieferant, preis: f.preis, letzteBestellung: f.letzteBestellung, bestellmenge: f.bestellmenge })
    setDialogOpen(true)
  }

  function save() {
    if (!form.name) return
    if (editId !== null) {
      setFutter((prev) => prev.map((f) => f.id === editId ? { ...form, id: editId } : f))
    } else {
      const newId = Math.max(0, ...futter.map((f) => f.id)) + 1
      setFutter((prev) => [...prev, { ...form, id: newId }])
    }
    setDialogOpen(false)
  }

  function remove(id: number) {
    setFutter((prev) => prev.filter((f) => f.id !== id))
  }

  const kritisch = futter.filter((f) => f.lagerbestand < f.mindestbestand).length
  const niedrig = futter.filter((f) => f.lagerbestand >= f.mindestbestand && f.lagerbestand < f.mindestbestand * 1.5).length
  const gesamtWert = futter.reduce((s, f) => s + (f.lagerbestand * f.preis), 0)

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Futterverwaltung</h1>
          <p className="text-stone-500 mt-0.5 text-sm">{futter.length} Artikel · Lagerwert: {gesamtWert.toLocaleString('de-DE')} €</p>
        </div>
        <Button onClick={openNew} className="bg-green-700 hover:bg-green-800 text-white gap-2">
          <Plus className="w-4 h-4" /> Neuer Artikel
        </Button>
      </div>

      {/* Alert */}
      {kritisch > 0 && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-800">{kritisch} {kritisch === 1 ? 'Artikel' : 'Artikel'} zu wenig vorrätig</p>
            <p className="text-sm text-red-600 mt-0.5">Bitte schnellstmöglich nachbestellen.</p>
          </div>
        </div>
      )}

      {niedrig > 0 && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-800">{niedrig} {niedrig === 1 ? 'Artikel' : 'Artikel'} mit niedrigem Bestand</p>
            <p className="text-sm text-amber-600 mt-0.5">Bestellung wird bald empfohlen.</p>
          </div>
        </div>
      )}

      {kritisch === 0 && niedrig === 0 && (
        <div className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-xl p-4">
          <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-green-800">Alle Bestände ausreichend</p>
            <p className="text-sm text-green-600 mt-0.5">Keine sofortigen Bestellungen nötig.</p>
          </div>
        </div>
      )}

      {/* Cards grid */}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {futter.map((f) => {
          const percentage = (f.lagerbestand / (f.mindestbestand * 2)) * 100
          const statusColor = getStatusColor(f.lagerbestand, f.mindestbestand)
          const statusLabel = getStatusLabel(f.lagerbestand, f.mindestbestand)
          return (
            <div key={f.id} className="bg-white rounded-xl border border-stone-200 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-stone-900">{f.name}</p>
                  <p className="text-xs text-stone-400 mt-0.5">{f.typ}</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => openEdit(f)} className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => remove(f.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-stone-400 hover:text-red-600 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className={`rounded-lg p-3 mb-3 ${statusColor}`}>
                <p className="text-sm font-semibold">{f.lagerbestand} {f.einheit}</p>
                <p className="text-xs mt-0.5">{statusLabel}</p>
              </div>

              <div className="space-y-2 mb-3 text-xs text-stone-500">
                <div className="flex items-center justify-between">
                  <span>Mindestbestand</span>
                  <span className="font-medium text-stone-700">{f.mindestbestand} {f.einheit}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Preis pro {f.einheit}</span>
                  <span className="font-medium text-stone-700">{f.preis.toFixed(2)} €</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Lagerwert</span>
                  <span className="font-bold text-green-700">{(f.lagerbestand * f.preis).toFixed(0)} €</span>
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-3 border-t border-stone-100">
                <div>
                  <div className="flex items-center justify-between text-xs text-stone-400 mb-1">
                    <span>Bestand</span>
                    <span>{Math.min(percentage, 100).toFixed(0)}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-stone-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${f.lagerbestand < f.mindestbestand ? 'bg-red-400' : f.lagerbestand < f.mindestbestand * 1.5 ? 'bg-amber-400' : 'bg-green-400'}`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>
                </div>
                <p className="text-xs text-stone-400">
                  Lieferant: <span className="font-medium text-stone-600">{f.lieferant}</span>
                </p>
                {new Date(f.letzteBestellung) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) && (
                  <p className="text-xs text-green-600">Zuletzt bestellt: {f.letzteBestellung}</p>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editId ? 'Futter bearbeiten' : 'Neuer Futter-Artikel'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label>Name *</Label>
              <Input className="mt-1" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="z.B. Heu Qualität A" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Typ</Label>
                <select className="mt-1 w-full px-3 py-2 rounded-lg border border-stone-300 text-sm" value={form.typ} onChange={(e) => setForm({ ...form, typ: e.target.value as any })}>
                  {['Heu', 'Pellets', 'Kraftfutter', 'Stroh', 'Vitamine', 'Sonstiges'].map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <Label>Einheit</Label>
                <Input className="mt-1" value={form.einheit} onChange={(e) => setForm({ ...form, einheit: e.target.value })} placeholder="kg, Ballen, etc." />
              </div>
              <div>
                <Label>Bestand</Label>
                <Input className="mt-1" type="number" min={0} value={form.lagerbestand} onChange={(e) => setForm({ ...form, lagerbestand: parseInt(e.target.value) || 0 })} />
              </div>
              <div>
                <Label>Mindestbestand</Label>
                <Input className="mt-1" type="number" min={0} value={form.mindestbestand} onChange={(e) => setForm({ ...form, mindestbestand: parseInt(e.target.value) || 0 })} />
              </div>
              <div>
                <Label>Preis pro Einheit (€)</Label>
                <Input className="mt-1" type="number" step="0.01" value={form.preis} onChange={(e) => setForm({ ...form, preis: parseFloat(e.target.value) || 0 })} />
              </div>
              <div>
                <Label>Bestellmenge</Label>
                <Input className="mt-1" type="number" min={0} value={form.bestellmenge} onChange={(e) => setForm({ ...form, bestellmenge: parseInt(e.target.value) || 0 })} />
              </div>
              <div className="col-span-2">
                <Label>Lieferant</Label>
                <Input className="mt-1" value={form.lieferant} onChange={(e) => setForm({ ...form, lieferant: e.target.value })} />
              </div>
              <div className="col-span-2">
                <Label>Letzte Bestellung</Label>
                <Input className="mt-1" type="date" value={form.letzteBestellung} onChange={(e) => setForm({ ...form, letzteBestellung: e.target.value })} />
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Abbrechen</Button>
              <Button onClick={save} className="bg-green-700 hover:bg-green-800 text-white">
                {editId ? 'Speichern' : 'Anlegen'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
