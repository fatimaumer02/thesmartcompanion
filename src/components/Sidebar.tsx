"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import {
  LayoutDashboard,
  CheckSquare,
  Gift,
  Mic,
  Settings,
  HelpCircle,
  LogOut,
  Menu,
  X,
  ShieldCheck,
} from "lucide-react"
import NotificationBell from "./NotificationBell"

const menu = [
  { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { name: "My Tasks", path: "/mytask", icon: CheckSquare },
  { name: "Rewards", path: "/rewards", icon: Gift },
  { name: "Voice Assistant", path: "/voice-assistant", icon: Mic },
  { name: "Settings", path: "/setting", icon: Settings },
  { name: "Help", path: "/help", icon: HelpCircle },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  // Auto-close the drawer on route change so navigating doesn't leave it
  // hanging open.
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  // Lock background scroll while the mobile drawer is open.
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  // Esc closes the drawer on mobile.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open])

  return (
    <>
      {/* Mobile-only hamburger trigger — hidden at lg+ where the sidebar is
          always visible. Positioned so it doesn't overlap page content. */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        aria-expanded={open}
        className="lg:hidden fixed top-4 left-4 z-40 w-10 h-10 rounded-xl bg-white shadow-md border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
      >
        <Menu size={20} />
      </button>

      {/* Backdrop — only visible on mobile when drawer is open */}
      <div
        onClick={() => setOpen(false)}
        className={[
          "lg:hidden fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm transition-opacity duration-300",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
        ].join(" ")}
        aria-hidden
      />

      <aside
        className={[
          "flex flex-col w-64 bg-white shadow-lg px-4 py-6 fixed inset-y-0 left-0 z-50",
          "transition-transform duration-300 ease-out",
          // Mobile: slide in/out. Desktop: always visible.
          open ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0",
        ].join(" ")}
      >
        {/* Logo + bell + close button */}
        <div className="flex items-center justify-between mb-10 px-2">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 bg-indigo-950 rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
              <ShieldCheck size={18} className="text-white" />
            </div>
            <span className="font-semibold text-base text-gray-800 tracking-tight truncate">
              Smart Companion
            </span>
          </div>
          <div className="flex items-center gap-1">
            <NotificationBell />
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              className="lg:hidden w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <nav className="flex flex-col gap-1 flex-1">
          {menu.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.path

            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? "bg-blue-600 text-white shadow-sm shadow-blue-200"
                    : "text-gray-500 hover:bg-blue-50 hover:text-blue-600"
                }`}
              >
                <Icon
                  size={18}
                  className={`shrink-0 transition-colors duration-200 ${
                    isActive
                      ? "text-white"
                      : "text-gray-400 group-hover:text-blue-500"
                  }`}
                />

                <span>{item.name}</span>
              </Link>
            )
          })}
        </nav>

        <div className="my-4 border-t border-gray-100" />

        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-500 transition-all duration-200 group"
        >
          <LogOut
            size={18}
            className="shrink-0 text-gray-400 group-hover:text-red-400 transition-colors duration-200"
          />

          <span>Log out</span>
        </Link>
      </aside>
    </>
  )
}
