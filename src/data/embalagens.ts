// Conteúdo da parceria e do catálogo de embalagens. Edite aqui sem mexer nos componentes.

export const parceria = {
  nome: "Takepack Embalagens",
  papel: "Fornece a embalagem",
  modelo:
    "A Takepack fornece as embalagens e filmes compatíveis com a seladora, sem custo para o FreshPack. Em troca, a embalagem pode receber a marca do próprio supermercado — uma possibilidade de marca própria, sem custo de indústria para a rede.",
  citacao:
    "A Takepack entra como parceira estratégica no fornecimento das embalagens, enquanto o FreshPack agrega a tecnologia de atmosfera controlada ao processo.",
};

export type Embalagem = {
  id: string;
  nome: string;
  capacidade: string;
  dimensoes?: string;
  imagem?: string;
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
      { id: "K41", nome: "K41", capacidade: "684ml", dimensoes: "216x164x25mm", imagem: "/images/embalagens/K41.jpg" },
      { id: "D45", nome: "D45", capacidade: "500ml", dimensoes: "224x175x23mm", imagem: "/images/embalagens/D45.jpg" },
      { id: "D77", nome: "D77", capacidade: "770ml", dimensoes: "224x175x32mm", imagem: "/images/embalagens/D77.jpg" },
      { id: "K88", nome: "K88", capacidade: "880ml", dimensoes: "216x164x35mm", imagem: "/images/embalagens/K88.jpg" },
      { id: "JF-4", nome: "JF-4", capacidade: "723ml", dimensoes: "216x164x35mm", imagem: "/images/embalagens/JF-4.jpg" },
    ],
  },
  {
    categoria: "Bandejas médias e fundas",
    descricao: "Fruta cortada, legume picado",
    itens: [
      { id: "K51", nome: "K51", capacidade: "529ml", dimensoes: "147x127x46mm", imagem: "/images/embalagens/K51.jpg" },
      { id: "D100", nome: "D100", capacidade: "930ml", dimensoes: "224x175x42mm", imagem: "/images/embalagens/D100.jpg" },
      { id: "K115", nome: "K115", capacidade: "1150ml", dimensoes: "219x167x50mm", imagem: "/images/embalagens/K115.jpg" },
      { id: "K121", nome: "K121", capacidade: "1240ml", dimensoes: "216x164x52mm", imagem: "/images/embalagens/K121.jpg" },
      { id: "K151", nome: "K151", capacidade: "1450ml", dimensoes: "216x164x62mm", imagem: "/images/embalagens/K151.jpg" },
    ],
  },
  {
    categoria: "Grandes",
    descricao: "Bandeja família, mix de frutas",
    itens: [
      { id: "K170", nome: "K170", capacidade: "1700ml", dimensoes: "234x202x50mm", imagem: "/images/embalagens/K170.jpg" },
      { id: "D120", nome: "D120", capacidade: "1200ml", dimensoes: "234x202x38mm", imagem: "/images/embalagens/D120.jpg" },
      { id: "P.A.P.", nome: "P.A.P.", capacidade: "2260ml", dimensoes: "233x200x85mm", imagem: "/images/embalagens/PAP.jpg" },
    ],
  },
  {
    categoria: "Potes redondos",
    descricao: "Morango, uva, tomate cereja",
    itens: [
      { id: "Pote-13", nome: "Pote 13", capacidade: "130ml", imagem: "/images/embalagens/Pote-13.jpg" },
      { id: "Pote-19", nome: "Pote 19", capacidade: "189ml", imagem: "/images/embalagens/Pote-19.jpg" },
      { id: "Pote-26", nome: "Pote 26", capacidade: "275ml", imagem: "/images/embalagens/Pote-26.jpg" },
      { id: "BS6", nome: "BS6", capacidade: "500ml", imagem: "/images/embalagens/BS6.png" },
      { id: "BS10", nome: "BS10", capacidade: "1280ml", imagem: "/images/embalagens/BS10.png" },
    ],
  },
];
