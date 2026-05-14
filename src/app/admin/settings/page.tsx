"use client"

import { useState } from "react"

export default function SettingsPage() {
  const [adminEmail, setAdminEmail] = useState("admin@smartcompanion.com")
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Settings</h1>
        <p className="text-slate-400 text-sm mt-1">Manage admin preferences</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 max-w-lg">
        <h2 className="font-bold text-slate-700 mb-4">Admin Account</h2>

        <div className="mb-4">
          <label className="text-sm font-semibold text-slate-600">Admin Email</label>
          <input
            type="email"
            value={adminEmail}
            onChange={(e) => setAdminEmail(e.target.value)}
            className="w-full mt-1.5 px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-300 text-sm"
          />
        </div>

        <div className="mb-6">
          <label className="text-sm font-semibold text-slate-600">New Password</label>
          <input
            type="password"
            placeholder="Leave blank to keep current"
            className="w-full mt-1.5 px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-300 text-sm"
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold px-6 py-2.5 rounded-xl text-sm hover:opacity-90 transition shadow-md shadow-indigo-200"
          >
            Save Changes
          </button>
          {saved && (
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1.5">
              ✓ Saved
            </span>
          )}
        </div>
      </div>
    </div>
  )
}