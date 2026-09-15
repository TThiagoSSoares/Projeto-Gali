// Conteúdo da parceria e do catálogo de embalagens. Edite aqui sem mexer nos componentes.

export const parceria = {
  nome: "Takepack Embalagens",
  papel: "Fornece a embalagem",
  modelo:
    "Modelo de permuta: a Takepack fornece as embalagens sem custo para o FreshPack, e em troca a embalagem sai impressa apenas com a logo da Takepack. O supermercado não paga pela embalagem.",
};

export type Embalagem = {
  id: string;
  nome: string;
  capacidade: string;
  dimensoes?: string;
};

export type EmbalagemCategoria = {
  categoria: string;
  descricao: string;
  itens: Embalagem[];
};

export const embalagemCategorias: EmbalagemCategoria[] = [
  {
    categoria: "Bandejas rasas",
    descricao: "Folhas, saladas, mix",
    itens: [
      { id: "K41", nome: "K41", capacidade: "684ml", dimensoes: "216x164x25mm" },
      { id: "D45", nome: "D45", capacidade: "500ml", dimensoes: "224x175x23mm" },
      { id: "D77", nome: "D77", capacidade: "770ml", dimensoes: "224x175x32mm" },
      { id: "K88", nome: "K88", capacidade: "880ml", dimensoes: "216x164x35mm" },
      { id: "JF-4", nome: "JF-4", capacidade: "723ml", dimensoes: "216x164x35mm" },
    ],
  },
  {
    categoria: "Bandejas médias e fundas",
    descricao: "Fruta cortada, legume picado",
    itens: [
      { id: "K51", nome: "K51", capacidade: "529ml", dimensoes: "147x127x46mm" },
      { id: "D100", nome: "D100", capacidade: "930ml", dimensoes: "224x175x42mm" },
      { id: "K115", nome: "K115", capacidade: "1150ml", dimensoes: "219x167x50mm" },
      { id: "K121", nome: "K121", capacidade: "1240ml", dimensoes: "216x164x52mm" },
      { id: "K151", nome: "K151", capacidade: "1450ml", dimensoes: "216x164x62mm" },
    ],
  },
  {
    categoria: "Grandes",
    descricao: "Bandeja família, mix de frutas",
    itens: [
      { id: "K170", nome: "K170", capacidade: "1700ml", dimensoes: "234x202x50mm" },
      { id: "D120", nome: "D120", capacidade: "1200ml", dimensoes: "234x202x38mm" },
      { id: "P.A.P.", nome: "P.A.P.", capacidade: "2260ml", dimensoes: "233x200x85mm" },
    ],
  },
  {
    categoria: "Potes redondos",
    descricao: "Morango, uva, tomate cereja",
    itens: [
      { id: "Pote-13", nome: "Pote 13", capacidade: "130ml" },
      { id: "Pote-19", nome: "Pote 19", capacidade: "189ml" },
      { id: "Pote-26", nome: "Pote 26", capacidade: "275ml" },
      { id: "BS6", nome: "BS6", capacidade: "500ml" },
      { id: "BS10", nome: "BS10", capacidade: "1280ml" },
    ],
  },
];
