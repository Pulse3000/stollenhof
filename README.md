# Oberer Stollenhof – Hofverwaltung

Modernes Verwaltungssystem für den Demeter-Biohof Oberer Stollenhof in Rechberg (Baden-Württemberg). Verwaltet Buchungen der Siloturm-Ferienwohnung, Gäste, Tiere, Milchproduktion, Veranstaltungen, Finanzen und Aufgaben.

## Features

- **Hofkalender** – visuelle Monatsansicht mit Buchungen und Veranstaltungen
- **Buchungsverwaltung** – Reservierungen für die Siloturm-Ferienwohnung mit Status-Tracking
- **Gästeverzeichnis** – Kontaktdaten, Stammgast-Markierung und Newsletter-Verwaltung
- **Tierverwaltung** – 35 Fleckvieh-Milchkühe mit individuellem Status, Hühner
- **Milchdaten** – Monatliche Produktion, Qualitätswerte (Fett/Eiweiß/Zellzahl), Lieferungen an Molkerei Schrozberg
- **Veranstaltungen** – Hofführungen, Workshops, Scheunenweihnacht
- **Statistiken** – Jahresübersicht mit Auslastung und Produktionscharts
- **Finanzen** – Einnahmen-/Ausgaben-Tracking und Gewinnmarge
- **Futterverwaltung** – Lagerbestände mit Mindestbestandswarnungen
- **Aufgaben** – Priorisierte To-do-Liste nach Kategorie

Daten werden lokal im Browser gespeichert (`localStorage`) – kein Backend nötig.

## Tech Stack

- [Next.js 16](https://nextjs.org) (App Router, Turbopack)
- [React 19](https://react.dev)
- [Tailwind CSS 4](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com) Komponenten (Radix UI)
- [Lucide Icons](https://lucide.dev)
- TypeScript

## Lokal starten

```bash
pnpm install
pnpm dev
```

Anschließend [http://localhost:3000](http://localhost:3000) öffnen.

## Build

```bash
pnpm build
pnpm start
```
