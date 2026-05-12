"use client";

import { useState } from "react";
import Sidebar from "../../components/Sidebar";

const faqs = [
  {
    id: 1,
    icon: "✦",
    question: "How to create a task",
    answer:
      "Go to your Dashboard and type what you want to do in the 'Create New Task' box. Click 'Break Into Steps' — our AI will automatically split it into small, manageable steps tailored just for you.",
  },
  {
    id: 2,
    icon: "⚡",
    question: "How does AI break down tasks?",
    answer:
      "Our AI analyzes your task and breaks it into 3–6 small actionable steps based on what makes sense for that type of task.",
  },
  {
    id: 3,
    icon: "🎨",
    question: "Customize your experience",
    answer:
      "Go to Settings → Profile Settings to update your neuro-profile, reading preference, step size, and reminder style.",
  },
  {
    id: 4,
    icon: "🔒",
    question: "Privacy and data security",
    answer:
      "All your data is stored securely and encrypted. You can delete your account anytime.",
  },
  {
    id: 5,
    icon: "🎤",
    question: "Using voice commands",
    answer:
      "Click the microphone icon and speak your task aloud. Make sure microphone permission is enabled.",
  },
];

export default function HelpPage() {
  const [openId, setOpenId] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  const filtered = faqs.filter(
    (f) =>
      f.question.toLowerCase().includes(search.toLowerCase()) ||
      f.answer.toLowerCase().includes(search.toLowerCase())
  );

  const toggle = (id: number) =>
    setOpenId((prev) => (prev === id ? null : id));

  return (
    <div className="flex min-h-screen bg-slate-50">

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 ml-64">

        <div className="min-h-screen bg-linear-to-br from-blue-50 via-indigo-50/40 to-blue-100 p-5 lg:p-10 relative overflow-hidden">

          {/* Background decoration */}
          <div className="pointer-events-none fixed inset-0 overflow-hidden">
            <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-blue-600/10 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] rounded-full bg-blue-700/10 blur-3xl" />
          </div>

          <div className="relative max-w-2xl w-full mx-auto">

            {/* Hero Header */}
            <div className="text-center mb-10">

              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-linear-to-br from-blue-600 to-blue-700 shadow-xl shadow-blue-300/40 mb-5">
                <span className="text-2xl">🤖</span>
              </div>

              <h1 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight mb-2">
                How can we help you?
              </h1>

              <p className="text-slate-500 text-sm">
                Search our knowledge base or browse popular topics below.
              </p>
            </div>

            {/* Search */}
            <div className="relative mb-8">

              <div className="flex items-center gap-3 bg-white border-2 border-white focus-within:border-blue-600 rounded-2xl px-5 py-3.5 shadow-lg shadow-blue-100/50 transition-all duration-200">

                <input
                  type="text"
                  placeholder="Search for help articles..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 font-medium"
                />

                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="w-5 h-5 rounded-full bg-slate-200 hover:bg-slate-300 flex items-center justify-center text-slate-500 text-xs transition-colors"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>

            {/* FAQ List */}
            <div className="flex flex-col gap-3">

              {filtered.map((faq) => {
                const isOpen = openId === faq.id;

                return (
                  <div
                    key={faq.id}
                    className={`rounded-2xl border-2 overflow-hidden transition-all duration-300 ${
                      isOpen
                        ? "bg-white border-blue-600 shadow-xl shadow-blue-100/60"
                        : "bg-white/70 border-white hover:bg-white hover:border-blue-200 hover:shadow-md"
                    }`}
                  >

                    {/* Question */}
                    <button
                      onClick={() => toggle(faq.id)}
                      className="w-full flex items-center gap-4 px-5 py-4 text-left"
                    >

                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm shrink-0 ${
                          isOpen
                            ? "bg-blue-600 text-white"
                            : "bg-blue-50"
                        }`}
                      >
                        {faq.icon}
                      </div>

                      <span className="flex-1 text-sm font-semibold text-slate-800">
                        {faq.question}
                      </span>

                      <span
                        className={`transition-transform duration-300 ${
                          isOpen ? "rotate-90" : ""
                        }`}
                      >
                        ▶
                      </span>
                    </button>

                    {/* Answer */}
                    {isOpen && (
                      <div className="px-5 pb-5">

                        <div className="ml-12">

                          <div className="h-px bg-slate-200 mb-4" />

                          <p className="text-sm text-slate-600 leading-relaxed">
                            {faq.answer}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Contact Box */}
            <div className="mt-10 bg-linear-to-r from-blue-700 to-blue-600 rounded-2xl p-6 shadow-xl shadow-blue-300/30">

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">

                <div>
                  <p className="text-white font-bold text-base mb-1">
                    Still need help?
                  </p>

                  <p className="text-blue-200 text-xs leading-relaxed">
                    Our support team usually replies within a few hours.
                  </p>
                </div>

                <button className="bg-white hover:bg-blue-50 text-blue-700 text-sm font-bold px-6 py-2.5 rounded-xl transition-all duration-150 shadow-md">
                  Contact Support
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}