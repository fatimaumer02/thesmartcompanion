"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, MeshDistortMaterial } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { useEffect, useRef, useState } from "react";
import type * as THREE from "three";
import Fireflies from "./three/Fireflies";

// Slowly-rotating distorted sphere — soft, calming, not strobing.
function CompanionOrb() {
  const mesh = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (!mesh.current) return;
    mesh.current.rotation.y += delta * 0.12;
    mesh.current.rotation.x += delta * 0.04;
  });
  return (
    <Float speed={1.2} rotationIntensity={0.3} floatIntensity={0.6}>
      <mesh ref={mesh} scale={1.4}>
        <sphereGeometry args={[1, 64, 64]} />
        <MeshDistortMaterial
          color="#3b82f6"
          attach="material"
          distort={0.4}
          speed={1.4}
          roughness={0.15}
          metalness={0.4}
          emissive="#1d4ed8"
          emissiveIntensity={0.35}
        />
      </mesh>
    </Float>
  );
}

function Satellite({
  position,
  color,
  scale = 0.4,
}: {
  position: [number, number, number];
  color: string;
  scale?: number;
}) {
  const mesh = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!mesh.current) return;
    const t = state.clock.getElapsedTime();
    mesh.current.position.y = position[1] + Math.sin(t + position[0]) * 0.25;
  });
  return (
    <Float speed={1.5} rotationIntensity={0.6} floatIntensity={0.4}>
      <mesh ref={mesh} position={position} scale={scale}>
        <icosahedronGeometry args={[1, 0]} />
        <meshStandardMaterial
          color={color}
          roughness={0.25}
          metalness={0.4}
          emissive={color}
          emissiveIntensity={0.5}
        />
      </mesh>
    </Float>
  );
}

/**
 * Cinematic camera drift — the camera breathes in and out and traces a slow
 * Lissajous figure around the origin. Always looks at the orb.
 */
function CameraDrift() {
  const { camera } = useThree();
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    camera.position.x = Math.sin(t * 0.18) * 0.6;
    camera.position.y = Math.cos(t * 0.13) * 0.3;
    camera.position.z = 5 + Math.sin(t * 0.1) * 0.25;
    camera.lookAt(0, 0, 0);
  });
  return null;
}

export default function HeroScene() {
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

  if (!mounted || reducedMotion) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="relative w-64 h-64">
          <div className="absolute inset-0 bg-linear-to-br from-blue-400 to-indigo-600 rounded-full blur-2xl opacity-50" />
          <div className="absolute inset-4 bg-linear-to-br from-blue-500 to-indigo-700 rounded-full shadow-2xl shadow-blue-300/50" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        {/* Cinematic camera drift */}
        <CameraDrift />

        {/* Lighting — cool key + warm accent */}
        <ambientLight intensity={0.35} />
        <directionalLight position={[5, 5, 5]} intensity={1.2} />
        <pointLight position={[-5, -3, -3]} intensity={0.7} color="#a855f7" />
        <pointLight position={[3, -2, 2]} intensity={0.4} color="#22d3ee" />

        {/* Main orb */}
        <CompanionOrb />

        {/* Satellites */}
        <Satellite position={[2.4, 0.8, -1]} color="#a855f7" scale={0.3} />
        <Satellite position={[-2.2, -0.6, -0.5]} color="#22d3ee" scale={0.25} />
        <Satellite position={[1.8, -1.5, 0.5]} color="#f59e0b" scale={0.2} />

        {/* Ambient firefly particles */}
        <Fireflies count={60} spread={[4, 3, 2]} color="#fde68a" size={0.06} speed={0.3} />

        {/* Post-processing: cinematic bloom + soft vignette */}
        <EffectComposer>
          <Bloom
            intensity={0.9}
            luminanceThreshold={0.15}
            luminanceSmoothing={0.9}
            mipmapBlur
          />
          <Vignette eskil={false} offset={0.1} darkness={0.6} />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
