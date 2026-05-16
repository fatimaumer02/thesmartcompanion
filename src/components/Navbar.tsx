"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X, ShieldCheck } from "lucide-react";

const links = [
  { label: "Home", href: "/" },
  { label: "Features", href: "/features" },
  { label: "About", href: "/about" },
  { label: "Blog", href: "/blog" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-blue-100/60 sticky top-0 z-50">
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <ShieldCheck size={20} className="text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-white font-bold text-sm truncate">Smart Companion</p>
            </div>
          </div>
        </Link>

        {/* Desktop nav links */}
        <nav className="hidden md:flex items-center gap-1">
          {links.map(({ label, href }) => {
            const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                  active
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          {/* Desktop CTA */}
          <button
            className="hidden sm:block px-5 py-2 rounded-full bg-linear-to-r from-blue-600 to-blue-500 text-white text-sm font-semibold shadow-md shadow-blue-200 hover:shadow-blue-300 hover:-translate-y-0.5 transition-all duration-200"
            onClick={() => router.push("/login")}
          >
            Login
          </button>

          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className="md:hidden w-10 h-10 rounded-xl flex items-center justify-center text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu panel */}
      {open && (
        <div className="md:hidden border-t border-blue-100/60 px-4 pb-4 pt-2 bg-white/95 backdrop-blur-md">
          <nav className="flex flex-col gap-1">
            {links.map(({ label, href }) => {
              const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    active
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {label}
                </Link>
              );
            })}
            <button
              className="mt-2 px-4 py-2.5 rounded-xl bg-linear-to-r from-blue-600 to-blue-500 text-white text-sm font-semibold shadow-md shadow-blue-200"
              onClick={() => router.push("/login")}
            >
              Login
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
