"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");

  const handleCreateAccount = () => {
    setError("")
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName || !trimmedEmail || !password) {
      setError("Please fill in all fields.")
      return
    }

    if (password !== confirm) {
      setError("Passwords do not match.")
      return
    }

    try {
      // ── Save current user profile (for dashboard greeting) ──
      localStorage.setItem(
        "userProfile",
        JSON.stringify({ name: trimmedName, email: trimmedEmail }),
      )

      // ── Save to users list (for admin panel) ──
      const existingRaw = localStorage.getItem("allUsers")
      const existing = existingRaw ? JSON.parse(existingRaw) : []

      // Check if email already registered
      const alreadyExists = existing.find(
        (u: { email: string }) => u.email === trimmedEmail
      )
      if (alreadyExists) {
        setError("This email is already registered.")
        return
      }

      const newUser = {
        id: Date.now(),
        name: trimmedName,
        email: trimmedEmail,
        status: "Active",
        tasks: 0,
        joinedAt: new Date().toLocaleDateString(),
      }

      existing.push(newUser)
      localStorage.setItem("allUsers", JSON.stringify(existing))

    } catch {
      // localStorage unavailable
    }

    router.push("/login")
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white rounded-2xl shadow-lg flex w-full max-w-4xl overflow-hidden">

        {/* LEFT SIDE FORM */}
        <div className="w-full md:w-1/2 p-8">
          <h2 className="text-2xl font-bold mb-2">Create Your Account</h2>
          <p className="text-gray-500 mb-6">Let's get you started!</p>

          <div className="space-y-4">
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

            <div>
              <label className="text-sm font-medium">Password</label>
              <input
                type="password"
                placeholder="Create password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full mt-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Confirm Password</label>
              <input
                type="password"
                placeholder="Confirm password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="w-full mt-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div className="flex items-center gap-2 text-sm">
              <input type="checkbox" />
              <span>
                I agree to the{" "}
                <span className="text-blue-600 cursor-pointer">
                  Terms & Privacy Policy
                </span>
              </span>
            </div>

            {/* Error */}
            {error && (
              <p className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              onClick={handleCreateAccount}
              type="button"
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
            >
              Create Account
            </button>
          </div>

          <p className="text-sm text-gray-500 mt-4">
            Already have an account?{" "}
            <button
              onClick={() => router.push("/login")}
              className="text-blue-500 cursor-pointer"
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