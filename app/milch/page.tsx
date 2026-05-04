import { Droplets, TrendingUp, TrendingDown, Award } from 'lucide-react'

const monatsdaten = [
  { monat: 'Januar 2026', kg: 16100, qualitaet: 'A', fett: 4.1, eiweiss: 3.5, zellen: 102 },
  { monat: 'Februar 2026', kg: 16820, qualitaet: 'A', fett: 4.2, eiweiss: 3.6, zellen: 95 },
  { monat: 'März 2026', kg: 17490, qualitaet: 'A', fett: 4.0, eiweiss: 3.5, zellen: 88 },
  { monat: 'April 2026', kg: 18240, qualitaet: 'A', fett: 4.3, eiweiss: 3.7, zellen: 91 },
]

const vorjahrVergleich = [
  { monat: 'Jan', v2025: 15200, v2026: 16100 },
  { monat: 'Feb', v2025: 15600, v2026: 16820 },
  { monat: 'Mär', v2025: 16100, v2026: 17490 },
  { monat: 'Apr', v2025: 17200, v2026: 18240 },
]

const lieferungen = [
  { datum: '30.04.2026', menge: '4.560 kg', molkerei: 'Molkerei Schrozberg', qualitaet: 'Demeter A', auszahlung: '1.687,20 €' },
  { datum: '15.04.2026', menge: '4.490 kg', molkerei: 'Molkerei Schrozberg', qualitaet: 'Demeter A', auszahlung: '1.661,30 €' },
  { datum: '31.03.2026', menge: '4.380 kg', molkerei: 'Molkerei Schrozberg', qualitaet: 'Demeter A', auszahlung: '1.620,60 €' },
  { datum: '15.03.2026', menge: '4.330 kg', molkerei: 'Molkerei Schrozberg', qualitaet: 'Demeter A', auszahlung: '1.602,10 €' },
  { datum: '28.02.2026', menge: '4.210 kg', molkerei: 'Molkerei Schrozberg', qualitaet: 'Demeter A', auszahlung: '1.557,70 €' },
  { datum: '15.02.2026', menge: '4.170 kg', molkerei: 'Molkerei Schrozberg', qualitaet: 'Demeter A', auszahlung: '1.542,90 €' },
]

const maxKg = Math.max(...monatsdaten.map((m) => m.kg))

export default function MilchPage() {
  const letzterMonat = monatsdaten[monatsdaten.length - 1]
  const vorletzterMonat = monatsdaten[monatsdaten.length - 2]
  const diff = letzterMonat.kg - vorletzterMonat.kg
  const diffPct = ((diff / vorletzterMonat.kg) * 100).toFixed(1)
  const gesamt2026 = monatsdaten.reduce((s, m) => s + m.kg, 0)

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Milchdaten</h1>
        <p className="text-stone-500 mt-0.5 text-sm">Lieferung an Molkerei Schrozberg · Demeter-Qualität</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-stone-200 p-5">
          <div className="flex items-center gap-2 mb-2">
            <Droplets className="w-4 h-4 text-blue-500" />
            <span className="text-xs text-stone-500">April 2026</span>
          </div>
          <p className="text-2xl font-bold text-stone-900">{letzterMonat.kg.toLocaleString('de-DE')} kg</p>
          <div className="flex items-center gap-1 mt-1">
            <TrendingUp className="w-3.5 h-3.5 text-green-600" />
            <span className="text-xs text-green-600">+{diffPct} % zum Vormonat</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-stone-200 p-5">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <span className="text-xs text-stone-500">Gesamt 2026</span>
          </div>
          <p className="text-2xl font-bold text-stone-900">{gesamt2026.toLocaleString('de-DE')} kg</p>
          <p className="text-xs text-stone-400 mt-1">Jan – Apr 2026</p>
        </div>

        <div className="bg-white rounded-xl border border-stone-200 p-5">
          <div className="flex items-center gap-2 mb-2">
            <Award className="w-4 h-4 text-amber-500" />
            <span className="text-xs text-stone-500">Qualitätsstufe</span>
          </div>
          <p className="text-2xl font-bold text-stone-900">Demeter A</p>
          <p className="text-xs text-stone-400 mt-1">Höchste Qualität</p>
        </div>

        <div className="bg-white rounded-xl border border-stone-200 p-5">
          <div className="flex items-center gap-2 mb-2">
            <Droplets className="w-4 h-4 text-sky-500" />
            <span className="text-xs text-stone-500">Ø pro Kuh/Tag</span>
          </div>
          <p className="text-2xl font-bold text-stone-900">17,4 kg</p>
          <p className="text-xs text-stone-400 mt-1">April 2026 · 35 Kühe</p>
        </div>
      </div>

      {/* Monthly bar chart */}
      <div className="bg-white rounded-xl border border-stone-200 p-6">
        <h2 className="font-semibold text-stone-900 mb-5">Monatsproduktion 2026</h2>
        <div className="flex items-end gap-6 h-40">
          {monatsdaten.map((m, i) => {
            const heightPct = (m.kg / maxKg) * 100
            const isLast = i === monatsdaten.length - 1
            return (
              <div key={m.monat} className="flex-1 flex flex-col items-center gap-2">
                <span className="text-xs font-medium text-stone-700">{m.kg.toLocaleString('de-DE')} kg</span>
                <div
                  className={`w-full rounded-t-md transition-all ${isLast ? 'bg-green-500' : 'bg-green-200'}`}
                  style={{ height: `${heightPct}%` }}
                />
                <span className="text-xs text-stone-400 whitespace-nowrap">{m.monat.split(' ')[0]}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Quality table */}
      <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-stone-100">
          <h2 className="font-semibold text-stone-900">Qualitätswerte</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-100 bg-stone-50">
                <th className="text-left px-5 py-3 font-semibold text-stone-600">Monat</th>
                <th className="text-left px-4 py-3 font-semibold text-stone-600">Menge</th>
                <th className="text-left px-4 py-3 font-semibold text-stone-600">Fett %</th>
                <th className="text-left px-4 py-3 font-semibold text-stone-600">Eiweiß %</th>
                <th className="text-left px-4 py-3 font-semibold text-stone-600">Zellzahl (tsd.)</th>
                <th className="text-left px-4 py-3 font-semibold text-stone-600">Qualität</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {[...monatsdaten].reverse().map((m) => (
                <tr key={m.monat} className="hover:bg-stone-50">
                  <td className="px-5 py-3 font-medium text-stone-900">{m.monat}</td>
                  <td className="px-4 py-3 text-stone-700">{m.kg.toLocaleString('de-DE')} kg</td>
                  <td className="px-4 py-3 text-stone-700">{m.fett.toFixed(1)}</td>
                  <td className="px-4 py-3 text-stone-700">{m.eiweiss.toFixed(1)}</td>
                  <td className="px-4 py-3 text-stone-700">{m.zellen}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2.5 py-1 rounded-full bg-green-100 text-green-800 font-medium">
                      Demeter {m.qualitaet}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent deliveries */}
      <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-stone-100">
          <h2 className="font-semibold text-stone-900">Letzte Lieferungen</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-100 bg-stone-50">
                <th className="text-left px-5 py-3 font-semibold text-stone-600">Datum</th>
                <th className="text-left px-4 py-3 font-semibold text-stone-600">Menge</th>
                <th className="text-left px-4 py-3 font-semibold text-stone-600">Molkerei</th>
                <th className="text-left px-4 py-3 font-semibold text-stone-600">Qualität</th>
                <th className="text-left px-4 py-3 font-semibold text-stone-600">Auszahlung</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {lieferungen.map((l) => (
                <tr key={l.datum} className="hover:bg-stone-50">
                  <td className="px-5 py-3 text-stone-700">{l.datum}</td>
                  <td className="px-4 py-3 font-medium text-stone-900">{l.menge}</td>
                  <td className="px-4 py-3 text-stone-600">{l.molkerei}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2.5 py-1 rounded-full bg-green-100 text-green-800 font-medium">{l.qualitaet}</span>
                  </td>
                  <td className="px-4 py-3 font-medium text-green-700">{l.auszahlung}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
