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

  // 2. Save to Supabase
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    const { error } = await supabase.from("tasks").insert({
      id:                newTask.id,
      user_id:           user.id,
      user_email:        user.email,
      title:             newTask.title,
      progress:          newTask.progress,
      created_at:        newTask.createdAt,
      created_timestamp: newTask.createdTimestamp,
      steps:             newTask.steps,  // stored as JSONB
    })
    if (error) console.error("Supabase task insert error:", error)
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
  const { error } = await supabase
    .from("tasks")
    .update({ progress, steps })
    .eq("id", taskId)

  if (error) console.error("Supabase task update error:", error)
}

// ── Sync from Supabase → localStorage (call after login) ─────────────────────
export async function syncTasksFromSupabase(): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("user_id", user.id)
    .order("created_timestamp", { ascending: false })

  if (error) {
    console.error("Supabase sync error:", error)
    return
  }

  if (data && data.length > 0) {
    // Map Supabase column names back to local Task shape
    const mapped: Task[] = data.map((row) => ({
      id:               row.id,
      title:            row.title,
      progress:         row.progress,
      createdAt:        row.created_at,
      createdTimestamp: row.created_timestamp,
      steps:            row.steps ?? [],
    }))
    localStorage.setItem("userTasks", JSON.stringify(mapped))
  }
}
