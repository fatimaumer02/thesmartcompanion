"use client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useState } from "react";
import Button3D from "../../components/Button3D";
import HeroScene from "../../components/HeroScene";
import { supabase } from "../../lib/supabase";
import { syncTasksFromSupabase } from "../../lib/task";

const ADMIN_EMAIL = "admin@smartcompanion.com"
const ADMIN_PASSWORD = "admin@123"

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"user" | "admin">("user")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    setError("")
    setLoading(true)

    // ── Admin Login ──
    if (mode === "admin") {
      if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        router.push("/admin/overview")
      } else {
        setError("Invalid admin email or password.")
      }
      setLoading(false)
      return
    }

    // ── User Login via Supabase ──
    const { data, error: loginError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })

    if (loginError) {
      console.error("Full login error:", loginError)
      console.error("Error status:", loginError.status)
      console.error("Error message:", loginError.message)

      if (loginError.message.toLowerCase().includes("email not confirmed")) {
        setError("Please confirm your email first. Check your inbox.")
      } else if (loginError.message.toLowerCase().includes("invalid login")) {
        setError("Incorrect email or password.")
      } else {
        setError(loginError.message)
      }
      setLoading(false)
      return
    }

    if (data.user) {
      await syncTasksFromSupabase()
      localStorage.setItem(
        "userProfile",
        JSON.stringify({
          name: data.user.user_metadata?.name || email.split("@")[0],
          email: data.user.email,
        })
      )
    }

    setLoading(false)
    router.push("/profilesetup")
  }

  // ── Google Login ──
  const handleGoogleLogin = async () => {
    setError("")
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) setError(error.message)
  }

  // ── Apple Login ──
  const handleAppleLogin = async () => {
    setError("")
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "apple",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) setError(error.message)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-slate-100 p-4 sm:p-6">
      <div className="flex w-full max-w-4xl bg-white rounded-3xl shadow-xl overflow-hidden">

        {/* Left Side — hidden on mobile, the form fills width there */}
        <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-blue-600 to-indigo-700 flex-col items-center justify-center p-10 gap-6 relative overflow-hidden">
          <div className="w-72 h-72">
            <HeroScene />
          </div>
          <div className="text-center relative z-10">
            <h2 className="text-white text-2xl font-bold">Smart Companion</h2>
            <p className="text-blue-200 text-sm mt-1">Your neuro-inclusive AI assistant</p>
          </div>
        </div>

        {/* Right Side */}
        <div className="w-full md:w-1/2 p-6 sm:p-8 md:p-10 flex flex-col justify-center">

          {/* Toggle */}
          <div className="flex bg-slate-100 rounded-xl p-1 gap-1 mb-8">
            <button
              onClick={() => { setMode("user"); setError(""); setEmail(""); setPassword("") }}
              className={[
                "flex-1 py-2.5 rounded-lg text-sm font-bold transition-all duration-200",
                mode === "user"
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-slate-500 hover:text-slate-700"
              ].join(" ")}
            >
              User Login
            </button>
            <button
              onClick={() => { setMode("admin"); setError(""); setEmail(""); setPassword("") }}
              className={[
                "flex-1 py-2.5 rounded-lg text-sm font-bold transition-all duration-200",
                mode === "admin"
                  ? "bg-indigo-600 text-white shadow-md"
                  : "text-slate-500 hover:text-slate-700"
              ].join(" ")}
            >
              Admin Login
            </button>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-slate-800 mb-1">
            {mode === "admin" ? "Admin Access 🔐" : "Welcome Back! 👋"}
          </h2>
          <p className="text-slate-400 text-sm mb-6">
            {mode === "admin"
              ? "Enter your admin credentials to continue"
              : "Sign in to continue your journey"}
          </p>

          {/* Email */}
          <div className="mb-4">
            <label className="text-sm font-semibold text-slate-600">
              Email address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={
                mode === "admin"
                  ? "admin@smartcompanion.com"
                  : "you@example.com"
              }
              className="w-full mt-1.5 px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-400 text-sm transition-all"
            />
          </div>

          {/* Password */}
          <div className="mb-4">
            <div className="flex justify-between text-sm">
              <label className="font-semibold text-slate-600">Password</label>
              {mode === "user" && (
                <span className="text-blue-500 cursor-pointer hover:underline">
                  Forgot password?
                </span>
              )}
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              placeholder="Enter your password"
              className="w-full mt-1.5 px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-400 text-sm transition-all"
            />
          </div>

          {/* Error */}
          {error && (
            <p className="mb-4 text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">
              ⚠️ {error}
            </p>
          )}

          {/* Login Button */}
          <Button3D
            onClick={handleLogin}
            disabled={loading}
            shadowColor={mode === "admin" ? "indigo" : "blue"}
            className={[
              "w-full text-white py-3 rounded-xl font-bold text-sm mb-4 disabled:opacity-60",
              mode === "admin"
                ? "bg-gradient-to-r from-indigo-600 to-purple-600"
                : "bg-gradient-to-r from-blue-500 to-indigo-600"
            ].join(" ")}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Please wait...
              </span>
            ) : mode === "admin" ? "Login as Admin" : "Login"}
          </Button3D>

          {/* Social — user only */}
          {mode === "user" && (
            <>
              <div className="text-center text-slate-400 my-3 text-xs">
                or continue with
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleGoogleLogin}
                  className="w-1/2 border border-slate-200 py-2.5 rounded-xl flex items-center justify-center gap-2 hover:bg-slate-50 text-sm font-medium text-slate-600 transition-all"
                >
                  <Image src="/gooogle.png" alt="Google" width={18} height={18} />
                  Google
                </button>
                <button
                  onClick={handleAppleLogin}
                  className="group w-1/2 bg-slate-900 border border-slate-900 py-2.5 rounded-xl flex items-center justify-center gap-2 hover:bg-white hover:border-slate-200 text-sm font-medium text-white hover:text-slate-900 transition-all duration-200"
                >
                  <Image
                    src="/applle.png"
                    alt="Apple"
                    width={28}
                    height={28}
                    className="invert group-hover:invert-0 transition-all duration-200"
                  />
                  Apple
                </button>
              </div>
              <p className="text-center text-sm text-slate-400 mt-5">
                Don&apos;t have an account?{" "}
                <button
                  onClick={() => router.push("/signup")}
                  className="text-blue-500 font-semibold hover:underline"
                >
                  Sign up
                </button>
              </p>
            </>
          )}

        </div>
      </div>
    </div>
  );
}