"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import { HeroScene } from "./HeroScene";

export function HeroCanvas() {
  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 50 }} gl={{ alpha: true, antialias: true }}>
      <Suspense fallback={null}>
        <HeroScene />
      </Suspense>
    </Canvas>
  );
}
