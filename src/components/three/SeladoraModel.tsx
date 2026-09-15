"use client";

import { useRef } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";

type MaterialKind = "metal" | "glass" | "rubber" | "pcb" | "accent";

const MATERIAL_PRESETS: Record<MaterialKind, { metalness: number; roughness: number }> = {
  metal: { metalness: 0.75, roughness: 0.32 },
  glass: { metalness: 0, roughness: 0.12 },
  rubber: { metalness: 0, roughness: 0.9 },
  pcb: { metalness: 0.1, roughness: 0.55 },
  accent: { metalness: 0.3, roughness: 0.4 },
};

type Piece = {
  id?: string;
  geometry: "box" | "cylinder" | "torus";
  args: number[];
  position: [number, number, number];
  rotation?: [number, number, number];
  color: string;
  material: MaterialKind;
  opacity?: number;
  explode: [number, number, number];
  blink?: boolean;
};

// Geometria simples (blocos/cilindros) representando as peças da seladora.
// Peças com `id` batem com src/data/components.ts e viram pontos clicáveis.
const PIECES: Piece[] = [
  // Estrutura
  { id: "chassi", geometry: "box", args: [3.2, 0.28, 1.5], position: [0, 0, 0], color: "#c3c7cc", material: "metal", explode: [0, -0.9, 0] },
  { id: "placas-metal", geometry: "box", args: [0.08, 0.9, 1.5], position: [1.55, 0.55, 0], color: "#aab0b6", material: "metal", explode: [1.1, 0, 0] },
  { geometry: "cylinder", args: [0.06, 0.08, 0.3, 16], position: [-1.4, -0.25, -0.6], color: "#242629", material: "rubber", explode: [-0.4, -0.6, -0.4] },
  { geometry: "cylinder", args: [0.06, 0.08, 0.3, 16], position: [1.4, -0.25, -0.6], color: "#242629", material: "rubber", explode: [0.4, -0.6, -0.4] },
  { geometry: "cylinder", args: [0.06, 0.08, 0.3, 16], position: [-1.4, -0.25, 0.6], color: "#242629", material: "rubber", explode: [-0.4, -0.6, 0.4] },
  { geometry: "cylinder", args: [0.06, 0.08, 0.3, 16], position: [1.4, -0.25, 0.6], color: "#242629", material: "rubber", explode: [0.4, -0.6, 0.4] },

  // Câmara de selagem (invólucro decorativo, não clicável)
  { geometry: "box", args: [1.3, 0.5, 1.3], position: [-0.5, 0.55, 0], color: "#e2ede7", material: "glass", opacity: 0.25, explode: [0, 0.9, 0] },

  // Selagem
  { id: "resistencia", geometry: "box", args: [1.0, 0.05, 0.15], position: [-0.5, 0.15, 0], color: "#8a3226", material: "accent", explode: [0, -0.7, 0] },
  ...[0, 1, 2, 3, 4, 5].map((i) => ({
    id: "agulhas",
    geometry: "cylinder" as const,
    args: [0.02, 0.02, 0.35, 12],
    position: [-1.0 + i * 0.18, 0.55, 0.3] as [number, number, number],
    color: "#d4af5f",
    material: "metal" as const,
    explode: [0, 0.5, 1.0] as [number, number, number],
  })),

  // Eletrônica/controle
  { id: "sensor-gas", geometry: "cylinder", args: [0.04, 0.04, 0.25, 16], position: [-0.9, 0.7, 0.55], color: "#48c078", material: "accent", explode: [0, 0.4, 0.9], blink: true },
  { id: "sensor-gas", geometry: "cylinder", args: [0.04, 0.04, 0.25, 16], position: [-0.1, 0.7, 0.55], color: "#48c078", material: "accent", explode: [0, 0.4, 0.9], blink: true },
  { id: "sensor-temp", geometry: "cylinder", args: [0.04, 0.04, 0.25, 16], position: [-0.9, 0.7, -0.55], color: "#e2574c", material: "accent", explode: [0, 0.4, -0.9], blink: true },
  { id: "arduino", geometry: "box", args: [0.5, 0.06, 0.35], position: [1.0, 0.62, 0.35], color: "#357a45", material: "pcb", explode: [0.8, 0.5, 0.4] },
  { id: "esp32", geometry: "box", args: [0.3, 0.05, 0.22], position: [1.0, 0.7, -0.15], color: "#2358ab", material: "pcb", explode: [0.8, 0.7, -0.4] },
  { id: "valvulas", geometry: "cylinder", args: [0.05, 0.05, 0.2, 16], position: [0.4, 0.85, -0.4], color: "#9da3a8", material: "metal", explode: [0.3, 0.9, -0.9] },
  { id: "valvulas", geometry: "cylinder", args: [0.05, 0.05, 0.2, 16], position: [0.55, 0.85, -0.4], color: "#9da3a8", material: "metal", explode: [0.3, 0.9, -0.9] },

  // Detalhes decorativos (sem hotspot) só pra máquina parecer a foto
  { geometry: "box", args: [0.6, 0.35, 0.05], position: [1.1, 0.35, 0.76], color: "#0d2b22", material: "pcb", explode: [0.3, 0, 0.6], blink: true },
  { geometry: "cylinder", args: [0.12, 0.12, 3.0, 20], rotation: [0, 0, Math.PI / 2], position: [0, -0.05, 0.85], color: "#3a3a3a", material: "rubber", explode: [0, -0.5, 0.6] },
  { geometry: "cylinder", args: [0.03, 0.03, 0.9, 12], rotation: [0, 0, -0.3], position: [0.9, 1.0, -0.5], color: "#1a1a1a", material: "rubber", explode: [0.4, 0.9, -0.3] },
  { geometry: "torus", args: [0.35, 0.04, 12, 32, Math.PI], rotation: [0, 0, 0], position: [-0.9, 0.9, -0.5], color: "#e6ece9", material: "metal", explode: [-0.3, 0.7, -0.5] },
];

type SeladoraModelProps = {
  exploded: boolean;
  selected: string | null;
  onSelect: (id: string) => void;
};

export function SeladoraModel({ exploded, selected, onSelect }: SeladoraModelProps) {
  const meshRefs = useRef<(THREE.Mesh | null)[]>([]);
  const materialRefs = useRef<(THREE.MeshStandardMaterial | null)[]>([]);
  const factor = useRef(0);

  useFrame(({ clock }, delta) => {
    factor.current = THREE.MathUtils.damp(factor.current, exploded ? 1 : 0, 4, delta);
    const t = clock.getElapsedTime();
    meshRefs.current.forEach((mesh, i) => {
      if (!mesh) return;
      const p = PIECES[i];
      mesh.position.set(
        p.position[0] + p.explode[0] * factor.current,
        p.position[1] + p.explode[1] * factor.current,
        p.position[2] + p.explode[2] * factor.current,
      );

      if (p.blink) {
        const material = materialRefs.current[i];
        const isSelected = Boolean(p.id) && p.id === selected;
        if (material && !isSelected) {
          material.emissive.set(p.color);
          material.emissiveIntensity = 0.3 + 0.7 * Math.abs(Math.sin(t * 2.4 + i));
        }
      }
    });
  });

  return (
    <group>
      {PIECES.map((piece, i) => {
        const isSelected = Boolean(piece.id) && piece.id === selected;
        const preset = MATERIAL_PRESETS[piece.material];
        const handleClick = piece.id
          ? (e: ThreeEvent<MouseEvent>) => {
              e.stopPropagation();
              onSelect(piece.id!);
            }
          : undefined;
        const handlers = {
          position: piece.position,
          rotation: piece.rotation,
          onClick: handleClick,
          onPointerOver: piece.id ? () => (document.body.style.cursor = "pointer") : undefined,
          onPointerOut: piece.id ? () => (document.body.style.cursor = "auto") : undefined,
        };
        const material = (
          <meshStandardMaterial
            ref={(el) => {
              materialRefs.current[i] = el;
            }}
            color={piece.color}
            metalness={preset.metalness}
            roughness={preset.roughness}
            transparent={piece.opacity !== undefined}
            opacity={piece.opacity ?? 1}
            emissive={isSelected || piece.blink ? piece.color : "#000000"}
            emissiveIntensity={isSelected ? 0.7 : piece.blink ? 0.3 : 0}
          />
        );

        if (piece.geometry === "box") {
          return (
            <RoundedBox
              key={i}
              ref={(el) => {
                meshRefs.current[i] = el as unknown as THREE.Mesh;
              }}
              args={piece.args as [number, number, number]}
              radius={Math.min(0.035, Math.min(...piece.args) / 4)}
              smoothness={4}
              {...handlers}
            >
              {material}
            </RoundedBox>
          );
        }

        return (
          <mesh
            key={i}
            ref={(el) => {
              meshRefs.current[i] = el;
            }}
            {...handlers}
          >
            {piece.geometry === "cylinder" && (
              <cylinderGeometry args={piece.args as [number, number, number, number]} />
            )}
            {piece.geometry === "torus" && (
              <torusGeometry args={piece.args as [number, number, number, number, number]} />
            )}
            {material}
          </mesh>
        );
      })}
    </group>
  );
}
