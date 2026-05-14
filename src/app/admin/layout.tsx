"use client"

import { usePathname, useRouter } from "next/navigation"
import {
  BarChart2,
  Users,
  ClipboardList,
  Settings,
  LogOut,
  ShieldCheck,
} from "lucide-react"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()

  const navItems = [
    { id: "overview", label: "Overview", icon: <BarChart2 size={18} />, href: "/admin/overview" },
    { id: "users",    label: "Users",    icon: <Users size={18} />,     href: "/admin/users"    },
    { id: "tasks",    label: "Tasks",    icon: <ClipboardList size={18} />, href: "/admin/tasks" },
    { id: "settings", label: "Settings", icon: <Settings size={18} />,  href: "/admin/settings" },
  ]

  return (
    <div className="min-h-screen flex bg-slate-50">

      {/* ── Sidebar ── */}
      <aside className="w-64 bg-gradient-to-b from-indigo-900 to-blue-900 flex flex-col fixed h-full z-10">

        {/* Logo */}
        <div className="px-6 py-7 border-b border-indigo-700/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
              <ShieldCheck size={20} className="text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-sm">Smart Companion</p>
              <p className="text-indigo-300 text-xs">Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Nav */}
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

        {/* Logout */}
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

      {/* ── Page Content ── */}
      <main className="flex-1 ml-64 p-8 overflow-y-auto">
        {children}
      </main>

    </div>
  )
}