"use client"

import { useRouter } from "next/navigation"
import { motion, useReducedMotion } from "framer-motion"
import TiltCard from "./TiltCard"

type Props = {
  title: string
  progress: string
  index?: number
  taskId?: number
}

type ColorConfig = {
  label: string
  ring: string
  glow: string
  accent: string
  segFilled: string
  badgeBg: string
  badgeText: string
  ctaGradient: string
  ctaGlow: string
  iconHue: string
}

const COLORS: ColorConfig[] = [
  {
    label: "Personal",
    ring: "from-indigo-400/80 via-violet-500/80 to-fuchsia-500/80",
    glow: "shadow-[0_18px_60px_-22px_rgba(99,102,241,0.55)]",
    accent: "text-indigo-500",
    segFilled: "bg-linear-to-r from-indigo-400 to-violet-500",
    badgeBg: "bg-indigo-500/15 border-indigo-300/50",
    badgeText: "text-indigo-600",
    ctaGradient: "from-indigo-500 to-violet-600",
    ctaGlow: "shadow-indigo-400/50",
    iconHue: "from-indigo-300 to-violet-400",
  },
  {
    label: "Study",
    ring: "from-amber-300/80 via-orange-400/80 to-rose-400/80",
    glow: "shadow-[0_18px_60px_-22px_rgba(251,146,60,0.5)]",
    accent: "text-amber-500",
    segFilled: "bg-linear-to-r from-amber-400 to-orange-500",
    badgeBg: "bg-amber-400/15 border-amber-300/50",
    badgeText: "text-amber-600",
    ctaGradient: "from-amber-400 to-orange-500",
    ctaGlow: "shadow-amber-400/50",
    iconHue: "from-amber-300 to-orange-400",
  },
  {
    label: "Work",
    ring: "from-emerald-300/80 via-teal-400/80 to-cyan-400/80",
    glow: "shadow-[0_18px_60px_-22px_rgba(16,185,129,0.5)]",
    accent: "text-emerald-500",
    segFilled: "bg-linear-to-r from-emerald-400 to-teal-500",
    badgeBg: "bg-emerald-400/15 border-emerald-300/50",
    badgeText: "text-emerald-600",
    ctaGradient: "from-emerald-500 to-teal-600",
    ctaGlow: "shadow-emerald-400/50",
    iconHue: "from-emerald-300 to-teal-400",
  },
  {
    label: "Health",
    ring: "from-rose-300/80 via-pink-400/80 to-fuchsia-400/80",
    glow: "shadow-[0_18px_60px_-22px_rgba(244,114,182,0.5)]",
    accent: "text-rose-500",
    segFilled: "bg-linear-to-r from-rose-400 to-pink-500",
    badgeBg: "bg-rose-400/15 border-rose-300/50",
    badgeText: "text-rose-600",
    ctaGradient: "from-rose-500 to-pink-600",
    ctaGlow: "shadow-rose-400/50",
    iconHue: "from-rose-300 to-pink-400",
  },
]

export default function TaskCard({ title, progress, index = 0, taskId }: Props) {
  const router = useRouter()
  const color = COLORS[index % COLORS.length]
  const reduce = useReducedMotion()

  const [done, total] = progress.split("/").map(Number)
  const pct = Math.round((done / total) * 100)
  const segments = Array.from({ length: total }, (_, i) => i < done)

  const handleContinue = () => {
    if (taskId) {
      try {
        const tasks = JSON.parse(localStorage.getItem("userTasks") ?? "[]")
        const task = tasks.find((t: { id: number }) => t.id === taskId)
        if (task?.steps) {
          sessionStorage.setItem(
            "currentTask",
            JSON.stringify({
              title: task.title,
              steps: task.steps,
              taskId: task.id,
            }),
          )
        }
      } catch {}
    }
    router.push("/taskinfo")
  }

  const status =
    pct === 100 ? "Cleared" : pct >= 50 ? "In Progress" : done > 0 ? "Started" : "Ready"

  return (
    <TiltCard maxTilt={6}>
      <motion.div
        whileHover={reduce ? undefined : { y: -3 }}
        transition={{ duration: 0.35, ease: [0.22, 0.9, 0.3, 1] }}
        className={[
          "group relative h-full rounded-2xl overflow-hidden",
          "bg-white/70 backdrop-blur-xl border border-white/40",
          color.glow,
        ].join(" ")}
      >
        {/* Animated gradient halo on the top border */}
        <div
          className={`pointer-events-none absolute -inset-px rounded-2xl bg-linear-to-r ${color.ring} opacity-40 blur-[2px] group-hover:opacity-70 transition-opacity duration-500`}
          aria-hidden
        />
        <div className="relative bg-white/85 rounded-2xl overflow-hidden">
          <div className="p-4 sm:p-5 flex flex-col gap-3">
            {/* Top row: icon + category + status */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0 bg-linear-to-br ${color.iconHue} shadow-md`}
                >
                  ◆
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest border ${color.badgeBg} ${color.badgeText}`}
                >
                  {color.label}
                </span>
              </div>
              <span
                className={[
                  "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full",
                  pct === 100
                    ? "bg-emerald-100 text-emerald-600"
                    : "bg-slate-100 text-slate-500",
                ].join(" ")}
              >
                {status}
              </span>
            </div>

            {/* Title */}
            <p className="text-[14px] font-semibold text-slate-800 leading-snug line-clamp-2">
              {title}
            </p>

            {/* Segment progress */}
            <div className="flex gap-1">
              {segments.map((filled, i) => (
                <motion.div
                  key={i}
                  initial={false}
                  animate={
                    reduce
                      ? undefined
                      : filled
                      ? { opacity: 1, scaleY: 1 }
                      : { opacity: 0.4, scaleY: 0.7 }
                  }
                  transition={{ duration: 0.5, delay: reduce ? 0 : i * 0.04 }}
                  className={[
                    "flex-1 h-1.5 rounded-full origin-bottom",
                    filled ? color.segFilled : "bg-slate-200",
                    filled ? "shadow-[0_0_8px_currentColor]" : "",
                  ].join(" ")}
                />
              ))}
            </div>

            <div className="flex items-center justify-between -mt-0.5">
              <p className="text-[11px] text-slate-400 font-medium">
                {done} of {total} steps
              </p>
              <span className={`text-[13px] font-extrabold tabular-nums ${color.accent}`}>
                {pct}%
              </span>
            </div>

            {/* CTA */}
            <button
              onClick={handleContinue}
              className={[
                "mt-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl",
                "text-white text-xs font-bold tracking-wide",
                "bg-linear-to-r",
                color.ctaGradient,
                "shadow-lg",
                color.ctaGlow,
                "hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 transition-all duration-200",
              ].join(" ")}
            >
              {pct === 100 ? "Review" : pct > 0 ? "Continue Quest" : "Start Quest"}
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                <path
                  d="M5 12h14M13 6l6 6-6 6"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
      </motion.div>
    </TiltCard>
  )
}
