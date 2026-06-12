'use client'

import { useState } from 'react'
import { usePersistedState } from '@/lib/use-persisted-state'
import { STORAGE_KEYS, initialBuchungen, formatDate, type Buchung } from '@/lib/data'
import { Plus, Search, CalendarDays, Users, Home, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const statusColors: Record<string, string> = {
  Bestätigt: 'bg-green-100 text-green-800',
  Ausstehend: 'bg-amber-100 text-amber-800',
  Abgesagt: 'bg-red-100 text-red-800',
}

function nights(anreise: string, abreise: string) {
  const a = new Date(anreise)
  const b = new Date(abreise)
  return Math.round((b.getTime() - a.getTime()) / 86400000)
}

const emptyForm = (): Omit<Buchung, 'id'> => ({
  gast: '', email: '', telefon: '', anreise: '', abreise: '',
  personen: 2, unterkunft: 'Siloturm', status: 'Ausstehend', notizen: '',
})

export default function BuchungenPage() {
  const [buchungen, setBuchungen] = usePersistedState<Buchung[]>(STORAGE_KEYS.buchungen, initialBuchungen)
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  const [form, setForm] = useState(emptyForm())

  const filtered = buchungen.filter((b) =>
    b.gast.toLowerCase().includes(search.toLowerCase()) ||
    b.email.toLowerCase().includes(search.toLowerCase())
  )

  function openNew() {
    setEditId(null)
    setForm(emptyForm())
    setDialogOpen(true)
  }

  function openEdit(b: Buchung) {
    setEditId(b.id)
    setForm({ gast: b.gast, email: b.email, telefon: b.telefon, anreise: b.anreise, abreise: b.abreise, personen: b.personen, unterkunft: b.unterkunft, status: b.status, notizen: b.notizen })
    setDialogOpen(true)
  }

  function save() {
    if (!form.gast || !form.anreise || !form.abreise) return
    if (editId !== null) {
      setBuchungen((prev) => prev.map((b) => b.id === editId ? { ...form, id: editId } : b))
    } else {
      const newId = Math.max(0, ...buchungen.map((b) => b.id)) + 1
      setBuchungen((prev) => [...prev, { ...form, id: newId }])
    }
    setDialogOpen(false)
  }

  function remove(id: number) {
    setBuchungen((prev) => prev.filter((b) => b.id !== id))
  }

  const aktiv = buchungen.filter((b) => b.status === 'Bestätigt').length
  const ausstehend = buchungen.filter((b) => b.status === 'Ausstehend').length

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Buchungen</h1>
          <p className="text-stone-500 mt-0.5 text-sm">Siloturm · {aktiv} bestätigt · {ausstehend} ausstehend</p>
        </div>
        <Button onClick={openNew} className="bg-green-700 hover:bg-green-800 text-white gap-2">
          <Plus className="w-4 h-4" /> Neue Buchung
        </Button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Buchungen gesamt', value: buchungen.length, icon: CalendarDays, color: 'text-green-700', bg: 'bg-green-50' },
          { label: 'Personen gesamt', value: buchungen.reduce((s, b) => s + b.personen, 0), icon: Users, color: 'text-blue-700', bg: 'bg-blue-50' },
          { label: 'Unterkunft', value: 'Siloturm', icon: Home, color: 'text-amber-700', bg: 'bg-amber-50' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-stone-200 p-4 flex items-center gap-4">
            <div className={`p-2.5 rounded-lg ${s.bg}`}>
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
            <div>
              <p className="text-xl font-bold text-stone-900">{s.value}</p>
              <p className="text-xs text-stone-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Gast oder E-Mail suchen …"
          className="pl-9"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-100 bg-stone-50">
                <th className="text-left px-5 py-3 font-semibold text-stone-600">Gast</th>
                <th className="text-left px-4 py-3 font-semibold text-stone-600">Anreise</th>
                <th className="text-left px-4 py-3 font-semibold text-stone-600">Abreise</th>
                <th className="text-left px-4 py-3 font-semibold text-stone-600">Nächte</th>
                <th className="text-left px-4 py-3 font-semibold text-stone-600">Pers.</th>
                <th className="text-left px-4 py-3 font-semibold text-stone-600">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {filtered.map((b) => (
                <tr key={b.id} className="hover:bg-stone-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <p className="font-medium text-stone-900">{b.gast}</p>
                    <p className="text-xs text-stone-400">{b.email}</p>
                  </td>
                  <td className="px-4 py-3.5 text-stone-700">{formatDate(b.anreise)}</td>
                  <td className="px-4 py-3.5 text-stone-700">{formatDate(b.abreise)}</td>
                  <td className="px-4 py-3.5 text-stone-700">{nights(b.anreise, b.abreise)}</td>
                  <td className="px-4 py-3.5 text-stone-700">{b.personen}</td>
                  <td className="px-4 py-3.5">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColors[b.status]}`}>
                      {b.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2 justify-end">
                      <button onClick={() => openEdit(b)} className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => remove(b.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-stone-400 hover:text-red-600 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-stone-400">Keine Buchungen gefunden.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editId ? 'Buchung bearbeiten' : 'Neue Buchung'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label>Gastname *</Label>
                <Input className="mt-1" value={form.gast} onChange={(e) => setForm({ ...form, gast: e.target.value })} placeholder="z.B. Familie Müller" />
              </div>
              <div>
                <Label>E-Mail</Label>
                <Input className="mt-1" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div>
                <Label>Telefon</Label>
                <Input className="mt-1" value={form.telefon} onChange={(e) => setForm({ ...form, telefon: e.target.value })} />
              </div>
              <div>
                <Label>Anreise *</Label>
                <Input className="mt-1" type="date" value={form.anreise} onChange={(e) => setForm({ ...form, anreise: e.target.value })} />
              </div>
              <div>
                <Label>Abreise *</Label>
                <Input className="mt-1" type="date" value={form.abreise} onChange={(e) => setForm({ ...form, abreise: e.target.value })} />
              </div>
              <div>
                <Label>Personen</Label>
                <Input className="mt-1" type="number" min={1} max={10} value={form.personen} onChange={(e) => setForm({ ...form, personen: parseInt(e.target.value) || 1 })} />
              </div>
              <div>
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as Buchung['status'] })}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Ausstehend">Ausstehend</SelectItem>
                    <SelectItem value="Bestätigt">Bestätigt</SelectItem>
                    <SelectItem value="Abgesagt">Abgesagt</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Label>Notizen</Label>
                <Input className="mt-1" value={form.notizen} onChange={(e) => setForm({ ...form, notizen: e.target.value })} placeholder="Besondere Wünsche …" />
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
