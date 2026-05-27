"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { supabase } from "../../lib/supabase";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName]       = useState("");
  const [email, setEmail]     = useState("");
  const [password, setPassword]     = useState("");
  const [confirm, setConfirm]       = useState("");
  const [error, setError]           = useState("");
  const [loading, setLoading]       = useState(false);
  const [showPassword, setShowPassword]   = useState(false);
  const [showConfirm, setShowConfirm]     = useState(false);

  const handleCreateAccount = async () => {
    setError("")
    const trimmedName  = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName || !trimmedEmail || !password) {
      setError("Please fill in all fields.")
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

    try {
      // ── Step 1: Sign up via Supabase Auth ──
      const { data, error: authError } = await supabase.auth.signUp({
        email: trimmedEmail,
        password,
        options: {
          data: { name: trimmedName },
        },
      })

      if (authError) {
        if (authError.message.toLowerCase().includes("already registered")) {
          setError("This email is already registered. Please login instead.")
        } else {
          setError(authError.message)
        }
        return
      }

      if (data.user) {
        // ── Step 2: Save profile to localStorage ──
        localStorage.setItem(
          "userProfile",
          JSON.stringify({ name: trimmedName, email: trimmedEmail }),
        )

        // ── Step 3: Insert into users table ──
        const { error: dbError } = await supabase.from("users").insert({
          id:        data.user.id,
          name:      trimmedName,
          email:     trimmedEmail,
          status:    "Active",
          tasks:     0,
          joined_at: new Date().toISOString(),
        })

        if (dbError && dbError.code !== "23505") {
          console.error("DB insert error:", dbError)
        }

        // ── Step 4: Auto login after signup ──
        const { data: loginData, error: loginError } =
          await supabase.auth.signInWithPassword({
            email: trimmedEmail,
            password,
          })

        if (loginError) {
          setError("Account created! Please go to login page.")
          router.push("/login")
          return
        }

        if (loginData.user) {
          router.push("/login")
        }
      }

    } catch (e) {
      console.error(e)
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white rounded-2xl shadow-lg flex w-full max-w-4xl overflow-hidden">

        {/* LEFT SIDE FORM */}
        <div className="w-full md:w-1/2 p-8">
          <h2 className="text-2xl font-bold mb-2">Create Your Account</h2>
          <p className="text-gray-500 mb-6">Let&apos;s get you started!</p>

          <div className="space-y-4">

            {/* Name */}
            <div>
              <label className="text-sm font-medium">Full name</label>
              <input
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full mt-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            {/* Email */}
            <div>
              <label className="text-sm font-medium">Email address</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full mt-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            {/* Password */}
            <div>
              <label className="text-sm font-medium">Password</label>
              <div className="relative mt-1">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Create password (min 6 chars)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 pr-11 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
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

            {/* Confirm Password */}
            <div>
              <label className="text-sm font-medium">Confirm Password</label>
              <div className="relative mt-1">
                <input
                  type={showConfirm ? "text" : "password"}
                  placeholder="Confirm password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleCreateAccount() }}
                  className="w-full p-3 pr-11 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Terms */}
            <div className="flex items-center gap-2 text-sm">
              <input type="checkbox" />
              <span>
                I agree to the{" "}
                <span className="text-blue-600 cursor-pointer hover:underline">
                  Terms & Privacy Policy
                </span>
              </span>
            </div>

            {/* Error */}
            {error && (
              <p className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
                ⚠️ {error}
              </p>
            )}

            {/* Submit */}
            <button
              onClick={handleCreateAccount}
              disabled={loading}
              type="button"
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Creating account…
                </span>
              ) : "Create Account"}
            </button>
          </div>

          <p className="text-sm text-gray-500 mt-4">
            Already have an account?{" "}
            <button
              onClick={() => router.push("/login")}
              className="text-blue-500 cursor-pointer hover:underline"
            >
              Login
            </button>
          </p>
        </div>

        {/* RIGHT SIDE IMAGE */}
        <div className="hidden md:flex w-1/2 items-center justify-center p-6">
          <Image
            src="/signupp.png"
            alt="Signup Illustration"
            width={400}
            height={400}
          />
        </div>
      </div>
    </div>
  );
}