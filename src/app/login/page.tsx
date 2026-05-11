"use client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">

      <div className="flex w-900px bg-white rounded-2xl shadow-lg overflow-hidden">

        {/* Left Side */}
        <div className="w-1/2  flex items-center justify-center">
          <Image
            src="/login.png" // put your image in public/images
            alt="Illustration"
            width={450}
            height={450}
          />
        </div>

        {/* Right Side */}
        <div className="w-1/2 p-10">

          <h2 className="text-2xl font-semibold mb-2">
            Welcome Back! 👋
          </h2>
          <p className="text-gray-500 mb-6">
            Sign in to continue your journey
          </p>

          {/* Email */}
          <div className="mb-4">
            <label className="text-sm text-gray-600">Email address</label>
            <input
              type="email"
              placeholder="you@example.com"
              className="w-full mt-1 p-2 border rounded-lg outline-none focus:ring-2 focus:ring-
              blue-400"
            />
          </div>

          {/* Password */}
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600">
              <label>Password</label>
              <span className="text-blue-500 cursor-pointer">
                Forgot password?
              </span>
            </div>
            <input
              type="password"
              placeholder="Enter your password"
              className="w-full mt-1 p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Button */}
          <button className="w-full bg-linear-to-r from-blue-500 to-indigo-500 text-white py-2 rounded-lg hover:opacity-90 transition" onClick={() => router.push("/profilesetup")}>
            Login
          </button>

          {/* Divider */}
          <div className="text-center text-gray-400 my-4 text-sm">
            or continue with
          </div>

          {/* Social Buttons */}
          <div className="flex gap-3">
            <button className="w-1/2 border py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-50">
              <Image src="/google.png" alt="Google" width={20} height={20} />
              Google
            </button>

            <button className="w-1/2 border py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-50">
              <Image src="/apple.png" alt="Apple" width={20} height={20} />
              Apple
            </button>
          </div>

          {/* Signup */}
          <p className="text-center text-sm text-gray-500 mt-6">
            Don’t have an account?{" "}

            <button onClick={() => router.push("/signup")} className="text-blue-500 cursor-pointer">
              Sign up
            </button>

          </p>

        </div>
      </div>
    </div>
  );
}