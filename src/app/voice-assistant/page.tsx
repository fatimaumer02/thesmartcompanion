"use client";

import { useState, useEffect } from "react";
import { Mic, Pencil } from "lucide-react";
import { useRouter } from "next/navigation";  // ← ADDED
import Sidebar from "../../components/Sidebar";
import useVapi from "../../app/hooks/useVapi";
import { applyTheme, type Theme } from "../../components/AppearanceBootstrap";

export default function VoiceInput() {
  const [taskText, setTaskText] = useState("");
  const [added, setAdded] = useState(false);
  const [loading, setLoading] = useState(false);  // ← ADDED
  const [pulseScale, setPulseScale] = useState(1);
  const [theme, setTheme] = useState<Theme>("Light");
  const router = useRouter();  // ← ADDED

  // ── Read theme from localStorage (set by settings page) ──
  useEffect(() => {
    try {
      const stored = localStorage.getItem("appearance.theme") as Theme | null;
      if (stored) {
        setTheme(stored);
        applyTheme(stored);
      }
    } catch {}
  }, []);

  // ── When Vapi gives final transcript → fill input box ──
  const handleTranscript = (text: string) => {
    setTaskText(text);
  };

  const { isSessionActive, volumeLevel, liveText, toggleCall } =
    useVapi(handleTranscript);

  // ── Pulse animation driven by real voice volume ──
  useEffect(() => {
    if (isSessionActive) {
      setPulseScale(1 + volumeLevel * 0.3);
    } else {
      setPulseScale(1);
    }
  }, [volumeLevel, isSessionActive]);

  // ← REPLACED handleAddTask completely
  const handleAddTask = async () => {
    if (!taskText.trim() || loading) return;
    setLoading(true);

    const prefs = (() => {
      try {
        const raw = localStorage.getItem("preferences");
        return raw ? JSON.parse(raw) : {};
      } catch { return {}; }
    })();

    try {
      const res = await fetch("/api/generate-steps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: taskText.trim(),
          neurotype: prefs.neurotypes,
          stepSize: prefs.support,
        }),
      });

      const data = await res.json();

      if (!res.ok || "error" in data) {
        setLoading(false);
        return;
      }

      sessionStorage.setItem(
        "currentTask",
        JSON.stringify({ title: data.title, steps: data.steps })
      );

      router.push("/taskinfo");

    } catch {
      setLoading(false);
    }
  };

  const isDark = theme === "Dark";

  return (
    <div className={`app-wrapper ${isDark ? "dark" : "light"}`}>
      <Sidebar />

      <div className="main-content">
        <div className="page">

          {/* Badge */}
          <div className="top-labels">
            <span className="badge-new">Vapi Voice AI</span>
          </div>

          {/* Title */}
          <h2 className="title">Add Task with Voice</h2>
          <p className="subtitle">
            Click the mic and speak your task
          </p>

          {/* Mic Button */}
          <div className="mic-container">
            <div
              className={`mic-outer-ring ${isSessionActive ? "listening" : ""}`}
              style={{
                transform: `scale(${pulseScale})`,
                transition: "transform 0.15s ease",
              }}
            >
              <div
                className={`mic-inner-ring ${isSessionActive ? "listening" : ""}`}
              >
                <button
                  className={`mic-btn ${isSessionActive ? "active" : ""}`}
                  onClick={toggleCall}
                  aria-label="Toggle voice input"
                >
                  <Mic color="white" size={32} />
                </button>
              </div>
            </div>

            {isSessionActive && (
              <p className="listening-label">
                <span className="dot" />
                {liveText ? `"${liveText}"` : "Listening..."}
              </p>
            )}
          </div>

          {/* Live Transcript Card */}
          {liveText && (
            <div className="live-card">
              <span className="live-dot" />
              <p className="live-text">{liveText}</p>
            </div>
          )}

          {/* Task Input */}
          <div className="input-row">
            <input
              type="text"
              className="task-input"
              value={taskText}
              onChange={(e) => setTaskText(e.target.value)}
              placeholder="Speak or type your task..."
            />
            <button className="edit-btn" aria-label="Edit task">
              <Pencil color="#2563eb" size={18} />
            </button>
          </div>

          {/* Add Task Button */}  {/* ← only className and disabled changed */}
          <button
            className={`add-btn ${loading ? "loading" : ""} ${added ? "success" : ""}`}
            onClick={handleAddTask}
            disabled={!taskText.trim() || loading}
          >
            {loading ? "Breaking into steps..." : added ? "✓ Task Added!" : "Add Task"}
          </button>

          {/* Tips Row */}
          <div className="tips-row">
            <div className="tip-card">
              <span className="tip-icon">🎙</span>
              <p className="tip-text">Speak clearly</p>
            </div>
            <div className="tip-card">
              <span className="tip-icon">⏱</span>
              <p className="tip-text">Keep it short</p>
            </div>
            <div className="tip-card">
              <span className="tip-icon">✅</span>
              <p className="tip-text">One task at a time</p>
            </div>
          </div>

        </div>
      </div>

      <style jsx>{`

        /* ── THEME VARIABLES ── */
        .light {
          --bg: #f0f4ff;
          --surface: #ffffff;
          --surface2: #eff6ff;
          --border: #dbeafe;
          --text-primary: #1e3a8a;
          --text-secondary: #64748b;
          --text-hint: #93a3b8;
          --badge-bg: #2563eb;
          --badge-text: #ffffff;
          --mic-outer: #dbeafe;
          --mic-outer-active: #bfdbfe;
          --mic-inner: #bfdbfe;
          --mic-inner-active: #93c5fd;
          --input-border: #dbeafe;
          --input-bg: #ffffff;
          --edit-bg: #eff6ff;
          --tip-bg: #eff6ff;
          --tip-border: #dbeafe;
          --live-bg: #eff6ff;
          --live-border: #93c5fd;
          --listening-color: #2563eb;
        }

        .dark {
          --bg: #0f172a;
          --surface: #1e293b;
          --surface2: #1e3a5f;
          --border: #1e40af;
          --text-primary: #e2e8f0;
          --text-secondary: #94a3b8;
          --text-hint: #475569;
          --badge-bg: #3b82f6;
          --badge-text: #ffffff;
          --mic-outer: #1e3a5f;
          --mic-outer-active: #1d4ed8;
          --mic-inner: #1d4ed8;
          --mic-inner-active: #2563eb;
          --input-border: #1e40af;
          --input-bg: #1e293b;
          --edit-bg: #1e3a5f;
          --tip-bg: #1e293b;
          --tip-border: #1e40af;
          --live-bg: #1e293b;
          --live-border: #3b82f6;
          --listening-color: #60a5fa;
        }

        /* ── LAYOUT ── */
        .app-wrapper {
          display: flex;
          min-height: 100vh;
          background: var(--bg);
          transition: background 0.3s ease;
          font-family: 'Nunito', sans-serif;
        }

        .main-content {
          margin-left: 256px;
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        /* ── PAGE ── */
        .page {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 48px 24px 48px;
        }

        /* ── BADGE ── */
        .top-labels {
          margin-bottom: 20px;
        }

        .badge-new {
          background: var(--badge-bg);
          color: var(--badge-text);
          font-size: 12px;
          font-weight: 700;
          border-radius: 20px;
          padding: 5px 14px;
          letter-spacing: 0.5px;
        }

        /* ── TITLE ── */
        .title {
          font-size: 26px;
          font-weight: 800;
          color: var(--text-primary);
          margin: 0 0 8px;
          text-align: center;
          transition: color 0.3s ease;
        }

        .subtitle {
          font-size: 14px;
          color: var(--text-hint);
          margin: 0 0 40px;
          text-align: center;
          font-weight: 500;
        }

        /* ── MIC ── */
        .mic-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
          margin-bottom: 28px;
        }

        .mic-outer-ring {
          width: 170px;
          height: 170px;
          border-radius: 50%;
          background: var(--mic-outer);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.3s ease;
        }

        .mic-outer-ring.listening {
          background: var(--mic-outer-active);
        }

        .mic-inner-ring {
          width: 126px;
          height: 126px;
          border-radius: 50%;
          background: var(--mic-inner);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.3s ease;
        }

        .mic-inner-ring.listening {
          background: var(--mic-inner-active);
        }

        .mic-btn {
          width: 88px;
          height: 88px;
          border-radius: 50%;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          box-shadow: 0 8px 24px rgba(37, 99, 235, 0.45);
          transition: all 0.2s ease;
        }

        .mic-btn:hover {
          transform: scale(1.06);
          box-shadow: 0 10px 28px rgba(37, 99, 235, 0.55);
        }

        .mic-btn.active {
          background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%);
          box-shadow: 0 8px 28px rgba(29, 78, 216, 0.6);
        }

        .listening-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          font-weight: 700;
          color: var(--listening-color);
          transition: color 0.3s ease;
        }

        .dot {
          width: 9px;
          height: 9px;
          background: var(--listening-color);
          border-radius: 50%;
          animation: blink 1s infinite;
        }

        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }

        /* ── LIVE CARD ── */
        .live-card {
          display: flex;
          align-items: center;
          gap: 10px;
          background: var(--live-bg);
          border: 1.5px solid var(--live-border);
          border-radius: 12px;
          padding: 12px 18px;
          margin-bottom: 20px;
          width: 100%;
          max-width: 380px;
          transition: all 0.3s ease;
        }

        .live-dot {
          width: 8px;
          height: 8px;
          min-width: 8px;
          background: #3b82f6;
          border-radius: 50%;
          animation: blink 0.8s infinite;
        }

        .live-text {
          font-size: 14px;
          color: var(--text-secondary);
          font-weight: 600;
          font-style: italic;
          margin: 0;
        }

        /* ── INPUT ── */
        .input-row {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          max-width: 380px;
          margin-bottom: 16px;
        }

        .task-input {
          flex: 1;
          border: 1.5px solid var(--input-border);
          border-radius: 14px;
          padding: 14px 18px;
          font-size: 14px;
          font-weight: 600;
          color: var(--text-primary);
          outline: none;
          background: var(--input-bg);
          font-family: 'Nunito', sans-serif;
          transition: all 0.3s ease;
        }

        .task-input:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
        }

        .task-input::placeholder {
          color: var(--text-hint);
        }

        .edit-btn {
          background: var(--edit-bg);
          border: 1.5px solid var(--input-border);
          border-radius: 12px;
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .edit-btn:hover {
          background: var(--border);
          transform: scale(1.05);
        }

        /* ── ADD BUTTON ── */
        .add-btn {
          width: 100%;
          max-width: 380px;
          padding: 16px;
          border-radius: 16px;
          border: none;
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: #fff;
          font-size: 16px;
          font-weight: 800;
          cursor: pointer;
          font-family: 'Nunito', sans-serif;
          transition: all 0.3s ease;
          box-shadow: 0 6px 20px rgba(37, 99, 235, 0.35);
          margin-bottom: 32px;
        }

        .add-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 28px rgba(37, 99, 235, 0.45);
        }

        .add-btn:disabled {
          opacity: 0.45;
          cursor: not-allowed;
        }

        .add-btn.success {
          background: linear-gradient(135deg, #22c55e, #16a34a);
          box-shadow: 0 6px 20px rgba(34, 197, 94, 0.35);
        }

        /* ← ADDED loading state */
        .add-btn.loading {
          background: linear-gradient(135deg, #6366f1, #4f46e5);
          box-shadow: 0 6px 20px rgba(99, 102, 241, 0.35);
          cursor: not-allowed;
        }

        /* ── TIPS ── */
        .tips-row {
          display: flex;
          gap: 12px;
          width: 100%;
          max-width: 380px;
        }

        .tip-card {
          flex: 1;
          background: var(--tip-bg);
          border: 1.5px solid var(--tip-border);
          border-radius: 14px;
          padding: 14px 10px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          transition: all 0.3s ease;
        }

        .tip-icon {
          font-size: 20px;
        }

        .tip-text {
          font-size: 11px;
          font-weight: 700;
          color: var(--text-secondary);
          text-align: center;
          margin: 0;
        }

      `}</style>
    </div>
  );
}