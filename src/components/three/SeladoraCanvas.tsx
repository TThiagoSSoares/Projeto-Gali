"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, ContactShadows } from "@react-three/drei";
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
      <ambientLight intensity={0.55} />
      <directionalLight position={[4, 5, 2]} intensity={1.4} />
      <directionalLight position={[-3, 2, -2]} intensity={0.4} color="#bfe8d0" />
      <pointLight position={[0, 2.5, 0]} intensity={0.3} />
      <SeladoraModel exploded={exploded} selected={selected} onSelect={onSelect} />
      <ContactShadows
        position={[0, -0.42, 0]}
        opacity={0.55}
        scale={8}
        blur={2.2}
        far={2}
        color="#000000"
      />
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
