"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { updateTaskProgress } from "../lib/task"
import Button3D from "./Button3D"
import {
  awardStepXP,
  awardTaskComplete,
  type Achievement,
} from "../lib/gamification"
import { useSoundFX } from "../lib/soundfx"
import XPBar from "./game/XPBar"
import StreakFlame from "./game/StreakFlame"
import ConfettiBurst from "./game/ConfettiBurst"
import AchievementToast from "./game/AchievementToast"
import XPFloater from "./game/XPFloater"
import MotivationalMessage from "./game/MotivationalMessage"

// ─── Types ────────────────────────────────────────────────────────────────────
type Step = {
  id: string
  text: string
  duration: string
  completed: boolean
  startedAt: number | null
}

// ─── Constants ────────────────────────────────────────────────────────────────
const QUICK_COMPLETE_MS = 10_000

// ─── Helpers ──────────────────────────────────────────────────────────────────
function parseDurationMs(duration: string): number {
  const hrs = duration.match(/(\d+)\s*h/i)
  const mins = duration.match(/(\d+)\s*m/i)
  const h = hrs ? parseInt(hrs[1], 10) : 0
  const m = mins ? parseInt(mins[1], 10) : 0
  const total = (h * 60 + m) * 60 * 1000
  return total > 0 ? total : 15 * 60 * 1000
}

function loadFromSession(): { title: string; steps: Step[]; taskId?: number } | null {
  if (typeof window === "undefined") return null
  try {
    const raw = window.sessionStorage.getItem("currentTask")
    if (!raw) return null
    const parsed = JSON.parse(raw) as {
      title?: string
      steps?: { text: string; duration: string }[]
      taskId?: number
      completedIds?: (string | number)[]
    }
    if (!parsed.steps?.length || !parsed.title) return null

    let completedIds: string[] = []
    if (parsed.taskId) {
      const tasks = JSON.parse(localStorage.getItem("userTasks") ?? "[]")
      const savedTask = tasks.find((t: { id: number }) => t.id === parsed.taskId)
      if (savedTask?.steps) {
        completedIds = savedTask.steps
          .map((s: { completed: boolean }, i: number) => (s.completed ? String(i + 1) : null))
          .filter(Boolean) as string[]
      }
    }

    const sessionCompletedIds = Array.isArray(parsed.completedIds)
      ? parsed.completedIds.map(String)
      : []

    return {
      title: parsed.title,
      taskId: parsed.taskId,
      steps: parsed.steps.map((s, i) => {
        const id = String(i + 1)
        return {
          id,
          text: s.text,
          duration: s.duration,
          completed: sessionCompletedIds.includes(id) || completedIds.includes(id),
          startedAt: null,
        }
      }),
    }
  } catch {
    return null
  }
}

function fmtTime(secs: number) {
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return `${m}:${s.toString().padStart(2, "0")}`
}

function isTopLevelStepId(id: string): boolean {
  return !id.includes(".")
}

function formatStepLabel(id: string): string {
  return id
}

type TaskSession = { title: string; steps: Step[]; taskId?: number }

function TaskStepsLoading() {
  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-indigo-50 to-sky-100 flex items-center justify-center py-8 px-4">
      <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function Overlay({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-blue-950/60 backdrop-blur-sm p-4 overflow-y-auto">
      {children}
    </div>
  )
}

function Modal({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full max-w-sm sm:max-w-md bg-white rounded-2xl shadow-2xl shadow-blue-900/30 overflow-hidden my-auto">
      {children}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function TaskSteps() {
  const router = useRouter()
  const [session, setSession] = useState<TaskSession | null>(null)
  const [steps, setSteps] = useState<Step[]>([])

  useEffect(() => {
    const loaded = loadFromSession()
    if (!loaded) {
      router.replace("/mytask")
      return
    }
    setSession(loaded)
    setSteps(loaded.steps)
  }, [router])

  const title = session?.title ?? ""
  const taskId = session?.taskId

  const [activeStep, setActiveStep] = useState<string | null>(null)
  const [firstCompletedAt, setFirstCompletedAt] = useState<number | null>(null)
  const [unlocked, setUnlocked] = useState(false)
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const [completedStepDurationMs, setCompletedStepDurationMs] = useState<number>(15 * 60 * 1000)

  const [alertMsg, setAlertMsg] = useState<string | null>(null)
  const [showProgress, setShowProgress] = useState(false)
  const [activeStepTimeLeft, setActiveStepTimeLeft] = useState<number | null>(null)
  const [compliment, setCompliment] = useState<string | null>(null)
  const [complimentLoading, setComplimentLoading] = useState(false)

  // ── NEW: Step action popup state ──────────────────────────────────────────
  const [stepPopup, setStepPopup] = useState<Step | null>(null)
  const [breakingDown, setBreakingDown] = useState(false)

  const [confettiActive, setConfettiActive] = useState(false)
  const [achievementQueue, setAchievementQueue] = useState<Achievement[]>([])
  const [xpFloaters, setXpFloaters] = useState<Record<string, number>>({})
  const taskCompletionAwardedRef = useRef(false)
  const playSound = useSoundFX()

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const stepTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const completedCount = steps.filter((s) => s.completed).length
  const progressPct = steps.length > 0 ? Math.round((completedCount / steps.length) * 100) : 0

  useEffect(() => {
    if (progressPct !== 100) {
      taskCompletionAwardedRef.current = false
      return
    }
    if (taskCompletionAwardedRef.current) return
    taskCompletionAwardedRef.current = true
    const award = awardTaskComplete()
    setConfettiActive(true)
    if (award.unlocked.length > 0) setAchievementQueue((q) => [...q, ...award.unlocked])
    playSound("complete")
    if (award.leveledUp) playSound("levelup")
    const id = window.setTimeout(() => setConfettiActive(false), 2400)
    return () => window.clearTimeout(id)
  }, [progressPct, playSound])

  useEffect(() => {
    if (progressPct !== 100) return
    if (compliment || complimentLoading) return
    if (!title) return
    setComplimentLoading(true)
    let cancelled = false
    const fetchCompliment = async () => {
      try {
        let neurotype: string[] | undefined
        try {
          const raw = localStorage.getItem("preferences")
          if (raw) {
            const parsed = JSON.parse(raw) as { neurotypes?: string[] }
            neurotype = parsed.neurotypes
          }
        } catch { }
        const res = await fetch("/api/generate-compliment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, stepCount: steps.length, neurotype }),
        })
        const data = (await res.json()) as { compliment: string } | { error: string }
        if (cancelled) return
        if (res.ok && "compliment" in data) setCompliment(data.compliment)
      } catch {
      } finally {
        if (!cancelled) setComplimentLoading(false)
      }
    }
    fetchCompliment()
    return () => { cancelled = true }
  }, [progressPct, compliment, complimentLoading, title, steps.length])

  useEffect(() => {
    if (!firstCompletedAt || unlocked) return
    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - firstCompletedAt
      const rem = Math.max(0, Math.ceil((completedStepDurationMs - elapsed) / 1000))
      setTimeLeft(rem)
      if (rem === 0) {
        setUnlocked(true)
        setTimeLeft(null)
        clearInterval(timerRef.current!)
      }
    }, 1000)
    return () => clearInterval(timerRef.current!)
  }, [firstCompletedAt, unlocked, completedStepDurationMs])

  useEffect(() => {
    clearInterval(stepTimerRef.current!)
    if (activeStep === null) { setActiveStepTimeLeft(null); return }
    const activeStepObj = steps.find((s) => s.id === activeStep)
    if (!activeStepObj?.startedAt) return
    const durationMs = parseDurationMs(activeStepObj.duration)
    const tick = () => {
      const elapsed = Date.now() - activeStepObj.startedAt!
      const rem = Math.max(0, Math.ceil((durationMs - elapsed) / 1000))
      setActiveStepTimeLeft(rem)
    }
    tick()
    stepTimerRef.current = setInterval(tick, 1000)
    return () => clearInterval(stepTimerRef.current!)
  }, [activeStep, steps])

  useEffect(() => {
    if (!taskId || steps.length === 0) return
    updateTaskProgress(
      taskId,
      steps.filter((s) => s.completed).length,
      steps.length,
      steps.map((s) => ({ text: s.text, duration: s.duration, completed: s.completed }))
    )
  }, [steps, taskId])

  const updateLocalStorageProgress = useCallback((updatedSteps: Step[]) => {
    try {
      const raw = sessionStorage.getItem("currentTask")
      if (raw) {
        const parsed = JSON.parse(raw)
        parsed.completedIds = updatedSteps.filter((s) => s.completed).map((s) => s.id)
        sessionStorage.setItem("currentTask", JSON.stringify(parsed))
      }
      if (taskId === undefined) return
      const tasks = JSON.parse(localStorage.getItem("userTasks") || "[]")
      const newDone = updatedSteps.filter((s) => s.completed).length
      const total = updatedSteps.length
      const updated = tasks.map((t: { id: number; progress: string }) =>
        t.id === taskId ? { ...t, progress: `${newDone}/${total}` } : t
      )
      localStorage.setItem("userTasks", JSON.stringify(updated))
    } catch { }
  }, [taskId])

  // ── NEW: Complete a step from popup ───────────────────────────────────────
  const handleCompleteStep = useCallback((step: Step) => {
    setStepPopup(null)
    const stepIndex = steps.findIndex((s) => s.id === step.id)
    const elapsed = step.startedAt ? Date.now() - step.startedAt : 0
    const updatedSteps = steps.map((s) =>
      s.id === step.id ? { ...s, completed: true } : s
    )
    setSteps(updatedSteps)
    setActiveStep(null)
    updateLocalStorageProgress(updatedSteps)

    const award = awardStepXP()
    setXpFloaters((prev) => ({ ...prev, [step.id]: award.xpGained }))
    if (award.unlocked.length > 0) {
      setAchievementQueue((q) => [...q, ...award.unlocked])
      playSound("achievement")
    }
    if (award.leveledUp) playSound("levelup")
    else playSound("step")

    if (completedCount === 0 && elapsed >= QUICK_COMPLETE_MS) {
      setFirstCompletedAt(Date.now())
      setCompletedStepDurationMs(parseDurationMs(step.duration))
    }
  }, [steps, completedCount, updateLocalStorageProgress, playSound])

  // ── NEW: Break step into subtasks ─────────────────────────────────────────
  const handleBreakDown = useCallback(async (step: Step) => {
    setBreakingDown(true)
    try {
      let neurotype: string[] | undefined
      try {
        const raw = localStorage.getItem("preferences")
        if (raw) neurotype = (JSON.parse(raw) as { neurotypes?: string[] }).neurotypes
      } catch { }

      const res = await fetch("/api/generate-steps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: step.text,
          neurotype,
          stepSize: "small",
        }),
      })

      const data = await res.json() as
        | { title: string; steps: { text: string; duration: string }[] }
        | { error: string }

      if (!res.ok || "error" in data) {
        setAlertMsg("Couldn't break this step down. Please try again.")
        setBreakingDown(false)
        return
      }

      setSteps((prev) => {
        const idx = prev.findIndex((s) => s.id === step.id)
        if (idx === -1) return prev

        const subtasks: Step[] = data.steps.map((s, i) => ({
          id: `${step.id}.${i + 1}`,
          text: s.text,
          duration: s.duration,
          completed: false,
          startedAt: null,
        }))

        const next = [...prev]
        next.splice(idx, 1, ...subtasks)
        return next
      })
      setActiveStep(null)
      setStepPopup(null)
    } catch {
      setAlertMsg("Something went wrong. Please try again.")
    } finally {
      setBreakingDown(false)
    }
  }, [])

  const handleTap = useCallback(
    (id: string) => {
      const stepIndex = steps.findIndex((s) => s.id === id)
      const step = steps[stepIndex]
      if (!step) return

      if (step.completed) {
        const updatedSteps = steps.map((s, i) =>
          i >= stepIndex && s.completed
            ? { ...s, completed: false, startedAt: null }
            : s
        )
        setSteps(updatedSteps)
        updateLocalStorageProgress(updatedSteps)
        if (activeStep === id) setActiveStep(null)
        return
      }

      if (activeStep === id) {
        // ── Show popup instead of directly completing ──────────────────────
        setStepPopup(step)
        return
      }

      if (activeStep !== null) {
        setAlertMsg("Finish or uncheck your current active step before starting a new one.")
        return
      }

      const firstIncompleteIndex = steps.findIndex((s) => !s.completed)
      if (firstIncompleteIndex !== -1 && stepIndex !== firstIncompleteIndex) {
        setAlertMsg(`Please complete step ${firstIncompleteIndex + 1} first. Steps must be done in order.`)
        return
      }

      if (completedCount >= 1 && !unlocked && firstCompletedAt !== null) {
        setAlertMsg(
          timeLeft !== null
            ? `You can start a second task in ${fmtTime(timeLeft)}. Complete your current step first!`
            : "Please wait for the cooldown to expire."
        )
        return
      }

      setActiveStep(id)
      setSteps((p) => p.map((s) => (s.id === id ? { ...s, startedAt: Date.now() } : s)))
    },
    [steps, activeStep, completedCount, unlocked, timeLeft, completedStepDurationMs, firstCompletedAt, updateLocalStorageProgress]
  )

  const progressIcon = progressPct === 100 ? "🎉" : progressPct >= 50 ? "💪" : "🚀"
  const progressTitle = progressPct === 100 ? "All Done!" : progressPct >= 50 ? "Halfway There!" : "Just Starting!"
  const activeStepObj = steps.find((s) => s.id === activeStep)
  const progressMsg =
    progressPct === 100
      ? compliment ?? (complimentLoading ? "Composing a note for you…" : `Nicely done. All ${steps.length} steps complete.`)
      : activeStepObj
        ? `${completedCount}/${steps.length} done. Working on: "${activeStepObj.text}"`
        : completedCount === 0
          ? `Tap any step to begin. ${steps.length} steps total.`
          : unlocked
            ? `${completedCount}/${steps.length} done. Multi-task mode is active!`
            : `${completedCount}/${steps.length} done.${timeLeft ? ` Next task unlocks in ${fmtTime(timeLeft)}.` : ""}`

  const canViewProgress = completedCount > 0 || activeStep !== null

  if (!session) return <TaskStepsLoading />

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-indigo-50 to-sky-100 flex items-start justify-center py-8 px-4 sm:px-6 lg:px-8">
      <ConfettiBurst active={confettiActive} />
      <AchievementToast achievements={achievementQueue} />
      <div className="relative w-full max-w-6xl bg-blue-50 rounded-3xl overflow-hidden shadow-xl shadow-blue-200/60">

        {/* ── Header ── */}
        <div className="bg-white px-5 sm:px-8 pt-5 sm:pt-7 pb-4 sm:pb-5 border-b border-blue-100">
          <p className="text-[11px] font-semibold text-blue-400 uppercase tracking-widest mb-1">Task Breakdown</p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/mytask")}
              className="w-8 h-8 rounded-full bg-blue-50 hover:bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-base transition-colors"
              aria-label="Back"
            >←</button>
            <h1 className="flex-1 text-[17px] sm:text-xl lg:text-2xl font-bold text-blue-950">{title}</h1>
            <StreakFlame />
            {activeStep !== null && activeStepTimeLeft !== null && (
              <span className="text-[13px] font-extrabold tabular-nums text-white bg-orange-500 border border-orange-400 rounded-full px-3 py-1 shadow-md shadow-orange-200 animate-pulse">
                ⏱ {fmtTime(activeStepTimeLeft)}
              </span>
            )}
            {firstCompletedAt && !unlocked && timeLeft !== null && (
              <span className="text-[11px] font-bold text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-2.5 py-1">
                🔒 {fmtTime(timeLeft)}
              </span>
            )}
            {unlocked && completedCount > 0 && (
              <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-1">
                🔓 Unlocked
              </span>
            )}
          </div>
          <div className="flex items-center justify-between gap-3 mt-1 ml-11">
            <p className="text-[12px] text-blue-400">
              {steps.length} Steps{completedCount > 0 ? ` · ${completedCount} completed` : ""}
            </p>
            <MotivationalMessage progressPct={progressPct} className="hidden sm:block w-44 text-right" />
          </div>
          <div className="mt-3"><XPBar /></div>
        </div>

        {/* ── Progress bar ── */}
        <div className="px-5 sm:px-8 pt-3 sm:pt-4 pb-1">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-[11px] font-medium text-blue-400">Progress</span>
            <span className="text-[11px] font-bold text-blue-600">{progressPct}%</span>
          </div>
          <div className="h-1.5 bg-blue-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-linear-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-700"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* ── Banners ── */}
        {firstCompletedAt && !unlocked && timeLeft !== null && (
          <div className="mx-4 sm:mx-8 mt-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 flex items-center gap-3">
            <span className="text-xl">⏱️</span>
            <div>
              <p className="text-[12px] font-bold text-amber-700">Next task unlocks in {fmtTime(timeLeft)}</p>
              <p className="text-[11px] text-amber-500">Complete your active step, then wait</p>
            </div>
          </div>
        )}
        {unlocked && completedCount > 0 && !steps.every((s) => s.completed) && (
          <div className="mx-4 sm:mx-8 mt-3 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5 flex items-center gap-3">
            <span className="text-xl">🎯</span>
            <p className="text-[12px] font-bold text-emerald-700">Multi-task unlocked! Work on 2 tasks simultaneously.</p>
          </div>
        )}

        {/* ── Steps list ── */}
        <div className="px-4 sm:px-8 pt-3 sm:pt-5 pb-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
          {steps.map((step, i) => {
            const isActive = activeStep === step.id
            const isCompleted = step.completed
            const firstIncompleteIndex = steps.findIndex((s) => !s.completed)
            const isSequenceLocked = !isCompleted && !isActive && firstIncompleteIndex !== -1 && i !== firstIncompleteIndex
            const isLocked = isSequenceLocked || (!isActive && !isCompleted && completedCount >= 1 && !unlocked && activeStep !== null)

            return (
              <button
                key={step.id}
                onClick={() => handleTap(step.id)}
                disabled={isLocked}
                className={[
                  "relative w-full flex items-center gap-3 rounded-2xl px-4 py-3.5 text-left transition-all duration-300",
                  "border focus:outline-none overflow-hidden",
                  isCompleted
                    ? "bg-linear-to-r from-emerald-50 to-green-50 border-emerald-300 shadow-[0_0_22px_rgba(16,185,129,0.18)]"
                    : isActive
                      ? "bg-linear-to-r from-blue-50 to-indigo-50 border-blue-400 shadow-[0_0_28px_rgba(99,102,241,0.25)] scale-[1.015]"
                      : "bg-white border-blue-100 hover:border-blue-300 hover:shadow-md hover:shadow-blue-100/60 hover:-translate-y-0.5 hover:scale-[1.01]",
                  isLocked ? "opacity-40 cursor-not-allowed" : "cursor-pointer",
                ].join(" ")}
              >
                <XPFloater
                  stepId={step.id}
                  amount={xpFloaters[step.id] ?? null}
                  onDone={() =>
                    setXpFloaters((prev) => {
                      if (!(step.id in prev)) return prev
                      const next = { ...prev }
                      delete next[step.id]
                      return next
                    })
                  }
                />
                <div className={[
                  "min-w-[2rem] h-8 px-2 rounded-full flex items-center justify-center font-bold flex-shrink-0 transition-all duration-300",
                  isTopLevelStepId(step.id) ? "w-8 text-sm" : "text-[11px] tracking-tight",
                  isCompleted
                    ? "bg-linear-to-br from-emerald-400 to-green-500 text-white shadow-md shadow-emerald-200"
                    : isActive
                      ? "bg-linear-to-br from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-200"
                      : "bg-blue-100 text-blue-600",
                ].join(" ")}>
                  {isCompleted ? "✓" : formatStepLabel(step.id)}
                </div>

                <div className="flex-1 flex flex-col gap-0.5 min-w-0">
                  <span className={[
                    "text-[13.5px] font-medium leading-snug",
                    isCompleted ? "line-through text-emerald-500" : isActive ? "text-blue-900 font-semibold" : "text-slate-700",
                  ].join(" ")}>
                    {step.text}
                  </span>
                  {isActive && activeStepTimeLeft !== null && (
                    <span className="text-[12px] font-bold tabular-nums text-orange-500 tracking-wide">
                      ⏱ {fmtTime(activeStepTimeLeft)}
                    </span>
                  )}
                </div>

                {isLocked ? (
                  <span className="text-base">🔒</span>
                ) : (
                  <span className={[
                    "text-[11px] font-bold rounded-full px-2.5 py-1 flex-shrink-0 whitespace-nowrap",
                    isCompleted ? "bg-emerald-100 text-emerald-600"
                      : isActive ? "bg-indigo-100 text-indigo-600 border border-indigo-200"
                        : "bg-slate-100 text-slate-500",
                  ].join(" ")}>
                    {step.duration}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* ── View Progress button ── */}
        <div className="px-4 sm:px-8 pt-3 sm:pt-5 pb-6 sm:pb-8 max-w-md mx-auto w-full">
          <Button3D
            onClick={() => canViewProgress && setShowProgress(true)}
            disabled={!canViewProgress}
            shadowColor={canViewProgress ? "indigo" : "slate"}
            className={[
              "w-full py-4 rounded-2xl text-[15px] font-bold tracking-wide flex items-center justify-center gap-2",
              canViewProgress
                ? "bg-linear-to-r from-blue-600 to-indigo-600 text-white"
                : "bg-blue-200 text-blue-400 cursor-not-allowed",
            ].join(" ")}
          >
            <span className="text-lg">📊</span>
            View Progress
          </Button3D>
          {!canViewProgress && (
            <p className="text-center text-[11px] text-blue-400 mt-1.5">Start a task to enable progress view</p>
          )}
        </div>

        {/* ══ Alert Modal ══ */}
        {alertMsg && (
          <Overlay>
            <Modal>
              <div className="bg-linear-to-br from-blue-600 to-indigo-700 px-6 pt-6 pb-5 text-center">
                <div className="text-4xl mb-2">⚠️</div>
                <h2 className="text-white font-bold text-lg">Hold on!</h2>
              </div>
              <div className="px-6 py-5 text-center">
                <p className="text-slate-600 text-[13px] leading-relaxed mb-5">{alertMsg}</p>
                <button
                  onClick={() => setAlertMsg(null)}
                  className="w-full bg-linear-to-r from-blue-600 to-indigo-600 text-white font-bold py-3 rounded-xl text-sm hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md shadow-blue-200"
                >
                  Got it
                </button>
              </div>
            </Modal>
          </Overlay>
        )}

        {/* ══ NEW: Step Action Popup ══ */}
        {stepPopup && (
          <Overlay>
            <Modal>
              {/* Header */}
              <div className="bg-linear-to-br from-blue-600 to-indigo-700 px-6 pt-6 pb-5 text-center">
                <div className="text-4xl mb-2">🎯</div>
                <h2 className="text-white font-bold text-lg">How did it go?</h2>
                <p className="text-blue-200 text-[12px] mt-1 leading-relaxed px-2">
                  {stepPopup.text}
                </p>
              </div>

              <div className="px-6 py-5 flex flex-col gap-3">
                <p className="text-center text-slate-500 text-[12px] mb-1">
                  Was this step manageable or too difficult?
                </p>

                {/* Complete button */}
                <button
                  onClick={() => handleCompleteStep(stepPopup)}
                  className="w-full bg-linear-to-r from-emerald-500 to-green-600 text-white font-bold py-3.5 rounded-xl text-sm hover:from-emerald-600 hover:to-green-700 transition-all shadow-md shadow-emerald-200 flex items-center justify-center gap-2"
                >
                  <span className="text-lg">✅</span>
                  Complete — I did it!
                </button>

                {/* Too Hard button */}
                <button
                  onClick={() => handleBreakDown(stepPopup)}
                  disabled={breakingDown}
                  className="w-full bg-linear-to-r from-amber-400 to-orange-500 text-white font-bold py-3.5 rounded-xl text-sm hover:from-amber-500 hover:to-orange-600 transition-all shadow-md shadow-amber-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {breakingDown ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Breaking it down…
                    </>
                  ) : (
                    <>
                      <span className="text-lg">🧩</span>
                      Too Hard — Break it down
                    </>
                  )}
                </button>

                {/* Cancel */}
                <button
                  onClick={() => setStepPopup(null)}
                  className="w-full text-slate-400 text-sm font-medium py-2 hover:text-slate-600 transition-colors"
                >
                  Cancel — Keep working
                </button>
              </div>
            </Modal>
          </Overlay>
        )}

        {/* ══ Progress Modal ══ */}
        {showProgress && (
          <Overlay>
            <Modal>
              <div className="bg-linear-to-br from-blue-600 to-indigo-700 px-6 pt-6 pb-5 text-center">
                <div className="text-4xl mb-1">{progressIcon}</div>
                <h2 className="text-white font-bold text-lg">{progressTitle}</h2>
                <p className="text-blue-200 text-[12px] mt-1">{progressMsg}</p>
                {progressPct === 100 && (
                  <div className="mt-4 mx-auto max-w-[20rem] bg-white/15 border border-white/20 backdrop-blur rounded-xl px-4 py-3">
                    {complimentLoading && !compliment ? (
                      <div className="flex items-center justify-center gap-2 py-1">
                        <span className="w-3.5 h-3.5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                        <span className="text-[12px] text-blue-100 font-medium">Finding the right words…</span>
                      </div>
                    ) : (
                      <p className="text-[13px] text-white leading-relaxed font-medium" style={{ fontStyle: "italic" }}>
                        "{compliment ?? "Nicely done. The hard part was starting, and you started."}"
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="flex justify-center pt-5 pb-2">
                <div className="relative w-20 h-20">
                  <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                    <circle cx="40" cy="40" r="32" fill="none" stroke="#DBEAFE" strokeWidth="8" />
                    <circle
                      cx="40" cy="40" r="32" fill="none"
                      stroke="url(#grad)" strokeWidth="8" strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 32}`}
                      strokeDashoffset={`${2 * Math.PI * 32 * (1 - progressPct / 100)}`}
                    />
                    <defs>
                      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#3B82F6" />
                        <stop offset="100%" stopColor="#6366F1" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-blue-800 font-extrabold text-lg">{progressPct}%</span>
                  </div>
                </div>
              </div>

              <div className="mx-4 mb-3 bg-blue-50 rounded-xl overflow-hidden border border-blue-100">
                {steps.map((s) => (
                  <div key={s.id} className="flex items-center gap-2.5 px-3 py-2.5 border-b border-blue-100 last:border-0">
                    <span className="text-sm">{s.completed ? "✅" : activeStep === s.id ? "⏳" : "⬜"}</span>
                    <span className={["flex-1 text-[12px] font-medium", s.completed ? "line-through text-emerald-500" : "text-slate-600"].join(" ")}>
                      {s.text}
                    </span>
                    <span className="text-[11px] text-blue-400">{s.duration}</span>
                  </div>
                ))}
              </div>

              {unlocked && (
                <div className="mx-4 mb-3 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2 text-[12px] text-emerald-700 font-medium">
                  🔓 Multi-task mode active — work on 2 tasks at once!
                </div>
              )}
              {!unlocked && timeLeft !== null && (
                <div className="mx-4 mb-3 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 text-[12px] text-amber-700 font-medium">
                  ⏱️ Second task unlocks in {fmtTime(timeLeft)}
                </div>
              )}

              <div className="px-4 pb-5">
                <button
                  onClick={() => {
                    setShowProgress(false)
                    if (progressPct === 100) router.push("/dashboard")
                  }}
                  className="w-full bg-linear-to-r from-blue-600 to-indigo-600 text-white font-bold py-3.5 rounded-xl text-sm hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md shadow-blue-200"
                >
                  {progressPct === 100 ? "Back to Dashboard" : "Close"}
                </button>
              </div>
            </Modal>
          </Overlay>
        )}

      </div>
    </div>
  )
}