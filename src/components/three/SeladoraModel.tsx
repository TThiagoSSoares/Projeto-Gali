"use client";

import { useRef } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";

type Piece = {
  id?: string;
  geometry: "box" | "cylinder" | "torus";
  args: number[];
  position: [number, number, number];
  rotation?: [number, number, number];
  color: string;
  opacity?: number;
  explode: [number, number, number];
};

// Geometria simples (blocos/cilindros) representando as peças da seladora.
// Peças com `id` batem com src/data/components.ts e viram pontos clicáveis.
const PIECES: Piece[] = [
  // Estrutura
  { id: "chassi", geometry: "box", args: [3.2, 0.28, 1.5], position: [0, 0, 0], color: "#b7bcc2", explode: [0, -0.9, 0] },
  { id: "placas-metal", geometry: "box", args: [0.08, 0.9, 1.5], position: [1.55, 0.55, 0], color: "#9aa0a6", explode: [1.1, 0, 0] },
  { id: "suportes", geometry: "cylinder", args: [0.06, 0.08, 0.3, 12], position: [-1.4, -0.25, -0.6], color: "#2a2a2a", explode: [-0.4, -0.6, -0.4] },
  { id: "suportes", geometry: "cylinder", args: [0.06, 0.08, 0.3, 12], position: [1.4, -0.25, -0.6], color: "#2a2a2a", explode: [0.4, -0.6, -0.4] },
  { id: "suportes", geometry: "cylinder", args: [0.06, 0.08, 0.3, 12], position: [-1.4, -0.25, 0.6], color: "#2a2a2a", explode: [-0.4, -0.6, 0.4] },
  { id: "suportes", geometry: "cylinder", args: [0.06, 0.08, 0.3, 12], position: [1.4, -0.25, 0.6], color: "#2a2a2a", explode: [0.4, -0.6, 0.4] },

  // Câmara de selagem (invólucro decorativo, não clicável)
  { geometry: "box", args: [1.3, 0.5, 1.3], position: [-0.5, 0.55, 0], color: "#dfe9e3", opacity: 0.28, explode: [0, 0.9, 0] },

  // Selagem
  { id: "resistencia", geometry: "box", args: [1.0, 0.05, 0.15], position: [-0.5, 0.15, 0], color: "#7a2e22", explode: [0, -0.7, 0] },
  ...[0, 1, 2, 3, 4, 5].map((i) => ({
    id: "agulhas",
    geometry: "cylinder" as const,
    args: [0.02, 0.02, 0.35, 8],
    position: [-1.0 + i * 0.18, 0.55, 0.3] as [number, number, number],
    color: "#c9a24b",
    explode: [0, 0.5, 1.0] as [number, number, number],
  })),

  // Eletrônica/controle
  { id: "sensor-gas", geometry: "cylinder", args: [0.04, 0.04, 0.25, 10], position: [-0.9, 0.7, 0.55], color: "#3fae6a", explode: [0, 0.4, 0.9] },
  { id: "sensor-gas", geometry: "cylinder", args: [0.04, 0.04, 0.25, 10], position: [-0.1, 0.7, 0.55], color: "#3fae6a", explode: [0, 0.4, 0.9] },
  { id: "sensor-temp", geometry: "cylinder", args: [0.04, 0.04, 0.25, 10], position: [-0.9, 0.7, -0.55], color: "#d94f4f", explode: [0, 0.4, -0.9] },
  { id: "arduino", geometry: "box", args: [0.5, 0.06, 0.35], position: [1.0, 0.62, 0.35], color: "#2f6b3a", explode: [0.8, 0.5, 0.4] },
  { id: "esp32", geometry: "box", args: [0.3, 0.05, 0.22], position: [1.0, 0.7, -0.15], color: "#1f4fa0", explode: [0.8, 0.7, -0.4] },
  { id: "valvulas", geometry: "cylinder", args: [0.05, 0.05, 0.2, 10], position: [0.4, 0.85, -0.4], color: "#8a8f94", explode: [0.3, 0.9, -0.9] },
  { id: "valvulas", geometry: "cylinder", args: [0.05, 0.05, 0.2, 10], position: [0.55, 0.85, -0.4], color: "#8a8f94", explode: [0.3, 0.9, -0.9] },

  // Detalhes decorativos (sem hotspot) só pra máquina parecer a foto
  { geometry: "box", args: [0.6, 0.35, 0.05], position: [1.1, 0.35, 0.76], color: "#111318", explode: [0.3, 0, 0.6] },
  { geometry: "cylinder", args: [0.12, 0.12, 3.0, 16], rotation: [0, 0, Math.PI / 2], position: [0, -0.05, 0.85], color: "#3a3a3a", explode: [0, -0.5, 0.6] },
  { geometry: "cylinder", args: [0.03, 0.03, 0.9, 8], rotation: [0, 0, -0.3], position: [0.9, 1.0, -0.5], color: "#1a1a1a", explode: [0.4, 0.9, -0.3] },
  { geometry: "torus", args: [0.35, 0.04, 8, 24, Math.PI], rotation: [0, 0, 0], position: [-0.9, 0.9, -0.5], color: "#d8dedb", explode: [-0.3, 0.7, -0.5] },
];

type SeladoraModelProps = {
  exploded: boolean;
  selected: string | null;
  onSelect: (id: string) => void;
};

export function SeladoraModel({ exploded, selected, onSelect }: SeladoraModelProps) {
  const meshRefs = useRef<(THREE.Mesh | null)[]>([]);
  const factor = useRef(0);

  useFrame((_, delta) => {
    factor.current = THREE.MathUtils.damp(factor.current, exploded ? 1 : 0, 4, delta);
    meshRefs.current.forEach((mesh, i) => {
      if (!mesh) return;
      const p = PIECES[i];
      mesh.position.set(
        p.position[0] + p.explode[0] * factor.current,
        p.position[1] + p.explode[1] * factor.current,
        p.position[2] + p.explode[2] * factor.current,
      );
    });
  });

  return (
    <group>
      {PIECES.map((piece, i) => {
        const isSelected = Boolean(piece.id) && piece.id === selected;
        const handleClick = piece.id
          ? (e: ThreeEvent<MouseEvent>) => {
              e.stopPropagation();
              onSelect(piece.id!);
            }
          : undefined;

        return (
          <mesh
            key={i}
            ref={(el) => {
              meshRefs.current[i] = el;
            }}
            position={piece.position}
            rotation={piece.rotation}
            onClick={handleClick}
            onPointerOver={piece.id ? () => (document.body.style.cursor = "pointer") : undefined}
            onPointerOut={piece.id ? () => (document.body.style.cursor = "auto") : undefined}
          >
            {piece.geometry === "box" && (
              <boxGeometry args={piece.args as [number, number, number]} />
            )}
            {piece.geometry === "cylinder" && (
              <cylinderGeometry args={piece.args as [number, number, number, number]} />
            )}
            {piece.geometry === "torus" && (
              <torusGeometry args={piece.args as [number, number, number, number, number]} />
            )}
            <meshStandardMaterial
              color={piece.color}
              transparent={piece.opacity !== undefined}
              opacity={piece.opacity ?? 1}
              emissive={isSelected ? piece.color : "#000000"}
              emissiveIntensity={isSelected ? 0.7 : 0}
            />
          </mesh>
        );
      })}
    </group>
  );
}
