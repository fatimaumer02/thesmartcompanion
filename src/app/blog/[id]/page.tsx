"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { supabase } from "../../../lib/supabase"

type Blog = {
  id: number
  title: string
  excerpt: string
  content: string
  author: string
  read_time: string
  created_at: string
}

export default function BlogDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [blog, setBlog] = useState<Blog | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBlog = async () => {
      const { data, error } = await supabase
        .from("blogs")
        .select("*")
        .eq("id", params.id)
        .single()

      if (error) {
        console.error("Error fetching blog:", error)
      } else {
        setBlog(data)
      }
      setLoading(false)
    }

    fetchBlog()
  }, [params.id])

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-400 text-sm">Loading blog...</p>
        </div>
      </div>
    )
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl font-bold text-slate-700">Blog not found</p>
          <button
            onClick={() => router.push("/blog")}
            className="mt-4 text-blue-500 hover:underline text-sm"
          >
            ← Back to blogs
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Navbar ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
              SC
            </div>
            <span className="font-bold text-slate-800 text-sm">Smart Companion</span>
          </button>

         
        </div>
      </nav>

      {/* ── Content ── */}
      <main className="max-w-3xl mx-auto px-6 pt-28 pb-16">

        {/* Back */}
        <button
          onClick={() => router.push("/blog")}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 mb-8 transition-colors"
        >
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Blog
        </button>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 leading-tight mb-5">
          {blog.title}
        </h1>

        {/* Meta */}
        <div className="flex items-center gap-2 text-sm text-slate-400 mb-8">
          <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
            {blog.author[0].toUpperCase()}
          </div>
          <span className="font-semibold text-slate-600">{blog.author}</span>
          <span>·</span>
          <span>{formatDate(blog.created_at)}</span>
          <span>·</span>
          <span>{blog.read_time}</span>
        </div>

        {/* Excerpt */}
        <div className="bg-blue-50 border-l-4 border-blue-500 rounded-r-xl px-5 py-4 mb-10">
          <p className="text-sm text-blue-700 font-medium leading-relaxed italic">
            {blog.excerpt}
          </p>
        </div>

        {/* Content */}
        <div className="space-y-4">
          {blog.content.trim().split("\n\n").map((para, i) => {
            if (para.startsWith("## ")) {
              return (
                <h2 key={i} className="text-xl font-bold text-slate-800 mt-8 mb-2">
                  {para.replace("## ", "")}
                </h2>
              )
            }
            if (para.includes("**")) {
              return (
                <p key={i} className="text-slate-700 font-bold text-lg mt-4">
                  {para.replace(/\*\*/g, "")}
                </p>
              )
            }
            return (
              <p key={i} className="text-slate-600 leading-relaxed">
                {para}
              </p>
            )
          })}
        </div>

        {/* Footer */}
        <div className="mt-14 pt-6 border-t border-slate-100 flex items-center justify-between">
          <p className="text-xs text-slate-400">
            Smart Companion — Your neuro-inclusive AI productivity assistant.
          </p>
          <button
            onClick={() => router.push("/login")}
            className="text-xs bg-blue-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
          >
            Try Smart Companion →
          </button>
        </div>

      </main>
    </div>
  )
}