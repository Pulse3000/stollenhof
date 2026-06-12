import { DollarSign, TrendingUp, CreditCard, Wallet, AlertCircle } from 'lucide-react'

const einnahmen2026 = [
  { monat: 'Januar', buchungen: 720, milch: 5963, summe: 6683 },
  { monat: 'Februar', buchungen: 840, milch: 6223, summe: 7063 },
  { monat: 'März', buchungen: 960, milch: 6471, summe: 7431 },
  { monat: 'April', buchungen: 720, milch: 6749, summe: 7469 },
  { monat: 'Mai', buchungen: 1680, milch: 7104, summe: 8784 },
  { monat: 'Juni', buchungen: 2160, milch: 7326, summe: 9486 },
  { monat: 'Juli', buchungen: 2640, milch: 7437, summe: 10077 },
  { monat: 'August', buchungen: 2400, milch: 7215, summe: 9615 },
  { monat: 'September', buchungen: 1440, milch: 6993, summe: 8433 },
  { monat: 'Oktober', buchungen: 960, milch: 6512, summe: 7472 },
  { monat: 'November', buchungen: 480, milch: 6216, summe: 6696 },
  { monat: 'Dezember', buchungen: 1080, milch: 5994, summe: 7074 },
]

const ausgaben2026 = [
  { monat: 'Januar', futter: 1200, wartung: 400, nebenkosten: 600, sonstiges: 300, summe: 2500 },
  { monat: 'Februar', futter: 1200, wartung: 350, nebenkosten: 600, sonstiges: 280, summe: 2430 },
  { monat: 'März', futter: 1100, wartung: 300, nebenkosten: 600, sonstiges: 250, summe: 2250 },
  { monat: 'April', futter: 1150, wartung: 450, nebenkosten: 600, sonstiges: 320, summe: 2520 },
  { monat: 'Mai', futter: 1000, wartung: 400, nebenkosten: 650, sonstiges: 400, summe: 2450 },
  { monat: 'Juni', futter: 900, wartung: 500, nebenkosten: 700, sonstiges: 350, summe: 2450 },
  { monat: 'Juli', futter: 850, wartung: 600, nebenkosten: 750, sonstiges: 400, summe: 2600 },
  { monat: 'August', futter: 900, wartung: 550, nebenkosten: 700, sonstiges: 380, summe: 2530 },
  { monat: 'September', futter: 1050, wartung: 400, nebenkosten: 650, sonstiges: 320, summe: 2420 },
  { monat: 'Oktober', futter: 1200, wartung: 350, nebenkosten: 600, sonstiges: 300, summe: 2450 },
  { monat: 'November', futter: 1300, wartung: 300, nebenkosten: 600, sonstiges: 280, summe: 2480 },
  { monat: 'Dezember', futter: 1200, wartung: 450, nebenkosten: 650, sonstiges: 350, summe: 2650 },
]

const gesamtEinnahmen = einnahmen2026.reduce((s, m) => s + m.summe, 0)
const gesamtAusgaben = ausgaben2026.reduce((s, m) => s + m.summe, 0)
const gewinn = gesamtEinnahmen - gesamtAusgaben

const buchungenTotal = einnahmen2026.reduce((s, m) => s + m.buchungen, 0)
const milchTotal = einnahmen2026.reduce((s, m) => s + m.milch, 0)

export default function FinanzenPage() {
  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Finanzen 2026</h1>
        <p className="text-stone-500 mt-0.5 text-sm">Einnahmen, Ausgaben und Gewinn</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-stone-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-green-600" />
            <span className="text-xs text-stone-500">Gesamt-Einnahmen</span>
          </div>
          <p className="text-2xl font-bold text-stone-900">{gesamtEinnahmen.toLocaleString('de-DE')} €</p>
          <p className="text-xs text-stone-400 mt-1">Jan – Dez 2026</p>
        </div>

        <div className="bg-white rounded-xl border border-stone-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <CreditCard className="w-4 h-4 text-red-600" />
            <span className="text-xs text-stone-500">Gesamt-Ausgaben</span>
          </div>
          <p className="text-2xl font-bold text-stone-900">{gesamtAusgaben.toLocaleString('de-DE')} €</p>
          <p className="text-xs text-stone-400 mt-1">Jan – Dez 2026</p>
        </div>

        <div className="bg-white rounded-xl border border-stone-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Wallet className="w-4 h-4 text-green-600" />
            <span className="text-xs text-stone-500">Netto-Gewinn</span>
          </div>
          <p className="text-2xl font-bold text-green-600">{gewinn.toLocaleString('de-DE')} €</p>
          <p className="text-xs text-stone-400 mt-1">{((gewinn / gesamtEinnahmen) * 100).toFixed(1)}% Marge</p>
        </div>

        <div className="bg-white rounded-xl border border-stone-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            <span className="text-xs text-stone-500">Ø pro Monat</span>
          </div>
          <p className="text-2xl font-bold text-stone-900">{(gewinn / 12).toLocaleString('de-DE')} €</p>
          <p className="text-xs text-stone-400 mt-1">Durchschnittlicher Gewinn</p>
        </div>
      </div>

      {/* Einnahmen Breakdown */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-stone-200 p-5">
          <h2 className="font-semibold text-stone-900 mb-3">Einnahmen nach Quelle</h2>
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-stone-500">Siloturm-Buchungen</span>
                <span className="font-bold text-green-700">{buchungenTotal.toLocaleString('de-DE')} €</span>
              </div>
              <div className="h-2 rounded-full bg-stone-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-green-500"
                  style={{ width: `${(buchungenTotal / gesamtEinnahmen) * 100}%` }}
                />
              </div>
              <p className="text-xs text-stone-400 mt-1">
                {((buchungenTotal / gesamtEinnahmen) * 100).toFixed(1)}% der Einnahmen
              </p>
            </div>
            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-stone-500">Milch-Verkauf</span>
                <span className="font-bold text-blue-700">{milchTotal.toLocaleString('de-DE')} €</span>
              </div>
              <div className="h-2 rounded-full bg-stone-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-blue-500"
                  style={{ width: `${(milchTotal / gesamtEinnahmen) * 100}%` }}
                />
              </div>
              <p className="text-xs text-stone-400 mt-1">
                {((milchTotal / gesamtEinnahmen) * 100).toFixed(1)}% der Einnahmen
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-stone-200 p-5">
          <h2 className="font-semibold text-stone-900 mb-3">Ausgaben nach Kategorie</h2>
          <div className="space-y-2.5 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-stone-500">Futter & Stroh</span>
              <span className="font-bold text-stone-900">{ausgaben2026.reduce((s, m) => s + m.futter, 0).toLocaleString('de-DE')} €</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-stone-500">Wartung & Reparatur</span>
              <span className="font-bold text-stone-900">{ausgaben2026.reduce((s, m) => s + m.wartung, 0).toLocaleString('de-DE')} €</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-stone-500">Nebenkosten</span>
              <span className="font-bold text-stone-900">{ausgaben2026.reduce((s, m) => s + m.nebenkosten, 0).toLocaleString('de-DE')} €</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-stone-500">Sonstiges</span>
              <span className="font-bold text-stone-900">{ausgaben2026.reduce((s, m) => s + m.sonstiges, 0).toLocaleString('de-DE')} €</span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-stone-100">
              <span className="text-stone-600 font-medium">Gesamt</span>
              <span className="font-bold text-stone-900">{gesamtAusgaben.toLocaleString('de-DE')} €</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-700 to-green-600 rounded-xl p-5 text-white">
          <h2 className="font-semibold mb-4">Ergebnis-Highlights</h2>
          <div className="space-y-3 text-sm">
            <div>
              <span className="text-green-100">Bester Monat</span>
              <p className="font-semibold text-lg">Juli – 7.477 € Gewinn</p>
            </div>
            <div>
              <span className="text-green-100">Profitabilität</span>
              <p className="font-semibold text-lg">{((gewinn / gesamtEinnahmen) * 100).toFixed(1)}%</p>
            </div>
            <div className="pt-2 border-t border-green-400">
              <span className="text-green-100 text-xs">Betriebslage</span>
              <p className="text-green-50">Stabil – gesundes Wachstum</p>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly table */}
      <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-stone-100">
          <h2 className="font-semibold text-stone-900">Monatlicher Überblick</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-100 bg-stone-50">
                <th className="text-left px-6 py-3 font-semibold text-stone-600">Monat</th>
                <th className="text-right px-4 py-3 font-semibold text-stone-600">Buchungen</th>
                <th className="text-right px-4 py-3 font-semibold text-stone-600">Milch</th>
                <th className="text-right px-4 py-3 font-semibold text-stone-600">Einnahmen</th>
                <th className="text-right px-4 py-3 font-semibold text-stone-600">Ausgaben</th>
                <th className="text-right px-4 py-3 font-semibold text-stone-600">Gewinn</th>
                <th className="text-right px-4 py-3 font-semibold text-stone-600">Marge</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {einnahmen2026.map((e, i) => {
                const a = ausgaben2026[i]
                const gewinnMonth = e.summe - a.summe
                const margin = ((gewinnMonth / e.summe) * 100).toFixed(1)
                return (
                  <tr key={e.monat} className="hover:bg-stone-50">
                    <td className="px-6 py-3 font-medium text-stone-900">{e.monat}</td>
                    <td className="text-right px-4 py-3 text-green-700 font-medium">{e.buchungen.toLocaleString('de-DE')} €</td>
                    <td className="text-right px-4 py-3 text-blue-700 font-medium">{e.milch.toLocaleString('de-DE')} €</td>
                    <td className="text-right px-4 py-3 text-stone-700 font-medium">{e.summe.toLocaleString('de-DE')} €</td>
                    <td className="text-right px-4 py-3 text-red-600">{a.summe.toLocaleString('de-DE')} €</td>
                    <td className="text-right px-4 py-3 font-bold text-green-700">{gewinnMonth.toLocaleString('de-DE')} €</td>
                    <td className="text-right px-4 py-3 text-stone-600">{margin}%</td>
                  </tr>
                )
              })}
              <tr className="bg-stone-50 border-t-2 border-stone-200">
                <td className="px-6 py-3 font-bold text-stone-900">Gesamt 2026</td>
                <td className="text-right px-4 py-3 font-bold text-green-700">{buchungenTotal.toLocaleString('de-DE')} €</td>
                <td className="text-right px-4 py-3 font-bold text-blue-700">{milchTotal.toLocaleString('de-DE')} €</td>
                <td className="text-right px-4 py-3 font-bold text-stone-900">{gesamtEinnahmen.toLocaleString('de-DE')} €</td>
                <td className="text-right px-4 py-3 font-bold text-red-600">{gesamtAusgaben.toLocaleString('de-DE')} €</td>
                <td className="text-right px-4 py-3 font-bold text-green-700 text-lg">{gewinn.toLocaleString('de-DE')} €</td>
                <td className="text-right px-4 py-3 font-bold text-stone-900">{((gewinn / gesamtEinnahmen) * 100).toFixed(1)}%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
