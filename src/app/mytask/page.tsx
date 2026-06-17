"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Sidebar from "../../components/Sidebar"
import TaskCard from "../../components/TaskCard"
import { readTasks, saveTask, type Task } from "../../lib/task"
import AmbientScene from "../../components/AmbientScene"

type Preferences = {
  neurotypes?: string[]
  support?: string
}

function readPreferences(): Preferences {
  if (typeof window === "undefined") return {}
  try {
    const raw = window.localStorage.getItem("preferences")
    return raw ? (JSON.parse(raw) as Preferences) : {}
  } catch {
    return {}
  }
}

function getStats(tasks: Task[]) {
  if (tasks.length === 0) return { overallPct: 0, completed: 0, inProgress: 0 }
  const totalDone = tasks.reduce((s, t) => s + Number(t.progress.split("/")[0]), 0)
  const totalSteps = tasks.reduce((s, t) => s + Number(t.progress.split("/")[1]), 0)
  const overallPct = Math.round((totalDone / totalSteps) * 100)
  const completed = tasks.filter((t) => {
    const [d, tot] = t.progress.split("/").map(Number)
    return d === tot
  }).length
  const inProgress = tasks.length - completed
  return { overallPct, completed, inProgress }
}

function getGreeting() {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 12) return "👋 Good morning"
  if (hour >= 12 && hour < 17) return "☀️ Good afternoon"
  if (hour >= 17 && hour < 21) return "🌇 Good evening"
  return "🌙 Good night"
}

export default function MyTasksPage() {
  const router = useRouter()
  const [tasks, setTasks] = useState<Task[]>([])
  const [newTask, setNewTask] = useState("")
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const allTasks = readTasks()

    // ── Smart fix: use id timestamp to get real creation date ──
    const fixed = allTasks.map((t) => ({
      ...t,
      createdAt: t.createdAt || new Date(t.id).toDateString(),
      createdTimestamp: t.createdTimestamp || t.id,
    }))

    const hadMissing = allTasks.some((t) => !t.createdAt)
    if (hadMissing) {
      localStorage.setItem("userTasks", JSON.stringify(fixed))
    }

    setTasks(fixed)
  }, [])

  const { overallPct, completed, inProgress } = getStats(tasks)

  // ── Split into today vs previous ──
  const today = new Date().toDateString()
  const todayTasks = tasks.filter((t) => t.createdAt === today)
  const previousTasks = tasks.filter((t) => t.createdAt !== today)

  // ── Sort: incomplete first, completed last ──
  const sortGroup = (group: Task[]) =>
    [...group].sort((a, b) => {
      const [aDone, aTotal] = a.progress.split("/").map(Number)
      const [bDone, bTotal] = b.progress.split("/").map(Number)
      const aComplete = aDone === aTotal
      const bComplete = bDone === bTotal
      if (aComplete === bComplete) return 0
      return aComplete ? 1 : -1
    })

  const handleGenerate = async () => {
    const trimmed = newTask.trim()
    if (!trimmed || generating) return
    setError(null)
    setGenerating(true)

    const prefs = readPreferences()

    try {
      const res = await fetch("/api/generate-steps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: trimmed,
          neurotype: prefs.neurotypes,
          stepSize: prefs.support,
        }),
      })

      const data = (await res.json()) as
        | { title: string; steps: { text: string; duration: string }[] }
        | { error: string }

      if (!res.ok || "error" in data) {
        const raw = "error" in data ? data.error : `Request failed (${res.status})`
        const friendly =
          raw.length > 200 || raw.trim().startsWith("{")
            ? "Couldn't generate steps right now. Please try again."
            : raw
        setError(friendly)
        return
      }

      const newTaskObj = await saveTask(data.title, data.steps.length, data.steps)
      setTasks((prev) => [...prev, newTaskObj])

      sessionStorage.setItem(
        "currentTask",
        JSON.stringify({
          title: data.title,
          steps: data.steps,
          taskId: newTaskObj.id,
        }),
      )
      router.push("/taskinfo")
    } catch (e) {
      setError(e instanceof Error ? e.message : "Network error")
    } finally {
      setGenerating(false)
    }
  }

  const circumference = 2 * Math.PI * 36
  const dashOffset = circumference * (1 - overallPct / 100)

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 lg:ml-64 min-h-screen bg-slate-50 relative overflow-hidden">
        <AmbientScene variant="calm" opacity={0.35} />

        <div className="pointer-events-none fixed -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-indigo-200/30 blur-[100px]" />
        <div className="pointer-events-none fixed -bottom-20 -left-24 w-[380px] h-[380px] rounded-full bg-emerald-200/20 blur-[80px]" />

        <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12 pt-20 lg:pt-12">

          {/* ── Header ── */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <p className="text-sm text-slate-400 font-medium mb-1">{getGreeting()}</p>
              <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight leading-tight">
                My Tasks
              </h1>
              <p className="text-sm text-slate-400 mt-2">
                Track and manage all your daily tasks.
              </p>
            </div>

            {/* Progress Ring */}
            <div className="relative w-20 h-20 flex-shrink-0">
              <svg width="80" height="80" viewBox="0 0 88 88">
                <circle cx="44" cy="44" r="36" fill="none" stroke="#e2e8f0" strokeWidth="8" />
                <circle
                  cx="44" cy="44" r="36" fill="none"
                  stroke="url(#grad)" strokeWidth="8" strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={dashOffset}
                  transform="rotate(-90 44 44)"
                />
                <defs>
                  <linearGradient id="grad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#818cf8" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-base font-extrabold text-slate-800 leading-none">
                  {overallPct}%
                </span>
                <span className="text-[10px] text-slate-400 font-medium">done</span>
              </div>
            </div>
          </div>

          {/* ── Stats Strip ── */}
          <div className="bg-white rounded-2xl shadow-sm px-6 py-4 flex items-center justify-around mb-8">
            <div className="flex flex-col items-center gap-1">
              <span className="text-2xl font-extrabold text-indigo-500">{tasks.length}</span>
              <span className="text-xs text-slate-400 font-medium">Total Tasks</span>
            </div>
            <div className="w-px h-9 bg-slate-100" />
            <div className="flex flex-col items-center gap-1">
              <span className="text-2xl font-extrabold text-emerald-500">{completed}</span>
              <span className="text-xs text-slate-400 font-medium">Completed</span>
            </div>
            <div className="w-px h-9 bg-slate-100" />
            <div className="flex flex-col items-center gap-1">
              <span className="text-2xl font-extrabold text-amber-500">{inProgress}</span>
              <span className="text-xs text-slate-400 font-medium">In Progress</span>
            </div>
          </div>

          {/* ── New Task Input ── */}
          <div className="bg-white rounded-2xl shadow-sm p-5 mb-8 border border-indigo-100/70">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">✨</span>
              <h2 className="text-sm font-bold text-slate-700">
                Break a new task into steps
              </h2>
            </div>
            <p className="text-xs text-slate-400 mb-3">
              Type what you want to do. AI will split it into micro-steps tuned to your profile.
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleGenerate() }}
                disabled={generating}
                placeholder="e.g. Write the lab report"
                className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-400 disabled:opacity-60"
              />
              <button
                onClick={handleGenerate}
                disabled={generating || !newTask.trim()}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-blue-500 text-white text-sm font-semibold shadow-md shadow-indigo-200 hover:shadow-indigo-300 hover:-translate-y-0.5 transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
              >
                {generating ? "Generating…" : "Generate Steps"}
              </button>
            </div>
            {error && (
              <p className="mt-3 text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
                {error}
              </p>
            )}
          </div>

          {/* ── Empty State ── */}
          {tasks.length === 0 && (
            <p className="text-center text-slate-400 text-sm mt-10">
              No tasks yet. Add one above!
            </p>
          )}

          {/* ── Today's Tasks ── */}
          {todayTasks.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                  Today
                </span>
                <span className="bg-indigo-500 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                  {todayTasks.length}
                </span>
                <span className="text-[11px] text-slate-400 ml-1">{today}</span>
              </div>
              <div className="flex flex-col gap-3.5">
                {sortGroup(todayTasks).map((task, i) => (
                  <TaskCard
                    key={task.id}
                    title={task.title}
                    progress={task.progress}
                    index={i}
                    taskId={task.id}
                  />
                ))}
              </div>
            </div>
          )}

          {/* ── Previous Tasks grouped by date ── */}
          {previousTasks.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                  Previous
                </span>
                <span className="bg-slate-400 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                  {previousTasks.length}
                </span>
              </div>

              {/* Group by date — newest first */}
              {(() => {
                const dates = [
                  ...new Set(previousTasks.map((t) => t.createdAt))
                ].sort(
                  (a, b) => new Date(b).getTime() - new Date(a).getTime()
                )

                return dates.map((date) => {
                  const tasksOnDate = previousTasks.filter(
                    (t) => t.createdAt === date
                  )
                  return (
                    <div key={date} className="mb-6">
                      <p className="text-[11px] font-semibold text-slate-400 mb-3 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-slate-300 inline-block" />
                        {date}
                      </p>
                      <div className="flex flex-col gap-3.5">
                        {sortGroup(tasksOnDate).map((task, i) => (
                          <TaskCard
                            key={task.id}
                            title={task.title}
                            progress={task.progress}
                            index={i}
                            taskId={task.id}
                          />
                        ))}
                      </div>
                    </div>
                  )
                })
              })()}
            </div>
          )}

        </div>
      </div>
    </div>
  )
}