"use client"

import { useEffect, useState } from "react"
import { Trash2 } from "lucide-react"

type User = {
  id: number
  name: string
  email: string
  status: string
  tasks: number
  joinedAt: string
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [search, setSearch] = useState("")

  useEffect(() => {
    try {
      const raw = localStorage.getItem("allUsers")
      if (raw) setUsers(JSON.parse(raw))
    } catch {}
  }, [])

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  )

  const toggleStatus = (id: number) => {
    const updated = users.map((u) =>
      u.id === id
        ? { ...u, status: u.status === "Active" ? "Inactive" : "Active" }
        : u
    )
    setUsers(updated)
    localStorage.setItem("allUsers", JSON.stringify(updated))
  }

  const deleteUser = (id: number) => {
    const updated = users.filter((u) => u.id !== id)
    setUsers(updated)
    localStorage.setItem("allUsers", JSON.stringify(updated))
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Users</h1>
          <p className="text-slate-400 text-sm mt-1">Manage all registered users</p>
        </div>
        <span className="text-xs text-indigo-600 font-semibold bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-full">
          {users.length} total
        </span>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Search by name or email..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full mb-6 px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-300 text-sm"
      />

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-slate-400 text-sm">No users found.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 text-left">
                <th className="px-6 py-3 text-xs font-bold text-slate-400 uppercase tracking-wide">Name</th>
                <th className="px-6 py-3 text-xs font-bold text-slate-400 uppercase tracking-wide">Email</th>
                <th className="px-6 py-3 text-xs font-bold text-slate-400 uppercase tracking-wide">Joined</th>
                <th className="px-6 py-3 text-xs font-bold text-slate-400 uppercase tracking-wide">Status</th>
                <th className="px-6 py-3 text-xs font-bold text-slate-400 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u, i) => (
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
                    <button
                      onClick={() => toggleStatus(u.id)}
                      className={[
                        "text-xs font-bold px-2.5 py-1 rounded-full transition-all",
                        u.status === "Active"
                          ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                          : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                      ].join(" ")}
                    >
                      {u.status}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => deleteUser(u.id)}
                      className="text-rose-400 hover:text-rose-600 transition-colors"
                      aria-label="Delete user"
                    >
                      <Trash2 size={16} />
                    </button>
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