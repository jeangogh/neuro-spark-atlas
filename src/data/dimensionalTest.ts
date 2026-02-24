/**
 * Painel Dimensional de Adaptação — Instrumento de Duas Camadas
 * 
 * Camada 1: Screening Dimensional (56 itens, 7 dimensões × 8 itens)
 * Camada 2: Aprofundamento Adaptativo (por dimensão alostática)
 */

export type ItemType = "R" | "A"; // R = regulado (invertido), A = alostático (direto)

export interface DimensionalQuestion {
  id: string;
  text: string;
  type: ItemType;
}

export interface Layer2OpenQuestion {
  id: string;
  prompt: string;
}

export interface Layer2Dimension {
  desempenho: DimensionalQuestion[];
  vinculo: DimensionalQuestion[];
  fisiologico: DimensionalQuestion[];
  abertas: Layer2OpenQuestion[];
}

export interface DimensionDef {
  key: string;
  label: string;
  shortLabel: string;
  description: string;
  questionsC1: DimensionalQuestion[];
  layer2: Layer2Dimension;
}

export const SCALE_MIN = 0;
export const SCALE_MAX = 4;
export const SCALE_LABELS = [
  { value: 0, label: "Não me reconheço" },
  { value: 1, label: "Raramente" },
  { value: 2, label: "Às vezes" },
  { value: 3, label: "Frequentemente" },
  { value: 4, label: "Totalmente eu" },
];

export const THRESHOLD_ALOSTASE = 18; // ≥ 18/32 = alostático
export const ITEMS_PER_DIM_C1 = 8;
export const MAX_SCORE_C1 = ITEMS_PER_DIM_C1 * SCALE_MAX; // 32

function q(dimKey: string, layer: 1 | 2, sub: string, idx: number, text: string, type: ItemType): DimensionalQuestion {
  return { id: `dim_${dimKey}_c${layer}_${sub}_${idx}`, text, type };
}

function oq(dimKey: string, idx: number, prompt: string): Layer2OpenQuestion {
  return { id: `dim_${dimKey}_c2_open_${idx}`, prompt };
}

/* ═══════════════════════════════════════════
   DIMENSÕES
   ═══════════════════════════════════════════ */

export const DIMENSIONS: DimensionDef[] = [
  // ─── 1. RITMO & ENERGIA ───
  {
    key: "ritmo",
    label: "Ritmo & Energia",
    shortLabel: "Ritmo",
    description: "Regulação de ciclos de energia, sono e recuperação",
    questionsC1: [
      q("ritmo", 1, "q", 1, "Se olho a última semana, consigo apontar um padrão previsível de quando rendo e quando não rendo.", "R"),
      q("ritmo", 1, "q", 2, "Tenho períodos de 2–3 dias em que funciono muito bem, seguidos de dias em que quase não consigo operar.", "A"),
      q("ritmo", 1, "q", 3, "Quando durmo mal por duas noites, meu desempenho e meu humor caem visivelmente no dia seguinte.", "A"),
      q("ritmo", 1, "q", 4, "Consigo manter uma rotina de sono e vigília que funciona para mim ao longo de semanas.", "R"),
      q("ritmo", 1, "q", 5, "Pessoas próximas já comentaram que sou \"8 ou 80\" em energia.", "A"),
      q("ritmo", 1, "q", 6, "Mesmo em semanas sem grandes eventos, minha energia oscila de forma que atrapalha meus planos.", "A"),
      q("ritmo", 1, "q", 7, "Quando preciso de mais esforço, consigo aumentar a carga por alguns dias sem colapsar depois.", "R"),
      q("ritmo", 1, "q", 8, "Sinto que meu corpo acumula uma dívida que cobra de uma vez — em exaustão, dor ou travamento.", "A"),
    ],
    layer2: {
      desempenho: [
        q("ritmo", 2, "desemp", 1, "Nas últimas 4 semanas, quantas vezes sua queda de energia impediu você de entregar algo importante no prazo?", "A"),
        q("ritmo", 2, "desemp", 2, "Quando está em \"fase boa\", você assume compromissos que não consegue sustentar quando a energia cai?", "A"),
        q("ritmo", 2, "desemp", 3, "Já perdeu oportunidade profissional ou financeira porque estava num ciclo de baixa?", "A"),
      ],
      vinculo: [
        q("ritmo", 2, "vinc", 1, "Quando sua energia desaba, as pessoas ao seu redor são afetadas — você cancela, fica irritável ou se isola?", "A"),
        q("ritmo", 2, "vinc", 2, "Pessoas próximas já expressaram frustração com sua inconsistência de presença ou disponibilidade?", "A"),
        q("ritmo", 2, "vinc", 3, "Consegue pedir ajuda ou comunicar que está num ciclo de baixa sem que isso gere conflito?", "R"),
      ],
      fisiologico: [
        q("ritmo", 2, "fisio", 1, "Nas últimas 4 semanas, quantos dias você acordou sentindo que o sono não foi suficiente, mesmo tendo dormido?", "A"),
        q("ritmo", 2, "fisio", 2, "Seu corpo manifesta o desgaste acumulado de forma recorrente — dores, tensão, problemas digestivos, queda de imunidade?", "A"),
      ],
      abertas: [
        oq("ritmo", 1, "Descreva um exemplo recente (últimas 4 semanas) em que sua oscilação de energia causou um problema concreto — no trabalho, num relacionamento ou na sua saúde. O que aconteceu e qual foi o custo?"),
        oq("ritmo", 2, "Se você pudesse estabilizar uma coisa no seu ritmo para que o resto melhorasse, o que seria?"),
      ],
    },
  },

  // ─── 2. SALIÊNCIA & AMEAÇA ───
  {
    key: "ameaca",
    label: "Saliência & Ameaça",
    shortLabel: "Ameaça",
    description: "Calibração do sistema de alerta e detecção de perigo",
    questionsC1: [
      q("ameaca", 1, "q", 1, "Quando recebo uma mensagem curta ou seca de alguém importante, minha primeira reação é achar que algo está errado.", "A"),
      q("ameaca", 1, "q", 2, "Consigo entrar em um ambiente novo e me situar sem que meu corpo fique tenso.", "R"),
      q("ameaca", 1, "q", 3, "Demoro para \"desligar\" depois de uma situação tensa — fico repensando ou com o corpo ativado por horas.", "A"),
      q("ameaca", 1, "q", 4, "Quando há incerteza sobre o que vai acontecer, consigo esperar sem criar cenários negativos.", "R"),
      q("ameaca", 1, "q", 5, "Reajo fisicamente (coração acelerado, tensão, calor) a situações que depois percebo que não eram ameaça real.", "A"),
      q("ameaca", 1, "q", 6, "Em ambientes com muita gente ou competição, consigo me manter presente sem ficar na defensiva.", "R"),
      q("ameaca", 1, "q", 7, "Evito situações que provavelmente seriam boas para mim porque antecipo que algo vai dar errado.", "A"),
      q("ameaca", 1, "q", 8, "Meu corpo passa a maior parte do dia em estado de prontidão, mesmo quando não há risco real.", "A"),
    ],
    layer2: {
      desempenho: [
        q("ameaca", 2, "desemp", 1, "Já deixou de tomar uma decisão importante porque estava preso em antecipação de cenários negativos?", "A"),
        q("ameaca", 2, "desemp", 2, "O estado de alerta diminui sua capacidade de focar no trabalho — mesmo quando não há ameaça real?", "A"),
        q("ameaca", 2, "desemp", 3, "Evita desafios profissionais que sabe que teria capacidade de enfrentar?", "A"),
      ],
      vinculo: [
        q("ameaca", 2, "vinc", 1, "Sua tendência a interpretar sinais como ameaça já causou conflito com alguém que não tinha intenção negativa?", "A"),
        q("ameaca", 2, "vinc", 2, "Quando se sente ameaçado, sua reação imediata afasta as pessoas (ataque, defesa, frieza, acusação)?", "A"),
        q("ameaca", 2, "vinc", 3, "Consegue comunicar que está em alerta sem que isso vire conflito?", "R"),
      ],
      fisiologico: [
        q("ameaca", 2, "fisio", 1, "Com que frequência termina o dia com o corpo tenso, contraído ou dolorido sem ter feito esforço físico?", "A"),
        q("ameaca", 2, "fisio", 2, "Tem dificuldade de adormecer ou acorda durante a noite por pensamentos acelerados ou preocupação?", "A"),
      ],
      abertas: [
        oq("ameaca", 1, "Descreva uma situação recente em que seu \"alarme interno\" disparou e depois você percebeu que a ameaça não era real — ou era muito menor do que pareceu. O que aconteceu no seu corpo e no seu comportamento?"),
        oq("ameaca", 2, "Quais são os 2-3 gatilhos que mais ativam seu sistema de ameaça de forma desproporcional?"),
      ],
    },
  },

  // ─── 3. CONTROLE EXECUTIVO ───
  {
    key: "executivo",
    label: "Controle Executivo",
    shortLabel: "Executivo",
    description: "Organização, foco, início e conclusão de tarefas",
    questionsC1: [
      q("executivo", 1, "q", 1, "Quando defino o que preciso fazer no dia, consigo seguir esse plano até o fim sem desvios relevantes.", "R"),
      q("executivo", 1, "q", 2, "Começo muitas coisas e termino poucas — mesmo quando as considero importantes.", "A"),
      q("executivo", 1, "q", 3, "Quando algo me interessa muito, mergulho de um jeito que depois percebo que negligenciei outras coisas.", "A"),
      q("executivo", 1, "q", 4, "Consigo parar uma atividade prazerosa quando preciso mudar de tarefa.", "R"),
      q("executivo", 1, "q", 5, "Meu rendimento varia muito de dia para dia, sem relação clara com dificuldade da tarefa.", "A"),
      q("executivo", 1, "q", 6, "Consigo organizar etapas de um projeto complexo e ir cumprindo na ordem.", "R"),
      q("executivo", 1, "q", 7, "Já perdi prazos, oportunidades ou dinheiro porque não consegui fechar algo que estava quase pronto.", "A"),
      q("executivo", 1, "q", 8, "Minha produtividade depende mais do meu estado interno do que da importância do que preciso fazer.", "A"),
    ],
    layer2: {
      desempenho: [
        q("executivo", 2, "desemp", 1, "Nas últimas 4 semanas, quantos projetos ou tarefas relevantes ficaram incompletos não por falta de tempo, mas por perda de foco ou organização?", "A"),
        q("executivo", 2, "desemp", 2, "Quando entra em hiperfoco, o que foi negligenciado — e houve consequência?", "A"),
        q("executivo", 2, "desemp", 3, "Sua capacidade de execução depende de ter pressão de prazo iminente?", "A"),
      ],
      vinculo: [
        q("executivo", 2, "vinc", 1, "Pessoas próximas já expressaram frustração porque você esqueceu compromissos, atrasou ou não cumpriu promessas?", "A"),
        q("executivo", 2, "vinc", 2, "Sua desorganização ou impulsividade já gerou conflito repetitivo com a mesma pessoa?", "A"),
        q("executivo", 2, "vinc", 3, "Consegue manter acordos de convivência (divisão de tarefas, horários, responsabilidades compartilhadas) de forma consistente?", "R"),
      ],
      fisiologico: [
        q("executivo", 2, "fisio", 1, "Com que frequência sente exaustão mental desproporcional — como se tivesse trabalhado muito mais do que realmente trabalhou?", "A"),
        q("executivo", 2, "fisio", 2, "Usa cafeína, estimulantes ou estratégias de urgência para compensar a dificuldade de iniciar ou manter tarefas?", "A"),
      ],
      abertas: [
        oq("executivo", 1, "Dê um exemplo concreto de algo importante que você não conseguiu fechar recentemente — e descreva o que aconteceu internamente (não externamente)."),
        oq("executivo", 2, "Qual é o padrão que mais se repete: não começar, não manter ou não fechar?"),
      ],
    },
  },

  // ─── 4. AFETIVIDADE & VÍNCULO ───
  {
    key: "vinculo",
    label: "Afetividade & Vínculo",
    shortLabel: "Vínculo",
    description: "Regulação emocional e padrões relacionais",
    questionsC1: [
      q("vinculo", 1, "q", 1, "Quando alguém importante se afasta ou fica em silêncio, consigo esperar sem entrar em modo de emergência.", "R"),
      q("vinculo", 1, "q", 2, "Tenho um padrão de me aproximar intensamente e depois precisar de distância — ou de afastar as pessoas e depois querer de volta.", "A"),
      q("vinculo", 1, "q", 3, "Depois de um conflito, consigo voltar, reconhecer minha parte e reparar sem escalar.", "R"),
      q("vinculo", 1, "q", 4, "Quando me sinto rejeitado, a intensidade da reação é desproporcional ao que aconteceu de fato.", "A"),
      q("vinculo", 1, "q", 5, "Mantenho relações de longo prazo que passaram por crises e se mantêm sólidas.", "R"),
      q("vinculo", 1, "q", 6, "Fico preso emocionalmente a discussões por dias — revivendo, argumentando internamente, ou planejando o que deveria ter dito.", "A"),
      q("vinculo", 1, "q", 7, "Confio que as pessoas próximas a mim vão estar disponíveis quando eu precisar.", "R"),
      q("vinculo", 1, "q", 8, "Já rompi relações de forma abrupta e depois me arrependi — ou fiquei sem saber como voltar.", "A"),
    ],
    layer2: {
      desempenho: [
        q("vinculo", 2, "desemp", 1, "Quando está em crise relacional, sua capacidade de trabalhar cai visivelmente?", "A"),
        q("vinculo", 2, "desemp", 2, "Já tomou decisões profissionais ruins porque estava emocionalmente desorganizado por uma questão de vínculo?", "A"),
        q("vinculo", 2, "desemp", 3, "Conflitos relacionais ocupam espaço mental que deveria estar disponível para outras coisas?", "A"),
      ],
      vinculo: [
        q("vinculo", 2, "vinc", 1, "Quando olha suas relações importantes nos últimos 2 anos, vê um padrão repetitivo (mesmo tipo de conflito, mesma dinâmica, mesmo desfecho)?", "A"),
        q("vinculo", 2, "vinc", 2, "As pessoas mais próximas confiam na sua estabilidade emocional?", "R"),
        q("vinculo", 2, "vinc", 3, "Consegue manter intimidade sem que se transforme em dependência ou em necessidade de controle?", "R"),
      ],
      fisiologico: [
        q("vinculo", 2, "fisio", 1, "Após conflito ou ameaça de perda relacional, seu corpo reage de forma intensa — tremor, choro, insônia, exaustão?", "A"),
        q("vinculo", 2, "fisio", 2, "Carrega tensão relacional no corpo de forma crônica — aperto no peito, nó no estômago, bruxismo?", "A"),
      ],
      abertas: [
        oq("vinculo", 1, "Descreva o conflito relacional mais recente que te impactou de forma desproporcional. O que ativou, como você reagiu e quanto tempo demorou para sair daquele estado?"),
        oq("vinculo", 2, "Se alguém que te conhece bem descrevesse seu padrão relacional em uma frase, o que diria?"),
      ],
    },
  },

  // ─── 5. SENSORIALIDADE & INTEGRAÇÃO ───
  {
    key: "sensorial",
    label: "Sensorialidade & Integração",
    shortLabel: "Sensorial",
    description: "Processamento sensorial e tolerância a estímulos",
    questionsC1: [
      q("sensorial", 1, "q", 1, "Depois de um evento com muita gente, barulho ou estímulos visuais, preciso de um tempo significativo para me recuperar.", "A"),
      q("sensorial", 1, "q", 2, "Consigo trabalhar com barulho de fundo, interrupções e várias coisas acontecendo ao mesmo tempo sem grande queda de rendimento.", "R"),
      q("sensorial", 1, "q", 3, "Certas texturas, sons ou luzes me incomodam de um jeito que a maioria das pessoas não parece notar.", "A"),
      q("sensorial", 1, "q", 4, "Fico irritado ou exausto em ambientes que outras pessoas consideram normais (escritório aberto, shopping, festa).", "A"),
      q("sensorial", 1, "q", 5, "Consigo participar de reuniões longas ou eventos sociais e sair sem precisar de isolamento depois.", "R"),
      q("sensorial", 1, "q", 6, "Ambientes caóticos ou imprevisíveis desorganizam meu pensamento e minha capacidade de decidir.", "A"),
      q("sensorial", 1, "q", 7, "Multitarefa funciona bem para mim — consigo alternar entre demandas sem me sobrecarregar.", "R"),
      q("sensorial", 1, "q", 8, "Meu desempenho no trabalho ou estudo depende muito das condições sensoriais do ambiente.", "A"),
    ],
    layer2: {
      desempenho: [
        q("sensorial", 2, "desemp", 1, "Já recusou oportunidades profissionais ou sociais porque o ambiente sensorial era incompatível com o seu funcionamento?", "A"),
        q("sensorial", 2, "desemp", 2, "Seu rendimento cai significativamente em ambientes que fogem do seu \"setup ideal\"?", "A"),
        q("sensorial", 2, "desemp", 3, "Precisa de controle ambiental acima do usual para funcionar bem — e quando não tem, a queda é desproporcional?", "A"),
      ],
      vinculo: [
        q("sensorial", 2, "vinc", 1, "Pessoas próximas já se sentiram rejeitadas porque você precisou se retirar ou recusar algo por sobrecarga?", "A"),
        q("sensorial", 2, "vinc", 2, "Sua necessidade de tempo sozinho já foi interpretada como falta de interesse ou distância afetiva?", "A"),
        q("sensorial", 2, "vinc", 3, "Consegue comunicar suas necessidades sensoriais sem que isso gere conflito ou incompreensão?", "R"),
      ],
      fisiologico: [
        q("sensorial", 2, "fisio", 1, "Após exposição prolongada a ambientes estimulantes, precisa de quanto tempo para voltar ao seu normal? (0=minutos, 4=mais de um dia)", "A"),
        q("sensorial", 2, "fisio", 2, "Sobrecarga sensorial gera sintomas físicos recorrentes — enxaqueca, fadiga extrema, irritabilidade somática?", "A"),
      ],
      abertas: [
        oq("sensorial", 1, "Descreva o ambiente em que você funciona melhor e o ambiente que mais te desgasta. O que os diferencia?"),
        oq("sensorial", 2, "Dê um exemplo recente em que sobrecarga sensorial afetou algo importante — uma entrega, uma relação ou sua saúde."),
      ],
    },
  },

  // ─── 6. RECOMPENSA & HÁBITO ───
  {
    key: "recompensa",
    label: "Recompensa & Hábito",
    shortLabel: "Recompensa",
    description: "Sistema motivacional, hábitos e loops de alívio",
    questionsC1: [
      q("recompensa", 1, "q", 1, "Quando estou estressado ou cansado, recorro a comportamentos de alívio rápido que depois me incomodam (comida, telas, compras, etc.).", "A"),
      q("recompensa", 1, "q", 2, "Consigo manter hábitos que sei que são bons para mim por semanas seguidas sem grandes oscilações.", "R"),
      q("recompensa", 1, "q", 3, "Tenho dificuldade de parar algo prazeroso mesmo quando sei que deveria — e isso se repete.", "A"),
      q("recompensa", 1, "q", 4, "Consigo esperar por uma recompensa maior em vez de escolher o alívio imediato.", "R"),
      q("recompensa", 1, "q", 5, "Oscilo entre períodos de disciplina rígida e períodos de perda de controle sobre hábitos.", "A"),
      q("recompensa", 1, "q", 6, "Meu prazer nas coisas que faço é proporcional e estável — não preciso de estímulos cada vez mais intensos.", "R"),
      q("recompensa", 1, "q", 7, "Já tentei parar um hábito que me prejudica e recaí repetidamente.", "A"),
      q("recompensa", 1, "q", 8, "Uso algo (trabalho, substância, distração, relação) sistematicamente para regular meu estado emocional.", "A"),
    ],
    layer2: {
      desempenho: [
        q("recompensa", 2, "desemp", 1, "Comportamentos de alívio rápido já consumiram tempo que deveria ter ido para trabalho ou projetos?", "A"),
        q("recompensa", 2, "desemp", 2, "Sua capacidade de manter metas de longo prazo é comprometida por loops de recompensa imediata?", "A"),
        q("recompensa", 2, "desemp", 3, "Já investiu energia, dinheiro ou tempo excessivo em algo que era alívio disfarçado de produtividade?", "A"),
      ],
      vinculo: [
        q("recompensa", 2, "vinc", 1, "Alguém próximo já expressou preocupação com um hábito seu — e você minimizou?", "A"),
        q("recompensa", 2, "vinc", 2, "Seus loops de recompensa te afastam de pessoas ou de presença relacional?", "A"),
        q("recompensa", 2, "vinc", 3, "Consegue ser transparente com pessoas próximas sobre seus hábitos de alívio?", "R"),
      ],
      fisiologico: [
        q("recompensa", 2, "fisio", 1, "Seus hábitos de alívio geram consequência física — sono ruim, peso, fadiga, ressaca, dor?", "A"),
        q("recompensa", 2, "fisio", 2, "Sente que precisa de estímulos cada vez mais intensos para obter o mesmo efeito de alívio ou prazer?", "A"),
      ],
      abertas: [
        oq("recompensa", 1, "Qual comportamento de alívio tem mais poder sobre você hoje? Descreva quando ele aparece, quanto tempo dura e o que acontece depois."),
        oq("recompensa", 2, "O que você já tentou fazer para mudar esse padrão — e por que não se sustentou?"),
      ],
    },
  },

  // ─── 7. MODELAGEM DE REALIDADE & SENTIDO ───
  {
    key: "realidade",
    label: "Modelagem de Realidade & Sentido",
    shortLabel: "Realidade",
    description: "Calibração inferencial e construção de sentido",
    questionsC1: [
      q("realidade", 1, "q", 1, "Quando recebo informação que contradiz o que eu acreditava, consigo atualizar minha visão sem grande resistência.", "R"),
      q("realidade", 1, "q", 2, "Sob estresse ou sono ruim, minha leitura das intenções das pessoas muda visivelmente — fico mais desconfiado ou vejo padrões que depois não se confirmam.", "A"),
      q("realidade", 1, "q", 3, "Consigo distinguir o que é fato observável do que é interpretação minha.", "R"),
      q("realidade", 1, "q", 4, "Tenho uma tendência a conectar eventos que provavelmente não têm relação — e acreditar nisso com convicção.", "A"),
      q("realidade", 1, "q", 5, "Pessoas próximas já me disseram que eu estava interpretando uma situação de forma distorcida — e quando pensei com calma, percebi que tinham razão.", "A"),
      q("realidade", 1, "q", 6, "Minha narrativa sobre quem eu sou e o que me aconteceu é razoavelmente consistente e flexível.", "R"),
      q("realidade", 1, "q", 7, "Quando estou privado de sono ou sob grande pressão, meu pensamento fica confuso ou \"acelerado demais\" de um jeito que percebo depois.", "A"),
      q("realidade", 1, "q", 8, "Quando algo dá errado, consigo considerar múltiplas explicações em vez de fixar numa única causa.", "R"),
    ],
    layer2: {
      desempenho: [
        q("realidade", 2, "desemp", 1, "Já tomou decisões importantes baseado em uma leitura da situação que depois percebeu estar distorcida?", "A"),
        q("realidade", 2, "desemp", 2, "Quando fixa uma interpretação, tem dificuldade de considerar alternativas mesmo com evidência contrária?", "A"),
        q("realidade", 2, "desemp", 3, "Sob pressão, sua capacidade de avaliar risco e prioridade se deteriora visivelmente?", "A"),
      ],
      vinculo: [
        q("realidade", 2, "vinc", 1, "Já atribuiu intenção negativa a alguém que não tinha — e isso gerou dano relacional?", "A"),
        q("realidade", 2, "vinc", 2, "Pessoas próximas já disseram que você \"viaja\" nas interpretações — e você discordou na hora mas depois reconheceu?", "A"),
        q("realidade", 2, "vinc", 3, "Consegue receber feedback sobre sua leitura das coisas sem se sentir atacado?", "R"),
      ],
      fisiologico: [
        q("realidade", 2, "fisio", 1, "Quando sua mente \"conecta padrões demais\", isso vem acompanhado de sono ruim, aceleração mental ou agitação?", "A"),
        q("realidade", 2, "fisio", 2, "Privação de sono muda visivelmente a qualidade do seu pensamento — mais rígido, mais desconfiado ou mais acelerado?", "A"),
      ],
      abertas: [
        oq("realidade", 1, "Descreva uma situação recente em que você estava convicto de algo e depois percebeu que sua leitura estava distorcida. O que te fez perceber?"),
        oq("realidade", 2, "Quais condições (sono, estresse, conflito, isolamento) mais alteram a qualidade do seu pensamento?"),
      ],
    },
  },
];

/* ═══════════════════════════════════════════
   SCORING
   ═══════════════════════════════════════════ */

export function scoreItem(value: number, type: ItemType): number {
  return type === "R" ? SCALE_MAX - value : value;
}

export type DimZone = "regulado" | "atencao" | "alostatico";

export function getZone(score: number): DimZone {
  if (score >= THRESHOLD_ALOSTASE) return "alostatico";
  if (score >= 12) return "atencao";
  return "regulado";
}

export function getZoneColor(zone: DimZone): string {
  switch (zone) {
    case "regulado": return "hsl(141, 58%, 54%)";
    case "atencao": return "hsl(40, 88%, 61%)";
    case "alostatico": return "hsl(0, 70%, 58%)";
  }
}

export function getZoneLabel(zone: DimZone): string {
  switch (zone) {
    case "regulado": return "REGULADO";
    case "atencao": return "ATENÇÃO";
    case "alostatico": return "ALOSTÁTICO";
  }
}

export interface C1Scores {
  dimensions: Record<string, { score: number; zone: DimZone }>;
  alostatic: string[]; // dimension keys with score >= threshold
}

export function calculateC1Scores(answers: Record<string, number>): C1Scores {
  const dimensions: Record<string, { score: number; zone: DimZone }> = {};
  const alostatic: string[] = [];

  for (const dim of DIMENSIONS) {
    let score = 0;
    for (const q of dim.questionsC1) {
      const val = answers[q.id] ?? 0;
      score += scoreItem(val, q.type);
    }
    const zone = getZone(score);
    dimensions[dim.key] = { score, zone };
    if (zone === "alostatico") alostatic.push(dim.key);
  }

  return { dimensions, alostatic };
}

export interface C2DomainScores {
  desempenho: { score: number; max: number };
  vinculo: { score: number; max: number };
  fisiologico: { score: number; max: number };
}

export function calculateC2Scores(
  dimKey: string,
  answers: Record<string, number>
): C2DomainScores {
  const dim = DIMENSIONS.find((d) => d.key === dimKey);
  if (!dim) return { desempenho: { score: 0, max: 12 }, vinculo: { score: 0, max: 12 }, fisiologico: { score: 0, max: 8 } };

  const calc = (items: DimensionalQuestion[]) => {
    let score = 0;
    for (const q of items) {
      const val = answers[q.id] ?? 0;
      score += scoreItem(val, q.type);
    }
    return score;
  };

  return {
    desempenho: { score: calc(dim.layer2.desempenho), max: dim.layer2.desempenho.length * SCALE_MAX },
    vinculo: { score: calc(dim.layer2.vinculo), max: dim.layer2.vinculo.length * SCALE_MAX },
    fisiologico: { score: calc(dim.layer2.fisiologico), max: dim.layer2.fisiologico.length * SCALE_MAX },
  };
}

export const TOTAL_C1_QUESTIONS = DIMENSIONS.reduce((s, d) => s + d.questionsC1.length, 0); // 56
export const ESTIMATED_MINUTES_C1 = 12;
