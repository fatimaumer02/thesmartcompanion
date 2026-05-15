"use client";

import { Bell } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  getNotifications,
  markAllAsRead,
  markAsRead,
  type Notification,
} from "../lib/notifications";

/** Format a timestamp as "5m ago", "2h ago", "3d ago", or absolute date. */
function timeAgo(iso: string): string {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

/**
 * Bell icon + dropdown panel. Polls the user's notifications every 30s
 * and shows an unread count badge.
 */
export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const panelRef = useRef<HTMLDivElement | null>(null);

  const unreadCount = items.filter((n) => !n.read).length;

  // Initial fetch + poll every 30s
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const data = await getNotifications();
      if (!cancelled) {
        setItems(data);
        setLoading(false);
      }
    };
    load();
    const interval = window.setInterval(load, 30_000);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, []);

  // Refresh when panel opens, so the unread badge stays accurate.
  useEffect(() => {
    if (!open) return;
    getNotifications().then(setItems);
  }, [open]);

  // Click outside closes the panel.
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  // Esc closes the panel.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const handleItemClick = async (n: Notification) => {
    if (!n.read) {
      // Optimistic update
      setItems((prev) =>
        prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)),
      );
      await markAsRead(n.id);
    }
  };

  const handleMarkAll = async () => {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    await markAllAsRead();
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Notifications"
        className="relative w-9 h-9 rounded-xl flex items-center justify-center bg-slate-50 hover:bg-blue-50 hover:text-blue-600 transition-colors text-slate-500 border border-slate-100"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span
            className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-white"
            aria-label={`${unreadCount} unread`}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute top-full mt-2 left-0 w-80 max-w-[calc(100vw-32px)] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50"
          role="dialog"
        >
          {/* Header */}
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-slate-800">Notifications</p>
              {unreadCount > 0 && (
                <p className="text-[11px] text-slate-400">
                  {unreadCount} unread
                </p>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAll}
                className="text-[11px] font-semibold text-blue-600 hover:text-blue-700"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="px-4 py-8 text-center">
                <div className="w-5 h-5 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin mx-auto" />
              </div>
            ) : items.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <p className="text-sm text-slate-400">No notifications yet.</p>
                <p className="text-[11px] text-slate-300 mt-1">
                  We&apos;ll show task reminders here.
                </p>
              </div>
            ) : (
              <ul>
                {items.map((n) => (
                  <li
                    key={n.id}
                    onClick={() => handleItemClick(n)}
                    className={`px-4 py-3 border-b border-slate-50 cursor-pointer transition-colors hover:bg-slate-50 ${
                      n.read ? "" : "bg-blue-50/30"
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <span
                        className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${
                          n.read ? "bg-slate-300" : "bg-blue-500"
                        }`}
                        aria-hidden
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] text-slate-700 leading-snug">
                          {n.message}
                        </p>
                        {n.task_title && (
                          <p className="text-[11px] text-blue-600 font-semibold truncate mt-0.5">
                            {n.task_title}
                          </p>
                        )}
                        <p className="text-[10px] text-slate-400 mt-1">
                          {timeAgo(n.created_at)}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
