export default function ProgressCard() {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">

      <div className="flex justify-between mb-2">
        <span className="text-sm text-gray-600">
          Today's Progress
        </span>

        <span className="text-sm font-medium">
          60%
        </span>
      </div>

      <div className="w-full h-3 bg-gray-200 rounded-full">
        <div className="h-3 bg-green-500 rounded-full w-[60%]"></div>
      </div>

      <p className="text-xs text-gray-500 mt-2">
        3 of 5 tasks completed
      </p>

    </div>
  )
}