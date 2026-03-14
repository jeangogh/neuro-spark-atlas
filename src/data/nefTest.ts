// ═══════════════════════════════════════
// NEF Test — Data & Scoring Logic
// Extracted from NEF_TEST_v2.jsx
// ═══════════════════════════════════════

// ── Types ──

export interface Nef {
  id: string;
  name: string;
  color: string;
  desc: string;
  deep: string;
  direction: string;
}

export interface IntensityItem {
  id: string;
  nef: string;
  text: string;
}

export interface HierarchyItem {
  id: string;
  from: string;
  to: string;
  text: string;
}

export interface PainLabel {
  val: number;
  label: string;
}

export interface NefScore extends Nef {
  intensity: number;
  hierarchy: number;
  score: number;
}

export type IntensityAnswers = Record<string, number>;
export type HierarchyAnswers = Record<string, number>;

// ═══════════════════════════════════════
// DATA
// ═══════════════════════════════════════

export const NEFS: Nef[] = [
  { id: "N1", name: "Hesitação de Autovalor", color: "#f85149",
    desc: "Seu valor oscila violentamente entre extremos. Não existe uma versão estável de quem você é — depende do último resultado, do último feedback, do último olhar.",
    deep: "Você vive numa gangorra interna que nunca para. Num momento, se sente capaz de qualquer coisa — no próximo, não sabe se merece estar onde está. Essa oscilação não é 'falta de autoestima'. É algo mais antigo: em algum momento da sua história, o feedback sobre quem você era oscilava também. Alguém ora validava, ora destruía. Ou pior: a mesma pessoa fazia os dois no mesmo dia. Seu sistema nervoso aprendeu que não existe chão fixo — só gelo fino. E agora, adulto, cada elogio é recebido com desconfiança ('será verdade?') e cada crítica confirma o que você sempre suspeitou ('eu sabia'). O custo dessa oscilação é imenso: você nunca descansa dentro de si. Está sempre recalibrando, sempre medindo, sempre tentando descobrir qual versão de si é a real.",
    direction: "O trabalho neste momento é estabilizar a base. Não é sobre 'acreditar mais em si' — é sobre entender DE ONDE vem a oscilação, qual situação original instalou a ideia de que seu valor depende do último dado externo. Quando você encontra a origem, a oscilação começa a perder poder." },
  { id: "N2", name: "Valor por Comparação", color: "#f778ba",
    desc: "Seu valor só existe em relação ao outro. Você se mede o tempo todo — e quase sempre sai perdendo.",
    deep: "Comparar é natural. O que não é natural é que cada comparação te destrói por dentro. Ver alguém com mais resultado, mais reconhecimento, mais qualquer coisa — não gera inspiração, gera dor. Como se a conquista do outro fosse uma prova de que você falhou. Esse padrão não é inveja no sentido comum. É uma régua instalada na infância que dizia: 'olha o seu irmão', 'olha o fulano', 'por que você não é assim?'. A mensagem absorvida não foi 'se esforce mais'. Foi 'você só tem valor quando é melhor que alguém'. E como sempre vai existir alguém melhor em alguma coisa, o sistema nunca desliga. Mesmo quando você ganha, o alívio dura segundos — porque a próxima comparação já está na fila.",
    direction: "O trabalho aqui é desmontar a régua. Não é sobre 'parar de se comparar' — isso é conselho inútil. É sobre encontrar o momento original em que alguém te ensinou que seu valor era relativo, nunca absoluto. Quando a régua é identificada, ela perde a autoridade." },
  { id: "N3", name: "Valor por Produção", color: "#d29922",
    desc: "Sua identidade está fusionada com o que você produz. Parar gera pânico. Descanso gera culpa. Sem entregar, você não sabe quem é.",
    deep: "Você não descansa — ou quando descansa, se sente um lixo. Porque descanso, para o seu sistema, não é recuperação. É morte simbólica. Parar de produzir ativa um alarme interno que diz: 'se você não está entregando, você não existe'. Essa fusão entre identidade e produção não é ambição. É sobrevivência. Em algum momento, você aprendeu que a única forma de ter valor — de ser visto, de ser aceito, de não ser descartado — era entregando algo. E como a entrega nunca é suficiente (porque a régua sobe junto com o resultado), o ciclo é infinito: produzir → entregar → alívio breve → angústia volta → produzir mais → exaustão → colapso → culpa pelo colapso → produzir de novo. Você se cobra usando punição como combustível — se ataca para se motivar. É como tentar andar com o carro sem pneu, só o aro roendo no chão: funciona, mas destrói.",
    direction: "Neste momento, este é o padrão que mais organiza seu sofrimento. O trabalho não é 'produzir menos'. É entender por que produzir virou sinônimo de existir. Quando a situação original que instalou essa fusão é encontrada e processada, a produção continua — mas agora como escolha, não como obrigação existencial." },
  { id: "N4", name: "Valor por Validação", color: "#bc8cff",
    desc: "Você depende do olhar do outro para se sentir estável. Sem validação, o chão some.",
    deep: "Você toma decisões e depois precisa que alguém confirme que fez certo. Entrega um trabalho e não consegue avaliar se ficou bom até alguém dizer que ficou. Se o outro está bem com você, você está bem. Se o outro se afasta — por qualquer motivo, até cansaço — o chão some. Isso não é 'carência'. É um sistema de navegação que foi construído apontando para fora. A criança que você era precisava de alguém regulando suas emoções — e esse alguém ou não estava lá, ou estava de forma inconsistente. Então você aprendeu a ler o outro com precisão cirúrgica (para antecipar o humor dele e se ajustar) mas nunca aprendeu a ler a si mesmo. O resultado é que você é brilhante em perceber o que os outros precisam — e completamente perdido quando perguntam 'o que VOCÊ quer?'.",
    direction: "O trabalho é construir um sistema de navegação interno. Não é sobre 'parar de precisar dos outros' — é sobre aprender a se regular sozinho também. Quando a origem dessa dependência é encontrada, a pessoa consegue estar COM o outro sem PRECISAR do outro para funcionar." },
  { id: "N5", name: "Valor Negativo Introjetado", color: "#3fb950",
    desc: "Existe uma voz interna que diz que você é defeituoso — não algo que você faz, mas quem você É.",
    deep: "No fundo, você carrega a sensação de que há algo fundamentalmente errado com você. Não com o que você faz — com quem você é. É uma voz que não grita: sussurra. Quando você vai expressar uma ideia, ela diz 'não vale a pena'. Quando você vai se posicionar, ela diz 'quem é você?'. Quando alguém te elogia, ela diz 'se soubessem quem você é de verdade'. Essa voz não é sua. É de alguém. Uma figura de autoridade — pai, mãe, professor, cuidador — que em algum momento, por ação ou por omissão, instalou a mensagem de que quem você é não tem valor. Você introjetou essa voz e ela virou sua voz interna. Agora você se policia, se censura, se diminui — achando que é você decidindo. Mas é a voz dela operando dentro de você. O potencial está lá, inteiro. Mas está trancado por dentro. E a chave está num significado que uma criança construiu para sobreviver.",
    direction: "O trabalho é diferenciar a sua voz da voz introjetada. Quando você percebe que aquela autocrítica não é percepção realista — é eco de uma instalação antiga — ela começa a perder autoridade. O potencial começa a destravar." },
  { id: "N6", name: "Desconexão Emocional", color: "#4A9EFF",
    desc: "Você desligou o acesso às emoções para sobreviver. Analisa tudo, sente pouco.",
    deep: "Você consegue explicar qualquer problema com clareza cirúrgica. Analisa, raciocina, conecta pontos. Mas quando perguntam 'o que você SENTE sobre isso?', trava. Não porque não tem sentimentos — porque cortou o acesso a eles. Em algum momento, sentir era perigoso demais. Sentir levava a perceber coisas sobre si e sobre o mundo que eram insuportáveis. Então o sistema desligou o canal emocional e manteve só o racional. Você virou uma máquina de raciocínio. Funciona por fora — ninguém percebe que há algo errado. Mas por dentro, há um vazio que a análise racional não preenche. Pessoas próximas dizem que você é frio, distante, que não tem empatia. Mas a verdade é mais complexa: você PERCEBE tudo — só não ACESSA a emoção correspondente. O corpo às vezes grita o que a mente cala: tensão sem motivo, dor sem explicação, exaustão sem causa aparente.",
    direction: "O trabalho aqui é anterior a qualquer investigação de significado: é religar o acesso emocional. Não adianta investigar o que está por baixo se o fio está cortado. O primeiro passo é sentir — qualquer coisa. A primeira emoção que rompe a anestesia é a porta de entrada." },
  { id: "N7", name: "Insegurança Vincular", color: "#d18616",
    desc: "Relações são sua maior necessidade e sua maior ameaça ao mesmo tempo.",
    deep: "Você quer conexão profunda — e foge dela quando aparece. Quando o relacionamento vai bem, fica esperando o momento em que vai dar errado. Quando alguém se aproxima demais, sente vontade de empurrar. Já sabotou relações boas porque a proximidade assustava. Esse padrão não é 'medo de compromisso'. É um modelo interno de vínculo que foi construído numa relação onde amor e dor vinham juntos. O adulto que cuidava de você era imprevisível — ora amoroso, ora ausente, ora punitivo. Você aprendeu que vínculo é necessidade E ameaça. Que confiar é se expor. Que quem se aproxima pode machucar. Então oscila: idealiza a pessoa quando ela aparece, desvaloriza quando ela decepciona (mesmo em coisas pequenas), e repete o ciclo com a próxima pessoa. Prefere conflito a solidão — porque conflito é externo e manejável, solidão é interna e lá dentro está o significado que nunca enfrentou.",
    direction: "O trabalho é reconstruir o modelo interno de vínculo. Não é sobre 'confiar mais' — é sobre entender que o perigo que você sente na proximidade é eco de uma relação antiga, não da relação atual. Quando a origem é processada, a pessoa consegue estar próxima sem que a proximidade ative o alarme." },
];

export const INTENSITY_ITEMS: IntensityItem[] = [
  // N1 — Hesitação de Autovalor
  { id: "i01", nef: "N1", text: "Num dia me sinto capaz de qualquer coisa. No outro, me sinto um fracasso." },
  { id: "i02", nef: "N1", text: "Quando recebo um elogio e uma crítica no mesmo dia, não sei em qual acreditar." },
  { id: "i03", nef: "N1", text: "Não consigo manter uma visão estável de quem eu sou." },
  // N2 — Valor por Comparação
  { id: "i04", nef: "N2", text: "Quando alguém conquista algo, minha primeira reação é me sentir diminuído." },
  { id: "i05", nef: "N2", text: "Preciso me sentir melhor que alguém pra me sentir ok comigo." },
  { id: "i06", nef: "N2", text: "Ver alguém mais avançado destrói meu estado emocional." },
  // N3 — Valor por Produção
  { id: "i07", nef: "N3", text: "Quando não estou sendo produtivo, sinto uma angústia inexplicável." },
  { id: "i08", nef: "N3", text: "Descansar me gera culpa." },
  { id: "i09", nef: "N3", text: "Se ficasse uma semana sem produzir, sentiria que estou perdendo minha identidade." },
  { id: "i10", nef: "N3", text: "Preciso me sentir útil para me sentir vivo." },
  // N4 — Valor por Validação
  { id: "i11", nef: "N4", text: "Preciso que alguém me diga que estou bem para eu me sentir estável." },
  { id: "i12", nef: "N4", text: "Quando não recebo reconhecimento, sinto que não valeu a pena." },
  { id: "i13", nef: "N4", text: "Tomo decisões e depois preciso que alguém confirme que fiz certo." },
  // N5 — Valor Negativo Introjetado
  { id: "i14", nef: "N5", text: "Carrego a sensação de que há algo fundamentalmente errado comigo." },
  { id: "i15", nef: "N5", text: "Quando penso em expressar uma ideia, uma voz interna diz que não vale a pena." },
  { id: "i16", nef: "N5", text: "Me calo em grupo mesmo quando sei que tenho algo relevante a dizer." },
  { id: "i17", nef: "N5", text: "Sinto que meu potencial existe, mas está trancado." },
  // N6 — Desconexão Emocional
  { id: "i18", nef: "N6", text: "Consigo analisar meus problemas com clareza, mas nada muda." },
  { id: "i19", nef: "N6", text: "Quando algo emocionalmente forte acontece, minha reação é analisar, não sentir." },
  { id: "i20", nef: "N6", text: "Meu corpo reage a coisas que emocionalmente eu 'não sinto'." },
  // N7 — Insegurança Vincular
  { id: "i21", nef: "N7", text: "Quando um relacionamento vai bem, fico esperando dar errado." },
  { id: "i22", nef: "N7", text: "Oscilo entre querer conexão profunda e querer me afastar de todo mundo." },
  { id: "i23", nef: "N7", text: "Já sabotei relações boas porque a proximidade me assustava." },
];

export const HIERARCHY_ITEMS: HierarchyItem[] = [
  { id: "h01", from: "N3", to: "N1", text: "Minha insegurança sobre meu valor aparece quando não estou produzindo." },
  { id: "h02", from: "N3", to: "N5", text: "Quando não entrego resultados, volto a sentir que sou inadequado." },
  { id: "h03", from: "N3", to: "N4", text: "Preciso de validação principalmente sobre o que produzi." },
  { id: "h04", from: "N5", to: "N6", text: "Aprendi a não sentir porque sentir me levava a perceber coisas dolorosas sobre mim." },
  { id: "h05", from: "N5", to: "N2", text: "Me comparo com os outros porque no fundo acredito que sou menos." },
  { id: "h06", from: "N7", to: "N1", text: "Minha percepção de valor oscila dependendo de como estão meus relacionamentos." },
  { id: "h07", from: "N7", to: "N4", text: "Preciso de validação principalmente de pessoas com quem tenho vínculo." },
  { id: "h08", from: "N4", to: "N3", text: "Produzo intensamente porque é a forma que aprendi de receber aprovação." },
  { id: "h09", from: "N2", to: "N3", text: "Produzo pra provar que sou tão bom quanto os outros." },
  { id: "h10", from: "N1", to: "N7", text: "Quando me sinto desvalorizado, fico inseguro nos relacionamentos." },
  { id: "h11", from: "N6", to: "N5", text: "Me desliguei emocionalmente porque quando sentia, encontrava vergonha." },
  { id: "h12", from: "N7", to: "N6", text: "Me desconectei emocionalmente pra não sofrer com relações." },
];

export const PAIN_LABELS: PainLabel[] = [
  { val: 1, label: "Nao me atinge" },
  { val: 2, label: "Pouco" },
  { val: 3, label: "Incomoda" },
  { val: 4, label: "Doi" },
  { val: 5, label: "Me define" },
];

// ═══════════════════════════════════════
// FUNCTIONS
// ═══════════════════════════════════════

/**
 * Deterministic shuffle using a linear congruential generator.
 * Same seed always produces same order.
 */
export function shuffleWithSeed<T>(arr: T[], seed: number): T[] {
  const a = [...arr];
  let s = seed;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 16807) % 2147483647;
    const j = s % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Compute NEF scores from user answers.
 *
 * Intensity: average per NEF, normalized to 0-100.
 * Hierarchy: bonus points (up to +25) for NEFs whose "from" items scored >= 4.
 * Final score: intensity + hierarchy bonus, capped at 100.
 * Returns all 7 NEFs ranked by score descending.
 */
export function computeNefScores(
  intensityAnswers: IntensityAnswers,
  hierarchyAnswers: HierarchyAnswers,
): NefScore[] {
  const scores: Record<string, { total: number; count: number; hierarchy: number }> = {};

  NEFS.forEach((n) => {
    scores[n.id] = { total: 0, count: 0, hierarchy: 0 };
  });

  Object.entries(intensityAnswers).forEach(([itemId, val]) => {
    const item = INTENSITY_ITEMS.find((i) => i.id === itemId);
    if (item) {
      scores[item.nef].total += val;
      scores[item.nef].count += 1;
    }
  });

  Object.entries(hierarchyAnswers).forEach(([itemId, val]) => {
    const item = HIERARCHY_ITEMS.find((i) => i.id === itemId);
    if (item && val >= 4) {
      scores[item.from].hierarchy += val;
    }
  });

  return NEFS.map((n) => {
    const s = scores[n.id];
    const avg = s.count > 0 ? ((s.total / s.count) / 5) * 100 : 0;
    const hBonus = Math.min(s.hierarchy * 3, 25);
    return {
      ...n,
      intensity: Math.round(avg),
      hierarchy: s.hierarchy,
      score: Math.min(Math.round(avg + hBonus), 100),
    };
  }).sort((a, b) => b.score - a.score);
}
