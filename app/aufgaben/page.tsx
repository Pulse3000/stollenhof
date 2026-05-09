'use client'

import { useState } from 'react'
import { usePersistedState } from '@/lib/use-persisted-state'
import { STORAGE_KEYS, initialAufgaben, type Aufgabe, type Kategorie, type Prioritaet } from '@/lib/data'
import { Plus, Trash2, AlertCircle, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'

const prioColors: Record<Prioritaet, string> = {
  Hoch: 'bg-red-100 text-red-700',
  Mittel: 'bg-amber-100 text-amber-700',
  Niedrig: 'bg-green-100 text-green-700',
}

const katColors: Record<Kategorie, string> = {
  Stall: 'bg-amber-50 text-amber-800',
  Feld: 'bg-green-50 text-green-800',
  Gäste: 'bg-blue-50 text-blue-800',
  Verwaltung: 'bg-purple-50 text-purple-800',
  Wartung: 'bg-stone-100 text-stone-700',
}

const kategorien: Kategorie[] = ['Stall', 'Feld', 'Gäste', 'Verwaltung', 'Wartung']

function NewTaskForm({ onAdd }: { onAdd: (a: Omit<Aufgabe, 'id' | 'erledigt'>) => void }) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ titel: '', kategorie: 'Stall' as Kategorie, prioritaet: 'Mittel' as Prioritaet, faellig: '', verantwortlich: '', notiz: '' })

  function submit() {
    if (!form.titel) return
    onAdd(form)
    setForm({ titel: '', kategorie: 'Stall', prioritaet: 'Mittel', faellig: '', verantwortlich: '', notiz: '' })
    setOpen(false)
  }

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)} className="bg-green-700 hover:bg-green-800 text-white gap-2">
        <Plus className="w-4 h-4" /> Neue Aufgabe
      </Button>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-green-200 p-5 space-y-4">
      <h3 className="font-semibold text-stone-900">Neue Aufgabe</h3>
      <div>
        <Label>Titel *</Label>
        <Input className="mt-1" value={form.titel} onChange={(e) => setForm({ ...form, titel: e.target.value })} placeholder="Was ist zu tun?" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Kategorie</Label>
          <Select value={form.kategorie} onValueChange={(v) => setForm({ ...form, kategorie: v as Kategorie })}>
            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              {kategorien.map((k) => <SelectItem key={k} value={k}>{k}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Priorität</Label>
          <Select value={form.prioritaet} onValueChange={(v) => setForm({ ...form, prioritaet: v as Prioritaet })}>
            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Hoch">Hoch</SelectItem>
              <SelectItem value="Mittel">Mittel</SelectItem>
              <SelectItem value="Niedrig">Niedrig</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Fällig am</Label>
          <Input className="mt-1" type="date" value={form.faellig} onChange={(e) => setForm({ ...form, faellig: e.target.value })} />
        </div>
        <div>
          <Label>Verantwortlich</Label>
          <Input className="mt-1" value={form.verantwortlich} onChange={(e) => setForm({ ...form, verantwortlich: e.target.value })} placeholder="Name" />
        </div>
        <div className="col-span-2">
          <Label>Notiz</Label>
          <Input className="mt-1" value={form.notiz} onChange={(e) => setForm({ ...form, notiz: e.target.value })} />
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        <Button variant="outline" onClick={() => setOpen(false)}>Abbrechen</Button>
        <Button onClick={submit} className="bg-green-700 hover:bg-green-800 text-white">Hinzufügen</Button>
      </div>
    </div>
  )
}

export default function AufgabenPage() {
  const [aufgaben, setAufgaben] = usePersistedState<Aufgabe[]>(STORAGE_KEYS.aufgaben, initialAufgaben)
  const [filterKat, setFilterKat] = useState<Kategorie | 'Alle'>('Alle')

  function toggle(id: number) {
    setAufgaben((prev) => prev.map((a) => a.id === id ? { ...a, erledigt: !a.erledigt } : a))
  }

  function remove(id: number) {
    setAufgaben((prev) => prev.filter((a) => a.id !== id))
  }

  function addAufgabe(data: Omit<Aufgabe, 'id' | 'erledigt'>) {
    const newId = Math.max(0, ...aufgaben.map((a) => a.id)) + 1
    setAufgaben((prev) => [...prev, { ...data, id: newId, erledigt: false }])
  }

  const filtered = aufgaben.filter((a) => filterKat === 'Alle' || a.kategorie === filterKat)
  const offen = filtered.filter((a) => !a.erledigt).sort((a, b) => {
    const pMap: Record<Prioritaet, number> = { Hoch: 0, Mittel: 1, Niedrig: 2 }
    return pMap[a.prioritaet] - pMap[b.prioritaet]
  })
  const erledigt = filtered.filter((a) => a.erledigt)

  const dringend = aufgaben.filter((a) => !a.erledigt && a.prioritaet === 'Hoch').length

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Aufgaben</h1>
          <p className="text-stone-500 mt-0.5 text-sm">
            {offen.length} offen
            {dringend > 0 && <span className="ml-2 text-red-600 font-medium">· {dringend} dringend</span>}
          </p>
        </div>
      </div>

      {/* Dringend alert */}
      {dringend > 0 && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-800">
              {dringend} dringende {dringend === 1 ? 'Aufgabe' : 'Aufgaben'}
            </p>
            <p className="text-xs text-red-600 mt-0.5">Bitte zeitnah bearbeiten.</p>
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="flex flex-wrap gap-2">
        {(['Alle', ...kategorien] as const).map((k) => (
          <button
            key={k}
            onClick={() => setFilterKat(k as typeof filterKat)}
            className={cn(
              'text-sm px-3 py-1.5 rounded-lg border font-medium transition-colors',
              filterKat === k
                ? 'bg-green-700 text-white border-green-700'
                : 'bg-white text-stone-600 border-stone-200 hover:border-green-400'
            )}
          >
            {k}
          </button>
        ))}
      </div>

      <NewTaskForm onAdd={addAufgabe} />

      {/* Open tasks */}
      <div className="space-y-2">
        {offen.map((a) => (
          <div key={a.id} className="bg-white rounded-xl border border-stone-200 p-4 flex items-start gap-4 hover:shadow-sm transition-shadow">
            <Checkbox
              checked={a.erledigt}
              onCheckedChange={() => toggle(a.id)}
              className="mt-0.5 shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', katColors[a.kategorie])}>{a.kategorie}</span>
                <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', prioColors[a.prioritaet])}>{a.prioritaet}</span>
              </div>
              <p className="font-medium text-stone-900">{a.titel}</p>
              {a.notiz && <p className="text-sm text-stone-500 mt-0.5">{a.notiz}</p>}
              <div className="flex flex-wrap gap-x-4 mt-2 text-xs text-stone-400">
                {a.faellig && <span>Fällig: {a.faellig}</span>}
                {a.verantwortlich && <span>Verantw.: {a.verantwortlich}</span>}
              </div>
            </div>
            <button onClick={() => remove(a.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-stone-300 hover:text-red-600 transition-colors shrink-0">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
        {offen.length === 0 && (
          <div className="flex items-center justify-center gap-2 py-10 text-green-700 bg-green-50 rounded-xl border border-green-200">
            <CheckCircle2 className="w-5 h-5" />
            <span className="font-medium">Alle Aufgaben erledigt!</span>
          </div>
        )}
      </div>

      {/* Completed tasks */}
      {erledigt.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-stone-400 mb-2">Erledigt ({erledigt.length})</h2>
          <div className="space-y-2">
            {erledigt.map((a) => (
              <div key={a.id} className="bg-stone-50 rounded-xl border border-stone-100 p-4 flex items-start gap-4 opacity-60">
                <Checkbox checked={true} onCheckedChange={() => toggle(a.id)} className="mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-stone-500 line-through">{a.titel}</p>
                </div>
                <button onClick={() => remove(a.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-stone-300 hover:text-red-500 transition-colors shrink-0">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
