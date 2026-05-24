// Next.js API Route: GET /api/webrtc-config
// Liefert die Tuya WebRTC-Konfiguration des Devices ans Frontend –
// ohne Credentials zu exponieren (Auth/Sign erfolgt serverseitig).
import { NextResponse } from 'next/server'
import { getWebRtcConfig } from '@/lib/tuya-api'

export const dynamic = 'force-dynamic'

export async function GET() {
  const id = process.env.TUYA_CLIENT_ID
  const secret = process.env.TUYA_CLIENT_SECRET
  const device = process.env.TUYA_DEVICE_ID

  if (!id || !secret || !device) {
    return NextResponse.json(
      { error: 'Tuya-Credentials fehlen. TUYA_CLIENT_ID, TUYA_CLIENT_SECRET und TUYA_DEVICE_ID in .env.local setzen.' },
      { status: 503 },
    )
  }

  try {
    const config = await getWebRtcConfig(device)
    return NextResponse.json(config, {
      headers: { 'Cache-Control': 'no-store, no-cache' },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[webrtc-config] Tuya API Fehler:', message)
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
