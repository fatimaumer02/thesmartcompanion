"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "../../../lib/supabase"

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    const handleCallback = async () => {
      const { data, error } = await supabase.auth.getSession()

      if (error || !data.session) {
        router.push("/login")
        return
      }

      const user = data.session.user

      // ── Save to localStorage for dashboard greeting ──
      localStorage.setItem(
        "userProfile",
        JSON.stringify({
          name:  user.user_metadata?.full_name ||
                 user.user_metadata?.name ||
                 user.email?.split("@")[0],
          email: user.email,
        })
      )

      // ── Check if user already exists in users table ──
      const { data: existing } = await supabase
        .from("users")
        .select("id, name")
        .eq("id", user.id)
        .single()

      if (!existing) {
        // ── New user → insert into users table ──
        await supabase.from("users").insert({
          id:        user.id,
          name:      user.user_metadata?.full_name ||
                     user.user_metadata?.name ||
                     user.email?.split("@")[0],
          email:     user.email,
          status:    "Active",
          tasks:     0,
          joined_at: new Date().toLocaleDateString(),
        })
        // ── New user → go to profile setup ──
        router.push("/profilesetup")
      } else if (!existing.name) {
        // ── User exists but no name → go to profile setup ──
        router.push("/profilesetup")
      } else {
        // ── Existing user with profile → go to dashboard ──
        router.push("/dashboard")
      }
    }

    handleCallback()
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-indigo-50">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin" />
        <p className="text-slate-400 text-sm">Signing you in...</p>
      </div>
    </div>
  )
}