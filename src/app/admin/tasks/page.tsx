"use client"

import { useEffect, useState } from "react"
import { supabaseAdmin } from "../../../lib/supabase"

type Task = {
  id: number
  title: string
  progress: string
  steps?: { text: string; duration: string; completed: boolean }[]
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTasks = async () => {
      const { data, error } = await supabaseAdmin
        .from("tasks")
        .select("*")
        .order("created_timestamp", { ascending: false })

      if (error) {
        setError(error.message)
      } else {
        setTasks(data ?? [])
      }
      setLoading(false)
    }

    fetchTasks()
  }, [])

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Tasks</h1>
          <p className="text-slate-400 text-sm mt-1">All tasks created by users</p>
        </div>
        <span className="text-xs text-indigo-600 font-semibold bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-full">
          {tasks.length} total
        </span>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 px-4 py-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-sm">
          ⚠️ Error: {error}
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-6 py-12 text-center">
          <div className="w-6 h-6 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-400 text-sm">Loading tasks...</p>
        </div>
      ) : tasks.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-6 py-12 text-center">
          <p className="text-slate-400 text-sm">No tasks created yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {tasks.map((task, i) => {
            const [done, total] = task.progress.split("/").map(Number)
            const pct = Math.round((done / total) * 100)
            return (
              <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-slate-700">{task.title}</h3>
                  <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
                    {done}/{total} steps
                  </span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="text-xs text-slate-400 mt-2">{pct}% complete</p>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}