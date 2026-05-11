"use client"

import { useRouter } from "next/navigation"
import ProgressCard from "../../components/ProgressCard"
import TaskCard from "../../components/TaskCard"

export default function DashboardPage() {

  const router = useRouter()

  return (
    <div className="max-w-5xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">
            Good Morning, Alex ☀️
          </h1>

          <p className="text-gray-500">
            Let's make today a productive day.
          </p>
        </div>

        <div className="w-10 h-10 rounded-full bg-blue-500"></div>
      </div>

      {/* Input Card */}
      <div className="bg-white p-6 rounded-xl shadow-sm">

        <p className="text-sm text-gray-600 mb-3">
          What would you like to get done?
        </p>

        <div className="flex gap-3">

          <input
            className="flex-1 border rounded-lg px-4 py-2 outline-none"
            placeholder="Example: Clean my room, Study math..."
          />

          <button
            onClick={() => router.push("/taskinfo")}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            Break into Steps
          </button>

        </div>

      </div>

      {/* Progress */}
      <ProgressCard />

      {/* Tasks */}
      <div className="space-y-4">

        <h2 className="text-lg font-semibold">
          Today's Tasks
        </h2>

        <TaskCard
          title="Clean my room"
          progress="3/6"
        />

        <TaskCard
          title="Study Math Chapter 5"
          progress="1/4"
        />

      </div>

    </div>
  )
}