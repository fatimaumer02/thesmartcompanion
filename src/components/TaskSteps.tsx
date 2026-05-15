"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { updateTaskProgress } from "../lib/task"  // ← ADD this import
import Button3D from "./Button3D"

// ─── Types ────────────────────────────────────────────────────────────────────
type Step = {
  id: number
  text: string
  duration: string
  completed: boolean
  startedAt: number | null
}

// ─── Constants ────────────────────────────────────────────────────────────────
// If a step is completed in under this threshold, we treat it as a "quick win"
// and skip the cooldown entirely — the user didn't actually spend the
// estimated duration on it, so no need to throttle the next step.
const QUICK_COMPLETE_MS = 10_000

// ─── Helpers ──────────────────────────────────────────────────────────────────
function parseDurationMs(duration: string): number {
  const hrs  = duration.match(/(\d+)\s*h/i)
  const mins = duration.match(/(\d+)\s*m/i)
  const h = hrs  ? parseInt(hrs[1],  10) : 0
  const m = mins ? parseInt(mins[1], 10) : 0
  const total = (h * 60 + m) * 60 * 1000
  return total > 0 ? total : 15 * 60 * 1000
}

// ← UPDATED: now restores completed state from localStorage
function loadFromSession(): { title: string; steps: Step[]; taskId?: number } | null {
  if (typeof window === "undefined") return null
  try {
    const raw = window.sessionStorage.getItem("currentTask")
    if (!raw) return null
    const parsed = JSON.parse(raw) as {
      title?: string
      steps?: { text: string; duration: string }[]
      taskId?: number
    }
    if (!parsed.steps?.length || !parsed.title) return null

    // ← NEW: read completed state from localStorage userTasks
    let completedIds: number[] = []
    if (parsed.taskId) {
      const tasks = JSON.parse(localStorage.getItem("userTasks") ?? "[]")
      const savedTask = tasks.find((t: { id: number }) => t.id === parsed.taskId)
      if (savedTask?.steps) {
        completedIds = savedTask.steps
          .map((s: { completed: boolean }, i: number) => s.completed ? i + 1 : null)
          .filter(Boolean)
      }
    }

    return {
      title: parsed.title,
      taskId: parsed.taskId,
      steps: parsed.steps.map((s, i) => ({
        id: i + 1,
        text: s.text,
        duration: s.duration,
        completed: completedIds.includes(i + 1),  // ← restores checked state
        startedAt: null,
      })),
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
  const session = loadFromSession()

  useEffect(() => {
    if (!session) router.replace("/mytask")
  }, [])

  const title = session?.title ?? ""
  const taskId = session?.taskId
  const [steps, setSteps] = useState<Step[]>(session?.steps ?? [])

  const [activeStep, setActiveStep] = useState<number | null>(null)
  const [firstCompletedAt, setFirstCompletedAt] = useState<number | null>(null)
  const [unlocked, setUnlocked] = useState(false)
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const [completedStepDurationMs, setCompletedStepDurationMs] = useState<number>(15 * 60 * 1000)

  const [alertMsg, setAlertMsg] = useState<string | null>(null)
  const [showProgress, setShowProgress] = useState(false)
  const [activeStepTimeLeft, setActiveStepTimeLeft] = useState<number | null>(null)

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const stepTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const completedCount = steps.filter((s) => s.completed).length
  const progressPct = Math.round((completedCount / steps.length) * 100)

  // ── Step-duration countdown ───────────────────────────────────────────────
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

  // ── Per-step active countdown ─────────────────────────────────────────────
  useEffect(() => {
    clearInterval(stepTimerRef.current!)
    if (activeStep === null) {
      setActiveStepTimeLeft(null)
      return
    }
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

  // ← NEW: save progress to localStorage every time steps change
  useEffect(() => {
    if (!taskId || steps.length === 0) return
    updateTaskProgress(
      taskId,
      steps.filter((s) => s.completed).length,
      steps.length,
      steps.map((s) => ({
        text: s.text,
        duration: s.duration,
        completed: s.completed,
      }))
    )
  }, [steps, taskId])

  // ── Update localStorage progress (keep your existing function too) ────────
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
    } catch {}
  }, [taskId])

  const handleTap = useCallback(
    (id: number) => {
      const stepIndex = steps.findIndex((s) => s.id === id)
      const step = steps[stepIndex]
      if (!step) return

      if (step.completed) {
        // Cascade-uncheck: un-completing a step also un-completes every later
        // completed step. Otherwise we'd end up in an "out of order" state
        // (e.g. step 1 not done but step 2 done), which violates the
        // sequential constraint enforced below.
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
        const elapsed = step.startedAt ? Date.now() - step.startedAt : 0
        const updatedSteps = steps.map((s) =>
          s.id === id ? { ...s, completed: true } : s
        )
        setSteps(updatedSteps)
        setActiveStep(null)
        updateLocalStorageProgress(updatedSteps)
        // Only start the cooldown if this is the first real completion AND the
        // user actually spent meaningful time on it. Steps finished in <10s
        // are "quick wins" — let them keep moving without throttle.
        if (completedCount === 0 && elapsed >= QUICK_COMPLETE_MS) {
          setFirstCompletedAt(Date.now())
          setCompletedStepDurationMs(parseDurationMs(step.duration))
        }
        return
      }

      if (activeStep !== null) {
        setAlertMsg("Finish or uncheck your current active step before starting a new one.")
        return
      }

      // Sequential order: you can only start the next-up step. The first
      // incomplete step in the list is the only one allowed to activate.
      const firstIncompleteIndex = steps.findIndex((s) => !s.completed)
      if (firstIncompleteIndex !== -1 && stepIndex !== firstIncompleteIndex) {
        setAlertMsg(
          `Please complete step ${firstIncompleteIndex + 1} first. Steps must be done in order.`,
        )
        return
      }

      // Block only if a cooldown is actually running. If firstCompletedAt is
      // null, the previous completion was a quick win and didn't trigger one.
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
  const progressTitle =
    progressPct === 100 ? "All Done!" : progressPct >= 50 ? "Halfway There!" : "Just Starting!"
  const activeStepObj = steps.find((s) => s.id === activeStep)
  const progressMsg =
    progressPct === 100
      ? `Nicely done! All ${steps.length} steps complete.`
      : activeStepObj
      ? `${completedCount}/${steps.length} done. Working on: "${activeStepObj.text}"`
      : completedCount === 0
      ? `Tap any step to begin. ${steps.length} steps total.`
      : unlocked
      ? `${completedCount}/${steps.length} done. Multi-task mode is active!`
      : `${completedCount}/${steps.length} done.${timeLeft ? ` Next task unlocks in ${fmtTime(timeLeft)}.` : ""}`

  const canViewProgress = completedCount > 0 || activeStep !== null

  if (!session) return null

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-indigo-50 to-sky-100 flex items-start justify-center py-8 px-4 sm:px-6 lg:px-8">
      <div className="relative w-full max-w-6xl bg-blue-50 rounded-3xl overflow-hidden shadow-xl shadow-blue-200/60">

        {/* ── Header ────────────────────────────────────────────────────────── */}
        <div className="bg-white px-5 sm:px-8 pt-5 sm:pt-7 pb-4 sm:pb-5 border-b border-blue-100">
          <p className="text-[11px] font-semibold text-blue-400 uppercase tracking-widest mb-1">
            Task Breakdown
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/mytask")}
              className="w-8 h-8 rounded-full bg-blue-50 hover:bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-base transition-colors"
              aria-label="Back"
            >
              ←
            </button>

            <h1 className="flex-1 text-[17px] sm:text-xl lg:text-2xl font-bold text-blue-950">{title}</h1>

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

          <p className="text-[12px] text-blue-400 mt-1 ml-11">
            {steps.length} Steps{completedCount > 0 ? ` · ${completedCount} completed` : ""}
          </p>
        </div>

        {/* ── Progress bar ──────────────────────────────────────────────────── */}
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

        {/* ── Unlock banner ─────────────────────────────────────────────────── */}
        {firstCompletedAt && !unlocked && timeLeft !== null && (
          <div className="mx-4 sm:mx-8 mt-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 flex items-center gap-3">
            <span className="text-xl">⏱️</span>
            <div>
              <p className="text-[12px] font-bold text-amber-700">
                Next task unlocks in {fmtTime(timeLeft)}
              </p>
              <p className="text-[11px] text-amber-500">Complete your active step, then wait</p>
            </div>
          </div>
        )}

        {unlocked && completedCount > 0 && !steps.every((s) => s.completed) && (
          <div className="mx-4 sm:mx-8 mt-3 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5 flex items-center gap-3">
            <span className="text-xl">🎯</span>
            <p className="text-[12px] font-bold text-emerald-700">
              Multi-task unlocked! Work on 2 tasks simultaneously.
            </p>
          </div>
        )}

        {/* ── Steps list ────────────────────────────────────────────────────── */}
        <div className="px-4 sm:px-8 pt-3 sm:pt-5 pb-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
          {steps.map((step, i) => {
            const isActive = activeStep === step.id
            const isCompleted = step.completed
            const firstIncompleteIndex = steps.findIndex((s) => !s.completed)
            const isSequenceLocked =
              !isCompleted && !isActive && firstIncompleteIndex !== -1 && i !== firstIncompleteIndex
            const isLocked =
              isSequenceLocked ||
              (!isActive && !isCompleted && completedCount >= 1 && !unlocked && activeStep !== null)

            return (
              <button
                key={step.id}
                onClick={() => handleTap(step.id)}
                disabled={isLocked}
                className={[
                  "w-full flex items-center gap-3 rounded-2xl px-4 py-3.5 text-left transition-all duration-300",
                  "border focus:outline-none",
                  isCompleted
                    ? "bg--to-r from-emerald-50 to-green-50 border-emerald-300 shadow-sm shadow-emerald-100"
                    : isActive
                    ? "bg-linear-to-r from-blue-50 to-indigo-50 border-blue-400 shadow-md shadow-blue-100 scale-[1.015]"
                    : "bg-white border-blue-100 hover:border-blue-300 hover:shadow-sm",
                  isLocked ? "opacity-40 cursor-not-allowed" : "cursor-pointer",
                ].join(" ")}
              >
                <div
                  className={[
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 transition-all duration-300",
                    isCompleted
                      ? "bg-linear-to-br from-emerald-400 to-green-500 text-white shadow-md shadow-emerald-200"
                      : isActive
                      ? "bg-linear-to-br from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-200"
                      : "bg-blue-100 text-blue-600",
                  ].join(" ")}
                >
                  {isCompleted ? "✓" : i + 1}
                </div>

                <div className="flex-1 flex flex-col gap-0.5 min-w-0">
                  <span
                    className={[
                      "text-[13.5px] font-medium leading-snug",
                      isCompleted
                        ? "line-through text-emerald-500"
                        : isActive
                        ? "text-blue-900 font-semibold"
                        : "text-slate-700",
                    ].join(" ")}
                  >
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
                  <span
                    className={[
                      "text-[11px] font-bold rounded-full px-2.5 py-1 flex-shrink-0 whitespace-nowrap",
                      isCompleted
                        ? "bg-emerald-100 text-emerald-600"
                        : isActive
                        ? "bg-indigo-100 text-indigo-600 border border-indigo-200"
                        : "bg-slate-100 text-slate-500",
                    ].join(" ")}
                  >
                    {step.duration}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* ── View Progress button ───────────────────────────────────────────── */}
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
            <p className="text-center text-[11px] text-blue-400 mt-1.5">
              Start a task to enable progress view
            </p>
          )}
        </div>

        {/* ══ Alert Modal ══════════════════════════════════════════════════════ */}
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

        {/* ══ Progress Modal ═══════════════════════════════════════════════════ */}
        {showProgress && (
          <Overlay>
            <Modal>
              <div className="bg-linear-to-br from-blue-600 to-indigo-700 px-6 pt-6 pb-5 text-center">
                <div className="text-4xl mb-1">{progressIcon}</div>
                <h2 className="text-white font-bold text-lg">{progressTitle}</h2>
                <p className="text-blue-200 text-[12px] mt-1">{progressMsg}</p>
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
                  <div
                    key={s.id}
                    className="flex items-center gap-2.5 px-3 py-2.5 border-b border-blue-100 last:border-0"
                  >
                    <span className="text-sm">
                      {s.completed ? "✅" : activeStep === s.id ? "⏳" : "⬜"}
                    </span>
                    <span
                      className={[
                        "flex-1 text-[12px] font-medium",
                        s.completed ? "line-through text-emerald-500" : "text-slate-600",
                      ].join(" ")}
                    >
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
                    // When the task is fully done, take the user back to the
                    // dashboard instead of leaving them on a completed task page.
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