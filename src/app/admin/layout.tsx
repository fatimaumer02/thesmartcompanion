"use client"

import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import {
  BarChart2,
  Users,
  ClipboardList,
  Settings,
  LogOut,
  ShieldCheck,
  Menu,
  X,
} from "lucide-react"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const navItems = [
    { id: "overview", label: "Overview", icon: <BarChart2 size={18} />, href: "/admin/overview" },
    { id: "users",    label: "Users",    icon: <Users size={18} />,     href: "/admin/users"    },
    { id: "tasks",    label: "Tasks",    icon: <ClipboardList size={18} />, href: "/admin/tasks" },
    { id: "settings", label: "Settings", icon: <Settings size={18} />,  href: "/admin/settings" },
  ]

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }
    window.addEventListener("keydown", onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener("keydown", onKey)
    }
  }, [open])

  return (
    <div className="min-h-screen flex bg-slate-50">

      {/* Mobile-only hamburger */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open admin menu"
        aria-expanded={open}
        className="lg:hidden fixed top-4 left-4 z-30 w-10 h-10 rounded-xl bg-indigo-900 text-white shadow-md flex items-center justify-center hover:bg-indigo-800 transition-colors"
      >
        <Menu size={20} />
      </button>

      {/* Backdrop */}
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
          "w-64 bg-gradient-to-b from-indigo-900 to-blue-900 flex flex-col fixed inset-y-0 left-0 z-50",
          "transition-transform duration-300 ease-out",
          open ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0",
        ].join(" ")}
      >
        <div className="px-6 py-7 border-b border-indigo-700/50 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <ShieldCheck size={20} className="text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-white font-bold text-sm truncate">Smart Companion</p>
              <p className="text-indigo-300 text-xs">Admin Panel</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close admin menu"
            className="lg:hidden w-8 h-8 rounded-lg flex items-center justify-center text-indigo-200 hover:bg-white/10"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => router.push(item.href)}
              className={[
                "w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all",
                pathname === item.href
                  ? "bg-white/20 text-white"
                  : "text-indigo-300 hover:bg-white/10 hover:text-white"
              ].join(" ")}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        <div className="px-4 py-6 border-t border-indigo-700/50">
          <button
            onClick={() => router.push("/login")}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-indigo-300 hover:bg-white/10 hover:text-white transition-all"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 lg:ml-64 p-4 sm:p-6 lg:p-8 pt-20 lg:pt-8 overflow-y-auto">
        {children}
      </main>

    </div>
  )
}
