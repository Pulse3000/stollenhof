'use client'

import { useState } from 'react'
import { Plus, Calendar, MapPin, Users, Clock, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

type Event = {
  id: number
  titel: string
  datum: string
  uhrzeit: string
  ort: string
  maxTeilnehmer: number
  angemeldet: number
  beschreibung: string
  kategorie: 'Führung' | 'Workshop' | 'Feier' | 'Besichtigung' | 'Sonstiges'
}

const initialEvents: Event[] = [
  { id: 1, titel: 'Pizzabacken auf dem Hof', datum: '2026-05-17', uhrzeit: '14:00', ort: 'Backofen beim Stall', maxTeilnehmer: 20, angemeldet: 14, beschreibung: 'Gemeinsames Pizzabacken mit selbst gemachtem Teig im Holzofen. Für Familien und Kinder besonders geeignet.', kategorie: 'Workshop' },
  { id: 2, titel: 'Hofführung für Schulklasse', datum: '2026-05-25', uhrzeit: '09:00', ort: 'Gesamter Hof', maxTeilnehmer: 30, angemeldet: 28, beschreibung: 'Führung durch den Demeter-Betrieb für eine 3. Klasse der Grundschule Rechberg. Schwerpunkt: Milchwirtschaft.', kategorie: 'Führung' },
  { id: 3, titel: 'Demeter-Betriebsbesichtigung', datum: '2026-06-14', uhrzeit: '10:00', ort: 'Oberer Stollenhof', maxTeilnehmer: 15, angemeldet: 9, beschreibung: 'Besichtigung für interessierte Bio-Landwirte aus der Region. Austausch über Demeter-Richtlinien und Betriebskonzept.', kategorie: 'Besichtigung' },
  { id: 4, titel: 'Käseworkshop', datum: '2026-06-28', uhrzeit: '11:00', ort: 'Hofküche', maxTeilnehmer: 12, angemeldet: 6, beschreibung: 'Einführung in die Käseherstellung mit frischer Rohmilch vom Hof. Jeder Teilnehmer nimmt eigenen Käse mit nach Hause.', kategorie: 'Workshop' },
  { id: 5, titel: 'Sommerführung mit Gästen', datum: '2026-07-12', uhrzeit: '16:00', ort: 'Siloturm & Stall', maxTeilnehmer: 25, angemeldet: 12, beschreibung: 'Hofführung für aktuelle Feriengäste im Siloturm. Melken, Stallbesichtigung und Abendessen.', kategorie: 'Führung' },
  { id: 6, titel: 'Scheunenweihnacht', datum: '2026-12-19', uhrzeit: '17:00', ort: 'Scheune am Stollenhof', maxTeilnehmer: 80, angemeldet: 55, beschreibung: 'Traditionelle Scheunenweihnacht am letzten Wochenende vor dem Weihnachtsfest. Mit Punsch, Weihnachtsmarkt und Stallführung.', kategorie: 'Feier' },
  { id: 7, titel: 'Frühjahrsfest 2026', datum: '2026-04-26', uhrzeit: '12:00', ort: 'Hofgelände', maxTeilnehmer: 60, angemeldet: 60, beschreibung: 'Bereits stattgefunden. Gut besucht – 60 Gäste aus der Region.', kategorie: 'Feier' },
]

const kategorieColors: Record<Event['kategorie'], string> = {
  Führung: 'bg-blue-100 text-blue-800',
  Workshop: 'bg-green-100 text-green-800',
  Feier: 'bg-purple-100 text-purple-800',
  Besichtigung: 'bg-amber-100 text-amber-800',
  Sonstiges: 'bg-stone-100 text-stone-600',
}

function formatDate(iso: string) {
  const [y, m, d] = iso.split('-')
  return `${d}.${m}.${y}`
}

function isPast(iso: string) {
  return new Date(iso) < new Date('2026-05-04')
}

const emptyForm = (): Omit<Event, 'id'> => ({
  titel: '', datum: '', uhrzeit: '', ort: '', maxTeilnehmer: 20, angemeldet: 0, beschreibung: '', kategorie: 'Sonstiges',
})

export default function VeranstaltungenPage() {
  const [events, setEvents] = useState<Event[]>(initialEvents)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  const [form, setForm] = useState(emptyForm())

  const upcoming = events.filter((e) => !isPast(e.datum)).sort((a, b) => a.datum.localeCompare(b.datum))
  const past = events.filter((e) => isPast(e.datum)).sort((a, b) => b.datum.localeCompare(a.datum))

  function openNew() {
    setEditId(null)
    setForm(emptyForm())
    setDialogOpen(true)
  }

  function openEdit(e: Event) {
    setEditId(e.id)
    setForm({ titel: e.titel, datum: e.datum, uhrzeit: e.uhrzeit, ort: e.ort, maxTeilnehmer: e.maxTeilnehmer, angemeldet: e.angemeldet, beschreibung: e.beschreibung, kategorie: e.kategorie })
    setDialogOpen(true)
  }

  function save() {
    if (!form.titel || !form.datum) return
    if (editId !== null) {
      setEvents((prev) => prev.map((e) => e.id === editId ? { ...form, id: editId } : e))
    } else {
      const newId = Math.max(0, ...events.map((e) => e.id)) + 1
      setEvents((prev) => [...prev, { ...form, id: newId }])
    }
    setDialogOpen(false)
  }

  function remove(id: number) {
    setEvents((prev) => prev.filter((e) => e.id !== id))
  }

  function EventCard({ e }: { e: Event }) {
    const occupancyPct = Math.round((e.angemeldet / e.maxTeilnehmer) * 100)
    const past = isPast(e.datum)
    return (
      <div className={`bg-white rounded-xl border p-5 ${past ? 'border-stone-200 opacity-70' : 'border-stone-200 hover:shadow-md transition-shadow'}`}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${kategorieColors[e.kategorie]}`}>{e.kategorie}</span>
              {past && <span className="text-xs px-2 py-0.5 rounded-full bg-stone-100 text-stone-500">Vergangen</span>}
            </div>
            <h3 className="font-semibold text-stone-900">{e.titel}</h3>
            <p className="text-sm text-stone-500 mt-1 line-clamp-2">{e.beschreibung}</p>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3">
              <div className="flex items-center gap-1.5 text-sm text-stone-500">
                <Calendar className="w-3.5 h-3.5" />
                {formatDate(e.datum)} · {e.uhrzeit} Uhr
              </div>
              <div className="flex items-center gap-1.5 text-sm text-stone-500">
                <MapPin className="w-3.5 h-3.5" />
                {e.ort}
              </div>
              <div className="flex items-center gap-1.5 text-sm text-stone-500">
                <Users className="w-3.5 h-3.5" />
                {e.angemeldet} / {e.maxTeilnehmer} Pers.
              </div>
            </div>
          </div>
          <div className="flex gap-1 shrink-0">
            <button onClick={() => openEdit(e)} className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors">
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => remove(e.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-stone-400 hover:text-red-600 transition-colors">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
        {!past && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-stone-400 mb-1">
              <span>Belegung</span>
              <span>{occupancyPct} %</span>
            </div>
            <div className="h-1.5 rounded-full bg-stone-100 overflow-hidden">
              <div
                className={`h-full rounded-full ${occupancyPct >= 90 ? 'bg-red-400' : occupancyPct >= 60 ? 'bg-amber-400' : 'bg-green-400'}`}
                style={{ width: `${occupancyPct}%` }}
              />
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Veranstaltungen</h1>
          <p className="text-stone-500 mt-0.5 text-sm">{upcoming.length} bevorstehende Events</p>
        </div>
        <Button onClick={openNew} className="bg-green-700 hover:bg-green-800 text-white gap-2">
          <Plus className="w-4 h-4" /> Neue Veranstaltung
        </Button>
      </div>

      {/* Upcoming */}
      <section>
        <h2 className="font-semibold text-stone-700 mb-3 flex items-center gap-2">
          <Clock className="w-4 h-4" /> Bevorstehend
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          {upcoming.map((e) => <EventCard key={e.id} e={e} />)}
          {upcoming.length === 0 && (
            <p className="text-stone-400 text-sm col-span-2 py-6 text-center">Keine bevorstehenden Veranstaltungen.</p>
          )}
        </div>
      </section>

      {/* Past */}
      {past.length > 0 && (
        <section>
          <h2 className="font-semibold text-stone-400 mb-3">Vergangene Events</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {past.map((e) => <EventCard key={e.id} e={e} />)}
          </div>
        </section>
      )}

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editId ? 'Veranstaltung bearbeiten' : 'Neue Veranstaltung'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label>Titel *</Label>
              <Input className="mt-1" value={form.titel} onChange={(e) => setForm({ ...form, titel: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Datum *</Label>
                <Input className="mt-1" type="date" value={form.datum} onChange={(e) => setForm({ ...form, datum: e.target.value })} />
              </div>
              <div>
                <Label>Uhrzeit</Label>
                <Input className="mt-1" type="time" value={form.uhrzeit} onChange={(e) => setForm({ ...form, uhrzeit: e.target.value })} />
              </div>
            </div>
            <div>
              <Label>Ort</Label>
              <Input className="mt-1" value={form.ort} onChange={(e) => setForm({ ...form, ort: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Max. Teilnehmer</Label>
                <Input className="mt-1" type="number" min={1} value={form.maxTeilnehmer} onChange={(e) => setForm({ ...form, maxTeilnehmer: parseInt(e.target.value) || 1 })} />
              </div>
              <div>
                <Label>Angemeldet</Label>
                <Input className="mt-1" type="number" min={0} value={form.angemeldet} onChange={(e) => setForm({ ...form, angemeldet: parseInt(e.target.value) || 0 })} />
              </div>
            </div>
            <div>
              <Label>Beschreibung</Label>
              <Input className="mt-1" value={form.beschreibung} onChange={(e) => setForm({ ...form, beschreibung: e.target.value })} />
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
