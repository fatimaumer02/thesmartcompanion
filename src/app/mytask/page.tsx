"use client"

import Sidebar from "../../components/Sidebar"
import TaskCard from "../../components/TaskCard"

type Task = {
  id: number
  title: string
  progress: string
}

const tasks: Task[] = [
  { id: 1, title: "Clean my room", progress: "3/6" },
  { id: 2, title: "Study Math Chapter 5", progress: "1/4" },
  { id: 3, title: "Complete UI Design", progress: "5/8" },
  { id: 4, title: "Workout", progress: "2/5" },
]

function getStats(tasks: Task[]) {
  const totalDone = tasks.reduce(
    (s, t) => s + Number(t.progress.split("/")[0]),
    0
  )

  const totalSteps = tasks.reduce(
    (s, t) => s + Number(t.progress.split("/")[1]),
    0
  )

  const overallPct = Math.round((totalDone / totalSteps) * 100)

  const completed = tasks.filter((t) => {
    const [d, tot] = t.progress.split("/").map(Number)
    return d === tot
  }).length

  const inProgress = tasks.length - completed

  return { overallPct, completed, inProgress }
}

export default function MyTasksPage() {
  const { overallPct, completed, inProgress } = getStats(tasks)

  const circumference = 2 * Math.PI * 36
  const dashOffset = circumference * (1 - overallPct / 100)

  return (
    <div className="flex">

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 ml-64 min-h-screen bg-slate-50 relative overflow-hidden">

        {/* Background blobs */}
        <div className="pointer-events-none fixed -top-32 -right-32 w-500px h-500px rounded-full bg-indigo-200/30 blur-[100px]" />

        <div className="pointer-events-none fixed -bottom-20 -left-24 w-380px h-380px rounded-full bg-emerald-200/20 blur-[80px]" />

        <div className="relative z-10 max-w-2xl mx-auto px-6 py-12">

          {/* Header */}
          <div className="flex items-start justify-between mb-8">

            <div>
              <p className="text-sm text-slate-400 font-medium mb-1">
                👋 Good morning
              </p>

              <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight leading-tight">
                My Tasks
              </h1>

              <p className="text-sm text-slate-400 mt-2">
                Track and manage all your daily tasks.
              </p>
            </div>

            {/* Progress Ring */}
            <div className="relative w-20 h-20 flex-0">

              <svg width="80" height="80" viewBox="0 0 88 88">

                <circle
                  cx="44"
                  cy="44"
                  r="36"
                  fill="none"
                  stroke="#e2e8f0"
                  strokeWidth="8"
                />

                <circle
                  cx="44"
                  cy="44"
                  r="36"
                  fill="none"
                  stroke="url(#grad)"
                  strokeWidth="8"
                  strokeLinecap="round"
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

                <span className="text-[10px] text-slate-400 font-medium">
                  done
                </span>
              </div>
            </div>
          </div>

          {/* Stats Strip */}
          <div className="bg-white rounded-2xl shadow-sm px-6 py-4 flex items-center justify-around mb-8">

            <div className="flex flex-col items-center gap-1">
              <span className="text-2xl font-extrabold text-indigo-500">
                {tasks.length}
              </span>

              <span className="text-xs text-slate-400 font-medium">
                Total Tasks
              </span>
            </div>

            <div className="w-px h-9 bg-slate-100" />

            <div className="flex flex-col items-center gap-1">
              <span className="text-2xl font-extrabold text-emerald-500">
                {completed}
              </span>

              <span className="text-xs text-slate-400 font-medium">
                Completed
              </span>
            </div>

            <div className="w-px h-9 bg-slate-100" />

            <div className="flex flex-col items-center gap-1">
              <span className="text-2xl font-extrabold text-amber-500">
                {inProgress}
              </span>

              <span className="text-xs text-slate-400 font-medium">
                In Progress
              </span>
            </div>
          </div>

          {/* Section Label */}
          <div className="flex items-center gap-2 mb-4">

            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
              All Tasks
            </span>

            <span className="bg-indigo-500 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full">
              {tasks.length}
            </span>
          </div>

          {/* Task List */}
          <div className="flex flex-col gap-3.5">

            {tasks.map((task, i) => (
              <TaskCard
                key={task.id}
                title={task.title}
                progress={task.progress}
                index={i}
              />
            ))}

          </div>
        </div>
      </div>
    </div>
  )
}