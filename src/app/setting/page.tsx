"use client"

import { useEffect, useState } from "react"
import Sidebar from "../../components/Sidebar"
import {
  applyFont,
  applyTheme,
  type Theme,
} from "../../components/AppearanceBootstrap"
import TiltCard from "../../components/TiltCard"
import AmbientScene from "../../components/AmbientScene"
import { loadState, setSoundEnabled } from "../../lib/gamification"
import { supabase } from "../../lib/supabase"

// ─── Apply Preferences to DOM ─────────────────────────────────────────────────
function applyHighContrast(enabled: boolean) {
  const style = document.getElementById("high-contrast-style") || document.createElement("style")
  style.id = "high-contrast-style"
  if (enabled) {
    style.textContent = `
      body, p, span, h1, h2, h3, h4, label, td, th, button {
        color: #000000 !important;
      }
      .bg-white { background: #ffffff !important; }
      .text-slate-400 { color: #4b5563 !important; }
      .text-slate-500 { color: #374151 !important; }
      .text-slate-600 { color: #1f2937 !important; }
      .text-slate-700 { color: #111827 !important; }
      .text-slate-800 { color: #030712 !important; }
      * { letter-spacing: 0.01em; }
    `
    document.head.appendChild(style)
    document.documentElement.classList.add("high-contrast")
  } else {
    style.remove()
    document.documentElement.classList.remove("high-contrast")
  }
}

function applyReduceAnimations(enabled: boolean) {
  const style = document.getElementById("reduce-motion-style") || document.createElement("style")
  style.id = "reduce-motion-style"
  if (enabled) {
    style.textContent = `
      *, *::before, *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
        scroll-behavior: auto !important;
      }
    `
    document.head.appendChild(style)
    document.documentElement.classList.add("reduce-motion")
  } else {
    style.remove()
    document.documentElement.classList.remove("reduce-motion")
  }
}

function playSound() {
  try {
    const ctx = new AudioContext()
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()
    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)
    oscillator.frequency.value = 520
    oscillator.type = "sine"
    gainNode.gain.setValueAtTime(0.3, ctx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4)
    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + 0.4)
  } catch {}
}

function triggerHaptic() {
  if ("vibrate" in navigator) {
    navigator.vibrate(50)
  }
}

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
        "relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent",
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
const FONTS = ["OpenDyslexic", "Inter", "Roboto Mono", "Lexend", "System Default"]

// ─── Main Component ───────────────────────────────────────────────────────────
export default function SettingPage() {
  const [theme, setThemeState] = useState<Theme>("Light")
  const [fontStyle, setFontStyleState] = useState("System Default")
  const [fontDropOpen, setFontDropOpen] = useState(false)
  const [savedAt, setSavedAt] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  const [highContrast, setHighContrastState] = useState(false)
  const [reduceAnim, setReduceAnimState] = useState(false)
  const [haptic, setHapticState] = useState(false)
  const [soundFx, setSoundFxState] = useState(false)

  const [notifEmail, setNotifEmail] = useState(true)
  const [notifPush, setNotifPush] = useState(false)
  const [notifSMS, setNotifSMS] = useState(false)

  // ── Hydrate ───────────────────────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      try {
        const storedTheme = localStorage.getItem("appearance.theme") as Theme | null
        const storedFont = localStorage.getItem("appearance.font")
        if (storedTheme) setThemeState(storedTheme)
        if (storedFont) setFontStyleState(storedFont)
      } catch {}

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)

      const { data, error } = await supabase
        .from("user_settings")
        .select("*")
        .eq("user_id", user.id)
        .single()

      if (error && error.code !== "PGRST116") {
        console.error("Error loading settings:", error)
        return
      }

      if (data) {
        setHighContrastState(data.high_contrast)
        setReduceAnimState(data.reduce_animations)
        setHapticState(data.haptic_feedback)
        setSoundFxState(data.sound_effects)
        setNotifEmail(data.notif_email)
        setNotifPush(data.notif_push)
        setNotifSMS(data.notif_sms)

        // Re-apply saved preferences
        applyHighContrast(data.high_contrast)
        applyReduceAnimations(data.reduce_animations)
        setSoundEnabled(data.sound_effects)
      }
    }
    init()
  }, [])

  // ── Toggle Handlers with real effects ─────────────────────────────────────
  const setHighContrast = (next: boolean) => {
    setHighContrastState(next)
    applyHighContrast(next)
  }

  const setReduceAnim = (next: boolean) => {
    setReduceAnimState(next)
    applyReduceAnimations(next)
  }

  const setHaptic = (next: boolean) => {
    setHapticState(next)
    if (next) triggerHaptic() // Demo vibration when enabled
  }

  const toggleSoundFx = (next: boolean) => {
    setSoundFxState(next)
    setSoundEnabled(next)
    if (next) playSound() // Play demo sound when enabled
  }

  const setTheme = (next: Theme) => {
    setThemeState(next)
    try { localStorage.setItem("appearance.theme", next) } catch {}
    applyTheme(next)
  }

  const setFontStyle = (next: string) => {
    setFontStyleState(next)
    try { localStorage.setItem("appearance.font", next) } catch {}
    applyFont(next)
  }

  // ── Save to Supabase ──────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!userId) return
    setSaving(true)

    const { error } = await supabase
      .from("user_settings")
      .upsert({
        user_id: userId,
        high_contrast: highContrast,
        reduce_animations: reduceAnim,
        haptic_feedback: haptic,
        sound_effects: soundFx,
        notif_email: notifEmail,
        notif_push: notifPush,
        notif_sms: notifSMS,
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id" })

    if (error) {
      console.error("Error saving settings:", error)
    } else {
      setSavedAt(Date.now())
      window.setTimeout(() => setSavedAt(null), 2500)
    }
    setSaving(false)
  }

  return (
    <div className="flex min-h-screen bg-slate-50" style={{ fontFamily: "var(--app-font)" }}>
      <Sidebar />

      <main className="relative flex-1 lg:ml-64 p-4 sm:p-6 md:p-10 pt-20 lg:pt-10 w-full lg:max-w-2xl overflow-hidden">
        <AmbientScene variant="calm" opacity={0.3} />

        <h1 className="text-2xl font-bold text-slate-800 mb-7 tracking-tight">Settings</h1>

        {/* ── Appearance ── */}
        <Section title="Appearance">
          <SettingRow label="Font Style">
            <div className="relative">
              <button
                onClick={() => setFontDropOpen((o) => !o)}
                className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2 text-[13px] text-slate-700 font-medium shadow-sm hover:border-blue-300 transition-colors min-w-[160px] justify-between"
              >
                <span>{fontStyle}</span>
                <span className="text-slate-400 text-xs">{fontDropOpen ? "▲" : "▼"}</span>
              </button>
              {fontDropOpen && (
                <div className="absolute right-0 top-full mt-1 bg-white border border-slate-100 rounded-xl shadow-lg z-50 overflow-hidden min-w-[160px]">
                  {FONTS.map((f) => (
                    <button
                      key={f}
                      onClick={() => { setFontStyle(f); setFontDropOpen(false) }}
                      className={[
                        "w-full text-left px-4 py-2.5 text-[13px] transition-colors hover:bg-blue-50",
                        f === fontStyle ? "text-blue-600 font-semibold bg-blue-50" : "text-slate-600",
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

        {/* ── Preferences ── */}
        <Section title="Preferences">
          <ToggleRow
            label="High Contrast"
            description="Increase text and UI contrast for readability"
            enabled={highContrast}
            onChange={setHighContrast}
            badge={highContrast ? "Active" : undefined}
          />
          <Divider />
          <ToggleRow
            label="Reduce Animations"
            description="Minimize motion effects throughout the app"
            enabled={reduceAnim}
            onChange={setReduceAnim}
            badge={reduceAnim ? "Active" : undefined}
          />
          <Divider />
          <ToggleRow
            label="Haptic Feedback"
            description="Vibrate on interactions (mobile only)"
            enabled={haptic}
            onChange={setHaptic}
            badge={haptic ? "Active" : undefined}
          />
          <Divider />
          <ToggleRow
            label="Sound Effects"
            description="Soft tones on step completion, task wins, and achievements"
            enabled={soundFx}
            onChange={toggleSoundFx}
            badge={soundFx ? "Active" : undefined}
          />
        </Section>

        {/* ── Notifications ── */}
        <Section title="Notifications">
          <ToggleRow
            label="Email Notifications"
            description="Receive updates and summaries via email"
            enabled={notifEmail}
            onChange={setNotifEmail}
            badge={notifEmail ? "On" : undefined}
          />
          <Divider />
          <ToggleRow
            label="Push Notifications"
            description="Get alerts directly on your device"
            enabled={notifPush}
            onChange={setNotifPush}
            badge={notifPush ? "On" : undefined}
          />
          <Divider />
          <ToggleRow
            label="SMS Notifications"
            description="Receive text messages for critical updates"
            enabled={notifSMS}
            onChange={setNotifSMS}
            badge={notifSMS ? "On" : undefined}
          />
        </Section>

        {/* Save Button */}
        <div className="mt-6 flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold px-8 py-3 rounded-xl shadow-lg shadow-blue-200 text-sm transition-all duration-200 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Saving...
              </span>
            ) : "Save Changes"}
          </button>
          {savedAt && (
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1.5">
              ✓ Saved to Supabase
            </span>
          )}
        </div>
      </main>
    </div>
  )
}

// ─── Helper Components ────────────────────────────────────────────────────────
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h2 className="text-[15px] font-bold text-slate-700 mb-3 tracking-tight">{title}</h2>
      <TiltCard maxTilt={4}>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-blue-200/40 transition-shadow duration-300 overflow-visible">
          {children}
        </div>
      </TiltCard>
    </div>
  )
}

function SettingRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-5 py-4 gap-4">
      <span className="text-[14px] font-medium text-slate-700">{label}</span>
      {children}
    </div>
  )
}

function ToggleRow({
  label,
  description,
  enabled,
  onChange,
  badge,
}: {
  label: string
  description: string
  enabled: boolean
  onChange: (v: boolean) => void
  badge?: string
}) {
  return (
    <div className="flex items-center justify-between px-5 py-4 gap-6">
      <div className="flex flex-col gap-0.5 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-[14px] font-semibold text-slate-700">{label}</span>
          {badge && (
            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded-full">
              {badge}
            </span>
          )}
        </div>
        <span className="text-[12px] text-slate-400">{description}</span>
      </div>
      <Toggle enabled={enabled} onChange={onChange} />
    </div>
  )
}

function Divider() {
  return <div className="h-px bg-slate-50 mx-5" />
}