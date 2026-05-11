"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Navbar() {
  const [active, setActive] = useState("Home");
  const links = ["Home", "Features", "About", "Blog"];
  const router = useRouter();

  return (
    <header className="flex items-center justify-between px-8 py-3 bg-white/80 backdrop-blur-md border-b border-blue-100/60 sticky top-0 z-50">
      {/* Logo */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 bg-linear-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center shadow-md shadow-blue-200">
           <span className="text-white font-bold text-sm">SC</span>
        </div>
        <span className="font-bold text-base tracking-tight text-gray-900">
          Smart<span className="text-blue-600">Companion</span>
        </span>
      </div>

      {/* Nav links */}
      <nav className="flex items-center gap-1">
        {links.map((link) => (
          <a
            key={link}
            href="#"
            onClick={() => setActive(link)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
              active === link
                ? "bg-blue-50 text-blue-700"
                : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
            }`}
          >
            {link}
          </a>
        ))}
      </nav>

      {/* CTA */}
      <button className="px-5 py-2 rounded-full bg-linear-to-r from-blue-600 to-blue-500 text-white text-sm font-semibold shadow-md shadow-blue-200 hover:shadow-blue-300 hover:-translate-y-0.5 transition-all duration-200" onClick={() => router.push("/login")}>
        Login
      </button>
    </header>
  );
}