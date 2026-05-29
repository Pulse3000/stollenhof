'use client'

import { useEffect, useRef, useState } from 'react'
import { Camera, RefreshCw, AlertTriangle, Copy, Check, Link2 } from 'lucide-react'

const HLS_CDN = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.18/dist/hls.min.js'

// Lädt hls.js einmalig vom CDN (Browser braucht für die Tuya-HLS-URL ohnehin Internet).
let hlsLoader: Promise<unknown> | null = null
function loadHls(): Promise<unknown> {
  if (typeof window === 'undefined') return Promise.reject(new Error('kein window'))
  const w = window as unknown as { Hls?: unknown }
  if (w.Hls) return Promise.resolve(w.Hls)
  if (hlsLoader) return hlsLoader
  hlsLoader = new Promise((resolve, reject) => {
    const s = document.createElement('script')
    s.src = HLS_CDN
    s.onload = () => resolve((window as unknown as { Hls: unknown }).Hls)
    s.onerror = () => reject(new Error('hls.js konnte nicht geladen werden'))
    document.head.appendChild(s)
  })
  return hlsLoader
}

type HlsInstance = {
  loadSource: (url: string) => void
  attachMedia: (el: HTMLMediaElement) => void
  on: (ev: string, cb: (e: unknown, d: unknown) => void) => void
  destroy: () => void
}
type HlsCtor = {
  new (): HlsInstance
  isSupported: () => boolean
  Events: { ERROR: string; MANIFEST_PARSED: string }
}

export function StallwacheLiveStream({ deviceId }: { deviceId?: string }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const hlsRef = useRef<HlsInstance | null>(null)
  const [state, setState] = useState<'idle' | 'loading' | 'playing' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)
  const [streamUrl, setStreamUrl] = useState<string | null>(null)
  const [rtspUrl, setRtspUrl] = useState<string | null>(null)
  const [rtspLoading, setRtspLoading] = useState(false)
  const [rtspError, setRtspError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  async function start() {
    setState('loading')
    setError(null)
    try {
      const qs = deviceId ? `?type=HLS&deviceId=${encodeURIComponent(deviceId)}` : '?type=HLS'
      const res = await fetch(`/api/stallwache/stream${qs}`, { cache: 'no-store' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`)
      setStreamUrl(data.url)
      await attach(data.url)
    } catch (err) {
      setState('error')
      setError(err instanceof Error ? err.message : 'Stream konnte nicht geladen werden')
    }
  }

  async function attach(url: string) {
    const video = videoRef.current
    if (!video) return

    // Safari/iOS spielt HLS nativ ab
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url
      await video.play().catch(() => {})
      setState('playing')
      return
    }

    const Hls = (await loadHls()) as HlsCtor
    if (!Hls.isSupported()) {
      setState('error')
      setError('Browser unterstützt kein HLS')
      return
    }
    hlsRef.current?.destroy()
    const hls = new Hls()
    hlsRef.current = hls
    hls.loadSource(url)
    hls.attachMedia(video)
    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      video.play().catch(() => {})
      setState('playing')
    })
    hls.on(Hls.Events.ERROR, (_e, data) => {
      const d = data as { fatal?: boolean; type?: string }
      if (d.fatal) {
        setState('error')
        setError(`HLS-Fehler: ${d.type ?? 'unbekannt'}`)
      }
    })
  }

  async function fetchRtsp() {
    setRtspLoading(true)
    setRtspError(null)
    try {
      const qs = deviceId ? `?type=RTSP&deviceId=${encodeURIComponent(deviceId)}` : '?type=RTSP'
      const res = await fetch(`/api/stallwache/stream${qs}`, { cache: 'no-store' })
      const data = await res.json()
      if (!res.ok || !data.url) throw new Error(data.error || `HTTP ${res.status}`)
      setRtspUrl(data.url)
    } catch (err) {
      setRtspError(err instanceof Error ? err.message : 'RTSP-URL konnte nicht geladen werden')
    } finally {
      setRtspLoading(false)
    }
  }

  async function copyRtsp() {
    if (!rtspUrl) return
    try {
      await navigator.clipboard.writeText(rtspUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      /* Clipboard nicht verfügbar – URL ist sichtbar zum manuellen Kopieren */
    }
  }

  useEffect(() => {
    return () => {
      hlsRef.current?.destroy()
    }
  }, [])

  return (
    <div className="space-y-3">
    <div className="aspect-video bg-stone-950 relative flex items-center justify-center text-stone-400 rounded-lg overflow-hidden">
      <video
        ref={videoRef}
        className={`absolute inset-0 w-full h-full object-contain ${state === 'playing' ? '' : 'hidden'}`}
        playsInline
        muted
        controls
      />

      {state === 'playing' && (
        <div className="absolute top-3 left-3 flex items-center gap-2 bg-red-600/90 text-white px-2 py-1 rounded text-xs font-semibold z-10">
          <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
          LIVE
        </div>
      )}

      {state === 'idle' && (
        <div className="text-center">
          <Camera className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p className="text-sm opacity-70 mb-3">Tuya-Cloud-Stream (HLS)</p>
          <button
            onClick={start}
            className="px-4 py-2 rounded-lg bg-green-700 hover:bg-green-800 text-white text-sm font-medium"
          >
            Live-Stream laden
          </button>
        </div>
      )}

      {state === 'loading' && (
        <div className="text-center">
          <RefreshCw className="w-10 h-10 mx-auto mb-2 opacity-50 animate-spin" />
          <p className="text-sm opacity-70">Stream-URL wird angefordert…</p>
        </div>
      )}

      {state === 'error' && (
        <div className="text-center max-w-md px-6">
          <AlertTriangle className="w-10 h-10 mx-auto mb-2 text-amber-500" />
          <p className="text-sm text-amber-300">{error}</p>
          <button
            onClick={start}
            className="mt-3 px-4 py-2 rounded-lg bg-stone-700 hover:bg-stone-600 text-white text-sm font-medium"
          >
            Erneut versuchen
          </button>
        </div>
      )}

      {streamUrl && state === 'playing' && (
        <div className="absolute bottom-3 right-3 z-10">
          <button
            onClick={start}
            title="Stream neu laden"
            className="p-2 rounded-lg bg-black/60 hover:bg-black/80 text-white"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>

      {/* RTSP-URL (für VLC / go2rtc / YOLOv8-Backend – im Browser nicht abspielbar) */}
      <div className="rounded-lg border border-stone-200 bg-white p-4">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <Link2 className="w-4 h-4 text-stone-500" />
            <span className="text-sm font-medium text-stone-800">RTSP-Stream (extern)</span>
          </div>
          <button
            onClick={fetchRtsp}
            disabled={rtspLoading}
            className="text-xs px-3 py-1.5 rounded-lg border border-stone-300 hover:bg-stone-50 text-stone-700 inline-flex items-center gap-1.5 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${rtspLoading ? 'animate-spin' : ''}`} />
            RTSP-URL generieren
          </button>
        </div>
        <p className="text-xs text-stone-400 mt-1">
          Zeitlich begrenzte <code className="font-mono">rtsps://</code>-URL aus der Tuya-Cloud –
          für VLC, go2rtc oder das YOLOv8-Backend. Browser können RTSP nicht direkt abspielen.
        </p>
        {rtspError && (
          <p className="text-xs text-red-600 font-mono break-all mt-2">{rtspError}</p>
        )}
        {rtspUrl && (
          <div className="mt-2 flex items-stretch gap-2">
            <code className="flex-1 text-[11px] font-mono bg-stone-100 rounded px-2 py-1.5 break-all text-stone-700">
              {rtspUrl}
            </code>
            <button
              onClick={copyRtsp}
              title="In Zwischenablage kopieren"
              className="shrink-0 px-2.5 rounded-lg border border-stone-300 hover:bg-stone-50 text-stone-600 inline-flex items-center"
            >
              {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
