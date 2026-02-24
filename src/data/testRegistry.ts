import type { TestDefinition } from "./testDefinitions";
import { ahsdAdultTest } from "./ahsdAdultTest";
import { ahsdChildTest } from "./ahsdChildTest";

/**
 * Registry of all available tests.
 * The "neurocognitivo" test uses the legacy quiz system (quizQuestions.ts).
 */

export const AHSD_TESTS: TestDefinition[] = [ahsdAdultTest, ahsdChildTest];

export const ALL_TESTS = [
  {
    key: "dimensional",
    title: "Painel Dimensional de Adaptação",
    shortTitle: "Dimensional",
    subtitle: "56 itens · 7 dimensões · 2 camadas",
    description: "Mapeamento de custo adaptativo em ritmo, ameaça, executivo, vínculo, sensorialidade, recompensa e modelagem de realidade.",
    icon: "🧠",
    route: "/triagem/dimensional",
  },
  {
    key: "neurocognitivo",
    title: "Rastreio Neurocognitivo Completo",
    shortTitle: "Neurocognitivo",
    subtitle: "53 perguntas · 7 dimensões",
    description: "Rastreio de altas habilidades, dupla excepcionalidade, TDAH, autismo, trauma, depressão e ansiedade.",
    icon: "🔬",
    route: "/triagem",
  },
  {
    key: ahsdAdultTest.key,
    title: ahsdAdultTest.title,
    shortTitle: ahsdAdultTest.shortTitle,
    subtitle: ahsdAdultTest.subtitle,
    description: ahsdAdultTest.description,
    icon: ahsdAdultTest.icon,
    route: `/triagem/${ahsdAdultTest.key}`,
  },
  {
    key: ahsdChildTest.key,
    title: ahsdChildTest.title,
    shortTitle: ahsdChildTest.shortTitle,
    subtitle: ahsdChildTest.subtitle,
    description: ahsdChildTest.description,
    icon: ahsdChildTest.icon,
    route: `/triagem/${ahsdChildTest.key}`,
  },
];

export function getTestByKey(key: string): TestDefinition | undefined {
  return AHSD_TESTS.find((t) => t.key === key);
}
