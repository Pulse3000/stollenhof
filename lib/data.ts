/**
 * Shared data types, seed data, and storage keys for the Stollenhof app.
 * All persisted state in the app uses these keys with usePersistedState.
 */

export const STORAGE_KEYS = {
  buchungen: 'stollenhof-buchungen',
  aufgaben: 'stollenhof-aufgaben',
  events: 'stollenhof-events',
  gaeste: 'stollenhof-gaeste',
  futter: 'stollenhof-futter',
} as const

// ---------- Buchungen ----------
export type BuchungStatus = 'Bestätigt' | 'Ausstehend' | 'Abgesagt'

export type Buchung = {
  id: number
  gast: string
  email: string
  telefon: string
  anreise: string
  abreise: string
  personen: number
  unterkunft: string
  status: BuchungStatus
  notizen: string
}

export const initialBuchungen: Buchung[] = [
  { id: 1, gast: 'Familie Müller', email: 'mueller@example.de', telefon: '0711 123456', anreise: '2026-05-10', abreise: '2026-05-17', personen: 4, unterkunft: 'Siloturm', status: 'Bestätigt', notizen: 'Allergiker – kein Hundefell' },
  { id: 2, gast: 'Herr & Frau Bauer', email: 'bauer@example.de', telefon: '0721 987654', anreise: '2026-05-18', abreise: '2026-05-22', personen: 2, unterkunft: 'Siloturm', status: 'Bestätigt', notizen: '' },
  { id: 3, gast: 'Familie Weber', email: 'weber@example.de', telefon: '089 456789', anreise: '2026-05-24', abreise: '2026-05-31', personen: 5, unterkunft: 'Siloturm', status: 'Ausstehend', notizen: 'Frühbucherrabatt anfragen' },
  { id: 4, gast: 'Familie Schmitt', email: 'schmitt@example.de', telefon: '0711 654321', anreise: '2026-06-02', abreise: '2026-06-09', personen: 3, unterkunft: 'Siloturm', status: 'Bestätigt', notizen: '' },
  { id: 5, gast: 'Frau Hoffmann', email: 'hoffmann@example.de', telefon: '030 112233', anreise: '2026-06-14', abreise: '2026-06-21', personen: 2, unterkunft: 'Siloturm', status: 'Ausstehend', notizen: 'Vegetarierin' },
  { id: 6, gast: 'Familie Fischer', email: 'fischer@example.de', telefon: '069 445566', anreise: '2026-07-05', abreise: '2026-07-12', personen: 6, unterkunft: 'Siloturm', status: 'Bestätigt', notizen: 'Kinder unter 12 Jahren: 2x' },
  { id: 7, gast: 'Herr Koch', email: 'koch@example.de', telefon: '0721 334455', anreise: '2026-04-01', abreise: '2026-04-07', personen: 2, unterkunft: 'Siloturm', status: 'Bestätigt', notizen: '' },
]

// ---------- Aufgaben ----------
export type Prioritaet = 'Hoch' | 'Mittel' | 'Niedrig'
export type Kategorie = 'Stall' | 'Feld' | 'Gäste' | 'Verwaltung' | 'Wartung'

export type Aufgabe = {
  id: number
  titel: string
  kategorie: Kategorie
  prioritaet: Prioritaet
  faellig: string
  verantwortlich: string
  erledigt: boolean
  notiz: string
}

export const initialAufgaben: Aufgabe[] = [
  { id: 1, titel: 'Kuh Nr. 14 (Nora) – Nachkontrolle beim Tierarzt', kategorie: 'Stall', prioritaet: 'Hoch', faellig: '08.05.2026', verantwortlich: 'Hans Schabel', erledigt: false, notiz: 'Termin mit Dr. Baum um 09:00 Uhr' },
  { id: 2, titel: 'Siloturm für Familie Müller vorbereiten', kategorie: 'Gäste', prioritaet: 'Hoch', faellig: '09.05.2026', verantwortlich: 'Maria Schabel', erledigt: false, notiz: 'Anreise 10.05. – Bettwäsche wechseln, Willkommenskorb befüllen' },
  { id: 3, titel: 'Weide für Herde öffnen (Umtrieb)', kategorie: 'Feld', prioritaet: 'Mittel', faellig: '10.05.2026', verantwortlich: 'Hans Schabel', erledigt: false, notiz: 'Zaunpfahl auf der Nordseite prüfen' },
  { id: 4, titel: 'Milchkühlung warten – Filter reinigen', kategorie: 'Wartung', prioritaet: 'Mittel', faellig: '12.05.2026', verantwortlich: 'Hans Schabel', erledigt: false, notiz: '' },
  { id: 5, titel: 'Monatliche Buchhaltung April abschließen', kategorie: 'Verwaltung', prioritaet: 'Mittel', faellig: '15.05.2026', verantwortlich: 'Maria Schabel', erledigt: false, notiz: 'Milchgeldabrechnung Schrozberg noch ausstehend' },
  { id: 6, titel: 'Hühnerstall desinfizieren', kategorie: 'Stall', prioritaet: 'Niedrig', faellig: '20.05.2026', verantwortlich: 'Johann Schabel', erledigt: false, notiz: '' },
  { id: 7, titel: 'Demeter-Meldung Q2 vorbereiten', kategorie: 'Verwaltung', prioritaet: 'Mittel', faellig: '25.05.2026', verantwortlich: 'Maria Schabel', erledigt: false, notiz: '' },
  { id: 8, titel: 'Traktor – Ölwechsel', kategorie: 'Wartung', prioritaet: 'Niedrig', faellig: '31.05.2026', verantwortlich: 'Hans Schabel', erledigt: true, notiz: 'Erledigt am 02.04.' },
  { id: 9, titel: 'Schreibtisch aufräumen – Archiv Q1', kategorie: 'Verwaltung', prioritaet: 'Niedrig', faellig: '30.04.2026', verantwortlich: 'Maria Schabel', erledigt: true, notiz: '' },
]

// ---------- Veranstaltungen ----------
export type EventKategorie = 'Führung' | 'Workshop' | 'Feier' | 'Besichtigung' | 'Sonstiges'

export type Event = {
  id: number
  titel: string
  datum: string
  uhrzeit: string
  ort: string
  maxTeilnehmer: number
  angemeldet: number
  beschreibung: string
  kategorie: EventKategorie
}

export const initialEvents: Event[] = [
  { id: 1, titel: 'Pizzabacken auf dem Hof', datum: '2026-05-17', uhrzeit: '14:00', ort: 'Backofen beim Stall', maxTeilnehmer: 20, angemeldet: 14, beschreibung: 'Gemeinsames Pizzabacken mit selbst gemachtem Teig im Holzofen. Für Familien und Kinder besonders geeignet.', kategorie: 'Workshop' },
  { id: 2, titel: 'Hofführung für Schulklasse', datum: '2026-05-25', uhrzeit: '09:00', ort: 'Gesamter Hof', maxTeilnehmer: 30, angemeldet: 28, beschreibung: 'Führung durch den Demeter-Betrieb für eine 3. Klasse der Grundschule Rechberg. Schwerpunkt: Milchwirtschaft.', kategorie: 'Führung' },
  { id: 3, titel: 'Demeter-Betriebsbesichtigung', datum: '2026-06-14', uhrzeit: '10:00', ort: 'Oberer Stollenhof', maxTeilnehmer: 15, angemeldet: 9, beschreibung: 'Besichtigung für interessierte Bio-Landwirte aus der Region. Austausch über Demeter-Richtlinien und Betriebskonzept.', kategorie: 'Besichtigung' },
  { id: 4, titel: 'Käseworkshop', datum: '2026-06-28', uhrzeit: '11:00', ort: 'Hofküche', maxTeilnehmer: 12, angemeldet: 6, beschreibung: 'Einführung in die Käseherstellung mit frischer Rohmilch vom Hof. Jeder Teilnehmer nimmt eigenen Käse mit nach Hause.', kategorie: 'Workshop' },
  { id: 5, titel: 'Sommerführung mit Gästen', datum: '2026-07-12', uhrzeit: '16:00', ort: 'Siloturm & Stall', maxTeilnehmer: 25, angemeldet: 12, beschreibung: 'Hofführung für aktuelle Feriengäste im Siloturm. Melken, Stallbesichtigung und Abendessen.', kategorie: 'Führung' },
  { id: 6, titel: 'Scheunenweihnacht', datum: '2026-12-19', uhrzeit: '17:00', ort: 'Scheune am Stollenhof', maxTeilnehmer: 80, angemeldet: 55, beschreibung: 'Traditionelle Scheunenweihnacht am letzten Wochenende vor dem Weihnachtsfest. Mit Punsch, Weihnachtsmarkt und Stallführung.', kategorie: 'Feier' },
  { id: 7, titel: 'Frühjahrsfest 2026', datum: '2026-04-26', uhrzeit: '12:00', ort: 'Hofgelände', maxTeilnehmer: 60, angemeldet: 60, beschreibung: 'Bereits stattgefunden. Gut besucht – 60 Gäste aus der Region.', kategorie: 'Feier' },
]

// ---------- Helpers ----------
export const TODAY_ISO = '2026-05-04'

export function formatDate(iso: string) {
  if (!iso) return ''
  const [y, m, d] = iso.split('-')
  return `${d}.${m}.${y}`
}

export function isPast(iso: string, refIso: string = TODAY_ISO) {
  return iso < refIso
}
