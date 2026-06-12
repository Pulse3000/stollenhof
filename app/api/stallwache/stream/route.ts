import { NextRequest, NextResponse } from 'next/server'
import { getLiveStreamUrl, type StreamProtocol } from '@/lib/tuya'

export const dynamic = 'force-dynamic'

// GET /api/stallwache/stream?type=HLS[&deviceId=...]
// Liefert die aktuelle Live-Stream-URL der Tuya-Kamera.
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const deviceId = searchParams.get('deviceId') || process.env.TUYA_DEVICE_ID
  const type = (searchParams.get('type') || 'HLS').toUpperCase() as StreamProtocol

  if (!deviceId) {
    return NextResponse.json(
      { error: 'Keine Device-ID. TUYA_DEVICE_ID setzen oder ?deviceId= angeben.' },
      { status: 400 },
    )
  }
  if (type !== 'HLS' && type !== 'RTSP') {
    return NextResponse.json({ error: 'type muss HLS oder RTSP sein.' }, { status: 400 })
  }

  const uid = searchParams.get('uid') || process.env.TUYA_USER_ID || undefined

  try {
    // Bevorzugt der User-ID-Endpunkt (falls uid bekannt) – funktioniert für
    // Smart-Home-verknüpfte Geräte. Bei Fehler ohne uid kein Fallback nötig.
    const url = await getLiveStreamUrl(deviceId, type, uid)
    return NextResponse.json({ url, type, deviceId })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unbekannter Fehler'
    // Wenn der uid-Pfad scheitert, einmal den device-only-Endpunkt probieren
    // (und umgekehrt), bevor wir aufgeben.
    if (uid) {
      try {
        const url = await getLiveStreamUrl(deviceId, type)
        return NextResponse.json({ url, type, deviceId })
      } catch {
        /* unten gemeinsamer Fehler */
      }
    }
    return NextResponse.json({ error: msg }, { status: 502 })
  }
}
