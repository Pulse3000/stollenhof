'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  CalendarDays,
  Beef,
  Droplets,
  PartyPopper,
  CheckSquare,
  Menu,
  X,
  Users,
  CalendarRange,
  Home,
  TrendingUp,
  DollarSign,
  Package,
  Warehouse,
  Trees,
  Eye,
  Cpu,
  MapPin,
  ClipboardList,
  Gamepad2,
} from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

type NavItem = { href: string; label: string; icon: typeof Beef }

const navGroups: { title: string; items: NavItem[] }[] = [
  {
    title: 'Stall',
    items: [
      { href: '/', label: 'Übersicht', icon: LayoutDashboard },
      { href: '/stall', label: 'Stallbuch', icon: Warehouse },
      { href: '/stallwache', label: 'Stallwache', icon: Eye },
      { href: '/stallsimulator', label: 'KI-Simulator', icon: Cpu },
      { href: '/tiere', label: 'Tiere', icon: Beef },
      { href: '/geburten', label: 'Geburtenkalender', icon: CalendarDays },
      { href: '/stall3d', label: '3D-Stall', icon: MapPin },
      { href: '/neuer-eintrag', label: 'Neuer Eintrag', icon: ClipboardList },
      { href: '/stallgame', label: 'Kuh-Memory', icon: Gamepad2 },
      { href: '/milch', label: 'Milchdaten', icon: Droplets },
      { href: '/weide', label: 'Weiden', icon: Trees },
      { href: '/futter', label: 'Futter', icon: Package },
      { href: '/aufgaben', label: 'Aufgaben', icon: CheckSquare },
    ],
  },
  {
    title: 'Hofgäste',
    items: [
      { href: '/kalender', label: 'Hofkalender', icon: CalendarRange },
      { href: '/buchungen', label: 'Buchungen', icon: CalendarDays },
      { href: '/gaeste', label: 'Gästeverzeichnis', icon: Users },
      { href: '/unterkunft', label: 'Siloturm', icon: Home },
      { href: '/veranstaltungen', label: 'Veranstaltungen', icon: PartyPopper },
    ],
  },
  {
    title: 'Verwaltung',
    items: [
      { href: '/statistiken', label: 'Statistiken', icon: TrendingUp },
      { href: '/finanzen', label: 'Finanzen', icon: DollarSign },
    ],
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const NavContent = () => (
    <>
      <div className="flex flex-col items-center gap-2 px-4 py-4 border-b border-sidebar-border">
        <Image
          src="/assets/logo-stollenhof.svg"
          alt="Oberer Stollenhof"
          width={160}
          height={160}
          className="w-full max-w-[140px] drop-shadow-md"
          priority
        />
        <Image
          src="/assets/logo-demeter.svg"
          alt="Demeter"
          width={80}
          height={62}
          className="drop-shadow-sm"
        />
      </div>

      <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
        {navGroups.map((group) => (
          <div key={group.title} className="space-y-1">
            <p className="px-3 text-[10px] font-semibold uppercase tracking-wider text-green-400/50">
              {group.title}
            </p>
            {group.items.map(({ href, label, icon: Icon }) => {
              const active = pathname === href
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    active
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                      : 'text-green-200/70 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground'
                  )}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {label}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      <div className="px-4 py-4 border-t border-sidebar-border flex flex-col gap-1">
        <p className="text-xs text-green-400/50 leading-relaxed">
          Familie Schabel · 73529 Rechberg<br />
          Baden-Württemberg
        </p>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-green-900 text-white shadow-lg"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={cn(
          'md:hidden fixed inset-y-0 left-0 z-40 w-64 flex flex-col bg-sidebar transition-transform duration-200',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <NavContent />
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-60 shrink-0 bg-sidebar">
        <NavContent />
      </aside>
    </>
  )
}
