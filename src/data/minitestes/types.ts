/**
 * Tipos compartilhados para minitestes (~90)
 * Standalone — sem dependência do motor v2
 */

export type JornadaId = "J1" | "J2" | "J3" | "J4" | "J5" | "J6";

export const JORNADA_LABELS: Record<JornadaId, string> = {
  J1: "Dependência Emocional",
  J2: "Coesão do Self",
  J3: "Autoeficácia",
  J4: "Expressão",
  J5: "Autonomia",
  J6: "Autodefesa",
};

export interface MiniTesteQuestion {
  id: string;
  texto: string;
}

export interface Miniteste {
  id: string;           // "MT-J1-01"
  jornada: JornadaId;
  nome: string;
  foco: string;
  perguntas: MiniTesteQuestion[];
}

export interface MiniTesteResult {
  miniTesteId: string;
  jornada: JornadaId;
  score: number;        // 0-100
  respostas: Record<string, number>;
  timestamp: number;
}

/** Opções padrão Likert 1-5 para todos os minitestes */
export const MT_OPCOES = [
  { valor: 1, texto: "Não me identifico" },
  { valor: 2, texto: "Um pouco" },
  { valor: 3, texto: "Moderadamente" },
  { valor: 4, texto: "Bastante" },
  { valor: 5, texto: "Totalmente eu" },
] as const;

/**
 * Calcula score de um miniteste (0-100).
 * @param respostas Record<questionId, valor 1-5>
 * @param totalPerguntas número de perguntas do miniteste
 */
export function computeMiniTesteScore(
  respostas: Record<string, number>,
  totalPerguntas: number
): number {
  const soma = Object.values(respostas).reduce((s, v) => s + v, 0);
  const max = totalPerguntas * 5;
  const min = totalPerguntas * 1;
  return Math.round(((soma - min) / (max - min)) * 100);
}
