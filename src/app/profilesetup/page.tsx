"use client";

import { useState } from "react";
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
      onClick={onClick}
      style={
        active
          ? {
            background: "linear-gradient(135deg, #3b82f6, #2563eb)",
            color: "#fff",
            borderColor: "transparent",
            boxShadow: "0 4px 14px rgba(124,58,237,0.32)",
            transform: "translateY(-2px)",
          }
          : {
            background: "#fff",
            color: "#6b7280",
            borderColor: "#e5e7eb",
          }
      }
      className="px-4 py-2 rounded-full border-[1.5px] text-sm font-semibold transition-all duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)] active:scale-95 hover:-translate-y-1 hover:scale-[1.05]"
      onMouseEnter={(e) => {
        if (!active) {
          (e.currentTarget as HTMLButtonElement).style.borderColor = "#93c5fd"; // light blue
          (e.currentTarget as HTMLButtonElement).style.color = "#2563eb";       // main blue
          (e.currentTarget as HTMLButtonElement).style.background = "#eff6ff";  // very light blue
          (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 12px rgba(124,58,237,0.15)";
        } else {
          (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 8px 20px rgba(124,58,237,0.42)";
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          (e.currentTarget as HTMLButtonElement).style.borderColor = "#e5e7eb";
          (e.currentTarget as HTMLButtonElement).style.color = "#6b7280";
          (e.currentTarget as HTMLButtonElement).style.background = "#fff";
          (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
        } else {
          (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 14px rgba(124,58,237,0.32)";
        }
      }}
    >
      {label}
    </button>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 via-blue-50 to-blue-50 p-5 relative overflow-hidden">
      {/* Background blobs */}
      <div className="fixed top-100px right-100px w-96 h-96 bg-blue-200 rounded-full blur-3xl opacity-20 pointer-events-none" />
      <div className="fixed bottom-80px left-80px w-80 h-80 bg-blue-200 rounded-full blur-3xl opacity-20 pointer-events-none" />

      <div className="bg-white/85 backdrop-blur-xl w-full max-w-420px p-7 rounded-3xl border border-violet-100/60 shadow-[0_20px_60px_rgba(124,58,237,0.10),0_4px_16px_rgba(0,0,0,0.06)]">

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-11 h-11 bg-linear-to-br from-blue-500 to-blue-700 rounded-[14px] flex items-center justify-center mx-auto mb-3 shadow-lg shadow-blue-200">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <path d="M11 3C7 3 4 6 4 10c0 2.5 1.2 4.7 3 6.1V18h8v-1.9c1.8-1.4 3-3.6 3-6.1 0-4-3-7-7-7z" fill="white" opacity="0.9" />
              <rect x="8" y="18" width="6" height="1.5" rx="0.75" fill="white" opacity="0.6" />
            </svg>
          </div>
          {/* Progress dots */}
          <div className="flex gap-1 justify-center mb-3">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className={`h-1 rounded-full transition-all duration-300 ${i < 2 ? "w-5 bg-linear-to-r from-blue-600 to-blue-500" : "w-5 bg-gray-200"}`} />
            ))}
          </div>
          <h2 className="text-base font-extrabold text-gray-900 tracking-tight" style={{ fontFamily: "Syne, sans-serif" }}>
            Let's personalize your neuro-profile
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            This helps AI give you the best support.
          </p>
        </div>

        {/* Neurotype */}
        <div className="mb-5">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">🧠 Neurotype</p>
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
        </div>

        <div className="h-px bg-linear-to-r from-transparent via-gray-200 to-transparent mb-5" />

        {/* Support */}
        <div className="mb-5">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">⚡ How do you prefer your steps?</p>
          <div className="flex gap-2">
            {supportLevels.map((item) => (
              <Pill
                key={item}
                label={item}
                active={support === item}
                onClick={() => setSupport(item)}
              />
            ))}
          </div>
        </div>

        <div className="h-px bg-linear-to-r from-transparent via-gray-200 to-transparent mb-5" />

        {/* Reading */}
        <div className="mb-5">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">📖 Reading Preference</p>
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
        </div>

        <div className="h-px bg-linear-to-r from-transparent via-gray-200 to-transparent mb-5" />

        {/* Reminders */}
        <div className="mb-6">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">🔔 Reminders</p>
          <div className="flex gap-3">
            {reminders.map((item) => (
              <button
                key={item}
                onClick={() => toggleMulti(item, selectedReminders, setSelectedReminders)}
                style={
                  selectedReminders.includes(item)
                    ? {
                      background: "linear-gradient(160deg, #93c5fd, #2563eb)",
                      color: "#fff",
                      borderColor: "transparent",
                      boxShadow: "0 6px 18px rgba(124,58,237,0.30)",
                    }
                    : {
                      background: "#eff6ff",
                      color: "#2563eb",
                      borderColor: "#93c5fd",
                    }
                }
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLButtonElement;
                  if (!selectedReminders.includes(item)) {
                    el.style.borderColor = "#93c5fd";
                    el.style.background = "#eff6ff";
                    el.style.color = "#2563eb";
                    el.style.boxShadow = "0 6px 16px rgba(124,58,237,0.15)";
                  } else {
                    el.style.boxShadow = "0 10px 24px rgba(124,58,237,0.4)";
                  }
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLButtonElement;
                  if (!selectedReminders.includes(item)) {
                    el.style.borderColor = "#93c5fd";
                    el.style.background = "#eff6ff";
                    el.style.color = "#2563eb";
                    el.style.boxShadow = "none";
                  } else {
                    el.style.boxShadow = "0 6px 18px rgba(124,58,237,0.30)";
                  }
                }}
                className="group flex-1 flex flex-col items-center justify-center gap-1.5 py-3 border-[1.5px] rounded-2xl text-xs font-bold transition-all duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)] active:scale-95 hover:-translate-y-1 hover:scale-105"
              >
                <span className="text-lg transition-transform duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-125 group-hover:-rotate-6">
                  {reminderIcons[item]}
                </span>
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* Button */}
        <button
          onClick={handleContinue}
          style={{ background: "linear-gradient(135deg, #93c5fd, #2563eb)", boxShadow: "0 6px 20px rgba(124,58,237,0.30)" }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 12px 28px rgba(124,58,237,0.42)";
            (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px) scale(1.01)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 6px 20px rgba(124,58,237,0.30)";
            (e.currentTarget as HTMLButtonElement).style.transform = "none";
          }}
          className="w-full py-3.5 rounded-2xl text-white font-bold text-sm transition-all duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)] active:scale-[0.98]"
        >
          Save & Continue →
        </button>
      </div>
    </div>
  );
}