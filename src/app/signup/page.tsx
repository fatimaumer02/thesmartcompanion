"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white rounded-2xl shadow-lg flex w-full max-w-4xl overflow-hidden">
        
        {/* LEFT SIDE FORM */}
        <div className="w-full md:w-1/2 p-8">
          <h2 className="text-2xl font-bold mb-2">Create Your Account</h2>
          <p className="text-gray-500 mb-6">
            Let’s get you started!
          </p>

          <form className="space-y-4">
            <div>
              <label className="text-sm font-medium">Full name</label>
              <input
                type="text"
                placeholder="Enter your name"
                className="w-full mt-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Email address</label>
              <input
                type="email"
                placeholder="you@example.com"
                className="w-full mt-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Password</label>
              <input
                type="password"
                placeholder="Create password"
                className="w-full mt-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Confirm Password</label>
              <input
                type="password"
                placeholder="Confirm password"
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

            <button onClick={() => router.push("/login")}
              type="button"
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
              
            >
              Create Account
            </button>
          </form>

          <p className="text-sm text-gray-500 mt-4">
            Already have an account?{" "}
           <button onClick={() => router.push("/login")} className="text-blue-500 cursor-pointer">
              Login
            </button>
          </p>
        </div>

        {/* RIGHT SIDE IMAGE */}
        <div className="hidden md:flex w-1/2  items-center justify-center p-6">
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