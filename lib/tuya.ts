import crypto from 'node:crypto'

// Server-seitiger Tuya OpenAPI Client (HMAC-SHA256 Signierung).
// Nur in Route Handlers / Server Components verwenden – niemals im Browser,
// da hier der Access Secret benutzt wird.

const REGION_HOSTS: Record<string, string> = {
  eu: 'https://openapi.tuyaeu.com',
  us: 'https://openapi.tuyaus.com',
  cn: 'https://openapi.tuyacn.com',
  in: 'https://openapi.tuyain.com',
}

function getHost(): string {
  const region = (process.env.TUYA_REGION || 'eu').toLowerCase()
  return REGION_HOSTS[region] ?? REGION_HOSTS.eu
}

function getCreds(): { accessId: string; accessSecret: string } {
  const accessId = process.env.TUYA_ACCESS_ID
  const accessSecret = process.env.TUYA_ACCESS_SECRET
  if (!accessId || !accessSecret) {
    throw new Error('TUYA_ACCESS_ID und TUYA_ACCESS_SECRET müssen gesetzt sein.')
  }
  return { accessId, accessSecret }
}

const sha256Hex = (input: string) =>
  crypto.createHash('sha256').update(input, 'utf8').digest('hex')

const hmacUpper = (str: string, secret: string) =>
  crypto.createHmac('sha256', secret).update(str, 'utf8').digest('hex').toUpperCase()

// stringToSign = METHOD \n sha256(body) \n headers \n url(path+sortierte query)
function buildStringToSign(method: string, path: string, body: string): string {
  return [method.toUpperCase(), sha256Hex(body), '', path].join('\n')
}

type TokenCache = { token: string; expiresAt: number }
let tokenCache: TokenCache | null = null

async function getAccessToken(): Promise<string> {
  if (tokenCache && Date.now() < tokenCache.expiresAt) return tokenCache.token

  const { accessId, accessSecret } = getCreds()
  const path = '/v1.0/token?grant_type=1'
  const t = Date.now().toString()
  const stringToSign = buildStringToSign('GET', path, '')
  const sign = hmacUpper(accessId + t + stringToSign, accessSecret)

  const res = await fetch(getHost() + path, {
    method: 'GET',
    headers: {
      client_id: accessId,
      sign,
      t,
      sign_method: 'HMAC-SHA256',
    },
    cache: 'no-store',
  })
  const json = await res.json()
  if (!json.success) {
    throw new Error(`Tuya Token-Fehler: ${json.code} ${json.msg}`)
  }
  const token: string = json.result.access_token
  const expireSec: number = json.result.expire_time ?? 7200
  tokenCache = { token, expiresAt: Date.now() + (expireSec - 60) * 1000 }
  return token
}

async function signedRequest<T = unknown>(
  method: 'GET' | 'POST',
  path: string,
  body?: unknown,
): Promise<T> {
  const { accessId, accessSecret } = getCreds()
  const token = await getAccessToken()
  const bodyStr = body === undefined ? '' : JSON.stringify(body)
  const t = Date.now().toString()
  const stringToSign = buildStringToSign(method, path, bodyStr)
  const sign = hmacUpper(accessId + token + t + stringToSign, accessSecret)

  const res = await fetch(getHost() + path, {
    method,
    headers: {
      client_id: accessId,
      access_token: token,
      sign,
      t,
      sign_method: 'HMAC-SHA256',
      ...(bodyStr ? { 'Content-Type': 'application/json' } : {}),
    },
    body: bodyStr || undefined,
    cache: 'no-store',
  })
  const json = await res.json()
  if (!json.success) {
    throw new Error(`Tuya API-Fehler (${path}): ${json.code} ${json.msg}`)
  }
  return json.result as T
}

export type StreamProtocol = 'HLS' | 'RTSP'

// Live-Stream-Adresse anfordern (HLS bevorzugt – im Browser direkt abspielbar).
export async function getLiveStreamUrl(
  deviceId: string,
  type: StreamProtocol = 'HLS',
): Promise<string> {
  const result = await signedRequest<{ url: string }>(
    'POST',
    `/v1.0/devices/${deviceId}/stream/actions/allocate`,
    { type },
  )
  return result.url
}

export type WebRtcConfig = {
  supports_webrtc: boolean
  auth: string
  moto_id: string
  id: string
  skill: string
  p2p_config: { ices: Array<{ urls: string; username?: string; credential?: string; ttl?: number }> }
  [key: string]: unknown
}

// WebRTC-Konfiguration der Kamera (ICE-Server, Auth-Token für Signaling).
export async function getWebRtcConfigs(deviceId: string): Promise<WebRtcConfig> {
  return signedRequest<WebRtcConfig>('GET', `/v1.0/devices/${deviceId}/webrtc-configs`)
}

export type TuyaDevice = {
  id: string
  name: string
  category: string
  product_name?: string
  online: boolean
}

// Mit dem Cloud-Projekt verknüpfte Geräte auflisten (zur Device-ID-Ermittlung).
export async function listDevices(): Promise<TuyaDevice[]> {
  const result = await signedRequest<{ devices?: TuyaDevice[] } | TuyaDevice[]>(
    'GET',
    '/v1.3/iot-03/devices?page_size=100',
  )
  if (Array.isArray(result)) return result
  return result.devices ?? []
}
