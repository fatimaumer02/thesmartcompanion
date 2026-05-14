"use client"

import { useEffect, useState } from "react"
import { Users, ClipboardList, TrendingUp, Bell } from "lucide-react"

type User = {
  id: number
  name: string
  email: string
  status: string
  tasks: number
  joinedAt: string
}

export default function OverviewPage() {
  const [users, setUsers] = useState<User[]>([])
  const [totalTasks, setTotalTasks] = useState(0)

  useEffect(() => {
    try {
      const raw = localStorage.getItem("allUsers")
      if (raw) setUsers(JSON.parse(raw))
      const tasksRaw = localStorage.getItem("userTasks")
      if (tasksRaw) setTotalTasks(JSON.parse(tasksRaw).length)
    } catch {}
  }, [])

  const stats = [
    {
      label: "Total Users",
      value: users.length.toString(),
      icon: <Users size={20} />,
      color: "bg-blue-50 text-blue-600",
      border: "border-blue-100",
    },
    {
      label: "Active Tasks",
      value: totalTasks.toString(),
      icon: <ClipboardList size={20} />,
      color: "bg-indigo-50 text-indigo-600",
      border: "border-indigo-100",
    },
    {
      label: "Active Users",
      value: users.filter((u) => u.status === "Active").length.toString(),
      icon: <TrendingUp size={20} />,
      color: "bg-emerald-50 text-emerald-600",
      border: "border-emerald-100",
    },
    {
      label: "Inactive Users",
      value: users.filter((u) => u.status === "Inactive").length.toString(),
      icon: <Bell size={20} />,
      color: "bg-rose-50 text-rose-600",
      border: "border-rose-100",
    },
  ]

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Overview</h1>
          <p className="text-slate-400 text-sm mt-1">Welcome back, Admin 🔐</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">
          A
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s, i) => (
          <div
            key={i}
            className={`bg-white rounded-2xl border ${s.border} p-5 flex items-center gap-4 shadow-sm`}
          >
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${s.color}`}>
              {s.icon}
            </div>
            <div>
              <p className="text-xl font-bold text-slate-800">{s.value}</p>
              <p className="text-xs text-slate-400 font-medium">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Users */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-bold text-slate-700">Recent Users</h2>
          <span className="text-xs text-indigo-600 font-semibold bg-indigo-50 px-3 py-1 rounded-full">
            {users.length} users
          </span>
        </div>

        {users.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-slate-400 text-sm">No users registered yet.</p>
            <p className="text-slate-300 text-xs mt-1">Users will appear here after they sign up.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 text-left">
                <th className="px-6 py-3 text-xs font-bold text-slate-400 uppercase tracking-wide">Name</th>
                <th className="px-6 py-3 text-xs font-bold text-slate-400 uppercase tracking-wide">Email</th>
                <th className="px-6 py-3 text-xs font-bold text-slate-400 uppercase tracking-wide">Joined</th>
                <th className="px-6 py-3 text-xs font-bold text-slate-400 uppercase tracking-wide">Status</th>
              </tr>
            </thead>
            <tbody>
              {users.slice(0, 5).map((u, i) => (
                <tr key={i} className="border-t border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs">
                        {u.name[0].toUpperCase()}
                      </div>
                      <span className="text-sm font-semibold text-slate-700">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-400">{u.email}</td>
                  <td className="px-6 py-4 text-sm text-slate-400">{u.joinedAt}</td>
                  <td className="px-6 py-4">
                    <span className={[
                      "text-xs font-bold px-2.5 py-1 rounded-full",
                      u.status === "Active"
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-slate-100 text-slate-400"
                    ].join(" ")}>
                      {u.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}