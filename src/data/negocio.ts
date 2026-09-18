// Conteúdo do modelo de negócio e contato. Edite aqui sem mexer nos componentes.

export const contato = {
  whatsapp: "5515992566575",
  mensagem: "Olá! Quero saber mais sobre a seladora FreshPack (venda/locação).",
};

export type Oferta = {
  label: string;
  valor: number;
  preco: string;
  periodo?: string;
  detalhe?: string;
  bullets: string[];
};

export const ofertas: Record<"venda" | "locacao", Oferta> = {
  venda: {
    label: "Venda",
    valor: 52000,
    preco: "R$ 52.000",
    periodo: "à vista",
    bullets: [
      "Propriedade total do equipamento, sem mensalidade.",
      "Instalação e treinamento inclusos na entrega técnica.",
      "Compra de embalagens à parte, sob demanda junto à Takepack.",
    ],
  },
  locacao: {
    label: "Locação",
    valor: 3500,
    preco: "R$ 3.500",
    periodo: "/mês",
    detalhe: "Total R$ 42.000/ano · fidelidade de 12 meses",
    bullets: [
      "Instalação, treinamento, manutenção, calibração e suporte técnico contínuo.",
      "Franquia de até 5.000 embalagens/mês já inclusa — fornecidas pela parceira Takepack.",
      "Consumo acima da franquia é cobrado à parte, como embalagem extra.",
    ],
  },
};

export const citacaoNegocio =
  "A seladora é o produto que vendemos e locamos. A Takepack só entra para garantir o insumo do plano — as embalagens.";

export const notaContato =
  "Assim que o plano é assinado, você já pode entrar em contato pra escolher as embalagens da franquia.";

export const disclaimer =
  "Valores estimados com base em equipamentos de atmosfera modificada/controlada similares disponíveis no mercado nacional e internacional. Sujeitos a ajuste conforme configuração final da máquina.";
