'use client'

import { useState, useEffect, type MouseEvent } from 'react'
import {
  Camera,
  Cpu,
  Activity,
  GitBranch,
  DollarSign,
  Database,
  Play,
  RefreshCw,
  Bell,
  Send,
  Sliders,
  Info,
  Layers,
} from 'lucide-react'

type SimulationState = 'normal' | 'calving' | 'estrus' | 'lame'
type Tab = 'dashboard' | 'hardware' | 'models' | 'usecases' | 'orchestration' | 'economics' | 'data'

type HardwareConfig = {
  unit: 'orin-nano' | 'orin-nx' | 'xavier'
  camerasCount: number
  housing: 'ip67-passive' | 'standard'
  storage: 'nvme-1tb' | 'sd-256'
  isCustomBuild: boolean
}

type RoiInputs = {
  herdSize: number
  customHardwareCost: number
  commercialSystemCost: number
  gainPerCowYear: number
}

type LabeledPoint = { label: string; x: number; y: number }

type TelegramAlert = {
  id: number
  time: string
  text: string
  read: boolean
}

export default function StallsimulatorPage() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard')

  const [simulationState, setSimulationState] = useState<SimulationState>('normal')
  const [cobbAngle, setCobbAngle] = useState(176)
  const [tailRaisingTime, setTailRaisingTime] = useState(0)
  const [isFilterRunning, setIsFilterRunning] = useState(false)
  const [filterLog, setFilterLog] = useState<string[]>([])
  const [telegramAlerts, setTelegramAlerts] = useState<TelegramAlert[]>([])
  const [showTelegramModal, setShowTelegramModal] = useState(false)

  const [hardwareConfig, setHardwareConfig] = useState<HardwareConfig>({
    unit: 'orin-nano',
    camerasCount: 4,
    housing: 'ip67-passive',
    storage: 'nvme-1tb',
    isCustomBuild: true,
  })

  const [roiInputs, setRoiInputs] = useState<RoiInputs>({
    herdSize: 85,
    customHardwareCost: 1500,
    commercialSystemCost: 55000,
    gainPerCowYear: 385,
  })

  const labelTypes = ['Nacken', 'Rückenlinie', 'Schwanzansatz', 'Hinterhuf', 'Vorderhuf']
  const [labeledPoints, setLabeledPoints] = useState<LabeledPoint[]>([])
  const [currentLabelType, setCurrentLabelType] = useState<string>('Nacken')

  const triggerTelegramAlert = (message: string) => {
    const newAlert: TelegramAlert = {
      id: Date.now(),
      time: new Date().toLocaleTimeString('de-DE', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
      text: message,
      read: false,
    }
    setTelegramAlerts((prev) => [newAlert, ...prev])
    setShowTelegramModal(true)
  }

  useEffect(() => {
    if (!isFilterRunning) return
    const interval = setInterval(() => {
      setTailRaisingTime((prev) => {
        const nextVal = prev + 1
        let eventMsg = ''
        if (simulationState === 'calving') {
          eventMsg = `Minute ${nextVal}: Konstantes Schwanzheben detektiert (Wehen-Aktivität).`
          if (nextVal >= 30) {
            triggerTelegramAlert(
              '🚨 Partus-Alarm: Kuh #104 (Emma) zeigt seit 30 Minuten kontinuierliches Schwanzheben! Fruchtblase/Hufe bald sichtbar.',
            )
            setIsFilterRunning(false)
            return 30
          }
        } else if (simulationState === 'normal') {
          if (nextVal % 4 === 0) {
            eventMsg = `Minute ${nextVal}: Kurzzeitiges Heben ignoriert (Fliegenabwehr / Koten). Filter aktiv.`
          } else {
            eventMsg = `Minute ${nextVal}: Zustand unauffällig.`
          }
          if (nextVal >= 15) {
            eventMsg = `Minute ${nextVal}: Filter-Runde beendet. Kein kontinuierliches Heben festgestellt.`
            setIsFilterRunning(false)
            setFilterLog((prevLog) => [eventMsg, ...prevLog.slice(0, 8)])
            return 0
          }
        } else {
          eventMsg = `Minute ${nextVal}: Überwachung läuft. Keine Wehen-Muster erkannt.`
        }

        setFilterLog((prevLog) => [eventMsg, ...prevLog.slice(0, 8)])
        return nextVal
      })
    }, 800)
    return () => clearInterval(interval)
  }, [isFilterRunning, simulationState])

  const getHardwarePrice = () => {
    const basePrices: Record<HardwareConfig['unit'], number> = {
      'orin-nano': 550,
      'orin-nx': 950,
      xavier: 350,
    }
    const cameraPrice = 120 * hardwareConfig.camerasCount
    const housingPrice = hardwareConfig.housing === 'ip67-passive' ? 150 : 45
    const storagePrice = hardwareConfig.storage === 'nvme-1tb' ? 95 : 35
    return basePrices[hardwareConfig.unit] + cameraPrice + housingPrice + storagePrice
  }

  const calculateROI = () => {
    const annualBenefit = roiInputs.herdSize * roiInputs.gainPerCowYear
    const customAmortizationMonths = ((roiInputs.customHardwareCost / annualBenefit) * 12).toFixed(1)
    const commercialAmortizationMonths = (
      (roiInputs.commercialSystemCost / annualBenefit) *
      12
    ).toFixed(1)
    return {
      annualBenefit,
      customAmortizationMonths,
      commercialAmortizationMonths,
      customTotalGain5Y: annualBenefit * 5 - roiInputs.customHardwareCost,
      commercialTotalGain5Y: annualBenefit * 5 - roiInputs.commercialSystemCost,
    }
  }

  const roiData = calculateROI()

  const startFilterSimulation = () => {
    setTailRaisingTime(0)
    setFilterLog([
      `Start des 30-Minuten-Filters für ausgewählten Zustand: [${simulationState.toUpperCase()}]`,
    ])
    setIsFilterRunning(true)
  }

  const handleCVATClick = (e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setLabeledPoints((prev) => [
      ...prev.filter((p) => p.label !== currentLabelType),
      { label: currentLabelType, x, y },
    ])
    const currentIndex = labelTypes.indexOf(currentLabelType)
    setCurrentLabelType(
      currentIndex < labelTypes.length - 1 ? labelTypes[currentIndex + 1] : labelTypes[0],
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-40 px-6 py-4 flex flex-wrap items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-tr from-emerald-500 to-teal-400 p-2 rounded-xl text-slate-950 shadow-lg shadow-emerald-500/10">
            <Activity className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-emerald-400 to-teal-200 bg-clip-text text-transparent">
              CattleVision AI
            </h1>
            <p className="text-xs text-slate-400">KI-basierte Stallüberwachung & Agenten-Plattform</p>
          </div>
        </div>

        <div className="flex items-center space-x-4 mt-2 sm:mt-0">
          <button
            onClick={() => setShowTelegramModal(true)}
            className="relative p-2 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-lg transition"
          >
            <Bell className="h-5 w-5" />
            {telegramAlerts.length > 0 && (
              <span className="absolute top-1 right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
              </span>
            )}
          </button>

          <div className="bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700 flex items-center space-x-2 text-xs">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-slate-300 font-mono">Edge Node: Active (Jetson Orin)</span>
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row">
        <aside className="lg:w-72 bg-slate-900/40 border-r border-slate-800/80 p-4 space-y-2 flex flex-col justify-between">
          <div className="space-y-1">
            <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Kernpfeiler der Architektur
            </div>

            {(
              [
                { id: 'dashboard', label: 'Live-Überwachung & Sim', icon: Activity },
                { id: 'hardware', label: '1. Tech-Architektur (Edge)', icon: Cpu },
                { id: 'models', label: '2. KI-Modelle & Pose', icon: Layers },
                { id: 'usecases', label: '3. Use Cases & Filter', icon: Sliders },
                { id: 'orchestration', label: '4. Agenten & n8n Flow', icon: GitBranch },
                { id: 'economics', label: '5. ROI & Wirtschaftlichkeit', icon: DollarSign },
                { id: 'data', label: '6. Datenstrategie & CVAT', icon: Database },
              ] as { id: Tab; label: string; icon: typeof Activity }[]
            ).map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                  activeTab === id
                    ? 'bg-emerald-500/10 text-emerald-400 border-l-2 border-emerald-500'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </button>
            ))}
          </div>

          <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-800">
            <div className="flex items-center space-x-2 text-xs text-slate-400 mb-1">
              <Info className="h-3 w-3 text-emerald-400" />
              <span className="font-semibold text-slate-300">Projektkontext</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Basierend auf wissenschaftlichen Erkenntnissen zur Resilienz im Agri-Food Sektor und
              Digitalisierungs-Ansätzen der GIL-Jahrestagungen.
            </p>
          </div>
        </aside>

        <main className="flex-1 p-6 overflow-y-auto space-y-6">
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-emerald-900/40 to-teal-900/20 border border-emerald-800/40 p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-emerald-300">
                    Echtzeit-Stall-Inferenz Simulator
                  </h2>
                  <p className="text-sm text-slate-300 mt-1 max-w-2xl">
                    Wechseln Sie die biologischen Zustände der Kuh, um live zu sehen, wie die
                    YOLO-Pose-Estimation-Algorithmen Skelett-Keypoints analysieren und biologische
                    Marker quantifizieren.
                  </p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => {
                      setSimulationState('normal')
                      setCobbAngle(176)
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      simulationState === 'normal'
                        ? 'bg-emerald-500 text-slate-950 font-bold'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                    }`}
                  >
                    Normalzustand
                  </button>
                  <button
                    onClick={() => {
                      setSimulationState('calving')
                      setCobbAngle(174)
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      simulationState === 'calving'
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                    }`}
                  >
                    Abkalbung (Wehen)
                  </button>
                  <button
                    onClick={() => {
                      setSimulationState('estrus')
                      setCobbAngle(175)
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      simulationState === 'estrus'
                        ? 'bg-sky-500 text-slate-950 font-bold'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                    }`}
                  >
                    Östrus (Brunst)
                  </button>
                  <button
                    onClick={() => {
                      setSimulationState('lame')
                      setCobbAngle(155)
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      simulationState === 'lame'
                        ? 'bg-rose-500 text-slate-950 font-bold'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                    }`}
                  >
                    Lahmheits-Check
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl relative">
                  <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
                    <div className="flex items-center space-x-2">
                      <Camera className="h-4 w-4 text-emerald-400" />
                      <span className="text-xs font-mono font-bold text-slate-200">
                        RTSP_CAM_01 // Stall_Sektor_B
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      LIVE INFERENCE (YOLOv11-Pose)
                    </span>
                  </div>

                  <div className="h-80 w-full bg-slate-950 flex items-center justify-center relative p-4 select-none">
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20"></div>

                    <div
                      className="absolute border border-dashed rounded-lg p-3 transition-all duration-500"
                      style={{
                        width: '85%',
                        height: '75%',
                        borderColor:
                          simulationState === 'calving'
                            ? '#f59e0b'
                            : simulationState === 'lame'
                              ? '#f43f5e'
                              : '#10b981',
                      }}
                    >
                      <span
                        className="absolute top-1 left-2 text-[10px] font-mono text-slate-950 font-bold px-1 rounded"
                        style={{
                          backgroundColor:
                            simulationState === 'calving'
                              ? '#f59e0b'
                              : simulationState === 'lame'
                                ? '#f43f5e'
                                : '#10b981',
                        }}
                      >
                        {simulationState === 'normal' && 'Kuh: 98.7%'}
                        {simulationState === 'calving' && 'Kuh (Wehen): 94.2%'}
                        {simulationState === 'estrus' && 'Kuh (Brunst): 89.1%'}
                        {simulationState === 'lame' && 'Kuh (Lahm): 91.5%'}
                      </span>
                    </div>

                    <svg viewBox="0 0 400 200" className="w-full h-full max-w-lg z-10">
                      <line
                        x1="20"
                        y1="170"
                        x2="380"
                        y2="170"
                        stroke="#334155"
                        strokeWidth="2"
                        strokeDasharray="4 4"
                      />

                      {simulationState === 'estrus' && (
                        <g opacity="0.4" transform="translate(45, -20)">
                          <path
                            d="M 60 170 L 60 110 L 100 110 L 100 65 L 150 65 L 220 75 L 230 110 L 230 170"
                            fill="none"
                            stroke="#0ea5e9"
                            strokeWidth="3"
                          />
                          <text x="130" y="50" fill="#0ea5e9" className="text-[10px] font-mono">
                            Duldungspartner
                          </text>
                        </g>
                      )}

                      <line
                        x1="100"
                        y1="110"
                        x2={simulationState === 'lame' ? '110' : '100'}
                        y2="170"
                        stroke={simulationState === 'lame' ? '#f43f5e' : '#10b981'}
                        strokeWidth="4"
                        strokeLinecap="round"
                      />

                      <line
                        x1="260"
                        y1="110"
                        x2="260"
                        y2="170"
                        stroke="#10b981"
                        strokeWidth="4"
                        strokeLinecap="round"
                      />

                      <path
                        d={
                          simulationState === 'lame'
                            ? 'M 100 110 Q 180 75 260 110'
                            : 'M 100 110 Q 180 100 260 110'
                        }
                        fill="none"
                        stroke={simulationState === 'lame' ? '#f43f5e' : '#10b981'}
                        strokeWidth="6"
                        strokeLinecap="round"
                      />

                      <line
                        x1="260"
                        y1="110"
                        x2="295"
                        y2="80"
                        stroke="#10b981"
                        strokeWidth="5"
                        strokeLinecap="round"
                      />
                      <line
                        x1="295"
                        y1="80"
                        x2="330"
                        y2="95"
                        stroke="#10b981"
                        strokeWidth="5"
                        strokeLinecap="round"
                      />

                      <path
                        d={
                          simulationState === 'calving'
                            ? 'M 100 110 Q 80 85 70 70'
                            : 'M 100 110 Q 90 120 85 145'
                        }
                        fill="none"
                        stroke={simulationState === 'calving' ? '#f59e0b' : '#10b981'}
                        strokeWidth="4"
                        strokeLinecap="round"
                      />

                      <circle cx="330" cy="95" r="5" fill="#22c55e" />
                      <circle cx="295" cy="80" r="6" fill="#22c55e" className="animate-pulse" />
                      <text x="305" y="75" fill="#a7f3d0" className="text-[9px] font-mono">
                        KP_Nacken
                      </text>

                      <circle
                        cx="180"
                        cy={simulationState === 'lame' ? 90 : 105}
                        r="6"
                        fill={simulationState === 'lame' ? '#ef4444' : '#22c55e'}
                      />
                      <text
                        x="188"
                        y={simulationState === 'lame' ? 85 : 100}
                        fill="#a7f3d0"
                        className="text-[9px] font-mono"
                      >
                        KP_Rücken (Angle: {cobbAngle}°)
                      </text>

                      <circle
                        cx="100"
                        cy="110"
                        r="6"
                        fill={simulationState === 'calving' ? '#f59e0b' : '#22c55e'}
                      />
                      <text x="50" y="125" fill="#fde68a" className="text-[9px] font-mono">
                        KP_Schwanzansatz
                      </text>

                      <circle
                        cx={simulationState === 'lame' ? '110' : '100'}
                        cy="170"
                        r="5"
                        fill="#22c55e"
                      />
                      <circle cx="260" cy="170" r="5" fill="#22c55e" />

                      {simulationState === 'lame' && (
                        <g>
                          <path
                            d="M 140 100 L 180 90 L 220 100"
                            fill="none"
                            stroke="#f43f5e"
                            strokeWidth="2"
                          />
                          <circle
                            cx="180"
                            cy="90"
                            r="8"
                            fill="none"
                            stroke="#f43f5e"
                            strokeWidth="2"
                            className="animate-ping"
                          />
                        </g>
                      )}
                    </svg>

                    <div className="absolute bottom-4 left-4 right-4 bg-slate-900/90 border border-slate-800 p-3 rounded-xl flex items-center justify-between">
                      <div className="text-xs">
                        <span className="text-slate-400">Detektierte Klasse: </span>
                        <span className="font-bold text-emerald-400 capitalize">
                          {simulationState}
                        </span>
                      </div>
                      <div className="text-xs font-mono text-slate-400">
                        FPS: <span className="text-emerald-400">28.4</span> | Latenz:{' '}
                        <span className="text-emerald-400">12ms</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-4 space-y-6">
                  <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                      Analyse-Metriken
                    </h3>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Rückenkrümmung (Cobb-Winkel)</span>
                        <span
                          className={`font-mono font-bold ${
                            cobbAngle < 170 ? 'text-rose-400' : 'text-emerald-400'
                          }`}
                        >
                          {cobbAngle}°
                        </span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-500 ${
                            cobbAngle < 170 ? 'bg-rose-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${(cobbAngle / 180) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-[10px] text-slate-500 block">
                        Grenzwert Lahmheit: &lt; 170° Rückenwölbung
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Schwanzhebungs-Dauer</span>
                        <span
                          className={`font-mono font-bold ${
                            simulationState === 'calving' ? 'text-amber-400' : 'text-slate-400'
                          }`}
                        >
                          {tailRaisingTime} min / 30 min
                        </span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-500 ${
                            simulationState === 'calving' ? 'bg-amber-500' : 'bg-slate-600'
                          }`}
                          style={{ width: `${(tailRaisingTime / 30) * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    <hr className="border-slate-800" />

                    <div>
                      <h4 className="text-xs font-semibold text-slate-300">Biologisches Fazit:</h4>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        {simulationState === 'normal' &&
                          'Tier verhält sich unauffällig. Keine Anzeichen von Unwohlsein, Brunst oder unmittelbar bevorstehender Geburt.'}
                        {simulationState === 'calving' &&
                          'Sustained Tail Raising detektiert. Der biologische Filter prüft, ob dieses Verhalten länger als 30 Minuten anhält (Wehenausschluss).'}
                        {simulationState === 'estrus' &&
                          'Duldungsverhalten erkannt. Die zeitgleiche Parallelstellung zweier Bounding Boxes über 5+ Sek. indiziert Brunst.'}
                        {simulationState === 'lame' &&
                          'Achtung: Der Cobb-Winkel liegt unter 170° (Arched Back). Frühzeitiges Indiz für Klauenerkrankung (Lahmheits-Grad 3).'}
                      </p>
                    </div>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                        30-Min-Filter (Abkalbung)
                      </h3>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                        Deterministisch
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 leading-relaxed">
                      Dieser Filter unterscheidet echtes geburtsbezogenes Schwanzheben von
                      sporadischer Aktivität (z. B. Fliegen oder Kotabsatz).
                    </p>

                    <div className="flex gap-2">
                      <button
                        onClick={startFilterSimulation}
                        disabled={isFilterRunning}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-slate-950 font-bold py-2 rounded-lg text-xs flex items-center justify-center space-x-2 transition"
                      >
                        <Play className="h-3.5 w-3.5 fill-current" />
                        <span>Filter starten</span>
                      </button>
                      <button
                        onClick={() => {
                          setIsFilterRunning(false)
                          setTailRaisingTime(0)
                          setFilterLog([])
                        }}
                        className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 transition"
                        title="Reset"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="bg-slate-950 rounded-lg p-3 border border-slate-800 h-28 overflow-y-auto font-mono text-[10px] space-y-1 text-slate-300">
                      {filterLog.length === 0 ? (
                        <span className="text-slate-600 italic">
                          // Keine Logdaten vorhanden. Filter starten...
                        </span>
                      ) : (
                        filterLog.map((log, index) => (
                          <div
                            key={index}
                            className={
                              log.includes('Alarm')
                                ? 'text-rose-400 font-bold'
                                : log.includes('Wehen')
                                  ? 'text-amber-300'
                                  : 'text-slate-400'
                            }
                          >
                            {log}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'hardware' && (
            <div className="space-y-6">
              <div className="max-w-4xl">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-200 bg-clip-text text-transparent">
                  1. Technologische Architektur & Edge-Computing
                </h2>
                <p className="text-slate-300 text-sm mt-1 leading-relaxed">
                  Die Stallüberwachung setzt konsequent auf eine{' '}
                  <strong className="text-emerald-400">Edge-First-Architektur</strong>. Videodaten
                  werden direkt vor Ort analysiert. Das spart Bandbreite (häufiges Nadelöhr im
                  ländlichen Raum) und wahrt die informationelle Selbstbestimmung des Betriebes.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
                  <div className="flex items-center space-x-2 text-emerald-400">
                    <Cpu className="h-5 w-5" />
                    <h3 className="font-bold">Edge-Recheneinheit</h3>
                  </div>
                  <div className="space-y-2 text-xs">
                    <label className="block text-slate-400">Wähle Inferenz-Modul:</label>
                    <select
                      value={hardwareConfig.unit}
                      onChange={(e) =>
                        setHardwareConfig((prev) => ({
                          ...prev,
                          unit: e.target.value as HardwareConfig['unit'],
                        }))
                      }
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                    >
                      <option value="orin-nano">NVIDIA Jetson Orin Nano (8GB) - Goldstandard</option>
                      <option value="orin-nx">
                        NVIDIA Jetson Orin NX (16GB) - High Performance
                      </option>
                      <option value="xavier">NVIDIA Jetson Xavier NX (Legacy/Gebraucht)</option>
                    </select>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Die Jetson-Serie liefert hardwarebeschleunigte TensorRT-Inferenz bei minimaler
                    Leistungsaufnahme (7W - 25W), ideal für den 24/7-Dauerbetrieb im Stall.
                  </p>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
                  <div className="flex items-center space-x-2 text-emerald-400">
                    <Camera className="h-5 w-5" />
                    <h3 className="font-bold">Kameras & Schutz</h3>
                  </div>
                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block text-slate-400">
                        Anzahl IP-Kameras (RTSP): {hardwareConfig.camerasCount}
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="8"
                        value={hardwareConfig.camerasCount}
                        onChange={(e) =>
                          setHardwareConfig((prev) => ({
                            ...prev,
                            camerasCount: parseInt(e.target.value),
                          }))
                        }
                        className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400">Gehäusetyp (Ammoniakschutz):</label>
                      <select
                        value={hardwareConfig.housing}
                        onChange={(e) =>
                          setHardwareConfig((prev) => ({
                            ...prev,
                            housing: e.target.value as HardwareConfig['housing'],
                          }))
                        }
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                      >
                        <option value="ip67-passive">IP67 Industriegehäuse (Passive Kühlung)</option>
                        <option value="standard">Standardgehäuse (Nicht empfohlen)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-2">
                      Hardware-Kosten (Est.)
                    </h3>
                    <div className="text-3xl font-extrabold text-emerald-400 font-mono">
                      ~ {getHardwarePrice()} €
                    </div>
                    <span className="text-[10px] text-slate-500">
                      Inklusive SSD, Verkabelung & Stromnetzteil.
                    </span>
                  </div>

                  <div className="mt-4 p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-400 leading-relaxed">
                    <strong className="text-emerald-400 block">Warum NVMe SSD?</strong>
                    SD-Karten sterben durch die hohe kontinuierliche Schreiblast des Video-Puffers
                    oft nach wenigen Monaten. NVMe wird dringend empfohlen.
                  </div>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">
                  Empfohlenes Stall-Topologie-Layout
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <div className="text-xs text-slate-500">1. Datenerfassung</div>
                    <div className="font-bold text-slate-200 mt-1">IP-Kameras</div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      RTSP Stream, 1080p, IR-Strahler nachts.
                    </p>
                  </div>
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <div className="text-xs text-slate-500">2. Lokale Verarbeitung</div>
                    <div className="font-bold text-emerald-400 mt-1">NVIDIA Jetson Node</div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      YOLO-Inferenz lokal im Stall (IP67 Gehäuse).
                    </p>
                  </div>
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <div className="text-xs text-slate-500">3. Lokales Gateway</div>
                    <div className="font-bold text-slate-200 mt-1">OpenClaw.ai</div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Schnittstelle zwischen KI-Pipeline & Heimnetz.
                    </p>
                  </div>
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <div className="text-xs text-slate-500">4. Alarmierung</div>
                    <div className="font-bold text-slate-200 mt-1">n8n & Telegram</div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Deterministischer Filter & Push ans Handy.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'models' && (
            <div className="space-y-6">
              <div className="max-w-4xl">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-200 bg-clip-text text-transparent">
                  2. Deep Learning & Computer Vision Algorithmen
                </h2>
                <p className="text-slate-300 text-sm mt-1 leading-relaxed">
                  Die visuelle Erkennung basiert auf einem hierarchischen Modellaufbau. Zuerst
                  detektiert YOLOv8/v11 das Tier und ein Tracking-Modell (ByteTrack) behält die
                  Tier-ID im Blick. Danach analysiert YOLO-Pose Skelettpunkte zur Haltungsanalyse.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3">
                  <div className="h-10 w-10 bg-emerald-500/10 text-emerald-400 rounded-lg flex items-center justify-center">
                    <Camera className="h-5 w-5" />
                  </div>
                  <h3 className="font-bold text-slate-200">1. Objekterkennung (YOLO)</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Identifiziert das Tier (Kuh) im Videobild und zieht eine Bounding Box.
                    Transfer-Learning auf Datensätzen wie{' '}
                    <strong className="text-emerald-400">CattleEyeView</strong> (für
                    Stall-Deckenkameras) sorgt für exzellente Erkennungsraten.
                  </p>
                  <div className="bg-slate-950 p-2.5 rounded font-mono text-[10px] text-emerald-400">
                    Output: Bounding Box [x1, y1, x2, y2, confidence]
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3">
                  <div className="h-10 w-10 bg-amber-500/10 text-amber-400 rounded-lg flex items-center justify-center">
                    <Sliders className="h-5 w-5" />
                  </div>
                  <h3 className="font-bold text-slate-200">2. Skelett-Analyse (Pose)</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Erkennt vordefinierte Gelenke (Keypoints) der Kuh. Für die Geburts- und
                    Gesundheitsüberwachung sind vor allem{' '}
                    <strong className="text-amber-400">Nacken</strong>,{' '}
                    <strong className="text-amber-400">Rückenmitte</strong> und{' '}
                    <strong className="text-amber-400">Schwanzansatz</strong> relevant.
                  </p>
                  <div className="bg-slate-950 p-2.5 rounded font-mono text-[10px] text-amber-400">
                    Output: Keypoints [id, x, y, confidence]
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3">
                  <div className="h-10 w-10 bg-sky-500/10 text-sky-400 rounded-lg flex items-center justify-center">
                    <Activity className="h-5 w-5" />
                  </div>
                  <h3 className="font-bold text-slate-200">3. Zeitliche Klassifikation</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Komplexe Verhaltensweisen wie Wiederkäuen oder Fressen benötigen
                    Zeitreihenanalysen. Spatiotemporale Modelle wie{' '}
                    <strong className="text-sky-400">TimeSformer</strong> oder{' '}
                    <strong className="text-sky-400">SlowFast</strong> verarbeiten Video-Sequenzen
                    über Frames hinweg.
                  </p>
                  <div className="bg-slate-950 p-2.5 rounded font-mono text-[10px] text-sky-400">
                    Output: Aktivitäts-Klasse (z.B. Wiederkäuen, Stand)
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'usecases' && (
            <div className="space-y-6">
              <div className="max-w-4xl">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-200 bg-clip-text text-transparent">
                  3. Biologische Anwendungsfälle (Use Cases)
                </h2>
                <p className="text-slate-300 text-sm mt-1 leading-relaxed">
                  Die KI ist darauf trainiert, biologische Marker für kritische Ereignisse zu
                  identifizieren und sie über mathematische Schwellenwerte abzugleichen.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-200">Abkalbung (Partus)</h3>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/30 font-semibold">
                      Kritisch
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Wichtigster Indikator ist das <strong>kontinuierliche Schwanzheben (Tail
                    Raising)</strong> etwa 3–4 Stunden vor Geburtsbeginn.
                  </p>
                  <ul className="text-[11px] text-slate-300 space-y-1.5 list-disc list-inside">
                    <li>30-Minuten-Filter verhindert Fehlalarme durch Fliegenabwehr</li>
                    <li>Erkennung von austretender Fruchtblase</li>
                    <li>Sofortiger Notfallalarm bei Sichtbarkeit von Hufen</li>
                  </ul>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-200">Brunsterkennung (Östrus)</h3>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-sky-500/20 text-sky-400 border border-sky-500/30 font-semibold">
                      Produktivität
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Der unfehlbare Goldstandard für Fruchtbarkeit ist der{' '}
                    <strong>Duldungsreflex (&quot;Standing Heat&quot;)</strong>.
                  </p>
                  <ul className="text-[11px] text-slate-300 space-y-1.5 list-disc list-inside">
                    <li>Kuh lässt sich von Artgenossinnen bespringen</li>
                    <li>Analyse der parallelen Körperausrichtung der Boxen</li>
                    <li>Sicherung der Besamungsfenster ohne invasive Sensoren</li>
                  </ul>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-200">Klauengesundheit (Lahmheit)</h3>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold">
                      Tierwohl
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Detektion von Lahmheit Wochen bevor das menschliche Auge Anomalien erfasst.
                  </p>
                  <ul className="text-[11px] text-slate-300 space-y-1.5 list-disc list-inside">
                    <li>Echtzeitanalyse der Rückenkrümmung (&quot;Arched Back&quot;)</li>
                    <li>Cobb-Winkel &lt; 170° triggert Frühwarnung</li>
                    <li>Überwachung von Ganganomalien und Schrittlänge</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'orchestration' && (
            <div className="space-y-6">
              <div className="max-w-4xl">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-200 bg-clip-text text-transparent">
                  4. Agentic Orchestration & Low-Code Workflow
                </h2>
                <p className="text-slate-300 text-sm mt-1 leading-relaxed">
                  Damit die Inferenz-Ergebnisse der Edge-KI zu tatsächlichen Handlungen führen,
                  kommt eine Orchestrierungsschicht zum Einsatz. Lokale Gateways (
                  <strong className="text-emerald-400">OpenClaw.ai</strong>) und
                  Low-Code-Plattformen (<strong className="text-emerald-400">n8n</strong>) verbinden
                  Algorithmen mit Messaging-Plattformen.
                </p>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                    Visualisierter n8n / OpenClaw Alarmierungsworkflow
                  </h3>
                  <button
                    onClick={() => {
                      triggerTelegramAlert(
                        '🔔 Test-Trigger: n8n Workflow erfolgreich durchlaufen. Edge-Inferenz voll funktionsfähig!',
                      )
                    }}
                    className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold px-4 py-2 rounded-lg text-xs flex items-center space-x-2 transition"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>Test-Payload absenden</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 relative flex flex-col justify-between">
                    <div>
                      <div className="text-[10px] font-mono text-emerald-400">STEP 1</div>
                      <h4 className="font-bold text-slate-200 mt-1">YOLO-Inferenz</h4>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Modell erkennt Heben des Schwanzes der Kuh.
                      </p>
                    </div>
                    <div className="bg-slate-900 p-1.5 rounded font-mono text-[9px] text-slate-500 mt-3 overflow-x-hidden">
                      {`{"tail_raised": true}`}
                    </div>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 relative flex flex-col justify-between">
                    <div>
                      <div className="text-[10px] font-mono text-emerald-400">STEP 2</div>
                      <h4 className="font-bold text-slate-200 mt-1">OpenClaw Gateway</h4>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Nimmt Frame-Metadaten entgegen und leitet sie weiter.
                      </p>
                    </div>
                    <div className="bg-slate-900 p-1.5 rounded font-mono text-[9px] text-slate-500 mt-3 overflow-x-hidden">
                      {`POST /v1/infer-event`}
                    </div>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 relative flex flex-col justify-between">
                    <div>
                      <div className="text-[10px] font-mono text-emerald-400">STEP 3</div>
                      <h4 className="font-bold text-slate-200 mt-1">n8n Engine</h4>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Prüft den 30-Minuten-Filter. Falls positiv: Alarmierungsschritt.
                      </p>
                    </div>
                    <div className="bg-slate-900 p-1.5 rounded font-mono text-[9px] text-slate-500 mt-3 overflow-x-hidden">
                      {`IF duration >= 30`}
                    </div>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 relative flex flex-col justify-between">
                    <div>
                      <div className="text-[10px] font-mono text-emerald-400">STEP 4</div>
                      <h4 className="font-bold text-slate-200 mt-1">Telegram Node</h4>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Triggert die Telegram Bot API mit Bildanhang des Stalls.
                      </p>
                    </div>
                    <div className="bg-slate-900 p-1.5 rounded font-mono text-[9px] text-slate-500 mt-3 overflow-x-hidden">
                      {`sendPhoto?chat_id=...`}
                    </div>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 relative flex flex-col justify-between">
                    <div>
                      <div className="text-[10px] font-mono text-emerald-400">STEP 5</div>
                      <h4 className="font-bold text-slate-200 mt-1">Landwirt-Handy</h4>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Erhält Push-Benachrichtigung mit Bild und ID der Kuh.
                      </p>
                    </div>
                    <div className="bg-emerald-950 text-emerald-400 p-1.5 rounded font-mono text-[9px] mt-3 text-center">
                      📱 Push erhalten!
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'economics' && (
            <div className="space-y-6">
              <div className="max-w-4xl">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-200 bg-clip-text text-transparent">
                  5. Wirtschaftlichkeitsanalyse & ROI-Kalkulator
                </h2>
                <p className="text-slate-300 text-sm mt-1 leading-relaxed">
                  Die Rentabilität entscheidet sich maßgeblich bei der Abwägung zwischen
                  kommerziellen Plug-and-Play-Anbietern (z.B. Lely Zeta Deckenkameras, CattleEye)
                  und einem individuell angepassten &quot;Custom-Agenten&quot; auf
                  Open-Source-Basis.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                    Betriebsdaten
                  </h3>

                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block text-slate-400 mb-1">
                        Herdengröße (Anzahl Milchkühe):
                      </label>
                      <input
                        type="number"
                        value={roiInputs.herdSize}
                        onChange={(e) =>
                          setRoiInputs((prev) => ({
                            ...prev,
                            herdSize: Math.max(1, parseInt(e.target.value) || 0),
                          }))
                        }
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 mb-1">
                        Kosten DIY-Hardware (NVIDIA Jetson, Gehäuse, Cam):
                      </label>
                      <input
                        type="number"
                        value={roiInputs.customHardwareCost}
                        onChange={(e) =>
                          setRoiInputs((prev) => ({
                            ...prev,
                            customHardwareCost: Math.max(1, parseInt(e.target.value) || 0),
                          }))
                        }
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 mb-1">
                        Kosten kommerzielles System (Kauf + Lizenzen):
                      </label>
                      <input
                        type="number"
                        value={roiInputs.commercialSystemCost}
                        onChange={(e) =>
                          setRoiInputs((prev) => ({
                            ...prev,
                            commercialSystemCost: Math.max(1, parseInt(e.target.value) || 0),
                          }))
                        }
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 mb-1">
                        Mehrwert pro Kuh und Jahr (Euro):
                      </label>
                      <input
                        type="number"
                        value={roiInputs.gainPerCowYear}
                        onChange={(e) =>
                          setRoiInputs((prev) => ({
                            ...prev,
                            gainPerCowYear: Math.max(1, parseInt(e.target.value) || 0),
                          }))
                        }
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 font-mono"
                      />
                      <span className="text-[10px] text-slate-500 block mt-1">
                        Wissenschaftlicher Richtwert: 370 € bis 400 € (geringere Kälbersterblichkeit
                        & verbesserte Fruchtbarkeit).
                      </span>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-8 bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between">
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                      Ergebnis der Wirtschaftlichkeitsberechnung
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/60">
                        <div className="text-xs text-slate-500">Jährlicher wirtschaftlicher Mehrwert</div>
                        <div className="text-2xl font-bold text-emerald-400 font-mono mt-1">
                          + {roiData.annualBenefit.toLocaleString('de-DE')} €
                        </div>
                        <p className="text-[11px] text-slate-400 mt-2">
                          Durch gesparte Tierarztkosten, optimales Besamungs-Timing & verhinderte
                          Kälberverluste.
                        </p>
                      </div>

                      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/60">
                        <div className="text-xs text-slate-500">Gewinn nach 5 Jahren (nach Investition)</div>
                        <div className="text-xs font-mono mt-1 text-slate-300">
                          <div>
                            Custom Agent (DIY):{' '}
                            <span className="text-emerald-400 font-bold">
                              {roiData.customTotalGain5Y.toLocaleString('de-DE')} €
                            </span>
                          </div>
                          <div className="mt-1">
                            Kommerziell:{' '}
                            <span className="text-amber-400 font-bold">
                              {roiData.commercialTotalGain5Y.toLocaleString('de-DE')} €
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4 pt-4">
                      <h4 className="text-xs font-bold text-slate-300 uppercase">
                        Amortisationsdauer im Vergleich
                      </h4>

                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-mono">
                          <span className="text-emerald-400">Custom Agent (Eigenbau)</span>
                          <span className="font-bold">
                            {roiData.customAmortizationMonths} Monate
                          </span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-3">
                          <div
                            className="bg-emerald-500 h-3 rounded-full transition-all duration-500"
                            style={{
                              width: `${Math.min(
                                100,
                                (parseFloat(roiData.customAmortizationMonths) / 24) * 100,
                              )}%`,
                            }}
                          ></div>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-mono">
                          <span className="text-amber-400">Kommerzielles System</span>
                          <span className="font-bold">
                            {roiData.commercialAmortizationMonths} Monate
                          </span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-3">
                          <div
                            className="bg-amber-500 h-3 rounded-full transition-all duration-500"
                            style={{
                              width: `${Math.min(
                                100,
                                (parseFloat(roiData.commercialAmortizationMonths) / 24) * 100,
                              )}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-xs text-slate-400 flex items-start space-x-2">
                    <Info className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    <p>
                      <strong>Amortisations-Fazit:</strong> DIY-Systeme amortisieren sich durch die
                      geringen Einstiegskosten von 1.000 € bis 2.000 € oft in{' '}
                      <strong className="text-emerald-400">unter einem Monat</strong> (je nach
                      Herdengröße), während Großinvestitionen in kommerzielle Komplettsysteme
                      mehrere Jahre benötigen.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'data' && (
            <div className="space-y-6">
              <div className="max-w-4xl">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-200 bg-clip-text text-transparent">
                  6. Datenstrategie & CVAT Annotator
                </h2>
                <p className="text-slate-300 text-sm mt-1 leading-relaxed">
                  Damit das YOLO-Pose-Modell im eigenen Stall präzise funktioniert, ist
                  feingranulares <strong>Transfer Learning</strong> nötig. Mit Werkzeugen wie{' '}
                  <strong>CVAT</strong> (Computer Vision Annotation Tool) werden Keypoints an
                  eigenen Video-Aufnahmen annotiert, um das Modell auf den spezifischen
                  Stall-Blickwinkel anzupassen.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col">
                  <div className="p-4 border-b border-slate-800 bg-slate-950/40 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Database className="h-4 w-4 text-emerald-400" />
                      <span className="text-xs font-mono font-bold text-slate-300">
                        CVAT_Sim_v1 // Frame_482.jpg
                      </span>
                    </div>
                    <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono">
                      Cattle Visual Behaviors (CVB) Dataset
                    </span>
                  </div>

                  <div className="bg-slate-950 p-6 flex flex-col items-center justify-center relative">
                    <div className="text-[11px] text-slate-500 mb-2 font-mono">
                      Klicke auf das Bild, um den aktiven Keypoint{' '}
                      <strong className="text-emerald-400">[{currentLabelType}]</strong> zu setzen:
                    </div>

                    <div
                      onClick={handleCVATClick}
                      className="relative border-2 border-slate-800 rounded-xl overflow-hidden cursor-crosshair max-w-md w-full aspect-video bg-slate-900/60 flex items-center justify-center"
                    >
                      <svg
                        viewBox="0 0 200 110"
                        className="w-full h-full opacity-30 absolute pointer-events-none"
                      >
                        <path
                          d="M 40 80 L 40 50 L 60 50 L 80 30 L 140 30 L 170 35 L 180 50 L 180 80"
                          fill="none"
                          stroke="#fff"
                          strokeWidth="2"
                        />
                        <line x1="60" y1="50" x2="60" y2="95" stroke="#fff" strokeWidth="2" />
                        <line x1="160" y1="50" x2="160" y2="95" stroke="#fff" strokeWidth="2" />
                      </svg>

                      <div className="absolute pointer-events-none text-center">
                        <Camera className="h-8 w-8 text-slate-700 mx-auto mb-2" />
                        <span className="text-[10px] text-slate-600 font-mono">
                          Annotations-Fläche
                        </span>
                      </div>

                      {labeledPoints.map((point, index) => (
                        <div
                          key={index}
                          className="absolute w-3 h-3 bg-rose-500 rounded-full border border-white -translate-x-1/2 -translate-y-1/2 group"
                          style={{ left: `${point.x}%`, top: `${point.y}%` }}
                        >
                          <span className="absolute left-4 top-0 bg-slate-950 text-[9px] text-white px-1.5 py-0.5 rounded border border-slate-800 whitespace-nowrap pointer-events-none">
                            {point.label}
                          </span>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => setLabeledPoints([])}
                      className="mt-4 text-[10px] text-slate-500 hover:text-rose-400 transition underline"
                    >
                      Alle gesetzten Keypoints zurücksetzen
                    </button>
                  </div>
                </div>

                <div className="lg:col-span-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                    Labeling-Steuerung
                  </h3>

                  <div className="space-y-1.5">
                    <label className="block text-xs text-slate-400">Aktives Label:</label>
                    <div className="grid grid-cols-2 gap-2">
                      {labelTypes.map((label) => (
                        <button
                          key={label}
                          onClick={() => setCurrentLabelType(label)}
                          className={`px-3 py-2 rounded-lg text-xs font-semibold text-left transition ${
                            currentLabelType === label
                              ? 'bg-emerald-500 text-slate-950 font-bold'
                              : 'bg-slate-800/80 hover:bg-slate-800 text-slate-400 border border-slate-800'
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <hr className="border-slate-800" />

                  <div>
                    <h4 className="text-xs font-bold text-slate-300">Wissenschaftliche Datensätze:</h4>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Für das Training müssen nicht alle Bilder selbst aufgenommen werden. Folgende
                      Datensätze sind frei verfügbar:
                    </p>
                    <div className="space-y-2 mt-2">
                      <div className="bg-slate-950 p-2.5 rounded border border-slate-800 text-xs">
                        <strong className="text-emerald-400 font-mono">
                          CVB (Cattle Visual Behaviors)
                        </strong>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Fokus auf Sozial- und Fressverhalten im Herdenverbund.
                        </p>
                      </div>
                      <div className="bg-slate-950 p-2.5 rounded border border-slate-800 text-xs">
                        <strong className="text-emerald-400 font-mono">CattleEyeView</strong>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Spezialisiert auf Top-Down-Perspektiven zur Erkennung von Lahmheit.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {showTelegramModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xs w-full overflow-hidden shadow-2xl">
            <div className="bg-slate-950 px-4 py-3 flex justify-between items-center border-b border-slate-800 text-xs font-mono text-slate-400">
              <span>LTE 4G</span>
              <span className="font-bold text-slate-300">Telegram Bot</span>
              <span>100% 🔋</span>
            </div>

            <div className="p-4 h-80 overflow-y-auto space-y-3 bg-slate-950/40">
              <div className="text-center text-[10px] text-slate-500">Heute</div>

              {telegramAlerts.length === 0 ? (
                <div className="text-center text-xs text-slate-600 italic py-8">
                  Keine Alarme vorhanden. Drücke im Dashboard &quot;Filter starten&quot; oder sende
                  einen Test-Payload.
                </div>
              ) : (
                telegramAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="bg-slate-800/80 text-xs p-3 rounded-2xl border border-slate-700 max-w-[90%] text-slate-200"
                  >
                    <p className="leading-relaxed">{alert.text}</p>
                    <span className="text-[9px] text-slate-500 block text-right mt-1">
                      {alert.time}
                    </span>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setShowTelegramModal(false)}
                className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs transition w-full"
              >
                Schließen
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="bg-slate-900 border-t border-slate-800 py-3 px-6 text-center text-xs text-slate-500 font-mono">
        CattleVision AI // Entwickelt basierend auf 251 Quellen für robuste KI-basierte
        Stallüberwachung.
      </footer>
    </div>
  )
}
