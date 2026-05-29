import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// GET /api/stallwache/health
// Diagnose: zeigt, welche Tuya-ENV-Variablen gesetzt sind – OHNE Werte zu leaken.
// Hilft beim Verifizieren der Vercel-Environment-Konfiguration nach einem Deploy.
export async function GET() {
  const accessId = process.env.TUYA_ACCESS_ID || process.env.TUYA_CLIENT_ID
  const accessSecret = process.env.TUYA_ACCESS_SECRET || process.env.TUYA_CLIENT_SECRET
  const deviceId = process.env.TUYA_DEVICE_ID
  const userId = process.env.TUYA_USER_ID
  const region = process.env.TUYA_REGION || (process.env.TUYA_BASE_URL ? 'custom' : 'eu (default)')

  // Nur Präsenz + maskierte Hinweise – niemals der echte Wert.
  const mask = (v?: string) => (v ? `gesetzt (${v.length} Zeichen, …${v.slice(-4)})` : 'FEHLT')

  const env = {
    TUYA_ACCESS_ID: mask(accessId),
    TUYA_ACCESS_SECRET: accessSecret ? 'gesetzt' : 'FEHLT',
    TUYA_DEVICE_ID: mask(deviceId),
    TUYA_USER_ID: userId ? mask(userId) : 'nicht gesetzt (optional – device-only-Endpunkt wird genutzt)',
    region,
  }

  const ready = Boolean(accessId && accessSecret && deviceId)

  return NextResponse.json(
    {
      ready,
      message: ready
        ? 'Tuya-Credentials vollständig. Stream-Allocate sollte funktionieren.'
        : 'Pflicht-Variablen fehlen: TUYA_ACCESS_ID, TUYA_ACCESS_SECRET, TUYA_DEVICE_ID setzen.',
      env,
    },
    { status: ready ? 200 : 503, headers: { 'Cache-Control': 'no-store, no-cache' } },
  )
}
