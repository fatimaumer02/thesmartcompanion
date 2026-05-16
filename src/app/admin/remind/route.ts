// src/app/api/admin/remind/route.ts
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Service role key — never exposed to browser
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const { userId, taskId, taskTitle, message } = await req.json()

    if (!userId || !taskId || !taskTitle) {
      return NextResponse.json(
        { error: "Missing required fields: userId, taskId, taskTitle" },
        { status: 400 }
      )
    }

    const { error } = await supabaseAdmin.from("notifications").insert({
      user_id:    userId,
      task_id:    taskId,
      task_title: taskTitle,
      message:    message ?? `Reminder: Please complete your task "${taskTitle}"`,
      read:       false,
      created_at: new Date().toISOString(),
    })

    if (error) {
      console.error("notifications insert error:", error)
      return NextResponse.json(
        { error: error.message, code: error.code, hint: error.hint, details: error.details },
        { status: 500 }
      )
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error("remind route error:", e)
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 }
    )
  }
}