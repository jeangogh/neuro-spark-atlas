export interface Question {
  id: string;
  text: string;
}

export interface QuestionBlock {
  id: string;
  questions: Question[];
  /** Which mechanism blocks this contextual block relates to (for trait/temporality) */
  relatesTo?: string[];
}

export const likertOptions = [
  { value: 0, label: "Nunca" },
  { value: 1, label: "Raramente" },
  { value: 2, label: "Às vezes" },
  { value: 3, label: "Frequentemente" },
  { value: 4, label: "Quase sempre" },
];

/**
 * Blocks reordered for engagement:
 * 1. AH/SD first (94%+ concordance — user sees themselves immediately)
 * 2. TDAH (93% concordance — high resonance)
 * 3. TEA
 * 4. 2e
 * 5. Trait + Temporality (neurodev context — kept together)
 * 6. Emotional block unbroken: Trauma → Ansiedade → Depressão → Traço adquirido
 * 7. Impacto (bureaucratic, last)
 */
export const questionBlocks: QuestionBlock[] = [
  // ── High-concordance openers ──
  {
    id: "ahsd",
    questions: [
      { id: "ahsd_1", text: "Quando me interesso por algo, aprendo sozinho em profundidade sem precisar de orientação." },
      { id: "ahsd_2", text: "Minha mente conecta ideias de áreas diferentes com facilidade." },
      { id: "ahsd_3", text: "Perguntas complexas me estimulam mais do que respostas prontas." },
      { id: "ahsd_4", text: "Tenho necessidade de entender o 'porquê' das coisas, não apenas o 'como'." },
    ],
  },
  {
    id: "tdah",
    questions: [
      { id: "tdah_1", text: "Mesmo quando algo é importante para mim, meu foco oscila sem que eu queira." },
      { id: "tdah_2", text: "Meu rendimento depende mais do nível de estímulo da tarefa do que da importância dela." },
      { id: "tdah_3", text: "Posso entender algo perfeitamente e ainda assim não conseguir iniciar a tarefa." },
      { id: "tdah_4", text: "Quando a tarefa é longa e pouco estimulante, minha mente busca outras coisas automaticamente." },
      { id: "tdah_5", text: "Abro várias abas de tarefas e quase sempre acabo poucas." },
      { id: "tdah_6", text: "Minha mente sempre tem um 'barulho' mental grande." },
      { id: "tdah_7", text: "Acho difícil me organizar e planejar." },
      { id: "tdah_8", text: "Me distraio com facilidade do que estava fazendo." },
      { id: "tdah_9", text: "Acho difícil relaxar a mente e descansar, mesmo quando é tarde." },
    ],
  },
  {
    id: "tea",
    questions: [
      { id: "tea_1", text: "Frequentemente só percebo que alguém ficou chateado comigo quando a pessoa fala claramente." },
      { id: "tea_2", text: "Costumo entender conversas de forma literal quando há duplo sentido." },
      { id: "tea_3", text: "Preciso observar padrões para entender como agir socialmente." },
      { id: "tea_4", text: "Interações sociais me exigem esforço consciente de interpretação." },
      { id: "tea_5", text: "Tenho sobrecarga após encontros sociais com muitas pessoas." },
      { id: "tea_6", text: "Texturas, cheiros ou sons podem me acalmar ou me irritar profundamente." },
      { id: "tea_7", text: "Rotinas me acalmam bastante." },
      { id: "tea_8", text: "Tenho baixa motivação social em geral." },
    ],
  },
  {
    id: "dupla_exc",
    questions: [
      { id: "2e_1", text: "Tenho desempenho muito alto em algumas áreas e grande dificuldade em outras." },
      { id: "2e_2", text: "Meu potencial parece maior que minha execução." },
      { id: "2e_3", text: "Posso ter alta capacidade e baixa constância." },
      { id: "2e_4", text: "Meu desempenho é inconsistente." },
    ],
  },
  // ── Neurodev context (trait + temporality together) ──
  {
    id: "traco_neuro",
    relatesTo: ["ahsd", "tdah", "tea", "dupla_exc"],
    questions: [
      { id: "traco_1", text: "Esses padrões continuam mesmo quando estou bem emocionalmente." },
      { id: "traco_2", text: "Eles aparecem em diferentes fases da minha vida." },
      { id: "traco_3", text: "Eles não dependem apenas de estresse ou momento difícil." },
      { id: "traco_4", text: "Fazem parte do meu modo de funcionar." },
    ],
  },
  {
    id: "temporalidade",
    relatesTo: ["ahsd", "tdah", "tea", "dupla_exc"],
    questions: [
      { id: "temp_1", text: "Lembro de apresentar esses padrões desde a infância." },
      { id: "temp_2", text: "Pessoas já me percebiam diferente quando eu era criança." },
      { id: "temp_3", text: "Esses traços me acompanham há muitos anos." },
      { id: "temp_4", text: "Não surgiram apenas na vida adulta." },
    ],
  },
  // ── Emotional block — NEVER interrupted ──
  {
    id: "trauma",
    questions: [
      { id: "trauma_1", text: "Meu corpo reage a certas situações antes de eu entender o motivo." },
      { id: "trauma_2", text: "Algumas reações minhas parecem ligadas a experiências passadas." },
      { id: "trauma_3", text: "Situações específicas despertam respostas intensas desproporcionais ao presente." },
      { id: "trauma_4", text: "Parte do meu comportamento atual parece moldado por experiências difíceis." },
    ],
  },
  {
    id: "ansiedade",
    questions: [
      { id: "ans_1", text: "Minha mente tenta prever problemas antes que aconteçam." },
      { id: "ans_2", text: "Sinto necessidade de ter controle para me sentir seguro." },
      { id: "ans_3", text: "Fico mentalmente preso em possibilidades negativas." },
      { id: "ans_4", text: "Minha atenção é puxada para sinais de risco ou erro." },
    ],
  },
  {
    id: "depressao",
    questions: [
      { id: "dep_1", text: "Atividades que antes eram significativas hoje parecem neutras." },
      { id: "dep_2", text: "Minha energia mental parece menor que no passado." },
      { id: "dep_3", text: "Tenho dificuldade de iniciar ações mesmo quando sei que são importantes." },
      { id: "dep_4", text: "Minha percepção de futuro tende a ser pouco animadora." },
    ],
  },
  {
    id: "traco_adq",
    relatesTo: ["trauma", "ansiedade", "depressao"],
    questions: [
      { id: "traco_adq_1", text: "Essas reações emocionais continuam mesmo em períodos de estabilidade." },
      { id: "traco_adq_2", text: "Elas aparecem em diferentes contextos da minha vida." },
      { id: "traco_adq_3", text: "Não dependem apenas de um momento difícil específico." },
      { id: "traco_adq_4", text: "São reações recorrentes, não pontuais." },
    ],
  },
  // ── Bureaucratic — always last ──
  {
    id: "impacto",
    questions: [
      { id: "imp_1", text: "Esses padrões impactam minha vida prática." },
      { id: "imp_2", text: "Já geraram prejuízos acadêmicos ou profissionais." },
      { id: "imp_3", text: "Afetam meus relacionamentos." },
      { id: "imp_4", text: "Exigem esforço extra para lidar." },
    ],
  },
];

export type Answers = Record<string, number>;

export interface ScoreResult {
  tdah: number;
  tea: number;
  ahsd: number;
  trauma: number;
  ansiedade: number;
  depressao: number;
  traco: number;
  traco_adq: number;
  temporalidade: number;
  impacto: number;
  dupla_exc: number;
}

/** IDs that are actual mechanism scores (shown in results) */
export const mechanismIds = ["ahsd", "tdah", "tea", "trauma", "ansiedade", "depressao", "dupla_exc"] as const;

export function calculateScores(answers: Answers): ScoreResult {
  const scores: Record<string, number> = {};
  for (const block of questionBlocks) {
    const id = block.id === "traco_neuro" ? "traco" : block.id;
    const blockAnswers = block.questions.map((q) => answers[q.id] ?? 0);
    const sum = blockAnswers.reduce((a, b) => a + b, 0);
    const max = block.questions.length * 4;
    scores[id] = Math.round((sum / max) * 100);
  }
  return scores as unknown as ScoreResult;
}

export interface HypothesisResult {
  id: string;
  label: string;
  level: "alto" | "moderado" | "baixo";
  score: number;
  shortDescription: string;
  fullDescription: string;
  isNeurodev: boolean;
  isAcquired: boolean;
  is2e: boolean;
}

const conditionExplanations: Record<string, { name: string; full: string }> = {
  tdah: {
    name: "TDAH — Déficit de Atenção/Hiperatividade",
    full: `O Transtorno de Déficit de Atenção e Hiperatividade (TDAH) é uma condição neurodesenvolvimentar que afeta a regulação executiva — a capacidade do cérebro de gerenciar atenção, iniciar tarefas, manter foco e controlar impulsos.

Não se trata de falta de inteligência ou preguiça. No TDAH, o cérebro funciona com um sistema de priorização baseado em **estímulo e interesse**, não em importância racional. Isso significa que tarefas consideradas importantes podem ser negligenciadas se não forem suficientemente estimulantes, enquanto atividades interessantes podem gerar hiperfoco intenso.

Pessoas com TDAH frequentemente:
• Têm dificuldade em iniciar tarefas (mesmo sabendo exatamente o que fazer)
• Oscilam entre hiperfoco e distração
• Apresentam rendimento inconsistente
• Desenvolvem estratégias compensatórias ao longo da vida

Quando associado a altas habilidades, o TDAH pode ser mascarado — a pessoa compensa as dificuldades executivas com sua capacidade intelectual, tornando o diagnóstico mais difícil.`,
  },
  tea: {
    name: "TEA Nível 1 — Autismo",
    full: `O Transtorno do Espectro Autista (TEA) Nível 1 é uma condição neurodesenvolvimentar que afeta principalmente a cognição social — a maneira como o cérebro processa interações, emoções alheias e regras sociais implícitas.

Não significa falta de empatia ou desinteresse por pessoas. No TEA nível 1, a pessoa pode ter grande sensibilidade emocional, mas precisa de **processamento consciente** para interpretar o que a maioria das pessoas processa automaticamente: tom de voz, expressões faciais, intenções implícitas e duplo sentido.

Características comuns:
• Necessidade de observar padrões para entender dinâmicas sociais
• Interpretação literal de comunicação ambígua
• Fadiga social intensa, mesmo desejando conexão
• Interesses profundos e especializados
• Sensibilidade sensorial

Quando combinado com altas habilidades, o TEA pode se manifestar como um pensamento altamente sistemático e original, mas com desafios de adaptação social.`,
  },
  ahsd: {
    name: "Altas Habilidades / Superdotação",
    full: `Altas Habilidades/Superdotação (AH/SD) não se resumem a "ser muito inteligente" ou tirar notas altas. Trata-se de um padrão de funcionamento cognitivo caracterizado por alta complexidade de pensamento, aprendizado autodirigido e necessidade de profundidade.

Pessoas com AH/SD geralmente:
• Aprendem com rapidez e de forma autônoma
• Fazem conexões entre áreas aparentemente não relacionadas
• Sentem necessidade de entender o "porquê" profundo das coisas
• São estimuladas por complexidade e desafiadas pela superficialidade
• Podem sentir-se deslocadas em ambientes que não correspondem ao seu nível de pensamento

É importante entender que AH/SD é um **modo de funcionar**, não uma garantia de sucesso. Quando combinada com outros padrões neurodivergentes (TDAH, TEA, trauma), pode gerar a chamada Dupla Excepcionalidade — onde o alto potencial coexiste com dificuldades que mascaram ou limitam a expressão desse potencial.

Muitas pessoas com AH/SD não se reconhecem como superdotadas porque seus desafios (procrastinação, inconsistência, dificuldades sociais) dominam sua autoimagem.`,
  },
  trauma: {
    name: "Trauma — Estresse Pós-Traumático",
    full: `O trauma psicológico não se refere apenas a eventos extremos. Ele pode resultar de experiências prolongadas de invalidação, negligência emocional, ambientes instáveis ou situações que ultrapassaram a capacidade de processamento do sistema nervoso.

Quando o cérebro registra uma experiência como ameaçadora, ele cria padrões automáticos de proteção que podem persistir muito além da situação original. O corpo e a mente continuam reagindo como se o perigo estivesse presente.

Manifestações comuns:
• Reações físicas e emocionais desproporcionais a situações atuais
• Hipervigilância e dificuldade de relaxar
• Evitação de situações que lembram experiências passadas
• Dificuldade em confiar e se conectar
• Sensação de estar sempre "em alerta"

Em pessoas com altas habilidades, o trauma pode ser especialmente complexo: a intensidade emocional e a profundidade de processamento típicas da AH/SD amplificam tanto a experiência traumática quanto suas consequências. Ao mesmo tempo, a capacidade intelectual pode criar mecanismos sofisticados de racionalização que mascaram o impacto emocional.`,
  },
  ansiedade: {
    name: "Ansiedade — Hipervigilância Cognitiva",
    full: `A ansiedade, como condição, vai além de "ficar nervoso". É um estado de hipervigilância cognitiva em que o cérebro opera constantemente em modo de antecipação de ameaças — mesmo quando não há perigo real.

A mente ansiosa funciona como um sistema de radar supersensível que detecta riscos em praticamente tudo: conversas, decisões, futuro, relações. Isso consome enorme energia mental e limita a capacidade de estar presente.

Características:
• Antecipação constante de problemas futuros
• Necessidade de controle para se sentir seguro
• Dificuldade em "desligar" a mente
• Ruminação sobre possibilidades negativas
• Sensação de tensão crônica

Em pessoas com altas habilidades, a ansiedade pode se manifestar de forma sofisticada: o pensamento complexo e a capacidade de projetar cenários transformam a antecipação em uma habilidade intelectualizada, difícil de identificar como sintoma porque "faz sentido". Mas o custo energético é enorme.`,
  },
  depressao: {
    name: "Depressão — Redução Motivacional",
    full: `A depressão não é simplesmente "tristeza" — é uma redução do sistema motivacional que afeta a energia, o interesse, a percepção de futuro e a capacidade de iniciar ações.

Quando o sistema motivacional está comprometido, atividades que antes geravam satisfação passam a parecer neutras ou sem sentido. A energia mental diminui, a perspectiva de futuro se torna opaca, e mesmo ações simples podem exigir um esforço desproporcional.

Sinais comuns:
• Perda gradual de interesse em atividades significativas
• Redução de energia que não se explica apenas por cansaço físico
• Dificuldade de iniciar ações, mesmo sabendo que são importantes
• Percepção de futuro sem entusiasmo
• Autocrítica intensa

Em pessoas com altas habilidades, a depressão pode assumir formas atípicas: a pessoa mantém funcionamento intelectual elevado enquanto o sistema emocional opera com baixa energia. Isso pode ser confundido com "fase ruim" ou "desmotivação passageira", atrasando o reconhecimento do problema.

A depressão pode ser tanto uma condição primária quanto uma consequência de viver com neurodivergências não reconhecidas — a frustração crônica de não atingir o próprio potencial.`,
  },
  dupla_exc: {
    name: "Dupla Excepcionalidade (2e)",
    full: `A Dupla Excepcionalidade (2e) é a coexistência de alta capacidade cognitiva (Altas Habilidades/Superdotação) com um ou mais desafios neurofuncionais — como TDAH, TEA, trauma, ansiedade ou depressão.

Este conceito é fundamental porque explica uma contradição que muitas pessoas sentem profundamente: **"Eu sei que sou capaz, mas não consigo render como deveria."**

Na Dupla Excepcionalidade:
• O potencial intelectual é genuinamente alto
• Mas a execução é prejudicada por fatores neurofuncionais
• O resultado é uma inconsistência frustrante entre o que a pessoa sabe que pode fazer e o que consegue fazer de fato

**Por que isso importa:**

1. **Mascaramento mútuo**: A alta inteligência compensa os déficits, então a pessoa "funciona" — mas com esforço muito maior que o necessário. Ao mesmo tempo, os déficits impedem que a inteligência se expresse plenamente. O resultado: ninguém percebe nem a capacidade excepcional, nem a dificuldade real.

2. **Impacto na autoestima**: A pessoa sente que "poderia mais", se compara com seu próprio potencial e se frustra. Isso pode gerar autocrítica intensa, perfeccionismo e sensação de fraude (síndrome do impostor).

3. **Diagnóstico tardio ou ausente**: Profissionais frequentemente não reconhecem a 2e — focam nos déficits OU nas habilidades, raramente nos dois simultaneamente.

**A relação entre potencial e performance:**
Imagine que seu potencial intelectual é um motor de alta potência, mas o sistema de transmissão (regulação executiva, processamento social, estado emocional) tem falhas. O motor é poderoso, mas a energia se perde no caminho. O carro anda — mas nunca na velocidade que o motor permitiria.

Reconhecer a Dupla Excepcionalidade é o primeiro passo para alinhar o potencial com a expressão — não baixando expectativas, mas entendendo e trabalhando as barreiras reais.`,
  },
};

export function interpretResults(scores: ScoreResult): {
  hypotheses: HypothesisResult[];
  traitVsState: "traco" | "estado" | "misto";
  traitAcquired: "traco" | "estado" | "misto";
  temporality: "persistente" | "recente" | "incerto";
  impact: "alto" | "moderado" | "baixo";
  is2e: boolean;
  summary: string;
  potentialVsExpression: string;
} {
  const level = (s: number): "alto" | "moderado" | "baixo" =>
    s >= 65 ? "alto" : s >= 40 ? "moderado" : "baixo";

  const neurodevMechanisms = ["ahsd", "tdah", "tea"] as const;
  const acquiredMechanisms = ["trauma", "ansiedade", "depressao"] as const;

  const highTraco = scores.traco >= 65;
  const highTracoAdq = scores.traco_adq >= 65;
  const highTemp = scores.temporalidade >= 65;

  const hypotheses: HypothesisResult[] = [];

  for (const key of neurodevMechanisms) {
    const l = level(scores[key]);
    const info = conditionExplanations[key];
    hypotheses.push({
      id: key,
      label: info.name,
      level: l,
      score: scores[key],
      shortDescription: getShortDescription(key, l),
      fullDescription: info.full,
      isNeurodev: true,
      isAcquired: false,
      is2e: false,
    });
  }

  for (const key of acquiredMechanisms) {
    const l = level(scores[key]);
    const info = conditionExplanations[key];
    hypotheses.push({
      id: key,
      label: info.name,
      level: l,
      score: scores[key],
      shortDescription: getShortDescription(key, l),
      fullDescription: info.full,
      isNeurodev: false,
      isAcquired: true,
      is2e: false,
    });
  }

  const traitVsState: "traco" | "estado" | "misto" =
    highTraco ? "traco" : scores.traco < 40 ? "estado" : "misto";

  const traitAcquired: "traco" | "estado" | "misto" =
    highTracoAdq ? "traco" : scores.traco_adq < 40 ? "estado" : "misto";

  const temporality: "persistente" | "recente" | "incerto" =
    highTemp ? "persistente" : scores.temporalidade < 40 ? "recente" : "incerto";

  const impact: "alto" | "moderado" | "baixo" = level(scores.impacto);

  const highAHSD = scores.ahsd >= 65;
  const highTDAH = scores.tdah >= 65;
  const highTEA = scores.tea >= 65;
  const high2e = scores.dupla_exc >= 65;
  const is2e = highAHSD && (highTDAH || highTEA) && high2e;

  // Add 2e hypothesis
  const deLvl = is2e ? "alto" : high2e ? "moderado" : "baixo";
  hypotheses.push({
    id: "dupla_exc",
    label: conditionExplanations.dupla_exc.name,
    level: deLvl,
    score: scores.dupla_exc,
    shortDescription: is2e
      ? "Seu perfil indica coexistência de alta capacidade com desafios neurofuncionais, gerando inconsistência entre potencial e execução."
      : high2e
      ? "Há sinais de inconsistência entre potencial e execução que podem indicar dupla excepcionalidade."
      : "Não foram identificados padrões marcantes de inconsistência entre potencial e execução.",
    fullDescription: conditionExplanations.dupla_exc.full,
    isNeurodev: false,
    isAcquired: false,
    is2e: true,
  });

  // Summary
  const highHypotheses = hypotheses.filter((h) => h.level === "alto");
  const neurodevHigh = highHypotheses.filter((h) => h.isNeurodev);
  const acquiredHigh = highHypotheses.filter((h) => h.isAcquired);

  let summary = "";
  if (neurodevHigh.length > 0 && highTraco && highTemp) {
    summary += `Seus resultados apontam padrões compatíveis com funcionamento neurodesenvolvimentar (${neurodevHigh.map((h) => h.id.toUpperCase()).join(", ")}), com persistência ao longo da vida e independência de contexto emocional. `;
  }
  if (acquiredHigh.length > 0 && !highTemp) {
    summary += `Também foram identificados padrões emocionais adquiridos (${acquiredHigh.map((h) => h.label.split(" — ")[0]).join(", ")}), possivelmente ligados a experiências e contextos específicos. `;
  } else if (acquiredHigh.length > 0) {
    summary += `Os padrões emocionais identificados (${acquiredHigh.map((h) => h.label.split(" — ")[0]).join(", ")}) apresentam persistência temporal, podendo coexistir com fatores neurodesenvolvimentais. `;
  }
  if (is2e) {
    summary += "O perfil sugere possível Dupla Excepcionalidade (2e): coexistência de alta capacidade cognitiva com desafios neurofuncionais, gerando inconsistência entre potencial e execução. ";
  }
  if (!summary) {
    summary = "Seus resultados não indicaram padrões marcantes em nenhuma área específica. Isso pode significar funcionamento típico ou respostas conservadoras ao questionário.";
  }
  summary += "\n\nEste instrumento NÃO fornece diagnóstico. Ele levanta hipóteses de funcionamento que devem ser validadas por profissional qualificado.";

  // Potential vs expression
  let potentialVsExpression = "";
  if (highAHSD) {
    const barriers: string[] = [];
    if (highTDAH) barriers.push("dificuldades de regulação executiva (TDAH)");
    if (highTEA) barriers.push("esforço extra no processamento social (TEA)");
    if (scores.trauma >= 65) barriers.push("respostas de proteção moldadas por experiências passadas (Trauma)");
    if (scores.ansiedade >= 65) barriers.push("hipervigilância cognitiva (Ansiedade)");
    if (scores.depressao >= 65) barriers.push("redução do sistema motivacional (Depressão)");

    if (barriers.length > 0) {
      potentialVsExpression = `Seus resultados indicam um potencial cognitivo elevado (AH/SD com pontuação de ${scores.ahsd}%), mas a expressão plena desse potencial pode estar sendo limitada por: ${barriers.join("; ")}.\n\nIsso significa que você pode ter uma capacidade intelectual significativamente maior do que aquela que consegue demonstrar no dia a dia. Essa diferença entre potencial e performance não é "falta de esforço" — é resultado da interação entre diferentes sistemas neurológicos que competem por recursos no seu cérebro.\n\nCompreender essa dinâmica é o primeiro passo para criar estratégias que permitam a expressão mais completa do seu potencial real.`;
    } else {
      potentialVsExpression = `Seus resultados indicam alta complexidade cognitiva (${scores.ahsd}%), sem barreiras neurofuncionais significativas identificadas neste rastreio. Isso sugere que seu potencial pode estar se expressando de forma relativamente livre — embora fatores ambientais e contextuais também influenciem essa expressão.`;
    }
  } else {
    potentialVsExpression = `O rastreio não identificou padrões marcantes de alta complexidade cognitiva. Isso não significa ausência de potencial — outros instrumentos e avaliações profissionais podem captar dimensões não abordadas aqui.`;
  }

  return { hypotheses, traitVsState, traitAcquired, temporality, impact, is2e, summary, potentialVsExpression };
}

function getShortDescription(key: string, level: string): string {
  const descriptions: Record<string, Record<string, string>> = {
    tdah: {
      alto: "Dificuldades significativas de regulação executiva involuntária. Seu cérebro funciona com base em estímulo, não em importância.",
      moderado: "Indícios de variação na regulação executiva. Foco e iniciativa podem depender de fatores involuntários.",
      baixo: "Padrões de regulação executiva sem dificuldades significativas nessa área.",
    },
    tea: {
      alto: "A cognição social exige esforço consciente significativo. Interpretar nuances e estados emocionais requer processamento ativo.",
      moderado: "Sinais moderados de processamento social consciente em algumas situações.",
      baixo: "Cognição social sem padrões marcantes nessa direção.",
    },
    ahsd: {
      alto: "Alta complexidade cognitiva: aprendizado autodirigido, pensamento conectivo e necessidade de profundidade são traços marcantes.",
      moderado: "Sinais de complexidade cognitiva acima da média em algumas áreas.",
      baixo: "Sem padrões marcantes de alta complexidade cognitiva identificados.",
    },
    trauma: {
      alto: "Sistema de alerta emocional moldado por experiências passadas. Reações intensas e automáticas conectadas a vivências difíceis.",
      moderado: "Indícios de que algumas reações emocionais podem ter raízes em experiências anteriores.",
      baixo: "Sem padrões significativos de respostas de ameaça aprendidas.",
    },
    ansiedade: {
      alto: "Mente opera com alto nível de vigilância. Necessidade de controle e antecipação de riscos são frequentes.",
      moderado: "Sinais de vigilância cognitiva moderada em alguns contextos.",
      baixo: "Padrões de hipervigilância não se destacam no funcionamento.",
    },
    depressao: {
      alto: "Redução significativa no sistema motivacional. Energia, interesse e perspectiva de futuro comprometidos.",
      moderado: "Sinais moderados de redução motivacional em algumas atividades.",
      baixo: "Sistema motivacional sem sinais significativos de redução.",
    },
  };
  return descriptions[key]?.[level] ?? "";
}

/** Estimated time per question in seconds (reading + deciding) */
export const SECONDS_PER_QUESTION = 8;
export const TOTAL_QUESTIONS = questionBlocks.reduce((a, b) => a + b.questions.length, 0);
export const ESTIMATED_MINUTES = Math.ceil((TOTAL_QUESTIONS * SECONDS_PER_QUESTION) / 60);
