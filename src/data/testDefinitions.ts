/**
 * Unified test definition interface for all quiz types.
 */

export interface TestQuestion {
  id: string;
  text: string;
}

export interface TestQuestionBlock {
  id: string;
  questions: TestQuestion[];
}

export interface TestCategory {
  key: string;
  label: string;
  questionIds: string[];
}

export interface TestClassification {
  minPct: number;
  label: string;
  description: string;
}

export interface TestDimensionRule {
  condition: string;
  message: string;
}

export interface TestDefinition {
  key: string;
  title: string;
  shortTitle: string;
  subtitle: string;
  description: string;
  icon: string;
  scaleMin: number;
  scaleMax: number;
  scaleLabels: { value: number; label: string }[];
  questionBlocks: TestQuestionBlock[];
  categories: TestCategory[];
  classifications: TestClassification[];
  dimensionRules?: TestDimensionRule[];
  estimatedMinutes: number;
  /** If true, uses percentile display = min(99, round(pct * 1.1)) */
  inflatePercentile?: boolean;
}

export function getTotalQuestions(test: TestDefinition): number {
  return test.questionBlocks.reduce((sum, b) => sum + b.questions.length, 0);
}

export function calculateTestScores(
  test: TestDefinition,
  answers: Record<string, number>
): { total: number; maxTotal: number; pct: number; percentile: number; categoryScores: Record<string, { score: number; max: number; pct: number }> } {
  const totalQ = getTotalQuestions(test);
  const total = Object.values(answers).reduce((s, v) => s + v, 0);
  const maxTotal = totalQ * test.scaleMax;
  const pct = Math.round((total / maxTotal) * 100);
  const percentile = test.inflatePercentile ? Math.min(99, Math.round(pct * 1.1)) : pct;

  const categoryScores: Record<string, { score: number; max: number; pct: number }> = {};
  for (const cat of test.categories) {
    const catTotal = cat.questionIds.reduce((s, qid) => s + (answers[qid] ?? 0), 0);
    const catMax = cat.questionIds.length * test.scaleMax;
    categoryScores[cat.key] = {
      score: catTotal,
      max: catMax,
      pct: catMax > 0 ? Math.round((catTotal / catMax) * 100) : 0,
    };
  }

  return { total, maxTotal, pct, percentile, categoryScores };
}

export function classifyResult(test: TestDefinition, pct: number): TestClassification {
  // Classifications are ordered from highest minPct to lowest
  const sorted = [...test.classifications].sort((a, b) => b.minPct - a.minPct);
  return sorted.find((c) => pct >= c.minPct) ?? sorted[sorted.length - 1];
}

export function evaluateDimensionRules(
  test: TestDefinition,
  categoryScores: Record<string, { pct: number }>
): string[] {
  if (!test.dimensionRules) return [];
  const messages: string[] = [];
  
  for (const rule of test.dimensionRules) {
    try {
      // Simple rule evaluation using category percentages
      const fn = new Function(
        ...test.categories.map((c) => c.key),
        `return ${rule.condition}`
      );
      const args = test.categories.map((c) => categoryScores[c.key]?.pct ?? 0);
      if (fn(...args)) {
        messages.push(rule.message);
      }
    } catch {
      // Skip malformed rules
    }
  }
  return messages;
}
