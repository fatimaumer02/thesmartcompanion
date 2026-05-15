"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { useEffect, useMemo, useRef, useState } from "react";
import type * as THREE from "three";
import Fireflies from "./three/Fireflies";

type Variant = "calm" | "celebrate" | "focus";

type AmbientSceneProps = {
  variant?: Variant;
  /** Render the canvas at this opacity. Default 0.6 — subtle ambient feel. */
  opacity?: number;
};

type ShapeKind = "icosa" | "torus" | "octa" | "sphere";

type ShapeSpec = {
  kind: ShapeKind;
  position: [number, number, number];
  scale: number;
  color: string;
  speed: number;
};

// Per-variant palette + shape mix. Each variant gives a different "vibe":
// - calm: low density, cool blues, slow drift  (for dashboard / focus pages)
// - celebrate: warm, denser, more rotation     (for rewards page)
// - focus: a single anchor shape, minimal      (reserved, not used yet)
const PRESETS: Record<Variant, ShapeSpec[]> = {
  calm: [
    { kind: "icosa", position: [-3.5, 1.5, -2], scale: 0.6, color: "#60a5fa", speed: 1.0 },
    { kind: "torus", position: [3.6, -0.8, -1.5], scale: 0.5, color: "#a78bfa", speed: 0.9 },
    { kind: "octa", position: [-2.2, -1.8, -0.8], scale: 0.4, color: "#22d3ee", speed: 1.1 },
    { kind: "sphere", position: [4, 1.8, -3], scale: 0.35, color: "#818cf8", speed: 0.8 },
  ],
  celebrate: [
    { kind: "icosa", position: [-3.5, 1.8, -1.5], scale: 0.7, color: "#fbbf24", speed: 1.4 },
    { kind: "torus", position: [3.8, 1.5, -1], scale: 0.6, color: "#f472b6", speed: 1.3 },
    { kind: "octa", position: [-3.2, -1.4, -1], scale: 0.55, color: "#34d399", speed: 1.5 },
    { kind: "sphere", position: [3.4, -1.5, -0.5], scale: 0.5, color: "#a78bfa", speed: 1.2 },
    { kind: "icosa", position: [0, 2.4, -2.5], scale: 0.45, color: "#60a5fa", speed: 1.0 },
    { kind: "torus", position: [0, -2.4, -2], scale: 0.4, color: "#fb923c", speed: 1.1 },
  ],
  focus: [
    { kind: "sphere", position: [0, 0, -1], scale: 1.0, color: "#60a5fa", speed: 0.6 },
  ],
};

function Geometry({ kind }: { kind: ShapeKind }) {
  switch (kind) {
    case "icosa": return <icosahedronGeometry args={[1, 0]} />;
    case "torus": return <torusGeometry args={[0.8, 0.28, 16, 32]} />;
    case "octa": return <octahedronGeometry args={[1, 0]} />;
    case "sphere": return <sphereGeometry args={[1, 32, 32]} />;
  }
}

function Shape({ spec }: { spec: ShapeSpec }) {
  const mesh = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (!mesh.current) return;
    mesh.current.rotation.x += delta * 0.15 * spec.speed;
    mesh.current.rotation.y += delta * 0.18 * spec.speed;
  });
  return (
    <Float speed={spec.speed} rotationIntensity={0.4} floatIntensity={0.5}>
      <mesh ref={mesh} position={spec.position} scale={spec.scale}>
        <Geometry kind={spec.kind} />
        <meshStandardMaterial
          color={spec.color}
          roughness={0.3}
          metalness={0.4}
          emissive={spec.color}
          emissiveIntensity={0.1}
        />
      </mesh>
    </Float>
  );
}

/**
 * Subtle Three.js backdrop. Mount it absolutely-positioned behind page
 * content as a decorative accent.
 *
 * Respects `prefers-reduced-motion: reduce` — renders nothing when set.
 */
export default function AmbientScene({
  variant = "calm",
  opacity = 0.6,
}: AmbientSceneProps) {
  const [reducedMotion, setReducedMotion] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onChange = () => setReducedMotion(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const shapes = useMemo(() => PRESETS[variant], [variant]);

  if (!mounted || reducedMotion) return null;

  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{ opacity }}
      aria-hidden
    >
      <Canvas
        camera={{ position: [0, 0, 6], fov: 50 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        {/* Soft exponential fog — gives depth to far-away shapes */}
        <fog attach="fog" args={["#0b1220", 6, 14]} />

        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={0.9} />
        <pointLight position={[-4, -2, -2]} intensity={0.5} color="#a855f7" />

        {shapes.map((spec, i) => (
          <Shape key={i} spec={spec} />
        ))}

        {/* Drifting fireflies — color tuned per variant */}
        <Fireflies
          count={variant === "celebrate" ? 90 : 60}
          spread={[7, 5, 4]}
          color={variant === "celebrate" ? "#fcd34d" : "#bae6fd"}
          size={0.07}
          speed={variant === "celebrate" ? 0.5 : 0.3}
        />

        {/* Cinematic bloom — makes emissive shapes glow */}
        <EffectComposer>
          <Bloom
            intensity={variant === "celebrate" ? 0.8 : 0.6}
            luminanceThreshold={0.2}
            luminanceSmoothing={0.9}
            mipmapBlur
          />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
