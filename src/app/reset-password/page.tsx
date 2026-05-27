"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff } from "lucide-react"
import { supabase } from "../../lib/supabase"

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword]   = useState("")
  const [confirm, setConfirm]     = useState("")
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState("")
  const [success, setSuccess]     = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm]   = useState(false)

  const handleReset = async () => {
    setError("")
    if (!password) {
      setError("Please enter a new password.")
      return
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.")
      return
    }
    if (password !== confirm) {
      setError("Passwords do not match.")
      return
    }

    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)

    if (error) {
      setError(error.message)
    } else {
      setSuccess(true)
      setTimeout(() => router.push("/login"), 3000)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 via-indigo-50 to-slate-100 p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8">

        <h2 className="text-2xl font-bold text-slate-800 mb-1">
          New Password 🔐
        </h2>
        <p className="text-slate-400 text-sm mb-6">
          Enter your new password below.
        </p>

        {success ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-4 text-center">
            <p className="text-emerald-700 font-semibold text-sm mb-1">
              ✅ Password updated!
            </p>
            <p className="text-emerald-600 text-xs">
              Redirecting you to login...
            </p>
          </div>
        ) : (
          <>
            {/* New Password */}
            <div className="mb-4">
              <label className="text-sm font-semibold text-slate-600">
                New Password
              </label>
              <div className="relative mt-1.5">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full px-4 py-2.5 pr-11 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="mb-6">
              <label className="text-sm font-semibold text-slate-600">
                Confirm Password
              </label>
              <div className="relative mt-1.5">
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleReset()}
                  placeholder="Confirm new password"
                  className="w-full px-4 py-2.5 pr-11 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="mb-4 text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">
                ⚠️ {error}
              </p>
            )}

            <button
              onClick={handleReset}
              disabled={loading}
              className="w-full bg-linear-to-r from-blue-500 to-indigo-600 text-white py-3 rounded-xl font-bold text-sm hover:opacity-90 transition-all disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Updating...
                </span>
              ) : "Update Password"}
            </button>
          </>
        )}
      </div>
    </div>
  )
}