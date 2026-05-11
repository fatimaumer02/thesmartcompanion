"use client";

import Sidebar from "../../components/Sidebar";

const achievements = [
  { value: "12", label: "Tasks Completed", color: "#2563eb" },
  { value: "5",  label: "Day Streak 🔥",   color: "#f59e0b" },
  { value: "3",  label: "Badges Earned",   color: "#f59e0b" },
];

const badges = [
  {
    id: 1,
    name: "First Win",
    desc: "Complete your first task",
    outerRing: "#fde68a",
    midRing:   "#fbbf24",
    innerBg:   "#d97706",
    icon: "⭐",
    earned: true,
  },
  {
    id: 2,
    name: "3 Day Streak",
    desc: "Complete tasks 3 days in a row",
    outerRing: "#bae6fd",
    midRing:   "#38bdf8",
    innerBg:   "#0284c7",
    icon: "💧",
    earned: true,
  },
  {
    id: 3,
    name: "Focus Master",
    desc: "Complete 10 tasks in focus mode",
    outerRing: "#c7d2fe",
    midRing:   "#6366f1",
    innerBg:   "#1e1b5e",
    icon: "🎯",
    earned: true,
  },
  {
    id: 4,
    name: "More",
    desc: "Coming Soon",
    outerRing: "#f3f4f6",
    midRing:   "#e5e7eb",
    innerBg:   "#d1d5db",
    icon: null,
    earned: false,
  },
];

const recentActivity = [
  { text: 'Completed "Clean my room"', xp: "+10 XP" },
  { text: 'Completed "Read 20 pages"', xp: "+15 XP" },
];

function CircleBadge({ badge }: { badge: { id: number; name: string; desc: string; outerRing: string; midRing: string; innerBg: string; icon: string | null; earned: boolean; } }) {
  const SIZE = 88;
  const cx = SIZE / 2;
  const outerR = cx;
  const midR   = outerR - 8;
  const innerR = midR - 9;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, width: 110, opacity: badge.earned ? 1 : 0.5 }}>
      <div
        style={{ position: "relative", width: SIZE, height: SIZE, cursor: badge.earned ? "pointer" : "default", transition: "transform 0.22s cubic-bezier(.34,1.56,.64,1)" }}
        onMouseEnter={e => { if (badge.earned) e.currentTarget.style.transform = "scale(1.1)"; }}
        onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}
      >
        <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} style={{ display: "block" }}>
          {/* Outer pale ring */}
          <circle cx={cx} cy={cx} r={outerR} fill={badge.outerRing} />
          {/* Mid ring */}
          <circle cx={cx} cy={cx} r={midR} fill={badge.midRing} />
          {/* Inner dark circle */}
          <circle cx={cx} cy={cx} r={innerR} fill={badge.innerBg} />
          {/* Shine arc */}
          {badge.earned && (
            <path
              d={`M ${cx - innerR * 0.5} ${cx - innerR * 0.55} A ${innerR * 0.65} ${innerR * 0.65} 0 0 1 ${cx + innerR * 0.35} ${cx - innerR * 0.65}`}
              stroke="rgba(255,255,255,0.28)"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
            />
          )}
          {/* Lock for uneearned */}
          {!badge.earned && (
            <>
              <rect x={cx - 7} y={cx - 1} width="14" height="10" rx="2" fill="#9ca3af" />
              <path d={`M ${cx - 4} ${cx - 1} V ${cx - 5} a4 4 0 0 1 8 0 V ${cx - 1}`} stroke="#9ca3af" strokeWidth="2" fill="none" strokeLinecap="round" />
            </>
          )}
        </svg>

        {/* Emoji overlaid */}
        {badge.earned && (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, lineHeight: 1 }}>
            {badge.icon}
          </div>
        )}
      </div>

      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: "#111827", marginBottom: 3 }}>{badge.name}</div>
        <div style={{ fontSize: 11, color: "#6b7280", fontWeight: 500, lineHeight: 1.45 }}>{badge.desc}</div>
      </div>
    </div>
  );
}

export default function RewardsPage() {
  return (
    <div className="flex">
      <Sidebar />

      <div
        style={{
          flex: 1,
          marginLeft: "256px",
          minHeight: "100vh",
          background: "#f0f6ff",
          fontFamily: "'Nunito', sans-serif",
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          padding: "48px 24px",
        }}
      >
        <div style={{ width: "100%", maxWidth: 680 }}>

          <h1 style={{ fontSize: 28, fontWeight: 900, color: "#1e3a8a", marginBottom: 32, letterSpacing: "-0.5px" }}>
            🏆 Rewards
          </h1>

          {/* Achievements */}
          <section style={{ marginBottom: 36 }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, marginBottom: 16, color: "#1e40af", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Your Achievements
            </h2>
            <div style={{ display: "flex", gap: 14 }}>
              {achievements.map((a) => (
                <div
                  key={a.label}
                  style={{ flex: 1, background: "#fff", borderRadius: 16, padding: "22px 16px", textAlign: "center", boxShadow: "0 2px 12px rgba(59,130,246,0.10)", border: "1.5px solid #bfdbfe", transition: "transform 0.18s, box-shadow 0.18s" }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(59,130,246,0.18)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 2px 12px rgba(59,130,246,0.10)"; }}
                >
                  <div style={{ fontSize: 38, fontWeight: 900, color: a.color, lineHeight: 1, marginBottom: 6 }}>{a.value}</div>
                  <div style={{ fontSize: 12, color: "#6b7280", fontWeight: 700 }}>{a.label}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Badges */}
          <section style={{ marginBottom: 36 }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, marginBottom: 16, color: "#1e40af", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Badges
            </h2>
            <div style={{ background: "#fff", borderRadius: 20, border: "1.5px solid #bfdbfe", boxShadow: "0 2px 12px rgba(59,130,246,0.08)", padding: "32px 24px", display: "flex", justifyContent: "space-around", alignItems: "flex-start" }}>
              {badges.map((badge) => <CircleBadge key={badge.id} badge={badge} />)}
            </div>
          </section>

          {/* Recent Activity */}
          <section>
            <h2 style={{ fontSize: 16, fontWeight: 800, marginBottom: 16, color: "#1e40af", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Recent Activity
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {recentActivity.map((item, i) => (
                <div
                  key={i}
                  style={{ background: "#fff", borderRadius: 14, padding: "15px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", border: "1.5px solid #bfdbfe", boxShadow: "0 1px 6px rgba(59,130,246,0.07)", transition: "box-shadow 0.18s" }}
                  onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 4px 16px rgba(59,130,246,0.14)")}
                  onMouseLeave={e => (e.currentTarget.style.boxShadow = "0 1px 6px rgba(59,130,246,0.07)")}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg,#3b82f6,#1d4ed8)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: "#fff", fontWeight: 800, flexShrink: 0 }}>✓</div>
                    <span style={{ fontSize: 13.5, fontWeight: 600, color: "#111827" }}>{item.text}</span>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 800, color: "#2563eb", background: "#dbeafe", padding: "4px 13px", borderRadius: 20, whiteSpace: "nowrap" }}>{item.xp}</span>
                </div>
              ))}
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}