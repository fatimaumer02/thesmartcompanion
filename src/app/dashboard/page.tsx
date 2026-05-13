"use client"

import { Mic } from "lucide-react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import ProgressCard from "../../components/ProgressCard"
import TaskCard from "../../components/TaskCard"
import { readTasks, saveTask, type Task } from "../../lib/task"

type UserProfile = {
  name?: string
  email?: string
}

function readUserProfile(): UserProfile {
  if (typeof window === "undefined") return {}
  try {
    const raw = window.localStorage.getItem("userProfile")
    return raw ? (JSON.parse(raw) as UserProfile) : {}
  } catch {
    return {}
  }
}

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

export default function DashboardPage() {
  const router = useRouter()

  const [taskTitle, setTaskTitle] = useState("")
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [firstName, setFirstName] = useState("")
  const [tasks, setTasks] = useState<Task[]>([])

  // ── Load user profile + tasks from localStorage on mount ──
  useEffect(() => {
    const profile = readUserProfile()
    if (profile.name) {
      setFirstName(profile.name.trim().split(/\s+/)[0])
    }
    setTasks(readTasks())
  }, [])

  // ── Re-read tasks when user comes back to tab/page ──        ← REPLACED
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        setTasks(readTasks())
      }
    }
    document.addEventListener("visibilitychange", handleVisibility)
    return () => document.removeEventListener("visibilitychange", handleVisibility)
  }, [])

  const handleGenerate = async () => {
    const trimmed = taskTitle.trim()
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

      // ── Save task with steps to localStorage ──
      const newTask = saveTask(data.title, data.steps.length, data.steps)
      setTasks((prev) => [...prev, newTask])

      // ── Store in sessionStorage with taskId ──
      sessionStorage.setItem(
        "currentTask",
        JSON.stringify({
          title: data.title,
          steps: data.steps,
          taskId: newTask.id,
        }),
      )

      router.push("/taskinfo")
    } catch (e) {
      setError(e instanceof Error ? e.message : "Network error")
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 px-4 sm:px-6 py-6 sm:py-8">

      {/* Header */}
      <div className="flex justify-between items-center gap-4">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-semibold truncate">
            Good Morning{firstName ? `, ${firstName}` : ""} ☀️
          </h1>
          <p className="text-sm sm:text-base text-gray-500">
            Let&apos;s make today a productive day.
          </p>
        </div>
        <div className="w-10 h-10 rounded-full bg-blue-500 flex-0"></div>
      </div>

      {/* Input Card */}
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm">
        <p className="text-sm text-gray-600 mb-3">
          What would you like to get done?
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 flex items-center border rounded-lg px-4 py-2 focus-within:ring-2 focus-within:ring-blue-400">
            <input
              className="flex-1 outline-none disabled:opacity-60"
              placeholder="Example: Clean my room, Study math..."
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleGenerate()
              }}
              disabled={generating}
            />
            <button
              onClick={() => router.push("/voice-assistant")}
              className="ml-2 p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors"
              aria-label="Use voice input"
            >
              <Mic size={18} className="text-blue-600" />
            </button>
          </div>
          <button
            onClick={handleGenerate}
            disabled={generating || !taskTitle.trim()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg whitespace-nowrap hover:bg-blue-700 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
          >
            {generating ? "Generating…" : "Break into Steps"}
          </button>
        </div>
        {error && (
          <p className="mt-3 text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
            {error}
          </p>
        )}
      </div>

      {/* Progress */}
      <ProgressCard />

      {/* Tasks */}
      {tasks.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Today&apos;s Tasks</h2>
          {tasks.map((task, i) => (
            <TaskCard
              key={task.id}
              title={task.title}
              progress={task.progress}
              index={i}
              taskId={task.id}
            />
          ))}
        </div>
      )}

    </div>
  )
}