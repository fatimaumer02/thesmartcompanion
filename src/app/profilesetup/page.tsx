"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Button3D from "../../components/Button3D";
import TiltCard from "../../components/TiltCard";
import ProfileSetupScene from "../../components/ProfileSetupScene";

const neurotypes    = ["ADHD", "Dyslexia", "Autism", "Other"];
const supportLevels = ["Very Small", "Normal", "Detailed"];
const readingPrefs  = ["As Default", "As OpenDyslexic", "As Lexend"];

const STEP_DESCRIPTIONS: Record<string, string> = {
  "Very Small": "AI will break tasks into 8–9 tiny micro-steps. Perfect for getting started without overwhelm.",
  "Normal":     "AI will split tasks into 4–6 balanced steps. A good middle ground.",
  "Detailed":   "AI will give thorough steps with extra context and detail for each action.",
};

const READING_FONTS: Record<string, string> = {
  "As Default":      "'Inter', sans-serif",
  "As OpenDyslexic": "'Comic Sans MS', cursive",
  "As Lexend":       "'Georgia', serif",
};

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
  previewFont,
}: {
  label: string;
  active: boolean;
  accent: Accent;
  onClick: () => void;
  previewFont?: string;
}) => {
  const a = ACCENT[accent];
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      style={{
        ...(active ? {
          background: a.pillGradient,
          color: "#fff",
          borderColor: "transparent",
          boxShadow: a.pillShadow,
          transform: "translateY(-2px)",
        } : undefined),
        ...(previewFont ? { fontFamily: previewFont } : undefined),
      }}
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

  // ── CHANGED: single string (was string[]) ─────────────────────────────────
  const [selectedNeuro, setSelectedNeuro] = useState<string>("");
  const [support, setSupport] = useState("");
  const [reading, setReading] = useState("");

  // ── ADDED: apply font to page on reading change ───────────────────────────
  useEffect(() => {
    if (!reading) return;
    document.documentElement.style.fontFamily = READING_FONTS[reading] ?? "";
  }, [reading]);

  const filledSlots = useMemo(
    () => [selectedNeuro !== "", support !== "", reading !== ""],
    [selectedNeuro, support, reading]
  );

  const completedCount = filledSlots.filter(Boolean).length;
  const totalSections  = filledSlots.length;
  const allComplete    = completedCount === totalSections;
  const progressPct    = (completedCount / totalSections) * 100;

  const handleContinue = () => {
    // ── ADDED: stepSizeInstruction saved for AI ───────────────────────────
    const stepSizeInstruction = {
      "Very Small": "Break the task into 8 to 9 very small micro-steps. Each step should be extremely simple and take less than 2 minutes.",
      "Normal":     "Break the task into 4 to 6 balanced steps. Each step should be clear and straightforward.",
      "Detailed":   "Break the task into detailed steps with thorough instructions and context for each action. Include up to 10 steps if needed.",
    }[support] ?? "";

    localStorage.setItem(
      "preferences",
      JSON.stringify({
        neurotypes:          [selectedNeuro], // keep array for API compatibility
        support,
        stepSizeInstruction,
        reading,
        readingFont:         READING_FONTS[reading] ?? "",
      })
    );
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="fixed inset-0 bg-linear-to-br from-slate-950 via-indigo-950/80 to-slate-950 -z-20" />
      <div className="fixed top-[8%] -right-32 w-32rem h-32rem bg-blue-500 rounded-full blur-[120px] opacity-30 pointer-events-none -z-10 animate-pulse" style={{ animationDuration: "8s" }} />
      <div className="fixed bottom-[5%] -left-32 w-28rem h-28rem bg-violet-500 rounded-full blur-[120px] opacity-25 pointer-events-none -z-10 animate-pulse" style={{ animationDuration: "10s", animationDelay: "1s" }} />
      <div className="fixed top-1/3 left-1/2 w-72 h-72 bg-cyan-400 rounded-full blur-[100px] opacity-15 pointer-events-none -z-10 -translate-x-1/2" />

      <div
        aria-hidden
        className="fixed inset-0 pointer-events-none -z-10 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <style>{`
        @keyframes shimmer {
          from { background-position: 0% 0; }
          to { background-position: 200% 0; }
        }
      `}</style>

      <div className="relative z-10 px-4 sm:px-6 lg:px-10 py-8 lg:py-12">
        <div className="relative w-full max-w-6xl mx-auto bg-white/0.04 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-[0_20px_80px_-20px_rgba(99,102,241,0.45)] p-6 sm:p-10 lg:p-12">

          <div className="text-center mb-8 lg:mb-10">
            <div className="w-full max-w-md mx-auto h-56 sm:h-64 -mb-2">
              <ProfileSetupScene filledSlots={filledSlots} progress={progressPct / 100} />
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

            <div className="max-w-md mx-auto px-2" aria-label={`${completedCount} of ${totalSections} sections complete`}>
              <div className="flex items-center justify-between mb-2 text-xs">
                <span className="font-bold text-slate-300">{completedCount} of {totalSections} complete</span>
                <span className="font-mono font-bold text-blue-300 tabular-nums">{Math.round(progressPct)}%</span>
              </div>
              <div className="relative h-2 bg-white/10 rounded-full overflow-hidden border border-white/5">
                <div
                  className="absolute inset-y-0 left-0 bg-linear-to-r from-blue-500 via-indigo-500 to-violet-500 rounded-full transition-all duration-700 ease-out shadow-[0_0_18px_rgba(99,102,241,0.6)]"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-5 mb-8 lg:mb-10">

            {/* Card 1 — Neurotype: SINGLE select */}
            <SectionCard
              eyebrow="🧠 Neurotype"
              title="Which best describes you?"
              filled={selectedNeuro !== ""}
              accent="blue"
            >
              <div className="flex flex-wrap gap-2">
                {neurotypes.map((item) => (
                  <Pill
                    key={item}
                    label={item}
                    active={selectedNeuro === item}
                    accent="blue"
                    onClick={() => setSelectedNeuro(item === selectedNeuro ? "" : item)}
                  />
                ))}
              </div>
              <p className="text-[11px] text-slate-400 mt-3">Select one that fits best.</p>
            </SectionCard>

            {/* Card 2 — Step Size: description preview */}
            <SectionCard
              eyebrow="⚡ Step Size"
              title="How do you prefer your steps?"
              filled={support !== ""}
              accent="emerald"
            >
              <div className="flex flex-wrap gap-2 mb-3">
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
              {support ? (
                <p className="text-[12px] text-emerald-300/90 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-2 leading-relaxed">
                  {STEP_DESCRIPTIONS[support]}
                </p>
              ) : (
                <p className="text-[11px] text-slate-400">Pick one — AI adjusts step count accordingly.</p>
              )}
            </SectionCard>

            {/* Card 3 — Reading Style: font preview per pill */}
            <SectionCard
              eyebrow="📖 Reading"
              title="Pick a reading style"
              filled={reading !== ""}
              accent="amber"
            >
              <div className="flex flex-wrap gap-2 mb-3">
                {readingPrefs.map((item) => (
                  <Pill
                    key={item}
                    label={item}
                    active={reading === item}
                    accent="amber"
                    onClick={() => setReading(item)}
                    previewFont={READING_FONTS[item]}
                  />
                ))}
              </div>
              {reading ? (
                <p
                  className="text-[12px] text-amber-200/90 bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-2 leading-relaxed"
                  style={{ fontFamily: READING_FONTS[reading] }}
                >
                  This is how your text will look throughout the app.
                </p>
              ) : (
                <p className="text-[11px] text-slate-400">Your chosen font will apply across the whole app.</p>
              )}
            </SectionCard>

          </div>

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