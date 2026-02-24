import type { TestDefinition } from "./testDefinitions";

const questions = [
  "Aprendo conceitos complexos com pouca repetição.",
  "Conecto ideias distantes com facilidade.",
  "Percebo padrões que outros não notam.",
  "Questiono explicações superficiais.",
  "Tenho raciocínio rápido sob pressão.",
  "Tenho curiosidade intensa e constante.",
  "Busco compreender sistemas em profundidade.",
  "Prefiro complexidade a simplicidade excessiva.",
  "Aprendo sozinho com facilidade.",
  "Tenho facilidade para abstração.",
  "Fico entediado com tarefas simples.",
  "Preciso de desafio para manter engajamento.",
  "Minha produtividade depende de sentido.",
  "Alterno entre hiperfoco e dispersão.",
  "Mergulho intensamente quando algo me interessa.",
  "Tenho dificuldade com repetição mecânica.",
  "Inicio vários projetos ao mesmo tempo.",
  "Frustro-me com ambientes lentos.",
  "Procrastino tarefas sem significado.",
  "Tenho dificuldade em finalizar tarefas pouco estimulantes.",
  "Tenho sensibilidade emocional intensa.",
  "Reajo fortemente a injustiças.",
  "Tenho empatia profunda.",
  "Sou altamente autocrítico.",
  "Tenho padrões elevados comigo mesmo.",
  "Oscilo entre confiança e dúvida intensa.",
  "Tenho dificuldade de desligar a mente.",
  "Sinto frustração por não usar meu potencial.",
  "Penso demais antes de agir.",
  "Tenho tendência a overthinking.",
  "Senti-me diferente desde a infância.",
  "Tive interesses incomuns para minha idade.",
  "Preferia conversar com adultos.",
  "Questionava regras sem sentido.",
  "Sentia tédio frequente na escola.",
  "Aprendia mais rápido que colegas.",
  "Era visto como intenso ou exagerado.",
  "Tinha imaginação muito ativa.",
  "Era perfeccionista desde cedo.",
  "Tinha dificuldade de pertencimento.",
  "Tenho múltiplos interesses profundos.",
  "Mudo de área com facilidade.",
  "Vejo conexões entre áreas distintas.",
  "Gosto de debates intelectuais profundos.",
  "Prefiro conversas profundas a superficiais.",
  "Busco excelência constantemente.",
  "Fico frustrado com mediocridade.",
  "Tenho necessidade forte de autonomia.",
  "Sinto desconforto com hierarquias rígidas.",
  "Preciso de liberdade para produzir bem.",
  "Já me sabotei por medo de falhar.",
  "Tenho dificuldade em ambientes muito controladores.",
  "Minha energia criativa é intensa.",
  "Meu humor varia conforme estímulo intelectual.",
  "Tenho dificuldade com tarefas burocráticas.",
  "Sinto que penso mais rápido que o ambiente.",
  "Tenho facilidade para formular estratégias.",
  "Analiso cenários complexos mentalmente.",
  "Tenho sensação de potencial não utilizado.",
  "Sinto que poderia produzir muito mais do que produzo.",
];

// Category assignment by question index ranges
const cognicaoIds = [1,2,3,4,5,6,7,8,9,10,41,42,43,44,57,58].map(n => `ahsd_adult_${n}`);
const motivacaoIds = [11,12,13,14,15,16,17,18,19,20,53,54,55,56].map(n => `ahsd_adult_${n}`);
const intensidadeIds = [21,22,23,24,25,26,27,28,29,30].map(n => `ahsd_adult_${n}`);
const historicoIds = [31,32,33,34,35,36,37,38,39,40].map(n => `ahsd_adult_${n}`);
const autonomiaIds = [45,46,47,48,49,50,51,52,59,60].map(n => `ahsd_adult_${n}`);

// Split into blocks of 10
function makeBlocks() {
  const blocks = [];
  for (let i = 0; i < questions.length; i += 10) {
    const slice = questions.slice(i, i + 10);
    blocks.push({
      id: `ahsd_adult_block_${Math.floor(i / 10) + 1}`,
      questions: slice.map((text, j) => ({
        id: `ahsd_adult_${i + j + 1}`,
        text,
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

Há traços compatíveis com aceleração cognitiva ou criatividade diferenciada, porém sem padrão homogêneo e consistente nas quatro dimensões.

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
