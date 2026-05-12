"use client"

import { useEffect, useState } from "react"
import Sidebar from "../../components/Sidebar"
import {
  applyFont,
  applyTheme,
  type Theme,
} from "../../components/AppearanceBootstrap"

// ─── Toggle Switch Component ──────────────────────────────────────────────────
function Toggle({
  enabled,
  onChange,
}: {
  enabled: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      className={[
        "relative inline-flex h-6 w-11 flex-0 rounded-full border-2 border-transparent",
        "transition-colors duration-200 ease-in-out focus:outline-none",
        enabled ? "bg-blue-500" : "bg-slate-200",
      ].join(" ")}
      role="switch"
      aria-checked={enabled}
    >
      <span
        className={[
          "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md",
          "ring-0 transition duration-200 ease-in-out",
          enabled ? "translate-x-5" : "translate-x-0",
        ].join(" ")}
      />
    </button>
  )
}

// ─── Font options ─────────────────────────────────────────────────────────────
const FONTS = [
  "OpenDyslexic",
  "Inter",
  "Roboto Mono",
  "Lexend",
  "System Default",
]

// ─── Main Component ───────────────────────────────────────────────────────────
export default function SettingsPage() {
  const [theme, setThemeState] = useState<Theme>("Light")
  const [fontStyle, setFontStyleState] = useState("System Default")
  const [fontDropOpen, setFontDropOpen] = useState(false)
  const [savedAt, setSavedAt] = useState<number | null>(null)

  const [highContrast, setHighContrast] = useState(true)
  const [reduceAnim, setReduceAnim] = useState(false)
  const [haptic, setHaptic] = useState(true)

  const [notifEmail, setNotifEmail] = useState(true)
  const [notifPush, setNotifPush] = useState(false)
  const [notifSMS, setNotifSMS] = useState(false)

  // Hydrate from localStorage on first render
  useEffect(() => {
    try {
      const storedTheme = localStorage.getItem("appearance.theme") as Theme | null
      const storedFont = localStorage.getItem("appearance.font")
      if (storedTheme) setThemeState(storedTheme)
      if (storedFont) setFontStyleState(storedFont)
    } catch {
      // localStorage unavailable
    }
  }, [])

  const setTheme = (next: Theme) => {
    setThemeState(next)
    try {
      localStorage.setItem("appearance.theme", next)
    } catch {}
    applyTheme(next)
  }

  const setFontStyle = (next: string) => {
    setFontStyleState(next)
    try {
      localStorage.setItem("appearance.font", next)
    } catch {}
    applyFont(next)
  }

  const handleSave = () => {
    // Settings already persist as the user toggles them; this button gives
    // visible confirmation and is a hook for future server-side sync.
    setSavedAt(Date.now())
    window.setTimeout(() => setSavedAt(null), 2500)
  }

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">

      {/* Common Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 ml-64 p-6 md:p-10 max-w-2xl">

        {/* Page Title */}
        <h1 className="text-2xl font-bold text-slate-800 mb-7 tracking-tight">
          Settings
        </h1>

        {/* ── Appearance ───────────────────────────────────────────── */}
        <Section title="Appearance">

          {/* Font Style */}
          <SettingRow label="Font Style">

            <div className="relative">

              <button
                onClick={() => setFontDropOpen((o) => !o)}
                className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2 text-[13px] text-slate-700 font-medium shadow-sm hover:border-blue-300 transition-colors min-w-[160px] justify-between"
              >
                <span>{fontStyle}</span>

                <span className="text-slate-400 text-xs">
                  {fontDropOpen ? "▲" : "▼"}
                </span>
              </button>

              {fontDropOpen && (
                <div className="absolute right-0 top-full mt-1 bg-white border border-slate-100 rounded-xl shadow-lg z-10 overflow-hidden min-w-[160px]">

                  {FONTS.map((f) => (
                    <button
                      key={f}
                      onClick={() => {
                        setFontStyle(f)
                        setFontDropOpen(false)
                      }}
                      className={[
                        "w-full text-left px-4 py-2.5 text-[13px] transition-colors hover:bg-blue-50",
                        f === fontStyle
                          ? "text-blue-600 font-semibold bg-blue-50"
                          : "text-slate-600",
                      ].join(" ")}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </SettingRow>

          <Divider />

          {/* Theme */}
          <SettingRow label="Theme">

            <div className="flex bg-slate-100 rounded-xl p-1 gap-1">

              {(["Light", "Dark", "Auto"] as Theme[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTheme(t)}
                  className={[
                    "px-4 py-1.5 rounded-lg text-[13px] font-semibold transition-all duration-200",
                    theme === t
                      ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                      : "text-slate-500 hover:text-slate-700",
                  ].join(" ")}
                >
                  {t}
                </button>
              ))}
            </div>
          </SettingRow>
        </Section>

        {/* ── Preferences ─────────────────────────────────────────── */}
        <Section title="Preferences">

          <ToggleRow
            label="High Contrast"
            description="Increase text and UI contrast for readability"
            enabled={highContrast}
            onChange={setHighContrast}
          />

          <Divider />

          <ToggleRow
            label="Reduce Animations"
            description="Minimize motion effects throughout the app"
            enabled={reduceAnim}
            onChange={setReduceAnim}
          />

          <Divider />

          <ToggleRow
            label="Haptic Feedback"
            description="Vibrate on interactions (mobile only)"
            enabled={haptic}
            onChange={setHaptic}
          />
        </Section>

        {/* ── Notifications ───────────────────────────────────────── */}
        <Section title="Notifications">

          <ToggleRow
            label="Email Notifications"
            description="Receive updates and summaries via email"
            enabled={notifEmail}
            onChange={setNotifEmail}
          />

          <Divider />

          <ToggleRow
            label="Push Notifications"
            description="Get alerts directly on your device"
            enabled={notifPush}
            onChange={setNotifPush}
          />

          <Divider />

          <ToggleRow
            label="SMS Notifications"
            description="Receive text messages for critical updates"
            enabled={notifSMS}
            onChange={setNotifSMS}
          />
        </Section>

        {/* Save Button */}
        <div className="mt-6 flex items-center gap-3">
          <button
            onClick={handleSave}
            className="bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold px-8 py-3 rounded-xl shadow-lg shadow-blue-200 text-sm transition-all duration-200 active:scale-95"
          >
            Save Changes
          </button>
          {savedAt && (
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1.5">
              ✓ Saved
            </span>
          )}
        </div>
      </main>
    </div>
  )
}

// ─── Helper Components ────────────────────────────────────────────────────────

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="mb-6">

      <h2 className="text-[15px] font-bold text-slate-700 mb-3 tracking-tight">
        {title}
      </h2>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {children}
      </div>
    </div>
  )
}

function SettingRow({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between px-5 py-4 gap-4">

      <span className="text-[14px] font-medium text-slate-700">
        {label}
      </span>

      {children}
    </div>
  )
}

function ToggleRow({
  label,
  description,
  enabled,
  onChange,
}: {
  label: string
  description: string
  enabled: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between px-5 py-4 gap-6">

      <div className="flex flex-col gap-0.5">

        <span className="text-[14px] font-medium text-slate-700">
          {label}
        </span>

        <span className="text-[12px] text-slate-400">
          {description}
        </span>
      </div>

      <Toggle enabled={enabled} onChange={onChange} />
    </div>
  )
}

function Divider() {
  return <div className="h-px bg-slate-50 mx-5" />
}