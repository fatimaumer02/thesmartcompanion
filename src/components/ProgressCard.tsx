"use client";

import { useEffect, useMemo, useState } from "react";
import { readTasks, type Task } from "../lib/task";

function parseProgress(progress: string): { done: number; total: number } {
  const [d, t] = progress.split("/").map(Number);
  return { done: Number.isFinite(d) ? d : 0, total: Number.isFinite(t) ? t : 0 };
}

function isToday(ms: number): boolean {
  const d = new Date(ms);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

function startOfDay(ms: number): number {
  const d = new Date(ms);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function relativeDateLabel(ms: number): string {
  const d = new Date(ms);
  const diff = Math.round((startOfDay(Date.now()) - startOfDay(ms)) / 86_400_000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  if (diff < 7) return `${diff} days ago`;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

type DaySummary = {
  dayMs: number;
  label: string;
  completed: number;
  total: number;
  pct: number;
};

function summarizeByDay(tasks: Task[]): DaySummary[] {
  const buckets = new Map<number, Task[]>();
  for (const t of tasks) {
    const key = startOfDay(t.id);
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key)!.push(t);
  }
  return Array.from(buckets.entries())
    .sort((a, b) => b[0] - a[0])
    .map(([dayMs, dayTasks]) => {
      let completed = 0;
      for (const t of dayTasks) {
        const { done, total } = parseProgress(t.progress);
        if (total > 0 && done === total) completed += 1;
      }
      return {
        dayMs,
        label: relativeDateLabel(dayMs),
        completed,
        total: dayTasks.length,
        pct: dayTasks.length === 0 ? 0 : Math.round((completed / dayTasks.length) * 100),
      };
    });
}

export default function ProgressCard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    setTasks(readTasks());
    const onStorage = (e: StorageEvent) => {
      if (e.key === "userTasks") setTasks(readTasks());
    };
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

  // Esc closes the modal.
  useEffect(() => {
    if (!showHistory) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowHistory(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showHistory]);

  const { pct, completedCount, totalCount, hasTasks } = useMemo(() => {
    const todayTasks = tasks.filter((t) => isToday(t.id));
    if (todayTasks.length === 0) {
      return { pct: 0, completedCount: 0, totalCount: 0, hasTasks: false };
    }
    const completed = todayTasks.filter((t) => {
      const { done, total } = parseProgress(t.progress);
      return total > 0 && done === total;
    }).length;
    return {
      pct: Math.round((completed / todayTasks.length) * 100),
      completedCount: completed,
      totalCount: todayTasks.length,
      hasTasks: true,
    };
  }, [tasks]);

  const history = useMemo(() => summarizeByDay(tasks), [tasks]);

  return (
    <>
      <div className="relative bg-white rounded-2xl shadow-sm overflow-hidden p-4 sm:py-5 sm:px-6 sm:pl-8">

        {/* Left accent bar — matches TaskCard style */}
        <div className="absolute left-0 right-0 top-0 h-1 sm:right-auto sm:bottom-0 sm:h-auto sm:w-1.5 sm:rounded-l-2xl bg-linear-to-b from-emerald-400 to-emerald-600" />

        <div className="flex justify-between items-center mb-2 gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-sm font-semibold text-slate-700 truncate">
              Today&apos;s Progress
            </span>
            <button
              onClick={() => setShowHistory(true)}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors whitespace-nowrap"
              aria-label="View history"
            >
              History →
            </button>
          </div>

          <span className="text-sm font-bold text-emerald-500">
            {pct}%
          </span>
        </div>

        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-3 bg-linear-to-r from-emerald-400 to-emerald-600 rounded-full transition-all duration-700 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>

        <p className="text-[11px] text-slate-400 font-medium mt-2">
          {hasTasks
            ? `${completedCount} of ${totalCount} task${totalCount === 1 ? "" : "s"} completed`
            : "No tasks today yet — break one into steps to begin."}
        </p>
      </div>

      {/* ── History Modal ────────────────────────────────────────────── */}
      {showHistory && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 overflow-y-auto"
          onClick={() => setShowHistory(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="w-full max-w-md bg-white rounded-2xl shadow-2xl my-auto overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-linear-to-r from-emerald-500 to-emerald-600 px-6 py-5 text-center">
              <div className="text-3xl mb-1">📊</div>
              <h2 className="text-white font-bold text-lg">Your History</h2>
              <p className="text-emerald-100 text-xs mt-1">
                Daily progress across every task you&apos;ve broken down.
              </p>
            </div>

            <div className="px-4 py-4 max-h-[60vh] overflow-y-auto">
              {history.length === 0 ? (
                <p className="text-center text-sm text-slate-500 py-8">
                  No history yet — create a task to start building yours.
                </p>
              ) : (
                <div className="flex flex-col gap-2.5">
                  {history.map((day) => (
                    <div
                      key={day.dayMs}
                      className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3"
                    >
                      <div className="flex items-center justify-between mb-1.5 gap-3">
                        <span className="text-sm font-bold text-slate-800 truncate">
                          {day.label}
                        </span>
                        <span className="text-xs font-bold text-emerald-600 flex-shrink-0">
                          {day.pct}%
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-linear-to-r from-emerald-400 to-emerald-600 rounded-full"
                          style={{ width: `${day.pct}%` }}
                        />
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium mt-1.5">
                        {day.completed} of {day.total} task{day.total === 1 ? "" : "s"} completed
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="px-4 pb-4 pt-1 bg-white border-t border-slate-100">
              <button
                onClick={() => setShowHistory(false)}
                className="w-full bg-linear-to-r from-emerald-500 to-emerald-600 text-white font-bold py-3 rounded-xl text-sm hover:from-emerald-600 hover:to-emerald-700 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
