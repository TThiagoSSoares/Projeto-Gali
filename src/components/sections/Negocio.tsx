"use client";

import { useState } from "react";
import { ofertas, citacaoNegocio, notaContato, contato, disclaimer } from "@/data/negocio";
import { Reveal } from "@/components/Reveal";

export function Negocio() {
  const [modo, setModo] = useState<"venda" | "locacao">("venda");
  const oferta = ofertas[modo];

  const whatsappHref = `https://wa.me/${contato.whatsapp}?text=${encodeURIComponent(contato.mensagem)}`;

  return (
    <section id="negocio" className="border-t border-panel-border px-4 py-20">
      <div className="mx-auto max-w-4xl">
        <Reveal className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            Modelo de negócio
          </p>
          <h2 className="font-heading text-3xl font-bold sm:text-4xl">
            Como o FreshPack gera valor
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-muted">
            O produto é a seladora — vendida ou locada. A parceria com a
            Takepack é um detalhe embutido no plano.
          </p>
        </Reveal>

        <Reveal delay={100} className="mt-8 flex justify-center">
          <div className="inline-flex rounded-full border border-panel-border bg-panel p-1">
            {(["venda", "locacao"] as const).map((key) => (
              <button
                key={key}
                onClick={() => setModo(key)}
                className={`rounded-full px-6 py-2 text-sm font-semibold transition ${
                  modo === key
                    ? "bg-accent text-background"
                    : "text-muted hover:text-foreground"
                }`}
              >
                {ofertas[key].label}
              </button>
            ))}
          </div>
        </Reveal>

        <Reveal
          delay={180}
          className="mt-6 rounded-2xl border border-accent bg-panel p-6 sm:p-8"
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-accent">
            {oferta.label === "Venda" ? "Venda à vista" : "Locação — plano anual"}
          </p>
          <p className="mt-1 font-heading text-4xl font-bold">
            {oferta.preco}
            {oferta.periodo && (
              <span className="ml-2 text-lg font-normal text-muted">
                {oferta.periodo}
              </span>
            )}
          </p>
          {oferta.detalhe && (
            <p className="mt-1 text-sm italic text-muted">{oferta.detalhe}</p>
          )}
          <ul className="mt-5 flex flex-col gap-2">
            {oferta.bullets.map((b) => (
              <li key={b} className="flex gap-2 text-sm text-foreground">
                <span className="text-accent">✓</span>
                {b}
              </li>
            ))}
          </ul>

          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-background transition hover:scale-105 hover:brightness-110 active:scale-95 sm:w-auto"
          >
            Falar no WhatsApp
          </a>
          <p className="mt-3 text-xs text-muted">{notaContato}</p>
        </Reveal>

        <Reveal
          delay={260}
          className="mt-6 rounded-xl border border-accent-warm bg-panel p-5 text-center"
        >
          <p className="text-sm italic text-foreground sm:text-base">
            &ldquo;{citacaoNegocio}&rdquo;
          </p>
        </Reveal>

        <p className="mt-6 text-center text-xs italic text-muted">{disclaimer}</p>
      </div>
    </section>
  );
}
