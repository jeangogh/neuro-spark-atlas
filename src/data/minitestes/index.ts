/**
 * Catálogo de minitestes — índice central
 * 90 minitestes agrupados por jornada (15 × 6).
 */

export type { Miniteste, MiniTesteQuestion, MiniTesteResult, JornadaId } from "./types";
export { MT_OPCOES, computeMiniTesteScore, JORNADA_LABELS } from "./types";

import type { Miniteste } from "./types";
import type { JornadaId } from "./types";
import { J1_MINITESTES } from "./j1-dependencia";
import { J2_MINITESTES } from "./j2-coesao";
import { J3_MINITESTES } from "./j3-autoeficacia";
import { J4_MINITESTES } from "./j4-expressao";
import { J5_MINITESTES } from "./j5-autonomia";
import { J6_MINITESTES } from "./j6-autodefesa";

/** Todos os minitestes por jornada */
export const MINITESTES_POR_JORNADA: Record<JornadaId, Miniteste[]> = {
  J1: J1_MINITESTES,
  J2: J2_MINITESTES,
  J3: J3_MINITESTES,
  J4: J4_MINITESTES,
  J5: J5_MINITESTES,
  J6: J6_MINITESTES,
};

/** Todos os minitestes em um array flat */
export const ALL_MINITESTES: Miniteste[] = [
  ...J1_MINITESTES,
  ...J2_MINITESTES,
  ...J3_MINITESTES,
  ...J4_MINITESTES,
  ...J5_MINITESTES,
  ...J6_MINITESTES,
];

/** IDs de minitestes por jornada (para o motor) */
export const MINITESTE_IDS_POR_JORNADA: Record<JornadaId, string[]> = {
  J1: J1_MINITESTES.map((m) => m.id),
  J2: J2_MINITESTES.map((m) => m.id),
  J3: J3_MINITESTES.map((m) => m.id),
  J4: J4_MINITESTES.map((m) => m.id),
  J5: J5_MINITESTES.map((m) => m.id),
  J6: J6_MINITESTES.map((m) => m.id),
};

/** Busca miniteste por ID */
export function getMiniTeste(id: string): Miniteste | undefined {
  return ALL_MINITESTES.find((m) => m.id === id);
}
