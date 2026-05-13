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

export default function ProgressCard() {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    // Hydrate after mount so SSR markup matches client.
    setTasks(readTasks());

    // Live updates from other tabs.
    const onStorage = (e: StorageEvent) => {
      if (e.key === "userTasks") setTasks(readTasks());
    };
    // Refresh when user returns from /taskinfo with new progress.
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

  return (
    <div className="relative bg-white rounded-2xl shadow-sm overflow-hidden p-4 sm:py-5 sm:px-6 sm:pl-8">

      {/* Left accent bar — matches TaskCard style */}
      <div className="absolute left-0 right-0 top-0 h-1 sm:right-auto sm:bottom-0 sm:h-auto sm:w-1.5 sm:rounded-l-2xl bg-linear-to-b from-emerald-400 to-emerald-600" />

      <div className="flex justify-between items-center mb-2 gap-3">
        <span className="text-sm font-semibold text-slate-700">
          Today&apos;s Progress
        </span>

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
  );
}
