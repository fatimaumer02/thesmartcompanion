"use client";

import { useEffect, useMemo, useState } from "react";
import Sidebar from "../../components/Sidebar";
import { readTasks, type Task } from "../../lib/task";

// ─── Badges ───────────────────────────────────────────────────────────────────
type Stats = {
  tasksCompleted: number;
  totalSteps: number;
  streak: number;
};

type Badge = {
  id: string;
  name: string;
  desc: string;
  icon: string;
  // Color rings — matches the playful badge look from the original page.
  outerRing: string;
  midRing: string;
  innerBg: string;
  earned: (s: Stats) => boolean;
};

const BADGES: Badge[] = [
  {
    id: "first-win",
    name: "First Win",
    desc: "Complete your first task",
    icon: "⭐",
    outerRing: "#fde68a",
    midRing: "#fbbf24",
    innerBg: "#d97706",
    earned: (s) => s.tasksCompleted >= 1,
  },
  {
    id: "three-day-streak",
    name: "3-Day Streak",
    desc: "Active 3 days in a row",
    icon: "💧",
    outerRing: "#bae6fd",
    midRing: "#38bdf8",
    innerBg: "#0284c7",
    earned: (s) => s.streak >= 3,
  },
  {
    id: "focus-master",
    name: "Focus Master",
    desc: "Complete 10 tasks",
    icon: "🎯",
    outerRing: "#c7d2fe",
    midRing: "#6366f1",
    innerBg: "#1e1b5e",
    earned: (s) => s.tasksCompleted >= 10,
  },
  {
    id: "step-hero",
    name: "Step Hero",
    desc: "Complete 50 steps",
    icon: "👟",
    outerRing: "#fbcfe8",
    midRing: "#ec4899",
    innerBg: "#9d174d",
    earned: (s) => s.totalSteps >= 50,
  },
  {
    id: "week-warrior",
    name: "Week Warrior",
    desc: "7-day streak",
    icon: "🔥",
    outerRing: "#fed7aa",
    midRing: "#fb923c",
    innerBg: "#9a3412",
    earned: (s) => s.streak >= 7,
  },
  {
    id: "centurion",
    name: "Centurion",
    desc: "Complete 100 steps",
    icon: "💯",
    outerRing: "#bbf7d0",
    midRing: "#22c55e",
    innerBg: "#14532d",
    earned: (s) => s.totalSteps >= 100,
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function parseProgress(progress: string): { done: number; total: number } {
  const [d, t] = progress.split("/").map(Number);
  return { done: Number.isFinite(d) ? d : 0, total: Number.isFinite(t) ? t : 0 };
}

function dayKey(ms: number): string {
  const d = new Date(ms);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function computeStats(tasks: Task[]): Stats {
  let tasksCompleted = 0;
  let totalSteps = 0;
  const activeDays = new Set<string>();

  for (const t of tasks) {
    const { done, total } = parseProgress(t.progress);
    totalSteps += done;
    if (total > 0 && done === total) tasksCompleted += 1;
    activeDays.add(dayKey(t.id));
  }

  // Streak: consecutive calendar days ending today with task activity.
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    if (activeDays.has(key)) streak += 1;
    else break;
  }

  return { tasksCompleted, totalSteps, streak };
}

// ─── Components ───────────────────────────────────────────────────────────────
function CircleBadge({ badge, earned }: { badge: Badge; earned: boolean }) {
  const SIZE = 88;
  const cx = SIZE / 2;
  const outerR = cx;
  const midR = outerR - 8;
  const innerR = midR - 9;

  return (
    <div
      className={`flex flex-col items-center gap-2.5 transition-all duration-200 ${
        earned ? "" : "opacity-50"
      }`}
    >
      <div
        className={`relative ${earned ? "hover:scale-110" : ""}`}
        style={{
          width: SIZE,
          height: SIZE,
          transition: "transform 0.22s cubic-bezier(.34,1.56,.64,1)",
        }}
      >
        <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} className="block">
          <circle cx={cx} cy={cx} r={outerR} fill={earned ? badge.outerRing : "#f3f4f6"} />
          <circle cx={cx} cy={cx} r={midR} fill={earned ? badge.midRing : "#e5e7eb"} />
          <circle cx={cx} cy={cx} r={innerR} fill={earned ? badge.innerBg : "#d1d5db"} />
          {earned && (
            <path
              d={`M ${cx - innerR * 0.5} ${cx - innerR * 0.55} A ${innerR * 0.65} ${innerR * 0.65} 0 0 1 ${cx + innerR * 0.35} ${cx - innerR * 0.65}`}
              stroke="rgba(255,255,255,0.28)"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
            />
          )}
          {!earned && (
            <>
              <rect x={cx - 7} y={cx - 1} width="14" height="10" rx="2" fill="#9ca3af" />
              <path
                d={`M ${cx - 4} ${cx - 1} V ${cx - 5} a4 4 0 0 1 8 0 V ${cx - 1}`}
                stroke="#9ca3af"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
              />
            </>
          )}
        </svg>
        {earned && (
          <div className="absolute inset-0 flex items-center justify-center text-3xl leading-none">
            {badge.icon}
          </div>
        )}
      </div>
      <div className="text-center">
        <div className="text-[13px] font-extrabold text-slate-900">{badge.name}</div>
        <div className="text-[11px] text-slate-500 font-medium leading-snug max-w-[120px]">
          {badge.desc}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  value,
  label,
  color,
}: {
  value: number;
  label: string;
  color: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-blue-100 shadow-sm px-4 py-5 sm:py-6 text-center hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
      <div className={`text-3xl sm:text-4xl font-black leading-none mb-1.5 ${color}`}>
        {value}
      </div>
      <div className="text-xs text-slate-500 font-bold">{label}</div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function RewardsPage() {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    // Hydrate after mount so SSR + client markup match.
    setTasks(readTasks());

    // Cross-tab updates: if the user completes a step in another tab, the
    // "userTasks" storage event lets us refresh.
    const onStorage = (e: StorageEvent) => {
      if (e.key === "userTasks") setTasks(readTasks());
    };
    // Visibility: when the user navigates back to this tab from /taskinfo, refresh.
    const onVisible = () => {
      if (document.visibilityState === "visible") setTasks(readTasks());
    };
    window.addEventListener("storage", onStorage);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.removeEventListener("storage", onStorage);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  const stats = useMemo(() => computeStats(tasks), [tasks]);
  const badgesEarned = useMemo(
    () => BADGES.filter((b) => b.earned(stats)).length,
    [stats],
  );
  const recentCompleted = useMemo(
    () =>
      tasks
        .filter((t) => {
          const { done, total } = parseProgress(t.progress);
          return total > 0 && done === total;
        })
        .slice(-5)
        .reverse(),
    [tasks],
  );

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <main className="flex-1 min-h-screen bg-linear-to-br from-blue-50 via-indigo-50/40 to-blue-50 lg:ml-64 px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="max-w-4xl mx-auto">

          <h1 className="text-2xl sm:text-3xl font-black text-blue-900 tracking-tight mb-8 flex items-center gap-2">
            <span>🏆</span> Rewards
          </h1>

          {/* ── Stats ─────────────────────────────────────────── */}
          <section className="mb-10">
            <h2 className="text-xs sm:text-sm font-extrabold text-blue-700 uppercase tracking-widest mb-4">
              Your Achievements
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <StatCard
                value={stats.tasksCompleted}
                label="Tasks Completed"
                color="text-blue-600"
              />
              <StatCard
                value={stats.streak}
                label="Day Streak 🔥"
                color="text-amber-500"
              />
              <StatCard
                value={badgesEarned}
                label={`of ${BADGES.length} Badges Earned`}
                color="text-amber-500"
              />
            </div>
          </section>

          {/* ── Badges ────────────────────────────────────────── */}
          <section className="mb-10">
            <h2 className="text-xs sm:text-sm font-extrabold text-blue-700 uppercase tracking-widest mb-4">
              Badges
            </h2>
            <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-5 sm:p-8">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 sm:gap-8 justify-items-center">
                {BADGES.map((badge) => (
                  <CircleBadge
                    key={badge.id}
                    badge={badge}
                    earned={badge.earned(stats)}
                  />
                ))}
              </div>
            </div>
          </section>

          {/* ── Recent Activity ───────────────────────────────── */}
          <section className="pb-8">
            <h2 className="text-xs sm:text-sm font-extrabold text-blue-700 uppercase tracking-widest mb-4">
              Recent Activity
            </h2>
            {recentCompleted.length > 0 ? (
              <div className="flex flex-col gap-2.5">
                {recentCompleted.map((task) => {
                  const { total } = parseProgress(task.progress);
                  return (
                    <div
                      key={task.id}
                      className="bg-white rounded-xl border border-blue-100 shadow-sm px-4 sm:px-5 py-3 sm:py-4 flex items-center justify-between gap-3 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-7 h-7 rounded-full bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          ✓
                        </div>
                        <span className="text-sm font-semibold text-slate-800 truncate">
                          Completed &quot;{task.title}&quot;
                        </span>
                      </div>
                      <span className="text-[11px] sm:text-xs font-extrabold text-blue-600 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-full whitespace-nowrap">
                        +{total * 5} XP
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-blue-100 shadow-sm px-5 py-8 text-center">
                <p className="text-sm text-slate-500">
                  No completed tasks yet — finish your first to start earning badges.
                </p>
              </div>
            )}
          </section>

        </div>
      </main>
    </div>
  );
}
