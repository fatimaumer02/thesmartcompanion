"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";

type Button3DProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  /** Tailwind color name for the depth shadow base (e.g. "blue", "emerald"). */
  shadowColor?: string;
};

/**
 * A button with a chunky depth shadow that compresses when pressed.
 *
 * The trick: a solid colored "base" sits 4px below the button (via box-shadow).
 * On hover the button lifts (translate-y up + shadow grows). On press it
 * compresses (translate-y down + shadow shrinks). Pure CSS, no library.
 *
 * Reduced-motion: the lift / press transforms are gated by the
 * @media (prefers-reduced-motion: reduce) override that nukes
 * .btn-3d's transitions.
 */
const Button3D = forwardRef<HTMLButtonElement, Button3DProps>(function Button3D(
  { className = "", shadowColor = "blue", style, ...rest },
  ref,
) {
  // Translates "blue" -> "rgb(29, 78, 216)" (blue-700) as the depth color.
  const depthMap: Record<string, string> = {
    blue: "rgb(29, 78, 216)",
    indigo: "rgb(67, 56, 202)",
    emerald: "rgb(4, 120, 87)",
    amber: "rgb(180, 83, 9)",
    rose: "rgb(190, 18, 60)",
    violet: "rgb(109, 40, 217)",
    slate: "rgb(51, 65, 85)",
  };
  const depth = depthMap[shadowColor] ?? depthMap.blue;

  return (
    <button
      ref={ref}
      {...rest}
      style={{
        boxShadow: `0 5px 0 0 ${depth}, 0 8px 16px -4px rgba(0, 0, 0, 0.2)`,
        ...style,
      }}
      className={`btn-3d transform-gpu translate-y-0 transition-all duration-150 active:translate-y-1 hover:-translate-y-0.5 ${className}`}
      data-depth={depth}
    />
  );
});

export default Button3D;
