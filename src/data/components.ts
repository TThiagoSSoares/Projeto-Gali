// Lista de componentes de montagem da seladora. Edite aqui sem mexer nos componentes visuais.
// `hotspot: true` faz a peça aparecer como ponto clicável no modelo 3D.

export type ComponentCategory = "Estrutura" | "Selagem" | "Eletrônica/controle";

export type MachineComponent = {
  id: string;
  category: ComponentCategory;
  name: string;
  function: string;
  location: string;
  hotspot?: boolean;
  image?: string;
};

export const machineComponents: MachineComponent[] = [
  {
    id: "chassi",
    category: "Estrutura",
    name: "Chassi",
    function:
      "Estrutura de aço inoxidável que sustenta e alinha todos os módulos da máquina.",
    location: "Base da seladora, por baixo de tudo.",
    hotspot: true,
  },
  {
    id: "placas-metal",
    category: "Estrutura",
    name: "Placas de metal",
    function:
      "Painéis de revestimento que protegem os componentes internos e dão rigidez ao gabinete.",
    location: "Laterais e parte superior do gabinete.",
    hotspot: true,
    image: "/images/components/placas-metal.jpg",
  },
  {
    id: "suportes",
    category: "Estrutura",
    name: "Suportes",
    function: "Fixam e nivelam a máquina sobre a bancada.",
    location: "Pés ajustáveis embaixo do chassi.",
    hotspot: true,
  },
  {
    id: "resistencia",
    category: "Selagem",
    name: "Resistência de selagem",
    function:
      "Aquece a barra de selagem para fundir o filme plástico e fechar a embalagem.",
    location: "Sob a bandeja, na área de selagem.",
    hotspot: true,
    image: "/images/components/resistencia.jpg",
  },
  {
    id: "agulhas",
    category: "Selagem",
    name: "Agulhas de injeção de gás",
    function:
      "Injetam a mistura de gases dentro da embalagem antes de a selagem fechar.",
    location: "Fileira dentro da câmara de selagem.",
    hotspot: true,
    image: "/images/components/agulhas.jpg",
  },
  {
    id: "arduino",
    category: "Eletrônica/controle",
    name: "Arduino",
    function: "Controla o ciclo de selagem e a leitura dos sensores.",
    location: "Dentro do painel de controle, ao lado do ESP32.",
    hotspot: true,
    image: "/images/components/arduino.jpg",
  },
  {
    id: "esp32",
    category: "Eletrônica/controle",
    name: "ESP32",
    function: "Envia os dados dos sensores para o painel de monitoramento.",
    location: "Dentro do painel de controle.",
    hotspot: true,
    image: "/images/components/esp32.jpg",
  },
  {
    id: "sensor-gas",
    category: "Eletrônica/controle",
    name: "Sensores de gás (O2 e CO2)",
    function:
      "Medem a composição do ar dentro da câmara para manter a atmosfera na faixa ideal.",
    location: "Dentro da câmara de selagem, perto das agulhas.",
    hotspot: true,
  },
  {
    id: "sensor-temp",
    category: "Eletrônica/controle",
    name: "Sensor de temperatura",
    function: "Monitora a temperatura do produto e do ambiente interno.",
    location: "Dentro da câmara de selagem.",
    hotspot: true,
    image: "/images/components/sensor-temp.jpg",
  },
  {
    id: "valvulas",
    category: "Eletrônica/controle",
    name: "Válvulas",
    function: "Controlam a entrada e a correção da mistura de gases.",
    location: "Ao lado do tubo de gás, no topo da máquina.",
    hotspot: true,
  },
];
