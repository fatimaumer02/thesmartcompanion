"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import Navbar from "../../components/Navbar";

const featured = {
  category: "Product",
  title: "Why we removed streaks from SmartCompanion",
  excerpt:
    "Streaks weaponize consistency. For an ADHD brain, one missed day can erase a month of momentum. Here's what we built instead.",
  author: "Shayam Ahmad",
  date: "May 8, 2026",
  readTime: "6 min read",
  accent: "from-blue-500 to-indigo-500",
};

type Post = {
  category: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  readTime: string;
  tint: string;
  accent: string;
};

const posts: Post[] = [
  {
    category: "Research",
    title: "Task paralysis isn't laziness — it's a working memory tax",
    excerpt:
      "A breakdown of recent ADHD research on executive function, and how it shaped our micro-step engine.",
    author: "Dr. Lena Park",
    date: "May 2, 2026",
    readTime: "8 min read",
    tint: "bg-violet-50",
    accent: "text-violet-600",
  },
  {
    category: "Design",
    title: "Designing for the dyslexic eye",
    excerpt:
      "Why we ship OpenDyslexic and Lexend by default, and what we learned testing line-height with 200 readers.",
    author: "Mira Osei",
    date: "Apr 24, 2026",
    readTime: "5 min read",
    tint: "bg-pink-50",
    accent: "text-pink-600",
  },
  {
    category: "Stories",
    title: "How Jules finally finished her dissertation",
    excerpt:
      "Six years of stalled progress, three months on SmartCompanion. A user story, in her own words.",
    author: "Jules R.",
    date: "Apr 17, 2026",
    readTime: "4 min read",
    tint: "bg-green-50",
    accent: "text-green-600",
  },
  {
    category: "Engineering",
    title: "Running an LLM that doesn't lecture you",
    excerpt:
      "The system prompt rewrites, eval sets, and weekend rewrites it took to make our AI feel kind.",
    author: "Theo Nguyen",
    date: "Apr 10, 2026",
    readTime: "9 min read",
    tint: "bg-amber-50",
    accent: "text-amber-600",
  },
  {
    category: "Product",
    title: "What we're shipping in Q3",
    excerpt:
      "Voice journaling, shared accountability circles, and a calmer notification engine. Here's the roadmap.",
    author: "Shayam Ahmad",
    date: "Apr 3, 2026",
    readTime: "3 min read",
    tint: "bg-blue-50",
    accent: "text-blue-600",
  },
  {
    category: "Research",
    title: "Time blindness, demystified",
    excerpt:
      "Why an hour can feel like ten minutes — and the simple cues that help neurodivergent users orient in time.",
    author: "Dr. Lena Park",
    date: "Mar 27, 2026",
    readTime: "7 min read",
    tint: "bg-cyan-50",
    accent: "text-cyan-600",
  },
];

const tags = ["All", "Product", "Research", "Design", "Stories", "Engineering"];

export default function BlogPage() {
  const [activeTag, setActiveTag] = useState("All");

  const visiblePosts = useMemo(
    () => (activeTag === "All" ? posts : posts.filter((p) => p.category === activeTag)),
    [activeTag]
  );

  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="relative px-4 sm:px-6 lg:px-8 py-10 sm:py-12 md:py-16 overflow-hidden">
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-blue-100 rounded-full blur-3xl opacity-50 pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            The SmartCompanion Blog
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight mb-3 text-gray-900 tracking-tight">
            Notes from a calmer{" "}
            <span className="text-blue-600">productivity</span>
          </h1>
          <p className="text-gray-500 text-sm sm:text-base leading-relaxed max-w-xl mx-auto">
            Research, design notes, and user stories from the team building tools for
            neurodivergent minds.
          </p>
        </div>
      </section>

      {/* Tags */}
      <section className="pb-8">
        <div
          className="max-w-5xl mx-auto overflow-x-auto sm:overflow-visible [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          aria-label="Filter posts by category"
        >
          <div
            role="tablist"
            className="flex sm:flex-wrap items-center justify-start sm:justify-center gap-2 sm:gap-3 px-4 sm:px-6 lg:px-8 min-w-max sm:min-w-0"
          >
            {tags.map((tag) => {
              const active = tag === activeTag;
              return (
                <button
                  key={tag}
                  role="tab"
                  aria-selected={active}
                  onClick={() => setActiveTag(tag)}
                  className={`flex-shrink-0 min-w-[96px] px-5 py-2 rounded-full text-sm font-semibold border transition-all duration-200 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 ${
                    active
                      ? "bg-blue-600 text-white border-transparent shadow-md shadow-blue-200"
                      : "bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-700 hover:-translate-y-0.5"
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured (hidden when filtering, since it's curated for "All") */}
      {activeTag === "All" && (
        <section className="px-4 sm:px-6 lg:px-8 pb-10 sm:pb-12">
          <div className="max-w-5xl mx-auto">
            <div className="relative group rounded-3xl overflow-hidden border border-blue-100 bg-linear-to-br from-blue-50 via-white to-white cursor-pointer">
              <div
                className={`absolute top-0 left-0 right-0 h-1.5 bg-linear-to-r ${featured.accent}`}
              />
              <div className="grid md:grid-cols-2 gap-6 md:gap-8 p-6 sm:p-8 md:p-10 items-center">
                <div>
                  <span className="inline-block px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold uppercase tracking-widest mb-4">
                    Featured · {featured.category}
                  </span>
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-900 leading-snug tracking-tight mb-3 group-hover:text-blue-700 transition-colors">
                    {featured.title}
                  </h2>
                  <p className="text-gray-600 text-sm leading-relaxed mb-5">
                    {featured.excerpt}
                  </p>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                    <span className="font-semibold text-gray-700">{featured.author}</span>
                    <span aria-hidden>·</span>
                    <span>{featured.date}</span>
                    <span aria-hidden>·</span>
                    <span>{featured.readTime}</span>
                  </div>
                </div>
                <div className="hidden md:flex items-center justify-center">
                  <div className="w-full aspect-square max-w-xs rounded-2xl bg-linear-to-br from-blue-100 via-indigo-100 to-purple-100 flex items-center justify-center text-7xl">
                    ✍️
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Post grid */}
      <section className="px-4 sm:px-6 lg:px-8 pb-16">
        <div className="max-w-6xl mx-auto">
          {visiblePosts.length === 0 ? (
            <div className="text-center text-gray-400 text-sm py-12">
              No posts in this category yet — check back soon.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6 items-stretch">
              {visiblePosts.map((p, i) => (
                <article
                  key={i}
                  className="group bg-white border border-gray-100 rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col h-full min-w-0"
                >
                  <span
                    className={`self-start inline-block px-2.5 py-1 rounded-full ${p.tint} ${p.accent} text-[10px] font-bold uppercase tracking-widest mb-3`}
                  >
                    {p.category}
                  </span>
                  <h3 className="font-bold text-base text-gray-900 leading-snug mb-2 line-clamp-2 group-hover:text-blue-700 transition-colors">
                    {p.title}
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed mb-4 line-clamp-3">
                    {p.excerpt}
                  </p>
                  <div className="mt-auto flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-400 pt-3 border-t border-gray-100">
                    <span className="font-semibold text-gray-600 truncate max-w-[140px]">
                      {p.author}
                    </span>
                    <span aria-hidden>·</span>
                    <span>{p.date}</span>
                    <span aria-hidden>·</span>
                    <span>{p.readTime}</span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Newsletter */}
      <section className="px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-2xl mx-auto bg-linear-to-br from-blue-50 to-white border border-blue-100 rounded-3xl p-6 sm:p-10 text-center">
          <h2 className="text-2xl font-extrabold text-gray-900 mb-2 tracking-tight">
            Get one good idea a week
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            Quiet, useful, and never more than five minutes to read.
          </p>
          <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="you@example.com"
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <button
              type="button"
              className="px-6 py-2.5 rounded-full bg-linear-to-r from-blue-600 to-blue-500 text-white text-sm font-semibold shadow-md shadow-blue-200 hover:shadow-blue-300 hover:-translate-y-0.5 transition-all duration-200"
            >
              Subscribe
            </button>
          </form>
          <p className="text-[11px] text-gray-400 mt-4">
            No spam. Unsubscribe in one click.{" "}
            <Link href="/about" className="text-blue-600 hover:underline">
              About us
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
