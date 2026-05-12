"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

const neurotypes = ["ADHD", "Dyslexia", "Autism", "Other"];
const supportLevels = ["Very Small", "Normal", "Detailed"];
const readingPrefs = ["As Default", "As OpenDyslexic", "As Lexend"];
const reminders = ["Notification", "Voice", "Timer"];

const reminderIcons: Record<string, string> = {
  Notification: "📳",
  Voice: "🎙️",
  Timer: "⏱️",
};

const Pill = ({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={active}
    style={
      active
        ? {
          background: "linear-gradient(135deg, #3b82f6, #2563eb)",
          color: "#fff",
          borderColor: "transparent",
          boxShadow: "0 4px 14px rgba(124,58,237,0.32)",
          transform: "translateY(-2px)",
        }
        : undefined
    }
    className={`px-4 py-2 rounded-full border-[1.5px] text-sm font-semibold transition-all duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)] active:scale-95 hover:-translate-y-1 hover:scale-[1.05] ${
      active
        ? ""
        : "bg-white text-gray-500 border-gray-200 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 hover:shadow-md hover:shadow-blue-200/40"
    }`}
  >
    {label}
  </button>
);

function SectionCard({
  eyebrow,
  title,
  filled,
  children,
}: {
  eyebrow: string;
  title: string;
  filled: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`relative bg-white/70 backdrop-blur-sm rounded-2xl border p-6 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-200/30 ${
        filled
          ? "border-blue-300 shadow-md shadow-blue-200/40"
          : "border-gray-200/80 hover:border-blue-200"
      }`}
    >
      {/* Top-right completion tick */}
      <div
        className={`absolute top-4 right-4 w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold transition-all duration-300 ${
          filled
            ? "bg-linear-to-br from-blue-500 to-indigo-600 text-white scale-100 shadow-md shadow-blue-300/40"
            : "bg-gray-100 text-gray-300 scale-90"
        }`}
        aria-hidden
      >
        {filled ? "✓" : ""}
      </div>

      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">
        {eyebrow}
      </p>
      <h3 className="text-sm font-bold text-gray-800 mb-4">{title}</h3>
      {children}
    </div>
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

  const sections = useMemo(
    () => [
      selectedNeuro.length > 0,
      support !== "",
      reading !== "",
      selectedReminders.length > 0,
    ],
    [selectedNeuro, support, reading, selectedReminders]
  );
  const completedCount = sections.filter(Boolean).length;
  const totalSections = sections.length;
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
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-indigo-50/40 to-blue-50 px-4 sm:px-6 lg:px-10 py-8 lg:py-12 relative overflow-hidden">
      {/* Background blobs */}
      <div className="fixed top-[10%] -right-24 w-96 h-96 bg-blue-200 rounded-full blur-3xl opacity-25 pointer-events-none" />
      <div className="fixed bottom-[5%] -left-24 w-80 h-80 bg-indigo-200 rounded-full blur-3xl opacity-25 pointer-events-none" />

      <div className="relative w-full max-w-6xl mx-auto bg-white/85 backdrop-blur-xl rounded-3xl border border-violet-100/60 shadow-[0_20px_60px_rgba(124,58,237,0.10),0_4px_16px_rgba(0,0,0,0.06)] p-6 sm:p-10 lg:p-12">

        {/* ── Header ────────────────────────────────────────────── */}
        <div className="text-center mb-8 lg:mb-10">
          <div className="w-12 h-12 bg-linear-to-br from-blue-500 to-blue-700 rounded-[14px] flex items-center justify-center mx-auto mb-3 shadow-lg shadow-blue-200">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <path
                d="M11 3C7 3 4 6 4 10c0 2.5 1.2 4.7 3 6.1V18h8v-1.9c1.8-1.4 3-3.6 3-6.1 0-4-3-7-7-7z"
                fill="white"
                opacity="0.9"
              />
              <rect x="8" y="18" width="6" height="1.5" rx="0.75" fill="white" opacity="0.6" />
            </svg>
          </div>

          {/* Progress dots — animated based on actual completion */}
          <div className="flex gap-1.5 justify-center mb-3" aria-label={`${completedCount} of ${totalSections} sections complete`}>
            {sections.map((done, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  done
                    ? "w-8 bg-linear-to-r from-blue-600 to-indigo-500"
                    : "w-5 bg-gray-200"
                }`}
              />
            ))}
          </div>

          <h2
            className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight"
            style={{ fontFamily: "Syne, sans-serif" }}
          >
            Let&apos;s personalize your neuro-profile
          </h2>
          <p className="text-sm text-gray-500 mt-1.5">
            This helps AI give you the best support.
          </p>

          {/* Completion chip */}
          <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-bold text-blue-700">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            {completedCount} of {totalSections} categories complete · {Math.round(progressPct)}%
          </div>
        </div>

        {/* ── Section Grid ──────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-5 mb-8 lg:mb-10">

          {/* Neurotype */}
          <SectionCard
            eyebrow="🧠 Neurotype"
            title="Which best describes you?"
            filled={selectedNeuro.length > 0}
          >
            <div className="flex flex-wrap gap-2">
              {neurotypes.map((item) => (
                <Pill
                  key={item}
                  label={item}
                  active={selectedNeuro.includes(item)}
                  onClick={() => toggleMulti(item, selectedNeuro, setSelectedNeuro)}
                />
              ))}
            </div>
            <p className="text-[11px] text-gray-400 mt-3">Select all that apply.</p>
          </SectionCard>

          {/* Step Size */}
          <SectionCard
            eyebrow="⚡ Step Size"
            title="How do you prefer your steps?"
            filled={support !== ""}
          >
            <div className="flex flex-wrap gap-2">
              {supportLevels.map((item) => (
                <Pill
                  key={item}
                  label={item}
                  active={support === item}
                  onClick={() => setSupport(item)}
                />
              ))}
            </div>
            <p className="text-[11px] text-gray-400 mt-3">Pick one.</p>
          </SectionCard>

          {/* Reading */}
          <SectionCard
            eyebrow="📖 Reading"
            title="Pick a reading style"
            filled={reading !== ""}
          >
            <div className="flex flex-wrap gap-2">
              {readingPrefs.map((item) => (
                <Pill
                  key={item}
                  label={item}
                  active={reading === item}
                  onClick={() => setReading(item)}
                />
              ))}
            </div>
            <p className="text-[11px] text-gray-400 mt-3">Pick one.</p>
          </SectionCard>

          {/* Reminders */}
          <SectionCard
            eyebrow="🔔 Reminders"
            title="How should we nudge you?"
            filled={selectedReminders.length > 0}
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
                          background: "linear-gradient(160deg, #93c5fd, #2563eb)",
                          color: "#fff",
                          borderColor: "transparent",
                          boxShadow: "0 6px 18px rgba(124,58,237,0.30)",
                        }
                        : undefined
                    }
                    className={`group flex flex-col items-center justify-center gap-1.5 py-3.5 px-2 border-[1.5px] rounded-2xl text-xs font-bold transition-all duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)] active:scale-95 hover:-translate-y-1 hover:scale-105 ${
                      isActive
                        ? ""
                        : "bg-blue-50 text-blue-600 border-blue-300 hover:shadow-md hover:shadow-blue-200/40"
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
            <p className="text-[11px] text-gray-400 mt-3">Select all that apply.</p>
          </SectionCard>
        </div>

        {/* ── Continue ──────────────────────────────────────────── */}
        <button
          onClick={handleContinue}
          disabled={!allComplete}
          style={
            allComplete
              ? {
                background: "linear-gradient(135deg, #93c5fd, #2563eb)",
                boxShadow: "0 6px 20px rgba(124,58,237,0.30)",
              }
              : undefined
          }
          onMouseEnter={(e) => {
            if (!allComplete) return;
            (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 12px 28px rgba(124,58,237,0.42)";
            (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px) scale(1.005)";
          }}
          onMouseLeave={(e) => {
            if (!allComplete) return;
            (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 6px 20px rgba(124,58,237,0.30)";
            (e.currentTarget as HTMLButtonElement).style.transform = "none";
          }}
          className={`w-full py-4 rounded-2xl text-white font-bold text-sm transition-all duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)] active:scale-[0.98] ${
            allComplete
              ? ""
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
        >
          {allComplete
            ? "Save & Continue →"
            : `Complete ${totalSections - completedCount} more to continue`}
        </button>
      </div>
    </div>
  );
}
