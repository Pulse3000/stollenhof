import { NextResponse } from 'next/server'
import { listDevices } from '@/lib/tuya'

export const dynamic = 'force-dynamic'

// GET /api/stallwache/devices
// Listet die mit dem Cloud-Projekt verknüpften Geräte (zur Device-ID-Ermittlung).
export async function GET() {
  try {
    const devices = await listDevices()
    return NextResponse.json({ devices })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unbekannter Fehler'
    return NextResponse.json({ error: msg }, { status: 502 })
  }
}
