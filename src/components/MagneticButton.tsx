"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type MagneticButtonProps = {
  children: ReactNode;
  /** Radius (px) within which the button starts being pulled toward the cursor. */
  radius?: number;
  /** How strongly the button moves — 0..1. Default 0.35 (gentle). */
  strength?: number;
  className?: string;
  onClick?: () => void;
};

/**
 * Wraps a clickable element with a magnetic effect: as the cursor approaches,
 * the element drifts toward it. Combined with a soft outer glow that
 * intensifies on hover for the premium cinematic feel.
 *
 * Honors prefers-reduced-motion — disables the magnetic pull entirely.
 */
export default function MagneticButton({
  children,
  radius = 120,
  strength = 0.35,
  className = "",
  onClick,
}: MagneticButtonProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onChange = () => setReducedMotion(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (reducedMotion) return;
    const el = ref.current;
    if (!el) return;

    let rafId = 0;
    const onMove = (e: MouseEvent) => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = e.clientX - cx;
        const dy = e.clientY - cy;
        const dist = Math.hypot(dx, dy);
        if (dist < radius) {
          const pull = (1 - dist / radius) * strength;
          el.style.transform = `translate(${dx * pull}px, ${dy * pull}px)`;
        } else {
          el.style.transform = "translate(0, 0)";
        }
      });
    };
    const onLeave = () => {
      el.style.transform = "translate(0, 0)";
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseleave", onLeave);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
    };
  }, [radius, strength, reducedMotion]);

  return (
    <div
      ref={ref}
      onClick={onClick}
      style={{
        transition: reducedMotion
          ? undefined
          : "transform 280ms cubic-bezier(0.18, 0.89, 0.32, 1.28)",
        willChange: reducedMotion ? undefined : "transform",
      }}
      className={`inline-block relative ${className}`}
    >
      {/* Soft outer glow — intensifies on hover */}
      <span
        aria-hidden
        className="absolute inset-0 rounded-[inherit] pointer-events-none opacity-0 hover:opacity-100 transition-opacity duration-500"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(96,165,250,0.35), transparent 70%)",
          filter: "blur(16px)",
          transform: "scale(1.4)",
          zIndex: -1,
        }}
      />
      {children}
    </div>
  );
}
