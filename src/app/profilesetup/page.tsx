"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Button3D from "../../components/Button3D";
import TiltCard from "../../components/TiltCard";
import ProfileSetupScene from "../../components/ProfileSetupScene";

const neurotypes = ["ADHD", "Dyslexia", "Autism", "Other"];
const supportLevels = ["Very Small", "Normal", "Detailed"];
const readingPrefs = ["As Default", "As OpenDyslexic", "As Lexend"];
const reminders = ["Notification", "Voice", "Timer"];

const reminderIcons: Record<string, string> = {
  Notification: "📳",
  Voice: "🎙️",
  Timer: "⏱️",
};

// ── Per-category color tokens — drive accent + glow when a section is filled.
type Accent = "blue" | "emerald" | "amber" | "violet";

const ACCENT: Record<Accent, {
  pillGradient: string;
  pillShadow: string;
  cardGlow: string;
  cardBorder: string;
  tick: string;
  hex: string;
}> = {
  blue: {
    pillGradient: "linear-gradient(135deg, #3b82f6, #2563eb)",
    pillShadow: "0 6px 22px rgba(37,99,235,0.45)",
    cardGlow: "shadow-[0_0_40px_rgba(59,130,246,0.35)]",
    cardBorder: "border-blue-400/60",
    tick: "from-blue-500 to-indigo-600",
    hex: "#3b82f6",
  },
  emerald: {
    pillGradient: "linear-gradient(135deg, #34d399, #059669)",
    pillShadow: "0 6px 22px rgba(16,185,129,0.45)",
    cardGlow: "shadow-[0_0_40px_rgba(16,185,129,0.35)]",
    cardBorder: "border-emerald-400/60",
    tick: "from-emerald-500 to-green-600",
    hex: "#10b981",
  },
  amber: {
    pillGradient: "linear-gradient(135deg, #fbbf24, #d97706)",
    pillShadow: "0 6px 22px rgba(217,119,6,0.45)",
    cardGlow: "shadow-[0_0_40px_rgba(245,158,11,0.35)]",
    cardBorder: "border-amber-400/60",
    tick: "from-amber-500 to-orange-600",
    hex: "#f59e0b",
  },
  violet: {
    pillGradient: "linear-gradient(135deg, #a78bfa, #7c3aed)",
    pillShadow: "0 6px 22px rgba(124,58,237,0.45)",
    cardGlow: "shadow-[0_0_40px_rgba(139,92,246,0.35)]",
    cardBorder: "border-violet-400/60",
    tick: "from-violet-500 to-purple-600",
    hex: "#8b5cf6",
  },
};

const Pill = ({
  label,
  active,
  accent,
  onClick,
}: {
  label: string;
  active: boolean;
  accent: Accent;
  onClick: () => void;
}) => {
  const a = ACCENT[accent];
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      style={
        active
          ? {
            background: a.pillGradient,
            color: "#fff",
            borderColor: "transparent",
            boxShadow: a.pillShadow,
            transform: "translateY(-2px)",
          }
          : undefined
      }
      className={`px-4 py-2 rounded-full border-[1.5px] text-sm font-semibold transition-all duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)] active:scale-95 hover:-translate-y-1 hover:scale-[1.05] ${
        active
          ? ""
          : "bg-white/40 dark:bg-slate-900/40 text-slate-700 dark:text-slate-300 border-white/40 dark:border-white/10 backdrop-blur-md hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50/60"
      }`}
    >
      {label}
    </button>
  );
};

function SectionCard({
  eyebrow,
  title,
  filled,
  accent,
  children,
}: {
  eyebrow: string;
  title: string;
  filled: boolean;
  accent: Accent;
  children: React.ReactNode;
}) {
  const a = ACCENT[accent];
  return (
    <TiltCard maxTilt={6} className="h-full">
      <div
        className={`relative h-full flex flex-col rounded-2xl p-6 transition-all duration-500 overflow-hidden ${
          filled
            ? `bg-white/15 backdrop-blur-2xl border ${a.cardBorder} ${a.cardGlow}`
            : "bg-white/10 backdrop-blur-2xl border border-white/20 hover:border-white/40 hover:bg-white/15"
        }`}
      >
        {/* Animated gradient border (only visible when filled) */}
        {filled && (
          <div
            aria-hidden
            className="absolute inset-0 rounded-2xl opacity-30 pointer-events-none"
            style={{
              background: `linear-gradient(120deg, transparent, ${a.hex}33, transparent)`,
              backgroundSize: "200% 100%",
              animation: "shimmer 3s linear infinite",
            }}
          />
        )}

        {/* Top-right completion tick — bounces into view when filled */}
        <div
          className={`absolute top-4 right-4 w-7 h-7 rounded-full flex items-center justify-center text-[13px] font-bold transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] z-10 ${
            filled
              ? `bg-linear-to-br ${a.tick} text-white scale-100 shadow-lg ${a.cardGlow}`
              : "bg-white/10 text-white/20 scale-90 border border-white/10"
          }`}
          aria-hidden
        >
          {filled ? "✓" : ""}
        </div>

        <div className="relative z-10">
          <p className="text-[11px] font-bold text-blue-300/80 uppercase tracking-widest mb-1">
            {eyebrow}
          </p>
          <h3 className="text-sm font-bold text-white mb-4">{title}</h3>
          {children}
        </div>
      </div>
    </TiltCard>
  );
}

export default function ProfileSetup() {
  const router = useRouter();

  const [selectedNeuro, setSelectedNeuro] = useState<string[]>([]);
  const [support, setSupport] = useState("");
  const [reading, setReading] = useState("");
  const [selectedReminders, setSelectedReminders] = useState<string[]>([]);

  const toggleMulti = (
    value: string,
    list: string[],
    setList: (val: string[]) => void
  ) => {
    if (list.includes(value)) {
      setList(list.filter((item) => item !== value));
    } else {
      setList([...list, value]);
    }
  };

  const filledSlots = useMemo(
    () => [
      selectedNeuro.length > 0,
      support !== "",
      reading !== "",
      selectedReminders.length > 0,
    ],
    [selectedNeuro, support, reading, selectedReminders]
  );
  const completedCount = filledSlots.filter(Boolean).length;
  const totalSections = filledSlots.length;
  const allComplete = completedCount === totalSections;
  const progressPct = (completedCount / totalSections) * 100;

  const handleContinue = () => {
    const data = {
      neurotypes: selectedNeuro,
      support,
      reading,
      reminders: selectedReminders,
    };
    localStorage.setItem("preferences", JSON.stringify(data));
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* ── Futuristic backdrop — dark space with drifting blobs ────────────── */}
      <div className="fixed inset-0 bg-linear-to-br from-slate-950 via-indigo-950/80 to-slate-950 -z-20" />
      <div className="fixed top-[8%] -right-32 w-[32rem] h-[32rem] bg-blue-500 rounded-full blur-[120px] opacity-30 pointer-events-none -z-10 animate-pulse" style={{ animationDuration: "8s" }} />
      <div className="fixed bottom-[5%] -left-32 w-[28rem] h-[28rem] bg-violet-500 rounded-full blur-[120px] opacity-25 pointer-events-none -z-10 animate-pulse" style={{ animationDuration: "10s", animationDelay: "1s" }} />
      <div className="fixed top-1/3 left-1/2 w-72 h-72 bg-cyan-400 rounded-full blur-[100px] opacity-15 pointer-events-none -z-10 -translate-x-1/2" />

      {/* Subtle grid overlay for futuristic feel */}
      <div
        aria-hidden
        className="fixed inset-0 pointer-events-none -z-10 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* Keyframes for the shimmer animation on filled card borders */}
      <style>{`
        @keyframes shimmer {
          from { background-position: 0% 0; }
          to { background-position: 200% 0; }
        }
      `}</style>

      <div className="relative z-10 px-4 sm:px-6 lg:px-10 py-8 lg:py-12">
        <div className="relative w-full max-w-6xl mx-auto bg-white/[0.04] backdrop-blur-2xl rounded-3xl border border-white/10 shadow-[0_20px_80px_-20px_rgba(99,102,241,0.45)] p-6 sm:p-10 lg:p-12">

          {/* ── Hero — 3D scene replaces the static icon ───────────────────── */}
          <div className="text-center mb-8 lg:mb-10">
            <div className="w-full max-w-md mx-auto h-56 sm:h-64 -mb-2">
              <ProfileSetupScene
                filledSlots={filledSlots}
                progress={progressPct / 100}
              />
            </div>

            <h2
              className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2"
              style={{ fontFamily: "Syne, sans-serif" }}
            >
              Let&apos;s personalize your{" "}
              <span className="bg-linear-to-r from-blue-400 via-indigo-400 to-violet-400 bg-clip-text text-transparent">
                neuro-profile
              </span>
            </h2>
            <p className="text-sm text-slate-400 mb-6 max-w-md mx-auto">
              A few quick taps so the AI can support you the way you actually need.
            </p>

            {/* Progress bar */}
            <div
              className="max-w-md mx-auto px-2"
              aria-label={`${completedCount} of ${totalSections} sections complete`}
            >
              <div className="flex items-center justify-between mb-2 text-xs">
                <span className="font-bold text-slate-300">
                  {completedCount} of {totalSections} complete
                </span>
                <span className="font-mono font-bold text-blue-300 tabular-nums">
                  {Math.round(progressPct)}%
                </span>
              </div>
              <div className="relative h-2 bg-white/10 rounded-full overflow-hidden border border-white/5">
                <div
                  className="absolute inset-y-0 left-0 bg-linear-to-r from-blue-500 via-indigo-500 to-violet-500 rounded-full transition-all duration-700 ease-out shadow-[0_0_18px_rgba(99,102,241,0.6)]"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          </div>

          {/* ── Section Grid ──────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-5 mb-8 lg:mb-10">
            <SectionCard
              eyebrow="🧠 Neurotype"
              title="Which best describes you?"
              filled={selectedNeuro.length > 0}
              accent="blue"
            >
              <div className="flex flex-wrap gap-2">
                {neurotypes.map((item) => (
                  <Pill
                    key={item}
                    label={item}
                    active={selectedNeuro.includes(item)}
                    accent="blue"
                    onClick={() => toggleMulti(item, selectedNeuro, setSelectedNeuro)}
                  />
                ))}
              </div>
              <p className="text-[11px] text-slate-400 mt-3">Select all that apply.</p>
            </SectionCard>

            <SectionCard
              eyebrow="⚡ Step Size"
              title="How do you prefer your steps?"
              filled={support !== ""}
              accent="emerald"
            >
              <div className="flex flex-wrap gap-2">
                {supportLevels.map((item) => (
                  <Pill
                    key={item}
                    label={item}
                    active={support === item}
                    accent="emerald"
                    onClick={() => setSupport(item)}
                  />
                ))}
              </div>
              <p className="text-[11px] text-slate-400 mt-3">Pick one.</p>
            </SectionCard>

            <SectionCard
              eyebrow="📖 Reading"
              title="Pick a reading style"
              filled={reading !== ""}
              accent="amber"
            >
              <div className="flex flex-wrap gap-2">
                {readingPrefs.map((item) => (
                  <Pill
                    key={item}
                    label={item}
                    active={reading === item}
                    accent="amber"
                    onClick={() => setReading(item)}
                  />
                ))}
              </div>
              <p className="text-[11px] text-slate-400 mt-3">Pick one.</p>
            </SectionCard>

            <SectionCard
              eyebrow="🔔 Reminders"
              title="How should we nudge you?"
              filled={selectedReminders.length > 0}
              accent="violet"
            >
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {reminders.map((item) => {
                  const isActive = selectedReminders.includes(item);
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggleMulti(item, selectedReminders, setSelectedReminders)}
                      aria-pressed={isActive}
                      style={
                        isActive
                          ? {
                            background: ACCENT.violet.pillGradient,
                            color: "#fff",
                            borderColor: "transparent",
                            boxShadow: ACCENT.violet.pillShadow,
                          }
                          : undefined
                      }
                      className={`group flex flex-col items-center justify-center gap-1.5 py-3.5 px-2 border-[1.5px] rounded-2xl text-xs font-bold transition-all duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)] active:scale-95 hover:-translate-y-1 hover:scale-105 ${
                        isActive
                          ? ""
                          : "bg-white/5 text-violet-200 border-violet-400/40 hover:bg-white/10 hover:border-violet-300 hover:shadow-md hover:shadow-violet-500/40"
                      }`}
                    >
                      <span className="text-xl transition-transform duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-125 group-hover:-rotate-6">
                        {reminderIcons[item]}
                      </span>
                      {item}
                    </button>
                  );
                })}
              </div>
              <p className="text-[11px] text-slate-400 mt-3">Select all that apply.</p>
            </SectionCard>
          </div>

          {/* ── Continue ─────────────────────────────────────────────────── */}
          <div className="relative">
            {allComplete && (
              <div
                className="absolute inset-0 bg-linear-to-r from-blue-500 via-indigo-500 to-violet-500 rounded-2xl blur-2xl opacity-60 -z-10 animate-pulse"
                style={{ animationDuration: "2s" }}
              />
            )}
            <Button3D
              onClick={handleContinue}
              disabled={!allComplete}
              shadowColor={allComplete ? "indigo" : "slate"}
              style={
                allComplete
                  ? { background: "linear-gradient(135deg, #3b82f6, #6366f1, #8b5cf6)" }
                  : undefined
              }
              className={`w-full py-4 rounded-2xl text-white font-bold text-sm relative overflow-hidden ${
                allComplete
                  ? ""
                  : "bg-white/5 text-slate-400 border border-white/10 cursor-not-allowed backdrop-blur-md"
              }`}
            >
              {allComplete ? (
                <span className="inline-flex items-center gap-2">
                  <span>Save & Continue</span>
                  <span className="text-base">→</span>
                </span>
              ) : (
                `Complete ${totalSections - completedCount} more to continue`
              )}
            </Button3D>
          </div>
        </div>
      </div>
    </div>
  );
}
