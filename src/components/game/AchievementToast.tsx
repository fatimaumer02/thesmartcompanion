"use client"

import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { useEffect, useRef, useState } from "react"
import type { Achievement } from "../../lib/gamification"

type QueueItem = Achievement & { key: number }

type Props = {
  achievements: Achievement[]
}

// Slide-in toast stack. Achievements queue so multiple unlocks at once don't
// stomp each other.
export default function AchievementToast({ achievements }: Props) {
  const [queue, setQueue] = useState<QueueItem[]>([])
  const reduce = useReducedMotion()
  const nextKeyRef = useRef(0)

  useEffect(() => {
    if (achievements.length === 0) return
    const stamped = achievements.map((a) => ({
      ...a,
      key: ++nextKeyRef.current,
    }))
    setQueue((q) => [...q, ...stamped])
  }, [achievements])

  useEffect(() => {
    if (queue.length === 0) return
    const id = window.setTimeout(() => {
      setQueue((q) => q.slice(1))
    }, 4200)
    return () => window.clearTimeout(id)
  }, [queue])

  return (
    <div className="fixed top-5 right-5 z-[70] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {queue.slice(0, 3).map((a) => (
          <motion.div
            key={a.key}
            initial={reduce ? { opacity: 0 } : { opacity: 0, x: 60, scale: 0.92 }}
            animate={reduce ? { opacity: 1 } : { opacity: 1, x: 0, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, x: 40, scale: 0.95 }}
            transition={{ duration: 0.45, ease: [0.22, 0.9, 0.3, 1] }}
            className="pointer-events-auto w-[280px] rounded-2xl overflow-hidden border border-white/30 bg-white/80 backdrop-blur-xl shadow-[0_20px_60px_-20px_rgba(99,102,241,0.55)]"
          >
            <div className="relative px-4 py-3">
              <div className="absolute inset-0 bg-linear-to-br from-indigo-500/10 via-violet-500/10 to-cyan-400/10" />
              <div className="relative flex items-start gap-3">
                <div className="w-9 h-9 shrink-0 rounded-xl bg-linear-to-br from-amber-300 to-amber-500 flex items-center justify-center text-white text-base shadow-lg shadow-amber-300/50">
                  ★
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-500">
                    Achievement
                  </p>
                  <p className="text-[13px] font-bold text-slate-800 leading-tight mt-0.5">
                    {a.title}
                  </p>
                  <p className="text-[11.5px] text-slate-500 leading-snug mt-0.5">
                    {a.description}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
