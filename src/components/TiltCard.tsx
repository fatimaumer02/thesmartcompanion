"use client";

import { useEffect, useRef, useState } from "react";

type TiltCardProps = {
  children: React.ReactNode;
  /** Max tilt angle in degrees. Default 8 — gentle, not nausea-inducing. */
  maxTilt?: number;
  /** Optional className for the outer wrapper. */
  className?: string;
};

/**
 * Mouse-follow 3D tilt wrapper. As the cursor moves over the card, the card
 * tilts gently toward the cursor on the X/Y axes — gives a tactile, "alive"
 * feel without the usual neurodivergent-unfriendly motion sickness risk.
 *
 * Honors `prefers-reduced-motion`: when reduced motion is requested, the
 * component renders children unchanged with no transform.
 */
export default function TiltCard({
  children,
  maxTilt = 8,
  className = "",
}: TiltCardProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onChange = () => setReducedMotion(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reducedMotion) return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width; // 0..1
    const y = (e.clientY - rect.top) / rect.height; // 0..1
    const tiltX = (0.5 - y) * 2 * maxTilt;
    const tiltY = (x - 0.5) * 2 * maxTilt;
    el.style.transform = `perspective(800px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(1.02)`;
  };

  const handleLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = "perspective(800px) rotateX(0deg) rotateY(0deg) scale(1)";
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{
        transformStyle: "preserve-3d",
        transition: reducedMotion
          ? undefined
          : "transform 200ms cubic-bezier(0.34, 1.56, 0.64, 1)",
        willChange: reducedMotion ? undefined : "transform",
      }}
      className={className}
    >
      {children}
    </div>
  );
}
