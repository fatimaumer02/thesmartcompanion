"use client"

import React from "react"
import { useRouter } from "next/navigation"

type Props = {
  title: string
  progress: string
  index?: number
}

type ColorConfig = {
  bar: string
  iconBg: string
  iconDot: string
  tag: string
  tagText: string
  tagLabel: string
  pct: string
  segFilled: string
  segEmpty: string
  btn: string
  btnShadow: string
}

const colors: ColorConfig[] = [
  {
    bar: "bg-gradient-to-b from-indigo-400 to-indigo-600",
    iconBg: "bg-indigo-50",
    iconDot: "bg-indigo-500",
    tag: "bg-indigo-50",
    tagText: "text-indigo-600",
    tagLabel: "Personal",
    pct: "text-indigo-500",
    segFilled: "bg-indigo-500",
    segEmpty: "bg-gray-200",
    btn: "bg-gradient-to-r from-indigo-500 to-indigo-600",
    btnShadow: "shadow-indigo-200",
  },
  {
    bar: "bg-gradient-to-b from-amber-400 to-amber-500",
    iconBg: "bg-amber-50",
    iconDot: "bg-amber-500",
    tag: "bg-amber-50",
    tagText: "text-amber-600",
    tagLabel: "Study",
    pct: "text-amber-500",
    segFilled: "bg-amber-400",
    segEmpty: "bg-gray-200",
    btn: "bg-gradient-to-r from-amber-400 to-amber-500",
    btnShadow: "shadow-amber-200",
  },
  {
    bar: "bg-gradient-to-b from-emerald-400 to-emerald-600",
    iconBg: "bg-emerald-50",
    iconDot: "bg-emerald-500",
    tag: "bg-emerald-50",
    tagText: "text-emerald-600",
    tagLabel: "Work",
    pct: "text-emerald-500",
    segFilled: "bg-emerald-400",
    segEmpty: "bg-gray-200",
    btn: "bg-gradient-to-r from-emerald-500 to-emerald-600",
    btnShadow: "shadow-emerald-200",
  },
  {
    bar: "bg-gradient-to-b from-rose-400 to-rose-600",
    iconBg: "bg-rose-50",
    iconDot: "bg-rose-500",
    tag: "bg-rose-50",
    tagText: "text-rose-600",
    tagLabel: "Health",
    pct: "text-rose-500",
    segFilled: "bg-rose-400",
    segEmpty: "bg-gray-200",
    btn: "bg-gradient-to-r from-rose-500 to-rose-600",
    btnShadow: "shadow-rose-200",
  },
]

export default function TaskCard({ title, progress, index = 0 }: Props) {
  const router = useRouter()
  const color = colors[index % colors.length]

  const [done, total] = progress.split("/").map(Number)
  const pct = Math.round((done / total) * 100)
  const segments = Array.from({ length: total }, (_, i) => i < done)

  return (
    <div className="relative flex items-center gap-4 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 overflow-hidden pr-5 py-5">

      {/* Left accent bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-1.5 rounded-l-2xl ${color.bar}`} />

      {/* Icon */}
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-0 ml-6 ${color.iconBg}`}>
        <div className={`w-5 h-5 rounded-full ${color.iconDot}`} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col gap-1.5">

        {/* Top row */}
        <div className="flex items-center justify-between">
          <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wide ${color.tag} ${color.tagText}`}>
            {color.tagLabel}
          </span>
          <span className={`text-xs font-bold ${color.pct}`}>{pct}%</span>
        </div>

        {/* Title */}
        <p className="text-sm font-semibold text-slate-800 truncate">{title}</p>

        {/* Segment bar */}
        <div className="flex gap-1 mt-0.5">
          {segments.map((filled, i) => (
            <div
              key={i}
              className={`flex-1 h-1.5 rounded-full transition-all duration-500 ${filled ? color.segFilled : color.segEmpty}`}
            />
          ))}
        </div>

        <p className="text-[11px] text-slate-400 font-medium">
          {done} of {total} steps done
        </p>
      </div>

      {/* Button */}
      <button
        onClick={() => router.push("/taskinfo")}
        className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-xs font-semibold flex-0 shadow-lg ${color.btn} ${color.btnShadow} hover:opacity-90 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200`}
      >
        Continue
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
          <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

    </div>
  )
}