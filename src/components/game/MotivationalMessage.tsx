"use client"

import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { useEffect, useState } from "react"

const STARTING = [
  "Small wins matter.",
  "One step is enough.",
  "Starting counts.",
  "You showed up. That's the part.",
]
const MIDWAY = [
  "You're building momentum.",
  "Progress unlocked.",
  "Quietly winning.",
  "Halfway is real.",
]
const NEARING = [
  "Almost there.",
  "One more step.",
  "Stay with it.",
  "Last stretch.",
]

type Props = {
  progressPct: number
  className?: string
}

// Rotating gentle line that mirrors progress. No exclamation marks, no toxic
// positivity. Pulls from one of three pools depending on how far the user is.
export default function MotivationalMessage({ progressPct, className }: Props) {
  const reduce = useReducedMotion()
  const pool = progressPct >= 75 ? NEARING : progressPct >= 40 ? MIDWAY : STARTING
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (reduce) return
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % pool.length)
    }, 4800)
    return () => window.clearInterval(id)
  }, [pool, reduce])

  // Re-anchor index when pool changes so we don't read past the new length.
  useEffect(() => {
    setIndex(0)
  }, [pool])

  const message = pool[index % pool.length]

  return (
    <div className={["relative h-5 overflow-hidden", className ?? ""].join(" ")}>
      <AnimatePresence mode="popLayout">
        <motion.span
          key={message}
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 8 }}
          animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="absolute inset-0 text-[12px] font-medium text-indigo-400/90 tracking-wide"
        >
          {message}
        </motion.span>
      </AnimatePresence>
    </div>
  )
}
