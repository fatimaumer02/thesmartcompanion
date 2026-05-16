import { supabase } from "./supabase"

export type Task = {
  id: number
  title: string
  progress: string
  createdAt: string
  createdTimestamp: number
  steps?: { text: string; duration: string; completed: boolean }[]
}

// ── Read from localStorage ────────────────────────────────────────────────────
export function readTasks(): Task[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem("userTasks")
    return raw ? (JSON.parse(raw) as Task[]) : []
  } catch {
    return []
  }
}

// ── Robust today check ────────────────────────────────────────────────────────
function isToday(createdAt: string): boolean {
  if (!createdAt) return false
  try {
    const taskDate = new Date(createdAt)
    const now = new Date()
    return (
      taskDate.getFullYear() === now.getFullYear() &&
      taskDate.getMonth()    === now.getMonth()    &&
      taskDate.getDate()     === now.getDate()
    )
  } catch {
    return false
  }
}

// ── Only today's tasks ────────────────────────────────────────────────────────
export function readTodayTasks(): Task[] {
  return readTasks()
    .map((t) => ({
      ...t,
      createdAt: t.createdAt || new Date(t.id).toISOString(),
    }))
    .filter((t) => isToday(t.createdAt))
}

// ── Save task — localStorage + Supabase ───────────────────────────────────────
export async function saveTask(
  title: string,
  totalSteps: number,
  steps: { text: string; duration: string }[]
): Promise<Task> {
  const now = new Date()
  const id  = Date.now()

  const newTask: Task = {
    id,
    title,
    progress:         `0/${totalSteps}`,
    createdAt:        now.toISOString(),
    createdTimestamp: id,
    steps:            steps.map((s) => ({ ...s, completed: false })),
  }

  // 1. Save to localStorage
  const tasks = readTasks()
  tasks.push(newTask)
  localStorage.setItem("userTasks", JSON.stringify(tasks))

  // 2. Save to Supabase — get user from auth AND from localStorage profile
  try {
    const { data: { user } } = await supabase.auth.getUser()

    // Get email from auth user OR localStorage profile as fallback
    const profileRaw = localStorage.getItem("userProfile")
    const profile = profileRaw ? JSON.parse(profileRaw) : null
    const userEmail = user?.email || profile?.email || null
    const userId = user?.id || null

    if (userEmail) {
      const { error } = await supabase.from("tasks").insert({
        id:                newTask.id,
        user_id:           userId,
        user_email:        userEmail,   // ← always save email
        title:             newTask.title,
        progress:          newTask.progress,
        created_at:        newTask.createdAt,
        created_timestamp: newTask.createdTimestamp,
        steps:             newTask.steps,
      })
      if (error) console.error("Supabase task insert error:", error)
    }
  } catch (e) {
    console.error("Supabase save error:", e)
  }

  return newTask
}

// ── Update progress — localStorage + Supabase ─────────────────────────────────
export async function updateTaskProgress(
  taskId: number,
  completedSteps: number,
  totalSteps: number,
  steps: { text: string; duration: string; completed: boolean }[]
): Promise<void> {
  const progress = `${completedSteps}/${totalSteps}`

  // 1. Update localStorage
  const tasks   = readTasks()
  const updated = tasks.map((t) =>
    t.id === taskId ? { ...t, progress, steps } : t
  )
  localStorage.setItem("userTasks", JSON.stringify(updated))

  // 2. Update Supabase
  try {
    const { error } = await supabase
      .from("tasks")
      .update({ progress, steps })
      .eq("id", taskId)
    if (error) console.error("Supabase task update error:", error)
  } catch (e) {
    console.error("Supabase update error:", e)
  }
}

// ── Sync from Supabase → localStorage (call after login) ─────────────────────
export async function syncTasksFromSupabase(): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser()

    // Get email from auth OR localStorage profile
    const profileRaw = localStorage.getItem("userProfile")
    const profile = profileRaw ? JSON.parse(profileRaw) : null
    const userEmail = user?.email || profile?.email || null

    if (!userEmail) return

    // ── Fetch by user_id if available, else by user_email ──
    let query = supabase
      .from("tasks")
      .select("*")
      .order("created_timestamp", { ascending: false })

    if (user?.id) {
      // Try by user_id first
      const { data: byId, error: idError } = await query.eq("user_id", user.id)
      if (!idError && byId && byId.length > 0) {
        const mapped: Task[] = byId.map((row) => ({
          id:               row.id,
          title:            row.title,
          progress:         row.progress,
          createdAt:        row.created_at,
          createdTimestamp: row.created_timestamp,
          steps:            row.steps ?? [],
        }))
        localStorage.setItem("userTasks", JSON.stringify(mapped))
        return
      }
    }

    // Fallback: fetch by user_email
    const { data: byEmail, error: emailError } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_email", userEmail)
      .order("created_timestamp", { ascending: false })

    if (emailError) {
      console.error("Supabase sync error:", emailError)
      return
    }

    if (byEmail && byEmail.length > 0) {
      const mapped: Task[] = byEmail.map((row) => ({
        id:               row.id,
        title:            row.title,
        progress:         row.progress,
        createdAt:        row.created_at,
        createdTimestamp: row.created_timestamp,
        steps:            row.steps ?? [],
      }))
      localStorage.setItem("userTasks", JSON.stringify(mapped))
    }
  } catch (e) {
    console.error("Supabase sync error:", e)
  }
}

// ── Get all tasks for admin (all users) ───────────────────────────────────────
export async function getAllTasksForAdmin(): Promise<{
  user_email: string
  user_id: string
  id: number
  title: string
  progress: string
  created_at: string
  steps: { text: string; duration: string; completed: boolean }[]
}[]> {
  try {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .order("created_timestamp", { ascending: false })

    if (error) {
      console.error("Supabase getAllTasks error:", error)
      return []
    }

    return data ?? []
  } catch (e) {
    console.error("getAllTasksForAdmin error:", e)
    return []
  }
}