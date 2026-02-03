"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import type { Mesh } from "three";

function FloatingShape() {
  const meshRef = useRef<Mesh>(null);
  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.2;
    }
  });
  return (
    <Float speed={2} rotationIntensity={0.4} floatIntensity={0.8}>
      <mesh ref={meshRef}>
        <torusKnotGeometry args={[0.6, 0.2, 64, 16]} />
        <meshStandardMaterial color="#6366f1" metalness={0.4} roughness={0.3} />
      </mesh>
    </Float>
  );
}

function SecondaryShape() {
  const meshRef = useRef<Mesh>(null);
  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.15;
      meshRef.current.rotation.z += delta * 0.1;
    }
  });
  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
      <mesh ref={meshRef} position={[2, 1, -2]}>
        <octahedronGeometry args={[0.8, 0]} />
        <meshStandardMaterial color="#a78bfa" wireframe />
      </mesh>
    </Float>
  );
}

export function HeroScene() {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 5, 5]} intensity={1.2} />
      <pointLight position={[-5, -5, 5]} intensity={0.5} color="#c4b5fd" />
      <FloatingShape />
      <SecondaryShape />
    </>
  );
}
