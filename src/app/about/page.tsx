import Link from "next/link";
import Navbar from "../../components/Navbar";

const values = [
  {
    icon: "🤝",
    title: "Built with, not for",
    desc: "Every feature is shaped by neurodivergent users — ADHD, dyslexic, autistic — not assumed by neurotypical PMs.",
  },
  {
    icon: "🪶",
    title: "Soft by default",
    desc: "No streaks, no shame. Tools that pressure you create the very paralysis they claim to solve.",
  },
  {
    icon: "🔒",
    title: "Your data is yours",
    desc: "We don't sell behavioral data. Your patterns are used to help you — that's the whole stack.",
  },
  {
    icon: "🧪",
    title: "Evidence over hype",
    desc: "Patterns we recommend are grounded in occupational therapy and ADHD research, not productivity folklore.",
  },
];

const stats = [
  { value: "12k+", label: "Early access signups" },
  { value: "84%", label: "Report fewer freeze moments" },
  { value: "4.8★", label: "Average user rating" },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="relative px-8 py-16 overflow-hidden">
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-blue-100 rounded-full blur-3xl opacity-50 pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-blue-100 rounded-full blur-3xl opacity-40 pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            Our Story
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-4 text-gray-900 tracking-tight">
            We're building the tool we{" "}
            <span className="text-blue-600">wished existed</span>
          </h1>
          <p className="text-gray-500 text-base leading-relaxed max-w-xl mx-auto">
            SmartCompanion started after our founder spent six months unable to start a
            task she'd already planned twelve times. Productivity apps were the problem,
            not the cure. So we built something different.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="px-8 pb-16">
        <div className="max-w-3xl mx-auto bg-linear-to-br from-blue-50 to-white border border-blue-100 rounded-3xl p-10">
          <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-3">
            Our mission
          </p>
          <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-4 tracking-tight leading-snug">
            Make starting easier than scrolling.
          </h2>
          <p className="text-gray-600 leading-relaxed">
            For neurodivergent minds, the gap between knowing what to do and actually
            doing it can feel uncrossable. SmartCompanion lives in that gap. It listens,
            breaks things down, removes choice fatigue, and quietly celebrates the win
            when you take the first step. Nothing more. Nothing less.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="px-8 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-4xl mx-auto">
          {stats.map((s, i) => (
            <div
              key={i}
              className="bg-white border border-gray-100 rounded-2xl p-6 text-center shadow-sm"
            >
              <div className="text-3xl font-extrabold text-blue-600 mb-1 tracking-tight">
                {s.value}
              </div>
              <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Values */}
      <section className="px-8 pb-16">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-extrabold text-gray-900 text-center mb-8 tracking-tight">
            What we believe
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {values.map((v, i) => (
              <div
                key={i}
                className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300"
              >
                <div className="text-3xl mb-3">{v.icon}</div>
                <h3 className="font-bold text-base text-gray-900 mb-2">{v.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-8 pb-20">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-extrabold text-gray-900 mb-3 tracking-tight">
            Come build with us
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            Try SmartCompanion free, or read the blog to see what we're working on next.
          </p>
          <div className="flex gap-3 justify-center">
            <Link
              href="/login"
              className="inline-block px-6 py-3 rounded-full bg-linear-to-r from-blue-600 to-blue-500 text-white text-sm font-semibold shadow-lg shadow-blue-200 hover:shadow-blue-300 hover:-translate-y-0.5 transition-all duration-200"
            >
              Get Started
            </Link>
            <Link
              href="/blog"
              className="inline-block px-6 py-3 rounded-full bg-white border border-gray-200 text-gray-700 text-sm font-semibold hover:border-blue-300 hover:text-blue-700 transition-all duration-200"
            >
              Read the Blog
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
