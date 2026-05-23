// Next.js API Route: GET /api/get-stream
// Ruft vom Tuya Cloud Backend eine zeitlich begrenzte HLS-Stream-URL ab
// und gibt sie ans Frontend weiter – ohne Credentials zu exponieren.
import { NextResponse } from 'next/server'
import { allocateStream } from '@/lib/tuya-api'

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
    const { url, expiresAt } = await allocateStream(device)
    return NextResponse.json(
      { url, expiresAt },
      { headers: { 'Cache-Control': 'no-store, no-cache' } },
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[get-stream] Tuya API Fehler:', message)
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
