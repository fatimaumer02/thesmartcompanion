"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import Fireflies from "./three/Fireflies";

type Props = {
  /** Which of the 4 satellites should glow (one per category). */
  filledSlots: boolean[];
  /** 0..1 — overall completion drives orb emissive intensity. */
  progress: number;
};

// Each satellite color matches its category accent in the page UI.
const SATELLITE_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6"];

function CoreOrb({ progress }: { progress: number }) {
  const mesh = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (!mesh.current) return;
    mesh.current.rotation.y += delta * 0.15;
    mesh.current.rotation.x += delta * 0.05;
  });
  // Emissive intensity ramps from 0.25 (idle) to 0.9 (all 4 filled)
  const emissive = 0.25 + progress * 0.65;
  return (
    <Float speed={1.4} rotationIntensity={0.3} floatIntensity={0.4}>
      <mesh ref={mesh} scale={0.95}>
        <icosahedronGeometry args={[1, 4]} />
        <MeshDistortMaterial
          color="#6366f1"
          attach="material"
          distort={0.35}
          speed={1.6}
          roughness={0.1}
          metalness={0.55}
          emissive="#a855f7"
          emissiveIntensity={emissive}
        />
      </mesh>
    </Float>
  );
}

function Satellite({
  angle,
  radius,
  color,
  active,
}: {
  angle: number;
  radius: number;
  color: string;
  active: boolean;
}) {
  const mesh = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!mesh.current) return;
    const t = state.clock.getElapsedTime() * 0.4 + angle;
    mesh.current.position.x = Math.cos(t) * radius;
    mesh.current.position.z = Math.sin(t) * radius;
    mesh.current.position.y = Math.sin(t * 1.5) * 0.3;
    mesh.current.rotation.x += 0.01;
    mesh.current.rotation.y += 0.02;
  });
  return (
    <mesh ref={mesh} scale={active ? 0.28 : 0.18}>
      <octahedronGeometry args={[1, 0]} />
      <meshStandardMaterial
        color={color}
        roughness={0.2}
        metalness={0.7}
        emissive={color}
        emissiveIntensity={active ? 1.2 : 0.15}
        transparent
        opacity={active ? 1 : 0.55}
      />
    </mesh>
  );
}

function OrbitRing() {
  return (
    <mesh rotation={[Math.PI / 2.6, 0, 0]}>
      <torusGeometry args={[1.8, 0.012, 8, 80]} />
      <meshBasicMaterial color="#6366f1" transparent opacity={0.25} />
    </mesh>
  );
}

export default function ProfileSetupScene({ filledSlots, progress }: Props) {
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

  // Static fallback for reduced motion — just a colored gradient orb.
  if (!mounted || reducedMotion) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="relative w-32 h-32">
          <div className="absolute inset-0 bg-linear-to-br from-blue-500 via-indigo-500 to-violet-600 rounded-full blur-2xl opacity-60" />
          <div className="absolute inset-4 bg-linear-to-br from-blue-500 via-indigo-500 to-violet-600 rounded-full shadow-2xl shadow-indigo-300/60" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [0, 0.4, 4.2], fov: 50 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        {/* Cinematic lighting — cool key + warm fill */}
        <ambientLight intensity={0.45} />
        <directionalLight position={[3, 4, 5]} intensity={1.1} color="#bfdbfe" />
        <pointLight position={[-4, -2, -3]} intensity={0.7} color="#a855f7" />
        <pointLight position={[3, -2, 2]} intensity={0.5} color="#22d3ee" />

        {/* Central neural energy core */}
        <CoreOrb progress={progress} />

        {/* Faint orbit ring suggesting the satellite path */}
        <OrbitRing />

        {/* 4 satellites — one per category, each glows when filled */}
        {SATELLITE_COLORS.map((color, i) => (
          <Satellite
            key={i}
            angle={(Math.PI * 2 * i) / 4}
            radius={1.8}
            color={color}
            active={filledSlots[i] ?? false}
          />
        ))}

        {/* Ambient firefly dust to add depth */}
        <Fireflies count={45} spread={[3.5, 2.5, 2.5]} color="#e0e7ff" size={0.045} speed={0.25} />

        {/* Cinematic bloom — emissive shapes glow */}
        <EffectComposer>
          <Bloom
            intensity={1.0}
            luminanceThreshold={0.1}
            luminanceSmoothing={0.9}
            mipmapBlur
          />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
