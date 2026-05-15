"use client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useState } from "react";
import Button3D from "../../components/Button3D";
import HeroScene from "../../components/HeroScene";

const ADMIN_EMAIL = "admin@smartcompanion.com"
const ADMIN_PASSWORD = "admin@123"

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"user" | "admin">("user")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const handleLogin = () => {
    setError("")

    if (mode === "admin") {
      if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        router.push("/admin/overview")
      } else {
        setError("Invalid admin email or password.")
      }
      return
    }

    // ── Save user to allUsers on login too ──
    try {
      const existing = JSON.parse(localStorage.getItem("allUsers") ?? "[]")
      const alreadyExists = existing.find(
        (u: { email: string }) => u.email === email.trim()
      )

      if (!alreadyExists && email.trim()) {
        const loginUser = {
          id: Date.now(),
          name: email.split("@")[0],
          email: email.trim(),
          status: "Active",
          tasks: 0,
          joinedAt: new Date().toLocaleDateString(),
        }
        existing.push(loginUser)
        localStorage.setItem("allUsers", JSON.stringify(existing))
      }

      // ── Update userProfile ──
      const existingProfile = JSON.parse(
        localStorage.getItem("userProfile") ?? "{}"
      )
      if (!existingProfile.name) {
        localStorage.setItem(
          "userProfile",
          JSON.stringify({
            name: email.split("@")[0],
            email: email.trim(),
          })
        )
      }
    } catch {}

    router.push("/profilesetup")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-slate-100">
      <div className="flex w-[900px] bg-white rounded-3xl shadow-xl overflow-hidden">

        {/* Left Side — Three.js orbiting companion scene */}
        <div className="w-1/2 bg-gradient-to-br from-blue-600 to-indigo-700 flex flex-col items-center justify-center p-10 gap-6 relative overflow-hidden">
          <div className="w-72 h-72">
            <HeroScene />
          </div>
          <div className="text-center relative z-10">
            <h2 className="text-white text-2xl font-bold">Smart Companion</h2>
            <p className="text-blue-200 text-sm mt-1">Your neuro-inclusive AI assistant</p>
          </div>
        </div>

        {/* Right Side */}
        <div className="w-1/2 p-10 flex flex-col justify-center">

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
              {error}
            </p>
          )}

          {/* Login Button */}
          <Button3D
            onClick={handleLogin}
            shadowColor={mode === "admin" ? "indigo" : "blue"}
            className={[
              "w-full text-white py-3 rounded-xl font-bold text-sm mb-4",
              mode === "admin"
                ? "bg-gradient-to-r from-indigo-600 to-purple-600"
                : "bg-gradient-to-r from-blue-500 to-indigo-600"
            ].join(" ")}
          >
            {mode === "admin" ? "Login as Admin" : "Login"}
          </Button3D>

          {/* Social — user only */}
          {mode === "user" && (
            <>
              <div className="text-center text-slate-400 my-3 text-xs">
                or continue with
              </div>
              <div className="flex gap-3">
                <button className="w-1/2 border border-slate-200 py-2.5 rounded-xl flex items-center justify-center gap-2 hover:bg-slate-50 text-sm font-medium text-slate-600 transition-all">
                  <Image src="/gooogle.png" alt="Google" width={18} height={18} />
                  Google
                </button>
                <button className="w-1/2 border border-slate-200 py-2.5 rounded-xl flex items-center justify-center gap-2 hover:bg-slate-50 text-sm font-medium text-slate-600 transition-all">
                  <Image src="/applle.png" alt="Apple" width={18} height={18} />
                  Apple
                </button>
              </div>
              <p className="text-center text-sm text-slate-400 mt-5">
                Don't have an account?{" "}
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