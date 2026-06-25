'use client'

import { useEffect, useRef, useState } from 'react'
import { Boxes, X, RotateCcw } from 'lucide-react'
import { usePersistedState } from '@/lib/use-persisted-state'
import {
  STORAGE_KEYS,
  initialKuehe,
  daysUntil,
  formatDate,
  type Kuh,
  type KuhStatus,
} from '@/lib/data'

// Statusfarben (Hex) für die 3D-Marker & Popup-Dots
const STATUS_COLOR: Record<KuhStatus, string> = {
  Gesund: '#4caf84',
  Trächtig: '#e8975e',
  'In Behandlung': '#e05c5c',
  Trockengestellt: '#6ba4e0',
}

function ohrmarkeFor(nr: number) {
  return `DE 08 123 4${String(5000 + nr).padStart(4, '0')}`
}

export default function Stall3DPage() {
  const [kuehe] = usePersistedState<Kuh[]>(STORAGE_KEYS.tiere, initialKuehe)
  const mountRef = useRef<HTMLDivElement>(null)
  const [selected, setSelected] = useState<Kuh | null>(null)
  const [hintVisible, setHintVisible] = useState(true)
  const [missingImages, setMissingImages] = useState<number[]>([])
  const resetViewRef = useRef<(() => void) | null>(null)

  const kueheRef = useRef(kuehe)
  kueheRef.current = kuehe

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    let disposed = false
    let cleanup: (() => void) | undefined

    ;(async () => {
      const THREE = await import('three')
      const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls.js')
      if (disposed || !mount) return

      const herd = kueheRef.current
      const numCows = herd.length
      const spacing = 2.2
      const startX = -((numCows - 1) * spacing) / 2

      const width = mount.clientWidth
      const height = mount.clientHeight

      const scene = new THREE.Scene()
      scene.background = new THREE.Color('#e8e4dc')
      scene.fog = new THREE.Fog('#e8e4dc', 50, 110)

      const camera = new THREE.PerspectiveCamera(50, width / height, 0.5, 160)
      const defaultCamPos = new THREE.Vector3(20, 13, 24)
      const target = new THREE.Vector3(0, 1.1, -1.0)
      camera.position.copy(defaultCamPos)
      camera.lookAt(target)

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
      renderer.setSize(width, height)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      renderer.shadowMap.enabled = true
      renderer.shadowMap.type = THREE.PCFSoftShadowMap
      renderer.toneMapping = THREE.ACESFilmicToneMapping
      renderer.toneMappingExposure = 1.1
      mount.appendChild(renderer.domElement)
      renderer.domElement.style.display = 'block'
      renderer.domElement.style.cursor = 'grab'

      // --- Licht ---
      scene.add(new THREE.AmbientLight('#ffffff', 1.8))
      const sun = new THREE.DirectionalLight('#fffef5', 3.6)
      sun.position.set(25, 30, 10)
      sun.castShadow = true
      sun.shadow.mapSize.set(2048, 2048)
      sun.shadow.camera.near = 0.5
      sun.shadow.camera.far = 120
      sun.shadow.camera.left = -60
      sun.shadow.camera.right = 60
      sun.shadow.camera.top = 30
      sun.shadow.camera.bottom = -10
      sun.shadow.bias = -0.0004
      sun.shadow.normalBias = 0.02
      scene.add(sun)
      const fill = new THREE.DirectionalLight('#d4e0ff', 1.4)
      fill.position.set(-10, 8, -5)
      scene.add(fill)

      const geometries: THREE.BufferGeometry[] = []
      const materials: THREE.Material[] = []
      const textures: THREE.Texture[] = []
      const track = <T extends THREE.BufferGeometry | THREE.Material>(o: T): T => {
        if ((o as THREE.BufferGeometry).isBufferGeometry) geometries.push(o as THREE.BufferGeometry)
        else materials.push(o as THREE.Material)
        return o
      }

      // --- Boden ---
      const floorW = Math.max(85, numCows * spacing + 12)
      const floor = new THREE.Mesh(
        track(new THREE.PlaneGeometry(floorW, 28)),
        track(new THREE.MeshStandardMaterial({ color: '#c8c0b2', roughness: 0.75, metalness: 0.05 })),
      )
      floor.rotation.x = -Math.PI / 2
      floor.position.y = -0.02
      floor.receiveShadow = true
      scene.add(floor)

      const stripeGeo = track(new THREE.PlaneGeometry(floorW, 0.25))
      const stripeMat = track(new THREE.MeshStandardMaterial({ color: '#b0a898', roughness: 0.8 }))
      for (let i = -3; i <= 4; i++) {
        const stripe = new THREE.Mesh(stripeGeo, stripeMat)
        stripe.rotation.x = -Math.PI / 2
        stripe.position.set(0, -0.01, i * 2.8)
        stripe.receiveShadow = true
        scene.add(stripe)
      }

      // --- Futtertisch ---
      const tableLength = numCows * spacing + 2
      const tableHeight = 0.65
      const table = new THREE.Mesh(
        track(new THREE.BoxGeometry(tableLength, tableHeight, 1.5)),
        track(new THREE.MeshStandardMaterial({ color: '#d5d3cf', roughness: 0.45, metalness: 0.15 })),
      )
      table.position.set(0, tableHeight / 2, 0.85)
      table.castShadow = true
      table.receiveShadow = true
      scene.add(table)
      const tableTop = new THREE.Mesh(
        track(new THREE.BoxGeometry(tableLength - 0.1, 0.08, 1.4)),
        track(new THREE.MeshStandardMaterial({ color: '#e0ded9', roughness: 0.35, metalness: 0.2 })),
      )
      tableTop.position.set(0, tableHeight + 0.02, 0.85)
      tableTop.receiveShadow = true
      scene.add(tableTop)

      // --- Fressgitter ---
      const postGeo = track(new THREE.CylinderGeometry(0.04, 0.05, 1.1, 8))
      const postMat = track(new THREE.MeshStandardMaterial({ color: '#7a7a7a', roughness: 0.3, metalness: 0.85 }))
      const postTopGeo = track(new THREE.CylinderGeometry(0.06, 0.04, 0.15, 8))
      const barGeo = track(new THREE.BoxGeometry(1.9, 0.06, 0.06))
      const barMat = track(new THREE.MeshStandardMaterial({ color: '#888888', roughness: 0.35, metalness: 0.8 }))

      for (let i = 0; i < numCows; i++) {
        const x = startX + i * spacing
        for (let side = -1; side <= 1; side += 2) {
          const px = x + side * 0.8
          const post = new THREE.Mesh(postGeo, postMat)
          post.position.set(px, tableHeight + 0.45, 1.52)
          post.castShadow = true
          scene.add(post)
          const postTop = new THREE.Mesh(postTopGeo, postMat)
          postTop.position.set(px, tableHeight + 0.98, 1.52)
          scene.add(postTop)
        }
        const bar = new THREE.Mesh(barGeo, barMat)
        bar.position.set(x, tableHeight + 0.88, 1.52)
        scene.add(bar)
        const bar2 = new THREE.Mesh(barGeo, barMat)
        bar2.position.set(x, tableHeight + 0.52, 1.52)
        scene.add(bar2)
      }

      // --- Default-Textur als Fallback (per Canvas erzeugt) ---
      function buildDefaultTexture(nr: number, name: string): THREE.CanvasTexture {
        const W = 512
        const H = 640
        const canvas = document.createElement('canvas')
        canvas.width = W
        canvas.height = H
        const ctx = canvas.getContext('2d')!
        // sanfter Hintergrund
        ctx.fillStyle = 'rgba(0,0,0,0)'
        ctx.fillRect(0, 0, W, H)
        // Kopf-Oval
        ctx.fillStyle = '#f5f0e8'
        ctx.beginPath()
        ctx.ellipse(W / 2, H / 2 + 30, 170, 220, 0, 0, Math.PI * 2)
        ctx.fill()
        // Schnauze
        ctx.fillStyle = '#d8b4a0'
        ctx.beginPath()
        ctx.ellipse(W / 2, H / 2 + 200, 100, 70, 0, 0, Math.PI * 2)
        ctx.fill()
        // Nasenlöcher
        ctx.fillStyle = '#5a3a28'
        ctx.beginPath()
        ctx.ellipse(W / 2 - 35, H / 2 + 210, 12, 18, 0, 0, Math.PI * 2)
        ctx.ellipse(W / 2 + 35, H / 2 + 210, 12, 18, 0, 0, Math.PI * 2)
        ctx.fill()
        // Augen
        ctx.fillStyle = '#2a1f15'
        ctx.beginPath()
        ctx.ellipse(W / 2 - 60, H / 2 + 30, 14, 18, 0, 0, Math.PI * 2)
        ctx.ellipse(W / 2 + 60, H / 2 + 30, 14, 18, 0, 0, Math.PI * 2)
        ctx.fill()
        // Ohren
        ctx.fillStyle = '#e8e0d5'
        ctx.beginPath()
        ctx.ellipse(W / 2 - 165, H / 2 - 90, 55, 80, -0.5, 0, Math.PI * 2)
        ctx.ellipse(W / 2 + 165, H / 2 - 90, 55, 80, 0.5, 0, Math.PI * 2)
        ctx.fill()
        // Hörner
        ctx.strokeStyle = '#e8e0d0'
        ctx.lineWidth = 22
        ctx.lineCap = 'round'
        ctx.beginPath()
        ctx.moveTo(W / 2 - 110, H / 2 - 140)
        ctx.quadraticCurveTo(W / 2 - 200, H / 2 - 240, W / 2 - 230, H / 2 - 180)
        ctx.moveTo(W / 2 + 110, H / 2 - 140)
        ctx.quadraticCurveTo(W / 2 + 200, H / 2 - 240, W / 2 + 230, H / 2 - 180)
        ctx.stroke()
        // Platzschild
        ctx.fillStyle = '#e8c75e'
        ctx.fillRect(W / 2 + 90, H / 2 + 120, 80, 50)
        ctx.fillStyle = '#2a1f15'
        ctx.font = 'bold 28px sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText(String(nr), W / 2 + 130, H / 2 + 155)
        // Name unten
        ctx.font = 'bold 32px sans-serif'
        ctx.fillStyle = '#3a3025'
        ctx.fillText(name, W / 2, H - 24)
        const tex = new THREE.CanvasTexture(canvas)
        tex.colorSpace = THREE.SRGBColorSpace
        tex.anisotropy = 4
        textures.push(tex)
        return tex
      }

      // --- Bildtafel + Sockel + Marker pro Kuh ---
      type CowEntry = {
        group: THREE.Group
        plate: THREE.Mesh
        plateMat: THREE.MeshStandardMaterial
        marker: THREE.Mesh
        kuh: Kuh
      }
      const cows: CowEntry[] = []
      const missing: number[] = []

      const loader = new THREE.TextureLoader()
      function loadTexture(nr: number, fallback: THREE.Texture): Promise<THREE.Texture> {
        return new Promise((resolve) => {
          loader.load(
            `/assets/kuh_bilder/${nr}.png`,
            (tex) => {
              tex.colorSpace = THREE.SRGBColorSpace
              tex.anisotropy = 4
              textures.push(tex)
              resolve(tex)
            },
            undefined,
            () => {
              missing.push(nr)
              resolve(fallback)
            },
          )
        })
      }

      function buildCow(kuh: Kuh): CowEntry {
        const group = new THREE.Group()
        group.userData = { nr: kuh.nr }

        // Stilisierter Sockel/Körper, damit der Kopf nicht in der Luft schwebt
        const bodyMat = track(new THREE.MeshStandardMaterial({
          color: '#9c8a78',
          roughness: 0.65,
          metalness: 0.05,
          transparent: true,
          opacity: 0.55,
        }))
        const bodyGeo = track(new THREE.BoxGeometry(0.7, 0.85, 1.6))
        const body = new THREE.Mesh(bodyGeo, bodyMat)
        body.position.set(0, 0.55, -0.7)
        body.castShadow = true
        body.receiveShadow = true
        group.add(body)

        // Beine als angedeutete Stützen
        const legGeo = track(new THREE.CylinderGeometry(0.06, 0.07, 0.55, 8))
        const legMat = track(new THREE.MeshStandardMaterial({ color: '#6b5a48', roughness: 0.6 }))
        for (const pos of [
          { x: 0.22, z: -0.15 },
          { x: -0.22, z: -0.15 },
          { x: 0.22, z: -1.25 },
          { x: -0.22, z: -1.25 },
        ]) {
          const leg = new THREE.Mesh(legGeo, legMat)
          leg.position.set(pos.x, 0.28, pos.z)
          leg.castShadow = true
          group.add(leg)
        }

        // Bildfläche: vertikal, Normale +Z (= 90° zum waagerechten Futtertisch),
        // sitzt mittig zwischen den beiden Fressgitter-Pfosten.
        const PLATE_W = 1.4
        const PLATE_H = 1.9
        const plateGeo = track(new THREE.PlaneGeometry(PLATE_W, PLATE_H))
        const fallback = buildDefaultTexture(kuh.nr, kuh.name)
        const plateMat = track(new THREE.MeshStandardMaterial({
          map: fallback,
          transparent: true,
          alphaTest: 0.05,
          side: THREE.DoubleSide,
          roughness: 0.85,
          metalness: 0,
        }))
        const plate = new THREE.Mesh(plateGeo, plateMat)
        // Position: x=0 lokal (group sitzt schon am Platz), y so dass Bildmitte etwa Kopfhöhe,
        // z leicht vor dem Fressgitter (gate-z = 3.07 weltweit, lokal also 3.07 - (-1.55) = 4.62)
        // Wir setzen die Tafel direkt zwischen die beiden Bars im Fressgitter.
        plate.position.set(0, PLATE_H / 2 + 0.05, 3.07)
        plate.castShadow = true
        plate.receiveShadow = true
        group.add(plate)

        // Status-Marker schwebt über der Tafel
        const markerColor = STATUS_COLOR[kuh.status]
        const marker = new THREE.Mesh(
          track(new THREE.SphereGeometry(0.16, 16, 16)),
          track(new THREE.MeshStandardMaterial({
            color: markerColor,
            emissive: markerColor,
            emissiveIntensity: 0.6,
            roughness: 0.35,
          })),
        )
        marker.position.set(0, PLATE_H + 0.4, 3.07)
        group.add(marker)
        const stalk = new THREE.Mesh(
          track(new THREE.CylinderGeometry(0.015, 0.015, 0.3, 6)),
          track(new THREE.MeshStandardMaterial({ color: '#999', roughness: 0.6 })),
        )
        stalk.position.set(0, PLATE_H + 0.15, 3.07)
        group.add(stalk)

        // Echte Textur asynchron nachladen
        loadTexture(kuh.nr, fallback).then((tex) => {
          if (tex !== fallback) {
            plateMat.map = tex
            plateMat.needsUpdate = true
          }
        })

        return { group, plate, plateMat, marker, kuh }
      }

      herd.forEach((kuh, i) => {
        const entry = buildCow(kuh)
        entry.group.position.set(startX + i * spacing, 0, -1.55)
        scene.add(entry.group)
        cows.push(entry)
      })

      // Nach dem (a)synchronen Laden Liste der fehlenden Bilder an React weitergeben
      Promise.resolve().then(() => {
        setTimeout(() => {
          if (!disposed && missing.length > 0) setMissingImages([...new Set(missing)].sort((a, b) => a - b))
        }, 600)
      })

      // --- Controls ---
      const controls = new OrbitControls(camera, renderer.domElement)
      controls.target.copy(target)
      controls.enableDamping = true
      controls.dampingFactor = 0.12
      controls.minDistance = 4
      controls.maxDistance = 70
      controls.maxPolarAngle = Math.PI / 2.2
      controls.minPolarAngle = 0.15
      controls.update()

      resetViewRef.current = () => {
        camera.position.copy(defaultCamPos)
        controls.target.copy(target)
        controls.update()
      }

      // --- Auswahl-Highlight ---
      let selectedEntry: CowEntry | null = null
      function highlight(entry: CowEntry | null) {
        if (selectedEntry && selectedEntry !== entry) {
          selectedEntry.plateMat.emissive.setHex(0x000000)
          selectedEntry.plateMat.emissiveIntensity = 0
          selectedEntry.group.scale.setScalar(1)
        }
        if (entry) {
          entry.plateMat.emissive.set('#ffd24d')
          entry.plateMat.emissiveIntensity = 0.35
          entry.group.scale.setScalar(1.05)
        }
        selectedEntry = entry
      }

      // --- Raycast mit Drag-Guard ---
      const raycaster = new THREE.Raycaster()
      raycaster.far = 60
      const ndc = new THREE.Vector2()
      let down: { x: number; y: number } | null = null

      function onPointerDown(e: PointerEvent) {
        down = { x: e.clientX, y: e.clientY }
        renderer.domElement.style.cursor = 'grabbing'
      }
      function onPointerUp(e: PointerEvent) {
        renderer.domElement.style.cursor = 'grab'
        if (!down) return
        const dist = Math.hypot(e.clientX - down.x, e.clientY - down.y)
        down = null
        if (dist > 6) return
        const rect = renderer.domElement.getBoundingClientRect()
        ndc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
        ndc.y = -((e.clientY - rect.top) / rect.height) * 2 + 1
        raycaster.setFromCamera(ndc, camera)
        const hits = raycaster.intersectObjects(cows.map((c) => c.group), true)
        if (hits.length > 0) {
          let obj: THREE.Object3D | null = hits[0].object
          while (obj && !obj.userData?.nr) obj = obj.parent
          const entry = cows.find((c) => c.group === obj)
          if (entry) {
            highlight(entry)
            setSelected(entry.kuh)
            setHintVisible(false)
          }
        }
      }
      renderer.domElement.addEventListener('pointerdown', onPointerDown)
      renderer.domElement.addEventListener('pointerup', onPointerUp)

      // --- Resize ---
      const onResize = () => {
        if (!mount) return
        const w = mount.clientWidth
        const h = mount.clientHeight
        camera.aspect = w / h
        camera.updateProjectionMatrix()
        renderer.setSize(w, h)
      }
      const ro = new ResizeObserver(onResize)
      ro.observe(mount)

      // --- Loop ---
      let raf = 0
      const clock = new THREE.Clock()
      const animate = () => {
        raf = requestAnimationFrame(animate)
        const t = clock.getElapsedTime()
        for (const c of cows) {
          c.marker.position.y = 1.9 + 0.4 + Math.sin(t * 2 + c.kuh.nr) * 0.05
        }
        controls.update()
        renderer.render(scene, camera)
      }
      animate()

      cleanup = () => {
        cancelAnimationFrame(raf)
        ro.disconnect()
        renderer.domElement.removeEventListener('pointerdown', onPointerDown)
        renderer.domElement.removeEventListener('pointerup', onPointerUp)
        controls.dispose()
        geometries.forEach((g) => g.dispose())
        materials.forEach((m) => m.dispose())
        textures.forEach((t) => t.dispose())
        renderer.dispose()
        if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement)
        resetViewRef.current = null
      }
    })()

    return () => {
      disposed = true
      cleanup?.()
    }
    // Neu bauen, wenn sich die Herdengröße ändert
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kuehe.length])

  const counts = (['Gesund', 'Trächtig', 'In Behandlung', 'Trockengestellt'] as KuhStatus[]).map((s) => ({
    s,
    n: kuehe.filter((k) => k.status === s).length,
  }))

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 flex items-center gap-2">
            <Boxes className="w-6 h-6 text-green-700" />
            3D-Stall
          </h1>
          <p className="text-stone-500 mt-0.5 text-sm">
            Interaktive 3D-Vorschau · Maus zum Drehen &amp; Zoomen · Klick auf eine Kuh für Details
          </p>
        </div>
        <button
          onClick={() => resetViewRef.current?.()}
          className="flex items-center gap-2 bg-white border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-600 hover:bg-stone-50"
        >
          <RotateCcw className="w-4 h-4" /> Ansicht zurücksetzen
        </button>
      </div>

      {/* Legende */}
      <div className="flex items-center gap-4 text-xs flex-wrap">
        {counts.map(({ s, n }) => (
          <span key={s} className="inline-flex items-center gap-1.5 text-stone-600">
            <span className="w-3 h-3 rounded-full" style={{ background: STATUS_COLOR[s] }} />
            {s} ({n})
          </span>
        ))}
        <span className="text-stone-400 ml-auto">{kuehe.length} Kühe · Reihe A</span>
      </div>

      {/* 3D-Canvas */}
      <div className="relative rounded-2xl overflow-hidden border border-stone-300 bg-[#e8e4dc] shadow-inner">
        <div ref={mountRef} className="w-full h-[72vh] min-h-[460px]" />

        {hintVisible && (
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 bg-black/65 backdrop-blur text-white text-xs sm:text-sm px-5 py-2.5 rounded-full border border-white/15 pointer-events-none">
            🖱️ Drehen &amp; Zoomen &nbsp;|&nbsp; 👆 Klick auf eine Kuh für Infos
          </div>
        )}

        {selected && (
          <div className="absolute top-4 right-4 left-4 sm:left-auto sm:w-80 bg-white/92 backdrop-blur-md rounded-2xl shadow-2xl border border-white/60 p-5">
            <button
              onClick={() => setSelected(null)}
              aria-label="Schließen"
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/[0.06] hover:bg-black/[0.12] flex items-center justify-center text-stone-600"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="text-xl font-bold text-stone-800 pr-8 mb-2">{selected.name}</div>
            <InfoRow label="Ohrmarke" value={ohrmarkeFor(selected.nr)} />
            <InfoRow
              label="Status"
              value={
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: STATUS_COLOR[selected.status] }} />
                  {selected.status}
                </span>
              }
            />
            <InfoRow label="Stallplatz" value={`Reihe A, Platz ${selected.nr}`} />
            <InfoRow label="Rasse" value={`${selected.rasse} · ${selected.alter} J.`} />
            <InfoRow label="Laktation" value={`${selected.laktation}.`} />
            <InfoRow
              label="Milch/Tag"
              value={selected.milchTagesleistung > 0 ? `${selected.milchTagesleistung} l` : '–'}
            />
            {selected.kalbungVoraussichtlich && (
              <InfoRow
                label="Kalbung"
                value={`${formatDate(selected.kalbungVoraussichtlich)} (in ${daysUntil(selected.kalbungVoraussichtlich)} T.)`}
              />
            )}
            {selected.notiz && (
              <p className="mt-3 text-xs text-stone-500 italic border-t border-stone-200 pt-2">{selected.notiz}</p>
            )}
          </div>
        )}
      </div>

      {/* Hinweis zu fehlenden Bildern */}
      <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 text-xs text-stone-600 space-y-2">
        <p>
          <strong className="text-stone-800">Eigene Fotos hochladen:</strong> Lege die Porträtfotos
          der Kühe als <code className="font-mono bg-stone-200 px-1 rounded">1.png</code>,{' '}
          <code className="font-mono bg-stone-200 px-1 rounded">2.png</code> … in den Ordner{' '}
          <code className="font-mono bg-stone-200 px-1 rounded">public/assets/kuh_bilder/</code>{' '}
          (Dateiname = Stallplatz-Nummer). Fehlende Bilder werden automatisch durch einen
          Platzhalter ersetzt.
        </p>
        {missingImages.length > 0 && (
          <p className="text-stone-500">
            <strong>Aktuell ohne Foto:</strong>{' '}
            {missingImages.slice(0, 25).join(', ')}
            {missingImages.length > 25 && ` … (+${missingImages.length - 25})`}
          </p>
        )}
      </div>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 my-1.5 text-sm">
      <span className="font-semibold text-stone-500 text-[11px] uppercase tracking-wide min-w-[80px]">
        {label}
      </span>
      <span className="font-medium text-stone-900">{value}</span>
    </div>
  )
}
