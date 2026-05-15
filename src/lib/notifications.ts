import { supabase } from "./supabase"

// ── Types ────────────────────────────────────────────────────────────────────
export type Notification = {
  id: string
  user_id: string
  task_id: number | null
  task_title: string | null
  message: string
  read: boolean
  created_at: string
}

// Supabase PostgrestError fields aren't enumerable when serialized by some
// console implementations, so `console.error(error)` ends up as "{}" in the
// browser. Pull the fields out explicitly so the real reason shows up.
type PostgrestLike = {
  code?: string
  message?: string
  details?: string | null
  hint?: string | null
}

let warnedAboutMissingTable = false
function logSupabaseError(scope: string, err: PostgrestLike) {
  // PGRST205 = relation does not exist. Log it once, then go quiet — it's
  // expected until the user runs the notifications migration.
  if (err?.code === "PGRST205") {
    if (warnedAboutMissingTable) return
    warnedAboutMissingTable = true
    console.warn(
      `[notifications] ${scope}: table not found. ` +
        `Run the notifications migration in Supabase SQL Editor to enable the bell.`,
    )
    return
  }
  console.error(
    `[notifications] ${scope}: ${err?.message ?? "unknown error"}`,
    {
      code: err?.code,
      details: err?.details,
      hint: err?.hint,
    },
  )
}

// ── Admin: send a reminder for a task to a specific user ─────────────────────
// Goes through /api/admin/remind so the service-role key stays server-side
// (it must NEVER be exposed to the browser bundle).
export async function sendReminder(params: {
  userId: string
  taskId: number
  taskTitle: string
  message?: string
}): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const res = await fetch("/api/admin/remind", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    })
    const data = (await res.json()) as {
      ok?: true
      error?: string
      code?: string
      hint?: string
      details?: string
    }
    if (!res.ok || !data.ok) {
      logSupabaseError("sendReminder", {
        code: data.code,
        message: data.error ?? `HTTP ${res.status}`,
        hint: data.hint,
        details: data.details,
      })
      return { ok: false, error: data.error ?? `HTTP ${res.status}` }
    }
    return { ok: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Network error"
    logSupabaseError("sendReminder", { message })
    return { ok: false, error: message }
  }
}

// ── User: fetch own notifications, newest first ──────────────────────────────
export async function getNotifications(): Promise<Notification[]> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50)

  if (error) {
    logSupabaseError("getNotifications", error)
    return []
  }
  return (data ?? []) as Notification[]
}

// ── User: mark a notification as read ────────────────────────────────────────
export async function markAsRead(id: string): Promise<void> {
  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("id", id)
  if (error) logSupabaseError("markAsRead", error)
}

// ── User: mark all notifications as read ─────────────────────────────────────
export async function markAllAsRead(): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("user_id", user.id)
    .eq("read", false)
  if (error) logSupabaseError("markAllAsRead", error)
}
