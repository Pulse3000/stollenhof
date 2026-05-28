'use client'

import { useEffect, useRef, useState } from 'react'
import { Camera, RefreshCw, AlertTriangle } from 'lucide-react'

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

  useEffect(() => {
    return () => {
      hlsRef.current?.destroy()
    }
  }, [])

  return (
    <div className="aspect-video bg-stone-950 relative flex items-center justify-center text-stone-400">
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
  )
}
