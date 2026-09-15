import { machineComponents, type ComponentCategory } from "@/data/components";

const CATEGORIES: ComponentCategory[] = [
  "Estrutura",
  "Selagem",
  "Eletrônica/controle",
];

export function Componentes() {
  return (
    <section
      id="componentes"
      className="border-t border-panel-border px-4 py-20"
    >
      <div className="mx-auto max-w-5xl">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            Montagem
          </p>
          <h2 className="font-heading text-3xl font-bold sm:text-4xl">
            Componentes
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-muted">
            As peças que formam a seladora, agrupadas por área da máquina.
          </p>
        </div>

        <div className="mt-12 flex flex-col gap-12">
          {CATEGORIES.map((category) => (
            <div key={category}>
              <h3 className="font-heading text-xl font-bold text-accent">
                {category}
              </h3>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {machineComponents
                  .filter((c) => c.category === category)
                  .map((component) => (
                    <div
                      key={component.id}
                      className="rounded-xl border border-panel-border bg-panel p-5"
                    >
                      <h4 className="font-heading text-lg font-bold">
                        {component.name}
                      </h4>
                      <p className="mt-2 text-sm text-muted">
                        {component.function}
                      </p>
                      <p className="mt-3 text-xs italic text-muted">
                        {component.location}
                      </p>
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
