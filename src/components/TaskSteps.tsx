"use client"

import { useState, useEffect, useRef, useCallback } from "react"

// ─── Types ────────────────────────────────────────────────────────────────────
type Step = {
  id: number
  text: string
  duration: string
  completed: boolean
  startedAt: number | null
}

// ─── Constants ────────────────────────────────────────────────────────────────
const UNLOCK_AFTER_MS = 15 * 60 * 1000 // 15 minutes

const INITIAL_STEPS: Step[] = [
  { id: 1, text: "Pick up clothes from the floor", duration: "5 min", completed: false, startedAt: null },
  { id: 2, text: "Put clothes in laundry basket",  duration: "3 min", completed: false, startedAt: null },
  { id: 3, text: "Arrange books on the table",     duration: "7 min", completed: false, startedAt: null },
  { id: 4, text: "Make the bed",                   duration: "5 min", completed: false, startedAt: null },
  { id: 5, text: "Organize items in the drawers",  duration: "10 min", completed: false, startedAt: null },
  { id: 6, text: "Sweep the floor",                duration: "5 min", completed: false, startedAt: null },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmtTime(secs: number) {
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return `${m}:${s.toString().padStart(2, "0")}`
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function Overlay({ children }: { children: React.ReactNode }) {
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center rounded-3xl bg-blue-950/60 backdrop-blur-sm p-4">
      {children}
    </div>
  )
}

function Modal({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full max-w-xs bg-white rounded-2xl shadow-2xl shadow-blue-900/30 overflow-hidden">
      {children}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function TaskSteps() {
  const [steps, setSteps] = useState<Step[]>(INITIAL_STEPS)
  const [activeStep, setActiveStep] = useState<number | null>(null)
  const [firstCompletedAt, setFirstCompletedAt] = useState<number | null>(null)
  const [unlocked, setUnlocked] = useState(false)
  const [timeLeft, setTimeLeft] = useState<number | null>(null)

  // Modals
  const [alertMsg, setAlertMsg] = useState<string | null>(null)
  const [showProgress, setShowProgress] = useState(false)

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const completedCount = steps.filter((s) => s.completed).length
  const progressPct = Math.round((completedCount / steps.length) * 100)

  // ── 15-min countdown ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!firstCompletedAt || unlocked) return
    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - firstCompletedAt
      const rem = Math.max(0, Math.ceil((UNLOCK_AFTER_MS - elapsed) / 1000))
      setTimeLeft(rem)
      if (rem === 0) {
        setUnlocked(true)
        setTimeLeft(null)
        clearInterval(timerRef.current!)
      }
    }, 1000)
    return () => clearInterval(timerRef.current!)
  }, [firstCompletedAt, unlocked])

  // ── Tap handler ───────────────────────────────────────────────────────────
  const handleTap = useCallback(
    (id: number) => {
      const step = steps.find((s) => s.id === id)!

      // Uncheck completed
      if (step.completed) {
        setSteps((p) => p.map((s) => (s.id === id ? { ...s, completed: false, startedAt: null } : s)))
        if (activeStep === id) setActiveStep(null)
        return
      }

      // Tap active → complete it
      if (activeStep === id) {
        setSteps((p) => p.map((s) => (s.id === id ? { ...s, completed: true } : s)))
        setActiveStep(null)
        if (completedCount === 0) setFirstCompletedAt(Date.now())
        return
      }

      // Another step is active → block
      if (activeStep !== null) {
        setAlertMsg("Finish or uncheck your current active step before starting a new one.")
        return
      }

      // Completed ≥ 1 but not yet unlocked → block second task
      if (completedCount >= 1 && !unlocked) {
        setAlertMsg(
          timeLeft !== null
            ? `You can start a second task in ${fmtTime(timeLeft)}. Complete your current step first!`
            : "Please wait for the 15-minute timer to expire."
        )
        return
      }

      // Activate
      setActiveStep(id)
      setSteps((p) => p.map((s) => (s.id === id ? { ...s, startedAt: Date.now() } : s)))
    },
    [steps, activeStep, completedCount, unlocked, timeLeft]
  )

  // ── Progress modal data ───────────────────────────────────────────────────
  const progressIcon = progressPct === 100 ? "🎉" : progressPct >= 50 ? "💪" : "🚀"
  const progressTitle =
    progressPct === 100 ? "All Done!" : progressPct >= 50 ? "Halfway There!" : "Just Starting!"
  const activeStepObj = steps.find((s) => s.id === activeStep)
  const progressMsg =
    progressPct === 100
      ? `Your room is spotless! All ${steps.length} steps complete.`
      : activeStepObj
      ? `${completedCount}/${steps.length} done. Working on: "${activeStepObj.text}"`
      : completedCount === 0
      ? `Tap any step to begin. ${steps.length} steps total.`
      : unlocked
      ? `${completedCount}/${steps.length} done. Multi-task mode is active!`
      : `${completedCount}/${steps.length} done.${timeLeft ? ` Next task unlocks in ${fmtTime(timeLeft)}.` : ""}`

  const canViewProgress = completedCount > 0 || activeStep !== null

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-indigo-50 to-sky-100 flex items-start justify-center py-8 px-4">
      <div className="relative w-full max-w-sm bg-blue-50 rounded-3xl overflow-hidden shadow-xl shadow-blue-200/60">

        {/* ── Header ────────────────────────────────────────────────────────── */}
        <div className="bg-white px-5 pt-5 pb-4 border-b border-blue-100">
          {/* breadcrumb */}
          <p className="text-[11px] font-semibold text-blue-400 uppercase tracking-widest mb-1">
            6. Task Breakdown (Steps List)
          </p>
          <div className="flex items-center gap-3">
            {/* back arrow */}
            <button
              className="w-8 h-8 rounded-full bg-blue-50 hover:bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-base transition-colors"
              aria-label="Back"
            >
              ←
            </button>

            <h1 className="flex-1 text-[17px] font-bold text-blue-950">Clean my room</h1>

            {/* unlock badge */}
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
        <div className="px-5 pt-3 pb-1">
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
          <div className="mx-4 mt-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 flex items-center gap-3">
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
          <div className="mx-4 mt-3 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5 flex items-center gap-3">
            <span className="text-xl">🎯</span>
            <p className="text-[12px] font-bold text-emerald-700">
              Multi-task unlocked! Work on 2 tasks simultaneously.
            </p>
          </div>
        )}

        {/* ── Steps list ────────────────────────────────────────────────────── */}
        <div className="px-4 pt-3 pb-2 flex flex-col gap-2.5">
          {steps.map((step, i) => {
            const isActive = activeStep === step.id
            const isCompleted = step.completed
            const isLocked =
              !isActive && !isCompleted && completedCount >= 1 && !unlocked && activeStep !== null

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
                {/* Number / check bubble */}
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

                {/* Step text */}
                <span
                  className={[
                    "flex-1 text-[13.5px] font-medium leading-snug",
                    isCompleted
                      ? "line-through text-emerald-500"
                      : isActive
                      ? "text-blue-900 font-semibold"
                      : "text-slate-700",
                  ].join(" ")}
                >
                  {step.text}
                </span>

                {/* Duration / lock */}
                {isLocked ? (
                  <span className="text-base">🔒</span>
                ) : (
                  <span
                    className={[
                      "text-[11px] font-bold rounded-full px-2.5 py-1 flex-shrink-0",
                      isCompleted
                        ? "bg-emerald-100 text-emerald-600"
                        : isActive
                        ? "bg-blue-100 text-blue-700 border border-blue-200"
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
        <div className="px-4 pt-2 pb-6">
          <button
            onClick={() => canViewProgress && setShowProgress(true)}
            className={[
              "w-full py-4 rounded-2xl text-[15px] font-bold tracking-wide flex items-center justify-center gap-2 transition-all duration-200",
              canViewProgress
                ? "bg-linear-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-300/50 hover:from-blue-700 hover:to-indigo-700 active:scale-[0.98]"
                : "bg-blue-200 text-blue-400 cursor-not-allowed",
            ].join(" ")}
          >
            <span className="text-lg">📊</span>
            View Progress
          </button>
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
              {/* Top gradient band */}
              <div className="bg-linear-to-br from-blue-600 to-indigo-700 px-6 pt-6 pb-5 text-center">
                <div className="text-4xl mb-1">{progressIcon}</div>
                <h2 className="text-white font-bold text-lg">{progressTitle}</h2>
                <p className="text-blue-200 text-[12px] mt-1">{progressMsg}</p>
              </div>

              {/* Ring + percentage */}
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

              {/* Step list */}
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

              {/* Unlock info */}
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
                  onClick={() => setShowProgress(false)}
                  className="w-full bg-linear-to-r from-blue-600 to-indigo-600 text-white font-bold py-3.5 rounded-xl text-sm hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md shadow-blue-200"
                >
                  Close
                </button>
              </div>
            </Modal>
          </Overlay>
        )}
      </div>
    </div>
  )
}