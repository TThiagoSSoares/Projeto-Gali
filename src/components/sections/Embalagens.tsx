import { parceria, embalagemCategorias } from "@/data/embalagens";

function FotoPlaceholder() {
  return (
    <div className="flex aspect-[4/3] items-center justify-center rounded-lg border border-dashed border-panel-border bg-background/40">
      <svg
        viewBox="0 0 24 24"
        className="h-6 w-6 text-muted"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        aria-hidden="true"
      >
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <circle cx="8.5" cy="9.5" r="1.5" />
        <path d="M21 16l-5.5-5.5L9 17" />
      </svg>
    </div>
  );
}

const FLUXO = [
  {
    titulo: "Takepack fornece",
    texto: "Embalagens e filmes compatíveis com a seladora, sem custo para o FreshPack.",
    destaque: false,
  },
  {
    titulo: "FreshPack realiza",
    texto: "O processo de selagem com atmosfera controlada.",
    destaque: true,
  },
  {
    titulo: "Supermercado recebe",
    texto: "O produto embalado, pronto pra gôndola — sem custo de embalagem.",
    destaque: false,
  },
];

export function Embalagens() {
  return (
    <section id="embalagens" className="border-t border-panel-border px-4 py-20">
      <div className="mx-auto max-w-5xl">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            Parceria
          </p>
          <h2 className="font-heading text-3xl font-bold sm:text-4xl">
            {parceria.nome}
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-muted">{parceria.modelo}</p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {FLUXO.map((passo, i) => (
            <div key={passo.titulo} className="relative">
              <div
                className={`h-full rounded-2xl border p-5 ${
                  passo.destaque
                    ? "border-2 border-accent bg-panel"
                    : "border-panel-border bg-panel"
                }`}
              >
                <h3 className="font-heading text-lg font-bold">
                  {passo.titulo}
                </h3>
                <p className="mt-2 text-sm text-muted">{passo.texto}</p>
              </div>
              {i < FLUXO.length - 1 && (
                <span className="absolute top-1/2 -right-3 hidden -translate-y-1/2 text-xl text-accent sm:block">
                  →
                </span>
              )}
            </div>
          ))}
        </div>

        <div className="mt-16 flex flex-col gap-10">
          {embalagemCategorias.map((grupo) => (
            <div key={grupo.categoria}>
              <h3 className="font-heading text-xl font-bold text-accent">
                {grupo.categoria}
              </h3>
              <p className="text-sm text-muted">{grupo.descricao}</p>
              <div className="mt-4 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-3">
                {grupo.itens.map((item) => (
                  <div
                    key={item.id}
                    className="w-36 shrink-0 snap-start rounded-xl border border-panel-border bg-panel p-3"
                  >
                    <FotoPlaceholder />
                    <h4 className="mt-3 font-heading text-base font-bold">
                      {item.nome}
                    </h4>
                    <p className="text-sm text-muted">{item.capacidade}</p>
                    {item.dimensoes && (
                      <p className="text-xs text-muted">{item.dimensoes}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
