import { site } from "@/data/site";

export function Hero() {
  return (
    <section
      id="topo"
      className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 pt-14 text-center"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
        {site.kicker}
      </p>
      <h1 className="font-heading text-5xl font-bold tracking-tight sm:text-7xl">
        {site.name}
      </h1>
      <span className="h-px w-16 bg-accent" />
      <p className="max-w-xl text-lg text-muted sm:text-xl">{site.tagline}</p>
      <a
        href="#seladora-3d"
        className="mt-4 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-background transition hover:brightness-110"
      >
        Ver a seladora em 3D
      </a>
    </section>
  );
}
