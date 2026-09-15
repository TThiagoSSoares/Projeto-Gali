// Conteúdo textual do site. Edite aqui sem mexer nos componentes.

export const site = {
  kicker: "Projeto Integrador · Engenharia de Produção",
  name: "FreshPack",
  tagline:
    "Seladora com atmosfera controlada para o hortifrúti do supermercado.",
};

export type NavItem = {
  label: string;
  href: string;
};

// Adicione um item aqui a cada nova seção construída no site.
export const navItems: NavItem[] = [
  { label: "Início", href: "#topo" },
  { label: "A Seladora", href: "#seladora-3d" },
  { label: "Componentes", href: "#componentes" },
  { label: "Atmosfera", href: "#atmosfera" },
  { label: "Embalagens", href: "#embalagens" },
];
