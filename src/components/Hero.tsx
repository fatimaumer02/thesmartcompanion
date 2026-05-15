import Link from "next/link";
import HeroScene from "./HeroScene";
import ScrollReveal from "./ScrollReveal";
import MagneticButton from "./MagneticButton";


export default function Hero() {
  return (
    <section className="relative grid md:grid-cols-2 gap-6 items-center px-8 py-10 overflow-hidden">
      {/* Background blobs */}
      <div className="absolute -top-20 -right-20 w-80 h-80 bg-blue-100 rounded-full blur-3xl opacity-50 pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-blue-100 rounded-full blur-3xl opacity-40 pointer-events-none" />

      {/* Left: copy */}
      <div className="relative z-10 space-y-4">
        <ScrollReveal from="up" delay={0.0}>
          {/* Pill badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            AI-Powered · Neurodivergent Friendly
          </div>
        </ScrollReveal>

        <ScrollReveal from="up" delay={0.1}>
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight text-gray-900 tracking-tight">
            Your AI Companion{" "}
            <br />
            for{" "}
            <span className="relative inline-block text-blue-600">
              Everyday Wins
              <svg
                className="absolute -bottom-1 left-0 w-full"
                viewBox="0 0 200 6"
                fill="none"
              >
                <path
                  d="M2 4 Q100 1 198 4"
                  stroke="#93c5fd "
                  strokeWidth="2"
                  strokeLinecap="round"
                  opacity="0.35"
                />
              </svg>
            </span>
          </h1>
        </ScrollReveal>

        <ScrollReveal from="up" delay={0.2}>
          <p className="text-gray-500 text-sm leading-relaxed max-w-sm">
            We break overwhelming tasks into small steps so you can focus,
            achieve and celebrate every win — one micro step at a time.
          </p>
        </ScrollReveal>

        <ScrollReveal from="up" delay={0.3}>
          <div className="flex gap-3 items-center pt-2">
            <MagneticButton radius={140} strength={0.35}>
              <Link
                href="/login"
                className="inline-block px-6 py-2.5 rounded-full bg-linear-to-r from-blue-600 to-blue-500 text-white text-sm font-semibold shadow-lg shadow-blue-300/40 hover:shadow-blue-400/60 transition-shadow duration-300"
              >
                Get Started
              </Link>
            </MagneticButton>
          </div>
        </ScrollReveal>
      </div>

      {/* Right: 3D scene */}
      <div className="relative flex justify-center items-center h-[420px]">
        <HeroScene />
      </div>
    </section>
  );
}
