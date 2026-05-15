"use client"

import { useCallback, useEffect, useRef } from "react"
import { loadState } from "./gamification"

type FX = "step" | "complete" | "levelup" | "achievement"

// Pure WebAudio so we don't have to ship audio assets. Each cue is a short
// gentle tone — calm by design (sound is off by default; users opt in).
const TONES: Record<FX, { freq: number; type: OscillatorType; duration: number; vol: number }> = {
  step:        { freq: 880,  type: "sine",     duration: 0.08, vol: 0.06 },
  complete:    { freq: 660,  type: "triangle", duration: 0.35, vol: 0.10 },
  levelup:     { freq: 1320, type: "sine",     duration: 0.40, vol: 0.10 },
  achievement: { freq: 988,  type: "triangle", duration: 0.45, vol: 0.10 },
}

export function useSoundFX() {
  const ctxRef = useRef<AudioContext | null>(null)

  useEffect(() => {
    return () => {
      ctxRef.current?.close().catch(() => {})
    }
  }, [])

  const play = useCallback((fx: FX) => {
    if (typeof window === "undefined") return
    if (!loadState().soundEnabled) return
    try {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      if (!AC) return
      const ctx = ctxRef.current ?? new AC()
      ctxRef.current = ctx
      if (ctx.state === "suspended") ctx.resume().catch(() => {})

      const cfg = TONES[fx]
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = cfg.type
      osc.frequency.value = cfg.freq
      gain.gain.setValueAtTime(0, ctx.currentTime)
      gain.gain.linearRampToValueAtTime(cfg.vol, ctx.currentTime + 0.015)
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + cfg.duration)
      osc.connect(gain).connect(ctx.destination)
      osc.start()
      osc.stop(ctx.currentTime + cfg.duration + 0.02)
    } catch {}
  }, [])

  return play
}
