## 🧠 Smart Companion

**Bridging the executive function gap with neuro-inclusive AI.**

An AI-powered productivity assistant built for neurodivergent minds. Break overwhelming tasks into tiny **Micro-Wins** one step at a time.

![Smart Companion hero banner — bridging the executive function gap with neuro-inclusive AI](docs/screenshots/hero-banner.png)

---

## 🌟 Overview

Smart Companion is an intelligent productivity assistant designed to help neurodivergent individuals stay focused, organized, and motivated. Instead of presenting large, intimidating tasks, the app breaks them down into manageable **Micro-Wins**, making progress feel achievable and rewarding.

Whether you're dealing with ADHD, executive dysfunction, procrastination, or task overwhelm, Smart Companion provides gentle guidance and actionable next steps to keep you moving forward.

Built with **Next.js 16**, **React 19**, **Supabase**, and multiple AI providers (OpenAI, Anthropic, Google Generative AI), with voice capture powered by **Vapi AI**.

---

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📸 Screenshots

The images below follow the natural user journey — from discovering the product on the marketing site, through sign-up and daily use, to the admin experience.

---

### 1. Public Marketing Site

#### Landing Page

![Smart Companion landing page — Your AI Companion for Everyday Wins](docs/screenshots/landing-page.png)

The home page introduces the value proposition and the four challenges the app addresses: **task paralysis**, **time blindness**, **reading difficulty**, and **decision fatigue**. This is the first touchpoint for new visitors.

#### Features Page

![Smart Companion features page — micro-steps, voice capture, focus mode, and more](docs/screenshots/features-page.png)

A deep dive into the six core features: Smart Task Breakdown, Voice-First Capture, Time-Aware Reminders, Focus Mode, Reading Accommodations, and Win Celebrations. The comparison table at the bottom shows how Smart Companion differs from generic productivity apps.

#### About Page

![Smart Companion about page — mission, impact stats, and core values](docs/screenshots/about-page.png)

The story behind the product: *"We're building the tool we wished existed."* Highlights the mission ("Make starting easier than scrolling"), impact metrics, and guiding principles like *Built with, not for* and *Your data is yours*.

#### Blog

![Smart Companion blog — Notes from a calmer productivity](docs/screenshots/blog-page.png)

A content hub with research, design notes, and user stories. Articles cover topics like removing streaks for ADHD-friendly design, task paralysis research, dyslexia-friendly typography, and the engineering behind a kind AI assistant.

---

### 2. Authentication

#### User Login

![Smart Companion user login page](docs/screenshots/user-login.png)

The user entry point with email/password login, Google OAuth, and links to sign up or recover a password. The split-screen layout reinforces brand identity on the left while keeping the form clean on the right.

#### Admin Login

![Smart Companion admin login page](docs/screenshots/admin-login.png)

A separate admin authentication flow with dedicated credentials, keeping administrative access isolated from regular user accounts.

---

### 3. Onboarding

#### Neuro-Profile Setup

![Smart Companion neuro-profile personalization — neurotype, step size, and reading style](docs/screenshots/neuro-profile-setup.png)

After sign-up, users personalize their experience in three quick steps: selecting a **neurotype** (ADHD, Dyslexia, Autism, Other), choosing a **step size** (Very Small, Normal, Detailed), and picking a **reading font** (Default, OpenDyslexic, Lexend). The AI uses these preferences to tailor every task breakdown.

---

### 4. User Dashboard & Task Management

#### Dashboard

![Smart Companion dashboard — break tasks into steps and track daily progress](docs/screenshots/dashboard.png)

The home screen after login. Users enter a goal ("Clean my room, Study math…"), hit **Break into Steps**, and see today's progress at a glance. Active quests appear below with step-level progress bars and a **Continue Quest** call to action.

#### My Tasks

![Smart Companion My Tasks page — AI step generation and quest list](docs/screenshots/my-tasks.png)

The full task management view with a daily completion ring, task statistics (Total / Completed / In Progress), an AI **Generate Steps** input, and a chronological list of active and cleared quests.

#### Task History

![Smart Companion task history modal — daily progress across all tasks](docs/screenshots/task-history.png)

A modal showing historical daily completion rates. Users can review past productivity (e.g., "67% — 2 of 3 tasks completed") to build awareness without shame-based streak pressure.

---

### 5. Gamification & Motivation

#### Rewards

![Smart Companion rewards page — badges, XP, and streak tracking](docs/screenshots/rewards-page.png)

Gamification that celebrates effort: tasks completed, day streaks, unlockable badges (First Win, Focus Master, Week Warrior, etc.), and an XP log showing points earned per completed quest.

---

### 6. Accessibility & Support

#### Voice Assistant

![Smart Companion voice assistant page](docs/screenshots/voice-assistant.png)

Hands-free task capture powered by Vapi AI. Users can speak their goals instead of typing — ideal for moments when writing feels like too much friction.

#### Settings

![Smart Companion settings — appearance, preferences, and notifications](docs/screenshots/settings-page.png)

Full personalization controls: font style, light/dark/auto theme, high contrast, reduced animations, haptic feedback, sound effects, and notification toggles (email, push, SMS).

#### Help & Support

![Smart Companion help page — knowledge base and contact support](docs/screenshots/help-page.png)

Self-service help with searchable articles covering task creation, AI breakdown, customization, privacy, and voice commands — plus a direct **Contact Support** option.

---

### 7. Admin Panel

#### Overview

![Smart Companion admin overview — user and task metrics](docs/screenshots/admin-overview.png)

The admin dashboard showing total users, active tasks, active/inactive user counts, and a recent users table for at-a-glance platform health.

#### Users Management

![Smart Companion admin users page — search, status, and delete actions](docs/screenshots/admin-users.png)

Administrators can search all registered users, view join dates and status, and remove accounts when needed.

#### Tasks by User

![Smart Companion admin tasks page — per-user task breakdown](docs/screenshots/admin-tasks-by-user.png)

A grid of user cards showing each person's total, completed, and active task counts. Clicking a user reveals their full task history for monitoring and support.

---

## 📁 Project Structure

```
src/
├── app/
│   ├── page.tsx              # Landing page
│   ├── login/                # User & admin authentication
│   ├── profilesetup/         # Neuro-profile onboarding
│   ├── dashboard/            # User home
│   ├── mytask/               # Task list & AI breakdown
│   ├── rewards/              # Gamification
│   ├── voice-assistant/      # Voice capture
│   ├── setting/              # User preferences
│   ├── help/                 # Support center
│   ├── about/                # About page
│   ├── features/             # Features page
│   ├── blog/                 # Blog
│   └── admin/                # Admin panel
├── components/               # Shared UI components
└── lib/                      # Supabase, gamification, AI helpers
```

---

## License

This project is private. All rights reserved.
