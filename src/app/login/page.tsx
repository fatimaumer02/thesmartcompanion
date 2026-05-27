"use client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import Button3D from "../../components/Button3D";
import HeroScene from "../../components/HeroScene";
import { supabase } from "../../lib/supabase";
import { syncTasksFromSupabase } from "../../lib/task";

const ADMIN_EMAIL = "admin@smartcompanion.com"
const ADMIN_PASSWORD = "admin@123"

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode]         = useState<"user" | "admin">("user")
  const [email, setEmail]       = useState("")
  const [password, setPassword] = useState("")
  const [error, setError]       = useState("")
  const [loading, setLoading]   = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // ── Forgot password state ──
  const [showForgot, setShowForgot]       = useState(false)
  const [forgotEmail, setForgotEmail]     = useState("")
  const [forgotLoading, setForgotLoading] = useState(false)
  const [forgotSuccess, setForgotSuccess] = useState(false)
  const [forgotError, setForgotError]     = useState("")

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
          name:  data.user.user_metadata?.name ||
                 data.user.user_metadata?.full_name ||
                 email.split("@")[0],
          email: data.user.email,
        })
      )
    }

    setLoading(false)
    router.push("/profilesetup")
  }

  // ── Forgot Password ──
  const handleForgotPassword = async () => {
    setForgotError("")
    if (!forgotEmail.trim()) {
      setForgotError("Please enter your email address.")
      return
    }
    setForgotLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(
      forgotEmail.trim(),
      { redirectTo: `${window.location.origin}/reset-password` }
    )
    setForgotLoading(false)
    if (error) {
      setForgotError(error.message)
    } else {
      setForgotSuccess(true)
    }
  }

  // ── Google Login ──
  const handleGoogleLogin = async () => {
    setError("")
    setLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) {
      setError(error.message)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 via-indigo-50 to-slate-100 p-4 sm:p-6">
      <div className="flex w-full max-w-4xl bg-white rounded-3xl shadow-xl overflow-hidden">

        {/* Left Side */}
        <div className="hidden md:flex md:w-1/2 bg-linear-to-br from-blue-600 to-indigo-700 flex-col items-center justify-center p-10 gap-6 relative overflow-hidden">
          <div className="w-72 h-72">
            <HeroScene />
          </div>
          <div className="text-center relative z-10">
            <h2 className="text-white text-2xl font-bold">Smart Companion</h2>
            <p className="text-blue-200 text-sm mt-1">
              Your neuro-inclusive AI assistant
            </p>
          </div>
        </div>

        {/* Right Side */}
        <div className="w-full md:w-1/2 p-6 sm:p-8 md:p-10 flex flex-col justify-center">

          {/* ── Forgot Password Modal ── */}
          {showForgot ? (
            <div>
              <button
                onClick={() => {
                  setShowForgot(false)
                  setForgotSuccess(false)
                  setForgotError("")
                  setForgotEmail("")
                }}
                className="flex items-center gap-1 text-slate-400 hover:text-slate-600 text-sm mb-6 transition-colors"
              >
                ← Back to login
              </button>

              <h2 className="text-2xl font-bold text-slate-800 mb-1">
                Reset Password 🔑
              </h2>
              <p className="text-slate-400 text-sm mb-6">
                Enter your email and we will send you a reset link.
              </p>

              {forgotSuccess ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-4 text-center">
                  <p className="text-emerald-700 font-semibold text-sm mb-1">
                    ✅ Reset link sent!
                  </p>
                  <p className="text-emerald-600 text-xs">
                    Check your email inbox and click the link to reset your password.
                  </p>
                  <button
                    onClick={() => {
                      setShowForgot(false)
                      setForgotSuccess(false)
                      setForgotEmail("")
                    }}
                    className="mt-4 text-blue-600 text-sm font-semibold hover:underline"
                  >
                    Back to login
                  </button>
                </div>
              ) : (
                <>
                  <div className="mb-4">
                    <label className="text-sm font-semibold text-slate-600">
                      Email address
                    </label>
                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleForgotPassword()}
                      placeholder="you@example.com"
                      className="w-full mt-1.5 px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-400 text-sm transition-all"
                    />
                  </div>

                  {forgotError && (
                    <p className="mb-4 text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">
                      ⚠️ {forgotError}
                    </p>
                  )}

                  <button
                    onClick={handleForgotPassword}
                    disabled={forgotLoading}
                    className="w-full bg-linear-to-r from-blue-500 to-indigo-600 text-white py-3 rounded-xl font-bold text-sm hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {forgotLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        Sending...
                      </span>
                    ) : "Send Reset Link"}
                  </button>
                </>
              )}
            </div>

          ) : (
            <>
              {/* Toggle */}
              <div className="flex bg-slate-100 rounded-xl p-1 gap-1 mb-8">
                <button
                  onClick={() => {
                    setMode("user")
                    setError("")
                    setEmail("")
                    setPassword("")
                  }}
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
                  onClick={() => {
                    setMode("admin")
                    setError("")
                    setEmail("")
                    setPassword("")
                  }}
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
                    <button
                      type="button"
                      onClick={() => {
                        setShowForgot(true)
                        setForgotEmail(email)
                      }}
                      className="text-blue-500 hover:underline text-xs font-semibold"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative mt-1.5">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                    placeholder="Enter your password"
                    className="w-full px-4 py-2.5 pr-11 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-400 text-sm transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
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
                    ? "bg-linear-to-r from-indigo-600 to-purple-600"
                    : "bg-linear-to-r from-blue-500 to-indigo-600"
                ].join(" ")}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Please wait...
                  </span>
                ) : mode === "admin" ? "Login as Admin" : "Login"}
              </Button3D>

              {/* Google — user only */}
              {mode === "user" && (
                <>
                  <div className="text-center text-slate-400 my-3 text-xs">
                    or continue with
                  </div>

                  <button
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    className="w-full border border-slate-200 py-2.5 rounded-xl flex items-center justify-center gap-2 hover:bg-slate-50 text-sm font-medium text-slate-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Image
                      src="/gooogle.png"
                      alt="Google"
                      width={18}
                      height={18}
                    />
                    Continue with Google
                  </button>

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
            </>
          )}

        </div>
      </div>
    </div>
  );
}