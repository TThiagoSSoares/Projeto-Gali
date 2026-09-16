"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, ContactShadows, Environment } from "@react-three/drei";
import { SeladoraModel } from "./SeladoraModel";

type SeladoraCanvasProps = {
  exploded: boolean;
  selected: string | null;
  onSelect: (id: string) => void;
  onMiss: () => void;
};

export default function SeladoraCanvas({
  exploded,
  selected,
  onSelect,
  onMiss,
}: SeladoraCanvasProps) {
  return (
    <Canvas
      shadows
      dpr={[1, 1.5]}
      camera={{ position: [0.62, 0.48, 0.7], fov: 38 }}
      onPointerMissed={onMiss}
    >
      <ambientLight intensity={0.3} />
      <directionalLight
        position={[0.6, 0.9, 0.5]}
        intensity={1.6}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-0.6}
        shadow-camera-right={0.6}
        shadow-camera-top={0.6}
        shadow-camera-bottom={-0.6}
        shadow-camera-near={0.1}
        shadow-camera-far={3}
      />
      <directionalLight position={[-0.6, 0.4, -0.5]} intensity={0.35} color="#bfe8d0" />

      <Suspense fallback={null}>
        <Environment preset="warehouse" />
        <SeladoraModel exploded={exploded} selected={selected} onSelect={onSelect} />
      </Suspense>

      <ContactShadows
        position={[0, -0.001, 0]}
        opacity={0.55}
        scale={1.6}
        blur={2.2}
        far={0.6}
        color="#000000"
      />
      <OrbitControls
        enableDamping
        minDistance={0.5}
        maxDistance={1.8}
        maxPolarAngle={Math.PI / 2.05}
        target={[0, 0.15, 0]}
      />
    </Canvas>
  );
}
