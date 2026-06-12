import { TrendingUp, Users, Home, Droplets, BarChart3, Calendar } from 'lucide-react'

const jahresDaten2026 = {
  bookings: [
    { monat: 'Jan', tage: 5, personen: 8, auslastung: 16 },
    { monat: 'Feb', tage: 7, personen: 12, auslastung: 25 },
    { monat: 'Mär', tage: 8, personen: 14, auslastung: 26 },
    { monat: 'Apr', tage: 6, personen: 10, auslastung: 20 },
    { monat: 'Mai', tage: 14, personen: 28, auslastung: 45 },
    { monat: 'Jun', tage: 18, personen: 35, auslastung: 60 },
    { monat: 'Jul', tage: 22, personen: 42, auslastung: 71 },
    { monat: 'Aug', tage: 20, personen: 38, auslastung: 65 },
    { monat: 'Sep', tage: 12, personen: 22, auslastung: 40 },
    { monat: 'Okt', tage: 8, personen: 16, auslastung: 26 },
    { monat: 'Nov', tage: 4, personen: 8, auslastung: 13 },
    { monat: 'Dez', tage: 9, personen: 18, auslastung: 29 },
  ],
  milch: [
    { monat: 'Jan', kg: 16100, eur: 5963 },
    { monat: 'Feb', kg: 16820, eur: 6223 },
    { monat: 'Mär', kg: 17490, eur: 6471 },
    { monat: 'Apr', kg: 18240, eur: 6749 },
    { monat: 'Mai', kg: 19200, eur: 7104 },
    { monat: 'Jun', kg: 19800, eur: 7326 },
    { monat: 'Jul', kg: 20100, eur: 7437 },
    { monat: 'Aug', kg: 19500, eur: 7215 },
    { monat: 'Sep', kg: 18900, eur: 6993 },
    { monat: 'Okt', kg: 17600, eur: 6512 },
    { monat: 'Nov', kg: 16800, eur: 6216 },
    { monat: 'Dez', kg: 16200, eur: 5994 },
  ],
}

const stats = [
  {
    label: 'Ø Auslastung',
    value: '38%',
    change: '+12%',
    color: 'text-green-600',
    bg: 'bg-green-50',
    icon: Home,
  },
  {
    label: 'Ø Milch/Monat',
    value: '18.140 kg',
    change: '+3,2%',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    icon: Droplets,
  },
  {
    label: 'Gäste gesamt',
    value: '245',
    change: '+18 YoY',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    icon: Users,
  },
  {
    label: 'Ø Nächte/Buchung',
    value: '5,2',
    change: '+0,8',
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    icon: Calendar,
  },
]

const maxAuslastung = Math.max(...jahresDaten2026.bookings.map((b) => b.auslastung))
const maxMilch = Math.max(...jahresDaten2026.milch.map((m) => m.kg))

export default function StatistikenPage() {
  const gesamtTage = jahresDaten2026.bookings.reduce((s, b) => s + b.tage, 0)
  const gesamtPersonen = jahresDaten2026.bookings.reduce((s, b) => s + b.personen, 0)
  const gesamtMilch = jahresDaten2026.milch.reduce((s, m) => s + m.kg, 0)
  const gesamtMilchEUR = jahresDaten2026.milch.reduce((s, m) => s + m.eur, 0)
  const durchschnittAuslastung = Math.round(
    jahresDaten2026.bookings.reduce((s, b) => s + b.auslastung, 0) / 12
  )

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Jahresstatistiken 2026</h1>
        <p className="text-stone-500 mt-0.5 text-sm">Übersicht über Buchungen, Gäste und Milchproduktion</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => {
          const Icon = s.icon
          return (
            <div key={s.label} className="bg-white rounded-xl border border-stone-200 p-4">
              <div className={`inline-flex p-2.5 rounded-lg ${s.bg} mb-2`}>
                <Icon className={`w-4 h-4 ${s.color}`} />
              </div>
              <p className="text-lg font-bold text-stone-900">{s.value}</p>
              <p className="text-xs text-stone-500 mt-0.5">{s.label}</p>
              <p className={`text-xs mt-1.5 font-medium ${s.color}`}>{s.change}</p>
            </div>
          )
        })}
      </div>

      {/* Jahreszusammenfassung */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-stone-200 p-5">
          <h2 className="font-semibold text-stone-900 mb-3">Buchungen</h2>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-stone-500">Gebuchte Nächte</span>
              <span className="font-bold text-stone-900">{gesamtTage}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-stone-500">Gäste gesamt</span>
              <span className="font-bold text-stone-900">{gesamtPersonen}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-stone-500">Ø pro Buchung</span>
              <span className="font-bold text-stone-900">{(gesamtPersonen / 48).toFixed(1)}</span>
            </div>
            <div className="flex items-center justify-between text-sm pt-2 border-t border-stone-100">
              <span className="text-stone-500">Ø Auslastung</span>
              <span className="font-bold text-green-700">{durchschnittAuslastung}%</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-stone-200 p-5">
          <h2 className="font-semibold text-stone-900 mb-3">Milchproduktion</h2>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-stone-500">Gesamt 2026</span>
              <span className="font-bold text-stone-900">{gesamtMilch.toLocaleString('de-DE')} kg</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-stone-500">Ø pro Monat</span>
              <span className="font-bold text-stone-900">{Math.round(gesamtMilch / 12).toLocaleString('de-DE')} kg</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-stone-500">Ø pro Kuh/Tag</span>
              <span className="font-bold text-stone-900">17,3 kg</span>
            </div>
            <div className="flex items-center justify-between text-sm pt-2 border-t border-stone-100">
              <span className="text-stone-500">Ø Wert</span>
              <span className="font-bold text-green-700">{(gesamtMilchEUR / 12).toFixed(0)} €/Mo</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-stone-200 p-5">
          <h2 className="font-semibold text-stone-900 mb-3">Höchstquoten</h2>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-stone-500">Beste Auslastung</span>
              <span className="font-bold text-stone-900">{Math.max(...jahresDaten2026.bookings.map((b) => b.auslastung))}% (Jul)</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-stone-500">Meiste Gäste</span>
              <span className="font-bold text-stone-900">{Math.max(...jahresDaten2026.bookings.map((b) => b.personen))} (Jul)</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-stone-500">Höchste Milch</span>
              <span className="font-bold text-stone-900">{Math.max(...jahresDaten2026.milch.map((m) => m.kg)).toLocaleString('de-DE')} kg (Jul)</span>
            </div>
            <div className="flex items-center justify-between text-sm pt-2 border-t border-stone-100">
              <span className="text-stone-500">Spitzenwert</span>
              <span className="font-bold text-green-700">{Math.max(...jahresDaten2026.milch.map((m) => m.eur)).toFixed(0)} € (Jul)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Auslastungschart */}
      <div className="bg-white rounded-xl border border-stone-200 p-6">
        <h2 className="font-semibold text-stone-900 mb-5">Auslastung Siloturm – Monatlicher Verlauf</h2>
        <div className="flex items-end gap-3 h-48">
          {jahresDaten2026.bookings.map((b) => {
            const heightPct = (b.auslastung / maxAuslastung) * 100
            return (
              <div key={b.monat} className="flex-1 flex flex-col items-center gap-2">
                <span className="text-xs font-medium text-stone-600">{b.auslastung}%</span>
                <div
                  className="w-full rounded-t-md bg-gradient-to-t from-green-500 to-green-400 transition-all hover:from-green-600 hover:to-green-500 cursor-pointer"
                  style={{ height: `${heightPct}%` }}
                  title={`${b.monat}: ${b.auslastung}% (${b.tage} Nächte, ${b.personen} Gäste)`}
                />
                <span className="text-xs text-stone-400">{b.monat}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Milchproduktionschart */}
      <div className="bg-white rounded-xl border border-stone-200 p-6">
        <h2 className="font-semibold text-stone-900 mb-5">Milchproduktion – Monatlicher Verlauf</h2>
        <div className="flex items-end gap-3 h-48">
          {jahresDaten2026.milch.map((m) => {
            const heightPct = (m.kg / maxMilch) * 100
            return (
              <div key={m.monat} className="flex-1 flex flex-col items-center gap-2">
                <span className="text-xs font-medium text-stone-600">{(m.kg / 1000).toFixed(1)}t</span>
                <div
                  className="w-full rounded-t-md bg-gradient-to-t from-blue-500 to-blue-400 transition-all hover:from-blue-600 hover:to-blue-500 cursor-pointer"
                  style={{ height: `${heightPct}%` }}
                  title={`${m.monat}: ${m.kg.toLocaleString('de-DE')} kg = ${m.eur.toFixed(0)} €`}
                />
                <span className="text-xs text-stone-400">{m.monat}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Vergleich */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-stone-200 p-6">
          <h2 className="font-semibold text-stone-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-stone-400" />
            Buchungen pro Monat
          </h2>
          <div className="space-y-2">
            {jahresDaten2026.bookings.map((b) => (
              <div key={b.monat} className="flex items-center justify-between text-sm">
                <span className="text-stone-600 w-12">{b.monat}</span>
                <div className="flex-1 mx-3 h-6 rounded-full bg-stone-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-green-500"
                    style={{ width: `${(b.tage / 25) * 100}%` }}
                  />
                </div>
                <span className="text-stone-700 font-medium w-12 text-right">{b.tage} Nächte</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-stone-200 p-6">
          <h2 className="font-semibold text-stone-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-stone-400" />
            Milcherlöse pro Monat
          </h2>
          <div className="space-y-2">
            {jahresDaten2026.milch.map((m) => (
              <div key={m.monat} className="flex items-center justify-between text-sm">
                <span className="text-stone-600 w-12">{m.monat}</span>
                <div className="flex-1 mx-3 h-6 rounded-full bg-stone-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-blue-500"
                    style={{ width: `${(m.eur / 7500) * 100}%` }}
                  />
                </div>
                <span className="text-stone-700 font-medium w-16 text-right">{m.eur.toFixed(0)} €</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
