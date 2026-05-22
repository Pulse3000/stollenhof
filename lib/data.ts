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
  tiere: 'stollenhof-tiere',
  melkungen: 'stollenhof-melkungen',
  stallroutine: 'stollenhof-stallroutine',
  tierarztJournal: 'stollenhof-tierarzt',
  weiden: 'stollenhof-weiden',
  stallwacheConfig: 'stollenhof-stallwache-config',
  stallwacheEvents: 'stollenhof-stallwache-events',
  stallwacheStatus: 'stollenhof-stallwache-status',
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
  { id: 2, titel: 'Klauenpflege Herde – Termin koordinieren', kategorie: 'Stall', prioritaet: 'Hoch', faellig: '14.05.2026', verantwortlich: 'Hans Schabel', erledigt: false, notiz: 'Klauenpfleger Bauer anrufen' },
  { id: 3, titel: 'Weide für Herde öffnen (Umtrieb)', kategorie: 'Feld', prioritaet: 'Mittel', faellig: '10.05.2026', verantwortlich: 'Hans Schabel', erledigt: false, notiz: 'Zaunpfahl auf der Nordseite prüfen' },
  { id: 4, titel: 'Milchkühlung warten – Filter reinigen', kategorie: 'Wartung', prioritaet: 'Mittel', faellig: '12.05.2026', verantwortlich: 'Hans Schabel', erledigt: false, notiz: '' },
  { id: 5, titel: 'Heuvorrat für Sommer prüfen und Bestellung planen', kategorie: 'Stall', prioritaet: 'Mittel', faellig: '20.05.2026', verantwortlich: 'Hans Schabel', erledigt: false, notiz: 'Wiese & Sohn anfragen' },
  { id: 6, titel: 'Hühnerstall desinfizieren', kategorie: 'Stall', prioritaet: 'Niedrig', faellig: '20.05.2026', verantwortlich: 'Johann Schabel', erledigt: false, notiz: '' },
  { id: 7, titel: 'Siloturm für Familie Müller vorbereiten', kategorie: 'Gäste', prioritaet: 'Mittel', faellig: '09.05.2026', verantwortlich: 'Maria Schabel', erledigt: false, notiz: 'Bettwäsche wechseln, Willkommenskorb befüllen' },
  { id: 8, titel: 'Demeter-Meldung Q2 vorbereiten', kategorie: 'Verwaltung', prioritaet: 'Mittel', faellig: '25.05.2026', verantwortlich: 'Maria Schabel', erledigt: false, notiz: '' },
  { id: 9, titel: 'Traktor – Ölwechsel', kategorie: 'Wartung', prioritaet: 'Niedrig', faellig: '31.05.2026', verantwortlich: 'Hans Schabel', erledigt: true, notiz: 'Erledigt am 02.04.' },
  { id: 10, titel: 'Schreibtisch aufräumen – Archiv Q1', kategorie: 'Verwaltung', prioritaet: 'Niedrig', faellig: '30.04.2026', verantwortlich: 'Maria Schabel', erledigt: true, notiz: '' },
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

// ---------- Tiere (Kühe) ----------
export type KuhStatus = 'Gesund' | 'In Behandlung' | 'Trächtig' | 'Trockengestellt'

export type Kuh = {
  nr: number
  name: string
  alter: number
  rasse: string
  status: KuhStatus
  laktation: number
  letzteUntersuchung: string
  milchTagesleistung: number // Liter/Tag, 0 wenn trockengestellt/trächtig
  kalbungVoraussichtlich?: string // ISO date für trächtige Kühe
  notiz?: string
}

export const initialKuehe: Kuh[] = [
  { nr: 1, name: 'Alma', alter: 6, rasse: 'Fleckvieh', status: 'Gesund', laktation: 4, letzteUntersuchung: '2026-04-12', milchTagesleistung: 24 },
  { nr: 2, name: 'Berta', alter: 4, rasse: 'Fleckvieh', status: 'Trächtig', laktation: 2, letzteUntersuchung: '2026-05-01', milchTagesleistung: 12, kalbungVoraussichtlich: '2026-06-18', notiz: 'Trächtigkeit bestätigt 14.02.' },
  { nr: 3, name: 'Clara', alter: 7, rasse: 'Fleckvieh', status: 'Gesund', laktation: 5, letzteUntersuchung: '2026-04-15', milchTagesleistung: 26 },
  { nr: 4, name: 'Dora', alter: 5, rasse: 'Fleckvieh', status: 'Gesund', laktation: 3, letzteUntersuchung: '2026-04-10', milchTagesleistung: 22 },
  { nr: 5, name: 'Ella', alter: 3, rasse: 'Fleckvieh', status: 'Gesund', laktation: 1, letzteUntersuchung: '2026-04-20', milchTagesleistung: 18 },
  { nr: 6, name: 'Flora', alter: 8, rasse: 'Fleckvieh', status: 'Trockengestellt', laktation: 6, letzteUntersuchung: '2026-04-05', milchTagesleistung: 0, notiz: 'Vor Trockenstellung 28 l Tagesleistung' },
  { nr: 7, name: 'Greta', alter: 5, rasse: 'Fleckvieh', status: 'Gesund', laktation: 3, letzteUntersuchung: '2026-04-18', milchTagesleistung: 21 },
  { nr: 8, name: 'Hanna', alter: 4, rasse: 'Fleckvieh', status: 'Gesund', laktation: 2, letzteUntersuchung: '2026-04-22', milchTagesleistung: 19 },
  { nr: 9, name: 'Ida', alter: 6, rasse: 'Fleckvieh', status: 'Trächtig', laktation: 4, letzteUntersuchung: '2026-05-02', milchTagesleistung: 14, kalbungVoraussichtlich: '2026-07-04', notiz: '' },
  { nr: 10, name: 'Julia', alter: 5, rasse: 'Fleckvieh', status: 'Gesund', laktation: 3, letzteUntersuchung: '2026-04-25', milchTagesleistung: 23 },
  { nr: 11, name: 'Klara', alter: 7, rasse: 'Fleckvieh', status: 'Gesund', laktation: 5, letzteUntersuchung: '2026-04-14', milchTagesleistung: 25 },
  { nr: 12, name: 'Lisa', alter: 3, rasse: 'Fleckvieh', status: 'Gesund', laktation: 1, letzteUntersuchung: '2026-04-28', milchTagesleistung: 17 },
  { nr: 13, name: 'Maria', alter: 6, rasse: 'Fleckvieh', status: 'Gesund', laktation: 4, letzteUntersuchung: '2026-04-09', milchTagesleistung: 24 },
  { nr: 14, name: 'Nora', alter: 4, rasse: 'Fleckvieh', status: 'In Behandlung', laktation: 2, letzteUntersuchung: '2026-05-03', milchTagesleistung: 8, notiz: 'Mastitis-Verdacht – Antibiotikum, Milch separat' },
  { nr: 15, name: 'Olga', alter: 8, rasse: 'Fleckvieh', status: 'Gesund', laktation: 6, letzteUntersuchung: '2026-04-07', milchTagesleistung: 27 },
  { nr: 16, name: 'Paula', alter: 5, rasse: 'Fleckvieh', status: 'Gesund', laktation: 3, letzteUntersuchung: '2026-04-19', milchTagesleistung: 22 },
  { nr: 17, name: 'Rosa', alter: 4, rasse: 'Fleckvieh', status: 'Trächtig', laktation: 2, letzteUntersuchung: '2026-04-30', milchTagesleistung: 13, kalbungVoraussichtlich: '2026-08-12' },
  { nr: 18, name: 'Sabine', alter: 6, rasse: 'Fleckvieh', status: 'Gesund', laktation: 4, letzteUntersuchung: '2026-04-11', milchTagesleistung: 25 },
  { nr: 19, name: 'Tina', alter: 3, rasse: 'Fleckvieh', status: 'Gesund', laktation: 1, letzteUntersuchung: '2026-04-24', milchTagesleistung: 18 },
  { nr: 20, name: 'Ursula', alter: 7, rasse: 'Fleckvieh', status: 'Gesund', laktation: 5, letzteUntersuchung: '2026-04-16', milchTagesleistung: 26 },
  { nr: 21, name: 'Vera', alter: 5, rasse: 'Fleckvieh', status: 'Gesund', laktation: 3, letzteUntersuchung: '2026-04-21', milchTagesleistung: 22 },
  { nr: 22, name: 'Wanda', alter: 4, rasse: 'Fleckvieh', status: 'Gesund', laktation: 2, letzteUntersuchung: '2026-04-26', milchTagesleistung: 20 },
  { nr: 23, name: 'Xenia', alter: 6, rasse: 'Fleckvieh', status: 'Trockengestellt', laktation: 4, letzteUntersuchung: '2026-04-08', milchTagesleistung: 0, notiz: 'Kalbung erwartet 2026-05-22' },
  { nr: 24, name: 'Yvonne', alter: 5, rasse: 'Fleckvieh', status: 'Gesund', laktation: 3, letzteUntersuchung: '2026-04-17', milchTagesleistung: 23 },
  { nr: 25, name: 'Zelda', alter: 3, rasse: 'Fleckvieh', status: 'Gesund', laktation: 1, letzteUntersuchung: '2026-04-29', milchTagesleistung: 17 },
  { nr: 26, name: 'Anna', alter: 7, rasse: 'Fleckvieh', status: 'Gesund', laktation: 5, letzteUntersuchung: '2026-04-13', milchTagesleistung: 25 },
  { nr: 27, name: 'Britta', alter: 4, rasse: 'Fleckvieh', status: 'Gesund', laktation: 2, letzteUntersuchung: '2026-04-23', milchTagesleistung: 19 },
  { nr: 28, name: 'Claudia', alter: 6, rasse: 'Fleckvieh', status: 'Gesund', laktation: 4, letzteUntersuchung: '2026-04-06', milchTagesleistung: 24 },
  { nr: 29, name: 'Diana', alter: 5, rasse: 'Fleckvieh', status: 'Trächtig', laktation: 3, letzteUntersuchung: '2026-05-01', milchTagesleistung: 14, kalbungVoraussichtlich: '2026-09-03' },
  { nr: 30, name: 'Eva', alter: 8, rasse: 'Fleckvieh', status: 'Gesund', laktation: 6, letzteUntersuchung: '2026-04-04', milchTagesleistung: 26 },
  { nr: 31, name: 'Frieda', alter: 4, rasse: 'Fleckvieh', status: 'Gesund', laktation: 2, letzteUntersuchung: '2026-04-27', milchTagesleistung: 20 },
  { nr: 32, name: 'Gerda', alter: 6, rasse: 'Fleckvieh', status: 'Gesund', laktation: 4, letzteUntersuchung: '2026-04-10', milchTagesleistung: 23 },
  { nr: 33, name: 'Helga', alter: 3, rasse: 'Fleckvieh', status: 'Gesund', laktation: 1, letzteUntersuchung: '2026-04-22', milchTagesleistung: 17 },
  { nr: 34, name: 'Inge', alter: 5, rasse: 'Fleckvieh', status: 'Gesund', laktation: 3, letzteUntersuchung: '2026-04-18', milchTagesleistung: 22 },
  { nr: 35, name: 'Jana', alter: 7, rasse: 'Fleckvieh', status: 'Gesund', laktation: 5, letzteUntersuchung: '2026-04-15', milchTagesleistung: 25 },
]

// ---------- Melkprotokoll ----------
export type Melkung = {
  datum: string // ISO
  morgens: number // Liter
  abends: number // Liter
}

export const initialMelkungen: Melkung[] = [
  { datum: '2026-05-09', morgens: 318, abends: 0 },
  { datum: '2026-05-08', morgens: 322, abends: 298 },
  { datum: '2026-05-07', morgens: 319, abends: 301 },
  { datum: '2026-05-06', morgens: 315, abends: 295 },
  { datum: '2026-05-05', morgens: 320, abends: 299 },
  { datum: '2026-05-04', morgens: 312, abends: 290 },
  { datum: '2026-05-03', morgens: 308, abends: 294 },
  { datum: '2026-05-02', morgens: 316, abends: 297 },
]

// ---------- Stallroutine (täglich) ----------
export type RoutineSlot = 'Morgens' | 'Mittags' | 'Abends'

export type Stallroutine = {
  id: number
  slot: RoutineSlot
  uhrzeit: string
  aufgabe: string
  erledigt: boolean
}

export const initialStallroutine: Stallroutine[] = [
  { id: 1, slot: 'Morgens', uhrzeit: '05:30', aufgabe: 'Melken (Morgenmelkzeit)', erledigt: true },
  { id: 2, slot: 'Morgens', uhrzeit: '06:30', aufgabe: 'Stall ausmisten & Liegeboxen frisch streuen', erledigt: true },
  { id: 3, slot: 'Morgens', uhrzeit: '07:00', aufgabe: 'Heu & Kraftfutter verteilen', erledigt: true },
  { id: 4, slot: 'Morgens', uhrzeit: '07:30', aufgabe: 'Tränken kontrollieren & nachfüllen', erledigt: true },
  { id: 5, slot: 'Morgens', uhrzeit: '08:00', aufgabe: 'Hühner füttern & Eier sammeln', erledigt: true },
  { id: 6, slot: 'Mittags', uhrzeit: '12:00', aufgabe: 'Sichtkontrolle Herde auf Weide', erledigt: false },
  { id: 7, slot: 'Mittags', uhrzeit: '13:00', aufgabe: 'Behandlungsmedikament Kuh Nr. 14 (Nora)', erledigt: false },
  { id: 8, slot: 'Abends', uhrzeit: '17:00', aufgabe: 'Herde von Weide in Stall holen', erledigt: false },
  { id: 9, slot: 'Abends', uhrzeit: '17:30', aufgabe: 'Melken (Abendmelkzeit)', erledigt: false },
  { id: 10, slot: 'Abends', uhrzeit: '18:30', aufgabe: 'Heu nachfüttern & Stall kontrollieren', erledigt: false },
  { id: 11, slot: 'Abends', uhrzeit: '19:00', aufgabe: 'Hühnerstall schließen', erledigt: false },
]

// ---------- Tierarzt-Journal ----------
export type TierarztEintrag = {
  id: number
  datum: string // ISO
  kuhNr: number
  kuhName: string
  diagnose: string
  behandlung: string
  tierarzt: string
  folgetermin?: string // ISO
  abgeschlossen: boolean
}

export const initialTierarztJournal: TierarztEintrag[] = [
  { id: 1, datum: '2026-05-03', kuhNr: 14, kuhName: 'Nora', diagnose: 'Mastitis-Verdacht, erhöhte Zellzahl im Vorderviertel', behandlung: 'Antibiotikum Intramammär, Milch gesondert abmelken', tierarzt: 'Dr. Baum', folgetermin: '2026-05-10', abgeschlossen: false },
  { id: 2, datum: '2026-04-20', kuhNr: 7, kuhName: 'Greta', diagnose: 'Lahmheit Hintergliedmaße links', behandlung: 'Klauenbad, entzündungshemmend', tierarzt: 'Dr. Baum', abgeschlossen: true },
  { id: 3, datum: '2026-04-05', kuhNr: 6, kuhName: 'Flora', diagnose: 'Trockenstellen vorbereitet, letzte Kontrolle Eutergesundheit', behandlung: 'Trockensteller (Orbenin dry)', tierarzt: 'Dr. Baum', abgeschlossen: true },
  { id: 4, datum: '2026-03-15', kuhNr: 2, kuhName: 'Berta', diagnose: 'Trächtigkeitsuntersuchung – positiv, ca. Woche 12', behandlung: 'Vitamingabe, Kontrolle in 6 Wochen empfohlen', tierarzt: 'Dr. Baum', folgetermin: '2026-04-26', abgeschlossen: true },
]

// ---------- Weiden ----------
export type WeideStatus = 'In Nutzung' | 'Ruhend' | 'Gemäht' | 'Nachwuchs'
export type WeideZustand = 'Sehr gut' | 'Gut' | 'Mäßig' | 'Schlecht'

export type Weide = {
  id: number
  name: string
  hektar: number
  status: WeideStatus
  zustand: WeideZustand
  letzteNutzung: string // ISO date
  herdeAnzahl: number // Anzahl Kühe wenn 'In Nutzung', sonst 0
  bemerkung: string
}

export const initialWeiden: Weide[] = [
  { id: 1, name: 'Stollenwiese Ost', hektar: 4.2, status: 'In Nutzung', zustand: 'Gut', letzteNutzung: '2026-05-09', herdeAnzahl: 28, bemerkung: 'Klee dominant, gutes Wachstum nach Regen' },
  { id: 2, name: 'Eichwald-Koppel', hektar: 2.8, status: 'Ruhend', zustand: 'Sehr gut', letzteNutzung: '2026-04-22', herdeAnzahl: 0, bemerkung: 'Erholungsphase – Beweidung ab 18.05. geplant' },
  { id: 3, name: 'Hangwiese Süd', hektar: 3.5, status: 'Nachwuchs', zustand: 'Gut', letzteNutzung: '2026-04-30', herdeAnzahl: 0, bemerkung: 'Nachwachsendes Gras, Beweidung ab 22.05.' },
  { id: 4, name: 'Bachweide', hektar: 1.9, status: 'Gemäht', zustand: 'Gut', letzteNutzung: '2026-05-04', herdeAnzahl: 0, bemerkung: 'Erste Heumahd – ca. 40 Ballen Ertrag' },
  { id: 5, name: 'Heuwiese Nord', hektar: 5.6, status: 'Ruhend', zustand: 'Sehr gut', letzteNutzung: '2026-04-15', herdeAnzahl: 0, bemerkung: 'Reine Heuwiese – Mahd Mitte Juni geplant' },
  { id: 6, name: 'Trockenstehkoppel', hektar: 1.4, status: 'In Nutzung', zustand: 'Mäßig', letzteNutzung: '2026-05-08', herdeAnzahl: 3, bemerkung: 'Trockenstellgruppe (Flora, Xenia) und Aufzucht-Kalbin' },
]

// ---------- Stallwache (KI-Kalbungswache) ----------
// Web-Dashboard für das stallwache-skill Python-Backend
// (YOLOv8 + RTSP-Kamera via go2rtc + Telegram-Alerts)
// Kamera: LSC Smart Connect Indoor IP Camera (Tuya-basiert)
//   LAN-IP: 192.168.178.104  |  MAC: 8C:5C:53:A6:94:FB
//   Device-ID: bfd872a00d4e8fc02bkiua
// go2rtc als RTSP→Browser-Bridge (MJPEG / WebRTC / HLS)
// https://github.com/Pulse3000/stallwache-skill

export type StallwacheConfig = {
  enabled: boolean
  apiUrl: string // z.B. http://192.168.178.50:8080
  cameraName: string
  cameraIp: string             // lokale IP der Kamera
  cameraStreamUrl: string      // RTSP-URL (für Python-Backend & go2rtc, ONVIF-Auth)
  cameraStreamUrlHls: string   // HLS-URL via Cloudflare Tunnel (HTTPS-fähig)
  cameraStreamUrlMjpeg: string // optionaler MJPEG-Endpunkt (LAN-Fallback)
  cameraStreamUrlDdns: string  // legacy / generischer externer Zugang
  cameraUser: string           // ONVIF-Benutzer (Standard: admin)
  go2rtcUrl: string            // lokale go2rtc Base-URL
  go2rtcPublicUrl: string      // öffentliche go2rtc-URL via Cloudflare Tunnel
  go2rtcStreamName: string     // Name des Streams in go2rtc.yaml
  modelPath: string
  confidenceThreshold: number  // 0..1
  iouThreshold: number         // 0..1
  device: 'cpu' | 'cuda' | 'mps'
  telegramEnabled: boolean
  telegramBotToken: string
  telegramChatId: string
  telegramSendImage: boolean
  alertCooldownSeconds: number
  retentionDays: number
}

export const defaultStallwacheConfig: StallwacheConfig = {
  enabled: false,
  apiUrl: 'http://192.168.178.50:8080',
  cameraName: 'Abkalbestall Süd',
  cameraIp: '192.168.178.104',
  // RTSP-Pfad bei LSC/Tuya-Kameras: /live/ch0 mit ONVIF-Auth
  // ONVIF-Passwort wird in der LSC-App unter "PC-Ansicht/ONVIF" gesetzt
  cameraStreamUrl: 'rtsp://admin:DEIN_ONVIF_PASSWORT@192.168.178.104:554/live/ch0',
  // HLS via Cloudflare Tunnel (HTTPS – funktioniert von Vercel aus)
  cameraStreamUrlHls: 'https://stream.stollenhof.de/api/stream.m3u8?src=stallwache',
  cameraStreamUrlMjpeg: 'https://stream.stollenhof.de/api/stream.mjpeg?src=stallwache',
  cameraStreamUrlDdns: '',
  cameraUser: 'admin',
  go2rtcUrl: 'http://192.168.178.50:1984',
  go2rtcPublicUrl: 'https://stream.stollenhof.de',
  go2rtcStreamName: 'stallwache',
  modelPath: './models/yolov8n.pt',
  confidenceThreshold: 0.3,
  iouThreshold: 0.45,
  device: 'cpu',
  telegramEnabled: true,
  telegramBotToken: '',
  telegramChatId: '',
  telegramSendImage: true,
  alertCooldownSeconds: 60,
  retentionDays: 30,
}

export type StallwacheEventTyp =
  | 'Kalbung erkannt'
  | 'Aktivität'
  | 'System gestartet'
  | 'System gestoppt'
  | 'Telegram-Alert'
  | 'Fehler'

export type StallwacheEvent = {
  id: number
  zeitstempel: string // ISO datetime, z.B. 2026-05-10T03:42:18
  typ: StallwacheEventTyp
  konfidenz?: number // 0..1, nur bei Detections
  beschreibung: string
  kuhNr?: number // optional verknüpft mit Kuh
  bestaetigt: boolean
}

export const initialStallwacheEvents: StallwacheEvent[] = [
  { id: 1, zeitstempel: '2026-05-10T04:18:42', typ: 'Aktivität', konfidenz: 0.71, beschreibung: 'Erhöhte Bewegung in Abkalbebox – Kuh ist unruhig', kuhNr: 2, bestaetigt: false },
  { id: 2, zeitstempel: '2026-05-09T22:14:08', typ: 'Telegram-Alert', beschreibung: 'Alarm an Hans Schabel gesendet (Bewegungsmuster verdächtig)', kuhNr: 2, bestaetigt: true },
  { id: 3, zeitstempel: '2026-05-09T22:13:51', typ: 'Aktivität', konfidenz: 0.68, beschreibung: 'Wiederkehrende Bewegung Box 2, mehrere Aufstehphasen', kuhNr: 2, bestaetigt: true },
  { id: 4, zeitstempel: '2026-05-09T06:02:00', typ: 'System gestartet', beschreibung: 'RTSP-Stream verbunden (go2rtc · 192.168.178.104:554), YOLOv8n geladen (Device: CPU)', bestaetigt: true },
  { id: 5, zeitstempel: '2026-04-26T03:47:12', typ: 'Kalbung erkannt', konfidenz: 0.92, beschreibung: 'Kalbung erfolgreich erkannt – Kalb sichtbar auf Frame', kuhNr: 26, bestaetigt: true },
  { id: 6, zeitstempel: '2026-04-26T03:47:14', typ: 'Telegram-Alert', beschreibung: 'Alarm gesendet (Anna · 03:47 Uhr · 92 % Konfidenz)', kuhNr: 26, bestaetigt: true },
  { id: 7, zeitstempel: '2026-04-08T01:22:55', typ: 'Kalbung erkannt', konfidenz: 0.88, beschreibung: 'Kalbung erkannt – nachts in Box 1', kuhNr: 11, bestaetigt: true },
  { id: 8, zeitstempel: '2026-03-22T05:11:33', typ: 'Fehler', beschreibung: 'Stream-Verbindung verloren, automatischer Reconnect nach 12 s', bestaetigt: true },
]

export type StallwacheStatus = {
  online: boolean
  letzterHeartbeat: string // ISO datetime
  fps: number
  framesGesamt: number
  detektionenGesamt: number
  kalbungenGesamt: number
  alertsGesendet: number
  fehler: number
  uptimeSekunden: number
}

export const defaultStallwacheStatus: StallwacheStatus = {
  online: true,
  letzterHeartbeat: '2026-05-10T08:24:11',
  fps: 14.7,
  framesGesamt: 4_287_902,
  detektionenGesamt: 18_446,
  kalbungenGesamt: 12,
  alertsGesendet: 14,
  fehler: 3,
  uptimeSekunden: 612_440, // ~7 Tage
}

// ---------- Helpers ----------
export const TODAY_ISO = '2026-05-10'

export function formatDate(iso: string) {
  if (!iso) return ''
  const [y, m, d] = iso.split('-')
  return `${d}.${m}.${y}`
}

export function isPast(iso: string, refIso: string = TODAY_ISO) {
  return iso < refIso
}

export function daysUntil(iso: string, refIso: string = TODAY_ISO): number {
  const a = new Date(iso + 'T00:00:00')
  const b = new Date(refIso + 'T00:00:00')
  return Math.round((a.getTime() - b.getTime()) / (1000 * 60 * 60 * 24))
}

export function formatDateTime(iso: string) {
  if (!iso) return ''
  const d = new Date(iso)
  if (isNaN(d.getTime())) return iso
  return d.toLocaleString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatUptime(seconds: number) {
  const d = Math.floor(seconds / 86400)
  const h = Math.floor((seconds % 86400) / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (d > 0) return `${d}T ${h}h ${m}min`
  if (h > 0) return `${h}h ${m}min`
  return `${m}min`
}

export function relativeTime(iso: string, nowIso: string = `${TODAY_ISO}T12:00:00`) {
  const a = new Date(iso).getTime()
  const b = new Date(nowIso).getTime()
  if (isNaN(a) || isNaN(b)) return ''
  const diffSec = Math.round((b - a) / 1000)
  if (diffSec < 60) return 'gerade eben'
  if (diffSec < 3600) return `vor ${Math.floor(diffSec / 60)} min`
  if (diffSec < 86400) return `vor ${Math.floor(diffSec / 3600)} h`
  return `vor ${Math.floor(diffSec / 86400)} T.`
}
