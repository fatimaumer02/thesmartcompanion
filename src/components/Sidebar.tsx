"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  CheckSquare,
  Calendar,
  Gift,
  Mic,
  Settings,
  HelpCircle,
  LogOut,
} from "lucide-react"

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

  return (
    <aside className="flex flex-col w-64 bg-white shadow-lg px-4 py-6 fixed inset-y-0 left-0 z-50">

      {/* Logo */}
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-md">
          <span className="text-white font-bold text-sm">SC</span>
        </div>

        <span className="font-semibold text-lg text-gray-800 tracking-tight">
          Smart Companion
        </span>
      </div>

      {/* Menu */}
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

      {/* Divider */}
      <div className="my-4 border-t border-gray-100" />

      {/* Logout */}
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
  )
}