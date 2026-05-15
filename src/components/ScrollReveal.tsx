"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

type ScrollRevealProps = {
  children: ReactNode;
  /** Direction the content slides in from. Default "up". */
  from?: "up" | "down" | "left" | "right" | "none";
  /** Initial Y/X translation in px. Default 24. */
  distance?: number;
  /** Stagger delay (s) when used as a parent over many children. */
  delay?: number;
  /** Animation duration (s). Default 0.7. */
  duration?: number;
  className?: string;
};

/**
 * Fades + slides children into view when they enter the viewport.
 * Triggers once (doesn't re-animate on scroll back up).
 *
 * Respects prefers-reduced-motion — children appear instantly, no motion.
 */
export default function ScrollReveal({
  children,
  from = "up",
  distance = 24,
  delay = 0,
  duration = 0.7,
  className,
}: ScrollRevealProps) {
  const reduce = useReducedMotion();

  if (reduce) return <div className={className}>{children}</div>;

  const offsetMap: Record<typeof from, { x: number; y: number }> = {
    up: { x: 0, y: distance },
    down: { x: 0, y: -distance },
    left: { x: distance, y: 0 },
    right: { x: -distance, y: 0 },
    none: { x: 0, y: 0 },
  };
  const offset = offsetMap[from];

  const variants: Variants = {
    hidden: { opacity: 0, x: offset.x, y: offset.y },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: { duration, ease: [0.22, 1, 0.36, 1], delay },
    },
  };

  return (
    <motion.div
      className={className}
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
    >
      {children}
    </motion.div>
  );
}
