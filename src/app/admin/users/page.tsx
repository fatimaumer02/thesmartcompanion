"use client"

import { useEffect, useState } from "react"
import { Trash2 } from "lucide-react"
import { supabase } from "../../../lib/supabase"

type User = {
  id: string
  name: string
  email: string
  status: string
  tasks: number
  joined_at: string
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    setLoading(true)
    const { data } = await supabase
      .from("users")
      .select("*")
      .order("joined_at", { ascending: false })
    if (data) setUsers(data)
    setLoading(false)
  }

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  )

  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "Active" ? "Inactive" : "Active"
    const { error } = await supabase
      .from("users")
      .update({ status: newStatus })
      .eq("id", id)

    if (!error) {
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, status: newStatus } : u))
      )
    }
  }

  const deleteUser = async (id: string) => {
    const { error } = await supabase.from("users").delete().eq("id", id)
    if (!error) {
      setUsers((prev) => prev.filter((u) => u.id !== id))
    }
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "—"
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
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
        {loading ? (
          <div className="px-6 py-12 text-center">
            <p className="text-slate-400 text-sm">Loading users...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-slate-400 text-sm">No users found.</p>
            <p className="text-slate-300 text-xs mt-1">
              Users will appear here after they sign up.
            </p>
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
              {filtered.map((u) => (
                <tr key={u.id} className="border-t border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs">
                        {u.name?.[0]?.toUpperCase() ?? "?"}
                      </div>
                      <span className="text-sm font-semibold text-slate-700">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-400">{u.email}</td>
                  <td className="px-6 py-4 text-sm text-slate-400">{formatDate(u.joined_at)}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => toggleStatus(u.id, u.status)}
                      className={[
                        "text-xs font-bold px-2.5 py-1 rounded-full transition-all",
                        u.status === "Active"
                          ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                          : "bg-slate-100 text-slate-400 hover:bg-slate-200",
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