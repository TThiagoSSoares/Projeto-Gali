"use client";

import { useState } from "react";
import Image from "next/image";
import { machineComponents, type ComponentCategory } from "@/data/components";
import { Reveal } from "@/components/Reveal";

const CATEGORIES: ComponentCategory[] = [
  "Estrutura",
  "Selagem",
  "Eletrônica/controle",
];

function SemFotoIcon() {
  return (
    <div className="flex flex-col items-center gap-1.5 text-muted">
      <svg
        viewBox="0 0 24 24"
        className="h-6 w-6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        aria-hidden="true"
      >
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <circle cx="8.5" cy="9.5" r="1.5" />
        <path d="M21 16l-5.5-5.5L9 17" />
      </svg>
      <span className="text-[10px] uppercase tracking-wide">Sem foto</span>
    </div>
  );
}

export function Componentes() {
  const [filtro, setFiltro] = useState<ComponentCategory | "Todos">("Todos");

  const visiveis =
    filtro === "Todos"
      ? machineComponents
      : machineComponents.filter((c) => c.category === filtro);

  return (
    <section id="componentes" className="border-t border-panel-border px-4 py-20">
      <div className="mx-auto max-w-5xl">
        <Reveal className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              Montagem
            </p>
            <h2 className="font-heading text-3xl font-bold sm:text-4xl">
              Componentes
            </h2>
            <p className="mt-2 max-w-md text-muted">
              As peças que formam a seladora. Filtre por área da máquina.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {(["Todos", ...CATEGORIES] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setFiltro(cat)}
                className={`rounded-full border px-4 py-1.5 text-sm font-medium transition hover:scale-105 active:scale-95 ${
                  filtro === cat
                    ? "border-accent bg-accent text-background"
                    : "border-panel-border text-muted hover:border-accent hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </Reveal>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visiveis.map((component, i) => (
            <Reveal
              key={component.id}
              delay={Math.min(i, 8) * 60}
              className="overflow-hidden rounded-xl border border-panel-border bg-panel transition-transform hover:-translate-y-1 hover:border-accent/50"
            >
              <div
                className={`relative flex h-36 items-center justify-center bg-background/40 ${
                  component.image ? "" : "border-b border-dashed border-panel-border"
                }`}
              >
                {component.image ? (
                  <Image
                    src={component.image}
                    alt={component.name}
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover"
                  />
                ) : (
                  <SemFotoIcon />
                )}
              </div>
              <div className="p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-accent">
                  {component.category}
                </p>
                <h3 className="font-heading text-lg font-bold">
                  {component.name}
                </h3>
                <p className="mt-2 text-sm text-muted">{component.function}</p>
                <p className="mt-3 text-xs italic text-muted">
                  {component.location}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
