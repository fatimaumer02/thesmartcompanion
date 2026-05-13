export type Task = {
  id: number
  title: string
  progress: string
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

export function saveTask(
  title: string,
  totalSteps: number,
  steps: { text: string; duration: string }[]
): Task {
  const tasks = readTasks()
  const newTask: Task = {
    id: Date.now(),
    title,
    progress: `0/${totalSteps}`,
    steps: steps.map((s) => ({ ...s, completed: false })),
  }
  tasks.push(newTask)
  localStorage.setItem("userTasks", JSON.stringify(tasks))
  return newTask
}

// ← NEW: call this every time a step is checked in taskinfo
export function updateTaskProgress(taskId: number, completedSteps: number, totalSteps: number, steps: { text: string; duration: string; completed: boolean }[]) {
  const tasks = readTasks()
  const updated = tasks.map((t) =>
    t.id === taskId
      ? { ...t, progress: `${completedSteps}/${totalSteps}`, steps }
      : t
  )
  localStorage.setItem("userTasks", JSON.stringify(updated))
}