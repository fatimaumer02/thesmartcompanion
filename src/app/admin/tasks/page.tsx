"use client"

import { useEffect, useMemo, useState } from "react"
import { supabase } from "../../../lib/supabase"
import { sendReminder } from "../../../lib/notifications"

type SupabaseUser = {
  id: string
  name: string
  email: string
  status: string
  joined_at: string
}

type SupabaseTask = {
  id: number
  user_id: string
  user_email: string
  title: string
  progress: string
  created_at: string
  created_timestamp: number
  steps?: { text: string; duration: string; completed: boolean }[]
}

type Status = "Completed" | "In Progress" | "Pending" | "Overdue"

function parseProgress(progress: string): { done: number; total: number } {
  const [d, t] = progress.split("/").map(Number)
  return { done: Number.isFinite(d) ? d : 0, total: Number.isFinite(t) ? t : 0 }
}

function deriveStatus(progress: string, createdAt: string): Status {
  const { done, total } = parseProgress(progress)
  if (total > 0 && done === total) return "Completed"
  const ageMs = Date.now() - new Date(createdAt).getTime()
  if (ageMs > 3 * 86_400_000 && done < total) return "Overdue"
  if (done === 0) return "Pending"
  return "In Progress"
}

const STATUS_STYLES: Record<Status, string> = {
  Completed:     "bg-emerald-50 text-emerald-700 border-emerald-200",
  "In Progress": "bg-blue-50 text-blue-700 border-blue-200",
  Pending:       "bg-slate-100 text-slate-600 border-slate-200",
  Overdue:       "bg-rose-50 text-rose-700 border-rose-200",
}

function dayKey(iso: string): string {
  const d = new Date(iso)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

function relativeDayLabel(iso: string): string {
  const d = new Date(iso)
  const today = new Date()
  const startOfDay = (date: Date) => { const x = new Date(date); x.setHours(0, 0, 0, 0); return x.getTime() }
  const diff = Math.round((startOfDay(today) - startOfDay(d)) / 86_400_000)
  if (diff === 0) return "Today"
  if (diff === 1) return "Yesterday"
  if (diff < 7) return `${diff} days ago`
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
}

function initials(name: string): string {
  return name.split(/\s+/).map((p) => p[0]).slice(0, 2).join("").toUpperCase()
}

export default function TasksPage() {
  const [users, setUsers]                   = useState<SupabaseUser[]>([])
  const [tasks, setTasks]                   = useState<SupabaseTask[]>([])
  const [loading, setLoading]               = useState(true)
  const [error, setError]                   = useState<string | null>(null)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const fetchAll = async () => {
      setLoading(true)
      setError(null)
      const [usersRes, tasksRes] = await Promise.all([
        supabase.from("users").select("*").order("joined_at", { ascending: false }),
        supabase.from("tasks").select("*").order("created_timestamp", { ascending: false }),
      ])
      if (cancelled) return
      if (usersRes.error) setError(usersRes.error.message)
      else if (usersRes.data) setUsers(usersRes.data as SupabaseUser[])
      if (tasksRes.error) setError((p) => p ? `${p} | ${tasksRes.error!.message}` : tasksRes.error!.message)
      else if (tasksRes.data) setTasks(tasksRes.data as SupabaseTask[])
      setLoading(false)
    }
    fetchAll()
    return () => { cancelled = true }
  }, [])

  // Match by both user_id AND user_email
  const getTasksForUser = useMemo(() => {
    return (user: SupabaseUser): SupabaseTask[] =>
      tasks.filter(
        (t) =>
          (t.user_id && t.user_id === user.id) ||
          (t.user_email && t.user_email === user.email)
      )
  }, [tasks])

  useEffect(() => {
    if (!selectedUserId) return
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setSelectedUserId(null) }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [selectedUserId])

  const selectedUser      = users.find((u) => u.id === selectedUserId) ?? null
  const selectedUserTasks = useMemo(() => {
    if (!selectedUser) return []
    return getTasksForUser(selectedUser)
  }, [selectedUser, getTasksForUser])

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Tasks by User</h1>
          <p className="text-slate-400 text-sm mt-1">Click any user to see their task history.</p>
        </div>
        <span className="text-xs text-indigo-600 font-semibold bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-full">
          {users.length} users · {tasks.length} tasks
        </span>
      </div>

      {error && (
        <div className="mb-6 px-4 py-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-sm">
          ⚠️ {error}
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-6 py-12 text-center">
          <div className="w-6 h-6 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-400 text-sm">Loading users and tasks...</p>
        </div>
      ) : users.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-6 py-12 text-center">
          <p className="text-slate-400 text-sm">No users registered yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {users.map((u) => {
            const userTasks  = getTasksForUser(u)
            const completed  = userTasks.filter((t) => { const { done, total } = parseProgress(t.progress); return total > 0 && done === total }).length
            const inProgress = userTasks.filter((t) => { const { done, total } = parseProgress(t.progress); return done > 0 && done < total }).length
            return (
              <button
                key={u.id}
                type="button"
                onClick={() => setSelectedUserId(u.id)}
                className="w-full text-left bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-xl hover:shadow-indigo-200/40 transition-all duration-300"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-gradient-to-br from-indigo-500 to-blue-600 text-white font-bold text-sm shadow-md shadow-indigo-200/50">
                    {initials(u.name || u.email)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-semibold text-slate-800 truncate">{u.name || "Unnamed"}</p>
                      {u.status && (
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full whitespace-nowrap ${u.status === "Active" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-100 text-slate-500 border border-slate-200"}`}>
                          {u.status.toUpperCase()}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 truncate">{u.email}</p>
                  </div>
                  <svg className="w-4 h-4 text-slate-300 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
                {u.joined_at && (
                  <p className="text-[11px] text-slate-400 mb-3">
                    Joined {new Date(u.joined_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                  </p>
                )}
                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100">
                  <Stat value={userTasks.length} label="Total"  tone="slate"   />
                  <Stat value={completed}        label="Done"   tone="emerald" />
                  <Stat value={inProgress}       label="Active" tone="blue"    />
                </div>
              </button>
            )
          })}
        </div>
      )}

      {selectedUser && (
        <UserDetailModal
          user={selectedUser}
          tasks={selectedUserTasks}
          onClose={() => setSelectedUserId(null)}
        />
      )}
    </div>
  )
}

function Stat({ value, label, tone }: { value: number; label: string; tone: "slate" | "emerald" | "blue" }) {
  const toneClass = { slate: "text-slate-700", emerald: "text-emerald-600", blue: "text-blue-600" }
  return (
    <div className="text-center">
      <div className={`text-lg font-extrabold ${toneClass[tone]} leading-none`}>{value}</div>
      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{label}</div>
    </div>
  )
}

function UserDetailModal({ user, tasks, onClose }: { user: SupabaseUser; tasks: SupabaseTask[]; onClose: () => void }) {
  const [expandedTaskId, setExpandedTaskId] = useState<number | null>(null)
  const [reminderState, setReminderState]   = useState<Record<number, "idle" | "sending" | "sent" | "error">>({})

  // ── FIXED: calls sendReminder which POSTs to /api/admin/remind ─────────────
  const handleRemind = async (task: SupabaseTask) => {
    if (!task.user_id) {
      console.warn("Task has no user_id — cannot send reminder")
      setReminderState((s) => ({ ...s, [task.id]: "error" }))
      return
    }

    setReminderState((s) => ({ ...s, [task.id]: "sending" }))

    const result = await sendReminder({
      userId:    task.user_id,
      taskId:    task.id,
      taskTitle: task.title,
      message:   `⏰ Reminder from your coach: Please complete "${task.title}"`,
    })

    if (result.ok) {
      setReminderState((s) => ({ ...s, [task.id]: "sent" }))
      window.setTimeout(() => setReminderState((s) => ({ ...s, [task.id]: "idle" })), 3000)
    } else {
      console.error("sendReminder failed:", result.error)
      setReminderState((s) => ({ ...s, [task.id]: "error" }))
      window.setTimeout(() => setReminderState((s) => ({ ...s, [task.id]: "idle" })), 3000)
    }
  }

  const groups = useMemo(() => {
    const buckets = new Map<string, SupabaseTask[]>()
    for (const t of tasks) {
      const key = dayKey(t.created_at)
      if (!buckets.has(key)) buckets.set(key, [])
      buckets.get(key)!.push(t)
    }
    return Array.from(buckets.entries())
      .sort((a, b) => (a[0] < b[0] ? 1 : -1))
      .map(([key, ts]) => ({ key, label: relativeDayLabel(ts[0].created_at), tasks: ts }))
  }, [tasks])

  const completed = tasks.filter((t) => { const { done, total } = parseProgress(t.progress); return total > 0 && done === total }).length

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 overflow-y-auto" onClick={onClose} role="dialog" aria-modal="true">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl my-auto overflow-hidden" onClick={(e) => e.stopPropagation()}>

        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center text-white font-bold border border-white/20">
            {initials(user.name || user.email)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <h2 className="text-white font-bold text-lg truncate">{user.name || "Unnamed"}</h2>
              {user.status && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${user.status === "Active" ? "bg-emerald-400/30 text-emerald-100 border border-emerald-300/40" : "bg-white/15 text-white/70 border border-white/20"}`}>
                  {user.status}
                </span>
              )}
            </div>
            <p className="text-blue-100 text-xs truncate">{user.email}</p>
            {user.joined_at && (
              <p className="text-blue-200/80 text-[10px] mt-0.5">
                Joined {new Date(user.joined_at).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}
              </p>
            )}
          </div>
          <button onClick={onClose} aria-label="Close" className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors">✕</button>
        </div>

        <div className="px-6 py-4 grid grid-cols-3 gap-2 border-b border-slate-100">
          <Stat value={tasks.length}             label="Total"     tone="slate"   />
          <Stat value={completed}                label="Completed" tone="emerald" />
          <Stat value={tasks.length - completed} label="Active"    tone="blue"    />
        </div>

        <div className="px-4 sm:px-6 py-4 max-h-[60vh] overflow-y-auto">
          {tasks.length === 0 ? (
            <p className="text-center text-sm text-slate-500 py-10">This user hasn&apos;t created any tasks yet.</p>
          ) : (
            <div className="space-y-6">
              {groups.map((group) => (
                <section key={group.key}>
                  <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">{group.label}</h3>
                  <div className="space-y-2.5">
                    {group.tasks.map((t) => {
                      const { done, total } = parseProgress(t.progress)
                      const pct        = total > 0 ? Math.round((done / total) * 100) : 0
                      const status     = deriveStatus(t.progress, t.created_at)
                      const isExpanded = expandedTaskId === t.id
                      const hasSteps   = (t.steps?.length ?? 0) > 0

                      return (
                        <div key={t.id} className="bg-slate-50 border border-slate-100 rounded-xl overflow-hidden">
                          <div
                            onClick={() => hasSteps && setExpandedTaskId(isExpanded ? null : t.id)}
                            role={hasSteps ? "button" : undefined}
                            tabIndex={hasSteps ? 0 : undefined}
                            className={`p-4 ${hasSteps ? "cursor-pointer hover:bg-slate-100/60" : ""} transition-colors`}
                          >
                            <div className="flex items-start justify-between gap-3 mb-2 flex-wrap">
                              <p className="text-sm font-semibold text-slate-800 truncate flex-1">{t.title}</p>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border whitespace-nowrap flex-shrink-0 ${STATUS_STYLES[status]}`}>
                                {status}
                              </span>

                              {/* ── Remind button — now actually works ── */}
                              {status !== "Completed" && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    if (reminderState[t.id] !== "sending" && reminderState[t.id] !== "sent") {
                                      handleRemind(t)
                                    }
                                  }}
                                  disabled={reminderState[t.id] === "sending" || reminderState[t.id] === "sent"}
                                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border whitespace-nowrap flex-shrink-0 transition-colors ${
                                    reminderState[t.id] === "sent"    ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                                    reminderState[t.id] === "error"   ? "bg-rose-50 text-rose-700 border-rose-200" :
                                    reminderState[t.id] === "sending" ? "bg-slate-100 text-slate-400 border-slate-200" :
                                    "bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100"
                                  }`}
                                >
                                  {reminderState[t.id] === "sending" ? "Sending…"  :
                                   reminderState[t.id] === "sent"    ? "✓ Sent"    :
                                   reminderState[t.id] === "error"   ? "✕ Failed"  :
                                   "🔔 Remind"}
                                </button>
                              )}

                              {hasSteps && (
                                <span className={`text-slate-400 text-xs transition-transform duration-200 ${isExpanded ? "rotate-90" : ""}`} aria-hidden>▶</span>
                              )}
                            </div>

                            <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden mb-1.5">
                              <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                            </div>
                            <p className="text-[11px] text-slate-500">{done} of {total} steps · {pct}%</p>
                          </div>

                          {isExpanded && hasSteps && (
                            <div className="px-4 pb-4 pt-1 border-t border-slate-200 bg-white">
                              <ol className="space-y-1.5">
                                {t.steps!.map((s, idx) => (
                                  <li key={idx} className="flex items-center gap-2.5 text-[12px]">
                                    <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0 ${s.completed ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-400"}`}>
                                      {s.completed ? "✓" : idx + 1}
                                    </span>
                                    <span className={`flex-1 ${s.completed ? "line-through text-slate-400" : "text-slate-700"}`}>{s.text}</span>
                                    <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">{s.duration}</span>
                                  </li>
                                ))}
                              </ol>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>

        <div className="px-6 py-4 bg-white border-t border-slate-100">
          <button onClick={onClose} className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold py-3 rounded-xl text-sm hover:from-indigo-700 hover:to-blue-700 transition-all">
            Close
          </button>
        </div>
      </div>
    </div>
  )
}