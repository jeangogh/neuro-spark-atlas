import type { TestDefinition } from "./testDefinitions";

const questions = [
  "Meu filho(a) aprendeu a ler sozinho ou muito cedo.",
  "Meu filho(a) cria histórias, jogos ou mundos imaginários elaborados.",
  "Meu filho(a) reage intensamente a injustiças ou sofrimento alheio.",
  "Meu filho(a) prefere conversar com adultos ou crianças mais velhas.",
  "Meu filho(a) se concentra por longos períodos em atividades de interesse.",
  "Meu filho(a) faz perguntas profundas sobre vida, morte e existência.",
  "Meu filho(a) inventa soluções originais para problemas do dia a dia.",
  "Meu filho(a) se incomoda com etiquetas de roupa, sons altos ou luzes fortes.",
  "Meu filho(a) tem dificuldade de se encaixar com colegas da mesma idade.",
  "Meu filho(a) demonstra paixão intensa por determinados assuntos.",
  "Meu filho(a) tem vocabulário avançado para a idade.",
  "Meu filho(a) desmonta objetos para entender como funcionam.",
  "Meu filho(a) chora facilmente com músicas, filmes ou situações tristes.",
  "Meu filho(a) questiona regras e autoridade de forma argumentativa.",
  "Meu filho(a) perde interesse em tarefas que considera fáceis demais.",
  "Meu filho(a) memorizou informações complexas desde muito cedo.",
  "Meu filho(a) desenha, constrói ou cria com detalhes impressionantes.",
  "Meu filho(a) percebe o estado emocional das pessoas antes dos outros.",
  "Meu filho(a) tem senso de humor sofisticado para a idade.",
  "Meu filho(a) demonstra determinação excepcional quando interessado.",
  "Meu filho(a) resolve problemas de maneira criativa sem ajuda.",
  "Meu filho(a) faz associações entre assuntos aparentemente diferentes.",
  "Meu filho(a) se angustia com temas existenciais ou com o sofrimento do mundo.",
  "Meu filho(a) prefere atividades com regras complexas e estratégia.",
  "Meu filho(a) busca desafios por conta própria.",
  "Meu filho(a) aprende novas habilidades muito rapidamente.",
  "Meu filho(a) improvisa e cria alternativas quando algo não funciona.",
  "Meu filho(a) se incomoda com cheiros, texturas ou ambientes barulhentos.",
  "Meu filho(a) se sente deslocado em ambientes escolares tradicionais.",
  "Meu filho(a) se envolve intensamente com um tema e fala sobre ele por muito tempo.",
  "Meu filho(a) usa palavras incomuns ou constrói frases complexas para a idade.",
  "Meu filho(a) faz perguntas 'por quê?' em sequência e quer respostas detalhadas.",
  "Meu filho(a) se emociona profundamente com injustiça ou rejeição.",
  "Meu filho(a) tem dificuldades com grupos grandes ou interações superficiais.",
  "Meu filho(a) demonstra foco extraordinário em atividades escolhidas.",
  "Meu filho(a) entende ironia, duplo sentido ou humor mais adulto.",
  "Meu filho(a) cria regras próprias e sistemas para brincar ou organizar coisas.",
  "Meu filho(a) se irrita ou entristece com facilidade quando algo parece injusto.",
  "Meu filho(a) tem facilidade para liderar, organizar e influenciar colegas.",
  "Meu filho(a) insiste em concluir algo quando está motivado, mesmo com dificuldades.",
  "Meu filho(a) percebe detalhes mínimos e lembra de coisas com grande precisão.",
  "Meu filho(a) tem interesses intensos que mudam em ciclos (imersão total).",
  "Meu filho(a) se sente frustrado quando precisa repetir algo que já entendeu.",
  "Meu filho(a) demonstra sensibilidade a críticas e rejeição.",
  "Meu filho(a) busca autonomia e prefere fazer do seu jeito.",
  "Meu filho(a) demonstra criatividade incomum em artes, linguagem ou jogos.",
  "Meu filho(a) se perturba com barulho, multidão ou excesso de estímulos.",
  "Meu filho(a) tem perfeccionismo que atrapalha na conclusão de tarefas.",
  "Meu filho(a) demonstra liderança natural em situações de grupo.",
  "Meu filho(a) busca desafios intelectuais de forma autônoma.",
];

// Cyclic 5-category assignment: cats[i % 5]
const catKeys = ["cognicao", "criatividade", "sensibilidade", "socioemocional", "motivacao"];
const catMap: Record<string, string[]> = {
  cognicao: [],
  criatividade: [],
  sensibilidade: [],
  socioemocional: [],
  motivacao: [],
};
questions.forEach((_, i) => {
  const catKey = catKeys[i % 5];
  catMap[catKey].push(`ahsd_child_${i + 1}`);
});

function makeBlocks() {
  const blocks = [];
  for (let i = 0; i < questions.length; i += 10) {
    const slice = questions.slice(i, i + 10);
    blocks.push({
      id: `ahsd_child_block_${Math.floor(i / 10) + 1}`,
      questions: slice.map((text, j) => ({
        id: `ahsd_child_${i + j + 1}`,
        text,
      })),
    });
  }
  return blocks;
}

export const ahsdChildTest: TestDefinition = {
  key: "ahsd_infantil",
  title: "Protocolo AH/SD-I (Infantil — Pais)",
  shortTitle: "AH/SD Infantil",
  subtitle: "50 perguntas · Respondido pelos pais",
  description: "Rastreio de altas habilidades para crianças, respondido pelos pais ou responsáveis. Avalia cognição, criatividade, sensibilidade, perfil socioemocional e motivação.",
  icon: "👶",
  scaleMin: 1,
  scaleMax: 5,
  scaleLabels: [
    { value: 1, label: "Raramente" },
    { value: 2, label: "Poucas vezes" },
    { value: 3, label: "Às vezes" },
    { value: 4, label: "Frequentemente" },
    { value: 5, label: "Muito frequentemente" },
  ],
  questionBlocks: makeBlocks(),
  categories: [
    { key: "cognicao", label: "Cognição", questionIds: catMap.cognicao },
    { key: "criatividade", label: "Criatividade", questionIds: catMap.criatividade },
    { key: "sensibilidade", label: "Sensibilidade", questionIds: catMap.sensibilidade },
    { key: "socioemocional", label: "Socioemocional", questionIds: catMap.socioemocional },
    { key: "motivacao", label: "Motivação", questionIds: catMap.motivacao },
  ],
  classifications: [
    {
      minPct: 80,
      label: "Indicadores muito elevados de AH/SD",
      description: `O padrão é fortemente sugestivo de altas habilidades com consistência comportamental ampla nas cinco dimensões.

Costuma indicar criança com aceleração cognitiva, criatividade expressiva, sensibilidade alta, leitura social/afetiva diferenciada e motivação intensa quando há interesse (com grande aversão a tarefas mecânicas).

Quando o ambiente não acompanha, é frequente aparecerem: desengajamento, irritabilidade, perfeccionismo, sobrecarga sensorial/emocional e conflitos escolares por inadequação de desafio.`,
    },
    {
      minPct: 65,
      label: "Indicadores elevados de AH/SD",
      description: `O conjunto de respostas sugere presença consistente de características associadas a altas habilidades na criança, observadas com frequência pelos pais.

Tipicamente há combinação de cognição acima do esperado, criatividade, sensibilidade e padrões motivacionais de busca por desafio (ou resistência a tarefas sem sentido).

Nesse nível, é comum coexistirem: tédio escolar, frustração com repetição, intensidade emocional e possíveis dificuldades de pertencimento com pares.`,
    },
    {
      minPct: 50,
      label: "Indicadores moderados",
      description: `Há sinais relevantes, porém distribuídos de forma irregular. Em geral isso aparece como: pontos altos em uma ou duas dimensões e médias mais baixas nas demais, sugerindo perfil assimétrico.

Recomenda-se olhar as barras por dimensão e considerar: ambiente escolar, estímulo adequado, desafios, ajuste social e fatores emocionais.`,
    },
    {
      minPct: 0,
      label: "Indicadores abaixo do limiar",
      description: `O padrão global de respostas não aponta consistência suficiente de comportamentos associados a altas habilidades no recorte observado.

Isso não exclui potencial, mas sugere que, no conjunto, não há intensidade e frequência comportamental compatíveis com um perfil fortemente sugestivo no momento.

Se há queixas (escola, emoção, comportamento), elas podem estar mais relacionadas a contexto, maturação, rotina, estressores ou necessidades específicas não capturadas pelo protocolo.`,
    },
  ],
  estimatedMinutes: 8,
  inflatePercentile: true,
};
