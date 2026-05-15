"use client"

import { motion, useReducedMotion } from "framer-motion"
import { useEffect, useState } from "react"
import { loadState, progressWithinLevel } from "../../lib/gamification"

type Props = {
  compact?: boolean
}

export default function XPBar({ compact = false }: Props) {
  const [xp, setXp] = useState(0)
  const reduce = useReducedMotion()

  useEffect(() => {
    const sync = () => setXp(loadState().totalXP)
    sync()
    const onEvent = () => sync()
    window.addEventListener("sc:gamification", onEvent)
    window.addEventListener("storage", onEvent)
    return () => {
      window.removeEventListener("sc:gamification", onEvent)
      window.removeEventListener("storage", onEvent)
    }
  }, [])

  const { level, currentInLevel, needed, pct } = progressWithinLevel(xp)

  return (
    <div
      className={[
        "relative rounded-2xl overflow-hidden border backdrop-blur",
        "bg-white/60 border-white/40 shadow-[0_4px_24px_rgba(99,102,241,0.18)]",
        compact ? "px-3 py-2" : "px-4 py-3",
      ].join(" ")}
    >
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-linear-to-br from-indigo-500 to-violet-600 text-white text-[11px] font-extrabold shadow shadow-indigo-400/40">
            {level}
          </span>
          <span className="text-[12px] font-bold uppercase tracking-wider text-slate-600">
            Level {level}
          </span>
        </div>
        <span className="text-[11px] font-semibold text-indigo-500 tabular-nums">
          {currentInLevel} / {needed} XP
        </span>
      </div>
      <div className="h-2 rounded-full bg-indigo-100/70 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct * 100}%` }}
          transition={{ duration: reduce ? 0 : 0.9, ease: [0.22, 0.9, 0.3, 1] }}
          className="h-full rounded-full bg-linear-to-r from-blue-500 via-indigo-500 to-violet-500 shadow-[0_0_12px_rgba(99,102,241,0.6)]"
        />
      </div>
    </div>
  )
}
