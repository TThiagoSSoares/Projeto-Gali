// Conteúdo do comparativo MAP x CA. Edite aqui sem mexer no componente.

export const atmosferaComparativo = {
  map: {
    title: "Atmosfera Modificada (MAP)",
    subtitle: "O ar é trocado uma vez, na hora da selagem.",
    points: [
      "A mistura de gases é definida no momento em que o pacote é fechado.",
      "Ninguém corrige depois — a composição vai se alterando conforme o produto respira.",
      "Com o tempo, o ar dentro da embalagem se afasta da faixa ideal.",
    ],
  },
  ca: {
    title: "Atmosfera Controlada (CA)",
    subtitle: "A composição é monitorada e corrigida o tempo todo.",
    points: [
      "Sensores de O2, CO2 e temperatura leem o ar dentro da câmara continuamente.",
      "O ESP32 ajusta a mistura sempre que ela sai da faixa ideal.",
      "O produto se mantém na condição certa por mais tempo na gôndola.",
    ],
  },
  destaque:
    "O diferencial do FreshPack é a atmosfera controlada — e são os sensores e o ESP32 que sustentam isso, corrigindo a mistura em vez de só trocar o ar uma vez.",
};
