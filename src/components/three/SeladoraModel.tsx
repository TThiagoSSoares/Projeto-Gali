"use client";

import { useRef } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";

type MaterialKind = "inox" | "plastic" | "acrylic" | "rubber" | "pcb" | "accent" | "brass";

const MATERIAL_PRESETS: Record<
  MaterialKind,
  { metalness: number; roughness: number }
> = {
  inox: { metalness: 0.9, roughness: 0.35 },
  plastic: { metalness: 0.1, roughness: 0.6 },
  acrylic: { metalness: 0, roughness: 0.1 },
  rubber: { metalness: 0, roughness: 0.9 },
  pcb: { metalness: 0.1, roughness: 0.55 },
  accent: { metalness: 0.3, roughness: 0.4 },
  brass: { metalness: 0.85, roughness: 0.28 },
};

type Piece = {
  id?: string;
  geometry: "box" | "cylinder" | "torus" | "sphere";
  args: number[];
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
  color: string;
  material: MaterialKind;
  opacity?: number;
  explode: [number, number, number];
  blink?: boolean;
};

// Máquina modelada em escala real (metros): ~0.70 x 0.60 x 0.50 (L x P x A).
// Peças com `id` batem com src/data/components.ts e viram pontos clicáveis.
const PIECES: Piece[] = [
  // ===== ESTRUTURA — base / chassi =====
  { id: "chassi", geometry: "box", args: [0.66, 0.055, 0.56], position: [0, 0.0275, 0], color: "#c9cdd1", material: "inox", explode: [0, -0.28, 0] },

  // pés niveladores (4 cantos)
  ...[
    [-0.29, -0.24],
    [0.29, -0.24],
    [-0.29, 0.24],
    [0.29, 0.24],
  ].flatMap(([x, z]) => [
    {
      geometry: "cylinder" as const,
      args: [0.009, 0.009, 0.03, 24],
      position: [x, -0.015, z] as [number, number, number],
      color: "#8a8f94",
      material: "brass" as const,
      explode: [x > 0 ? 0.1 : -0.1, -0.35, z > 0 ? 0.1 : -0.1] as [number, number, number],
    },
    {
      geometry: "cylinder" as const,
      args: [0.026, 0.03, 0.012, 32],
      position: [x, -0.036, z] as [number, number, number],
      color: "#161616",
      material: "rubber" as const,
      explode: [x > 0 ? 0.1 : -0.1, -0.4, z > 0 ? 0.1 : -0.1] as [number, number, number],
    },
  ]),

  // ===== ESTRUTURA — gabinete de eletrônica (direita), em placas separadas =====
  { id: "placas-metal", geometry: "box", args: [0.014, 0.32, 0.53], position: [0.336, 0.215, 0], color: "#bdc2c6", material: "inox", explode: [0.3, 0.05, 0] },
  { geometry: "box", args: [0.2, 0.32, 0.012], position: [0.22, 0.215, 0.276], color: "#c3c7cb", material: "inox", explode: [0, 0.05, 0.25] },
  { geometry: "box", args: [0.2, 0.32, 0.012], position: [0.22, 0.215, -0.276], color: "#c3c7cb", material: "inox", explode: [0, 0.05, -0.25] },
  { geometry: "box", args: [0.012, 0.32, 0.53], position: [0.112, 0.215, 0], color: "#b6bbbf", material: "inox", explode: [-0.15, 0.05, 0] },
  { geometry: "box", args: [0.226, 0.014, 0.53], position: [0.224, 0.387, 0], color: "#cfd3d6", material: "inox", explode: [0, 0.3, 0] },

  // grade de ventilação na placa lateral
  ...[-0.19, -0.1, 0, 0.1, 0.19].map((z) => ({
    geometry: "box" as const,
    args: [0.006, 0.24, 0.05],
    position: [0.345, 0.215, z] as [number, number, number],
    color: "#101214",
    material: "plastic" as const,
    explode: [0.3, 0.05, 0] as [number, number, number],
  })),

  // parafusos nas junções do gabinete
  ...[
    [0.224, 0.383, 0.255],
    [0.224, 0.383, -0.255],
    [0.114, 0.383, 0.255],
    [0.114, 0.383, -0.255],
    [0.224, 0.06, 0.276],
    [0.224, 0.36, 0.276],
  ].map(([x, y, z]) => ({
    geometry: "cylinder" as const,
    args: [0.006, 0.006, 0.004, 16],
    rotation: [Math.PI / 2, 0, 0] as [number, number, number],
    position: [x, y, z] as [number, number, number],
    color: "#4a4d50",
    material: "inox" as const,
    explode: [0, 0.05, 0] as [number, number, number],
  })),

  // ===== PAINEL DE CONTROLE (inclinado) =====
  { geometry: "box", args: [0.16, 0.13, 0.012], rotation: [-0.35, 0, 0], position: [0.2, 0.135, 0.29], color: "#161618", material: "plastic", explode: [0.15, -0.1, 0.35] },
  { geometry: "box", args: [0.09, 0.055, 0.006], rotation: [-0.35, 0, 0], position: [0.2, 0.15, 0.298], color: "#0d2b22", material: "plastic", explode: [0.15, -0.1, 0.35], blink: true },
  ...[-0.05, 0, 0.05].map((dx, i) => ({
    geometry: "cylinder" as const,
    args: [0.008, 0.008, 0.006, 24],
    rotation: [-0.35, 0, 0] as [number, number, number],
    position: [0.2 + dx, 0.1, 0.293 + i * 0.001] as [number, number, number],
    color: i === 1 ? "#3fae6a" : "#2a2c2e",
    material: "plastic" as const,
    explode: [0.15, -0.1, 0.35] as [number, number, number],
  })),

  // botão de emergência tipo cogumelo
  { geometry: "cylinder", args: [0.012, 0.012, 0.02, 24], position: [0.28, 0.4, -0.12], color: "#232323", material: "plastic", explode: [0.2, 0.35, -0.1] },
  { geometry: "sphere", args: [0.02, 24, 16], scale: [1, 0.55, 1], position: [0.28, 0.412, -0.12], color: "#c1392b", material: "accent", explode: [0.2, 0.35, -0.1] },

  // placa/breadboard decorativa no topo do gabinete
  { geometry: "box", args: [0.1, 0.01, 0.07], position: [0.22, 0.398, 0.06], color: "#2f6b3a", material: "pcb", explode: [0.2, 0.35, 0.1] },
  { geometry: "cylinder", args: [0.012, 0.012, 0.012, 20], position: [0.255, 0.41, 0.07], color: "#7a2e22", material: "plastic", explode: [0.2, 0.35, 0.1] },

  // ===== ESTRUTURA — deck / bandeja (esquerda) =====
  { geometry: "box", args: [0.012, 0.02, 0.3], position: [-0.005, 0.065, -0.02], color: "#c3c7cb", material: "inox", explode: [0, 0.06, 0] },
  { geometry: "box", args: [0.3, 0.02, 0.012], position: [-0.15, 0.065, 0.135], color: "#c3c7cb", material: "inox", explode: [0, 0.06, 0.1] },
  { geometry: "box", args: [0.3, 0.02, 0.012], position: [-0.15, 0.065, -0.175], color: "#c3c7cb", material: "inox", explode: [0, 0.06, -0.1] },
  { geometry: "box", args: [0.28, 0.008, 0.3], position: [-0.15, 0.052, -0.02], color: "#d7dbd6", material: "plastic", explode: [0, -0.06, 0] },

  // roletes transportadores na frente
  { geometry: "cylinder", args: [0.032, 0.032, 0.3, 32], rotation: [0, 0, Math.PI / 2], position: [-0.15, 0.02, 0.29], color: "#3a3a3a", material: "rubber", explode: [0, -0.3, 0.3] },
  { geometry: "cylinder", args: [0.036, 0.036, 0.012, 32], rotation: [0, 0, Math.PI / 2], position: [-0.301, 0.02, 0.29], color: "#101010", material: "rubber", explode: [0, -0.3, 0.3] },
  { geometry: "cylinder", args: [0.036, 0.036, 0.012, 32], rotation: [0, 0, Math.PI / 2], position: [0.001, 0.02, 0.29], color: "#101010", material: "rubber", explode: [0, -0.3, 0.3] },

  // ===== CÂMARA DE SELAGEM (acrílico) =====
  { geometry: "box", args: [0.26, 0.16, 0.26], position: [-0.15, 0.135, -0.03], color: "#eef4f0", material: "acrylic", opacity: 0.35, explode: [0, 0.32, 0] },

  // ===== SELAGEM =====
  { id: "resistencia", geometry: "box", args: [0.22, 0.01, 0.03], position: [-0.15, 0.058, 0.11], color: "#8a3226", material: "accent", explode: [0, -0.22, 0] },
  ...[0, 1, 2, 3, 4, 5].map((i) => ({
    id: "agulhas",
    geometry: "cylinder" as const,
    args: [0.003, 0.003, 0.1, 16],
    position: [-0.26 + i * 0.044, 0.15, -0.03] as [number, number, number],
    color: "#d4af5f",
    material: "brass" as const,
    explode: [0, 0.2, 0.35] as [number, number, number],
  })),

  // ===== ELETRÔNICA / CONTROLE =====
  { id: "sensor-gas", geometry: "cylinder", args: [0.006, 0.006, 0.05, 20], position: [-0.24, 0.17, -0.11], color: "#48c078", material: "accent", explode: [0, 0.15, -0.3], blink: true },
  { id: "sensor-gas", geometry: "cylinder", args: [0.006, 0.006, 0.05, 20], position: [-0.05, 0.17, -0.11], color: "#48c078", material: "accent", explode: [0, 0.15, -0.3], blink: true },
  { id: "sensor-temp", geometry: "cylinder", args: [0.006, 0.006, 0.05, 20], position: [-0.24, 0.17, 0.05], color: "#e2574c", material: "accent", explode: [0, 0.15, 0.32], blink: true },
  { id: "arduino", geometry: "box", args: [0.1, 0.01, 0.08], position: [0.22, 0.32, 0.08], color: "#357a45", material: "pcb", explode: [0.3, 0.2, 0.15] },
  { id: "esp32", geometry: "box", args: [0.06, 0.008, 0.05], position: [0.22, 0.34, -0.06], color: "#2358ab", material: "pcb", explode: [0.3, 0.25, -0.15] },
  { id: "valvulas", geometry: "cylinder", args: [0.01, 0.01, 0.03, 20], position: [0.1, 0.4, -0.19], color: "#9da3a8", material: "inox", explode: [0.15, 0.35, -0.3] },
  { id: "valvulas", geometry: "cylinder", args: [0.01, 0.01, 0.03, 20], position: [0.15, 0.4, -0.19], color: "#9da3a8", material: "inox", explode: [0.15, 0.35, -0.3] },

  // ===== DETALHES DECORATIVOS =====
  // mangueira/tubo de gás
  { geometry: "torus", args: [0.09, 0.008, 12, 32, Math.PI], rotation: [0, 0, 0.15], position: [-0.02, 0.29, -0.16], color: "#e6ece9", material: "inox", explode: [-0.1, 0.3, -0.2] },

  // alavanca traseira
  { geometry: "cylinder", args: [0.005, 0.005, 0.22, 16], rotation: [0, 0, -0.25], position: [0.3, 0.3, -0.2], color: "#1a1a1a", material: "rubber", explode: [0.2, 0.4, -0.15] },
  { geometry: "box", args: [0.045, 0.014, 0.018], rotation: [0, 0, -0.25], position: [0.35, 0.4, -0.2], color: "#161616", material: "rubber", explode: [0.2, 0.4, -0.15] },

  // suporte de rolo de etiquetas
  { geometry: "cylinder", args: [0.006, 0.006, 0.09, 12], position: [0.28, 0.03, 0.2], color: "#2a2a2a", material: "rubber", explode: [0.2, -0.25, 0.2] },
  { geometry: "cylinder", args: [0.045, 0.045, 0.028, 24], rotation: [Math.PI / 2, 0, 0], position: [0.28, 0.02, 0.2], color: "#ece7d8", material: "rubber", explode: [0.2, -0.25, 0.2] },

  // cabo de alimentação saindo da traseira
  { geometry: "cylinder", args: [0.006, 0.006, 0.09, 16], rotation: [Math.PI / 2, 0, 0], position: [0.22, 0.1, -0.32], color: "#161616", material: "rubber", explode: [0, -0.1, -0.4] },
  { geometry: "sphere", args: [0.006, 12, 12], position: [0.22, 0.1, -0.365], color: "#161616", material: "rubber", explode: [0, -0.1, -0.4] },
  { geometry: "cylinder", args: [0.006, 0.006, 0.1, 16], position: [0.22, 0.05, -0.365], color: "#161616", material: "rubber", explode: [0, -0.4, -0.4] },
  { geometry: "box", args: [0.025, 0.02, 0.015], position: [0.22, -0.005, -0.365], color: "#101010", material: "plastic", explode: [0, -0.45, -0.4] },
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
          scale: piece.scale,
          castShadow: true,
          receiveShadow: true,
          onClick: handleClick,
          onPointerOver: piece.id ? () => (document.body.style.cursor = "pointer") : undefined,
          onPointerOut: piece.id ? () => (document.body.style.cursor = "auto") : undefined,
        };

        const materialEl =
          piece.material === "acrylic" ? (
            <meshPhysicalMaterial
              color={piece.color}
              transmission={0.9}
              roughness={0.1}
              thickness={0.02}
              ior={1.4}
              transparent
              opacity={piece.opacity ?? 1}
            />
          ) : (
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
          const minDim = Math.min(...piece.args);
          return (
            <RoundedBox
              key={i}
              ref={(el) => {
                meshRefs.current[i] = el as unknown as THREE.Mesh;
              }}
              args={piece.args as [number, number, number]}
              radius={Math.min(0.035, minDim / 3)}
              smoothness={4}
              {...handlers}
            >
              {materialEl}
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
            {piece.geometry === "sphere" && (
              <sphereGeometry args={piece.args as [number, number, number]} />
            )}
            {materialEl}
          </mesh>
        );
      })}
    </group>
  );
}
