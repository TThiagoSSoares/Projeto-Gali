import { atmosferaComparativo } from "@/data/atmosfera";

function GasChart({ variant }: { variant: "map" | "ca" }) {
  const lineColor = variant === "ca" ? "var(--color-accent)" : "var(--color-accent-warm)";
  const path =
    variant === "ca"
      ? "M0,42 L30,40 L60,44 L90,41 L120,43 L150,40 L180,42 L200,41"
      : "M0,42 L30,36 L60,50 L90,28 L120,58 L150,20 L180,64 L200,15";

  return (
    <svg viewBox="0 0 200 80" className="h-20 w-full" aria-hidden="true">
      <rect x="0" y="32" width="200" height="18" fill="var(--color-accent)" opacity="0.12" />
      <line x1="0" y1="32" x2="200" y2="32" stroke="var(--color-accent)" strokeOpacity="0.4" strokeDasharray="3 3" />
      <line x1="0" y1="50" x2="200" y2="50" stroke="var(--color-accent)" strokeOpacity="0.4" strokeDasharray="3 3" />
      <path d={path} fill="none" stroke={lineColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Atmosfera() {
  const { map, ca, destaque } = atmosferaComparativo;

  return (
    <section id="atmosfera" className="border-t border-panel-border px-4 py-20">
      <div className="mx-auto max-w-5xl">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            O diferencial
          </p>
          <h2 className="font-heading text-3xl font-bold sm:text-4xl">
            Atmosfera controlada x atmosfera modificada
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-muted">
            Faixa de O2 dentro da embalagem ao longo do tempo — representação
            ilustrativa.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-panel-border bg-panel p-6">
            <h3 className="font-heading text-xl font-bold">{map.title}</h3>
            <p className="mt-1 text-sm text-muted">{map.subtitle}</p>
            <div className="mt-5">
              <GasChart variant="map" />
            </div>
            <ul className="mt-5 flex flex-col gap-2">
              {map.points.map((point) => (
                <li key={point} className="text-sm text-muted">
                  {point}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative rounded-2xl border-2 border-accent bg-panel p-6">
            <span className="absolute -top-3 right-6 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-background">
              Diferencial FreshPack
            </span>
            <h3 className="font-heading text-xl font-bold">{ca.title}</h3>
            <p className="mt-1 text-sm text-muted">{ca.subtitle}</p>
            <div className="mt-5">
              <GasChart variant="ca" />
            </div>
            <ul className="mt-5 flex flex-col gap-2">
              {ca.points.map((point) => (
                <li key={point} className="text-sm text-foreground">
                  {point}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 rounded-xl border border-accent bg-panel p-5">
          <p className="text-sm font-medium text-foreground sm:text-base">
            {destaque}
          </p>
        </div>
      </div>
    </section>
  );
}
