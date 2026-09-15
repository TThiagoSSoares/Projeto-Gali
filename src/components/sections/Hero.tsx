import { site } from "@/data/site";

export function Hero() {
  return (
    <section
      id="topo"
      className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 pt-14 text-center"
    >
      <p
        className="hero-animate text-xs font-semibold uppercase tracking-[0.2em] text-accent"
        style={{ animationDelay: "0ms" }}
      >
        {site.kicker}
      </p>
      <h1
        className="hero-animate font-heading text-5xl font-bold tracking-tight sm:text-7xl"
        style={{ animationDelay: "120ms" }}
      >
        {site.name}
      </h1>
      <span
        className="hero-animate h-px w-16 bg-accent"
        style={{ animationDelay: "240ms" }}
      />
      <p
        className="hero-animate max-w-xl text-lg text-muted sm:text-xl"
        style={{ animationDelay: "320ms" }}
      >
        {site.tagline}
      </p>
      <a
        href="#seladora-3d"
        className="hero-animate mt-4 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-background transition hover:scale-105 hover:brightness-110 active:scale-95"
        style={{ animationDelay: "440ms" }}
      >
        Ver a seladora em 3D
      </a>
    </section>
  );
}
