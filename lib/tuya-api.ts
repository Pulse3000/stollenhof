// Tuya Cloud Video API – server-only (läuft nur in Next.js API-Routes / Server Components)
// Credentials ausschließlich aus Env-Variablen – nie im Client-Bundle.
//
// Signatur-Algorithmus: Tuya API v1.0
//   Token-Request:  HMAC-SHA256(secret, client_id + t + nonce + stringToSign)
//   Auth. Request:  HMAC-SHA256(secret, client_id + access_token + t + nonce + stringToSign)
//   stringToSign:   HTTPMethod + "\n" + SHA256(body) + "\n" + "" + "\n" + path
//
// Docs: https://developer.tuya.com/en/docs/cloud/device-control?id=K95zu01ksols7

import { createHmac, createHash } from 'crypto'

const BASE = process.env.TUYA_BASE_URL ?? 'https://openapi.tuyaeu.com'
const CLIENT_ID = process.env.TUYA_CLIENT_ID ?? ''
const CLIENT_SECRET = process.env.TUYA_CLIENT_SECRET ?? ''

function sha256hex(s: string): string {
  return createHash('sha256').update(s, 'utf8').digest('hex')
}

function hmacSha256(secret: string, message: string): string {
  return createHmac('sha256', secret).update(message, 'utf8').digest('hex').toUpperCase()
}

function buildStringToSign(method: string, body: string, path: string): string {
  return `${method}\n${sha256hex(body)}\n\n${path}`
}

function buildHeaders(
  method: string,
  path: string,
  body: string,
  accessToken?: string,
): Record<string, string> {
  const t = Date.now().toString()
  const nonce = ''
  const str2sign = buildStringToSign(method, body, path)
  const signInput = accessToken
    ? CLIENT_ID + accessToken + t + nonce + str2sign
    : CLIENT_ID + t + nonce + str2sign
  return {
    client_id: CLIENT_ID,
    t,
    sign_method: 'HMAC-SHA256',
    nonce,
    sign: hmacSha256(CLIENT_SECRET, signInput),
    ...(accessToken && { access_token: accessToken }),
    'Content-Type': 'application/json',
  }
}

async function getAccessToken(): Promise<string> {
  const path = '/v1.0/token?grant_type=1'
  const res = await fetch(`${BASE}${path}`, {
    method: 'GET',
    headers: buildHeaders('GET', path, ''),
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(`Tuya token HTTP ${res.status}`)
  const data: { success: boolean; msg?: string; result?: { access_token: string } } =
    await res.json()
  if (!data.success) throw new Error(`Tuya token error: ${data.msg ?? 'unknown'}`)
  return data.result!.access_token
}

export interface TuyaStreamResult {
  url: string
  expiresAt: number // Unix-ms wann die URL abläuft
}

// ---------- WebRTC ----------
// Tuya WebRTC: GET /v1.0/devices/{device_id}/webrtc-configs
// Liefert ICE-Server, Auth-Token und Signaling-Service-ID (moto_id).
// Die eigentliche SDP-Aushandlung läuft über Tuyas MQTT-Signalisierung
// (separater Schritt, nicht Teil dieser Funktion).
export interface TuyaIceServer {
  urls: string
  username?: string
  credential?: string
  ttl?: number
}

export interface TuyaWebRtcConfig {
  id: string
  supports_webrtc: boolean
  auth: string
  moto_id: string
  skill: string
  vedio_clarity?: number
  p2p_config: { ices: TuyaIceServer[] }
  audio_attributes?: { call_mode?: number[]; hardware_capability?: number[] }
}

export async function getWebRtcConfig(deviceId: string): Promise<TuyaWebRtcConfig> {
  const token = await getAccessToken()
  const path = `/v1.0/devices/${deviceId}/webrtc-configs`
  const res = await fetch(`${BASE}${path}`, {
    method: 'GET',
    headers: buildHeaders('GET', path, '', token),
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(`Tuya webrtc-configs HTTP ${res.status}`)
  const data: { success: boolean; msg?: string; result?: TuyaWebRtcConfig } = await res.json()
  if (!data.success) throw new Error(`Tuya webrtc-configs error: ${data.msg ?? 'unknown'}`)
  if (!data.result) throw new Error('Tuya webrtc-configs: kein result')
  return data.result
}

// Stream-URL von der Tuya Cloud anfordern (HLS).
// Die URL ist ~30 Minuten gültig – Frontend muss rechtzeitig erneut anfragen.
// Wird ein `uid` übergeben, wird der User-ID-Variant-Endpunkt benutzt
// (/v1.0/users/{uid}/devices/{id}/...) – manche Tuya-Projekte verlangen den.
export async function allocateStream(deviceId: string, uid?: string): Promise<TuyaStreamResult> {
  const token = await getAccessToken()
  const path = uid
    ? `/v1.0/users/${uid}/devices/${deviceId}/stream/actions/allocate`
    : `/v1.0/devices/${deviceId}/stream/actions/allocate`
  const body = JSON.stringify({ type: 'hls' })
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: buildHeaders('POST', path, body, token),
    body,
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(`Tuya allocate HTTP ${res.status}`)
  const data: {
    success: boolean
    msg?: string
    result?: { url: string }
  } = await res.json()
  if (!data.success) throw new Error(`Tuya allocate error: ${data.msg ?? 'unknown'}`)
  const url = data.result?.url
  if (!url) throw new Error('Tuya API: kein url in result')
  // 28 Minuten (konservativ vor der 30-min-TTL)
  return { url, expiresAt: Date.now() + 28 * 60 * 1000 }
}
