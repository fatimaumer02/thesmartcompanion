"use client"

import { useEffect, useRef } from "react"

type Props = {
  active: boolean
  durationMs?: number
}

type Particle = {
  x: number
  y: number
  vx: number
  vy: number
  rot: number
  vr: number
  size: number
  color: string
  life: number
}

const COLORS = ["#6366f1", "#8b5cf6", "#22d3ee", "#34d399", "#fbbf24", "#f472b6"]

// Soft, low-density confetti — calm rather than chaotic. Respects reduced
// motion by simply not painting frames.
export default function ConfettiBurst({ active, durationMs = 2200 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    if (!active) return
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (reduce) return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const resize = () => {
      canvas.width = canvas.clientWidth * dpr
      canvas.height = canvas.clientHeight * dpr
    }
    resize()

    const particles: Particle[] = []
    const cx = canvas.width / 2
    const cy = canvas.height * 0.45
    const count = 70
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5
      const speed = (3 + Math.random() * 4) * dpr
      particles.push({
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2 * dpr,
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.3,
        size: (4 + Math.random() * 4) * dpr,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        life: 1,
      })
    }

    const start = performance.now()
    const tick = (t: number) => {
      const elapsed = t - start
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      for (const p of particles) {
        p.vy += 0.08 * dpr
        p.vx *= 0.992
        p.x += p.vx
        p.y += p.vy
        p.rot += p.vr
        p.life = Math.max(0, 1 - elapsed / durationMs)

        ctx.save()
        ctx.globalAlpha = p.life
        ctx.translate(p.x, p.y)
        ctx.rotate(p.rot)
        ctx.fillStyle = p.color
        ctx.fillRect(-p.size / 2, -p.size / 3, p.size, p.size * 0.65)
        ctx.restore()
      }

      if (elapsed < durationMs) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
      }
    }
    rafRef.current = requestAnimationFrame(tick)

    window.addEventListener("resize", resize)
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
      window.removeEventListener("resize", resize)
    }
  }, [active, durationMs])

  if (!active) return null

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 w-full h-full z-[60]"
      aria-hidden
    />
  )
}
