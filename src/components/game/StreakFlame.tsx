"use client"

import { motion, useReducedMotion } from "framer-motion"
import { useEffect, useState } from "react"
import { loadState, streakDisplay } from "../../lib/gamification"

export default function StreakFlame() {
  const [state, setState] = useState({ count: 0, paused: false })
  const reduce = useReducedMotion()

  useEffect(() => {
    const sync = () => setState(streakDisplay(loadState()))
    sync()
    const onEvent = () => sync()
    window.addEventListener("sc:gamification", onEvent)
    window.addEventListener("storage", onEvent)
    return () => {
      window.removeEventListener("sc:gamification", onEvent)
      window.removeEventListener("storage", onEvent)
    }
  }, [])

  const cold = state.paused || state.count === 0

  return (
    <div
      className={[
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border backdrop-blur text-[12px] font-semibold tabular-nums",
        cold
          ? "bg-slate-100/70 border-slate-200 text-slate-500"
          : "bg-amber-50/80 border-amber-200 text-amber-700 shadow-[0_0_18px_rgba(251,191,36,0.35)]",
      ].join(" ")}
      title={
        state.count === 0
          ? "No streak yet — finish one task today to start one."
          : state.paused
          ? "Streak paused — pick it up whenever you're ready."
          : `${state.count} day streak`
      }
    >
      <motion.span
        animate={cold || reduce ? { y: 0 } : { y: [0, -1.5, 0], rotate: [0, -2, 2, 0] }}
        transition={{ duration: 1.4, repeat: cold || reduce ? 0 : Infinity, ease: "easeInOut" }}
        className="text-[15px] leading-none"
        aria-hidden
      >
        {cold ? "🌙" : "🔥"}
      </motion.span>
      <span>{state.count}</span>
    </div>
  )
}
