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
    title: "Painel de Funcionamento Global",
    shortTitle: "Dimensional",
    subtitle: "56 itens · ~12 min",
    description: "Descubra quais áreas do seu cérebro estão sobrecarregadas e receba um mapa claro de onde agir primeiro.",
    icon: "🧠",
    route: "/triagem/dimensional",
  },
  {
    key: "neurocognitivo",
    title: "Rastreio Neurocognitivo Completo",
    shortTitle: "Neurocognitivo",
    subtitle: "53 perguntas · ~10 min",
    description: "Identifique se TDAH, autismo, trauma ou altas habilidades explicam o que você sente — com hipóteses ranqueadas por probabilidade.",
    icon: "🔬",
    route: "/triagem",
  },
  {
    key: ahsdAdultTest.key,
    title: ahsdAdultTest.title,
    shortTitle: ahsdAdultTest.shortTitle,
    subtitle: "60 perguntas · ~10 min",
    description: "Saiba se seu padrão cognitivo é compatível com superdotação e entenda por que você funciona diferente.",
    icon: ahsdAdultTest.icon,
    route: `/triagem/${ahsdAdultTest.key}`,
  },
  {
    key: ahsdChildTest.key,
    title: ahsdChildTest.title,
    shortTitle: ahsdChildTest.shortTitle,
    subtitle: "50 perguntas · ~8 min",
    description: "Descubra se seu filho tem sinais de altas habilidades e receba orientações práticas para apoiá-lo.",
    icon: ahsdChildTest.icon,
    route: `/triagem/${ahsdChildTest.key}`,
  },
];

export function getTestByKey(key: string): TestDefinition | undefined {
  return AHSD_TESTS.find((t) => t.key === key);
}
