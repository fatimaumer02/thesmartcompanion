import Image from "next/image";


export default function Hero() {
  return (
    <section className="relative grid md:grid-cols-2 gap-6 items-center px-8 py-10 overflow-hidden">
      {/* Background blobs */}
      <div className="absolute -top-20 -right-20 w-80 h-80 bg-blue-100 rounded-full blur-3xl opacity-50 pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-blue-100 rounded-full blur-3xl opacity-40 pointer-events-none" />

      {/* Left: copy */}
      <div className="relative z-10">
        {/* Pill badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
          AI-Powered · Neurodivergent Friendly
        </div>

        <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-4 text-gray-900 tracking-tight">
          Your AI Companion{" "}
          <br />
          for{" "}
          <span className="relative inline-block text-blue-600">
            Everyday Wins
            <svg
              className="absolute -bottom-1 left-0 w-full"
              viewBox="0 0 200 6"
              fill="none"
            >
              <path
                d="M2 4 Q100 1 198 4"
                stroke="#93c5fd "
                strokeWidth="2"
                strokeLinecap="round"
                opacity="0.35"
              />
            </svg>
          </span>
        </h1>

        <p className="text-gray-500 text-sm leading-relaxed mb-6 max-w-sm">
          We break overwhelming tasks into small steps so you can focus,
          achieve and celebrate every win — one micro step at a time.
        </p>

        <div className="flex gap-3 items-center">
          <button className="px-6 py-2.5 rounded-full bg-linear-to-r from-blue-600 to-blue-500 text-white text-sm font-semibold shadow-lg shadow-violet-200 hover:shadow-violet-300 hover:-translate-y-0.5 transition-all duration-200">
            Get Started
          </button>
        </div>

        {/* Stats row */}
      
      </div>

      {/* Right: Illustration */}
      <div className="relative flex justify-center items-center">
        {/* Glow ring */}
         <Image 
      src="/homimgs.png" 
      alt="home"
      width={400}
      height={100}
    />

        
     
      </div>
    </section>
  );
}