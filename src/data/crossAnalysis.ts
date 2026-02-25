/**
 * Static cross-reference analysis texts.
 * Maps relationship types + profile combinations to insights.
 */

export type ProfileLevel = "alto" | "moderado" | "baixo";

export function getProfileLevel(pct: number): ProfileLevel {
  if (pct >= 70) return "alto";
  if (pct >= 40) return "moderado";
  return "baixo";
}

/** Dominant trait = highest-scoring dimension */
export function getDominantTrait(scores: Record<string, number>): { key: string; pct: number } {
  const entries = Object.entries(scores).sort(([, a], [, b]) => b - a);
  return { key: entries[0]?.[0] ?? "ahsd", pct: entries[0]?.[1] ?? 0 };
}

const TRAIT_LABELS: Record<string, string> = {
  ahsd: "Altas Habilidades",
  dupla_exc: "Dupla Excepcionalidade",
  tdah: "TDAH",
  tea: "Autismo (TEA)",
  trauma: "Trauma",
  depressao: "Depressão",
  ansiedade: "Ansiedade",
  traco: "Traço Neurodivergente",
  traco_adq: "Traço Adquirido",
  temporalidade: "Temporalidade",
  impacto: "Impacto Funcional",
};

export function getTraitLabel(key: string): string {
  return TRAIT_LABELS[key] ?? key;
}

/* ─── Relationship-specific intro texts ─── */
const RELATIONSHIP_INTROS: Record<string, string> = {
  casal: "Esta análise cruza os perfis neurocognitivos de vocês como casal, destacando pontos de complementaridade e possíveis fontes de atrito na convivência.",
  pai_filho: "Esta análise compara os perfis neurocognitivos entre pai/mãe e filho(a), identificando padrões que podem facilitar ou dificultar a compreensão mútua.",
  irmaos: "Esta análise cruza os perfis entre irmãos, revelando semelhanças e diferenças que impactam a dinâmica fraterna.",
  amigos: "Esta análise compara os perfis entre amigos ou colegas, identificando como as diferenças neurocognitivas se manifestam na relação.",
  outros: "Esta análise cruza os perfis neurocognitivos de ambos, identificando padrões de interação relevantes.",
};

export function getRelationshipIntro(type: string): string {
  return RELATIONSHIP_INTROS[type] ?? RELATIONSHIP_INTROS.outros;
}

/* ─── Compatibility patterns ─── */
interface CompatInsight {
  title: string;
  body: string;
  type: "strength" | "challenge" | "tip";
}

function generateTraitInsights(
  traitKey: string,
  levelA: ProfileLevel,
  levelB: ProfileLevel,
  relationship: string
): CompatInsight[] {
  const label = getTraitLabel(traitKey);
  const insights: CompatInsight[] = [];

  // Both high
  if (levelA === "alto" && levelB === "alto") {
    insights.push({
      title: `Ambos com ${label} elevado`,
      body: `Vocês compartilham intensidade nessa dimensão. Isso gera empatia natural, mas também pode amplificar momentos de sobrecarga. Criem sinais de "pausa" quando a intensidade for demais para os dois.`,
      type: "strength",
    });
  }

  // One high, one low
  if ((levelA === "alto" && levelB === "baixo") || (levelA === "baixo" && levelB === "alto")) {
    const whoHigh = levelA === "alto" ? "Pessoa A" : "Pessoa B";
    insights.push({
      title: `Diferença marcante em ${label}`,
      body: `${whoHigh} vivencia essa dimensão com intensidade, enquanto a outra pessoa não. Isso pode gerar incompreensão — quem não sente a mesma intensidade pode minimizar as experiências do outro. Pratiquem escuta ativa sem julgamento.`,
      type: "challenge",
    });

    if (relationship === "casal") {
      insights.push({
        title: "Dica para o casal",
        body: `Quando ${whoHigh} estiver sobrecarregado(a) nessa dimensão, o parceiro(a) pode ajudar oferecendo um espaço seguro sem tentar "resolver". Às vezes, presença silenciosa vale mais que conselho.`,
        type: "tip",
      });
    }
    if (relationship === "pai_filho") {
      insights.push({
        title: "Dica para a relação parental",
        body: `Se a criança/adolescente tem intensidade alta nessa área, é essencial validar a experiência dela antes de orientar. Frases como "eu entendo que isso é intenso pra você" ajudam mais do que "não é pra tanto".`,
        type: "tip",
      });
    }
  }

  // Both moderate
  if (levelA === "moderado" && levelB === "moderado") {
    insights.push({
      title: `${label}: zona equilibrada`,
      body: `Ambos apresentam nível moderado nessa dimensão. Isso facilita a compreensão mútua, mas fiquem atentos a momentos de oscilação — o moderado pode pender para alto ou baixo dependendo do contexto.`,
      type: "strength",
    });
  }

  return insights;
}

/* ─── Main analysis generator ─── */
export interface CrossAnalysis {
  intro: string;
  personADominant: { key: string; label: string; pct: number };
  personBDominant: { key: string; label: string; pct: number };
  insights: CompatInsight[];
  summary: string;
}

export function generateCrossAnalysis(
  scoresA: Record<string, number>,
  scoresB: Record<string, number>,
  relationshipType: string
): CrossAnalysis {
  const intro = getRelationshipIntro(relationshipType);
  const domA = getDominantTrait(scoresA);
  const domB = getDominantTrait(scoresB);

  // Generate insights for top 5 shared traits
  const allTraits = new Set([...Object.keys(scoresA), ...Object.keys(scoresB)]);
  const sortedTraits = [...allTraits]
    .filter((t) => scoresA[t] !== undefined && scoresB[t] !== undefined)
    .sort((a, b) => Math.max(scoresA[b] ?? 0, scoresB[b] ?? 0) - Math.max(scoresA[a] ?? 0, scoresB[a] ?? 0))
    .slice(0, 5);

  const insights: CompatInsight[] = [];
  for (const trait of sortedTraits) {
    const levelA = getProfileLevel(scoresA[trait] ?? 0);
    const levelB = getProfileLevel(scoresB[trait] ?? 0);
    insights.push(...generateTraitInsights(trait, levelA, levelB, relationshipType));
  }

  // Summary
  const matchCount = sortedTraits.filter(
    (t) => getProfileLevel(scoresA[t] ?? 0) === getProfileLevel(scoresB[t] ?? 0)
  ).length;

  let summary: string;
  if (matchCount >= 4) {
    summary = "Vocês têm perfis muito semelhantes. A grande compatibilidade favorece a empatia, mas lembrem-se de respeitar as nuances individuais — parecidos não significa iguais.";
  } else if (matchCount >= 2) {
    summary = "Vocês combinam semelhanças e diferenças de forma equilibrada. Isso enriquece a relação quando há abertura para entender o que o outro vive de forma diferente.";
  } else {
    summary = "Vocês têm perfis bastante distintos. Isso é uma força quando há respeito mútuo — um complementa o que o outro não tem. Invistam em comunicação clara sobre necessidades.";
  }

  return {
    intro,
    personADominant: { ...domA, label: getTraitLabel(domA.key) },
    personBDominant: { ...domB, label: getTraitLabel(domB.key) },
    insights,
    summary,
  };
}
