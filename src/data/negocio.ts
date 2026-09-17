// Conteúdo do modelo de negócio e contato. Edite aqui sem mexer nos componentes.

export const contato = {
  whatsapp: "5515992566575",
  mensagem: "Olá! Quero saber mais sobre a seladora FreshPack (venda/locação).",
};

export type Oferta = {
  label: string;
  preco: string;
  periodo?: string;
  bullets: string[];
};

export const ofertas: Record<"venda" | "locacao", Oferta> = {
  venda: {
    label: "Venda",
    preco: "R$ 52.000",
    periodo: "à vista",
    bullets: [
      "Seladora com atmosfera controlada, instalada na loja",
      "Instalação e treinamento da equipe inclusos",
      "Manutenção e calibração dos sensores no primeiro ano",
    ],
  },
  locacao: {
    label: "Locação",
    preco: "R$ 2.400",
    periodo: "/mês",
    bullets: [
      "Sem investimento inicial alto — a máquina é sua enquanto durar o contrato",
      "Instalação, treinamento, manutenção e calibração inclusos na mensalidade",
      "Suporte técnico contínuo enquanto o contrato estiver ativo",
    ],
  },
};

export const receitaRecorrente = {
  titulo: "Fornecimento contínuo de embalagens",
  texto:
    "Além da venda ou locação da máquina, o supermercado compra as embalagens do FreshPack toda semana, enquanto a seladora estiver em operação — é essa receita recorrente que sustenta o negócio no longo prazo.",
};

export const disclaimer =
  "Valores estimados com base em equipamentos de atmosfera modificada/controlada similares disponíveis no mercado nacional e internacional. Sujeitos a ajuste conforme configuração final da máquina.";
