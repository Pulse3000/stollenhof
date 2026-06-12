'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Camera,
  Cpu,
  Radio,
  AlertTriangle,
  Bell,
  Settings,
  Activity,
  Eye,
  Pencil,
  Trash2,
  Plus,
  Check,
  Wifi,
  WifiOff,
  Send,
  Baby,
  Power,
  Github,
  RefreshCw,
} from 'lucide-react'
import { usePersistedState } from '@/lib/use-persisted-state'
import {
  STORAGE_KEYS,
  defaultStallwacheConfig,
  defaultStallwacheStatus,
  initialStallwacheEvents,
  initialKuehe,
  formatDateTime,
  formatUptime,
  relativeTime,
  TODAY_ISO,
  type StallwacheConfig,
  type StallwacheStatus,
  type StallwacheEvent,
  type StallwacheEventTyp,
  type Kuh,
} from '@/lib/data'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { StallwacheLiveStream } from '@/components/stallwache-live-stream'

const eventTypeConfig: Record<StallwacheEventTyp, { color: string; icon: typeof Bell }> = {
  'Kalbung erkannt': { color: 'bg-pink-100 text-pink-800 border-pink-200', icon: Baby },
  Aktivität: { color: 'bg-amber-100 text-amber-800 border-amber-200', icon: Activity },
  'System gestartet': { color: 'bg-green-100 text-green-800 border-green-200', icon: Power },
  'System gestoppt': { color: 'bg-stone-100 text-stone-700 border-stone-200', icon: Power },
  'Telegram-Alert': { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: Send },
  Fehler: { color: 'bg-red-100 text-red-800 border-red-200', icon: AlertTriangle },
}

type Tab = 'live' | 'events' | 'config' | 'setup'

const emptyEvent = (): Omit<StallwacheEvent, 'id'> => ({
  zeitstempel: new Date().toISOString().slice(0, 16),
  typ: 'Aktivität',
  beschreibung: '',
  konfidenz: undefined,
  kuhNr: undefined,
  bestaetigt: false,
})

export default function StallwachePage() {
  const [config, setConfig] = usePersistedState<StallwacheConfig>(
    STORAGE_KEYS.stallwacheConfig,
    defaultStallwacheConfig,
  )
  const [status, setStatus] = usePersistedState<StallwacheStatus>(
    STORAGE_KEYS.stallwacheStatus,
    defaultStallwacheStatus,
  )
  const [events, setEvents] = usePersistedState<StallwacheEvent[]>(
    STORAGE_KEYS.stallwacheEvents,
    initialStallwacheEvents,
  )
  const [kuehe] = usePersistedState<Kuh[]>(STORAGE_KEYS.tiere, initialKuehe)

  const [tab, setTab] = useState<Tab>('live')
  const [eventOpen, setEventOpen] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  const [form, setForm] = useState<Omit<StallwacheEvent, 'id'>>(emptyEvent())

  const sortedEvents = [...events].sort((a, b) => b.zeitstempel.localeCompare(a.zeitstempel))
  const todayEvents = events.filter((e) => e.zeitstempel.slice(0, 10) === TODAY_ISO)
  const unbestaetigt = events.filter((e) => !e.bestaetigt).length
  const letzteKalbung = sortedEvents.find((e) => e.typ === 'Kalbung erkannt')
  const letzteAktivitaet = sortedEvents.find((e) => e.typ === 'Aktivität' || e.typ === 'Kalbung erkannt')

  function ackAll() {
    setEvents((prev) => prev.map((e) => ({ ...e, bestaetigt: true })))
  }

  function toggleAck(id: number) {
    setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, bestaetigt: !e.bestaetigt } : e)))
  }

  function openNewEvent() {
    setEditId(null)
    setForm(emptyEvent())
    setEventOpen(true)
  }

  function openEditEvent(e: StallwacheEvent) {
    setEditId(e.id)
    setForm({
      zeitstempel: e.zeitstempel,
      typ: e.typ,
      beschreibung: e.beschreibung,
      konfidenz: e.konfidenz,
      kuhNr: e.kuhNr,
      bestaetigt: e.bestaetigt,
    })
    setEventOpen(true)
  }

  function saveEvent() {
    if (!form.beschreibung || !form.zeitstempel) return
    if (editId !== null) {
      setEvents((prev) => prev.map((e) => (e.id === editId ? { ...form, id: editId } : e)))
    } else {
      const newId = Math.max(0, ...events.map((e) => e.id)) + 1
      setEvents((prev) => [{ ...form, id: newId }, ...prev])
    }
    setEventOpen(false)
  }

  function removeEvent(id: number) {
    setEvents((prev) => prev.filter((e) => e.id !== id))
  }

  function refreshStatus() {
    // Demo-Refresh: in echter Implementierung würde dies fetch(`${config.apiUrl}/api/status`) machen
    setStatus({
      ...status,
      letzterHeartbeat: new Date().toISOString(),
      online: config.enabled,
      fps: Math.round((10 + Math.random() * 8) * 10) / 10,
    })
  }

  function toggleSystem() {
    setConfig({ ...config, enabled: !config.enabled })
    const newId = Math.max(0, ...events.map((e) => e.id)) + 1
    const event: StallwacheEvent = {
      id: newId,
      zeitstempel: new Date().toISOString().slice(0, 19),
      typ: !config.enabled ? 'System gestartet' : 'System gestoppt',
      beschreibung: !config.enabled
        ? `Stream verbunden zu ${config.cameraName}, Modell geladen (${config.device.toUpperCase()})`
        : 'System ordnungsgemäß heruntergefahren',
      bestaetigt: true,
    }
    setEvents((prev) => [event, ...prev])
    setStatus({ ...status, online: !config.enabled, letzterHeartbeat: new Date().toISOString() })
  }

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 flex items-center gap-2">
            <Eye className="w-6 h-6 text-green-700" />
            Stallwache
          </h1>
          <p className="text-stone-500 mt-0.5 text-sm">
            KI-Kalbungswache · YOLOv8 + RTSP via go2rtc + Telegram-Alerts
          </p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="https://github.com/Pulse3000/stallwache-skill"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-stone-500 hover:text-stone-800 flex items-center gap-1 px-2 py-1.5"
          >
            <Github className="w-3.5 h-3.5" />
            stallwache-skill
          </a>
          <Button
            onClick={toggleSystem}
            className={
              config.enabled
                ? 'bg-red-700 hover:bg-red-800 text-white gap-2'
                : 'bg-green-700 hover:bg-green-800 text-white gap-2'
            }
          >
            <Power className="w-4 h-4" />
            {config.enabled ? 'Stoppen' : 'Starten'}
          </Button>
        </div>
      </div>

      {/* Live-Status Banner */}
      <div
        className={`rounded-xl border p-5 ${
          config.enabled && status.online
            ? 'bg-green-50 border-green-200'
            : 'bg-stone-100 border-stone-200'
        }`}
      >
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div
              className={`flex items-center justify-center w-12 h-12 rounded-full ${
                config.enabled && status.online ? 'bg-green-500 text-white' : 'bg-stone-400 text-white'
              }`}
            >
              {config.enabled && status.online ? (
                <Wifi className="w-6 h-6" />
              ) : (
                <WifiOff className="w-6 h-6" />
              )}
            </div>
            <div>
              <p
                className={`text-lg font-bold ${
                  config.enabled && status.online ? 'text-green-900' : 'text-stone-700'
                }`}
              >
                {config.enabled && status.online ? 'System aktiv' : 'System offline'}
              </p>
              <p className="text-sm text-stone-600 mt-0.5">
                {config.cameraName} · letzter Heartbeat {relativeTime(status.letzterHeartbeat)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="text-center">
              <p className="text-xs text-stone-500">FPS</p>
              <p className="font-bold text-stone-900">{config.enabled ? status.fps : '–'}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-stone-500">Laufzeit</p>
              <p className="font-bold text-stone-900">
                {config.enabled ? formatUptime(status.uptimeSekunden) : '–'}
              </p>
            </div>
            <button
              onClick={refreshStatus}
              className="p-2 rounded-lg border border-stone-200 hover:bg-white transition-colors"
              title="Status aktualisieren"
            >
              <RefreshCw className="w-4 h-4 text-stone-600" />
            </button>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-stone-200 p-5">
          <div className="inline-flex p-2.5 rounded-lg bg-pink-50 mb-3">
            <Baby className="w-5 h-5 text-pink-700" />
          </div>
          <p className="text-2xl font-bold text-stone-900">{status.kalbungenGesamt}</p>
          <p className="text-sm font-medium text-stone-600 mt-0.5">Kalbungen erkannt</p>
          <p className="text-xs text-stone-400 mt-1">
            {letzteKalbung ? relativeTime(letzteKalbung.zeitstempel) : 'noch keine'}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-stone-200 p-5">
          <div className="inline-flex p-2.5 rounded-lg bg-amber-50 mb-3">
            <Activity className="w-5 h-5 text-amber-700" />
          </div>
          <p className="text-2xl font-bold text-stone-900">
            {status.detektionenGesamt.toLocaleString('de-DE')}
          </p>
          <p className="text-sm font-medium text-stone-600 mt-0.5">Detektionen gesamt</p>
          <p className="text-xs text-stone-400 mt-1">
            {status.framesGesamt.toLocaleString('de-DE')} Frames analysiert
          </p>
        </div>

        <div className="bg-white rounded-xl border border-stone-200 p-5">
          <div className="inline-flex p-2.5 rounded-lg bg-blue-50 mb-3">
            <Send className="w-5 h-5 text-blue-700" />
          </div>
          <p className="text-2xl font-bold text-stone-900">{status.alertsGesendet}</p>
          <p className="text-sm font-medium text-stone-600 mt-0.5">Telegram-Alerts</p>
          <p className="text-xs text-stone-400 mt-1">
            {config.telegramEnabled ? 'Bot aktiv' : 'Bot deaktiviert'}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-stone-200 p-5">
          <div
            className={`inline-flex p-2.5 rounded-lg mb-3 ${
              unbestaetigt > 0 ? 'bg-red-50' : 'bg-stone-50'
            }`}
          >
            <Bell className={`w-5 h-5 ${unbestaetigt > 0 ? 'text-red-700' : 'text-stone-500'}`} />
          </div>
          <p className="text-2xl font-bold text-stone-900">{unbestaetigt}</p>
          <p className="text-sm font-medium text-stone-600 mt-0.5">Unbestätigte Events</p>
          <p className="text-xs text-stone-400 mt-1">
            {todayEvents.length} Ereignisse heute
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-stone-200 flex gap-1 flex-wrap">
        {(
          [
            { id: 'live', label: 'Live', icon: Radio },
            { id: 'events', label: 'Eventlog', icon: Bell, badge: unbestaetigt },
            { id: 'config', label: 'Konfiguration', icon: Settings },
            { id: 'setup', label: 'Setup', icon: Cpu },
          ] as { id: Tab; label: string; icon: typeof Bell; badge?: number }[]
        ).map(({ id, label, icon: Icon, badge }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors flex items-center gap-1.5 ${
              tab === id
                ? 'border-green-700 text-green-800'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
            {badge !== undefined && badge > 0 && (
              <span className="inline-flex items-center justify-center text-[10px] bg-red-100 text-red-700 rounded-full w-5 h-5 font-semibold">
                {badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* TAB: Live */}
      {tab === 'live' && (
        <div className="space-y-4">
          {/* Kamera-Player */}
          <div className="rounded-2xl overflow-hidden bg-stone-950 shadow-xl">
            {/* Toolbar */}
            <div className="px-4 py-3 bg-stone-900/80 flex items-center gap-2.5">
              {config.enabled && (
                <span className="flex items-center gap-1.5 text-xs font-bold text-white bg-red-600 px-2.5 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  LIVE
                </span>
              )}
              <span className="text-stone-300 text-sm font-medium">{config.cameraName}</span>
              {config.enabled && (
                <span className="text-stone-500 text-xs font-mono">
                  {status.fps.toFixed(1)} fps
                </span>
              )}
            </div>
            <StallwacheLiveStream />
          </div>

          {/* Alarm-Banner */}
          {letzteAktivitaet && !letzteAktivitaet.bestaetigt && (
            <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-amber-900">Neue Aktivität: {letzteAktivitaet.typ}</p>
                <p className="text-sm text-amber-800 mt-0.5">{letzteAktivitaet.beschreibung}</p>
                <p className="text-xs text-amber-700 mt-1">{formatDateTime(letzteAktivitaet.zeitstempel)}</p>
              </div>
              <button
                onClick={() => toggleAck(letzteAktivitaet.id)}
                className="px-3 py-1.5 rounded-lg bg-amber-700 hover:bg-amber-800 text-white text-xs font-medium shrink-0"
              >
                Bestätigen
              </button>
            </div>
          )}

          {/* Letzte Ereignisse */}
          <div className="bg-white rounded-xl border border-stone-200">
            <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
              <h2 className="font-semibold text-stone-900">Letzte Ereignisse</h2>
              <button onClick={() => setTab('events')} className="text-sm text-green-700 hover:text-green-800 font-medium">
                Alle →
              </button>
            </div>
            {sortedEvents.slice(0, 5).length === 0 ? (
              <p className="px-6 py-8 text-sm text-stone-400 text-center">Noch keine Ereignisse aufgezeichnet.</p>
            ) : (
              <div className="divide-y divide-stone-50">
                {sortedEvents.slice(0, 5).map((e) => {
                  const cfg = eventTypeConfig[e.typ]
                  const kuh = kuehe.find((k) => k.nr === e.kuhNr)
                  return (
                    <div key={e.id} className="px-6 py-3 flex items-start gap-3">
                      <div className={`p-2 rounded-lg border shrink-0 ${cfg.color}`}>
                        <cfg.icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap text-xs mb-0.5">
                          <span className="font-semibold text-stone-900">{e.typ}</span>
                          {e.konfidenz !== undefined && (
                            <span className="text-stone-400 font-mono">
                              {(e.konfidenz * 100).toFixed(0)} %
                            </span>
                          )}
                          {kuh && (
                            <Link
                              href="/tiere"
                              className="text-stone-500 hover:text-stone-800"
                              title="Zur Kuh"
                            >
                              · Nr. {String(kuh.nr).padStart(2, '0')} {kuh.name}
                            </Link>
                          )}
                          <span className="text-stone-400">· {relativeTime(e.zeitstempel)}</span>
                        </div>
                        <p className="text-sm text-stone-700">{e.beschreibung}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB: Eventlog */}
      {tab === 'events' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <p className="text-sm text-stone-500">{events.length} Ereignisse insgesamt</p>
            <div className="flex gap-2">
              {unbestaetigt > 0 && (
                <Button onClick={ackAll} variant="outline" className="text-sm">
                  <Check className="w-3.5 h-3.5 mr-1" /> Alle bestätigen
                </Button>
              )}
              <Button onClick={openNewEvent} className="bg-green-700 hover:bg-green-800 text-white gap-2">
                <Plus className="w-4 h-4" /> Eintrag
              </Button>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
            {sortedEvents.length === 0 ? (
              <p className="px-6 py-8 text-sm text-stone-400 text-center">Keine Ereignisse vorhanden.</p>
            ) : (
              <div className="divide-y divide-stone-50">
                {sortedEvents.map((e) => {
                  const cfg = eventTypeConfig[e.typ]
                  const kuh = kuehe.find((k) => k.nr === e.kuhNr)
                  return (
                    <div
                      key={e.id}
                      className={`px-5 py-3.5 flex items-start gap-3 ${e.bestaetigt ? 'opacity-60' : ''}`}
                    >
                      <div className={`p-2 rounded-lg border shrink-0 ${cfg.color}`}>
                        <cfg.icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="text-sm font-semibold text-stone-900">{e.typ}</span>
                          {e.konfidenz !== undefined && (
                            <span className="text-xs text-stone-500 font-mono px-1.5 py-0.5 rounded bg-stone-100">
                              {(e.konfidenz * 100).toFixed(0)} %
                            </span>
                          )}
                          {kuh && (
                            <span className="text-xs text-stone-600 inline-flex items-center gap-1">
                              · Nr. {String(kuh.nr).padStart(2, '0')} {kuh.name}
                            </span>
                          )}
                          {e.bestaetigt && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-100 text-green-800 font-medium">
                              bestätigt
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-stone-700">{e.beschreibung}</p>
                        <p className="text-xs text-stone-400 mt-1 font-mono">
                          {formatDateTime(e.zeitstempel)}
                        </p>
                      </div>
                      <div className="flex gap-0.5 shrink-0">
                        <button
                          onClick={() => toggleAck(e.id)}
                          title={e.bestaetigt ? 'Wieder öffnen' : 'Bestätigen'}
                          className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-green-600 transition-colors"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => openEditEvent(e)}
                          className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => removeEvent(e.id)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-stone-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB: Konfiguration */}
      {tab === 'config' && (
        <div className="space-y-6">
          {/* Security-Hinweis */}
          <div className="rounded-xl border border-green-200 bg-green-50 p-4 flex items-start gap-3">
            <div className="shrink-0 mt-0.5 w-5 h-5 rounded-full bg-green-600 flex items-center justify-center">
              <svg viewBox="0 0 16 16" fill="white" className="w-3 h-3"><path d="M8 1a5 5 0 0 1 5 5v1.5a1.5 1.5 0 0 1 1.5 1.5v4A1.5 1.5 0 0 1 13 14.5H3A1.5 1.5 0 0 1 1.5 13V9A1.5 1.5 0 0 1 3 7.5V6a5 5 0 0 1 5-5zm0 1a4 4 0 0 0-4 4v1.5h8V6a4 4 0 0 0-4-4zm0 7a1 1 0 1 0 0 2 1 1 0 0 0 0-2z"/></svg>
            </div>
            <div>
              <p className="font-semibold text-green-900 text-sm">Keine Passwörter im Frontend</p>
              <p className="text-xs text-green-800 mt-0.5">
                RTSP-URL und ONVIF-Passwort werden <strong>nicht</strong> hier konfiguriert –
                sie gehören ausschließlich in <code className="font-mono bg-green-100 px-1 rounded">go2rtc.yaml</code> auf
                dem lokalen Server. Das Dashboard speichert nur passwortfreie HTTPS-URLs (Cloudflare Tunnel).
              </p>
            </div>
          </div>

          {/* Kamera */}
          <div className="bg-white rounded-xl border border-stone-200 p-6">
            <h2 className="font-semibold text-stone-900 mb-1 flex items-center gap-2">
              <Camera className="w-4 h-4 text-stone-500" /> Kamera & Stream-Endpunkte
            </h2>
            <p className="text-xs text-stone-400 mb-4">
              LSC Smart Connect Indoor · LAN-IP: 192.168.178.104 · go2rtc → Cloudflare → HLS
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Name der Kamera</Label>
                <Input
                  className="mt-1"
                  value={config.cameraName}
                  onChange={(e) => setConfig({ ...config, cameraName: e.target.value })}
                />
              </div>
              <div>
                <Label>go2rtc Stream-Name</Label>
                <Input
                  className="mt-1 font-mono text-sm"
                  value={config.go2rtcStreamName}
                  onChange={(e) => setConfig({ ...config, go2rtcStreamName: e.target.value })}
                  placeholder="stallwache"
                />
                <p className="text-xs text-stone-400 mt-1">
                  Muss mit dem Schlüssel in <code>go2rtc.yaml → streams:</code> übereinstimmen.
                </p>
              </div>
              <div className="md:col-span-2">
                <Label>HLS-URL (Browser · primär)</Label>
                <Input
                  className="mt-1 font-mono text-sm"
                  value={config.cameraStreamUrlHls}
                  onChange={(e) => setConfig({ ...config, cameraStreamUrlHls: e.target.value })}
                  placeholder="https://stream.stollenhof.de/api/stream.m3u8?src=stallwache"
                />
                <p className="text-xs text-stone-400 mt-1">
                  go2rtc-HLS via Cloudflare Tunnel – HTTPS, kein Passwort in der URL.
                  Format: <code className="bg-stone-100 px-1 rounded">https://&lt;tunnel&gt;/api/stream.m3u8?src=&lt;name&gt;</code>
                </p>
              </div>
              <div className="md:col-span-2">
                <Label>MJPEG-URL (Fallback, optional)</Label>
                <Input
                  className="mt-1 font-mono text-sm"
                  value={config.cameraStreamUrlMjpeg}
                  onChange={(e) => setConfig({ ...config, cameraStreamUrlMjpeg: e.target.value })}
                  placeholder="https://stream.stollenhof.de/api/stream.mjpeg?src=stallwache"
                />
              </div>
              <div>
                <Label>go2rtc Local-URL</Label>
                <Input
                  className="mt-1 font-mono text-sm"
                  value={config.go2rtcUrl}
                  onChange={(e) => setConfig({ ...config, go2rtcUrl: e.target.value })}
                  placeholder="http://192.168.178.50:1984"
                />
                <p className="text-xs text-stone-400 mt-1">Für das Python-Backend im LAN.</p>
              </div>
              <div>
                <Label>go2rtc Public-URL (Cloudflare)</Label>
                <Input
                  className="mt-1 font-mono text-sm"
                  value={config.go2rtcPublicUrl}
                  onChange={(e) => setConfig({ ...config, go2rtcPublicUrl: e.target.value })}
                  placeholder="https://stream.stollenhof.de"
                />
                <p className="text-xs text-stone-400 mt-1">HTTPS-Endpunkt via Cloudflare Tunnel.</p>
              </div>
            </div>
          </div>

          {/* YOLOv8 */}
          <div className="bg-white rounded-xl border border-stone-200 p-6">
            <h2 className="font-semibold text-stone-900 mb-4 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-stone-500" /> KI-Modell (YOLOv8)
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label>Modell-Pfad</Label>
                <Input
                  className="mt-1 font-mono text-sm"
                  value={config.modelPath}
                  onChange={(e) => setConfig({ ...config, modelPath: e.target.value })}
                />
              </div>
              <div>
                <Label>Konfidenz-Schwelle ({(config.confidenceThreshold * 100).toFixed(0)} %)</Label>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  className="mt-2 w-full"
                  value={config.confidenceThreshold}
                  onChange={(e) =>
                    setConfig({ ...config, confidenceThreshold: parseFloat(e.target.value) })
                  }
                />
                <p className="text-xs text-stone-400 mt-1">Höher = weniger Fehlalarme, evtl. verpasste Ereignisse</p>
              </div>
              <div>
                <Label>IoU-Schwelle ({(config.iouThreshold * 100).toFixed(0)} %)</Label>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  className="mt-2 w-full"
                  value={config.iouThreshold}
                  onChange={(e) => setConfig({ ...config, iouThreshold: parseFloat(e.target.value) })}
                />
                <p className="text-xs text-stone-400 mt-1">Non-Maximum-Suppression Überlappungsfilter</p>
              </div>
              <div>
                <Label>Inferenz-Gerät</Label>
                <select
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-stone-300 text-sm bg-white"
                  value={config.device}
                  onChange={(e) =>
                    setConfig({ ...config, device: e.target.value as StallwacheConfig['device'] })
                  }
                >
                  <option value="cpu">CPU</option>
                  <option value="cuda">CUDA (NVIDIA GPU)</option>
                  <option value="mps">MPS (Apple Silicon)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Telegram */}
          <div className="bg-white rounded-xl border border-stone-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-stone-900 flex items-center gap-2">
                <Send className="w-4 h-4 text-stone-500" /> Telegram-Benachrichtigung
              </h2>
              <label className="inline-flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={config.telegramEnabled}
                  onChange={(e) => setConfig({ ...config, telegramEnabled: e.target.checked })}
                  className="w-4 h-4 rounded border-stone-300 text-green-700 focus:ring-green-600"
                />
                Aktiv
              </label>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Bot-Token</Label>
                <Input
                  type="password"
                  className="mt-1 font-mono text-sm"
                  value={config.telegramBotToken}
                  onChange={(e) => setConfig({ ...config, telegramBotToken: e.target.value })}
                  placeholder="123456:ABC-DEF..."
                  disabled={!config.telegramEnabled}
                />
              </div>
              <div>
                <Label>Chat-ID</Label>
                <Input
                  className="mt-1 font-mono text-sm"
                  value={config.telegramChatId}
                  onChange={(e) => setConfig({ ...config, telegramChatId: e.target.value })}
                  placeholder="-1001234567890"
                  disabled={!config.telegramEnabled}
                />
              </div>
              <div>
                <Label>Alert-Cooldown (Sekunden)</Label>
                <Input
                  type="number"
                  min={0}
                  className="mt-1"
                  value={config.alertCooldownSeconds}
                  onChange={(e) =>
                    setConfig({ ...config, alertCooldownSeconds: parseInt(e.target.value) || 0 })
                  }
                  disabled={!config.telegramEnabled}
                />
              </div>
              <div className="flex items-end">
                <label className="inline-flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={config.telegramSendImage}
                    onChange={(e) => setConfig({ ...config, telegramSendImage: e.target.checked })}
                    disabled={!config.telegramEnabled}
                    className="w-4 h-4 rounded border-stone-300 text-green-700 focus:ring-green-600"
                  />
                  Bild im Alarm mitsenden
                </label>
              </div>
            </div>
          </div>

          {/* API-Endpoint */}
          <div className="bg-white rounded-xl border border-stone-200 p-6">
            <h2 className="font-semibold text-stone-900 mb-4 flex items-center gap-2">
              <Radio className="w-4 h-4 text-stone-500" /> Backend-Verbindung
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label>API-URL des Python-Backends</Label>
                <Input
                  className="mt-1 font-mono text-sm"
                  value={config.apiUrl}
                  onChange={(e) => setConfig({ ...config, apiUrl: e.target.value })}
                  placeholder="http://192.168.x.x:8080"
                />
                <p className="text-xs text-stone-400 mt-1">
                  Dieses Dashboard verbindet sich (falls erreichbar) mit dem stallwache-skill Backend.
                  Sonst werden Demo-Daten angezeigt.
                </p>
              </div>
              <div>
                <Label>Datenaufbewahrung (Tage)</Label>
                <Input
                  type="number"
                  min={1}
                  className="mt-1"
                  value={config.retentionDays}
                  onChange={(e) =>
                    setConfig({ ...config, retentionDays: parseInt(e.target.value) || 30 })
                  }
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: Setup */}
      {tab === 'setup' && (
        <div className="space-y-6">

          {/* Schritt 1: ONVIF aktivieren */}
          <div className="bg-white rounded-xl border border-stone-200 p-6 space-y-4">
            <h2 className="font-semibold text-stone-900 flex items-center gap-2">
              <Camera className="w-4 h-4 text-stone-500" /> Schritt 1 – ONVIF in der LSC-App aktivieren
            </h2>
            <p className="text-sm text-stone-600">
              Die LSC Smart Connect Indoor Camera liefert RTSP nur, wenn ONVIF aktiviert wurde:
            </p>
            <ol className="list-decimal pl-5 text-sm text-stone-600 space-y-1.5">
              <li>In der <strong>LSC Smart Connect</strong> App die Kamera öffnen</li>
              <li>Einstellungen → <strong>„PC-Ansicht"</strong> / <strong>„ONVIF"</strong></li>
              <li>Benutzer auf <code className="font-mono text-xs bg-stone-100 px-1 rounded">admin</code>, Passwort frei wählen</li>
              <li>Speichern und in der Stallwache unter <strong>Konfiguration → ONVIF-Benutzer</strong> hinterlegen</li>
            </ol>
            <div className="rounded-lg border border-stone-200 p-4">
              <p className="font-semibold text-stone-900 mb-2">Mit VLC testen (Mac/Win/Linux)</p>
              <pre className="bg-stone-900 text-stone-100 rounded p-3 overflow-x-auto text-xs font-mono">
                vlc rtsp://admin:DEIN_ONVIF_PASSWORT@192.168.178.104:554/live/ch0
              </pre>
              <p className="text-xs text-stone-500 mt-2">
                LSC/Tuya-Standardpfad: <code>/live/ch0</code>. Falls kein Bild → andere Pfade probieren:
                <code className="ml-1">/onvif1</code>, <code>/stream1</code>, <code>/cam/realmonitor?channel=1&subtype=0</code>.
              </p>
            </div>
          </div>

          {/* Schritt 2: go2rtc */}
          <div className="bg-white rounded-xl border border-stone-200 p-6 space-y-4">
            <h2 className="font-semibold text-stone-900 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-stone-500" /> Schritt 2 – go2rtc (RTSP → HLS-Bridge)
            </h2>
            <p className="text-sm text-stone-600">
              go2rtc wandelt RTSP in HLS / WebRTC / MJPEG um. Empfohlen via <strong>Docker</strong> auf dem
              Ubuntu-System – läuft permanent, auto-restart.
            </p>
            <div className="space-y-3 text-sm">
              <div className="rounded-lg border border-stone-200 p-4">
                <p className="font-semibold text-stone-900 mb-2">go2rtc.yaml erstellen</p>
                <pre className="bg-stone-900 text-stone-100 rounded p-3 overflow-x-auto text-xs font-mono leading-relaxed">
{`streams:
  stallwache:
    # Passwort vorher in LSC-App unter "PC-Ansicht/ONVIF" setzen
    - rtsp://admin:DEIN_ONVIF_PASSWORT@192.168.178.104:554/live/ch0

api:
  listen: ":1984"

rtsp:
  listen: ":8554"

webrtc:
  candidates:
    - stun:8555`}
                </pre>
              </div>
              <div className="rounded-lg border border-stone-200 p-4">
                <p className="font-semibold text-stone-900 mb-2">Docker-Compose (empfohlen)</p>
                <pre className="bg-stone-900 text-stone-100 rounded p-3 overflow-x-auto text-xs font-mono leading-relaxed">
{`# docker-compose.yml
services:
  go2rtc:
    image: alexxit/go2rtc
    container_name: go2rtc
    network_mode: host
    restart: unless-stopped
    volumes:
      - ./go2rtc.yaml:/config/go2rtc.yaml:ro`}
                </pre>
                <pre className="bg-stone-900 text-stone-100 rounded p-3 overflow-x-auto text-xs font-mono mt-2">
                  docker compose up -d{'\n'}
                  docker logs -f go2rtc
                </pre>
              </div>
              <div className="rounded-lg border border-stone-200 p-4">
                <p className="font-semibold text-stone-900 mb-2">Lokal testen</p>
                <pre className="bg-stone-900 text-stone-100 rounded p-3 overflow-x-auto text-xs font-mono">
                  {`# Web-UI:           http://192.168.178.50:1984/`}{'\n'}
                  {`# HLS-Endpunkt:     http://192.168.178.50:1984/api/stream.m3u8?src=stallwache`}{'\n'}
                  {`# MJPEG-Endpunkt:   http://192.168.178.50:1984/api/stream.mjpeg?src=stallwache`}{'\n'}
                  {`# WebRTC-Endpunkt:  http://192.168.178.50:1984/stream.html?src=stallwache`}
                </pre>
                <p className="text-xs text-stone-500 mt-2">
                  IP <strong>192.168.178.50</strong> durch die LAN-IP deines Ubuntu-Systems ersetzen.
                </p>
              </div>
            </div>
          </div>

          {/* Schritt 3: Cloudflare Tunnel */}
          <div className="bg-white rounded-xl border border-stone-200 p-6 space-y-4">
            <h2 className="font-semibold text-stone-900 flex items-center gap-2">
              <Radio className="w-4 h-4 text-stone-500" /> Schritt 3 – Cloudflare Tunnel (HTTPS-Exposure)
            </h2>
            <p className="text-sm text-stone-600">
              Damit der Stream von <code className="text-xs bg-stone-100 px-1 rounded">stollenhof.vercel.app</code> aus geladen werden kann,
              muss go2rtc per HTTPS erreichbar sein (sonst blockt der Browser wegen Mixed Content).
              Cloudflare Tunnel kostet nichts und benötigt keine Port-Weiterleitung am Router.
            </p>
            <div className="space-y-3 text-sm">
              <div className="rounded-lg border border-stone-200 p-4">
                <p className="font-semibold text-stone-900 mb-2">cloudflared installieren & einrichten</p>
                <pre className="bg-stone-900 text-stone-100 rounded p-3 overflow-x-auto text-xs font-mono leading-relaxed">
{`# Installation (Ubuntu/Debian)
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb -o cloudflared.deb
sudo dpkg -i cloudflared.deb

# Einmalige Authentifizierung
cloudflared tunnel login

# Tunnel anlegen
cloudflared tunnel create stollenhof-stream
# → speichert ~/.cloudflared/<UUID>.json`}
                </pre>
              </div>
              <div className="rounded-lg border border-stone-200 p-4">
                <p className="font-semibold text-stone-900 mb-2">~/.cloudflared/config.yml</p>
                <pre className="bg-stone-900 text-stone-100 rounded p-3 overflow-x-auto text-xs font-mono leading-relaxed">
{`tunnel: <UUID-aus-create>
credentials-file: /root/.cloudflared/<UUID>.json

ingress:
  - hostname: stream.stollenhof.de
    service: http://localhost:1984
  - service: http_status:404`}
                </pre>
              </div>
              <div className="rounded-lg border border-stone-200 p-4">
                <p className="font-semibold text-stone-900 mb-2">DNS-Eintrag + Start</p>
                <pre className="bg-stone-900 text-stone-100 rounded p-3 overflow-x-auto text-xs font-mono">
                  {`# DNS-Record automatisch anlegen`}{'\n'}
                  cloudflared tunnel route dns stollenhof-stream stream.stollenhof.de{'\n\n'}
                  {`# Als Systemdienst installieren (auto-restart)`}{'\n'}
                  sudo cloudflared service install
                </pre>
                <p className="text-xs text-stone-500 mt-2">
                  Danach ist <code>https://stream.stollenhof.de/api/stream.m3u8?src=stallwache</code> öffentlich erreichbar.
                </p>
              </div>
              <div className="rounded-lg border border-amber-100 bg-amber-50 p-4">
                <p className="font-semibold text-amber-900 mb-1">⚠ Sicherheit</p>
                <p className="text-xs text-amber-800">
                  Der HLS-Stream wäre damit für jeden mit der URL erreichbar.
                  In <strong>Cloudflare Zero Trust → Access</strong> eine Policy auf <code>stream.stollenhof.de</code> setzen
                  (z.B. E-Mail-Whitelist), um den Zugriff einzuschränken.
                </p>
              </div>
            </div>
          </div>

          {/* Schritt 4: Python-Backend */}
          <div className="bg-white rounded-xl border border-stone-200 p-6 space-y-4">
            <h2 className="font-semibold text-stone-900 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-stone-500" /> Schritt 4 – Python-Backend (YOLOv8 KI, optional)
            </h2>
            <p className="text-sm text-stone-600">
              Das Backend liest den RTSP-Stream direkt von der Kamera, führt YOLOv8n-Inferenz aus und
              schickt Telegram-Alerts. go2rtc und Backend laufen unabhängig.
            </p>
            <div className="rounded-lg border border-stone-200 p-4">
              <pre className="bg-stone-900 text-stone-100 rounded p-3 overflow-x-auto text-xs font-mono">
                git clone https://github.com/Pulse3000/stallwache-skill.git{'\n'}
                cd stallwache-skill{'\n'}
                cp .env.example .env{'\n'}
                {`# .env anpassen:`}{'\n'}
                {`# CAMERA_STREAM_URL=rtsp://admin:PW@192.168.178.104:554/live/ch0`}{'\n'}
                {`# TELEGRAM_BOT_TOKEN=...`}{'\n'}
                {`# TELEGRAM_CHAT_ID=...`}{'\n'}
                {`# FEATURE_WEB_DASHBOARD=true`}{'\n'}
                docker compose up -d
              </pre>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-stone-200 p-6">
            <h2 className="font-semibold text-stone-900 mb-3">Empfohlene Hardware</h2>
            <ul className="text-sm text-stone-600 space-y-1.5 list-disc pl-5">
              <li>Ubuntu Mini-PC oder Raspberry Pi 4/5 (≥ 4 GB RAM) – läuft go2rtc + cloudflared + Backend</li>
              <li>Optional: NVIDIA-GPU für höhere FPS (CUDA aktivieren)</li>
              <li>LSC Smart Connect Indoor IP Camera · LAN-IP: 192.168.178.104</li>
              <li>Cloudflare-Account (kostenlos) mit Domain <code>stollenhof.de</code></li>
              <li>Telegram-Bot via @BotFather, Chat-ID via @userinfobot</li>
            </ul>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-900 text-sm">Hinweis</p>
              <p className="text-sm text-amber-800 mt-0.5">
                Die KI-Erkennung ist ein Hilfssystem – sie ersetzt nicht die menschliche
                Kontrolle in der Abkalbephase. Bei kritischen Tieren weiterhin regelmäßig
                vor Ort prüfen.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Event-Dialog */}
      <Dialog open={eventOpen} onOpenChange={setEventOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editId !== null ? 'Ereignis bearbeiten' : 'Neues Ereignis'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Zeitstempel *</Label>
                <Input
                  type="datetime-local"
                  className="mt-1"
                  value={form.zeitstempel.slice(0, 16)}
                  onChange={(e) => setForm({ ...form, zeitstempel: e.target.value })}
                />
              </div>
              <div>
                <Label>Typ</Label>
                <select
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-stone-300 text-sm bg-white"
                  value={form.typ}
                  onChange={(e) => setForm({ ...form, typ: e.target.value as StallwacheEventTyp })}
                >
                  {(
                    [
                      'Kalbung erkannt',
                      'Aktivität',
                      'System gestartet',
                      'System gestoppt',
                      'Telegram-Alert',
                      'Fehler',
                    ] as StallwacheEventTyp[]
                  ).map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Konfidenz (0–1, optional)</Label>
                <Input
                  type="number"
                  step="0.01"
                  min={0}
                  max={1}
                  className="mt-1"
                  value={form.konfidenz ?? ''}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      konfidenz: e.target.value === '' ? undefined : parseFloat(e.target.value),
                    })
                  }
                />
              </div>
              <div>
                <Label>Verknüpfte Kuh (optional)</Label>
                <select
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-stone-300 text-sm bg-white"
                  value={form.kuhNr ?? 0}
                  onChange={(e) => {
                    const nr = parseInt(e.target.value) || 0
                    setForm({ ...form, kuhNr: nr === 0 ? undefined : nr })
                  }}
                >
                  <option value={0}>– keine –</option>
                  {kuehe.map((k) => (
                    <option key={k.nr} value={k.nr}>
                      Nr. {String(k.nr).padStart(2, '0')} · {k.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-span-2">
                <Label>Beschreibung *</Label>
                <textarea
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-stone-300 text-sm min-h-[70px]"
                  value={form.beschreibung}
                  onChange={(e) => setForm({ ...form, beschreibung: e.target.value })}
                />
              </div>
              <div className="col-span-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="bestaetigt"
                  checked={form.bestaetigt}
                  onChange={(e) => setForm({ ...form, bestaetigt: e.target.checked })}
                  className="w-4 h-4 rounded border-stone-300 text-green-700 focus:ring-green-600"
                />
                <Label htmlFor="bestaetigt" className="!mb-0 cursor-pointer">
                  Bereits bestätigt
                </Label>
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <Button variant="outline" onClick={() => setEventOpen(false)}>
                Abbrechen
              </Button>
              <Button onClick={saveEvent} className="bg-green-700 hover:bg-green-800 text-white">
                {editId !== null ? 'Speichern' : 'Anlegen'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
