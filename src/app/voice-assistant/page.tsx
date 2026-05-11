"use client";

import { useState, useEffect, useRef } from "react";
import Sidebar from "../../components/Sidebar";

export default function VoiceInput() {
  const [isListening, setIsListening] = useState(false);
  const [taskText, setTaskText] = useState("Clean the kitchen");
  const [pulseScale, setPulseScale] = useState(1);
  const [added, setAdded] = useState(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isListening) {
      intervalRef.current = setInterval(() => {
        setPulseScale((s) => (s === 1 ? 1.15 : 1));
      }, 600);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setPulseScale(1);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isListening]);

  const handleMicClick = () => setIsListening((prev) => !prev);

  const handleAddTask = () => {
    if (!taskText.trim()) return;

    setAdded(true);

    setTimeout(() => {
      setAdded(false);
      setTaskText("");
      setIsListening(false);
    }, 1500);
  };

  return (
    <div className="flex">

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="ml-64 flex-1">

        <div className="page">

          {/* Top label */}
          <div className="top-labels">
            <span className="badge-new">New Feature</span>
          </div>

          {/* Title */}
          <h2 className="title">Add Task with Voice</h2>

          <p className="subtitle">
            Click the mic and speak your task
          </p>

          {/* Mic Button */}
          <div className="mic-container">

            <div
              className={`mic-outer-ring ${
                isListening ? "listening" : ""
              }`}
              style={{
                transform: `scale(${pulseScale})`,
                transition: "transform 0.4s ease",
              }}
            >
              <div
                className={`mic-inner-ring ${
                  isListening ? "listening" : ""
                }`}
              >
                <button
                  className={`mic-btn ${
                    isListening ? "active" : ""
                  }`}
                  onClick={handleMicClick}
                  aria-label="Toggle voice input"
                >
                  <MicIcon />
                </button>
              </div>
            </div>

            {isListening && (
              <p className="listening-label">
                <span className="dot" />
                Listening...
              </p>
            )}
          </div>

          {/* Task Input */}
          <div className="input-row">

            <input
              type="text"
              className="task-input"
              value={taskText}
              onChange={(e) => setTaskText(e.target.value)}
              placeholder="Speak or type your task..."
            />

            <button
              className="edit-btn"
              aria-label="Edit task"
            >
              <PencilIcon />
            </button>
          </div>

          {/* Add Task Button */}
          <button
            className={`add-btn ${added ? "success" : ""}`}
            onClick={handleAddTask}
            disabled={!taskText.trim()}
          >
            {added ? "✓ Task Added!" : "Add Task"}
          </button>
        </div>

        <style jsx>{`
          @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap');

          * {
            box-sizing: border-box;
          }

          .page {
            display: flex;
            flex-direction: column;
            align-items: center;
            min-height: 100vh;
            padding: 48px 24px 40px;
            background: #f0f4ff;
            font-family: 'Nunito', sans-serif;
          }

          .top-labels {
            display: flex;
            gap: 8px;
            margin-bottom: 20px;
          }

          .badge-new {
            background: #2563eb;
            color: #fff;
            font-size: 12px;
            font-weight: 700;
            border-radius: 20px;
            padding: 4px 12px;
          }

          .title {
            font-size: 22px;
            font-weight: 800;
            color: #1e3a8a;
            margin: 0 0 6px;
            text-align: center;
          }

          .subtitle {
            font-size: 13px;
            color: #93a3b8;
            margin: 0 0 36px;
            text-align: center;
            font-weight: 500;
          }

          .mic-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 18px;
            margin-bottom: 36px;
          }

          .mic-outer-ring {
            width: 160px;
            height: 160px;
            border-radius: 50%;
            background: #dbeafe;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .mic-outer-ring.listening {
            background: #bfdbfe;
          }

          .mic-inner-ring {
            width: 120px;
            height: 120px;
            border-radius: 50%;
            background: #bfdbfe;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .mic-inner-ring.listening {
            background: #93c5fd;
          }

          .mic-btn {
            width: 84px;
            height: 84px;
            border-radius: 50%;
            border: none;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
            box-shadow: 0 6px 20px rgba(37, 99, 235, 0.45);
          }

          .mic-btn.active {
            background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%);
          }

          .listening-label {
            display: flex;
            align-items: center;
            gap: 7px;
            font-size: 14px;
            font-weight: 700;
            color: #2563eb;
          }

          .dot {
            width: 9px;
            height: 9px;
            background: #2563eb;
            border-radius: 50%;
          }

          .input-row {
            display: flex;
            align-items: center;
            gap: 10px;
            width: 100%;
            max-width: 360px;
            margin-bottom: 16px;
          }

          .task-input {
            flex: 1;
            border: 1.5px solid #dbeafe;
            border-radius: 12px;
            padding: 12px 16px;
            font-size: 14px;
            font-weight: 600;
            color: #1e3a8a;
            outline: none;
            background: #fff;
          }

          .edit-btn {
            background: #eff6ff;
            border: none;
            border-radius: 10px;
            width: 44px;
            height: 44px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
          }

          .add-btn {
            width: 100%;
            max-width: 360px;
            padding: 15px;
            border-radius: 14px;
            border: none;
            background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
            color: #fff;
            font-size: 16px;
            font-weight: 800;
            cursor: pointer;
          }

          .add-btn.success {
            background: linear-gradient(135deg, #22c55e, #16a34a);
          }
        `}</style>
      </div>
    </div>
  );
}

function MicIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
      <rect x="9" y="2" width="6" height="12" rx="3" fill="white" />
      <path
        d="M5 10a7 7 0 0 0 14 0"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      <line
        x1="12"
        y1="17"
        x2="12"
        y2="21"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PencilIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
        stroke="#2563eb"
        strokeWidth="2"
      />
    </svg>
  );
}