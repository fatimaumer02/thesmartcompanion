import TiltCard from "./TiltCard";
import ScrollReveal from "./ScrollReveal";

const features = [
  {
    icon: "🎯",
    title: "Task Paralysis",
    desc: "Big tasks feel impossible to start.",
    color: "#ede9fe",
    accent: "#7c3aed",
    lightText: "#6d28d9",
  },
  {
    icon: "⏰",
    title: "Time Blindness",
    desc: "Hard to sense time and stay on track.",
    color: "#fce7f3",
    accent: "#db2777",
    lightText: "#be185d",
  },
  {
    icon: "📖",
    title: "Reading Difficulty",
    desc: "Dense text and visual stress.",
    color: "#dcfce7",
    accent: "#16a34a",
    lightText: "#15803d",
  },
  {
    icon: "❤️",
    title: "Decision Fatigue",
    desc: "Too many choices drain mental energy.",
    color: "#fef3c7",
    accent: "#d97706",
    lightText: "#b45309",
  },
];

export default function Features() {
  return (
    <section className="px-4 sm:px-6 lg:px-8 pb-10">
      {/* Section header */}
      <ScrollReveal from="up">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            Challenges We Help With
          </h2>
        </div>
      </ScrollReveal>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {features.map((item, i) => (
          <ScrollReveal key={i} from="up" delay={0.1 * i}>
          <TiltCard maxTilt={10}>
          <div
            className="group relative bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:shadow-blue-200/40 transition-shadow duration-300 cursor-pointer overflow-hidden h-full"
          >
            {/* Subtle bg on hover */}
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"
              style={{ background: item.color + "55" }}
            />

            <div className="relative z-10">
              {/* Icon */}
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center text-xl mb-3 group-hover:scale-110 transition-transform duration-200"
                style={{ background: item.color }}
              >
                {item.icon}
              </div>

              <h3 className="font-bold text-sm text-gray-900 mb-1">{item.title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>

              {/* Bottom accent bar */}
              <div
                className="mt-4 h-1 rounded-full w-6 group-hover:w-12 transition-all duration-300"
                style={{ background: item.accent }}
              />
            </div>
          </div>
          </TiltCard>
          </ScrollReveal>
        ))}
      </div>

      
    </section>
  );
}