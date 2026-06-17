"use client"

import { AnimatePresence, motion, useReducedMotion } from "framer-motion"

type Props = {
  stepId: string
  amount: number | null
  onDone: () => void
}

// "+10 XP" that floats up and fades. Anchored over the step that was just
// completed.
export default function XPFloater({ stepId, amount, onDone }: Props) {
  const reduce = useReducedMotion()

  return (
    <AnimatePresence onExitComplete={onDone}>
      {amount !== null && (
        <motion.div
          key={stepId}
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 6, scale: 0.9 }}
          animate={reduce ? { opacity: 1 } : { opacity: 1, y: -28, scale: 1 }}
          exit={{ opacity: 0, y: -42 }}
          transition={{ duration: 0.9, ease: [0.22, 0.9, 0.3, 1] }}
          className="pointer-events-none absolute top-1.5 right-2 text-[11px] font-extrabold text-indigo-600 drop-shadow-[0_0_8px_rgba(99,102,241,0.45)]"
        >
          +{amount} XP
        </motion.div>
      )}
    </AnimatePresence>
  )
}
