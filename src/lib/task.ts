export type Task = {
  id: number
  title: string
  progress: string
  createdAt: string
  createdTimestamp: number
  steps?: { text: string; duration: string; completed: boolean }[]
}

export function readTasks(): Task[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem("userTasks")
    return raw ? (JSON.parse(raw) as Task[]) : []
  } catch {
    return []
  }
}

// ── Only today's tasks ──
export function readTodayTasks(): Task[] {
  const today = new Date().toDateString()
  return readTasks()
    .map((t) => ({
      ...t,
      // Use id timestamp as fallback if createdAt missing
      createdAt: t.createdAt || new Date(t.id).toDateString(),
    }))
    .filter((t) => t.createdAt === today)
}

export function saveTask(
  title: string,
  totalSteps: number,
  steps: { text: string; duration: string }[]
): Task {
  const tasks = readTasks()
  const now = new Date()
  const newTask: Task = {
    id: Date.now(),
    title,
    progress: `0/${totalSteps}`,
    createdAt: now.toDateString(),
    createdTimestamp: now.getTime(),
    steps: steps.map((s) => ({ ...s, completed: false })),
  }
  tasks.push(newTask)
  localStorage.setItem("userTasks", JSON.stringify(tasks))
  return newTask
}

export function updateTaskProgress(
  taskId: number,
  completedSteps: number,
  totalSteps: number,
  steps: { text: string; duration: string; completed: boolean }[]
) {
  const tasks = readTasks()
  const updated = tasks.map((t) =>
    t.id === taskId
      ? { ...t, progress: `${completedSteps}/${totalSteps}`, steps }
      : t
  )
  localStorage.setItem("userTasks", JSON.stringify(updated))
}
