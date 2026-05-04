import { Home, Users, Wifi, Car, Dog, Leaf, Phone, Mail, MapPin, CheckCircle, Info } from 'lucide-react'
import Link from 'next/link'

const ausstattung = [
  { label: 'Schlafzimmer', value: '3 (6 Schlafplätze + Zustellbett)' },
  { label: 'Badezimmer', value: '1 Bad + separates WC' },
  { label: 'Küche', value: 'Vollausgestattete Wohnküche' },
  { label: 'Wohnfläche', value: 'ca. 80 m²' },
  { label: 'Etagen', value: '3 Stockwerke im Siloturm' },
  { label: 'Heizung', value: 'Zentralheizung' },
]

const preise = [
  { zeitraum: 'Nebensaison (Jan–Apr, Okt–Nov)', preis: '90 €', einheit: 'pro Nacht' },
  { zeitraum: 'Hauptsaison (Mai–Sep)', preis: '110 €', einheit: 'pro Nacht' },
  { zeitraum: 'Feiertage & Weihnachten', preis: '130 €', einheit: 'pro Nacht' },
  { zeitraum: 'Mindestaufenthalt', preis: '4 Nächte', einheit: '' },
  { zeitraum: 'Reinigungsgebühr', preis: '60 €', einheit: 'einmalig' },
  { zeitraum: 'Haustier (Hund)', preis: '10 €', einheit: 'pro Nacht' },
]

const extras = [
  'Frühstückskorb mit frischen Hofprodukten (auf Anfrage)',
  'Bettwäsche & Handtücher inklusive',
  'Kostenloses WLAN',
  'Parkplatz auf dem Hofgelände',
  'Hunde herzlich willkommen',
  'Hofführung für Feriengäste',
  'Frische Milch und Eier direkt ab Hof',
  'Kinderspielzeug und Kinderhochstuhl verfügbar',
]

const regeln = [
  'Check-in: 15:00 – 18:00 Uhr',
  'Check-out: bis 10:00 Uhr',
  'Rauchen nur im Außenbereich',
  'Haustiere (max. 2 Hunde) auf Anfrage',
  'Keine Partys oder Feiern',
  'Ruhestunde: 22:00 – 07:00 Uhr',
]

export default function UnterkunftPage() {
  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Siloturm – Ferienwohnung</h1>
          <p className="text-stone-500 mt-0.5 text-sm">Oberer Stollenhof · 73529 Rechberg · seit Oktober 2020</p>
        </div>
        <Link href="/buchungen">
          <button className="bg-green-700 hover:bg-green-800 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
            Buchungen verwalten →
          </button>
        </Link>
      </div>

      {/* Hero card */}
      <div className="bg-gradient-to-br from-green-800 to-green-700 rounded-2xl p-8 text-white">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-white/10 rounded-xl">
            <Home className="w-6 h-6 text-green-200" />
          </div>
          <div>
            <p className="font-bold text-xl">Siloturm</p>
            <p className="text-green-200 text-sm">Umgebauter Getreidesilo · 80 m² · 3 Stockwerke</p>
          </div>
        </div>
        <p className="text-green-100 leading-relaxed max-w-2xl">
          Einzigartiges Ferienerlebnis im umgebauten Siloturm des Oberen Stollenhofs.
          Erleben Sie Demeter-Biolandbau hautnah, genießen Sie die Ruhe der Ostalb
          und kehren Sie jeden Abend in ein gemütliches, modernes Zuhause zurück.
        </p>
        <div className="flex flex-wrap gap-4 mt-5">
          {[
            { icon: Users, label: 'Bis 6+1 Personen' },
            { icon: Wifi, label: 'Kostenloses WLAN' },
            { icon: Car, label: 'Kostenloser Parkplatz' },
            { icon: Dog, label: 'Hunde willkommen' },
            { icon: Leaf, label: 'Demeter-Biohof' },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg text-sm">
              <Icon className="w-4 h-4 text-green-300" />
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Ausstattung */}
        <div className="bg-white rounded-xl border border-stone-200 p-6">
          <h2 className="font-semibold text-stone-900 mb-4">Ausstattung</h2>
          <div className="space-y-3">
            {ausstattung.map((a) => (
              <div key={a.label} className="flex items-center justify-between text-sm">
                <span className="text-stone-500">{a.label}</span>
                <span className="font-medium text-stone-800">{a.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Preise */}
        <div className="bg-white rounded-xl border border-stone-200 p-6">
          <h2 className="font-semibold text-stone-900 mb-4">Preise</h2>
          <div className="space-y-3">
            {preise.map((p) => (
              <div key={p.zeitraum} className="flex items-center justify-between text-sm">
                <span className="text-stone-500">{p.zeitraum}</span>
                <span className="font-semibold text-green-700">
                  {p.preis} <span className="text-stone-400 font-normal">{p.einheit}</span>
                </span>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-stone-400">
            Alle Preise inklusive Kurtaxe. Buchungen direkt beim Hof.
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Inklusivleistungen */}
        <div className="bg-white rounded-xl border border-stone-200 p-6">
          <h2 className="font-semibold text-stone-900 mb-4">Inklusivleistungen & Extras</h2>
          <ul className="space-y-2">
            {extras.map((e) => (
              <li key={e} className="flex items-start gap-2.5 text-sm text-stone-600">
                <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                {e}
              </li>
            ))}
          </ul>
        </div>

        {/* Hausregeln + Kontakt */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-stone-200 p-6">
            <h2 className="font-semibold text-stone-900 mb-4 flex items-center gap-2">
              <Info className="w-4 h-4 text-stone-400" />
              Hausregeln
            </h2>
            <ul className="space-y-2">
              {regeln.map((r) => (
                <li key={r} className="text-sm text-stone-600 flex items-start gap-2">
                  <span className="text-stone-300 mt-0.5">·</span>
                  {r}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-green-700 rounded-xl p-5 text-white">
            <h2 className="font-semibold mb-3">Kontakt & Buchung</h2>
            <div className="space-y-2.5">
              <div className="flex items-center gap-2.5 text-sm text-green-100">
                <Phone className="w-4 h-4 text-green-300 shrink-0" />
                <span>Familie Schabel</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm text-green-100">
                <MapPin className="w-4 h-4 text-green-300 shrink-0" />
                <span>Oberer Stollenhof 1 · 73529 Rechberg</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm text-green-100">
                <Mail className="w-4 h-4 text-green-300 shrink-0" />
                <span>info@oberer-stollenhof.de</span>
              </div>
            </div>
            <Link href="/buchungen" className="block mt-4">
              <div className="bg-white/20 hover:bg-white/30 text-white text-sm font-medium px-4 py-2 rounded-lg text-center transition-colors cursor-pointer">
                Buchung anlegen
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
