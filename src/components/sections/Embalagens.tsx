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

export function Embalagens() {
  return (
    <section id="embalagens" className="border-t border-panel-border px-4 py-20">
      <div className="mx-auto max-w-5xl">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            Parceria
          </p>
          <h2 className="font-heading text-3xl font-bold sm:text-4xl">
            Embalagens
          </h2>
        </div>

        <div className="mt-10 rounded-2xl border border-accent bg-panel p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-wide text-accent">
            {parceria.papel}
          </p>
          <h3 className="font-heading text-2xl font-bold">{parceria.nome}</h3>
          <p className="mt-3 max-w-2xl text-sm text-muted sm:text-base">
            {parceria.modelo}
          </p>
        </div>

        <div className="mt-14 flex flex-col gap-12">
          {embalagemCategorias.map((grupo) => (
            <div key={grupo.categoria}>
              <h3 className="font-heading text-xl font-bold text-accent">
                {grupo.categoria}
              </h3>
              <p className="text-sm text-muted">{grupo.descricao}</p>
              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                {grupo.itens.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-xl border border-panel-border bg-panel p-3"
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
