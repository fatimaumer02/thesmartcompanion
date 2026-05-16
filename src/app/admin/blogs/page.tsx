"use client"

import { useEffect, useState } from "react"
import { supabase } from "../../../lib/supabase"
import { Pencil, Trash2, Plus, X, Check } from "lucide-react"

type Blog = {
  id: number
  title: string
  content: string
  excerpt: string
  author: string
  published: boolean
  created_at: string
}

type FormState = {
  title: string
  content: string
  excerpt: string
  author: string
  published: boolean
}

const EMPTY_FORM: FormState = {
  title: "",
  content: "",
  excerpt: "",
  author: "",
  published: true,
}

export default function AdminBlogPage() {
  const [blogs, setBlogs]         = useState<Blog[]>([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState<string | null>(null)
  const [showForm, setShowForm]   = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm]           = useState<FormState>(EMPTY_FORM)
  const [saving, setSaving]       = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  // ── Fetch all blogs ──
  const fetchBlogs = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from("blogs")
      .select("*")
      .order("created_at", { ascending: false })
    if (error) setError(error.message)
    else setBlogs(data as Blog[])
    setLoading(false)
  }

  useEffect(() => { fetchBlogs() }, [])

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg)
    setTimeout(() => setSuccessMsg(null), 3000)
  }

  // ── Open create form ──
  const handleCreate = () => {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setShowForm(true)
  }

  // ── Open edit form ──
  const handleEdit = (blog: Blog) => {
    setEditingId(blog.id)
    setForm({
      title:     blog.title,
      content:   blog.content,
      excerpt:   blog.excerpt,
      author:    blog.author,
      published: blog.published,
    })
    setShowForm(true)
  }

  // ── Save (create or update) ──
  const handleSave = async () => {
    if (!form.title.trim() || !form.content.trim()) {
      setError("Title and content are required.")
      return
    }

    setSaving(true)
    setError(null)

    if (editingId) {
      // Update
      const { error } = await supabase
        .from("blogs")
        .update({
          title:     form.title.trim(),
          content:   form.content.trim(),
          excerpt:   form.excerpt.trim() || form.content.trim().slice(0, 120) + "...",
          author:    form.author.trim() || "Admin",
          published: form.published,
        })
        .eq("id", editingId)

      if (error) setError(error.message)
      else {
        showSuccess("Blog updated successfully!")
        setShowForm(false)
        fetchBlogs()
      }
    } else {
      // Create
      const { error } = await supabase
        .from("blogs")
        .insert({
          title:     form.title.trim(),
          content:   form.content.trim(),
          excerpt:   form.excerpt.trim() || form.content.trim().slice(0, 120) + "...",
          author:    form.author.trim() || "Admin",
          published: form.published,
          created_at: new Date().toISOString(),
        })

      if (error) setError(error.message)
      else {
        showSuccess("Blog published successfully!")
        setShowForm(false)
        fetchBlogs()
      }
    }

    setSaving(false)
  }

  // ── Delete ──
  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this blog post?")) return
    setDeletingId(id)

    const { error } = await supabase
      .from("blogs")
      .delete()
      .eq("id", id)

    if (error) setError(error.message)
    else {
      showSuccess("Blog deleted successfully!")
      setBlogs((prev) => prev.filter((b) => b.id !== id))
    }

    setDeletingId(null)
  }

  // ── Toggle publish ──
  const handleTogglePublish = async (blog: Blog) => {
    const { error } = await supabase
      .from("blogs")
      .update({ published: !blog.published })
      .eq("id", blog.id)

    if (!error) {
      setBlogs((prev) =>
        prev.map((b) =>
          b.id === blog.id ? { ...b, published: !b.published } : b
        )
      )
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Blog Posts</h1>
          <p className="text-slate-400 text-sm mt-1">
            Create, edit, and manage blog posts
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-indigo-200 hover:opacity-90 transition-all"
        >
          <Plus size={16} />
          New Post
        </button>
      </div>

      {/* Success message */}
      {successMsg && (
        <div className="mb-6 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm flex items-center gap-2">
          <Check size={16} />
          {successMsg}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-6 px-4 py-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-sm">
          ⚠️ {error}
        </div>
      )}

      {/* Blog Form Modal */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 overflow-y-auto"
          onClick={() => setShowForm(false)}
        >
          <div
            className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl my-auto overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Form Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-5 flex items-center justify-between">
              <h2 className="text-white font-bold text-lg">
                {editingId ? "Edit Blog Post" : "New Blog Post"}
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Form Body */}
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="text-sm font-semibold text-slate-600 block mb-1.5">
                  Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Enter blog title..."
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-300 text-sm"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-600 block mb-1.5">
                  Author
                </label>
                <input
                  type="text"
                  value={form.author}
                  onChange={(e) => setForm({ ...form, author: e.target.value })}
                  placeholder="Author name (default: Admin)"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-300 text-sm"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-600 block mb-1.5">
                  Excerpt
                  <span className="text-slate-400 font-normal ml-1">(short summary)</span>
                </label>
                <input
                  type="text"
                  value={form.excerpt}
                  onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                  placeholder="Short summary (auto-generated if empty)"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-300 text-sm"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-600 block mb-1.5">
                  Content <span className="text-rose-500">*</span>
                </label>
                <textarea
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  placeholder="Write your blog content here..."
                  rows={10}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-300 text-sm resize-none"
                />
              </div>

              {/* Published toggle */}
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div>
                  <p className="text-sm font-semibold text-slate-700">Publish post</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Published posts are visible to all users
                  </p>
                </div>
                <button
                  onClick={() => setForm({ ...form, published: !form.published })}
                  className={[
                    "relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200",
                    form.published ? "bg-indigo-600" : "bg-slate-200"
                  ].join(" ")}
                >
                  <span
                    className={[
                      "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200",
                      form.published ? "translate-x-5" : "translate-x-0"
                    ].join(" ")}
                  />
                </button>
              </div>
            </div>

            {/* Form Footer */}
            <div className="px-6 py-4 border-t border-slate-100 flex gap-3">
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-sm font-bold hover:opacity-90 transition-all disabled:opacity-50"
              >
                {saving
                  ? "Saving..."
                  : editingId
                  ? "Update Post"
                  : "Publish Post"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Blog List */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-6 py-12 text-center">
          <div className="w-6 h-6 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-400 text-sm">Loading posts...</p>
        </div>
      ) : blogs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-6 py-16 text-center">
          <p className="text-4xl mb-3">📝</p>
          <p className="text-slate-600 font-semibold mb-1">No blog posts yet</p>
          <p className="text-slate-400 text-sm mb-4">
            Create your first post to get started
          </p>
          <button
            onClick={handleCreate}
            className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:opacity-90 transition-all"
          >
            Create First Post
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {blogs.map((blog) => (
            <div
              key={blog.id}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  {/* Title + published badge */}
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-slate-800 truncate">
                      {blog.title}
                    </h3>
                    <span
                      className={[
                        "text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0",
                        blog.published
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-slate-100 text-slate-500 border border-slate-200"
                      ].join(" ")}
                    >
                      {blog.published ? "Published" : "Draft"}
                    </span>
                  </div>

                  {/* Excerpt */}
                  <p className="text-sm text-slate-500 line-clamp-2 mb-2">
                    {blog.excerpt || blog.content.slice(0, 120) + "..."}
                  </p>

                  {/* Meta */}
                  <p className="text-xs text-slate-400">
                    By <span className="font-medium text-slate-500">{blog.author}</span>
                    {" · "}
                    {new Date(blog.created_at).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {/* Toggle publish */}
                  <button
                    onClick={() => handleTogglePublish(blog)}
                    className={[
                      "text-xs font-bold px-3 py-1.5 rounded-lg border transition-all",
                      blog.published
                        ? "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100"
                        : "bg-indigo-50 text-indigo-600 border-indigo-200 hover:bg-indigo-100"
                    ].join(" ")}
                  >
                    {blog.published ? "Unpublish" : "Publish"}
                  </button>

                  {/* Edit */}
                  <button
                    onClick={() => handleEdit(blog)}
                    className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition-colors"
                  >
                    <Pencil size={14} />
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => handleDelete(blog.id)}
                    disabled={deletingId === blog.id}
                    className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center hover:bg-rose-100 transition-colors disabled:opacity-50"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}