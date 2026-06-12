'use client'

import { useState } from 'react'
import { usePersistedState } from '@/lib/use-persisted-state'
import { STORAGE_KEYS } from '@/lib/data'
import { Plus, Search, Mail, Phone, MapPin, Pencil, Trash2, Star, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'

type Gast = {
  id: number
  name: string
  email: string
  telefon: string
  adresse: string
  plz: string
  ort: string
  land: string
  aufenthalte: number
  stammgast: boolean
  newsletter: boolean
  notiz: string
  letzterAufenthalt: string
}

const initialGaeste: Gast[] = [
  { id: 1, name: 'Familie Müller', email: 'mueller@example.de', telefon: '0711 123456', adresse: 'Hauptstraße 12', plz: '70173', ort: 'Stuttgart', land: 'Deutschland', aufenthalte: 3, stammgast: true, newsletter: true, notiz: 'Allergiker – kein Hundefell', letzterAufenthalt: '2025-09-15' },
  { id: 2, name: 'Herr & Frau Bauer', email: 'bauer@example.de', telefon: '0721 987654', adresse: 'Gartenweg 5', plz: '76131', ort: 'Karlsruhe', land: 'Deutschland', aufenthalte: 2, stammgast: false, newsletter: true, notiz: '', letzterAufenthalt: '2025-06-22' },
  { id: 3, name: 'Familie Weber', email: 'weber@example.de', telefon: '089 456789', adresse: 'Bergstraße 44', plz: '80331', ort: 'München', land: 'Deutschland', aufenthalte: 1, stammgast: false, newsletter: false, notiz: 'Frühbucherrabatt gewünscht', letzterAufenthalt: '2024-08-05' },
  { id: 4, name: 'Familie Schmitt', email: 'schmitt@example.de', telefon: '0711 654321', adresse: 'Lindenallee 3', plz: '73728', ort: 'Esslingen', land: 'Deutschland', aufenthalte: 4, stammgast: true, newsletter: true, notiz: '', letzterAufenthalt: '2025-12-28' },
  { id: 5, name: 'Frau Hoffmann', email: 'hoffmann@example.de', telefon: '030 112233', adresse: 'Prenzlauer Allee 88', plz: '10405', ort: 'Berlin', land: 'Deutschland', aufenthalte: 1, stammgast: false, newsletter: false, notiz: 'Vegetarierin', letzterAufenthalt: '2025-04-10' },
  { id: 6, name: 'Familie Fischer', email: 'fischer@example.de', telefon: '069 445566', adresse: 'Am Sachsenhäuser Berg 7', plz: '60594', ort: 'Frankfurt', land: 'Deutschland', aufenthalte: 2, stammgast: false, newsletter: true, notiz: '2 Kinder unter 12', letzterAufenthalt: '2024-07-19' },
  { id: 7, name: 'Herr Koch', email: 'koch@example.de', telefon: '0721 334455', adresse: 'Schillerstraße 21', plz: '76133', ort: 'Karlsruhe', land: 'Deutschland', aufenthalte: 5, stammgast: true, newsletter: true, notiz: 'Bringt eigenen Wein mit :-)', letzterAufenthalt: '2026-04-07' },
]

const emptyForm = (): Omit<Gast, 'id'> => ({
  name: '', email: '', telefon: '', adresse: '', plz: '', ort: '', land: 'Deutschland',
  aufenthalte: 1, stammgast: false, newsletter: false, notiz: '', letzterAufenthalt: '',
})

export default function GaestePage() {
  const [gaeste, setGaeste] = usePersistedState<Gast[]>(STORAGE_KEYS.gaeste, initialGaeste)
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  const [form, setForm] = useState(emptyForm())
  const [showStammgaeste, setShowStammgaeste] = useState(false)

  const filtered = gaeste.filter((g) => {
    const match =
      g.name.toLowerCase().includes(search.toLowerCase()) ||
      g.email.toLowerCase().includes(search.toLowerCase()) ||
      g.ort.toLowerCase().includes(search.toLowerCase())
    return match && (!showStammgaeste || g.stammgast)
  })

  function openNew() {
    setEditId(null)
    setForm(emptyForm())
    setDialogOpen(true)
  }

  function openEdit(g: Gast) {
    setEditId(g.id)
    setForm({
      name: g.name, email: g.email, telefon: g.telefon, adresse: g.adresse,
      plz: g.plz, ort: g.ort, land: g.land, aufenthalte: g.aufenthalte,
      stammgast: g.stammgast, newsletter: g.newsletter, notiz: g.notiz,
      letzterAufenthalt: g.letzterAufenthalt,
    })
    setDialogOpen(true)
  }

  function save() {
    if (!form.name) return
    if (editId !== null) {
      setGaeste((prev) => prev.map((g) => g.id === editId ? { ...form, id: editId } : g))
    } else {
      const newId = Math.max(0, ...gaeste.map((g) => g.id)) + 1
      setGaeste((prev) => [...prev, { ...form, id: newId }])
    }
    setDialogOpen(false)
  }

  function remove(id: number) {
    setGaeste((prev) => prev.filter((g) => g.id !== id))
  }

  const stammgaeste = gaeste.filter((g) => g.stammgast).length
  const newsletter = gaeste.filter((g) => g.newsletter).length
  const gesamtAufenthalte = gaeste.reduce((s, g) => s + g.aufenthalte, 0)

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Gästeverzeichnis</h1>
          <p className="text-stone-500 mt-0.5 text-sm">
            {gaeste.length} Gäste · {stammgaeste} Stammgäste · {gesamtAufenthalte} Aufenthalte gesamt
          </p>
        </div>
        <Button onClick={openNew} className="bg-green-700 hover:bg-green-800 text-white gap-2">
          <Plus className="w-4 h-4" /> Neuer Gast
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-stone-200 p-4 flex items-center gap-4">
          <div className="p-2.5 rounded-lg bg-green-50"><User className="w-5 h-5 text-green-700" /></div>
          <div>
            <p className="text-xl font-bold text-stone-900">{gaeste.length}</p>
            <p className="text-xs text-stone-500">Gäste gesamt</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-stone-200 p-4 flex items-center gap-4">
          <div className="p-2.5 rounded-lg bg-amber-50"><Star className="w-5 h-5 text-amber-600" /></div>
          <div>
            <p className="text-xl font-bold text-stone-900">{stammgaeste}</p>
            <p className="text-xs text-stone-500">Stammgäste</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-stone-200 p-4 flex items-center gap-4">
          <div className="p-2.5 rounded-lg bg-blue-50"><Mail className="w-5 h-5 text-blue-600" /></div>
          <div>
            <p className="text-xl font-bold text-stone-900">{newsletter}</p>
            <p className="text-xs text-stone-500">Newsletter-Abos</p>
          </div>
        </div>
      </div>

      {/* Filter row */}
      <div className="flex gap-3 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Name, E-Mail oder Ort suchen …"
            className="pl-9"
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-stone-600 cursor-pointer select-none whitespace-nowrap">
          <Checkbox
            checked={showStammgaeste}
            onCheckedChange={(v) => setShowStammgaeste(!!v)}
          />
          Nur Stammgäste
        </label>
      </div>

      {/* Cards grid */}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((g) => (
          <div key={g.id} className="bg-white rounded-xl border border-stone-200 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-stone-900 truncate">{g.name}</p>
                  {g.stammgast && (
                    <Star className="w-3.5 h-3.5 text-amber-400 shrink-0 fill-amber-400" />
                  )}
                </div>
                <div className="mt-2 space-y-1">
                  {g.email && (
                    <div className="flex items-center gap-1.5 text-sm text-stone-500">
                      <Mail className="w-3.5 h-3.5 shrink-0" />
                      <a href={`mailto:${g.email}`} className="hover:text-green-700 truncate">{g.email}</a>
                    </div>
                  )}
                  {g.telefon && (
                    <div className="flex items-center gap-1.5 text-sm text-stone-500">
                      <Phone className="w-3.5 h-3.5 shrink-0" />
                      <a href={`tel:${g.telefon}`} className="hover:text-green-700">{g.telefon}</a>
                    </div>
                  )}
                  {g.ort && (
                    <div className="flex items-center gap-1.5 text-sm text-stone-500">
                      <MapPin className="w-3.5 h-3.5 shrink-0" />
                      <span>{g.plz} {g.ort}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-1 shrink-0">
                <button onClick={() => openEdit(g)} className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors">
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => remove(g.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-stone-400 hover:text-red-600 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-400">
              <span>{g.aufenthalte} {g.aufenthalte === 1 ? 'Aufenthalt' : 'Aufenthalte'}</span>
              {g.letzterAufenthalt && (
                <span>Zuletzt: {g.letzterAufenthalt.split('-').reverse().join('.')}</span>
              )}
              {g.newsletter && (
                <span className="text-green-600 font-medium">Newsletter ✓</span>
              )}
            </div>
            {g.notiz && (
              <p className="mt-2 text-xs text-stone-500 bg-stone-50 rounded-md px-2.5 py-1.5 italic">{g.notiz}</p>
            )}
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="col-span-3 text-center text-stone-400 py-10">Keine Gäste gefunden.</p>
        )}
      </div>

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editId ? 'Gast bearbeiten' : 'Neuer Gast'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label>Name *</Label>
              <Input className="mt-1" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="z.B. Familie Müller" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>E-Mail</Label>
                <Input className="mt-1" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div>
                <Label>Telefon</Label>
                <Input className="mt-1" value={form.telefon} onChange={(e) => setForm({ ...form, telefon: e.target.value })} />
              </div>
              <div className="col-span-2">
                <Label>Straße & Hausnummer</Label>
                <Input className="mt-1" value={form.adresse} onChange={(e) => setForm({ ...form, adresse: e.target.value })} />
              </div>
              <div>
                <Label>PLZ</Label>
                <Input className="mt-1" value={form.plz} onChange={(e) => setForm({ ...form, plz: e.target.value })} />
              </div>
              <div>
                <Label>Ort</Label>
                <Input className="mt-1" value={form.ort} onChange={(e) => setForm({ ...form, ort: e.target.value })} />
              </div>
              <div>
                <Label>Aufenthalte</Label>
                <Input className="mt-1" type="number" min={0} value={form.aufenthalte} onChange={(e) => setForm({ ...form, aufenthalte: parseInt(e.target.value) || 0 })} />
              </div>
              <div>
                <Label>Letzter Aufenthalt</Label>
                <Input className="mt-1" type="date" value={form.letzterAufenthalt} onChange={(e) => setForm({ ...form, letzterAufenthalt: e.target.value })} />
              </div>
              <div className="col-span-2">
                <Label>Notizen</Label>
                <Input className="mt-1" value={form.notiz} onChange={(e) => setForm({ ...form, notiz: e.target.value })} />
              </div>
            </div>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <Checkbox checked={form.stammgast} onCheckedChange={(v) => setForm({ ...form, stammgast: !!v })} />
                Stammgast
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <Checkbox checked={form.newsletter} onCheckedChange={(v) => setForm({ ...form, newsletter: !!v })} />
                Newsletter
              </label>
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
