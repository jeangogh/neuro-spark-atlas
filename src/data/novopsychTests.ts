/**
 * 13 NovoPsych validated tests — data, types, scoring
 */

export interface NovoPsychOption {
  value: number;
  label: string;
}

export interface NovoPsychQuestion {
  id: string;
  text: string;
  reverseWith?: number; // reversed value = reverseWith - raw
}

export interface NovoPsychCutoff {
  minScore: number;
  label: string;
  description: string;
  color: 'green' | 'yellow' | 'amber' | 'red';
  isAlert?: boolean;
}

export interface NovoPsychSubscale {
  key: string;
  label: string;
  questionIds: string[];
  isAverage?: boolean;
}

export interface NovoPsychTest {
  key: string;
  title: string;
  shortTitle: string;
  reference: string;
  items: number;
  estimatedMinutes: number;
  description: string;
  instruction: string;
  options: NovoPsychOption[];
  questions: NovoPsychQuestion[];
  isAverage?: boolean;
  higherIsBetter?: boolean;
  primaryDisplay?: 'total' | 'subscales';
  cutoffs: NovoPsychCutoff[];
  subscales?: NovoPsychSubscale[];
  safetyItemId?: string;
  safetyThreshold?: number;
  safetyMessage?: string;
  noteText?: string;
}

export function computeNovoPsychScore(
  test: NovoPsychTest,
  answers: Record<string, number>
): { total: number; subscaleScores: Record<string, number> } {
  const scored: Record<string, number> = {};
  for (const q of test.questions) {
    const raw = answers[q.id] ?? 0;
    scored[q.id] = q.reverseWith !== undefined ? q.reverseWith - raw : raw;
  }
  const vals = Object.values(scored);
  const sum = vals.reduce((s, v) => s + v, 0);
  const total = test.isAverage ? Math.round((sum / vals.length) * 100) / 100 : sum;

  const subscaleScores: Record<string, number> = {};
  for (const sub of test.subscales ?? []) {
    const subVals = sub.questionIds.map(id => scored[id] ?? 0);
    const subSum = subVals.reduce((s, v) => s + v, 0);
    subscaleScores[sub.key] = sub.isAverage
      ? Math.round((subSum / subVals.length) * 100) / 100
      : subSum;
  }
  return { total, subscaleScores };
}

export function getNovoPsychCutoff(cutoffs: NovoPsychCutoff[], score: number): NovoPsychCutoff {
  const sorted = [...cutoffs].sort((a, b) => b.minScore - a.minScore);
  return sorted.find(c => score >= c.minScore) ?? sorted[sorted.length - 1];
}

export function getNovoPsychTest(key: string): NovoPsychTest | undefined {
  return NOVOPSYCH_TESTS.find(t => t.key === key);
}

// ═══════════════════════════════════════════
// 1. PHQ-9
// ═══════════════════════════════════════════
const PHQ9: NovoPsychTest = {
  key: 'phq9', title: 'PHQ-9 — Depressão', shortTitle: 'PHQ-9',
  reference: 'Kroenke, Spitzer & Williams (2001). J Gen Intern Med.',
  items: 9, estimatedMinutes: 2,
  description: 'Rastreio de sintomas depressivos nas últimas 2 semanas.',
  instruction: 'Durante as últimas 2 semanas, com que frequência você foi incomodado/a pelos problemas abaixo?',
  options: [
    { value: 0, label: 'Nenhuma vez' },
    { value: 1, label: 'Vários dias' },
    { value: 2, label: 'Mais da metade dos dias' },
    { value: 3, label: 'Quase todos os dias' },
  ],
  questions: [
    { id: 'phq9_1', text: 'Pouco interesse ou prazer em fazer as coisas' },
    { id: 'phq9_2', text: 'Se sentir para baixo, deprimido/a ou sem perspectiva' },
    { id: 'phq9_3', text: 'Dificuldade para adormecer ou permanecer dormindo, ou dormir mais do que de costume' },
    { id: 'phq9_4', text: 'Se sentir cansado/a ou com pouca energia' },
    { id: 'phq9_5', text: 'Falta de apetite ou comendo demais' },
    { id: 'phq9_6', text: 'Se sentir mal consigo mesmo/a — ou achar que é um fracasso ou que decepcionou sua família' },
    { id: 'phq9_7', text: 'Dificuldade para se concentrar nas coisas, como ler ou ver televisão' },
    { id: 'phq9_8', text: 'Lentidão para se movimentar ou falar, ou ficar tão agitado/a que você se movia muito mais do que de costume' },
    { id: 'phq9_9', text: 'Pensar em se machucar de alguma maneira ou que seria melhor estar morto/a' },
  ],
  cutoffs: [
    { minScore: 0, label: 'Sintomas mínimos', description: 'Poucos ou nenhum sintoma depressivo. Monitorar se persistir.', color: 'green' },
    { minScore: 5, label: 'Sintomas leves', description: 'Sintomas leves. Observar e reavaliar em 2-4 semanas.', color: 'yellow' },
    { minScore: 10, label: 'Depressão moderada', description: 'Sintomas moderados. Plano de tratamento e acompanhamento indicados.', color: 'amber' },
    { minScore: 15, label: 'Depressão moderadamente severa', description: 'Sintomas significativos. Tratamento ativo recomendado.', color: 'red' },
    { minScore: 20, label: 'Depressão severa', description: 'Sintomas severos. Encaminhamento a especialista fortemente indicado.', color: 'red', isAlert: true },
  ],
  safetyItemId: 'phq9_9', safetyThreshold: 1,
  safetyMessage: 'Você sinalizou pensamentos de se machucar. Se estiver em crise, ligue para o CVV: 188 (24h, gratuito). Este resultado merece atenção profissional imediata.',
};

// ═══════════════════════════════════════════
// 2. ASRS-6
// ═══════════════════════════════════════════
const ASRS6: NovoPsychTest = {
  key: 'asrs6', title: 'ASRS-6 — Rastreio de TDAH', shortTitle: 'ASRS-6',
  reference: 'Kessler et al. (2005). Psychological Medicine. OMS.',
  items: 6, estimatedMinutes: 2,
  description: 'Rastreio de sintomas de TDAH nos últimos 6 meses.',
  instruction: 'Com que frequência você experimentou os seguintes problemas nos últimos 6 meses?',
  options: [
    { value: 0, label: 'Nunca' },
    { value: 1, label: 'Raramente' },
    { value: 2, label: 'Às vezes' },
    { value: 3, label: 'Frequentemente' },
    { value: 4, label: 'Muito frequentemente' },
  ],
  questions: [
    { id: 'asrs_1', text: 'Com que frequência você tem dificuldade em concluir os detalhes finais de um projeto, depois que a parte mais difícil já foi feita?' },
    { id: 'asrs_2', text: 'Com que frequência você tem dificuldade em colocar as coisas em ordem quando precisa realizar uma tarefa que exige organização?' },
    { id: 'asrs_3', text: 'Com que frequência você tem problemas para lembrar compromissos ou obrigações?' },
    { id: 'asrs_4', text: 'Quando você tem uma tarefa que exige muito raciocínio, com que frequência você evita ou adia começar?' },
    { id: 'asrs_5', text: 'Com que frequência você se mexe ou remexe as mãos ou os pés quando precisa ficar sentado/a por muito tempo?' },
    { id: 'asrs_6', text: 'Com que frequência você se sente excessivamente ativo/a e compelido/a a fazer coisas, como se estivesse sendo movido/a por um motor?' },
  ],
  cutoffs: [
    { minScore: 0, label: 'Baixo', description: 'Poucos indicadores de TDAH no rastreio.', color: 'green' },
    { minScore: 10, label: 'Moderado', description: 'Alguns indicadores presentes. Investigação adicional pode ser útil.', color: 'yellow' },
    { minScore: 14, label: 'Alto', description: 'Indicadores significativos. Avaliação clínica especializada indicada.', color: 'amber' },
    { minScore: 18, label: 'Muito alto', description: 'Indicadores muito significativos. Encaminhamento a especialista em TDAH recomendado.', color: 'red' },
  ],
};

// ═══════════════════════════════════════════
// 3. DERS-16
// ═══════════════════════════════════════════
const DERS16: NovoPsychTest = {
  key: 'ders16', title: 'DERS-16 — Regulação Emocional', shortTitle: 'DERS-16',
  reference: 'Bjureberg et al. (2016). J Psychopathol Behav Assess.',
  items: 16, estimatedMinutes: 3,
  description: 'Avalia dificuldades de regulação emocional.',
  instruction: 'Com que frequência as seguintes afirmações se aplicam a você?',
  options: [
    { value: 1, label: 'Quase nunca (1-10%)' },
    { value: 2, label: 'Às vezes (11-35%)' },
    { value: 3, label: 'Metade do tempo (36-65%)' },
    { value: 4, label: 'Na maioria das vezes (66-90%)' },
    { value: 5, label: 'Quase sempre (91-100%)' },
  ],
  questions: [
    { id: 'ders_1', text: 'Fico confuso/a sobre como me sinto' },
    { id: 'ders_2', text: 'Tenho dificuldade em compreender meus sentimentos' },
    { id: 'ders_3', text: 'Quando estou perturbado/a, tenho dificuldade em realizar tarefas' },
    { id: 'ders_4', text: 'Quando estou perturbado/a, perco o controle' },
    { id: 'ders_5', text: 'Quando estou perturbado/a, acredito que ficaria muito deprimido/a' },
    { id: 'ders_6', text: 'Quando estou perturbado/a, acredito que não há nada que eu possa fazer para me sentir melhor' },
    { id: 'ders_7', text: 'Quando estou perturbado/a, tenho dificuldade em me concentrar em outras coisas' },
    { id: 'ders_8', text: 'Quando estou perturbado/a, sinto que perco o controle' },
    { id: 'ders_9', text: 'Quando estou perturbado/a, sinto vergonha de mim mesmo/a por me sentir assim' },
    { id: 'ders_10', text: 'Quando estou perturbado/a, sinto que sou fraco/a' },
    { id: 'ders_11', text: 'Quando estou perturbado/a, tenho dificuldade em controlar meu comportamento' },
    { id: 'ders_12', text: 'Quando estou perturbado/a, acredito que não posso fazer nada para controlar meus sentimentos' },
    { id: 'ders_13', text: 'Quando estou perturbado/a, fico irritado/a comigo mesmo/a por me sentir assim' },
    { id: 'ders_14', text: 'Quando estou perturbado/a, sinto que vou ficar muito tempo assim' },
    { id: 'ders_15', text: 'Quando estou perturbado/a, tenho dificuldade em me concentrar' },
    { id: 'ders_16', text: 'Quando estou perturbado/a, demoro muito para me sentir melhor' },
  ],
  cutoffs: [
    { minScore: 16, label: 'Muito baixo', description: 'Boa capacidade de regulação emocional.', color: 'green' },
    { minScore: 28, label: 'Baixo', description: 'Regulação emocional dentro da faixa normal.', color: 'green' },
    { minScore: 39, label: 'Médio', description: 'Algumas dificuldades. Estratégias de manejo emocional podem ajudar.', color: 'yellow' },
    { minScore: 54, label: 'Alto', description: 'Dificuldades significativas. Acompanhamento psicológico indicado.', color: 'amber' },
    { minScore: 67, label: 'Muito alto', description: 'Dificuldades acentuadas. Intervenção terapêutica focada em regulação emocional recomendada.', color: 'red' },
  ],
  subscales: [
    { key: 'clareza', label: 'Clareza emocional', questionIds: ['ders_1', 'ders_2'] },
    { key: 'objetivos', label: 'Foco em objetivos', questionIds: ['ders_3', 'ders_7', 'ders_15'] },
    { key: 'impulso', label: 'Controle de impulso', questionIds: ['ders_4', 'ders_8', 'ders_11'] },
    { key: 'nao_aceitacao', label: 'Não-aceitação emocional', questionIds: ['ders_9', 'ders_10', 'ders_13'] },
    { key: 'estrategias', label: 'Acesso a estratégias', questionIds: ['ders_5', 'ders_6', 'ders_12', 'ders_14', 'ders_16'] },
  ],
};

// ═══════════════════════════════════════════
// 4. PSS-10
// ═══════════════════════════════════════════
const PSS10: NovoPsychTest = {
  key: 'pss10', title: 'PSS-10 — Estresse Percebido', shortTitle: 'PSS-10',
  reference: 'Cohen, Kamarck & Mermelstein (1983). J Health Soc Behav.',
  items: 10, estimatedMinutes: 2,
  description: 'Avalia o nível de estresse percebido no último mês.',
  instruction: 'No último mês, com que frequência você se sentiu dessa forma?',
  options: [
    { value: 0, label: 'Nunca' },
    { value: 1, label: 'Quase nunca' },
    { value: 2, label: 'Às vezes' },
    { value: 3, label: 'Frequentemente' },
    { value: 4, label: 'Muito frequentemente' },
  ],
  questions: [
    { id: 'pss_1', text: 'Com que frequência você ficou perturbado/a por algo que aconteceu inesperadamente?' },
    { id: 'pss_2', text: 'Com que frequência você sentiu que não conseguia controlar coisas importantes da sua vida?' },
    { id: 'pss_3', text: 'Com que frequência você se sentiu nervoso/a e estressado/a?' },
    { id: 'pss_4', text: 'Com que frequência você se sentiu confiante na sua capacidade de lidar com seus problemas pessoais?', reverseWith: 4 },
    { id: 'pss_5', text: 'Com que frequência você sentiu que as coisas estavam indo do seu jeito?', reverseWith: 4 },
    { id: 'pss_6', text: 'Com que frequência você percebeu que não conseguia dar conta de tudo o que tinha pra fazer?' },
    { id: 'pss_7', text: 'Com que frequência você conseguiu controlar as irritações da sua vida?', reverseWith: 4 },
    { id: 'pss_8', text: 'Com que frequência você sentiu que estava no controle das coisas?', reverseWith: 4 },
    { id: 'pss_9', text: 'Com que frequência você ficou com raiva por causa de coisas fora do seu controle?' },
    { id: 'pss_10', text: 'Com que frequência você sentiu que as dificuldades estavam se acumulando tanto que não conseguia superá-las?' },
  ],
  cutoffs: [
    { minScore: 0, label: 'Estresse baixo', description: 'Nível de estresse dentro da faixa normal.', color: 'green' },
    { minScore: 14, label: 'Estresse moderado', description: 'Nível moderado. Atenção ao equilíbrio e estratégias de manejo.', color: 'yellow' },
    { minScore: 27, label: 'Estresse alto', description: 'Nível elevado. Cuidado com saúde física e mental. Acompanhamento indicado.', color: 'red' },
  ],
  subscales: [
    { key: 'desamparo', label: 'Desamparo percebido', questionIds: ['pss_1', 'pss_2', 'pss_3', 'pss_6', 'pss_9', 'pss_10'] },
    { key: 'autoeficacia', label: 'Autoeficácia percebida', questionIds: ['pss_4', 'pss_5', 'pss_7', 'pss_8'] },
  ],
};

// ═══════════════════════════════════════════
// 5. ACE-Q
// ═══════════════════════════════════════════
const ACEQ: NovoPsychTest = {
  key: 'aceq', title: 'ACE-Q — Experiências Adversas na Infância', shortTitle: 'ACE-Q',
  reference: 'Felitti et al. (1998). Am J Prev Med. CDC/Kaiser Permanente.',
  items: 10, estimatedMinutes: 2,
  description: 'Avalia experiências adversas vividas durante a infância e adolescência (primeiros 18 anos).',
  instruction: 'Enquanto você crescia, durante os primeiros 18 anos da sua vida:',
  noteText: 'Este questionário aborda temas sensíveis. Responda no seu próprio ritmo.',
  options: [
    { value: 0, label: 'Não' },
    { value: 1, label: 'Sim' },
  ],
  questions: [
    { id: 'ace_1', text: 'Um pai/mãe ou adulto da casa frequentemente xingou, insultou, humilhou você? Ou agiu de forma que você teve medo de ser fisicamente machucado/a?' },
    { id: 'ace_2', text: 'Um pai/mãe ou adulto da casa frequentemente bateu, empurrou ou machucou você fisicamente?' },
    { id: 'ace_3', text: 'Um adulto ou pessoa pelo menos 5 anos mais velha alguma vez tocou você de forma sexual ou tentou ter relação sexual com você?' },
    { id: 'ace_4', text: 'Você frequentemente sentiu que ninguém na sua família amava você ou que sua família não se apoiava?' },
    { id: 'ace_5', text: 'Você frequentemente não tinha o suficiente pra comer, roupas limpas, ou não tinha ninguém pra te proteger?' },
    { id: 'ace_6', text: 'Seus pais foram separados ou divorciados?' },
    { id: 'ace_7', text: 'Sua mãe ou madrasta era frequentemente agredida fisicamente ou ameaçada com arma?' },
    { id: 'ace_8', text: 'Você morou com alguém que bebia problematicamente ou usava drogas?' },
    { id: 'ace_9', text: 'Algum membro da sua casa era deprimido, tinha doença mental, ou tentou suicídio?' },
    { id: 'ace_10', text: 'Algum membro da sua casa foi preso?' },
  ],
  cutoffs: [
    { minScore: 0, label: 'Sem ACEs', description: 'Nenhuma experiência adversa reportada neste instrumento.', color: 'green' },
    { minScore: 1, label: 'Risco progressivo', description: '1-3 ACEs: cada experiência adversa aumenta o risco de dificuldades ao longo da vida. Considere apoio.', color: 'yellow' },
    { minScore: 4, label: 'Alto risco (ACE ≥ 4)', description: 'Limiar crítico. Risco significativamente aumentado para depressão, ansiedade e outros impactos. Apoio profissional fortemente indicado.', color: 'red', isAlert: true },
  ],
  subscales: [
    { key: 'abuso', label: 'Abuso', questionIds: ['ace_1', 'ace_2', 'ace_3'] },
    { key: 'negligencia', label: 'Negligência', questionIds: ['ace_4', 'ace_5'] },
    { key: 'disfuncao', label: 'Disfunção familiar', questionIds: ['ace_6', 'ace_7', 'ace_8', 'ace_9', 'ace_10'] },
  ],
};

// ═══════════════════════════════════════════
// 6. TIPI
// ═══════════════════════════════════════════
const TIPI: NovoPsychTest = {
  key: 'tipi', title: 'TIPI — Personalidade Big Five', shortTitle: 'TIPI',
  reference: 'Gosling, Rentfrow & Swann (2003). J Research in Personality.',
  items: 10, estimatedMinutes: 2,
  description: 'Rastreio rápido dos 5 grandes traços de personalidade.',
  instruction: 'Avalie o quanto o par de traços se aplica a você, mesmo que um se aplique mais que o outro.',
  isAverage: true, primaryDisplay: 'subscales',
  options: [
    { value: 1, label: 'Discordo totalmente' },
    { value: 2, label: 'Discordo moderadamente' },
    { value: 3, label: 'Discordo um pouco' },
    { value: 4, label: 'Neutro' },
    { value: 5, label: 'Concordo um pouco' },
    { value: 6, label: 'Concordo moderadamente' },
    { value: 7, label: 'Concordo totalmente' },
  ],
  questions: [
    { id: 'tipi_1', text: 'Extrovertido/a, entusiasmado/a' },
    { id: 'tipi_2', text: 'Crítico/a, briguento/a', reverseWith: 8 },
    { id: 'tipi_3', text: 'Confiável, autodisciplinado/a' },
    { id: 'tipi_4', text: 'Ansioso/a, facilmente perturbado/a', reverseWith: 8 },
    { id: 'tipi_5', text: 'Aberto/a a novas experiências, complexo/a' },
    { id: 'tipi_6', text: 'Reservado/a, quieto/a', reverseWith: 8 },
    { id: 'tipi_7', text: 'Simpático/a, caloroso/a' },
    { id: 'tipi_8', text: 'Desorganizado/a, descuidado/a', reverseWith: 8 },
    { id: 'tipi_9', text: 'Calmo/a, emocionalmente estável' },
    { id: 'tipi_10', text: 'Convencional, pouco criativo/a', reverseWith: 8 },
  ],
  cutoffs: [
    { minScore: 1, label: 'Perfil misto', description: 'Veja as subescalas para interpretação por dimensão.', color: 'green' },
  ],
  subscales: [
    { key: 'extroversao', label: 'Extroversão', questionIds: ['tipi_1', 'tipi_6'], isAverage: true },
    { key: 'amabilidade', label: 'Amabilidade', questionIds: ['tipi_2', 'tipi_7'], isAverage: true },
    { key: 'conscienciosidade', label: 'Conscienciosidade', questionIds: ['tipi_3', 'tipi_8'], isAverage: true },
    { key: 'estabilidade', label: 'Estabilidade Emocional', questionIds: ['tipi_4', 'tipi_9'], isAverage: true },
    { key: 'abertura', label: 'Abertura à Experiência', questionIds: ['tipi_5', 'tipi_10'], isAverage: true },
  ],
};

// ═══════════════════════════════════════════
// 7. PCL-5
// ═══════════════════════════════════════════
const PCL5: NovoPsychTest = {
  key: 'pcl5', title: 'PCL-5 — Rastreio de TEPT', shortTitle: 'PCL-5',
  reference: 'Weathers et al. (2013). VA National Center for PTSD.',
  items: 20, estimatedMinutes: 3,
  description: 'Avalia sintomas de transtorno de estresse pós-traumático no último mês.',
  instruction: 'Indique o quanto você foi incomodado/a por esse problema no último mês.',
  options: [
    { value: 0, label: 'De jeito nenhum' },
    { value: 1, label: 'Um pouco' },
    { value: 2, label: 'Moderadamente' },
    { value: 3, label: 'Bastante' },
    { value: 4, label: 'Extremamente' },
  ],
  questions: [
    { id: 'pcl5_1', text: 'Memórias repetidas, perturbadoras e indesejadas da experiência estressante?' },
    { id: 'pcl5_2', text: 'Sonhos repetidos e perturbadores sobre a experiência estressante?' },
    { id: 'pcl5_3', text: 'De repente sentir ou agir como se a experiência estressante estivesse acontecendo de novo?' },
    { id: 'pcl5_4', text: 'Sentir-se muito perturbado/a quando algo lhe fez lembrar da experiência estressante?' },
    { id: 'pcl5_5', text: 'Ter reações físicas intensas quando algo lhe fez lembrar da experiência estressante?' },
    { id: 'pcl5_6', text: 'Evitar memórias, pensamentos ou sentimentos relacionados à experiência estressante?' },
    { id: 'pcl5_7', text: 'Evitar coisas externas que lhe fazem lembrar da experiência estressante?' },
    { id: 'pcl5_8', text: 'Dificuldade em lembrar de partes importantes da experiência estressante?' },
    { id: 'pcl5_9', text: 'Ter crenças negativas intensas sobre si mesmo/a, outras pessoas ou o mundo?' },
    { id: 'pcl5_10', text: 'Culpar a si mesmo/a ou outra pessoa pela experiência estressante?' },
    { id: 'pcl5_11', text: 'Ter sentimentos negativos intensos como medo, horror, raiva, culpa ou vergonha?' },
    { id: 'pcl5_12', text: 'Perda de interesse em atividades que você costumava gostar?' },
    { id: 'pcl5_13', text: 'Sentir-se distante ou isolado/a de outras pessoas?' },
    { id: 'pcl5_14', text: 'Dificuldade em experimentar sentimentos positivos?' },
    { id: 'pcl5_15', text: 'Comportamento irritável, acessos de raiva ou agir agressivamente?' },
    { id: 'pcl5_16', text: 'Correr riscos excessivos ou fazer coisas que poderiam lhe causar dano?' },
    { id: 'pcl5_17', text: 'Estar "superalerta", vigilante ou de guarda?' },
    { id: 'pcl5_18', text: 'Sentir-se nervoso/a ou assustar-se facilmente?' },
    { id: 'pcl5_19', text: 'Ter dificuldade de concentração?' },
    { id: 'pcl5_20', text: 'Ter dificuldade para adormecer ou permanecer dormindo?' },
  ],
  cutoffs: [
    { minScore: 0, label: 'Subcrítico', description: 'Sintomas abaixo do limiar clínico de TEPT.', color: 'green' },
    { minScore: 31, label: 'Provável TEPT', description: 'Score acima do limiar internacional (≥31). Avaliação clínica recomendada.', color: 'amber' },
    { minScore: 36, label: 'Provável TEPT (critério BR)', description: 'Score acima do limiar validado para o Brasil (≥36). Encaminhamento a especialista indicado.', color: 'red', isAlert: true },
  ],
  subscales: [
    { key: 'intrusao', label: 'Intrusão', questionIds: ['pcl5_1','pcl5_2','pcl5_3','pcl5_4','pcl5_5'] },
    { key: 'evitacao', label: 'Evitação', questionIds: ['pcl5_6','pcl5_7'] },
    { key: 'cognicao', label: 'Cognição/Humor negativos', questionIds: ['pcl5_8','pcl5_9','pcl5_10','pcl5_11','pcl5_12','pcl5_13','pcl5_14'] },
    { key: 'excitacao', label: 'Hiperexcitabilidade', questionIds: ['pcl5_15','pcl5_16','pcl5_17','pcl5_18','pcl5_19','pcl5_20'] },
  ],
};

// ═══════════════════════════════════════════
// 8. MAIA-2
// ═══════════════════════════════════════════
const MAIA2: NovoPsychTest = {
  key: 'maia2', title: 'MAIA-2 — Consciência Interoceptiva', shortTitle: 'MAIA-2',
  reference: 'Mehling et al. (2018). PLOS ONE.',
  items: 37, estimatedMinutes: 6,
  description: 'Avalia a capacidade de perceber e usar sinais corporais internos.',
  instruction: 'Com que frequência cada afirmação se aplica a você em geral no dia a dia?',
  isAverage: true, primaryDisplay: 'subscales',
  options: [
    { value: 0, label: 'Nunca' },
    { value: 1, label: 'Raramente' },
    { value: 2, label: 'Às vezes' },
    { value: 3, label: 'Frequentemente' },
    { value: 4, label: 'Muito frequentemente' },
    { value: 5, label: 'Sempre' },
  ],
  questions: [
    { id: 'maia_1', text: 'Quando estou tenso/a, percebo onde está a tensão no meu corpo' },
    { id: 'maia_2', text: 'Percebo quando estou desconfortável no meu corpo' },
    { id: 'maia_3', text: 'Percebo onde no meu corpo estou confortável' },
    { id: 'maia_4', text: 'Percebo mudanças na minha respiração, como se ela desacelera ou acelera' },
    { id: 'maia_5', text: 'Ignoro tensão física ou desconforto até que se tornem mais severos', reverseWith: 5 },
    { id: 'maia_6', text: 'Me distraio de sensações de desconforto', reverseWith: 5 },
    { id: 'maia_7', text: 'Quando sinto dor ou desconforto, tento superar na força', reverseWith: 5 },
    { id: 'maia_8', text: 'Tento ignorar a dor', reverseWith: 5 },
    { id: 'maia_9', text: 'Afasto sentimentos de desconforto focando em outra coisa', reverseWith: 5 },
    { id: 'maia_10', text: 'Quando sinto sensações corporais desagradáveis, me ocupo com outra coisa pra não ter que senti-las', reverseWith: 5 },
    { id: 'maia_11', text: 'Quando sinto dor física, fico perturbado/a', reverseWith: 5 },
    { id: 'maia_12', text: 'Começo a me preocupar que algo está errado se sinto qualquer desconforto', reverseWith: 5 },
    { id: 'maia_13', text: 'Consigo perceber uma sensação corporal desagradável sem me preocupar com ela' },
    { id: 'maia_14', text: 'Consigo ficar calmo/a e não me preocupar quando tenho sensações de desconforto ou dor' },
    { id: 'maia_15', text: 'Quando estou desconfortável ou com dor, não consigo tirar isso da cabeça', reverseWith: 5 },
    { id: 'maia_16', text: 'Consigo prestar atenção na minha respiração sem me distrair com coisas ao redor' },
    { id: 'maia_17', text: 'Consigo manter consciência das minhas sensações corporais internas mesmo quando há muita coisa acontecendo ao redor' },
    { id: 'maia_18', text: 'Quando estou conversando com alguém, consigo prestar atenção na minha postura' },
    { id: 'maia_19', text: 'Consigo retornar a consciência ao meu corpo se estiver distraído/a' },
    { id: 'maia_20', text: 'Consigo redirecionar minha atenção do pensamento para sentir meu corpo' },
    { id: 'maia_21', text: 'Consigo manter consciência do meu corpo inteiro mesmo quando uma parte está com dor' },
    { id: 'maia_22', text: 'Consigo focar conscientemente no meu corpo como um todo' },
    { id: 'maia_23', text: 'Percebo como meu corpo muda quando estou com raiva' },
    { id: 'maia_24', text: 'Quando algo está errado na minha vida, consigo sentir no meu corpo' },
    { id: 'maia_25', text: 'Percebo que meu corpo se sente diferente após uma experiência pacífica' },
    { id: 'maia_26', text: 'Percebo que minha respiração fica livre e fácil quando me sinto confortável' },
    { id: 'maia_27', text: 'Percebo como meu corpo muda quando me sinto feliz/alegre' },
    { id: 'maia_28', text: 'Quando me sinto sobrecarregado/a, consigo encontrar um lugar calmo dentro de mim' },
    { id: 'maia_29', text: 'Quando trago consciência ao meu corpo, sinto uma sensação de calma' },
    { id: 'maia_30', text: 'Consigo usar minha respiração para reduzir tensão' },
    { id: 'maia_31', text: 'Quando estou preso/a em pensamentos, consigo acalmar minha mente focando no corpo/respiração' },
    { id: 'maia_32', text: 'Escuto informação do meu corpo sobre meu estado emocional' },
    { id: 'maia_33', text: 'Quando estou perturbado/a, tiro um tempo pra explorar como meu corpo se sente' },
    { id: 'maia_34', text: 'Escuto meu corpo para me informar sobre o que fazer' },
    { id: 'maia_35', text: 'Estou em casa no meu corpo' },
    { id: 'maia_36', text: 'Sinto que meu corpo é um lugar seguro' },
    { id: 'maia_37', text: 'Confio nas minhas sensações corporais' },
  ],
  cutoffs: [
    { minScore: 0, label: 'Baixo', description: 'Score médio abaixo de 2.2 — possível déficit na consciência interoceptiva.', color: 'yellow' },
    { minScore: 2.2, label: 'Médio', description: 'Score próximo à norma da população.', color: 'green' },
    { minScore: 3.5, label: 'Alto', description: 'Boa conexão corpo-mente.', color: 'green' },
  ],
  subscales: [
    { key: 'noticing', label: 'Percepção corporal', questionIds: ['maia_1','maia_2','maia_3','maia_4'], isAverage: true },
    { key: 'not_distracting', label: 'Não-distração', questionIds: ['maia_5','maia_6','maia_7','maia_8','maia_9','maia_10'], isAverage: true },
    { key: 'not_worrying', label: 'Não-preocupação', questionIds: ['maia_11','maia_12','maia_13','maia_14','maia_15'], isAverage: true },
    { key: 'attention', label: 'Regulação da atenção', questionIds: ['maia_16','maia_17','maia_18','maia_19','maia_20','maia_21','maia_22'], isAverage: true },
    { key: 'emotional', label: 'Consciência emocional', questionIds: ['maia_23','maia_24','maia_25','maia_26','maia_27'], isAverage: true },
    { key: 'self_reg', label: 'Autorregulação', questionIds: ['maia_28','maia_29','maia_30','maia_31'], isAverage: true },
    { key: 'body_listening', label: 'Escuta corporal', questionIds: ['maia_32','maia_33','maia_34'], isAverage: true },
    { key: 'trusting', label: 'Confiança corporal', questionIds: ['maia_35','maia_36','maia_37'], isAverage: true },
  ],
};

// ═══════════════════════════════════════════
// 9. CFI
// ═══════════════════════════════════════════
const CFI: NovoPsychTest = {
  key: 'cfi', title: 'CFI — Flexibilidade Cognitiva', shortTitle: 'CFI',
  reference: 'Dennis & Vander Wal (2010). Cognitive Therapy and Research.',
  items: 20, estimatedMinutes: 3,
  description: 'Avalia a capacidade de pensar de forma flexível diante de situações difíceis.',
  instruction: 'Avalie o quanto você concorda ou discorda de cada afirmação.',
  higherIsBetter: true,
  options: [
    { value: 1, label: 'Discordo totalmente' },
    { value: 2, label: 'Discordo' },
    { value: 3, label: 'Discordo levemente' },
    { value: 4, label: 'Neutro' },
    { value: 5, label: 'Concordo levemente' },
    { value: 6, label: 'Concordo' },
    { value: 7, label: 'Concordo totalmente' },
  ],
  questions: [
    { id: 'cfi_1', text: 'Sou bom/boa em avaliar situações' },
    { id: 'cfi_2', text: 'Considero múltiplas opções antes de tomar uma decisão' },
    { id: 'cfi_3', text: 'Gosto de olhar situações difíceis de muitos ângulos diferentes' },
    { id: 'cfi_4', text: 'Busco informação adicional antes de atribuir causas ao comportamento' },
    { id: 'cfi_5', text: 'Tento pensar nas coisas do ponto de vista de outra pessoa' },
    { id: 'cfi_6', text: 'Sou bom/boa em me colocar no lugar dos outros' },
    { id: 'cfi_7', text: 'É importante olhar situações difíceis de muitos ângulos' },
    { id: 'cfi_8', text: 'Em situações difíceis, considero múltiplas opções antes de decidir como agir' },
    { id: 'cfi_9', text: 'Frequentemente olho uma situação de diferentes pontos de vista' },
    { id: 'cfi_10', text: 'Considero todos os fatos disponíveis ao atribuir causas ao comportamento' },
    { id: 'cfi_11', text: 'Quando encontro situações difíceis, paro e penso em várias formas de resolvê-las' },
    { id: 'cfi_12', text: 'Consigo pensar em mais de uma forma de resolver uma situação difícil' },
    { id: 'cfi_13', text: 'Considero múltiplas opções antes de responder a situações difíceis' },
    { id: 'cfi_14', text: 'Tenho dificuldade em tomar decisões diante de situações difíceis', reverseWith: 8 },
    { id: 'cfi_15', text: 'Quando encontro situações difíceis, sinto que estou perdendo o controle', reverseWith: 8 },
    { id: 'cfi_16', text: 'Ao encontrar situações difíceis, fico tão estressado/a que não consigo pensar em soluções', reverseWith: 8 },
    { id: 'cfi_17', text: 'Acho incomodo que existam tantas formas diferentes de lidar com situações difíceis', reverseWith: 8 },
    { id: 'cfi_18', text: 'Quando encontro situações difíceis, simplesmente não sei o que fazer', reverseWith: 8 },
    { id: 'cfi_19', text: 'Sou capaz de superar as dificuldades que enfrento na vida' },
    { id: 'cfi_20', text: 'Sinto que não tenho poder para mudar as coisas em situações difíceis', reverseWith: 8 },
  ],
  cutoffs: [
    { minScore: 20, label: 'Inflexibilidade significativa', description: 'Flexibilidade cognitiva muito limitada — alvo prioritário para intervenção (abaixo do percentil 25).', color: 'red' },
    { minScore: 60, label: 'Abaixo da média', description: 'Flexibilidade cognitiva abaixo do esperado.', color: 'yellow' },
    { minScore: 80, label: 'Médio', description: 'Flexibilidade cognitiva dentro da média populacional.', color: 'green' },
    { minScore: 110, label: 'Acima da média', description: 'Boa flexibilidade cognitiva.', color: 'green' },
  ],
  subscales: [
    { key: 'alternativas', label: 'Percepção de alternativas', questionIds: ['cfi_1','cfi_2','cfi_3','cfi_4','cfi_5','cfi_6','cfi_7','cfi_8','cfi_9','cfi_10','cfi_11','cfi_12','cfi_13'] },
    { key: 'controle', label: 'Controle percebido', questionIds: ['cfi_14','cfi_15','cfi_16','cfi_17','cfi_18','cfi_19','cfi_20'] },
  ],
};

// ═══════════════════════════════════════════
// 10. SWAN
// ═══════════════════════════════════════════
const SWAN: NovoPsychTest = {
  key: 'swan', title: 'SWAN — TDAH: Forças e Fraquezas', shortTitle: 'SWAN',
  reference: 'Swanson et al. (2006). Int J Educ Psychol Assess.',
  items: 18, estimatedMinutes: 3,
  description: 'Avalia o contínuo de forças e fraquezas relacionadas ao TDAH.',
  instruction: 'Comparada com outras crianças da mesma idade, quão bem esta criança consegue...',
  noteText: 'Instrumento desenvolvido para pais/responsáveis responderem sobre crianças e adolescentes.',
  options: [
    { value: 0, label: 'Muito acima da média (força)' },
    { value: 1, label: 'Acima da média' },
    { value: 2, label: 'Levemente acima da média' },
    { value: 3, label: 'Média' },
    { value: 4, label: 'Levemente abaixo da média' },
    { value: 5, label: 'Abaixo da média' },
    { value: 6, label: 'Muito abaixo da média (dificuldade)' },
  ],
  questions: [
    { id: 'swan_1', text: 'Prestar atenção aos detalhes e evitar erros por descuido' },
    { id: 'swan_2', text: 'Manter atenção em tarefas ou atividades lúdicas' },
    { id: 'swan_3', text: 'Escutar quando falam diretamente com ela' },
    { id: 'swan_4', text: 'Seguir instruções e terminar trabalhos escolares/tarefas' },
    { id: 'swan_5', text: 'Organizar tarefas e atividades' },
    { id: 'swan_6', text: 'Engajar em tarefas que exigem esforço mental sustentado' },
    { id: 'swan_7', text: 'Manter o controle de coisas necessárias para atividades' },
    { id: 'swan_8', text: 'Ignorar estímulos estranhos' },
    { id: 'swan_9', text: 'Lembrar de atividades diárias' },
    { id: 'swan_10', text: 'Ficar parado/a (controlar movimentos de mãos/pés)' },
    { id: 'swan_11', text: 'Permanecer sentado/a quando exigido' },
    { id: 'swan_12', text: 'Modular atividade motora (inibir correr/escalar inapropriado)' },
    { id: 'swan_13', text: 'Brincar quietamente (manter nível de ruído razoável)' },
    { id: 'swan_14', text: 'Se acalmar e descansar (controlar atividade constante)' },
    { id: 'swan_15', text: 'Modular atividade verbal (controlar fala excessiva)' },
    { id: 'swan_16', text: 'Refletir sobre perguntas (controlar respostas impulsivas)' },
    { id: 'swan_17', text: 'Esperar sua vez (ficar na fila, alternar)' },
    { id: 'swan_18', text: 'Entrar em conversas e jogos (controlar interrupções)' },
  ],
  cutoffs: [
    { minScore: 0, label: 'Acima da média', description: 'Score baixo indica muitas forças. Padrão típico sem dificuldades de TDAH.', color: 'green' },
    { minScore: 25, label: 'Indicadores de preocupação', description: 'Score acima do limiar. Avaliação clínica por especialista em TDAH recomendada.', color: 'red' },
  ],
  subscales: [
    { key: 'desatencao', label: 'Desatenção', questionIds: ['swan_1','swan_2','swan_3','swan_4','swan_5','swan_6','swan_7','swan_8','swan_9'] },
    { key: 'hiperatividade', label: 'Hiperatividade/Impulsividade', questionIds: ['swan_10','swan_11','swan_12','swan_13','swan_14','swan_15','swan_16','swan_17','swan_18'] },
  ],
};

// ═══════════════════════════════════════════
// 11. BRS
// ═══════════════════════════════════════════
const BRS: NovoPsychTest = {
  key: 'brs', title: 'BRS — Resiliência', shortTitle: 'BRS',
  reference: 'Smith et al. (2008). Int J Behav Med.',
  items: 6, estimatedMinutes: 1,
  description: 'Avalia a capacidade de se recuperar após adversidades.',
  instruction: 'Indique o quanto você concorda com cada afirmação.',
  isAverage: true, higherIsBetter: true,
  options: [
    { value: 1, label: 'Discordo totalmente' },
    { value: 2, label: 'Discordo' },
    { value: 3, label: 'Neutro' },
    { value: 4, label: 'Concordo' },
    { value: 5, label: 'Concordo totalmente' },
  ],
  questions: [
    { id: 'brs_1', text: 'Costumo me recuperar rapidamente após tempos difíceis' },
    { id: 'brs_2', text: 'Tenho dificuldade em superar eventos estressantes', reverseWith: 6 },
    { id: 'brs_3', text: 'Não demoro muito para me recuperar de um evento estressante' },
    { id: 'brs_4', text: 'É difícil pra mim me reerguer quando algo ruim acontece', reverseWith: 6 },
    { id: 'brs_5', text: 'Geralmente atravesso tempos difíceis com pouca dificuldade' },
    { id: 'brs_6', text: 'Costumo demorar muito para superar contratempos na minha vida', reverseWith: 6 },
  ],
  cutoffs: [
    { minScore: 1, label: 'Baixa resiliência', description: 'Dificuldade significativa em se recuperar após adversidades. Apoio psicológico pode ser muito útil.', color: 'red' },
    { minScore: 3, label: 'Resiliência normal', description: 'Capacidade de recuperação dentro da faixa esperada.', color: 'green' },
    { minScore: 4.31, label: 'Alta resiliência', description: 'Forte capacidade de se recuperar de dificuldades.', color: 'green' },
  ],
};

// ═══════════════════════════════════════════
// 12. CAT-Q
// ═══════════════════════════════════════════
const CATQ: NovoPsychTest = {
  key: 'catq', title: 'CAT-Q — Mascaramento Autista', shortTitle: 'CAT-Q',
  reference: 'Hull et al. (2019). J Autism Dev Disord.',
  items: 25, estimatedMinutes: 4,
  description: 'Avalia estratégias de camuflagem de traços autistas em situações sociais.',
  instruction: 'Indique o quanto você concorda ou discorda de cada afirmação.',
  options: [
    { value: 1, label: 'Discordo totalmente' },
    { value: 2, label: 'Discordo bastante' },
    { value: 3, label: 'Discordo levemente' },
    { value: 4, label: 'Neutro' },
    { value: 5, label: 'Concordo levemente' },
    { value: 6, label: 'Concordo bastante' },
    { value: 7, label: 'Concordo totalmente' },
  ],
  questions: [
    { id: 'catq_1', text: 'Quando interajo com alguém, deliberadamente copio sua linguagem corporal ou expressões faciais' },
    { id: 'catq_2', text: 'Monitoro minha linguagem corporal ou expressões faciais para parecer relaxado/a' },
    { id: 'catq_3', text: 'Raramente sinto necessidade de encenar para conseguir lidar com uma situação social', reverseWith: 8 },
    { id: 'catq_4', text: 'Aprendo como as pessoas usam seus corpos e rostos para interagir assistindo TV/filmes ou lendo ficção' },
    { id: 'catq_5', text: 'Tentei melhorar minha compreensão de habilidades sociais observando outras pessoas' },
    { id: 'catq_6', text: 'Ajusto minha linguagem corporal ou expressões faciais para parecer interessado/a pela pessoa com quem interajo' },
    { id: 'catq_7', text: 'Em situações sociais, sinto que estou "atuando" em vez de sendo eu mesmo/a' },
    { id: 'catq_8', text: 'Repito frases que ouvi outros dizerem exatamente da mesma forma que ouvi pela primeira vez' },
    { id: 'catq_9', text: 'Sempre penso na impressão que causo nas outras pessoas' },
    { id: 'catq_10', text: 'Em situações sociais, tento encontrar formas de evitar interagir com outros' },
    { id: 'catq_11', text: 'Pratico minhas expressões faciais e linguagem corporal para garantir que pareçam naturais' },
    { id: 'catq_12', text: 'Não sinto necessidade de fazer contato visual com outras pessoas se não quiser', reverseWith: 8 },
    { id: 'catq_13', text: 'Em situações sociais, sinto que estou fingindo ser "normal"' },
    { id: 'catq_14', text: 'Passei tempo aprendendo habilidades sociais de programas de TV e filmes, e tento usá-las nas minhas interações' },
    { id: 'catq_15', text: 'Monitoro minha linguagem corporal ou expressões faciais para parecer interessado/a' },
    { id: 'catq_16', text: 'Preciso me forçar a interagir com pessoas quando estou em situações sociais' },
    { id: 'catq_17', text: 'Nas minhas interações sociais, uso comportamentos que aprendi observando outras pessoas interagindo' },
    { id: 'catq_18', text: 'Ajusto minha linguagem corporal ou expressões faciais para parecer relaxado/a' },
    { id: 'catq_19', text: 'Quando converso com outras pessoas, sinto que a conversa flui naturalmente', reverseWith: 8 },
    { id: 'catq_20', text: 'Pesquisei as regras de interação social para melhorar minhas habilidades sociais' },
    { id: 'catq_21', text: 'Estou sempre consciente da impressão que causo nas outras pessoas' },
    { id: 'catq_22', text: 'Sinto-me livre para ser eu mesmo/a quando estou com outras pessoas', reverseWith: 8 },
    { id: 'catq_23', text: 'Desenvolvi um roteiro para seguir em situações sociais' },
    { id: 'catq_24', text: 'Em interações sociais, não presto atenção ao que meu rosto ou corpo estão fazendo', reverseWith: 8 },
    { id: 'catq_25', text: 'Preciso do apoio de outras pessoas para socializar' },
  ],
  cutoffs: [
    { minScore: 25, label: 'Muito baixo', description: 'Percentil ≤5. Pouca ou nenhuma camuflagem detectada.', color: 'green' },
    { minScore: 52, label: 'Baixo', description: 'Percentil 6-24. Camuflagem abaixo da média.', color: 'green' },
    { minScore: 76, label: 'Moderado', description: 'Percentil 25-75. Camuflagem dentro da faixa típica.', color: 'yellow' },
    { minScore: 100, label: 'Limiar clínico', description: 'Score ≥100 — limiar sugerido para investigação de TEA.', color: 'amber' },
    { minScore: 113, label: 'Alto', description: 'Percentil 76-94. Camuflagem significativa. Avaliação especializada indicada.', color: 'red' },
  ],
  subscales: [
    { key: 'compensacao', label: 'Compensação', questionIds: ['catq_1','catq_4','catq_5','catq_8','catq_11','catq_14','catq_17','catq_20','catq_23'] },
    { key: 'masking', label: 'Masking (ocultação)', questionIds: ['catq_2','catq_6','catq_9','catq_12','catq_15','catq_18','catq_21','catq_24'] },
    { key: 'assimilacao', label: 'Assimilação', questionIds: ['catq_3','catq_7','catq_10','catq_13','catq_16','catq_19','catq_22','catq_25'] },
  ],
};

// ═══════════════════════════════════════════
// 13. UPPS-P
// ═══════════════════════════════════════════
const UPPSP: NovoPsychTest = {
  key: 'uppsp', title: 'UPPS-P — Comportamento Impulsivo', shortTitle: 'UPPS-P',
  reference: 'Lynam et al. (2006); Cyders et al. (2007). Psychological Assessment.',
  items: 59, estimatedMinutes: 10,
  description: 'Avalia 5 dimensões independentes de impulsividade.',
  instruction: 'Indique o quanto você concorda ou discorda de cada afirmação.',
  primaryDisplay: 'subscales',
  options: [
    { value: 1, label: 'Concordo totalmente' },
    { value: 2, label: 'Concordo um pouco' },
    { value: 3, label: 'Discordo um pouco' },
    { value: 4, label: 'Discordo totalmente' },
  ],
  questions: [
    { id: 'upps_1', text: 'Tenho uma atitude reservada e cautelosa em relação à vida' },
    { id: 'upps_2', text: 'Quando estou perturbado/a, frequentemente ajo sem pensar', reverseWith: 5 },
    { id: 'upps_3', text: 'Geralmente busco experiências e sensações novas e excitantes', reverseWith: 5 },
    { id: 'upps_4', text: 'Geralmente gosto de ver as coisas até o fim' },
    { id: 'upps_5', text: 'Quando estou de ótimo humor, tendo a entrar em situações que poderiam me causar problemas', reverseWith: 5 },
    { id: 'upps_6', text: 'Meu pensamento é geralmente cuidadoso e proposital' },
    { id: 'upps_7', text: 'Quando me sinto mal, frequentemente faço coisas que me arrependo depois para me sentir melhor agora', reverseWith: 5 },
    { id: 'upps_8', text: 'Toparia tentar qualquer coisa uma vez', reverseWith: 5 },
    { id: 'upps_9', text: 'Tendo a desistir facilmente', reverseWith: 5 },
    { id: 'upps_10', text: 'Quando estou muito feliz, tendo a fazer coisas que podem causar problemas na minha vida', reverseWith: 5 },
    { id: 'upps_11', text: 'Não sou do tipo que fala coisas sem pensar' },
    { id: 'upps_12', text: 'Tenho dificuldade em controlar meus impulsos', reverseWith: 5 },
    { id: 'upps_13', text: 'Gosto de esportes e jogos onde você precisa escolher sua próxima jogada muito rapidamente', reverseWith: 5 },
    { id: 'upps_14', text: 'Tarefas inacabadas realmente me incomodam' },
    { id: 'upps_15', text: 'Tendo a perder o controle quando estou de ótimo humor', reverseWith: 5 },
    { id: 'upps_16', text: 'Gosto de parar e pensar antes de agir' },
    { id: 'upps_17', text: 'Às vezes quando me sinto mal, não consigo parar o que estou fazendo mesmo que esteja me fazendo sentir pior', reverseWith: 5 },
    { id: 'upps_18', text: 'Gostaria de fazer esportes aquáticos radicais', reverseWith: 5 },
    { id: 'upps_19', text: 'Uma vez que começo algo, detesto parar' },
    { id: 'upps_20', text: 'Quando estou realmente empolgado/a, tendo a ficar fora de controle', reverseWith: 5 },
    { id: 'upps_21', text: 'Não gosto de começar um projeto até saber exatamente como proceder' },
    { id: 'upps_22', text: 'Quando me sinto alterado/a, costumo agir impulsivamente sem refletir', reverseWith: 5 },
    { id: 'upps_23', text: 'Gosto bastante de correr riscos', reverseWith: 5 },
    { id: 'upps_24', text: 'Me concentro facilmente' },
    { id: 'upps_25', text: 'Outros diriam que faço más escolhas quando estou extremamente feliz com algo', reverseWith: 5 },
    { id: 'upps_26', text: 'Gostaria de fazer salto de paraquedas', reverseWith: 5 },
    { id: 'upps_27', text: 'Termino o que começo' },
    { id: 'upps_28', text: 'Tendo a valorizar e seguir uma abordagem racional e sensata' },
    { id: 'upps_29', text: 'Quando me sinto rejeitado/a, frequentemente digo coisas que me arrependo depois', reverseWith: 5 },
    { id: 'upps_30', text: 'Outros ficam chocados com as coisas que faço quando estou muito empolgado/a', reverseWith: 5 },
    { id: 'upps_31', text: 'Aceito experiências novas e excitantes, mesmo que sejam um pouco assustadoras', reverseWith: 5 },
    { id: 'upps_32', text: 'Consigo me organizar para fazer as coisas no prazo' },
    { id: 'upps_33', text: 'Geralmente tomo minhas decisões através de raciocínio cuidadoso' },
    { id: 'upps_34', text: 'É difícil pra mim resistir a agir conforme meus sentimentos', reverseWith: 5 },
    { id: 'upps_35', text: 'Quando fico realmente feliz com algo, tendo a fazer coisas que podem ter más consequências', reverseWith: 5 },
    { id: 'upps_36', text: 'Gostaria de aprender a pilotar um avião', reverseWith: 5 },
    { id: 'upps_37', text: 'Sou uma pessoa que sempre termina o trabalho' },
    { id: 'upps_38', text: 'Sou uma pessoa cautelosa' },
    { id: 'upps_39', text: 'Frequentemente pioro as coisas porque ajo sem pensar quando estou perturbado/a', reverseWith: 5 },
    { id: 'upps_40', text: 'Quando estou muito contente, sinto que não consigo me impedir de exagerar', reverseWith: 5 },
    { id: 'upps_41', text: 'Às vezes gosto de fazer coisas que são um pouco assustadoras', reverseWith: 5 },
    { id: 'upps_42', text: 'Quase sempre termino projetos que começo' },
    { id: 'upps_43', text: 'Antes de entrar numa situação nova, gosto de descobrir o que esperar dela' },
    { id: 'upps_44', text: 'No calor de uma discussão, frequentemente digo coisas que me arrependo depois', reverseWith: 5 },
    { id: 'upps_45', text: 'Quando estou realmente empolgado/a, tendo a não pensar nas consequências das minhas ações', reverseWith: 5 },
    { id: 'upps_46', text: 'Gostaria de fazer esqui em alta velocidade', reverseWith: 5 },
    { id: 'upps_47', text: 'Às vezes tem tantas coisas pequenas pra fazer que eu simplesmente ignoro todas', reverseWith: 5 },
    { id: 'upps_48', text: 'Geralmente penso cuidadosamente antes de fazer qualquer coisa' },
    { id: 'upps_49', text: 'Tendo a agir sem pensar quando estou realmente empolgado/a', reverseWith: 5 },
    { id: 'upps_50', text: 'Quando me sinto mal, frequentemente me arrependo do que faço para me sentir melhor no momento', reverseWith: 5 },
    { id: 'upps_51', text: 'Gostaria de mergulhar com equipamento', reverseWith: 5 },
    { id: 'upps_52', text: 'Quando estou muito feliz, frequentemente me encontro em situações que normalmente me deixariam desconfortável', reverseWith: 5 },
    { id: 'upps_53', text: 'Às vezes tem tantas pequenas tarefas que eu simplesmente as ignoro todas' },
    { id: 'upps_54', text: 'Sempre mantenho meus sentimentos sob controle', reverseWith: 5 },
    { id: 'upps_55', text: 'Antes de me decidir, considero todas as vantagens e desvantagens' },
    { id: 'upps_56', text: 'Gostaria de dirigir em alta velocidade', reverseWith: 5 },
    { id: 'upps_57', text: 'Quando estou muito feliz, sinto que é ok ceder a desejos ou exagerar', reverseWith: 5 },
    { id: 'upps_58', text: 'Às vezes faço coisas impulsivas que me arrependo depois', reverseWith: 5 },
    { id: 'upps_59', text: 'Fico surpreso/a com as coisas que faço enquanto estou de ótimo humor', reverseWith: 5 },
  ],
  cutoffs: [
    { minScore: 59, label: 'Impulsividade baixa', description: 'Comportamento geralmente cauteloso e reflexivo.', color: 'green' },
    { minScore: 120, label: 'Impulsividade média', description: 'Padrão dentro da faixa típica.', color: 'yellow' },
    { minScore: 160, label: 'Impulsividade elevada', description: 'Score acima do percentil 75. Padrão impulsivo relevante.', color: 'amber' },
    { minScore: 200, label: 'Impulsividade clinicamente elevada', description: 'Score acima do percentil 90. Avaliação clínica especializada indicada.', color: 'red' },
  ],
  subscales: [
    { key: 'urg_neg', label: 'Urgência negativa', questionIds: ['upps_2','upps_7','upps_12','upps_17','upps_22','upps_29','upps_34','upps_39','upps_44','upps_50','upps_53','upps_58'], isAverage: true },
    { key: 'urg_pos', label: 'Urgência positiva', questionIds: ['upps_5','upps_10','upps_15','upps_20','upps_25','upps_30','upps_35','upps_40','upps_45','upps_49','upps_52','upps_54','upps_57','upps_59'], isAverage: true },
    { key: 'premeditacao', label: 'Falta de premeditação', questionIds: ['upps_1','upps_6','upps_11','upps_16','upps_21','upps_28','upps_33','upps_38','upps_43','upps_48','upps_55'], isAverage: true },
    { key: 'perseveranca', label: 'Falta de perseverança', questionIds: ['upps_4','upps_9','upps_14','upps_19','upps_24','upps_27','upps_32','upps_37','upps_42','upps_47'], isAverage: true },
    { key: 'sensacoes', label: 'Busca de sensações', questionIds: ['upps_3','upps_8','upps_13','upps_18','upps_23','upps_26','upps_31','upps_36','upps_41','upps_46','upps_51','upps_56'], isAverage: true },
  ],
};

export const NOVOPSYCH_TESTS: NovoPsychTest[] = [
  PHQ9, ASRS6, DERS16, PSS10, ACEQ, TIPI, PCL5, MAIA2, CFI, SWAN, BRS, CATQ, UPPSP,
];
