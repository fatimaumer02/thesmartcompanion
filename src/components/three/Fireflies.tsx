"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

type FirefliesProps = {
  count?: number;
  /** XYZ half-extent of the scatter box */
  spread?: [number, number, number];
  color?: string;
  size?: number;
  speed?: number;
};

/**
 * GPU-rendered particle "fireflies" — small additive-blended sprites that
 * drift sinusoidally inside a bounding box. One Points object, one draw
 * call, suitable to drop into any scene as ambient depth.
 */
export default function Fireflies({
  count = 80,
  spread = [6, 4, 4],
  color = "#fef3c7",
  size = 0.08,
  speed = 0.4,
}: FirefliesProps) {
  const points = useRef<THREE.Points>(null);

  // Pre-generate seed positions + per-particle phase offsets.
  const { positions, phases } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const phases = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * 2 * spread[0];
      positions[i * 3 + 1] = (Math.random() - 0.5) * 2 * spread[1];
      positions[i * 3 + 2] = (Math.random() - 0.5) * 2 * spread[2];
      phases[i * 3 + 0] = Math.random() * Math.PI * 2;
      phases[i * 3 + 1] = Math.random() * Math.PI * 2;
      phases[i * 3 + 2] = Math.random() * Math.PI * 2;
    }
    return { positions, phases };
  }, [count, spread]);

  useFrame((state) => {
    if (!points.current) return;
    const t = state.clock.getElapsedTime() * speed;
    const geom = points.current.geometry;
    const posAttr = geom.getAttribute("position") as THREE.BufferAttribute;
    const arr = posAttr.array as Float32Array;
    for (let i = 0; i < count; i++) {
      // Wobble each particle on each axis using its unique phase offsets.
      arr[i * 3 + 0] += Math.sin(t + phases[i * 3 + 0]) * 0.002;
      arr[i * 3 + 1] += Math.cos(t + phases[i * 3 + 1]) * 0.002;
      arr[i * 3 + 2] += Math.sin(t * 0.7 + phases[i * 3 + 2]) * 0.002;
    }
    posAttr.needsUpdate = true;
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={size}
        color={color}
        transparent
        opacity={0.85}
        depthWrite={false}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
