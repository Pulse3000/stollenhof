'use client'

import { useState, useEffect } from 'react'
import {
  Activity,
  AlertTriangle,
  Bell,
  Camera,
  CheckCircle2,
  Clock,
  Cloud,
  CloudRain,
  Cpu,
  Database,
  Droplets,
  Eye,
  Gauge,
  Heart,
  Layers,
  Network,
  Send,
  Sun,
  Tag,
  Thermometer,
  Volume2,
  Wifi,
  Wind,
  Zap,
} from 'lucide-react'

type TabId =
  | 'live'
  | 'sensoren'
  | 'wetter'
  | 'hardware'
  | 'ki'
  | 'alarm'
  | 'telegram'
  | 'energie'
  | 'kamera'

const TABS: { id: TabId; label: string }[] = [
  { id: 'live', label: '🔴 Live-Monitor' },
  { id: 'sensoren', label: '📊 Sensor-Vitaldaten' },
  { id: 'wetter', label: '🌦️ Wetterstation' },
  { id: 'hardware', label: '⚙️ Hardware' },
  { id: 'ki', label: '🤖 KI & Training' },
  { id: 'alarm', label: '🚨 Alarmregeln' },
  { id: 'telegram', label: '📱 Telegram' },
  { id: 'energie', label: '⚡ Energiebilanz' },
  { id: 'kamera', label: '📹 Stallkamera' },
]

type CowRow = {
  name: string
  id: string
  ohrmarke: string
  status: 'Normal' | 'WARNUNG' | 'ALARM'
  tailAngle: number
  lastActivity: string
  alarms: number
}

const COWS: CowRow[] = [
  { name: 'Alma', id: 'KUH-001', ohrmarke: 'DE 08 17942692', status: 'Normal', tailAngle: 12, lastActivity: '14:32', alarms: 0 },
  { name: 'Ronja', id: 'KUH-002', ohrmarke: 'DE 08 17942677', status: 'ALARM', tailAngle: 67, lastActivity: '14:45', alarms: 3 },
  { name: 'Rita', id: 'KUH-003', ohrmarke: 'DE 08 17942680', status: 'Normal', tailAngle: 8, lastActivity: '14:41', alarms: 0 },
  { name: 'Lela', id: 'KUH-004', ohrmarke: 'DE 08 17942698', status: 'WARNUNG', tailAngle: 38, lastActivity: '14:43', alarms: 1 },
  { name: 'Paula', id: 'KUH-005', ohrmarke: 'DE 08 15728619', status: 'Normal', tailAngle: 5, lastActivity: '14:39', alarms: 0 },
  { name: 'Rosa', id: 'KUH-006', ohrmarke: 'DE 08 17942681', status: 'Normal', tailAngle: 22, lastActivity: '14:40', alarms: 0 },
  { name: 'Dora', id: 'KUH-007', ohrmarke: 'DE 08 93476434', status: 'Normal', tailAngle: 9, lastActivity: '14:38', alarms: 0 },
  { name: 'Fiona', id: 'KUH-008', ohrmarke: 'DE 08 17554731', status: 'Normal', tailAngle: 14, lastActivity: '14:37', alarms: 0 },
  { name: 'Heidi', id: 'KUH-009', ohrmarke: 'DE 08 18312081', status: 'Normal', tailAngle: 6, lastActivity: '14:36', alarms: 0 },
  { name: 'Olga', id: 'KUH-010', ohrmarke: 'DE 08 17942697', status: 'Normal', tailAngle: 18, lastActivity: '14:35', alarms: 0 },
  { name: 'Raffi', id: 'KUH-011', ohrmarke: 'DE 08 17942688', status: 'Normal', tailAngle: 11, lastActivity: '14:34', alarms: 0 },
  { name: 'Rama', id: 'KUH-012', ohrmarke: 'DE 08 16301218', status: 'Normal', tailAngle: 7, lastActivity: '14:33', alarms: 0 },
]

function statusBadge(status: CowRow['status']) {
  if (status === 'ALARM')
    return { dot: 'bg-red-400', cls: 'bg-red-900/50 text-red-300 border-red-700', bar: 'bg-red-500' }
  if (status === 'WARNUNG')
    return { dot: 'bg-yellow-400', cls: 'bg-yellow-900/50 text-yellow-300 border-yellow-700', bar: 'bg-yellow-500' }
  return { dot: 'bg-green-400', cls: 'bg-green-900/50 text-green-300 border-green-700', bar: 'bg-green-500' }
}

function Sparkline({ data, color, height = 60 }: { data: number[]; color: string; height?: number }) {
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const w = 200
  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w
      const y = height - ((v - min) / range) * height
      return `${x},${y}`
    })
    .join(' ')
  return (
    <svg viewBox={`0 0 ${w} ${height}`} className="w-full h-full">
      <polyline fill="none" stroke={color} strokeWidth="2" points={points} />
    </svg>
  )
}

function BarChart({ values, color }: { values: number[]; color: string }) {
  const max = Math.max(...values)
  return (
    <div className="flex items-end gap-1 h-32">
      {values.map((v, i) => (
        <div
          key={i}
          className={`flex-1 ${color} rounded-t`}
          style={{ height: `${(v / max) * 100}%`, minHeight: '4px' }}
        />
      ))}
    </div>
  )
}

export default function KIDashboardPage() {
  const [tab, setTab] = useState<TabId>('live')
  const [now, setNow] = useState('14:47')

  useEffect(() => {
    const update = () =>
      setNow(
        new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }),
      )
    update()
    const id = setInterval(update, 30_000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-green-400 text-xs font-semibold uppercase tracking-widest">
                System Online
              </span>
            </div>
            <h1 className="text-xl font-bold mt-0.5">KI-Kalbeerkennung &amp; Stallüberwachung</h1>
            <p className="text-gray-400 text-sm">
              Oberer Stollenhof · Abkalbebox · NVIDIA Jetson Orin Nano
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-red-900/50 border border-red-700 text-red-300 text-xs px-3 py-2 rounded-lg">
              <AlertTriangle className="w-3.5 h-3.5" />1 Kritischer Alarm
            </div>
            <div className="flex items-center gap-2 bg-gray-800 text-gray-300 text-xs px-3 py-2 rounded-lg">
              <Clock className="w-3.5 h-3.5" />
              {now} Uhr
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 overflow-x-auto">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  tab === t.id
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-gray-400 hover:text-gray-200'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {tab === 'live' && <LiveMonitor />}
        {tab === 'sensoren' && <SensorVitaldaten />}
        {tab === 'wetter' && <Wetterstation />}
        {tab === 'hardware' && <Hardware />}
        {tab === 'ki' && <KiTraining />}
        {tab === 'alarm' && <Alarmregeln />}
        {tab === 'telegram' && <Telegram />}
        {tab === 'energie' && <Energiebilanz />}
        {tab === 'kamera' && <Stallkamera />}
      </div>
    </div>
  )
}

/* ----------------------- TAB 1: LIVE-MONITOR ----------------------- */
function LiveMonitor() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard color="blue" icon={<Camera className="w-5 h-5" />} value="3" label="Aktive Kameras" />
        <KpiCard color="green" icon={<Eye className="w-5 h-5" />} value="6" label="Kühe überwacht" />
        <KpiCard color="yellow" icon={<Bell className="w-5 h-5" />} value="2" label="Alarme heute" />
        <KpiCard color="purple" icon={<Activity className="w-5 h-5" />} value="99.8%" label="KI-Uptime" />
      </div>

      <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
          <h3 className="font-bold">ByteTrack ID-Tracking — Alle Kühe</h3>
          <span className="text-xs text-gray-400">Echtzeit · YOLOv8-Pose</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800 text-xs text-gray-400">
                <th className="px-6 py-3 text-left">ID / Name</th>
                <th className="px-6 py-3 text-left">Status</th>
                <th className="px-6 py-3 text-left">Schwanzwinkel</th>
                <th className="px-6 py-3 text-left">Letzte Aktivität</th>
                <th className="px-6 py-3 text-left">Alarme heute</th>
              </tr>
            </thead>
            <tbody>
              {COWS.map((cow) => {
                const b = statusBadge(cow.status)
                const pct = Math.min(100, (cow.tailAngle / 67) * 100)
                return (
                  <tr key={cow.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium">{cow.name}</div>
                      <div className="text-gray-400 text-xs">
                        {cow.id} · {cow.ohrmarke}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${b.cls}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${b.dot}`} />
                        {cow.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-800 rounded-full h-2 w-24">
                          <div className={`h-2 rounded-full ${b.bar}`} style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-sm font-mono">{cow.tailAngle}°</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-sm">{cow.lastActivity}</td>
                    <td className="px-6 py-4">
                      <span className={`font-bold ${cow.alarms > 0 ? 'text-red-400' : 'text-gray-500'}`}>
                        {cow.alarms}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-gray-900 rounded-2xl border border-gray-800">
        <div className="px-6 py-4 border-b border-gray-800">
          <h3 className="font-bold">Alarm-Protokoll</h3>
        </div>
        <div className="p-4 space-y-2">
          <LogRow time="14:45" level="KRITISCH" who="Ronja (KUH-002):" text="Amniotic sac erkannt (93% Konfidenz) — Sofortiger Alarm" />
          <LogRow time="14:31" level="WARNUNG" who="Lela (KUH-004):" text="Schwanzwinkel >45° — 24% der letzten 30 Min." />
          <LogRow time="11:15" level="INFO" who="System:" text="Tägliche Kalibrierung erfolgreich abgeschlossen" />
          <LogRow time="08:03" level="INFO" who="System:" text="Nachtmodus beendet — Tagesüberwachung aktiv" />
        </div>
      </div>
    </div>
  )
}

function KpiCard({
  color,
  icon,
  value,
  label,
}: {
  color: 'blue' | 'green' | 'yellow' | 'purple' | 'red' | 'orange'
  icon: React.ReactNode
  value: string
  label: string
}) {
  const map: Record<string, { bg: string; text: string }> = {
    blue: { bg: 'bg-blue-900/30', text: 'text-blue-400' },
    green: { bg: 'bg-green-900/30', text: 'text-green-400' },
    yellow: { bg: 'bg-yellow-900/30', text: 'text-yellow-400' },
    purple: { bg: 'bg-purple-900/30', text: 'text-purple-400' },
    red: { bg: 'bg-red-900/30', text: 'text-red-400' },
    orange: { bg: 'bg-orange-900/30', text: 'text-orange-400' },
  }
  const c = map[color]
  return (
    <div className={`${c.bg} rounded-2xl p-5 border border-gray-800`}>
      <div className={`${c.text} mb-2`}>{icon}</div>
      <div className={`text-2xl font-bold ${c.text}`}>{value}</div>
      <div className="text-gray-400 text-xs mt-0.5">{label}</div>
    </div>
  )
}

function LogRow({
  time,
  level,
  who,
  text,
}: {
  time: string
  level: 'KRITISCH' | 'WARNUNG' | 'INFO'
  who: string
  text: string
}) {
  const styles: Record<string, { wrap: string; pill: string }> = {
    KRITISCH: { wrap: 'bg-red-900/20 border-red-800/50', pill: 'bg-red-900 text-red-300' },
    WARNUNG: { wrap: 'bg-yellow-900/20 border-yellow-800/50', pill: 'bg-yellow-900 text-yellow-300' },
    INFO: { wrap: 'bg-blue-900/10 border-blue-800/30', pill: 'bg-blue-900 text-blue-300' },
  }
  const s = styles[level]
  return (
    <div className={`flex gap-4 p-3 rounded-xl border ${s.wrap}`}>
      <span className="text-gray-400 text-xs font-mono pt-0.5 w-10 flex-shrink-0">{time}</span>
      <span className={`text-xs font-bold px-2 py-0.5 rounded h-fit flex-shrink-0 ${s.pill}`}>
        {level}
      </span>
      <div className="flex-1 min-w-0">
        <span className="text-gray-300 text-sm font-medium">{who} </span>
        <span className="text-gray-400 text-sm">{text}</span>
      </div>
    </div>
  )
}

/* ----------------------- TAB 2: SENSOR-VITALDATEN ----------------------- */
function SensorVitaldaten() {
  const vitals = [
    { name: 'Ronja', id: 'KUH-002', temp: 39.4, motion: 87, breath: 38, prognose: 'Geburt < 1h', alarm: true },
    { name: 'Lela', id: 'KUH-004', temp: 38.7, motion: 62, breath: 28, prognose: 'Wehen-Frühphase', alarm: false },
    { name: 'Alma', id: 'KUH-001', temp: 38.3, motion: 41, breath: 22, prognose: 'Stabil', alarm: false },
    { name: 'Rita', id: 'KUH-003', temp: 38.2, motion: 38, breath: 21, prognose: 'Stabil', alarm: false },
    { name: 'Paula', id: 'KUH-005', temp: 38.4, motion: 44, breath: 23, prognose: 'Stabil', alarm: false },
    { name: 'Rosa', id: 'KUH-006', temp: 38.2, motion: 49, breath: 22, prognose: 'Stabil', alarm: false },
  ]
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard color="red" icon={<AlertTriangle className="w-5 h-5" />} value="2" label="Aktive Warnungen" />
        <KpiCard color="yellow" icon={<Heart className="w-5 h-5" />} value="1" label="Bald Geburten" />
        <KpiCard color="blue" icon={<Thermometer className="w-5 h-5" />} value="20,4°C" label="Stalltemperatur" />
        <KpiCard color="green" icon={<Wifi className="w-5 h-5" />} value="Aktiv" label="Sensorsystem" />
      </div>

      <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-800">
          <h3 className="font-bold">Vitaldaten — Individuelle Kühe</h3>
          <p className="text-xs text-gray-400 mt-1">Normal: 38,0–38,5°C</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800 text-xs text-gray-400">
                <th className="px-6 py-3 text-left">Name</th>
                <th className="px-6 py-3 text-left">Körpertemp.</th>
                <th className="px-6 py-3 text-left">Bewegungs­aktivität</th>
                <th className="px-6 py-3 text-left">Atemfrequenz</th>
                <th className="px-6 py-3 text-left">Geburtsprognose</th>
                <th className="px-6 py-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {vitals.map((v) => (
                <tr key={v.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                  <td className="px-6 py-3">
                    <div className="font-medium">{v.name}</div>
                    <div className="text-gray-400 text-xs">{v.id}</div>
                  </td>
                  <td className="px-6 py-3 font-mono">
                    <span className={v.temp > 39 ? 'text-red-400' : 'text-gray-200'}>{v.temp}°C</span>
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-800 rounded-full h-1.5 w-24">
                        <div
                          className={`h-1.5 rounded-full ${v.motion > 80 ? 'bg-red-500' : v.motion > 55 ? 'bg-yellow-500' : 'bg-green-500'}`}
                          style={{ width: `${v.motion}%` }}
                        />
                      </div>
                      <span className="text-xs font-mono">{v.motion}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-3 font-mono text-sm">{v.breath} /min</td>
                  <td className="px-6 py-3 text-sm text-gray-300">{v.prognose}</td>
                  <td className="px-6 py-3">
                    {v.alarm ? (
                      <span className="text-red-400 text-xs font-bold">⚠ ALARM</span>
                    ) : (
                      <span className="text-green-400 text-xs">✓ OK</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ChartCard title="Bewegungsaktivität (12h)" subtitle="Ronja & Lela vs. Durchschnitt">
          <div className="space-y-2">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-red-400">Ronja</span>
                <span className="font-mono">87%</span>
              </div>
              <Sparkline color="#f87171" data={[35, 42, 48, 55, 62, 70, 78, 85, 90, 87, 85, 87]} />
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-yellow-400">Lela</span>
                <span className="font-mono">62%</span>
              </div>
              <Sparkline color="#facc15" data={[40, 42, 45, 48, 50, 55, 58, 60, 62, 60, 62, 62]} />
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-400">Herde Ø</span>
                <span className="font-mono">42%</span>
              </div>
              <Sparkline color="#9ca3af" data={[40, 41, 42, 43, 42, 41, 42, 43, 42, 41, 42, 42]} />
            </div>
          </div>
        </ChartCard>

        <ChartCard title="Stalltemperatur (12h)" subtitle="Innen vs. Außentemperatur">
          <div className="space-y-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-blue-400">20,4°C</span>
              <span className="text-xs text-gray-400">Innen</span>
            </div>
            <Sparkline color="#60a5fa" data={[19.8, 20.1, 20.3, 20.5, 20.6, 20.4, 20.3, 20.2, 20.4, 20.5, 20.4, 20.4]} />
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold text-orange-400">7,2°C</span>
              <span className="text-xs text-gray-400">Außen</span>
            </div>
            <Sparkline color="#fb923c" data={[4, 5, 6, 7, 8, 9, 10, 9, 8, 8, 7, 7]} />
          </div>
        </ChartCard>

        <ChartCard title="Herden-Bewegungsaktivität im Stall vs. Weide (12h)" subtitle="Gesamtaktivität der Herde">
          <BarChart color="bg-emerald-500/70" values={[35, 42, 38, 45, 58, 62, 55, 48, 52, 60, 55, 47]} />
        </ChartCard>
      </div>
    </div>
  )
}

function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle?: string
  children: React.ReactNode
}) {
  return (
    <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5">
      <h3 className="font-bold text-sm">{title}</h3>
      {subtitle && <p className="text-xs text-gray-400 mt-0.5 mb-3">{subtitle}</p>}
      <div className="mt-3">{children}</div>
    </div>
  )
}

/* ----------------------- TAB 3: WETTERSTATION ----------------------- */
function Wetterstation() {
  return (
    <div className="space-y-6">
      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Cloud className="w-4 h-4 text-blue-400" />
            <h3 className="font-bold text-sm">Live-Wetterstation · Oberer Stollenhof, Rechberg</h3>
            <span className="flex items-center gap-1 text-xs text-green-400">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              Live
            </span>
          </div>
          <span className="text-xs text-gray-500">Rechberg / Kaiserberge · 720m</span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <WeatherTile icon={<Thermometer className="w-5 h-5" />} value="7,2°C" label="Temperatur" color="orange" />
        <WeatherTile icon={<Wind className="w-5 h-5" />} value="14 km/h" label="Wind" color="blue" />
        <WeatherTile icon={<CloudRain className="w-5 h-5" />} value="2,1 mm" label="Niederschlag" color="blue" />
        <WeatherTile icon={<Sun className="w-5 h-5" />} value="487 W/m²" label="Strahlung" color="yellow" />
        <WeatherTile icon={<Droplets className="w-5 h-5" />} value="74%" label="Luftfeuchtigkeit" color="green" />
        <WeatherTile icon={<Sun className="w-5 h-5" />} value="3" label="UV-Index" color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ChartCard title="Wind & Temperatur (12h)" subtitle="Rechberg / Kaiserberge">
          <Sparkline color="#fb923c" data={[4, 5, 6, 7, 8, 9, 10, 9, 8, 8, 7, 7]} />
          <div className="mt-2">
            <Sparkline color="#60a5fa" data={[8, 9, 11, 12, 14, 15, 14, 13, 12, 11, 13, 14]} />
          </div>
        </ChartCard>
        <ChartCard title="Sonnenstrahlung (12h)" subtitle="Globalstrahlung W/m²">
          <BarChart color="bg-yellow-500/70" values={[12, 60, 180, 320, 450, 490, 487, 410, 280, 140, 50, 10]} />
        </ChartCard>
        <ChartCard title="Niederschlag & Luftfeuchtigkeit (12h)" subtitle="Relevante Werte für Grünlandplanung">
          <BarChart color="bg-blue-500/70" values={[0.1, 0.2, 0.4, 0.8, 1.2, 1.5, 2.1, 1.8, 1.2, 0.6, 0.3, 0.1]} />
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5">
          <h3 className="font-bold text-sm mb-3">5-Tage-Vorhersage &amp; Ernte-/Mähplanung</h3>
          <div className="space-y-2">
            {[
              { day: 'Heute', t: '7°/2°', rain: '2,1 mm', icon: '🌧️' },
              { day: 'Mo', t: '9°/3°', rain: '0,3 mm', icon: '⛅' },
              { day: 'Di', t: '11°/4°', rain: '0 mm', icon: '☀️' },
              { day: 'Mi', t: '12°/5°', rain: '0 mm', icon: '☀️' },
              { day: 'Do', t: '8°/3°', rain: '4,7 mm', icon: '🌧️' },
            ].map((d) => (
              <div key={d.day} className="flex items-center justify-between text-sm py-2 border-b border-gray-800 last:border-0">
                <span className="text-gray-300 w-12">{d.day}</span>
                <span className="text-xl">{d.icon}</span>
                <span className="font-mono text-gray-400">{d.t}</span>
                <span className="text-xs text-blue-400 w-16 text-right">{d.rain}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5">
          <h3 className="font-bold text-sm mb-3">Bodenfeuchtigkeit &amp; Bewässerungsempfehlung</h3>
          <div className="space-y-3">
            {[
              { name: 'Wiese Nord', pct: 68, status: 'Ideal' },
              { name: 'Wiese Süd', pct: 42, status: 'Beobachten' },
              { name: 'Weide Ost', pct: 81, status: 'Feucht' },
            ].map((f) => (
              <div key={f.name}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-300">{f.name}</span>
                  <span className="text-gray-400">
                    {f.pct}% · {f.status}
                  </span>
                </div>
                <div className="bg-gray-800 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${f.pct < 50 ? 'bg-yellow-500' : f.pct > 75 ? 'bg-blue-500' : 'bg-green-500'}`}
                    style={{ width: `${f.pct}%` }}
                  />
                </div>
              </div>
            ))}
            <p className="text-xs text-gray-500 mt-2">
              Empfehlung: Wiese Süd in 2–3 Tagen beobachten — Bewässerung aktuell nicht nötig.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function WeatherTile({
  icon,
  value,
  label,
  color,
}: {
  icon: React.ReactNode
  value: string
  label: string
  color: 'orange' | 'blue' | 'yellow' | 'green' | 'purple'
}) {
  const map: Record<string, string> = {
    orange: 'text-orange-400',
    blue: 'text-blue-400',
    yellow: 'text-yellow-400',
    green: 'text-green-400',
    purple: 'text-purple-400',
  }
  return (
    <div className="bg-gray-900 rounded-2xl border border-gray-800 p-4">
      <div className={`${map[color]} mb-2`}>{icon}</div>
      <div className="text-xl font-bold">{value}</div>
      <div className="text-gray-400 text-xs">{label}</div>
    </div>
  )
}

/* ----------------------- TAB 4: HARDWARE ----------------------- */
function Hardware() {
  return (
    <div className="space-y-6">
      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
        <h2 className="font-bold text-lg">Systemarchitektur</h2>
        <p className="text-sm text-gray-400 mt-1">
          Alle Komponenten sind für den harten Stallbetrieb ausgelegt — staub- und ammoniak-resistent,
          zuverlässig rund um die Uhr.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <HardwareCard
          icon={<Cpu className="w-6 h-6" />}
          color="purple"
          title="🧠 Gehirn: NVIDIA Jetson Orin Nano"
          specs={[
            ['Module', '8 GB LPDDR5'],
            ['AI Performance', '40 TOPS'],
            ['Stromverbrauch', '7–15 W'],
            ['Standort', 'Abkalbebox, IP67-Gehäuse'],
          ]}
          notes="On-Device-Inferenz, keine Cloud-Abhängigkeit. TensorRT-optimiert."
        />
        <HardwareCard
          icon={<Camera className="w-6 h-6" />}
          color="blue"
          title="👁️ Augen: IP-Kameras 1080p Full HD"
          specs={[
            ['Modell', 'Reolink RLC-820A'],
            ['Auflösung', '4 MP · 1080p@25fps'],
            ['Nachtsicht', 'IR bis 30m'],
            ['Anzahl', '3× Abkalbebox + Stall'],
          ]}
          notes="PoE-versorgt, RTSP-Stream direkt zum Jetson."
        />
        <HardwareCard
          icon={<Network className="w-6 h-6" />}
          color="green"
          title="🔌 Netzwerk: Cat6 PoE-Infrastruktur"
          specs={[
            ['Switch', 'TP-Link TL-SG1008P · 8× PoE+'],
            ['Verkabelung', 'Cat6 S/FTP, Außenmantel'],
            ['Energie pro Kamera', '~ 4,5 W'],
            ['Uplink', '1 Gbit/s zum Hof-Server'],
          ]}
          notes="Strom + Daten über ein Kabel — keine Steckdose im Stall nötig."
        />
      </div>

      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
        <h3 className="font-bold text-sm mb-4">Komponenten-Status</h3>
        <div className="space-y-2">
          {[
            { name: 'Jetson Orin Nano', status: 'OK', value: 'CPU 18% · GPU 42% · 28°C' },
            { name: 'IP-Kamera 1 (Abkalbebox)', status: 'OK', value: '1080p · 25 fps · 14ms Latenz' },
            { name: 'IP-Kamera 2 (Stall Nord)', status: 'OK', value: '1080p · 25 fps · 17ms Latenz' },
            { name: 'IP-Kamera 3 (Stall Süd)', status: 'OK', value: '1080p · 25 fps · 12ms Latenz' },
            { name: 'PoE-Switch', status: 'OK', value: '4 Ports aktiv · 18,3 W gesamt' },
            { name: 'NVMe-Speicher 1 TB', status: 'OK', value: '342 GB / 1 TB belegt' },
          ].map((c) => (
            <div key={c.name} className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-green-400" />
                <span className="text-sm">{c.name}</span>
              </div>
              <span className="text-xs text-gray-400 font-mono">{c.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function HardwareCard({
  icon,
  color,
  title,
  specs,
  notes,
}: {
  icon: React.ReactNode
  color: 'purple' | 'blue' | 'green'
  title: string
  specs: [string, string][]
  notes: string
}) {
  const map = { purple: 'text-purple-400', blue: 'text-blue-400', green: 'text-green-400' }
  return (
    <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5">
      <div className={`${map[color]} mb-3`}>{icon}</div>
      <h3 className="font-bold mb-3">{title}</h3>
      <dl className="space-y-1.5 text-xs">
        {specs.map(([k, v]) => (
          <div key={k} className="flex justify-between gap-2">
            <dt className="text-gray-400">{k}</dt>
            <dd className="text-gray-200 font-mono text-right">{v}</dd>
          </div>
        ))}
      </dl>
      <p className="text-xs text-gray-500 mt-3 leading-relaxed">{notes}</p>
    </div>
  )
}

/* ----------------------- TAB 5: KI & TRAINING ----------------------- */
function KiTraining() {
  const steps = [
    { label: 'Datensammlung', icon: Camera, desc: '~ 14.000 Frames aus Abkalbebox, 3 Monate Aufzeichnung' },
    { label: 'Pre-Training', icon: Layers, desc: 'YOLOv8n-Pose vortrainiertes Modell (COCO) als Basis' },
    { label: 'Labeling in CVAT', icon: Tag, desc: '5 Keypoints pro Frame: Spine_End, Tail_Base, Tail_Tip, amniotic_sac, calf_legs' },
    { label: 'KI-Training YOLOv8-Pose', icon: Cpu, desc: '120 Epochen · GPU-Cluster · mAP 0.91' },
    { label: 'Deployment', icon: Send, desc: 'TensorRT-Export auf Jetson Orin Nano · 28 ms Inferenz' },
  ]
  return (
    <div className="space-y-6">
      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
        <h2 className="font-bold text-lg">KI-Training Workflow</h2>
        <p className="text-sm text-gray-400 mt-1">
          Von der Videoaufnahme bis zum Live-Modell auf dem Edge-Gerät.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mt-6">
          {steps.map((s, i) => {
            const Icon = s.icon
            return (
              <div key={s.label} className="bg-gray-950 rounded-xl border border-gray-800 p-4">
                <div className="text-xs font-mono text-blue-400">STEP {i + 1}</div>
                <Icon className="w-5 h-5 text-blue-400 my-2" />
                <h4 className="font-bold text-sm">{s.label}</h4>
                <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">{s.desc}</p>
              </div>
            )
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5">
          <h3 className="font-bold text-sm mb-4">CVAT Labels</h3>
          <div className="grid grid-cols-2 gap-2">
            {['amniotic_sac', 'calf_legs', 'Spine_End', 'Tail_Base', 'Tail_Tip'].map((l) => (
              <div key={l} className="bg-gray-950 border border-gray-800 px-3 py-2 rounded-lg text-xs font-mono text-blue-400">
                {l}
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-4 leading-relaxed">
            Jeder Frame wird mit diesen 5 Keypoints versehen. Tail_Base & Tail_Tip definieren über{' '}
            <code className="text-purple-400">np.arctan2</code> den Schwanzwinkel.
          </p>
        </div>

        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5">
          <h3 className="font-bold text-sm mb-4">Modell-Parameter</h3>
          <dl className="space-y-2 text-xs">
            {[
              ['Architektur', 'YOLOv8n-Pose'],
              ['Input', '640 × 640 RGB'],
              ['Keypoints', '5'],
              ['Trainings-Frames', '14.218'],
              ['Validation mAP@0.5', '0.91'],
              ['Inferenz (Jetson)', '28 ms / Frame'],
              ['Konfidenz-Schwelle', '0.65'],
              ['Tracker', 'ByteTrack v2'],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between border-b border-gray-800 pb-1.5">
                <dt className="text-gray-400">{k}</dt>
                <dd className="text-gray-200 font-mono">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  )
}

/* ----------------------- TAB 6: ALARMREGELN ----------------------- */
function Alarmregeln() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-5 h-5 text-yellow-400" />
            <h3 className="font-bold">Alarmregel 1: Zeit-Logik</h3>
          </div>
          <pre className="bg-gray-950 rounded-xl p-4 text-xs font-mono text-gray-300 overflow-x-auto leading-relaxed">{`# Kalbeverdacht-Alarm
IF schwanzwinkel > 45°
AND häufig in 30 min
  > 20% der Frames
THEN → Kalbeverdacht ⚠️`}</pre>
          <p className="text-xs text-gray-400 mt-3 leading-relaxed">
            Filter gegen Fehlalarme: Kuh muss in 30 Min mindestens 20% der Frames den Schwanz {'>'}45°
            heben. Schließt Fliegenabwehr und Kotabsatz aus.
          </p>
        </div>

        <div className="bg-gray-900 rounded-2xl border border-red-900/50 p-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <h3 className="font-bold text-red-300">Alarmregel 2: Sofort-Alarm</h3>
          </div>
          <pre className="bg-gray-950 rounded-xl p-4 text-xs font-mono text-red-300 overflow-x-auto leading-relaxed">{`# Geburt erkannt
IF amniotic_sac > 80%
OR calf_legs > 80%
THEN → SOFORTALARM 🚨
# Überschreibt Zeit-Logik`}</pre>
          <p className="text-xs text-gray-400 mt-3 leading-relaxed">
            Wird die Fruchtblase oder Kälberfüße mit über 80% Konfidenz erkannt, ist keine
            Zeit-Schwelle nötig. Der Alarm geht sofort raus.
          </p>
        </div>
      </div>

      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5">
        <h3 className="font-bold text-sm mb-2">ByteTrack: Individuelle Tier-Erkennung</h3>
        <p className="text-xs text-gray-400 mb-4 leading-relaxed">
          Jede Kuh bekommt eine permanente Track-ID, auch wenn sie zwischendurch aus dem Frame
          verschwindet. So lassen sich Alarmregeln pro Tier individuell durchsetzen.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          {[
            { title: 'ByteTrack-Algorithmus', desc: 'Kombiniert High- und Low-Confidence Detections für stabile IDs auch bei Verdeckung.' },
            { title: 'cv2.VideoCapture', desc: 'Greift den RTSP-Stream der Kamera ab und liefert Frames an YOLO.' },
            { title: 'np.arctan2', desc: 'Berechnet den Schwanzwinkel aus den Keypoint-Koordinaten in Grad.' },
          ].map((c) => (
            <div key={c.title} className="bg-gray-950 border border-gray-800 rounded-xl p-3">
              <div className="font-mono text-purple-400 mb-1">{c.title}</div>
              <p className="text-gray-400 leading-relaxed">{c.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ----------------------- TAB 7: TELEGRAM ----------------------- */
function Telegram() {
  return (
    <div className="space-y-6">
      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5">
        <h2 className="font-bold text-lg">Telegram-Benachrichtigungssystem</h2>
        <p className="text-sm text-gray-400 mt-1">
          Direkter Alarm aufs Smartphone — überall, sofort.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-gray-900 rounded-2xl border border-gray-800 p-5">
          <h3 className="font-bold text-sm mb-4">Technische Implementierung</h3>
          <div className="space-y-3">
            {[
              { step: '1', title: 'Bot-Erstellung', desc: 'Telegram-Bot über @BotFather angelegt, Token sicher im .env hinterlegt.' },
              { step: '2', title: 'Bild-Annotation', desc: 'Bei Alarm wird der Live-Frame mit Bounding-Boxen + Keypoints überlagert.' },
              { step: '3', title: 'Lokale Speicherung', desc: 'Frame + Metadaten werden auf NVMe-SSD archiviert (Beweissicherung).' },
              { step: '4', title: 'HTTP-POST', desc: 'sendPhoto-API mit annotiertem Bild + Caption an die Chat-ID der Familie.' },
            ].map((s) => (
              <div key={s.step} className="flex gap-4 bg-gray-950 border border-gray-800 rounded-xl p-4">
                <div className="w-8 h-8 rounded-full bg-blue-900/50 text-blue-400 flex items-center justify-center font-bold text-sm flex-shrink-0">
                  {s.step}
                </div>
                <div>
                  <div className="font-bold text-sm">{s.title}</div>
                  <p className="text-xs text-gray-400 mt-1 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-4">
          <h3 className="font-bold text-sm mb-3">Beispiel-Alarm</h3>
          <div className="bg-gray-950 rounded-2xl border border-gray-800 overflow-hidden">
            <div className="bg-blue-700 text-white px-3 py-2 flex items-center gap-2 text-sm">
              <Send className="w-4 h-4" />
              <div>
                <div className="font-bold leading-tight">Stollenhof KI-Alert</div>
                <div className="text-[10px] text-blue-200 leading-tight">Bot · Online</div>
              </div>
            </div>
            <div className="p-3 space-y-2">
              <div className="bg-gray-800 rounded-2xl p-3 text-sm">
                <div className="font-bold text-red-400">🚨 GEBURT ERKANNT</div>
                <div className="mt-2 text-xs space-y-0.5 text-gray-200">
                  <div>Kuh: <span className="font-mono">Ronja (ID-002)</span></div>
                  <div className="text-red-300 font-mono">amniotic_sac: 93%</div>
                  <div className="text-gray-400">14:45 Uhr · Abkalbebox</div>
                </div>
                <div className="mt-3 h-24 bg-gray-900 rounded-lg flex items-center justify-center text-[10px] text-gray-600">
                  [annotierter Frame]
                </div>
              </div>
            </div>
          </div>
          <div className="mt-4 bg-gray-950 border border-gray-800 rounded-xl p-3">
            <div className="text-xs font-bold text-gray-200">Anti-Spam: Cooldown-System</div>
            <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">
              Pro Tier-ID werden weitere Alarme für 15–30 Minuten unterdrückt — verhindert Spam,
              wenn dieselbe Situation mehrere Frames lang erkannt wird.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ----------------------- TAB 8: ENERGIEBILANZ ----------------------- */
function Energiebilanz() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard color="yellow" icon={<Sun className="w-5 h-5" />} value="42,8 kWh" label="PV-Erzeugung heute" />
        <KpiCard color="orange" icon={<Zap className="w-5 h-5" />} value="13,7 kWh" label="Verbrauch heute" />
        <KpiCard color="green" icon={<Activity className="w-5 h-5" />} value="68%" label="Batterie-Ladestand" />
        <KpiCard color="blue" icon={<Gauge className="w-5 h-5" />} value="98%" label="Autarkiegrad (30 T)" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="PV-Erzeugung (12h)" subtitle="Solar-Leistungskurve in kW">
          <BarChart color="bg-yellow-500/70" values={[0.1, 0.4, 1.2, 2.8, 4.5, 5.9, 6.4, 5.7, 3.8, 1.9, 0.6, 0.1]} />
        </ChartCard>
        <ChartCard title="Verbrauch nach Bereich (heute)" subtitle="Stall, Wohnhaus, Hofassistent">
          <div className="space-y-3 mt-2">
            {[
              { name: 'Wohnhaus', pct: 38, kwh: 5.2 },
              { name: 'Stall (Beleuchtung, Lüftung)', pct: 28, kwh: 3.8 },
              { name: 'Melkstand', pct: 18, kwh: 2.5 },
              { name: 'KI-Edge (Jetson + Kameras)', pct: 4, kwh: 0.5 },
              { name: 'Sonstige', pct: 12, kwh: 1.7 },
            ].map((p) => (
              <div key={p.name}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-300">{p.name}</span>
                  <span className="text-gray-400 font-mono">{p.kwh} kWh</span>
                </div>
                <div className="bg-gray-800 rounded-full h-2">
                  <div className="h-2 rounded-full bg-emerald-500" style={{ width: `${p.pct * 2.5}%` }} />
                </div>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5">
        <h3 className="font-bold text-sm mb-4">Energiefluss</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
          {[
            { label: 'PV-Anlage', value: '6,4 kW', color: 'text-yellow-400', icon: <Sun className="w-5 h-5 mx-auto mb-1" /> },
            { label: 'Batterie', value: '+ 2,1 kW', color: 'text-green-400', icon: <Activity className="w-5 h-5 mx-auto mb-1" /> },
            { label: 'Verbraucher', value: '3,8 kW', color: 'text-orange-400', icon: <Zap className="w-5 h-5 mx-auto mb-1" /> },
            { label: 'Einspeisung', value: '0,5 kW', color: 'text-blue-400', icon: <Send className="w-5 h-5 mx-auto mb-1" /> },
          ].map((n) => (
            <div key={n.label} className="bg-gray-950 border border-gray-800 rounded-xl p-3">
              <div className={n.color}>{n.icon}</div>
              <div className={`font-bold ${n.color}`}>{n.value}</div>
              <div className="text-xs text-gray-400 mt-0.5">{n.label}</div>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-4 leading-relaxed">
          Die KI-Edge-Hardware (Jetson Orin + 3 Kameras + Switch) verbraucht typisch ~ 25 W
          Dauerleistung — vollständig aus dem hofeigenen Solarstrom gedeckt.
        </p>
      </div>
    </div>
  )
}

/* ----------------------- TAB 9: STALLKAMERA ----------------------- */
function Stallkamera() {
  return (
    <div className="space-y-6">
      <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-800 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Camera className="w-4 h-4 text-red-400" />
            <span className="font-bold text-white text-sm">
              Live-Stallkamera · Innovationsstall
            </span>
            <span className="flex items-center gap-1 text-xs text-red-400 font-semibold">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
              LIVE
            </span>
          </div>
          <span className="text-xs text-gray-500 font-mono">RTSP · 1080p · 25 fps</span>
        </div>

        <div className="aspect-video bg-gray-950 relative flex items-center justify-center text-gray-500">
          <div className="absolute top-3 left-3 bg-red-600/90 text-white text-xs px-2 py-1 rounded font-semibold flex items-center gap-1.5">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
            LIVE
          </div>
          <div className="absolute top-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded font-mono">
            14:47 · CAM-01
          </div>

          <div className="text-center">
            <Camera className="w-12 h-12 mx-auto mb-2 opacity-30" />
            <p className="text-sm opacity-70">Stream-Vorschau</p>
            <p className="text-xs opacity-50 font-mono mt-1">rtsp://192.168.1.42/abkalbebox/h264</p>
          </div>

          {/* Demo annotation: ByteTrack box around Ronja */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-[28%] left-[34%] w-[28%] h-[42%] border-2 border-red-400 rounded">
              <div className="absolute -top-6 left-0 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded font-mono">
                Ronja · ID-002 · 0.93
              </div>
              <div className="absolute bottom-1 right-1 text-[10px] font-mono text-red-300 bg-black/60 px-1 rounded">
                tail: 67°
              </div>
            </div>
            <div className="absolute top-[52%] left-[12%] w-[18%] h-[28%] border-2 border-green-400/70 rounded">
              <div className="absolute -top-5 left-0 bg-green-500 text-white text-[10px] px-1 py-0.5 rounded font-mono">
                Lela · ID-004 · 0.88
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { name: 'CAM-01 Abkalbebox', fps: 25, latency: 14, status: 'OK' },
          { name: 'CAM-02 Stall Nord', fps: 25, latency: 17, status: 'OK' },
          { name: 'CAM-03 Stall Süd', fps: 25, latency: 12, status: 'OK' },
        ].map((c) => (
          <div key={c.name} className="bg-gray-900 rounded-2xl border border-gray-800 p-4">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm">{c.name}</h4>
              <span className="text-xs text-green-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                {c.status}
              </span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <div className="bg-gray-950 rounded p-2">
                <div className="text-gray-500">FPS</div>
                <div className="font-mono text-blue-400">{c.fps}</div>
              </div>
              <div className="bg-gray-950 rounded p-2">
                <div className="text-gray-500">Latenz</div>
                <div className="font-mono text-blue-400">{c.latency} ms</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5">
        <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
          <Database className="w-4 h-4 text-blue-400" /> Aufzeichnungs-Archiv
        </h3>
        <div className="space-y-2 text-sm">
          {[
            { time: '14:45', label: 'Ronja — Sofort-Alarm (amniotic_sac 93%)', size: '4,2 MB' },
            { time: '14:31', label: 'Lela — Schwanzwinkel-Warnung', size: '2,8 MB' },
            { time: '11:15', label: 'Tägliche Kalibrierung', size: '0,6 MB' },
            { time: '08:03', label: 'Nachtmodus → Tagesmodus', size: '0,3 MB' },
          ].map((r) => (
            <div key={r.time} className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-gray-500 w-12">{r.time}</span>
                <Volume2 className="w-3.5 h-3.5 text-gray-500" />
                <span className="text-gray-300 text-sm">{r.label}</span>
              </div>
              <span className="text-xs text-gray-500 font-mono">{r.size}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ----------------------- floating button (optional cosmetic) ----------------------- */
// Hidden by default to match the layout's own sidebar — original base44 page had a global
// "Hof-Assistent" floating chat button, which lives at the app-shell level, not per page.
export const dynamic = 'force-static'
