import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Server-only handler. The service-role key MUST stay out of the client
// bundle, so we read SUPABASE_SERVICE_KEY (no NEXT_PUBLIC_ prefix) and
// construct the admin client per-request.
// Prefer SUPABASE_SERVICE_KEY (server-only). Fall back to the leaky
// NEXT_PUBLIC_SUPABASE_SERVICE_KEY so the feature isn't broken while the user
// rotates the key + renames the env var. Loudly warn when fallback is used.
let legacyKeyWarned = false
function readServiceKey(): string | undefined {
  const proper = process.env.SUPABASE_SERVICE_KEY?.trim()
  if (proper) return proper
  const legacy = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY?.trim()
  if (legacy && !legacyKeyWarned) {
    legacyKeyWarned = true
    console.warn(
      "[admin/remind] Using NEXT_PUBLIC_SUPABASE_SERVICE_KEY as a fallback. " +
        "This name causes Next.js to ship the key to every browser. " +
        "Rotate the key in Supabase, then rename the env var to SUPABASE_SERVICE_KEY (no NEXT_PUBLIC_).",
    )
  }
  return legacy
}

export async function POST(req: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  const serviceKey = readServiceKey()
  if (!url || !serviceKey) {
    return NextResponse.json(
      {
        error:
          "Server is missing SUPABASE_SERVICE_KEY (or NEXT_PUBLIC_SUPABASE_URL). " +
          "Set it in .env.local and restart the dev server. " +
          "The service key should NOT have a NEXT_PUBLIC_ prefix.",
      },
      { status: 500 },
    )
  }

  let body: {
    userId?: string
    taskId?: number
    taskTitle?: string
    message?: string
  }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 })
  }

  const { userId, taskId, taskTitle, message } = body
  if (!userId || typeof taskId !== "number" || !taskTitle) {
    return NextResponse.json(
      { error: "userId, taskId, and taskTitle are required." },
      { status: 400 },
    )
  }

  const admin = createClient(url, serviceKey)
  const { error } = await admin.from("notifications").insert({
    user_id: userId,
    task_id: taskId,
    task_title: taskTitle,
    message:
      message ?? `Friendly nudge from your admin: don't forget to finish "${taskTitle}".`,
    read: false,
  })

  if (error) {
    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
        hint: error.hint,
        details: error.details,
      },
      { status: 502 },
    )
  }

  return NextResponse.json({ ok: true })
}
