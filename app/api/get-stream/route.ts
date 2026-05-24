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

  const uid = process.env.TUYA_USER_ID

  // Zuerst Device-only-Endpunkt versuchen, bei 403/permission-Fehler auf
  // User-ID-Variante zurückfallen (manche Tuya-Projekte erlauben nur den).
  try {
    const { url, expiresAt } = await allocateStream(device)
    return NextResponse.json(
      { url, expiresAt },
      { headers: { 'Cache-Control': 'no-store, no-cache' } },
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    if (uid && /(403|permission|1106|1108|2007)/i.test(message)) {
      try {
        const { url, expiresAt } = await allocateStream(device, uid)
        return NextResponse.json(
          { url, expiresAt },
          { headers: { 'Cache-Control': 'no-store, no-cache' } },
        )
      } catch (err2) {
        const m2 = err2 instanceof Error ? err2.message : String(err2)
        console.error('[get-stream] Tuya API Fehler (uid-Fallback):', m2)
        return NextResponse.json({ error: `device+uid: ${m2}` }, { status: 502 })
      }
    }
    console.error('[get-stream] Tuya API Fehler:', message)
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
