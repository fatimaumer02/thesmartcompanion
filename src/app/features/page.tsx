import Link from "next/link";
import Navbar from "../../components/Navbar";

const features = [
  {
    icon: "🧩",
    title: "Smart Task Breakdown",
    desc: "AI splits overwhelming projects into bite-sized micro-steps you can actually start.",
    accent: "#2563eb",
    bg: "#dbeafe",
  },
  {
    icon: "🎙️",
    title: "Voice-First Capture",
    desc: "Talk to your companion. We turn rambling thoughts into a clean, ordered plan.",
    accent: "#7c3aed",
    bg: "#ede9fe",
  },
  {
    icon: "⏱️",
    title: "Time-Aware Reminders",
    desc: "Gentle nudges tuned to your energy windows, not arbitrary clock times.",
    accent: "#db2777",
    bg: "#fce7f3",
  },
  {
    icon: "🎯",
    title: "Focus Mode",
    desc: "One step on screen. Zero distractions. Built to outrun task paralysis.",
    accent: "#16a34a",
    bg: "#dcfce7",
  },
  {
    icon: "📖",
    title: "Reading Accommodations",
    desc: "OpenDyslexic, Lexend, adjustable spacing — read your way, not the default way.",
    accent: "#d97706",
    bg: "#fef3c7",
  },
  {
    icon: "🎉",
    title: "Win Celebrations",
    desc: "Every micro-win is logged and surfaced. Momentum compounds when it's seen.",
    accent: "#0891b2",
    bg: "#cffafe",
  },
];

const comparison = [
  { row: "Designed for neurodivergent minds", sc: true, others: false },
  { row: "Micro-step task breakdown", sc: true, others: false },
  { row: "Dyslexia-friendly fonts built in", sc: true, others: false },
  { row: "Voice capture out of the box", sc: true, others: true },
  { row: "Energy-aware reminders", sc: true, others: false },
  { row: "Celebrates small wins", sc: true, others: false },
];

export default function FeaturesPage() {
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
            Built for how your brain actually works
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-4 text-gray-900 tracking-tight">
            Features that meet you{" "}
            <span className="text-blue-600">where you are</span>
          </h1>
          <p className="text-gray-500 text-base leading-relaxed max-w-xl mx-auto">
            SmartCompanion isn't another productivity app shouting at you to do more.
            It's a quiet co-pilot that breaks the wall between intention and action.
          </p>
        </div>
      </section>

      {/* Feature grid */}
      <section className="px-8 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto">
          {features.map((f, i) => (
            <div
              key={i}
              className="group relative bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300"
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform duration-200"
                style={{ background: f.bg }}
              >
                {f.icon}
              </div>
              <h3 className="font-bold text-base text-gray-900 mb-2">{f.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              <div
                className="mt-4 h-1 rounded-full w-8 group-hover:w-16 transition-all duration-300"
                style={{ background: f.accent }}
              />
            </div>
          ))}
        </div>
      </section>

      {/* Comparison */}
      <section className="px-8 pb-16">
        <div className="max-w-3xl mx-auto bg-linear-to-br from-blue-50 to-white border border-blue-100 rounded-3xl p-8">
          <h2 className="text-2xl font-extrabold text-gray-900 text-center mb-6 tracking-tight">
            How SmartCompanion compares
          </h2>
          <div className="divide-y divide-blue-100">
            <div className="grid grid-cols-[1fr_auto_auto] gap-6 py-3 text-xs font-bold text-gray-400 uppercase tracking-widest">
              <span></span>
              <span className="text-blue-600">SmartCompanion</span>
              <span>Other apps</span>
            </div>
            {comparison.map((row, i) => (
              <div
                key={i}
                className="grid grid-cols-[1fr_auto_auto] gap-6 py-3 items-center text-sm"
              >
                <span className="text-gray-700">{row.row}</span>
                <span className="justify-self-center text-blue-600 font-bold">
                  {row.sc ? "✓" : "—"}
                </span>
                <span className="justify-self-center text-gray-400">
                  {row.others ? "✓" : "—"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-8 pb-20">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-extrabold text-gray-900 mb-3 tracking-tight">
            Ready to feel less stuck?
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            Set up your neuro-profile in under two minutes.
          </p>
          <Link
            href="/login"
            className="inline-block px-6 py-3 rounded-full bg-linear-to-r from-blue-600 to-blue-500 text-white text-sm font-semibold shadow-lg shadow-blue-200 hover:shadow-blue-300 hover:-translate-y-0.5 transition-all duration-200"
          >
            Get Started Free
          </Link>
        </div>
      </section>
    </main>
  );
}
