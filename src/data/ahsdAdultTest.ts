import type { TestDefinition } from "./testDefinitions";

const questionsMap: Record<number, string> = {
  1: "Aprendo conceitos complexos com pouca repetição.",
  2: "Conecto ideias distantes com facilidade.",
  3: "Percebo padrões que outros não notam.",
  4: "Questiono explicações superficiais.",
  5: "Tenho raciocínio rápido sob pressão.",
  6: "Tenho curiosidade intensa e constante.",
  7: "Busco compreender sistemas em profundidade.",
  8: "Prefiro complexidade a simplicidade excessiva.",
  9: "Aprendo sozinho com facilidade.",
  10: "Tenho facilidade para abstração.",
  11: "Fico entediado com tarefas simples.",
  12: "Preciso de desafio para manter engajamento.",
  13: "Minha produtividade depende de sentido.",
  14: "Alterno entre hiperfoco e dispersão.",
  15: "Mergulho intensamente quando algo me interessa.",
  16: "Tenho dificuldade com repetição mecânica.",
  17: "Inicio vários projetos ao mesmo tempo.",
  18: "Frustro-me com ambientes lentos.",
  19: "Procrastino tarefas sem significado.",
  20: "Tenho dificuldade em finalizar tarefas pouco estimulantes.",
  21: "Tenho sensibilidade emocional intensa.",
  22: "Reajo fortemente a injustiças.",
  23: "Tenho empatia profunda.",
  24: "Sou altamente autocrítico.",
  25: "Tenho padrões elevados comigo mesmo.",
  26: "Oscilo entre confiança e dúvida intensa.",
  27: "Tenho dificuldade de desligar a mente.",
  28: "Sinto frustração por não usar meu potencial.",
  29: "Penso demais antes de agir.",
  30: "Tenho tendência a overthinking.",
  31: "Senti-me diferente desde a infância.",
  32: "Tive interesses incomuns para minha idade.",
  33: "Preferia conversar com adultos.",
  34: "Questionava regras sem sentido.",
  35: "Sentia tédio frequente na escola.",
  36: "Aprendia mais rápido que colegas.",
  37: "Era visto como intenso ou exagerado.",
  38: "Tinha imaginação muito ativa.",
  39: "Era perfeccionista desde cedo.",
  40: "Tinha dificuldade de pertencimento.",
  41: "Tenho múltiplos interesses profundos.",
  42: "Mudo de área com facilidade.",
  43: "Vejo conexões entre áreas distintas.",
  44: "Gosto de debates intelectuais profundos.",
  45: "Prefiro conversas profundas a superficiais.",
  46: "Busco excelência constantemente.",
  47: "Fico frustrado com mediocridade.",
  48: "Tenho necessidade forte de autonomia.",
  49: "Sinto desconforto com hierarquias rígidas.",
  50: "Preciso de liberdade para produzir bem.",
  51: "Já me sabotei por medo de falhar.",
  52: "Tenho dificuldade em ambientes muito controladores.",
  53: "Minha energia criativa é intensa.",
  54: "Meu humor varia conforme estímulo intelectual.",
  55: "Tenho dificuldade com tarefas burocráticas.",
  56: "Sinto que penso mais rápido que o ambiente.",
  57: "Tenho facilidade para formular estratégias.",
  58: "Analiso cenários complexos mentalmente.",
  59: "Tenho sensação de potencial não utilizado.",
  60: "Sinto que poderia produzir muito mais do que produzo.",
};

// Presentation order: highest concordance first
const DISPLAY_ORDER = [15,60,24,25,27,45,48,28,59,13,47,6,30,19,22,4,50,23,20,14,7,9,44,56,53,26,57,11,29,1,21,8,2,10,3,58,54,12,31,46,51,41,17,38,34,33,49,52,43,18,42,36,32,39,40,5,35,55,37,16];

// Category assignment by original question number (stable IDs)
const cognicaoIds = [1,2,3,4,5,6,7,8,9,10,41,42,43,44,57,58].map(n => `ahsd_adult_${n}`);
const motivacaoIds = [11,12,13,14,15,16,17,18,19,20,53,54,55,56].map(n => `ahsd_adult_${n}`);
const intensidadeIds = [21,22,23,24,25,26,27,28,29,30].map(n => `ahsd_adult_${n}`);
const historicoIds = [31,32,33,34,35,36,37,38,39,40].map(n => `ahsd_adult_${n}`);
const autonomiaIds = [45,46,47,48,49,50,51,52,59,60].map(n => `ahsd_adult_${n}`);

// Split into blocks of 10 using display order
function makeBlocks() {
  const blocks = [];
  for (let i = 0; i < DISPLAY_ORDER.length; i += 10) {
    const slice = DISPLAY_ORDER.slice(i, i + 10);
    blocks.push({
      id: `ahsd_adult_block_${Math.floor(i / 10) + 1}`,
      questions: slice.map((num) => ({
        id: `ahsd_adult_${num}`,
        text: questionsMap[num],
      })),
    });
  }
  return blocks;
}

export const ahsdAdultTest: TestDefinition = {
  key: "ahsd_adulto",
  title: "Protocolo AH/SD-A (Adulto)",
  shortTitle: "AH/SD Adulto",
  subtitle: "60 perguntas · Autoavaliação",
  description: "Rastreio de altas habilidades e superdotação para adultos. Avalia cognição, motivação, intensidade emocional, histórico desenvolvimental e autonomia.",
  icon: "🧠",
  scaleMin: 0,
  scaleMax: 4,
  scaleLabels: [
    { value: 0, label: "Discordo totalmente" },
    { value: 1, label: "Discordo" },
    { value: 2, label: "Neutro" },
    { value: 3, label: "Concordo" },
    { value: 4, label: "Concordo totalmente" },
  ],
  questionBlocks: makeBlocks(),
  categories: [
    { key: "cognicao", label: "Cognição", questionIds: cognicaoIds },
    { key: "motivacao", label: "Motivação/Estímulo", questionIds: motivacaoIds },
    { key: "intensidade", label: "Intensidade/Emocional", questionIds: intensidadeIds },
    { key: "historico", label: "Histórico Desenvolvimental", questionIds: historicoIds },
    { key: "autonomia", label: "Autonomia/Expressão", questionIds: autonomiaIds },
  ],
  classifications: [
    {
      minPct: 80,
      label: "Indicadores muito elevados de AH/SD",
      description: `O padrão obtido sugere configuração altamente consistente com altas habilidades estruturais.

Características típicas nesse nível incluem:
• Alta velocidade de processamento mental
• Pensamento sistêmico e multidimensional
• Criatividade espontânea e integrativa
• Intensidade emocional acentuada
• Alta capacidade de funcionamento sob pressão
• Forte necessidade de complexidade e autonomia

Perfis nesse nível frequentemente relatam:
• Sensação crônica de potencial não utilizado
• Dificuldade com hierarquias rígidas
• Tédio persistente em ambientes medianos
• Sobrecarga sensorial ou emocional
• Busca constante por profundidade

Quando o ambiente não acompanha o nível estrutural, podem surgir: autossabotagem, ansiedade existencial, burnout intelectual e desmotivação episódica.

Esse resultado indica alta probabilidade de AHSD estrutural, especialmente quando há consistência histórica desde infância.`,
    },
    {
      minPct: 65,
      label: "Indicadores elevados de AH/SD",
      description: `O padrão de respostas é consistente com perfil de altas habilidades em adultos.

Observa-se:
• Processamento cognitivo acima da média
• Capacidade de integrar sistemas complexos
• Criatividade funcional
• Intensidade emocional significativa
• Capacidade de desempenho elevado sob estímulo adequado

Nesse nível é comum:
• Sensação de não pertencimento
• Frustração com ambientes lentos
• Oscilação entre hiperprodução e desmotivação
• Autocrítica elevada

A probabilidade de configuração estrutural de AHSD é significativa.`,
    },
    {
      minPct: 45,
      label: "Indicadores moderados (perfil misto)",
      description: `O resultado aponta presença parcial de características associadas a altas habilidades.

Há traços compatíveis com aceleração cognitiva ou criatividade diferenciada, porém sem padrão homogêneo e consistente nas cinco dimensões.

Esse perfil pode indicar:
• Desenvolvimento assimétrico
• Potencial acima da média com expressão irregular
• Influência ambiental limitando desempenho
• Presença de bloqueios emocionais ou motivacionais

Recomenda-se análise dimensional detalhada.`,
    },
    {
      minPct: 0,
      label: "Baixos indicadores de AH/SD",
      description: `O padrão geral de respostas não sugere presença estrutural consistente de altas habilidades segundo os critérios do protocolo AH/SD-A.

Isso não implica ausência de capacidade intelectual, mas indica que não há evidência forte de aceleração cognitiva, intensidade emocional ou funcionamento diferenciado nas dimensões avaliadas.

Eventuais dificuldades relatadas podem estar mais relacionadas a fatores contextuais, emocionais ou ambientais do que a subexpressão de superdotação estrutural.`,
    },
  ],
  dimensionRules: [
    {
      condition: "cognicao >= 70 && (motivacao >= 60 || intensidade >= 60 || autonomia >= 60) && ((motivacao >= 60 ? 1 : 0) + (intensidade >= 60 ? 1 : 0) + (historico >= 60 ? 1 : 0) + (autonomia >= 60 ? 1 : 0)) >= 2",
      message: "Forte consistência estrutural de AHSD — cognição alta com suporte em pelo menos duas outras dimensões.",
    },
    {
      condition: "cognicao > 70 && motivacao < 50",
      message: "Possível bloqueio de expressão de potencial — cognição alta mas motivação baixa. O ambiente pode não estar oferecendo desafio suficiente.",
    },
    {
      condition: "intensidade > 75",
      message: "Perfil com sobre-excitabilidades marcadas — intensidade emocional acima de 75%. Isso é comum em superdotados e pode ser confundido com transtornos de humor.",
    },
  ],
  estimatedMinutes: 10,
  inflatePercentile: true,
};
