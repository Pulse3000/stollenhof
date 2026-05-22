'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { Box, X, RotateCcw, Maximize2, Camera as CameraIcon } from 'lucide-react'
import { usePersistedState } from '@/lib/use-persisted-state'
import {
  STORAGE_KEYS,
  initialKuehe,
  type Kuh,
  type KuhStatus,
  formatDate,
} from '@/lib/data'

const statusColorHex: Record<KuhStatus, number> = {
  Gesund: 0x6f4e37,        // farm brown
  'In Behandlung': 0xdc2626, // red-600
  Trächtig: 0xdb2777,       // pink-600
  Trockengestellt: 0xa8a29e, // stone-400
}

const statusBadge: Record<KuhStatus, string> = {
  Gesund: 'bg-green-100 text-green-800 border-green-200',
  'In Behandlung': 'bg-red-100 text-red-800 border-red-200',
  Trächtig: 'bg-pink-100 text-pink-800 border-pink-200',
  Trockengestellt: 'bg-stone-100 text-stone-700 border-stone-200',
}

export default function Stall3DPage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const cameraResetRef = useRef<(() => void) | null>(null)
  const [kuehe] = usePersistedState<Kuh[]>(STORAGE_KEYS.tiere, initialKuehe)
  const [selectedKuh, setSelectedKuh] = useState<Kuh | null>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const { width, height } = container.getBoundingClientRect()

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x0c0a09) // stone-950

    const camera = new THREE.PerspectiveCamera(55, width / height || 16 / 9, 0.1, 1000)
    const initialCamPos = new THREE.Vector3(0, 9, 22)
    camera.position.copy(initialCamPos)

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    container.appendChild(renderer.domElement)

    // Lighting
    scene.add(new THREE.AmbientLight(0xffffff, 0.75))
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.95)
    dirLight.position.set(15, 25, 10)
    scene.add(dirLight)
    const backLight = new THREE.DirectionalLight(0xa3e635, 0.15) // soft green back
    backLight.position.set(-10, 5, -15)
    scene.add(backLight)

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.08
    controls.maxPolarAngle = Math.PI / 2 - 0.05
    controls.minDistance = 4
    controls.maxDistance = 80
    controls.target.set(0, 1, 0)

    cameraResetRef.current = () => {
      camera.position.copy(initialCamPos)
      controls.target.set(0, 1, 0)
      controls.update()
    }

    // Environment
    const NUM = Math.min(kuehe.length, 30)
    const SPACING = 2.2
    const tableLen = NUM * SPACING + 8

    // Futtertisch
    const tableGeo = new THREE.BoxGeometry(tableLen, 0.18, 3.6)
    const tableMat = new THREE.MeshStandardMaterial({ color: 0xb8b3ac, roughness: 0.9 })
    const table = new THREE.Mesh(tableGeo, tableMat)
    table.position.set(0, -0.09, 1.5)
    scene.add(table)

    // Stallboden (Lauffläche hinter den Kühen)
    const floorGeo = new THREE.PlaneGeometry(tableLen, 8)
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x44403c, roughness: 1 })
    const floor = new THREE.Mesh(floorGeo, floorMat)
    floor.rotation.x = -Math.PI / 2
    floor.position.set(0, -0.1, -3.5)
    scene.add(floor)

    // Fressgitter-Balken (oben + unten)
    const barMat = new THREE.MeshStandardMaterial({ color: 0x57534e, metalness: 0.6, roughness: 0.4 })
    const barTop = new THREE.Mesh(new THREE.BoxGeometry(tableLen, 0.08, 0.08), barMat)
    barTop.position.set(0, 2.2, -0.2)
    scene.add(barTop)
    const barBot = new THREE.Mesh(new THREE.BoxGeometry(tableLen, 0.08, 0.08), barMat)
    barBot.position.set(0, 0.6, -0.2)
    scene.add(barBot)

    // Vertikale Streben alle 1.1 m
    const strutGeo = new THREE.BoxGeometry(0.06, 1.6, 0.06)
    for (let x = -tableLen / 2; x <= tableLen / 2; x += 1.1) {
      const strut = new THREE.Mesh(strutGeo, barMat)
      strut.position.set(x, 1.4, -0.2)
      scene.add(strut)
    }

    // Cow planes
    const startX = -((NUM - 1) * SPACING) / 2
    const texLoader = new THREE.TextureLoader()
    const cowGroup = new THREE.Group()

    for (let i = 0; i < NUM; i++) {
      const kuh = kuehe[i]
      const fallbackHex = statusColorHex[kuh.status] ?? 0x6f4e37

      const geometry = new THREE.PlaneGeometry(1.7, 2)
      const material = new THREE.MeshStandardMaterial({
        color: fallbackHex,
        transparent: true,
        side: THREE.DoubleSide,
        alphaTest: 0.05,
        roughness: 0.95,
      })

      texLoader.load(
        `/assets/kuh_bilder/${kuh.nr}.png`,
        (texture) => {
          texture.colorSpace = THREE.SRGBColorSpace
          material.map = texture
          material.color.set(0xffffff)
          material.needsUpdate = true
        },
        undefined,
        () => {
          // image missing -> keep fallback color
        },
      )

      const plane = new THREE.Mesh(geometry, material)
      plane.position.set(startX + i * SPACING, 1.2, -0.4)
      plane.userData = { kuh }
      cowGroup.add(plane)

      // Stallplatznummer als kleiner Boden-Marker
      const markerGeo = new THREE.PlaneGeometry(0.6, 0.6)
      const markerCanvas = document.createElement('canvas')
      markerCanvas.width = 128
      markerCanvas.height = 128
      const ctx = markerCanvas.getContext('2d')!
      ctx.fillStyle = 'rgba(255,255,255,0.85)'
      ctx.fillRect(0, 0, 128, 128)
      ctx.fillStyle = '#1c1917'
      ctx.font = 'bold 64px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(String(kuh.nr).padStart(2, '0'), 64, 70)
      const markerTex = new THREE.CanvasTexture(markerCanvas)
      const markerMat = new THREE.MeshBasicMaterial({ map: markerTex, transparent: true })
      const marker = new THREE.Mesh(markerGeo, markerMat)
      marker.rotation.x = -Math.PI / 2
      marker.position.set(startX + i * SPACING, 0.011, 1.6)
      scene.add(marker)
    }
    scene.add(cowGroup)

    // Raycasting
    const raycaster = new THREE.Raycaster()
    const pointer = new THREE.Vector2()

    function handlePick(clientX: number, clientY: number) {
      const rect = renderer.domElement.getBoundingClientRect()
      pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1
      pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1
      raycaster.setFromCamera(pointer, camera)
      const hits = raycaster.intersectObjects(cowGroup.children)
      if (hits.length > 0) {
        const kuh = (hits[0].object.userData as { kuh: Kuh }).kuh
        setSelectedKuh(kuh)
      }
    }

    let dragMoved = false
    let dragStart = { x: 0, y: 0 }

    function onPointerDown(e: PointerEvent) {
      dragMoved = false
      dragStart = { x: e.clientX, y: e.clientY }
    }
    function onPointerMove(e: PointerEvent) {
      const dx = Math.abs(e.clientX - dragStart.x)
      const dy = Math.abs(e.clientY - dragStart.y)
      if (dx > 5 || dy > 5) dragMoved = true
    }
    function onPointerUp(e: PointerEvent) {
      if (!dragMoved) handlePick(e.clientX, e.clientY)
    }

    renderer.domElement.addEventListener('pointerdown', onPointerDown)
    renderer.domElement.addEventListener('pointermove', onPointerMove)
    renderer.domElement.addEventListener('pointerup', onPointerUp)

    // Resize observer
    const ro = new ResizeObserver(() => {
      const { width: w, height: h } = container.getBoundingClientRect()
      if (w === 0 || h === 0) return
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    })
    ro.observe(container)

    // Animation
    let frameId = 0
    function animate() {
      frameId = requestAnimationFrame(animate)
      controls.update()
      renderer.render(scene, camera)
    }
    animate()

    return () => {
      cancelAnimationFrame(frameId)
      ro.disconnect()
      renderer.domElement.removeEventListener('pointerdown', onPointerDown)
      renderer.domElement.removeEventListener('pointermove', onPointerMove)
      renderer.domElement.removeEventListener('pointerup', onPointerUp)
      controls.dispose()
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose()
          const mat = obj.material as THREE.Material | THREE.Material[]
          if (Array.isArray(mat)) mat.forEach((m) => m.dispose())
          else mat.dispose()
        }
      })
      renderer.dispose()
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement)
      }
    }
  }, [kuehe])

  function toggleFullscreen() {
    const el = wrapperRef.current
    if (!el) return
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {})
    else el.requestFullscreen().catch(() => {})
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 md:px-8 py-4 border-b border-stone-200 bg-white flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-stone-900 flex items-center gap-2">
            <Box className="w-5 h-5 text-green-700" />
            3D-Stallvorschau
          </h1>
          <p className="text-stone-500 text-sm mt-0.5">
            Interaktive Übersicht der Herde am Fressgitter · Tier anklicken für Details
          </p>
        </div>
        <div className="flex items-center gap-2">
          {(['Gesund', 'In Behandlung', 'Trächtig', 'Trockengestellt'] as KuhStatus[]).map((s) => (
            <span
              key={s}
              className={`text-[11px] px-2 py-1 rounded-full border font-medium ${statusBadge[s]}`}
            >
              {s}
            </span>
          ))}
        </div>
      </div>

      <div ref={wrapperRef} className="flex-1 relative bg-stone-950 overflow-hidden">
        <div ref={containerRef} className="absolute inset-0" />

        <div className="absolute top-3 right-3 flex flex-col gap-1.5">
          <button
            onClick={() => cameraResetRef.current?.()}
            className="p-2 rounded-lg bg-black/60 hover:bg-black/80 text-white backdrop-blur transition-colors"
            title="Ansicht zurücksetzen"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-lg bg-black/60 hover:bg-black/80 text-white backdrop-blur transition-colors"
            title="Vollbild"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
          <Link
            href="/stallwache"
            className="p-2 rounded-lg bg-black/60 hover:bg-black/80 text-white backdrop-blur transition-colors"
            title="Stallwache-Kamera öffnen"
          >
            <CameraIcon className="w-4 h-4" />
          </Link>
        </div>

        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs px-4 py-2 rounded-full backdrop-blur pointer-events-none">
          <strong>Steuerung:</strong> Drehen mit Maus/Touch · Scrollen/Pinch zum Zoomen · Kuh tippen für Details
        </div>

        {selectedKuh && (
          <div className="absolute top-3 left-3 w-[300px] max-w-[calc(100vw-1.5rem)] bg-white/98 backdrop-blur border-l-4 border-green-600 rounded-lg shadow-2xl p-5">
            <button
              onClick={() => setSelectedKuh(null)}
              className="absolute top-2.5 right-3 text-stone-400 hover:text-red-600 transition-colors"
              aria-label="Schließen"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-mono bg-stone-100 text-stone-600 px-2 py-0.5 rounded">
                Nr. {String(selectedKuh.nr).padStart(2, '0')}
              </span>
              <h2 className="text-lg font-bold text-stone-900">{selectedKuh.name}</h2>
            </div>
            <div className="space-y-2 text-sm">
              <div>
                <p className="text-[10px] uppercase font-semibold text-stone-400 tracking-wider">Status</p>
                <span className={`inline-block text-xs px-2 py-0.5 rounded-full border font-medium mt-0.5 ${statusBadge[selectedKuh.status]}`}>
                  {selectedKuh.status}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <p className="text-[10px] uppercase font-semibold text-stone-400 tracking-wider">Rasse</p>
                  <p className="text-stone-800">{selectedKuh.rasse}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-semibold text-stone-400 tracking-wider">Alter</p>
                  <p className="text-stone-800">{selectedKuh.alter} J · {selectedKuh.laktation}. Lakt.</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-semibold text-stone-400 tracking-wider">Milch heute</p>
                  <p className="text-stone-800">{selectedKuh.milchTagesleistung} l</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-semibold text-stone-400 tracking-wider">Stallplatz</p>
                  <p className="text-stone-800">Platz {selectedKuh.nr}</p>
                </div>
              </div>
              <div className="pt-1">
                <p className="text-[10px] uppercase font-semibold text-stone-400 tracking-wider">Letzte Untersuchung</p>
                <p className="text-stone-800">{formatDate(selectedKuh.letzteUntersuchung)}</p>
              </div>
              {selectedKuh.kalbungVoraussichtlich && (
                <div>
                  <p className="text-[10px] uppercase font-semibold text-stone-400 tracking-wider">Kalbung erwartet</p>
                  <p className="text-stone-800">{formatDate(selectedKuh.kalbungVoraussichtlich)}</p>
                </div>
              )}
              {selectedKuh.notiz && (
                <div className="pt-1 border-t border-stone-100">
                  <p className="text-[10px] uppercase font-semibold text-stone-400 tracking-wider">Notiz</p>
                  <p className="text-stone-700 text-xs italic">{selectedKuh.notiz}</p>
                </div>
              )}
            </div>
            <Link
              href="/tiere"
              className="mt-4 inline-block w-full text-center text-sm bg-green-700 hover:bg-green-800 text-white py-2 rounded-lg transition-colors"
            >
              In Tierakte öffnen →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
