"use client";
import { useEffect } from "react";

export type Theme = "Light" | "Dark" | "Auto";

const FONT_STACKS: Record<string, string> = {
  OpenDyslexic:
    '"OpenDyslexic", "Lexend", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  Inter:
    '"Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  "Roboto Mono":
    '"Roboto Mono", ui-monospace, "Cascadia Mono", Menlo, Consolas, monospace',
  Lexend:
    '"Lexend", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  "System Default":
    'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
};

export function applyTheme(theme: Theme) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  const prefersDark =
    theme === "Dark" ||
    (theme === "Auto" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);
  root.classList.toggle("dark", prefersDark);
  root.dataset.theme = theme.toLowerCase();
}

export function applyFont(font: string) {
  if (typeof document === "undefined") return;
  const stack = FONT_STACKS[font] ?? FONT_STACKS["System Default"];

  // ── new: inject font stylesheet ──────────────────────────────
  const fontLinks: Record<string, string> = {
    OpenDyslexic: "https://fonts.cdnfonts.com/css/opendyslexic",
    Inter: "https://fonts.googleapis.com/css2?family=Inter&display=swap",
    Lexend: "https://fonts.googleapis.com/css2?family=Lexend&display=swap",
    "Roboto Mono": "https://fonts.googleapis.com/css2?family=Roboto+Mono&display=swap",
  };
  if (fontLinks[font]) {
    const id = `font-link-${font.replace(/\s+/g, "-")}`;
    if (!document.getElementById(id)) {
      const link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      link.href = fontLinks[font];
      document.head.appendChild(link);
    }
  }
  // ────────────────────────────────────────────────────────────

  document.documentElement.style.fontFamily = stack;
  document.documentElement.style.setProperty("--app-font", stack);
}

export default function AppearanceBootstrap() {
  useEffect(() => {
    try {
      const theme = (localStorage.getItem("appearance.theme") ||
        "Light") as Theme;
      const font = localStorage.getItem("appearance.font") || "System Default";
      applyTheme(theme);
      applyFont(font);

      // Re-apply on system theme change when in Auto mode
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      const listener = () => {
        if (
          (localStorage.getItem("appearance.theme") || "Light") === "Auto"
        ) {
          applyTheme("Auto");
        }
      };
      mq.addEventListener("change", listener);
      return () => mq.removeEventListener("change", listener);
    } catch {
      // localStorage unavailable — silently use defaults
    }
  }, []);

  return null;
}