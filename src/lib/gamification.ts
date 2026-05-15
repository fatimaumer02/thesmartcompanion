"use client"

// Calm, neurodivergent-friendly gamification. No streak guilt: missed days
// "pause" the streak rather than zero it. XP grows quadratically per level so
// level-ups feel meaningful early without becoming unreachable later.

export const XP_PER_STEP = 10
export const XP_TASK_COMPLETE_BONUS = 50

const KEY = "sc:gamification.v1"

export type Achievement = {
  id: string
  title: string
  description: string
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: "first-step", title: "First Move", description: "You completed your first step. Starting is the hardest part." },
  { id: "first-task", title: "Quest Cleared", description: "A whole task, done. That counted." },
  { id: "level-3", title: "Finding Rhythm", description: "Reached level 3." },
  { id: "streak-3", title: "Three in a Row", description: "Three days of showing up." },
  { id: "streak-7", title: "One Quiet Week", description: "A full week of returning. That's real." },
  { id: "ten-tasks", title: "Ten Down", description: "Ten tasks completed. Quiet momentum." },
]

export type GameState = {
  totalXP: number
  tasksCompleted: number
  streak: {
    current: number
    lastActiveDate: string | null
    paused: boolean
  }
  unlocked: string[]
  soundEnabled: boolean
}

const DEFAULT_STATE: GameState = {
  totalXP: 0,
  tasksCompleted: 0,
  streak: { current: 0, lastActiveDate: null, paused: false },
  unlocked: [],
  soundEnabled: false,
}

function todayKey(): string {
  const d = new Date()
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
}

function daysBetween(a: string, b: string): number {
  const [ay, am, ad] = a.split("-").map(Number)
  const [by, bm, bd] = b.split("-").map(Number)
  const ms = new Date(by, bm - 1, bd).getTime() - new Date(ay, am - 1, ad).getTime()
  return Math.round(ms / 86_400_000)
}

export function loadState(): GameState {
  if (typeof window === "undefined") return DEFAULT_STATE
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return DEFAULT_STATE
    const parsed = JSON.parse(raw) as Partial<GameState>
    return {
      ...DEFAULT_STATE,
      ...parsed,
      streak: { ...DEFAULT_STATE.streak, ...(parsed.streak ?? {}) },
      unlocked: parsed.unlocked ?? [],
    }
  } catch {
    return DEFAULT_STATE
  }
}

function saveState(state: GameState) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
    window.dispatchEvent(new CustomEvent("sc:gamification"))
  } catch {}
}

// Level math: level = floor(sqrt(xp / 50)) + 1. Level 1 = 0xp, L2 = 50, L3 = 200,
// L4 = 450, L5 = 800. Keeps early levels frequent and rewarding.
export function levelFromXP(xp: number): number {
  return Math.floor(Math.sqrt(xp / 50)) + 1
}
export function xpForLevel(level: number): number {
  return (level - 1) * (level - 1) * 50
}
export function progressWithinLevel(xp: number): {
  level: number
  currentInLevel: number
  needed: number
  pct: number
} {
  const level = levelFromXP(xp)
  const floor = xpForLevel(level)
  const next = xpForLevel(level + 1)
  const currentInLevel = xp - floor
  const needed = next - floor
  return {
    level,
    currentInLevel,
    needed,
    pct: Math.max(0, Math.min(1, currentInLevel / needed)),
  }
}

export type AwardResult = {
  xpGained: number
  leveledUp: boolean
  newLevel: number
  unlocked: Achievement[]
  streakIncreased: boolean
  newStreak: number
  state: GameState
}

function maybeUnlock(state: GameState, id: string, into: Achievement[]) {
  if (state.unlocked.includes(id)) return
  const ach = ACHIEVEMENTS.find((a) => a.id === id)
  if (!ach) return
  state.unlocked.push(id)
  into.push(ach)
}

export function awardStepXP(): AwardResult {
  const prev = loadState()
  const prevLevel = levelFromXP(prev.totalXP)
  const next: GameState = { ...prev, totalXP: prev.totalXP + XP_PER_STEP }
  const newLevel = levelFromXP(next.totalXP)
  const unlocked: Achievement[] = []
  maybeUnlock(next, "first-step", unlocked)
  if (newLevel >= 3) maybeUnlock(next, "level-3", unlocked)
  saveState(next)
  return {
    xpGained: XP_PER_STEP,
    leveledUp: newLevel > prevLevel,
    newLevel,
    unlocked,
    streakIncreased: false,
    newStreak: next.streak.current,
    state: next,
  }
}

export function awardTaskComplete(): AwardResult {
  const prev = loadState()
  const prevLevel = levelFromXP(prev.totalXP)
  const today = todayKey()
  const unlocked: Achievement[] = []

  // Streak: increment if last active was yesterday, hold if today, otherwise
  // gently restart (we don't shout "streak lost").
  let { current, lastActiveDate } = prev.streak
  let streakIncreased = false
  if (lastActiveDate === today) {
    // already counted today, no change
  } else if (lastActiveDate && daysBetween(lastActiveDate, today) === 1) {
    current += 1
    streakIncreased = true
  } else {
    current = 1
    streakIncreased = true
  }

  const next: GameState = {
    ...prev,
    totalXP: prev.totalXP + XP_TASK_COMPLETE_BONUS,
    tasksCompleted: prev.tasksCompleted + 1,
    streak: { current, lastActiveDate: today, paused: false },
  }
  const newLevel = levelFromXP(next.totalXP)

  maybeUnlock(next, "first-task", unlocked)
  if (newLevel >= 3) maybeUnlock(next, "level-3", unlocked)
  if (current >= 3) maybeUnlock(next, "streak-3", unlocked)
  if (current >= 7) maybeUnlock(next, "streak-7", unlocked)
  if (next.tasksCompleted >= 10) maybeUnlock(next, "ten-tasks", unlocked)

  saveState(next)
  return {
    xpGained: XP_TASK_COMPLETE_BONUS,
    leveledUp: newLevel > prevLevel,
    newLevel,
    unlocked,
    streakIncreased,
    newStreak: current,
    state: next,
  }
}

// Streak is "paused" (not broken) when more than a day has passed since last
// activity. UI uses this to render a softer state instead of a zero.
export function streakDisplay(state: GameState): { count: number; paused: boolean } {
  const { current, lastActiveDate } = state.streak
  if (!lastActiveDate) return { count: 0, paused: false }
  const gap = daysBetween(lastActiveDate, todayKey())
  return { count: current, paused: gap > 1 }
}

export function setSoundEnabled(enabled: boolean) {
  const prev = loadState()
  saveState({ ...prev, soundEnabled: enabled })
}
