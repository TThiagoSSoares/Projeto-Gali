"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useState } from "react";
import { machineComponents } from "@/data/components";
import { seladoraFotos } from "@/data/seladoraFotos";
import { Reveal } from "@/components/Reveal";

const SeladoraCanvas = dynamic(() => import("@/components/three/SeladoraCanvas"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-sm text-muted">
      Carregando modelo 3D...
    </div>
  ),
});

function FotoCarousel({ onVerModelo }: { onVerModelo: () => void }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % seladoraFotos.length);
    }, 3800);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative h-full w-full">
      {seladoraFotos.map((foto, i) => (
        <div
          key={foto.src}
          className={`absolute inset-0 transition-opacity duration-700 ${
            i === index ? "opacity-100" : "opacity-0"
          }`}
        >
          <Image
            src={foto.src}
            alt={foto.alt}
            fill
            sizes="(min-width: 1024px) 60vw, 100vw"
            className="object-cover"
            priority={i === 0}
          />
        </div>
      ))}

      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
        {seladoraFotos.map((foto, i) => (
          <button
            key={foto.src}
            onClick={() => setIndex(i)}
            aria-label={`Foto ${i + 1}`}
            className={`h-2 rounded-full transition-all ${
              i === index ? "w-6 bg-accent" : "w-2 bg-panel-border"
            }`}
          />
        ))}
      </div>

      <button
        onClick={onVerModelo}
        className="absolute bottom-4 right-4 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-background shadow-lg transition hover:scale-105 hover:brightness-110 active:scale-95"
      >
        Ver modelo simulado em 3D
      </button>
    </div>
  );
}

export function Seladora3D() {
  const [view, setView] = useState<"foto" | "3d">("foto");
  const [exploded, setExploded] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);

  const selectedComponent = machineComponents.find((c) => c.id === selected) ?? null;

  return (
    <section
      id="seladora-3d"
      className="flex min-h-screen flex-col items-center gap-6 border-t border-panel-border px-4 py-20"
    >
      <Reveal className="text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
          A seladora
        </p>
        <h2 className="font-heading text-3xl font-bold sm:text-4xl">
          {view === "foto" ? "Conheça a seladora" : "Explore o modelo em 3D"}
        </h2>
        <p className="mx-auto mt-2 max-w-lg text-muted">
          {view === "foto"
            ? "Fotos reais do protótipo. Clique no botão pra abrir o modelo 3D interativo."
            : "Gire, dê zoom e clique nas peças para entender a montagem. Use a vista explodida para ver como elas se encaixam por dentro."}
        </p>
      </Reveal>

      {view === "3d" && (
        <Reveal delay={100} className="flex gap-3">
          <button
            onClick={() => setView("foto")}
            className="rounded-full border border-panel-border px-5 py-2 text-sm font-semibold text-muted transition hover:scale-105 hover:border-accent hover:text-foreground active:scale-95"
          >
            ← Ver fotos
          </button>
          <button
            onClick={() => setExploded((v) => !v)}
            className="rounded-full bg-accent px-5 py-2 text-sm font-semibold text-background transition hover:scale-105 hover:brightness-110 active:scale-95"
          >
            {exploded ? "Vista normal" : "Vista explodida"}
          </button>
        </Reveal>
      )}

      <Reveal
        delay={200}
        className={
          view === "foto"
            ? "relative mx-auto aspect-[944/680] w-full max-w-3xl overflow-hidden rounded-2xl border border-panel-border bg-panel"
            : "relative h-[70vh] w-full max-w-4xl overflow-hidden rounded-2xl border border-panel-border bg-panel"
        }
      >
        {view === "foto" ? (
          <FotoCarousel onVerModelo={() => setView("3d")} />
        ) : (
          <>
            <SeladoraCanvas
              exploded={exploded}
              selected={selected}
              onSelect={setSelected}
              onMiss={() => setSelected(null)}
            />

            <div className="absolute right-4 top-4 flex flex-col items-end gap-1.5">
              <div className="flex items-center gap-3 rounded-full border border-panel-border bg-background/80 px-3 py-1.5 text-xs backdrop-blur">
                {[
                  { label: "TEMP", value: "4.2°C" },
                  { label: "O2", value: "3.1%" },
                  { label: "CO2", value: "8.4%" },
                ].map((leitura) => (
                  <span key={leitura.label} className="flex items-center gap-1.5">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
                    </span>
                    <span className="text-muted">{leitura.label}</span>
                    <span className="font-semibold text-foreground">
                      {leitura.value}
                    </span>
                  </span>
                ))}
              </div>
              <span className="text-[10px] uppercase tracking-wide text-muted">
                leitura simulada
              </span>
            </div>

            {selectedComponent && (
              <div className="absolute bottom-4 left-4 right-4 rounded-xl border border-panel-border bg-background/90 p-4 backdrop-blur sm:right-auto sm:w-80">
                <p className="text-xs font-semibold uppercase tracking-wide text-accent">
                  {selectedComponent.category}
                </p>
                <h3 className="font-heading text-lg font-bold">
                  {selectedComponent.name}
                </h3>
                <p className="mt-1 text-sm text-muted">{selectedComponent.function}</p>
                <p className="mt-1 text-xs text-muted italic">
                  {selectedComponent.location}
                </p>
              </div>
            )}
          </>
        )}
      </Reveal>
    </section>
  );
}
