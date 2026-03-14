/**
 * Motor de cruzamento entre testes.
 * Mapeia condições (Neurocognitivo) → dimensões (Dimensional),
 * enriquece com categorias AH/SD Adulto.
 */

/* ═══ TYPES ═══ */

export interface NeurocogScores {
  ahsd: number; tdah: number; tea: number; dupla_exc: number;
  trauma: number; depressao: number; ansiedade: number;
  traco?: number; traco_adq?: number; temporalidade?: number; impacto?: number;
}

export interface DimEntry { score: number; zone: string }

export interface DimensionalScores {
  c1Scores: {
    dimensions: Record<string, DimEntry>;
    alostatic: string[];
  };
  c2Scores?: Record<string, {
    desempenho: { score: number; max: number };
    vinculo: { score: number; max: number };
    fisiologico: { score: number; max: number };
  }>;
}

export interface AhsdAdultoScores {
  pct: number;
  percentile: number;
  categoryScores: Record<string, { score: number; max: number; pct: number }>;
}

/* ═══ LABELS ═══ */

export const CONDITION_LABELS: Record<string, string> = {
  ahsd: "AH/SD", tdah: "TDAH", tea: "Autismo (TEA)",
  dupla_exc: "Dupla Excepcionalidade", trauma: "Trauma",
  depressao: "Depressão", ansiedade: "Ansiedade",
};

export const DIM_LABELS: Record<string, string> = {
  ritmo: "Ritmo & Energia", ameaca: "Saliência & Ameaça",
  executivo: "Controle Executivo", vinculo: "Afetividade & Vínculo",
  sensorial: "Sensorialidade", recompensa: "Recompensa & Hábito",
  realidade: "Modelagem & Realidade",
};

export const DIM_SHORT: Record<string, string> = {
  ritmo: "Ritmo", ameaca: "Ameaça", executivo: "Executivo",
  vinculo: "Vínculo", sensorial: "Sensorial", recompensa: "Recompensa",
  realidade: "Realidade",
};

const AHSD_CAT_LABELS: Record<string, string> = {
  cognicao: "Cognição", motivacao: "Motivação",
  intensidade: "Intensidade Emocional", historico: "Histórico",
  autonomia: "Autonomia & Execução",
};

/* ═══ BRIDGES ═══ */

const CONDITION_DIM_BRIDGES: Record<string, { dims: string[]; explanation: string }> = {
  tdah: {
    dims: ["executivo", "recompensa", "ritmo"],
    explanation: "TDAH sobrecarrega controle executivo (foco, início, conclusão), sistema de recompensa (impulsividade, busca de estímulo) e regulação de ritmo (oscilação de energia).",
  },
  tea: {
    dims: ["sensorial", "vinculo", "realidade"],
    explanation: "Autismo impacta processamento sensorial (sobrecarga), vinculação (leitura social) e modelagem de realidade (rigidez inferencial).",
  },
  ansiedade: {
    dims: ["ameaca", "ritmo"],
    explanation: "Ansiedade hiperativa o sistema de detecção de ameaça e desregula o ritmo de energia (estado de prontidão constante).",
  },
  depressao: {
    dims: ["recompensa", "ritmo", "vinculo"],
    explanation: "Depressão reduz a sensibilidade do sistema de recompensa (anedonia), desregula energia (fadiga) e impacta vínculos (isolamento).",
  },
  trauma: {
    dims: ["ameaca", "vinculo", "realidade"],
    explanation: "Trauma hiperativa o sistema de ameaça (hipervigilância), desregula vinculação (apego inseguro) e distorce a modelagem de realidade.",
  },
  ahsd: {
    dims: ["executivo", "sensorial", "recompensa", "ritmo"],
    explanation: "Altas habilidades sobrecarregam o executivo (hiperfoco/dispersão), sensorial (intensidade perceptiva), recompensa (tédio com estímulo comum) e ritmo (ciclos de alta e crash).",
  },
  dupla_exc: {
    dims: ["executivo", "sensorial", "ameaca"],
    explanation: "Dupla excepcionalidade combina capacidade alta com dificuldade específica, intensificando executivo, sensorial e sistema de ameaça.",
  },
};

const AHSD_DIM_BRIDGES: Record<string, { dims: string[]; label: string }> = {
  cognicao: { dims: ["executivo", "realidade"], label: "Cognição" },
  motivacao: { dims: ["recompensa"], label: "Motivação" },
  intensidade: { dims: ["sensorial", "ameaca", "vinculo"], label: "Intensidade Emocional" },
  historico: { dims: ["ritmo", "realidade"], label: "Histórico" },
  autonomia: { dims: ["executivo", "recompensa"], label: "Autonomia" },
};

/* ═══ INSIGHT TYPE ═══ */

export interface CrossInsight {
  title: string;
  body: string;
  severity: "high" | "medium" | "low";
  conditions: string[];
  dimensions: string[];
}

export interface PriorityItem {
  dim: string;
  label: string;
  score: number;
  maxScore: number;
  zone: string;
  linkedConditions: string[];
}

export interface IntegratedResult {
  insights: CrossInsight[];
  priorities: PriorityItem[];
  summary: string;
  hasNeurocog: boolean;
  hasDimensional: boolean;
  hasAhsdAdulto: boolean;
}

/* ═══ MAIN GENERATOR ═══ */

export function generateIntegratedAnalysis(
  neurocog: NeurocogScores | null,
  dimensional: DimensionalScores | null,
  ahsdAdulto: AhsdAdultoScores | null,
): IntegratedResult {
  const insights: CrossInsight[] = [];

  // 1. Neurocognitivo × Dimensional
  if (neurocog && dimensional) {
    const dims = dimensional.c1Scores.dimensions;
    const significant = (Object.entries(neurocog) as [string, number][])
      .filter(([k, v]) => CONDITION_DIM_BRIDGES[k] && v >= 50)
      .sort(([, a], [, b]) => b - a);

    for (const [condKey, condPct] of significant) {
      const bridge = CONDITION_DIM_BRIDGES[condKey];
      if (!bridge) continue;
      const elevated = bridge.dims.filter(d => {
        const dd = dims[d];
        return dd && (dd.zone === "alostatico" || dd.zone === "atencao");
      });
      if (elevated.length === 0) continue;

      const condLabel = CONDITION_LABELS[condKey] ?? condKey;
      const dimLabels = elevated.map(d => DIM_LABELS[d] ?? d);
      const hasAlostatic = elevated.some(d => dims[d]?.zone === "alostatico");
      const aloNames = elevated.filter(d => dims[d]?.zone === "alostatico").map(d => DIM_LABELS[d]);

      insights.push({
        title: `${condLabel} (${condPct}%) aponta sobrecarga em ${dimLabels.join(" + ")}`,
        body: bridge.explanation + (hasAlostatic
          ? ` No seu perfil, ${aloNames.join(" e ")} ${aloNames.length === 1 ? "está" : "estão"} em alostase — custo adaptativo alto.`
          : ` ${dimLabels.join(" e ")} ${elevated.length === 1 ? "está" : "estão"} em zona de atenção.`),
        severity: hasAlostatic ? "high" : "medium",
        conditions: [condKey],
        dimensions: elevated,
      });
    }
  }

  // 2. AH/SD Adulto × Dimensional
  if (ahsdAdulto && dimensional) {
    const dims = dimensional.c1Scores.dimensions;
    for (const [catKey, bridge] of Object.entries(AHSD_DIM_BRIDGES)) {
      const cat = ahsdAdulto.categoryScores[catKey];
      if (!cat || cat.pct < 60) continue;
      const elevated = bridge.dims.filter(d => dims[d] && (dims[d].zone === "alostatico" || dims[d].zone === "atencao"));
      if (elevated.length === 0) continue;
      const dimLabels = elevated.map(d => DIM_LABELS[d] ?? d);

      insights.push({
        title: `${bridge.label} (${cat.pct}%) impacta ${dimLabels.join(" + ")}`,
        body: `Sua ${bridge.label.toLowerCase()} elevada no perfil AH/SD se reflete em custo adaptativo nas dimensões ${dimLabels.join(" e ")}.`,
        severity: elevated.some(d => dims[d]?.zone === "alostatico") ? "high" : "medium",
        conditions: [`ahsd_${catKey}`],
        dimensions: elevated,
      });
    }
  }

  // 3. AH/SD Adulto × Neurocognitivo — convergência
  if (ahsdAdulto && neurocog) {
    if (neurocog.ahsd >= 50 && ahsdAdulto.pct >= 60) {
      insights.push({
        title: "Superdotação altamente apontada por ambos os testes",
        body: `O rastreio neurocognitivo aponta ${neurocog.ahsd}% de compatibilidade AH/SD, e o teste específico indica ${ahsdAdulto.pct}% (percentil ${ahsdAdulto.percentile}). Os dois instrumentos convergem na mesma direção.`,
        severity: "low", conditions: ["ahsd"], dimensions: [],
      });
    } else if (neurocog.ahsd >= 50 && ahsdAdulto.pct < 40) {
      insights.push({
        title: "Divergência entre rastreios de AH/SD",
        body: `O neurocognitivo sugere ${neurocog.ahsd}% AH/SD, mas o teste específico mostra ${ahsdAdulto.pct}%. Pode indicar compensação ou outra origem dos sinais.`,
        severity: "medium", conditions: ["ahsd"], dimensions: [],
      });
    }
  }

  // 4. Priorities (dimensional-based)
  const priorities: PriorityItem[] = [];
  if (dimensional) {
    const dims = dimensional.c1Scores.dimensions;
    const sorted = Object.entries(dims).sort(([, a], [, b]) => b.score - a.score);
    for (const [dimKey, dimData] of sorted) {
      const linked: string[] = [];
      if (neurocog) {
        for (const [ck, br] of Object.entries(CONDITION_DIM_BRIDGES)) {
          if (br.dims.includes(dimKey) && (neurocog as any)[ck] >= 50) {
            linked.push(CONDITION_LABELS[ck] ?? ck);
          }
        }
      }
      priorities.push({
        dim: dimKey, label: DIM_LABELS[dimKey] ?? dimKey,
        score: dimData.score, maxScore: 32, zone: dimData.zone,
        linkedConditions: linked,
      });
    }
  }

  // 5. Summary
  const aloCount = dimensional?.c1Scores.alostatic.length ?? 0;
  const topConds = neurocog
    ? (Object.entries(neurocog) as [string, number][])
        .filter(([k]) => CONDITION_LABELS[k])
        .sort(([, a], [, b]) => b - a)
        .slice(0, 2)
        .map(([k]) => CONDITION_LABELS[k])
    : [];

  let summary = "";
  if (neurocog && dimensional) {
    if (aloCount > 0 && topConds.length > 0) {
      summary = `Seu perfil aponta ${topConds.join(" e ")} como hipóteses dominantes, com ${aloCount} ${aloCount === 1 ? "dimensão" : "dimensões"} em sobrecarga adaptativa. Os instrumentos apontam na mesma direção — as condições identificadas podem explicar o custo dimensional observado.`;
    } else if (topConds.length > 0) {
      summary = `As hipóteses ${topConds.join(" e ")} aparecem no rastreio, mas suas dimensões operam em faixa regulada. Bom manejo atual ou fase de compensação.`;
    } else {
      summary = "Os rastreios indicam perfil dentro da faixa esperada.";
    }
  } else if (neurocog) {
    summary = "Análise parcial — apenas Neurocognitivo. Complete o Painel Dimensional para cruzamento completo.";
  } else if (dimensional) {
    summary = "Análise parcial — apenas Dimensional. Complete o Neurocognitivo para cruzamento completo.";
  }
  if (ahsdAdulto && ahsdAdulto.pct >= 60) {
    summary += ` Perfil AH/SD fortemente apontado por ${ahsdAdulto.pct}% no teste específico (percentil ${ahsdAdulto.percentile}).`;
  }

  return {
    insights: insights.sort((a, b) => {
      const s = { high: 0, medium: 1, low: 2 };
      return s[a.severity] - s[b.severity];
    }),
    priorities,
    summary,
    hasNeurocog: !!neurocog,
    hasDimensional: !!dimensional,
    hasAhsdAdulto: !!ahsdAdulto,
  };
}

/* ═══ HELPERS FOR UI ═══ */

export function getZoneColor(zone: string): string {
  switch (zone) {
    case "regulado": return "hsl(141, 58%, 54%)";
    case "atencao": return "hsl(40, 88%, 61%)";
    case "alostatico": return "hsl(0, 70%, 58%)";
    default: return "hsl(var(--muted-foreground))";
  }
}

export function getZoneLabel(zone: string): string {
  switch (zone) {
    case "regulado": return "REGULADO";
    case "atencao": return "ATENÇÃO";
    case "alostatico": return "ALOSTÁTICO";
    default: return zone;
  }
}

export function getSeverityColor(severity: string): string {
  switch (severity) {
    case "high": return "hsl(0, 70%, 58%)";
    case "medium": return "hsl(40, 88%, 61%)";
    case "low": return "hsl(141, 58%, 54%)";
    default: return "hsl(var(--muted-foreground))";
  }
}

export function conditionColor(key: string): string {
  const hues: Record<string, number> = {
    ahsd: 154, dupla_exc: 31, tdah: 0, tea: 15,
    trauma: 340, depressao: 300, ansiedade: 32,
  };
  return `hsl(${hues[key] ?? 200}, 65%, 45%)`;
}

export { AHSD_CAT_LABELS };
