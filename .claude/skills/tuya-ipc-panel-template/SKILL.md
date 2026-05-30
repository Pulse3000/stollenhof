---
name: tuya-ipc-panel-template
description: Scaffold a new Tuya IPC (IP-Kamera) Panel im Stollenhof-App-Stil — Cloud-Anbindung über lib/tuya.ts, Route Handler unter /api/<name>/stream und /api/<name>/devices, HLS+RTSP Live-Player nach dem Vorbild von components/stallwache-live-stream.tsx. Aufrufen, wenn der User eine weitere Tuya-Kamera (zusätzlich zur Stallwache) einbinden will oder einen IPC-Panel als Vorlage braucht.
---

# Tuya IPC Panel — Vorlage

Diese Vorlage richtet eine weitere Tuya-IP-Kamera in der Stollenhof-Web-App ein, analog zur bestehenden **Stallwache**. Sie nutzt die vorhandene Cloud-Anbindung (`lib/tuya.ts`) — kein eigenes Tuya-SDK, keine Mobile-Panels.

## Voraussetzungen

- Tuya Cloud Project mit verknüpftem Account (Smart Life / Tuya Smart App).
- Env-Vars gesetzt (Vercel + `.env.local`):
  - `TUYA_ACCESS_ID` (oder `TUYA_CLIENT_ID`)
  - `TUYA_ACCESS_SECRET` (oder `TUYA_CLIENT_SECRET`)
  - `TUYA_REGION` (`eu` / `us` / `cn` / `in`) **oder** `TUYA_BASE_URL`
  - optional: `TUYA_USER_ID` (UID des verknüpften Smart-Life-Accounts — viele Smart-Home-Geräte liefern nur über den User-ID-Endpunkt eine Stream-URL, sonst Fehler `1106 permission deny`).

## Was bereits existiert (NICHT duplizieren)

| Datei | Zweck |
|---|---|
| `lib/tuya.ts` | HMAC-SHA256 signierter OpenAPI-Client, Token-Caching, `getLiveStreamUrl`, `getWebRtcConfigs`, `listDevices` |
| `app/api/stallwache/stream/route.ts` | `GET ?type=HLS|RTSP&deviceId=…` → URL für die Stallwache-Kamera |
| `app/api/stallwache/devices/route.ts` | `GET` → Liste aller mit dem Cloud-Project verknüpften Geräte |
| `components/stallwache-live-stream.tsx` | HLS-Player (hls.js via CDN, Safari nativ) + RTSP-URL-Generator |

Bei einer **neuen** Kamera niemals `lib/tuya.ts` kopieren — immer importieren.

## Schritte für ein neues IPC-Panel `<name>` (z. B. `weide`, `tenne`)

### 1. Device-ID ermitteln

```bash
curl https://<deployment>/api/stallwache/devices
```

(Die Route hängt am Cloud-Project, nicht an der Stallwache — sie listet **alle** Geräte. `bind_space_id` / `custom_name` helfen beim Identifizieren.)

Felder pro Device:
- `id` → Tuya Device ID (z. B. `bf2a79bbdfdea796e1uiyl` für Stallwache)
- `custom_name`, `product_name`, `category` (`sp` = Smart Camera)
- `is_online`, `lat`/`lon`, `time_zone`
- `local_key`, `uuid` → **niemals ins Frontend** durchreichen

### 2. Stream-Route anlegen — `app/api/<name>/stream/route.ts`

```ts
import { NextRequest, NextResponse } from 'next/server'
import { getLiveStreamUrl, type StreamProtocol } from '@/lib/tuya'

export const dynamic = 'force-dynamic'

const DEFAULT_DEVICE_ID = process.env.<NAME>_TUYA_DEVICE_ID || ''

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const type = (searchParams.get('type') ?? 'HLS').toUpperCase() as StreamProtocol
    const deviceId = searchParams.get('deviceId') || DEFAULT_DEVICE_ID
    if (!deviceId) {
      return NextResponse.json({ error: 'deviceId fehlt' }, { status: 400 })
    }
    const uid = process.env.TUYA_USER_ID || undefined
    const url = await getLiveStreamUrl(deviceId, type, uid)
    return NextResponse.json({ url, type })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unbekannter Fehler'
    return NextResponse.json({ error: msg }, { status: 502 })
  }
}
```

### 3. Page-Komponente

```tsx
// app/<name>/page.tsx
import { StallwacheLiveStream } from '@/components/stallwache-live-stream'

export default function Page() {
  return (
    <main className="p-4">
      <StallwacheLiveStream deviceId={process.env.NEXT_PUBLIC_<NAME>_DEVICE_ID} />
    </main>
  )
}
```

Der `StallwacheLiveStream`-Komponente kann jede Device-ID übergeben werden — sie hängt nicht hart an der Stallwache. Falls die Stream-URL **nicht** unter `/api/stallwache/stream` liegen soll: Komponente kopieren als `components/<name>-live-stream.tsx` und die beiden `fetch(\`/api/stallwache/stream…\`)`-Aufrufe auf die neue Route umstellen.

### 4. Smoke-Test

```bash
pnpm type-check
pnpm build
```

Beide API-Routen müssen als **dynamic functions** auftauchen.

## Häufige Fallstricke

- **`1106 / permission deny`** beim Stream-Allocate: Smart-Home-verknüpftes Gerät → `TUYA_USER_ID` setzen, damit der `/v1.0/users/{uid}/devices/...`-Pfad benutzt wird (das macht `lib/tuya.ts` automatisch, wenn `uid` übergeben ist).
- **`local_key` / `uuid` im Browser**: niemals. Diese Felder bleiben serverseitig.
- **WebRTC**: niedrigere Latenz als HLS, braucht aber MQTT-Signaling. `getWebRtcConfigs(deviceId)` liefert ICE-Server + Auth-Token, die UI-Integration ist **noch nicht gebaut**. Default bleibt HLS.
- **`region` vs. `base_url`**: bei alten LSC-Geräten (in EU registriert, aber Hardware-IP in CN) lieber `TUYA_REGION=eu` explizit setzen — `lib/tuya.ts` defaultet zwar bereits auf EU, eine falsche `TUYA_BASE_URL` würde es überschreiben.
- **CDN `hls.js`**: der Player lädt `hls.js` via `cdn.jsdelivr.net`. Falls der Standort offline ist, lokale Kopie bundlen statt CDN.
- **Tuya-Netzwerkpolicy in der Web-Sandbox**: `openapi.tuyaeu.com` ist nicht in der Allowlist der Claude-Code-Web-Sandbox. Stream-Anbindung **lokal oder in Vercel** testen, nicht aus der Sandbox.

## Was diese Skill NICHT abdeckt

- Mobile-/Native-Panels über das Tuya „IPC Panel SDK" (Android/iOS). Das ist eine andere Welt und für die Web-App irrelevant.
- Aufzeichnung / SD-Karten-Playback (`/v1.0/devices/{id}/stream/playback`). Bei Bedarf separat ergänzen.
- PTZ-Steuerung (`/v1.0/iot-03/devices/{id}/commands`). Bei Bedarf separat ergänzen.

## Referenz-Device (Stallwache)

```
Device ID:        bf2a79bbdfdea796e1uiyl
Product:          LSC Smart Connect 1080P IP Indoor Mini
Model:            5525002401
Category:         sp
Region:           EU (time_zone +02:00)
```
