"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
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
      dpr={[1, 1.5]}
      camera={{ position: [3.2, 2.2, 3.6], fov: 40 }}
      onPointerMissed={onMiss}
    >
      <ambientLight intensity={0.7} />
      <directionalLight position={[4, 5, 2]} intensity={1} />
      <directionalLight position={[-3, 2, -2]} intensity={0.35} />
      <SeladoraModel exploded={exploded} selected={selected} onSelect={onSelect} />
      <OrbitControls
        enableDamping
        minDistance={2.5}
        maxDistance={7}
        maxPolarAngle={Math.PI / 2.05}
        target={[0, 0.3, 0]}
      />
    </Canvas>
  );
}
