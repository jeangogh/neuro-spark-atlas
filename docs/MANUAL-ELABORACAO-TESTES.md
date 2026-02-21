# Manual de Elaboracao de Testes Psicologicos

> Guia completo para criar testes de rastreio seguindo o padrao **mind-atlas-quest** e **AHSD Lab**.
> Versao 1.0 — Fevereiro 2026

---

## Sumario

1. [Anatomia de um Teste](#1-anatomia-de-um-teste)
2. [Elaboracao de Questoes](#2-elaboracao-de-questoes)
3. [Sistema de Dimensoes/Clusters](#3-sistema-de-dimensoesclusters)
4. [Faixas de Resultado (ResultBands)](#4-faixas-de-resultado-resultbands)
5. [Tela de Resultado — O Padrao TOPPPPPPP](#5-tela-de-resultado--o-padrao-toppppppp)
6. [Momentos Educativos (Teachings)](#6-momentos-educativos-teachings)
7. [Analytics e A/B Testing](#7-analytics-e-ab-testing)
8. [Fundamentacao Cientifica](#8-fundamentacao-cientifica)
9. [Checklist de Qualidade](#9-checklist-de-qualidade)
10. [Template Rapido](#10-template-rapido)

---

## 1. Anatomia de um Teste

### 1.1 Visao Geral da Arquitetura

O sistema opera com duas camadas complementares:

- **Camada mind-atlas-quest**: Testes standalone com landing page, quiz interativo, resultado rico com graficos (radar, barras, curva de intervencao), secao premium bloqueada e funil de conversao. Ideal para testes de entrada/aquisicao.
- **Camada AHSD Lab (TestDef)**: Testes integrados a uma plataforma com PsychEngine, auto-save de sessao, slider de sofrimento, XP e niveis. Ideal para testes dentro de um ecossistema de usuario logado.

Ambas compartilham o mesmo DNA de dados. A `TestDef` e a interface canonica.

### 1.2 Interface TestDef (Contrato Principal)

```typescript
interface TestDef {
  // --- Identificacao (OBRIGATORIOS) ---
  id: string;                  // slug unico: "rastreio-ahsd", "burnout-nd"
  name: string;                // nome completo: "Rastreio de Altas Habilidades"
  shortName: string;           // nome curto pro header: "Rastreio"
  description: string;         // 1-2 frases sobre o que o teste mede
  category: string;            // "Descoberta", "Aprofundamento", "Monitoramento"
  estimatedMinutes: number;    // tempo estimado (exibido ao usuario)
  isFree: boolean;             // gratis ou pago

  // --- Conteudo (OBRIGATORIOS) ---
  questions: TestQuestion[];   // array de questoes
  resultBands: ResultBand[];   // faixas de resultado (0-100%)

  // --- Scoring (OBRIGATORIO) ---
  indexWeights: {
    intensity: number;         // peso da intensidade (ex: 1.8)
    clarity: number;           // peso da clareza (ex: 1.2)
    noise: number;             // peso do ruido (ex: -0.6, negativo)
  };

  // --- Opcionais (mas altamente recomendados) ---
  clusters?: TestCluster[];    // dimensoes/agrupamentos de questoes
  teachings?: TestTeaching[];  // momentos educativos entre questoes
  shareText?: string;          // template de compartilhamento
  defaultOptions?: { label: string; value: number }[]; // Likert padrao
}
```

### 1.3 Interface TestQuestion

```typescript
interface TestQuestion {
  id: string;         // unico: "ahsd_1", "tdah_3", "q12"
  text: string;       // o enunciado da questao
  dimension?: string; // a que dimensao/cluster pertence (opcional se usar clusters)
  options?: {         // opcoes custom (opcional — usa defaultOptions se ausente)
    label: string;
    value: number;
  }[];
}
```

### 1.4 Interface QuestionBlock (Variante mind-atlas-quest)

No mind-atlas-quest, as questoes sao agrupadas em blocos tematicos:

```typescript
interface QuestionBlock {
  id: string;                // "ahsd", "tdah", "trauma"
  questions: Question[];     // questoes do bloco
  relatesTo?: string[];      // blocos contextuais apontam para mecanismos
}
```

Os blocos servem a dois propositos:
1. **Blocos de mecanismo**: AHSD, TDAH, TEA, Trauma, Ansiedade, Depressao — cada um avalia um constructo especifico.
2. **Blocos contextuais**: Traco, Temporalidade, Impacto — qualificam os mecanismos (e persistente? desde a infancia? impacta a vida?).

### 1.5 Tipos de Escala Likert

O sistema oferece tres escalas pre-definidas:

#### Frequencia (padrao geral)
```typescript
const LIKERT_FREQUENCY = [
  { label: "Nunca",           value: 1 },
  { label: "Raramente",       value: 2 },
  { label: "As vezes",        value: 3 },
  { label: "Frequentemente",  value: 4 },
  { label: "Sempre",          value: 5 },
];
```

#### Concordancia (para afirmacoes)
```typescript
const LIKERT_AGREEMENT = [
  { label: "Discordo totalmente",    value: 1 },
  { label: "Discordo parcialmente",  value: 2 },
  { label: "Neutro",                 value: 3 },
  { label: "Concordo parcialmente",  value: 4 },
  { label: "Concordo totalmente",    value: 5 },
];
```

#### Intensidade (para sensacoes/experiencias)
```typescript
const LIKERT_INTENSITY = [
  { label: "Nada",                value: 1 },
  { label: "Levemente",          value: 2 },
  { label: "Moderadamente",      value: 3 },
  { label: "Intensamente",       value: 4 },
  { label: "Muito intensamente", value: 5 },
];
```

> **Nota:** No mind-atlas-quest, a escala usa 0-4 em vez de 1-5. No AHSD Lab usa 1-5. Escolha uma convencao e mantenha. A formula de scoring se adapta.

### 1.6 Exemplo Minimo Viavel

Um teste completo com o menor esforco possivel:

```typescript
const MEU_TESTE: TestDef = {
  id: "meu-teste",
  name: "Meu Teste de Exemplo",
  shortName: "Exemplo",
  description: "5 perguntas para uma primeira leitura.",
  category: "Descoberta",
  estimatedMinutes: 3,
  isFree: true,
  indexWeights: { intensity: 1.5, clarity: 1.0, noise: -0.5 },
  questions: [
    { id: "q1", text: "Voce sente que pensa diferente dos outros?" },
    { id: "q2", text: "Voce perde a nocao do tempo quando algo te interessa?" },
    { id: "q3", text: "Voce sente emocoes mais intensas que a maioria?" },
    { id: "q4", text: "Voce tem dificuldade em seguir rotinas?" },
    { id: "q5", text: "Voce ja recebeu feedback de que e 'demais'?" },
  ],
  resultBands: [
    { min: 0,  max: 39,  label: "Poucos sinais",       color: "#8b9daf",
      description: "Poucos indicadores neste momento.",
      recommendation: "Faca um teste mais completo para explorar." },
    { min: 40, max: 64,  label: "Sinais moderados",     color: "#d4a03e",
      description: "Sinais de intensidade cognitiva presentes.",
      recommendation: "Aprofunde com um rastreio completo." },
    { min: 65, max: 84,  label: "Sinais fortes",        color: "#c9a227",
      description: "Padroes fortemente compativeis.",
      recommendation: "Considere avaliacao profissional." },
    { min: 85, max: 100, label: "Sinais muito fortes",  color: "#6a9b6a",
      description: "Indicadores muito elevados.",
      recommendation: "Inicie investigacao com profissional qualificado." },
  ],
  shareText: "Fiz um rastreio no AHSD Lab: {label} ({percentage}%). Faca o seu!",
};
```

---

## 2. Elaboracao de Questoes

### 2.1 Principios de Redacao

**Regra de ouro: escreva em primeira pessoa, como se o usuario estivesse descrevendo a propria experiencia.**

| Principio | Exemplo BOM | Exemplo RUIM | Por que |
|-----------|-------------|--------------|---------|
| Primeira pessoa | "Minha mente conecta ideias de areas diferentes com facilidade." | "O individuo apresenta pensamento divergente." | O usuario se identifica, nao analisa a si mesmo clinicamente. |
| Linguagem acessivel | "Mesmo quando algo e importante, meu foco oscila sem que eu queira." | "Voce apresenta deficit na funcao executiva de sustentacao atencional?" | TDAH torna linguagem rebuscada em barreira. Simplicidade = acessibilidade. |
| Comportamento observavel | "Abro varias abas de tarefas e quase sempre acabo poucas." | "Voce se considera desatento?" | Comportamento concreto > autoavaliacao abstrata. |
| Sem julgamento | "Interacoes sociais me exigem esforco consciente de interpretacao." | "Voce tem problemas sociais?" | Descricao neutra, sem patologizar. |
| Especificidade | "Meu rendimento depende mais do nivel de estimulo da tarefa do que da importancia dela." | "Voce tem dificuldade de concentracao?" | Captura o MECANISMO, nao o sintoma generico. |

### 2.2 Quantidade por Dimensao

| Tipo de Teste | Questoes por Dimensao | Total Sugerido |
|--------------|----------------------|----------------|
| Triagem rapida | 1-2 | 5-10 |
| Rastreio padrao | 4-6 | 20-40 |
| Rastreio aprofundado | 8-12 | 40-60 |
| Inventario completo | 12-20 | 60-100+ |

**Regras:**
- **Minimo absoluto**: 4 questoes por dimensao (abaixo disso, a dimensao nao tem validade interna).
- **Ideal**: 6-8 questoes por dimensao (equilibrio entre precisao e fadiga).
- **Maximo recomendado**: 12 questoes por dimensao (acima gera fadiga e respostas aleatorias).
- **Total do teste**: nunca exceder 60 questoes para testes de autopreenchimento online. O sweet spot e 40-53.

### 2.3 Distribuicao por Bloco/Dimensao

No mind-atlas-quest, a distribuicao do rastreio de neurodivergencia e:

```
AHSD .............. 4 questoes (mecanismo neurodev)
TDAH .............. 9 questoes (mecanismo neurodev)
TEA ............... 8 questoes (mecanismo neurodev)
Dupla Excec. ...... 4 questoes (mecanismo 2e)
Traco Neuro ....... 4 questoes (contextual)
Temporalidade ..... 4 questoes (contextual)
Trauma ............ 4 questoes (mecanismo adquirido)
Ansiedade ......... 4 questoes (mecanismo adquirido)
Depressao ......... 4 questoes (mecanismo adquirido)
Traco Adquirido ... 4 questoes (contextual)
Impacto ........... 4 questoes (contextual)
                    ──
Total:            53 questoes
```

**Principio**: Blocos de mecanismo podem variar em tamanho (mais questoes = constructo mais complexo). Blocos contextuais devem ser uniformes (4 questoes cada).

### 2.4 Formulacao Positiva vs Negativa (Itens Invertidos)

**Itens diretos** (score alto = mais do constructo):
> "Quando me interesso por algo, aprendo sozinho em profundidade."

**Itens invertidos** (score alto = MENOS do constructo):
> "Consigo me concentrar em qualquer tarefa, independente do meu interesse."

**Quando usar itens invertidos:**
- Em testes com mais de 20 questoes, inclua 20-30% de itens invertidos.
- Objetivo: detectar respondentes que marcam tudo igual (aquiescencia).
- O `TestCluster` tem o campo `inverted: boolean` para isso.

**Como calcular com inversao:**
```typescript
// Na hora de somar, inverte: se escala 1-5, inversao = (6 - valor)
const adjustedValue = cluster.inverted ? (6 - rawValue) : rawValue;
```

### 2.5 Exemplos Bons vs Ruins

#### AHSD (Altas Habilidades)

**BOM:**
> "Minha mente conecta ideias de areas diferentes com facilidade."

Justificativa: Primeira pessoa, comportamento observavel, captura pensamento associativo (marcador de AH/SD).

**RUIM:**
> "Voce e inteligente?"

Justificativa: Autoavaliacao subjetiva, sem ancoragem em comportamento, enviesado por autoestima.

#### TDAH

**BOM:**
> "Posso entender algo perfeitamente e ainda assim nao conseguir iniciar a tarefa."

Justificativa: Captura a dissociacao entre conhecimento e acao executiva (mecanismo central do TDAH).

**RUIM:**
> "Voce e desatento?"

Justificativa: Rotulo, nao comportamento. Pessoas com TDAH podem hiperfocara intensamente — "desatento" nao captura a realidade.

#### TEA (Autismo)

**BOM:**
> "Frequentemente so percebo que alguem ficou chateado comigo quando a pessoa fala claramente."

Justificativa: Descreve processamento social consciente, situacao concreta, primeira pessoa.

**RUIM:**
> "Voce tem dificuldade de empatia?"

Justificativa: Pessoas autistas frequentemente tem MUITA empatia — o desafio e na LEITURA dos sinais sociais, nao na empatia em si.

#### Trauma

**BOM:**
> "Meu corpo reage a certas situacoes antes de eu entender o motivo."

Justificativa: Captura resposta somatica automatica (mecanismo central do trauma).

**RUIM:**
> "Voce sofreu algum trauma na infancia?"

Justificativa: Muitas pessoas nao reconhecem experiencias como traumaticas. O teste deve captar o EFEITO, nao pedir o relato.

---

## 3. Sistema de Dimensoes/Clusters

### 3.1 Como Definir Dimensoes

Cada dimensao representa um constructo teorico distinto. Para testes de neurodivergencia:

| Tipo | Dimensoes Tipicas | O que Mede |
|------|-------------------|------------|
| Cognitivo | AHSD, Dupla Excepcionalidade | Complexidade de pensamento, aprendizado, potencial |
| Neurofuncional | TDAH, TEA | Regulacao executiva, processamento social |
| Emocional | Ansiedade, Depressao, Trauma | Estados emocionais e suas raizes |
| Contextual | Traco, Temporalidade, Impacto | Qualificadores: e persistente? desde quando? afeta a vida? |

### 3.2 Interface TestCluster

```typescript
interface TestCluster {
  id: string;           // "cognitivo", "emocional", "neurofuncional"
  label: string;        // "Dimensao Cognitiva"
  questionIds: string[];// ["ahsd_1", "ahsd_2", "ahsd_3"]
  color: string;        // cor da barra/radar
  inverted?: boolean;   // true se score alto = MENOS do constructo
}
```

### 3.3 Mapeamento Questao → Dimensao

Ha duas abordagens:

**Abordagem 1: Via `dimension` na questao** (simples)
```typescript
{ id: "q1", text: "...", dimension: "cognitivo" }
```

**Abordagem 2: Via `clusters` no TestDef** (mais flexivel)
```typescript
clusters: [
  {
    id: "cognitivo",
    label: "Dimensao Cognitiva",
    questionIds: ["q1", "q2", "q3", "q4", "q5"],
    color: "hsl(40, 88%, 61%)",
  },
]
```

A abordagem 2 e preferida porque permite que uma questao participe de multiplos clusters e suporta inversao por cluster.

### 3.4 Inversao de Score

**Quando inverter:**
- Quando o bloco mede a AUSENCIA de um constructo (ex: "Me sinto calmo na maioria das situacoes" num bloco de ansiedade).
- Quando o teste precisa de itens de controle para detectar respostas aleatorias.

**Como implementar:**
```typescript
// No calculo do cluster
const clusterScore = cluster.questionIds.reduce((sum, qId) => {
  const value = answers[qId] || 0;
  return sum + (cluster.inverted ? (6 - value) : value);
}, 0);
const maxPossible = cluster.questionIds.length * 5;
const percentage = Math.round((clusterScore / maxPossible) * 100);
```

### 3.5 Cores por Dimensao (Padrao Cromatico)

O sistema usa um padrao cromatico consistente:

| Dimensao | Cor HSL | Hex Aproximado | Significado |
|----------|---------|----------------|-------------|
| AH/SD | `hsl(40, 88%, 61%)` | `#D4A03E` | Dourado — potencial, clareza |
| Dupla Excepcionalidade | `hsl(36, 87%, 44%)` | `#C9A227` | Dourado profundo |
| TDAH | `hsl(0, 65%, 45%)` | `#BD3B3B` | Vermelho — energia desregulada |
| TEA / Autismo | `hsl(15, 65%, 45%)` | `#BD5E3B` | Laranja avermelhado |
| Trauma | `hsl(340, 55%, 55%)` | `#C85880` | Rosa escuro |
| Depressao | `hsl(300, 45%, 40%)` | `#8A3A8A` | Roxo — baixa energia |
| Ansiedade | `hsl(32, 65%, 45%)` | `#BD843B` | Ambar |

**Regra geral:**
- Constructos de FORCA (AH/SD, 2e) usam tons dourados/quentes.
- Constructos de BARREIRA (TDAH, TEA, Trauma) usam tons vermelhos/alaranjados.
- Constructos EMOCIONAIS (Depressao, Ansiedade) usam tons frios/roxos.

---

## 4. Faixas de Resultado (ResultBands)

### 4.1 Interface ResultBand

```typescript
interface ResultBand {
  min: number;            // percentual minimo (0-100)
  max: number;            // percentual maximo (0-100)
  label: string;          // "Sinais moderados"
  color: string;          // cor da faixa (hex ou hsl)
  description: string;    // texto descritivo da faixa
  recommendation: string; // proximo passo recomendado
}
```

### 4.2 Como Definir Cortes Percentuais

**Padrao de 4 faixas (recomendado):**

| Faixa | Percentual | Label |
|-------|-----------|-------|
| 1 | 0-39% | Baixo / Poucos sinais |
| 2 | 40-64% | Moderado / Sinais moderados |
| 3 | 65-84% | Alto / Sinais fortes |
| 4 | 85-100% | Muito Alto / Sinais muito fortes |

**Padrao de 3 faixas (para testes simples):**

| Faixa | Percentual | Label |
|-------|-----------|-------|
| 1 | 0-39% | Baixo |
| 2 | 40-69% | Moderado |
| 3 | 70-100% | Alto |

**REGRA CRITICA**: As faixas devem cobrir 0-100% sem gaps e sem sobreposicao. O sistema busca a primeira banda onde `score >= min && score <= max`.

### 4.3 Nomenclatura dos Niveis

**Evite:**
- "Normal" (implica que os outros sao "anormais")
- "Positivo" / "Negativo" (nao e exame de sangue)
- "Leve" / "Grave" (implica diagnostico)

**Use:**
- "Poucos sinais" / "Sinais moderados" / "Sinais fortes" / "Sinais muito fortes"
- "Baixa intensidade" / "Intensidade moderada" / "Alta intensidade" / "Intensidade muito alta"
- "Indicadores discretos" / "Indicadores moderados" / "Indicadores elevados" / "Indicadores muito elevados"

### 4.4 Redacao de Descricoes por Faixa

**Estrutura de cada descricao:**
1. O que o score INDICA (em linguagem acessivel)
2. O que isso SIGNIFICA para a pessoa
3. Uma nota de RESSALVA quando necessario

**Exemplo — Faixa "Sinais fortes" (65-84%) para AHSD:**
> "Seus padroes sao fortemente compativeis com altas habilidades. Voce provavelmente sente que funciona diferente — e esta certo. Isso nao e definitivo e merece investigacao com profissional qualificado."

**Regras de tom:**
- Nunca alarme. Nunca minimize.
- Use linguagem descritiva, nao diagnostica.
- Valide a experiencia do usuario ("voce sente que...", "e possivel que...").
- Nunca diga "voce tem X" — diga "seus padroes sao compativeis com X".

### 4.5 Redacao de Recomendacoes por Faixa

**Estrutura:** Uma acao concreta + contexto minimo.

| Faixa | Recomendacao | Tom |
|-------|-------------|-----|
| Baixo | "Faca o rastreio completo para uma visao mais ampla." | Neutro, explorar mais |
| Moderado | "Aprofunde com um rastreio especifico da area indicada." | Encorajador, direcionar |
| Alto | "Considere avaliacao com profissional especializado." | Claro, orientar |
| Muito Alto | "Inicie investigacao com profissional qualificado. Seus indicadores sao significativos." | Firme, nao alarmista |

### 4.6 Cores por Faixa

| Faixa | Cor | Hex | Significado |
|-------|-----|-----|-------------|
| Baixo | Cinza azulado | `#8b9daf` | Neutro |
| Moderado | Dourado/Ambar | `#d4a03e` | Atencao |
| Alto | Dourado intenso | `#c9a227` | Relevancia |
| Muito Alto | Verde seco | `#6a9b6a` | Acao necessaria |

> **Nota:** Nao usamos vermelho para "muito alto" porque isso implicaria "perigo". Verde seco indica "area de acao", nao "positivo/negativo".

---

## 5. Tela de Resultado — O Padrao TOPPPPPPP

A tela de resultado e o ponto mais critico do funil. E onde o usuario tem o "momento aha" e decide se vai avancar (comprar, agendar, compartilhar). O padrao TOPPPPPPP garante impacto maximo.

### 5.1 Secoes Obrigatorias (em ordem)

```
1. Header do resultado
2. Sintese Geral
3. Potencial vs. Expressao
4. Detalhamento por Area (barras de score)
5. Entenda Cada Bloco (cards expandiveis)
6. Mapa de Perfil (Radar Chart)
7. Propensao de Expressao do Potencial (barras agrupadas)
8. Curva de Intervencao
9. Disclaimer
10. Secao Premium/Bloqueada (upsell)
11. Botoes de Compartilhamento
12. Acoes (Exportar PDF, Refazer)
```

### 5.2 Header do Resultado

```
[Badge] Rastreio de [Nome do Teste]

Seu Resultado

Analise baseada em suas respostas. Este resultado levanta
hipoteses — nao constitui diagnostico.
```

O header deve ser limpo e imediatamente comunicar que o resultado esta pronto.

### 5.3 Sintese Geral

Texto gerado dinamicamente com base nos scores. Estrutura:

```typescript
function gerarSintese(hypotheses, traitVsState, temporality, is2e) {
  let summary = "";

  // 1. Mecanismos neurodev altos
  if (neurodevAltos.length > 0 && tracoPersistente) {
    summary += `Seus resultados apontam padroes compativeis com
    funcionamento neurodesenvolvimentalista (${nomes}), com persistencia
    ao longo da vida...`;
  }

  // 2. Mecanismos adquiridos
  if (adquiridosAltos.length > 0) {
    summary += `Foram identificados padroes emocionais (${nomes})...`;
  }

  // 3. Dupla excepcionalidade
  if (is2e) {
    summary += `O perfil sugere possivel Dupla Excepcionalidade...`;
  }

  // 4. Disclaimer (SEMPRE)
  summary += `\n\nEste instrumento NAO fornece diagnostico.`;

  return summary;
}
```

### 5.4 Radar Chart

O Radar Chart e a visualizacao-assinatura. Mostra todas as dimensoes num unico grafico, permitindo ver o "formato" do perfil de relance.

**Dados necessarios:**
```typescript
const radarData = hypotheses.map((h) => ({
  subject: h.label,    // nome curto da dimensao
  score: h.score,      // 0-100
  fullMark: 100,       // teto da escala
}));
```

**Configuracao visual:**
- `outerRadius`: 65-68% do container
- `PolarGrid`: linhas sutis (stroke cinza claro)
- `PolarAngleAxis`: labels de 9-10px, cor muted
- `Radar fill`: cor primaria com 15-18% de opacidade
- `strokeWidth`: 2px

### 5.5 Barras de Score por Hipotese/Dimensao

Para cada hipotese/dimensao, uma barra horizontal animada:

```
[AH/SD]        ████████████████████████░░░░░░  92%
[TDAH]         ██████████████████████░░░░░░░░  89%
[Ansiedade]    ███████████████████████░░░░░░░  91%
[Dupla Exc.]   █████████████████████░░░░░░░░░  88%
[Trauma]       ██████████████░░░░░░░░░░░░░░░░  68%
[Autismo]      ████████░░░░░░░░░░░░░░░░░░░░░░  44%
[Depressao]    ████░░░░░░░░░░░░░░░░░░░░░░░░░░  22%
```

**Implementacao:**
```typescript
function ScoreBar({ score, color, delay }) {
  return (
    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
      <motion.div
        className="h-full rounded-full"
        style={{ backgroundColor: color }}
        initial={{ width: 0 }}
        animate={{ width: `${score}%` }}
        transition={{ duration: 0.8, delay, ease: "easeOut" }}
      />
    </div>
  );
}
```

### 5.6 Cards Expandiveis (Entenda Cada Bloco)

Cada hipotese tem um card que expande ao toque com explicacao completa.

**Estrutura do card:**
```
┌─────────────────────────────────────────┐
│ [Label da Hipotese]              [92%]  │
│ ████████████████████████░░░░░░          │
│ Descricao curta (shortDescription)      │
│ [Entender este bloco ▾]                 │
├─────────────────────────────────────────┤
│ Explicacao completa (fullDescription)   │ ← expande ao clicar
│ Multiplos paragrafos com **negrito**    │
│ Nota especial se for AH/SD ou 2e       │
└─────────────────────────────────────────┘
```

**Regras:**
- Animacao suave de expansao (height auto, opacity fade).
- `shortDescription`: 1-2 frases, tom descritivo.
- `fullDescription`: 3-8 paragrafos, tom educativo, com **negritos** para conceitos-chave.
- Cards especiais: AH/SD pode ter nota extra ("AH/SD e um modo de funcionar, nao um titulo"). 2e pode ter frase de identificacao ("Eu sei que sou capaz, mas nao consigo render como deveria").

### 5.7 Curva de Intervencao

Grafico de linhas mostrando trajetoria de performance ao longo da vida:
- **Linha vermelha**: "Sem intervencao" — declinio apos pico.
- **Linha dourada**: "Com intervencao" — recuperacao apos ponto de inflexao.

**Dados:**
```typescript
const curveData = [
  { age: 0,  baseline: 28,  intervention: null },
  { age: 5,  baseline: 50,  intervention: null },
  { age: 10, baseline: 70,  intervention: null },
  // ...
  { age: 35, baseline: floor, intervention: floor },  // ponto de inflexao
  { age: 40, baseline: floor, intervention: peak },    // intervencao age
  // ...
];
```

O `floor` e `peak` sao calculados dinamicamente com base nos scores de barreira do usuario:
```typescript
const floor = Math.max(60, Math.round(82 - barrierAvg * 0.12));
const peak  = Math.round(88 + barrierAvg * 0.06);
```

### 5.8 Secao Premium/Bloqueada (Upsell)

A secao premium usa o padrao **"conteudo borrado com cadeado"**:

```
┌─────────────────────────────────────────────┐
│  FUNDO ESCURO (gradiente dark)              │
│                                             │
│  [Titulo] O seu perfil tem mais camadas     │
│  do que este rastreio revela.               │
│                                             │
│  [Bullet points do que inclui]              │
│  • Analise detalhada de cada mecanismo      │
│  • Cruzamento entre perfis                  │
│  • Mapa de forcas e vulnerabilidades        │
│  • Acoes praticas por cluster               │
│  • Adaptacoes sugeridas                     │
│                                             │
│  ┌───────────────────────────────────┐      │
│  │ [CONTEUDO BORRADO — filter:blur] │      │
│  │  Radar chart                      │      │
│  │  Textos de analise                │      │
│  │  Bar chart                        │      │
│  │  Area chart                       │      │
│  │  Curva personalizada              │      │
│  │              🔒                    │      │
│  │      Conteudo bloqueado           │      │
│  └───────────────────────────────────┘      │
│                                             │
│  [CTA] Desbloquear Relatorio Aprofundado    │
│  Acesso imediato · Analise personalizada    │
└─────────────────────────────────────────────┘
```

**Detalhes tecnicos:**
- Background: gradiente escuro diagonal (dark bg → dark gold hint).
- Conteudo borrado: `filter: blur(5px)`, `userSelect: none`, `pointerEvents: none`.
- Gradient fade na base do conteudo borrado (transparente → bg escuro).
- CTA button: cor contrastante (teal/verde escuro), com glow shadow.
- O conteudo borrado DEVE ser real (usar os graficos e textos do usuario, mesmo borrado) — isso cria desejo.

### 5.9 Botoes de Compartilhamento

```
[Compartilhar resultado]
[WhatsApp]  [X/Twitter]  [Copiar link]
```

**Texto de compartilhamento:**
```typescript
const shareText = "Fiz o rastreio de Altas Habilidades e Neurodivergencia — voce precisa conhecer.";
const shareUrl = window.location.origin + "/triagem";
```

### 5.10 Exportacao PDF

Usa `window.print()` com classes `print:hidden` para ocultar elementos interativos e `print:bg-white` para fundo.

---

## 6. Momentos Educativos (Teachings)

### 6.1 Interface TestTeaching

```typescript
interface TestTeaching {
  afterQuestion: number;  // insere DEPOIS da questao N (1-indexed)
  title: string;          // titulo curto
  body: string;           // texto educativo
}
```

### 6.2 Quando Inserir (Breakpoints Ideais)

**Regra geral:** A cada 10-15 questoes, insira um teaching.

Para um teste de 53 questoes:
- `afterQuestion: 12` — apos primeiro terco
- `afterQuestion: 28` — no meio
- `afterQuestion: 42` — antes do final

**Momentos estrategicos:**
- Na transicao entre blocos tematicos (ex: sai de neurodev, entra em emocional).
- Apos blocos emocionalmente intensos (trauma, depressao).
- Quando o usuario pode estar pensando "sera que isso e normal?".

### 6.3 Estrutura do Teaching

```
┌─────────────────────────────────────┐
│  [Icone: BookOpen]                  │
│  MOMENTO EDUCATIVO                  │
│                                     │
│  [Titulo] Sobre regulacao executiva │
│                                     │
│  [Corpo] O TDAH nao e falta de     │
│  atencao — e uma dificuldade de     │
│  REGULAR a atencao. Quem tem TDAH   │
│  pode hiperfocara intensamente em    │
│  algo interessante e ter grande      │
│  dificuldade com tarefas neutras.   │
│                                     │
│  [Continuar →]                      │
└─────────────────────────────────────┘
```

### 6.4 Tom dos Teachings

| Fazer | Nao Fazer |
|-------|-----------|
| Educar com curiosidade | Alarmar sobre condicoes |
| Normalizar experiencias | Patologizar respostas |
| Conectar com ciencia acessivel | Usar jargao clinico |
| Validar ("muitas pessoas sentem...") | Julgar ("se voce respondeu X, pode ter Y") |
| Manter curto (3-5 frases) | Escrever paragrafos longos |

### 6.5 Exemplos

**BOM:**
```typescript
{
  afterQuestion: 12,
  title: "Sobre regulacao executiva",
  body: "Dificuldade de iniciar tarefas nao e preguica. Quando o sistema de regulacao executiva funciona com base em estimulo (e nao em importancia), tarefas 'chatas' se tornam quase impossiveis — mesmo que voce saiba exatamente o que fazer. Isso e um padrao neurobiologico, nao uma falha moral."
}
```

**BOM:**
```typescript
{
  afterQuestion: 28,
  title: "Traco vs. estado",
  body: "Algumas caracteristicas nos acompanham desde sempre (tracos). Outras surgem em resposta a experiencias dificeis (estados). Saber a diferenca e fundamental para entender o que e 'voce' e o que e 'algo que aconteceu com voce'. As proximas perguntas ajudam a mapear isso."
}
```

**RUIM:**
```typescript
{
  afterQuestion: 15,
  title: "Voce pode ter TDAH",
  body: "Se voce respondeu 'frequentemente' ou mais nas ultimas questoes, e possivel que voce tenha TDAH. Procure um profissional."
}
// Problema: diagnostica, alarma, e invasivo.
```

---

## 7. Analytics e A/B Testing

### 7.1 Eventos de Funil (O que Rastrear)

O sistema de tracking registra 5 eventos-chave na tabela `funnel_events`:

| Evento | Quando Dispara | Dados |
|--------|---------------|-------|
| `quiz_start` | Usuario confirma lead capture e inicia quiz | session_id, layout, lead_variant |
| `step_advance` | Cada vez que avanca uma questao | step atual, total_steps |
| `quiz_complete` | Responde a ultima questao | step = total, elapsed_ms |
| `quiz_abandon` | Sai da pagina sem completar | ultimo step, elapsed_ms |
| `checkout_click` | Clica no CTA de compra (upsell) | step = total |

### 7.2 Implementacao do Tracking

```typescript
interface FunnelEvent {
  session_id: string;      // UUID unico por sessao
  event_type: string;      // um dos 5 eventos acima
  step: number | null;     // questao atual
  total_steps: number;     // total de questoes
  elapsed_ms: number;      // tempo desde o inicio
  layout: "single" | "multi";  // variante de layout
  lead_variant: "pre" | "post"; // captura de lead antes ou depois
  color_theme: string;     // tema visual
  font_theme: string;      // fonte
  page: string;            // pathname
}
```

**Deteccao de abandono:**
```typescript
// Usa visibilitychange + beforeunload + sendBeacon
// sendBeacon garante envio mesmo com aba fechando
window.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") {
    navigator.sendBeacon(url, JSON.stringify(payload));
  }
});
```

### 7.3 Variantes de A/B Testing

**Variante de Layout:**
- `single`: todas as questoes numa unica tela, scroll vertical.
- `multi`: uma questao por tela, avanco horizontal.
- Atribuida aleatoriamente (50/50) e persistida na sessionStorage.

**Variante de Lead Capture:**
- `pre`: captura nome/email/telefone ANTES do quiz.
- `post`: captura DEPOIS do quiz (antes de mostrar resultado).
- Atribuida aleatoriamente (50/50) e persistida na sessionStorage.

### 7.4 Como Calcular Metricas

```sql
-- Taxa de conclusao por variante de layout
SELECT
  layout,
  COUNT(CASE WHEN event_type = 'quiz_complete' THEN 1 END)::float /
  NULLIF(COUNT(CASE WHEN event_type = 'quiz_start' THEN 1 END), 0) * 100
    AS completion_rate
FROM funnel_events
GROUP BY layout;

-- Tempo medio de conclusao
SELECT
  AVG(elapsed_ms) / 1000 AS avg_seconds
FROM funnel_events
WHERE event_type = 'quiz_complete';

-- Ponto de abandono mais comum
SELECT
  step,
  COUNT(*) AS abandonos
FROM funnel_events
WHERE event_type = 'quiz_abandon'
GROUP BY step
ORDER BY abandonos DESC
LIMIT 10;

-- Taxa de conversao (checkout)
SELECT
  lead_variant,
  COUNT(CASE WHEN event_type = 'checkout_click' THEN 1 END)::float /
  NULLIF(COUNT(CASE WHEN event_type = 'quiz_complete' THEN 1 END), 0) * 100
    AS checkout_rate
FROM funnel_events
GROUP BY lead_variant;
```

---

## 8. Fundamentacao Cientifica

### 8.1 Como Citar Referencias

Cada teste deve ter uma lista de referencias cientificas que embasam seus constructos. O formato padrao e:

```typescript
const REFERENCES = [
  {
    ref: "Barkley, R.A. (2015). Attention-deficit hyperactivity disorder (4th ed.). Guilford Press.",
    note: "Base para compreensao do TDAH como disfuncao executiva."
  },
  {
    ref: "Baron-Cohen, S. (2008). Autism and Asperger Syndrome. Oxford University Press.",
    note: "Cognicao social e espectro autista."
  },
  // ...
];
```

As referencias sao exibidas num modal acessivel por link na tela de resultado.

### 8.2 Bases Obrigatorias

Todo teste de rastreio DEVE referenciar:

| Base | Uso |
|------|-----|
| **DSM-5-TR** (APA, 2022) | Criterios diagnosticos de referencia |
| **CID-11** (OMS, 2022) | Classificacao internacional |
| **Literatura especifica** | Autores de referencia por constructo |

**Autores de referencia por area:**
- TDAH: Barkley (2015), Brown (2013)
- TEA: Baron-Cohen (2008), Attwood (2006)
- AH/SD: Winner (1996), Renzulli (2005), Silverman (2013)
- 2e: Webb et al. (2016)
- Trauma: Van der Kolk (2014)
- Ansiedade: Eysenck & Derakshan (2011)
- Depressao: Rock et al. (2014)
- Impacto cognitivo geral: Shields et al. (2016)

### 8.3 Disclaimer Padrao

TODO teste deve incluir, na tela de resultado, o seguinte disclaimer (ou variacao):

> **Nota Importante:** Este questionario e um instrumento de autorrelato e **nao substitui avaliacao profissional**. Os resultados indicam padroes de funcionamento que merecem investigacao com profissional qualificado. Este instrumento NAO fornece diagnostico.

**Regras:**
- O disclaimer DEVE estar visivel na tela de resultado (nao escondido em modal).
- Deve usar destaque visual (borda, fundo diferenciado).
- A palavra "nao" deve estar em negrito.

---

## 9. Checklist de Qualidade

Antes de publicar QUALQUER teste, verifique todos os itens:

### Questoes
- [ ] Todas as questoes estao em primeira pessoa
- [ ] Minimo 4 questoes por dimensao (ideal 6-8)
- [ ] Linguagem acessivel (sem jargao clinico no enunciado)
- [ ] Comportamento observavel (nao autoavaliacao abstrata)
- [ ] Sem julgamento ou patologizacao
- [ ] IDs unicos para cada questao

### Escala e Scoring
- [ ] Escala Likert definida (frequencia, concordancia ou intensidade)
- [ ] `defaultOptions` configurado no TestDef
- [ ] `indexWeights` definidos (`intensity`, `clarity`, `noise`)
- [ ] Itens invertidos marcados corretamente nos clusters

### Dimensoes/Clusters
- [ ] Clusters mapeiam TODAS as questoes (nenhuma orfaa)
- [ ] Cada cluster tem `id`, `label`, `questionIds`, `color`
- [ ] Cores seguem o padrao cromatico do sistema
- [ ] `inverted` definido para clusters que precisam

### Faixas de Resultado (ResultBands)
- [ ] ResultBands cobrem 0-100% sem gaps e sem sobreposicao
- [ ] Cada faixa tem `min`, `max`, `label`, `description`, `recommendation`, `color`
- [ ] Labels nao usam "normal/anormal" ou "positivo/negativo"
- [ ] Descricoes sao descritivas, nao diagnosticas
- [ ] Recomendacoes apontam acao concreta

### Tela de Resultado
- [ ] Sintese Geral gerada dinamicamente
- [ ] Radar Chart funcional com todas as dimensoes
- [ ] Barras de score por dimensao com cores corretas
- [ ] Cards expandiveis com shortDescription + fullDescription
- [ ] Curva de intervencao com dados dinamicos
- [ ] Disclaimer visivel e destacado
- [ ] Secao premium (se aplicavel) com conteudo borrado
- [ ] Botoes de compartilhamento funcionais
- [ ] Exportacao PDF via window.print()

### Teachings
- [ ] Teachings inseridos a cada 10-15 questoes
- [ ] Tom educativo, nao alarmista
- [ ] Cada teaching tem `afterQuestion`, `title`, `body`

### Analytics
- [ ] `quiz_start` dispara ao iniciar
- [ ] `step_advance` dispara a cada questao
- [ ] `quiz_complete` dispara ao final
- [ ] `quiz_abandon` dispara ao sair
- [ ] `checkout_click` dispara no CTA de compra
- [ ] Variantes A/B (layout, lead_variant) persistidas por sessao

### Compartilhamento e Metadata
- [ ] `shareText` configurado com placeholders `{label}` e `{percentage}`
- [ ] Texto de compartilhamento nao revela dados sensiveis

### Fundamentacao
- [ ] Referencias cientificas listadas
- [ ] DSM-5 e/ou CID-11 referenciados
- [ ] Disclaimer "nao substitui avaliacao profissional" presente

---

## 10. Template Rapido

Abaixo, um teste completo pronto para copiar e adaptar. 20 questoes, 4 dimensoes, 4 faixas, 2 teachings.

```typescript
import type { TestDef } from "./types";
import { LIKERT_FREQUENCY } from "./types";

/**
 * ============================================================
 * TEMPLATE: Rastreio de [NOME DO CONSTRUCTO]
 *
 * 20 questoes | 4 dimensoes | ~8 minutos
 *
 * Substitua:
 * - [NOME] pelo nome do teste
 * - [DIM_X] pelas suas dimensoes
 * - Textos das questoes
 * - Descricoes das faixas
 * ============================================================
 */
const MEU_TESTE_TEMPLATE: TestDef = {
  id: "meu-rastreio",
  name: "Rastreio de [NOME]",
  shortName: "[NOME]",
  description:
    "20 perguntas para mapear seus padroes de [DESCREVER]. Resultado imediato com grafico de perfil.",
  category: "Descoberta",
  estimatedMinutes: 8,
  isFree: true,

  // Pesos do PsychEngine (ajuste conforme o constructo)
  indexWeights: {
    intensity: 1.5,  // quanto o teste contribui para intensidade
    clarity: 1.2,    // quanto contribui para clareza
    noise: -0.4,     // quanto contribui para ruido (negativo = reduz ruido)
  },

  // Escala Likert padrao (pode ser sobrescrita por questao)
  defaultOptions: LIKERT_FREQUENCY,

  // ── QUESTOES ──────────────────────────────────────────────
  questions: [
    // Dimensao 1: Cognitiva (5 questoes)
    { id: "cog_1", text: "Quando me interesso por algo, mergulho com profundidade que surpreende as pessoas ao meu redor.", dimension: "cognitiva" },
    { id: "cog_2", text: "Minha mente faz conexoes entre areas aparentemente nao relacionadas.", dimension: "cognitiva" },
    { id: "cog_3", text: "Preciso entender o 'porque' das coisas, nao apenas o 'como'.", dimension: "cognitiva" },
    { id: "cog_4", text: "Sinto frustacao quando ambientes nao acompanham meu ritmo de pensamento.", dimension: "cognitiva" },
    { id: "cog_5", text: "Aprendo coisas novas com rapidez, muitas vezes sem orientacao formal.", dimension: "cognitiva" },

    // Dimensao 2: Emocional (5 questoes)
    { id: "emo_1", text: "Sinto emocoes com uma intensidade que as pessoas ao meu redor parecem nao ter.", dimension: "emocional" },
    { id: "emo_2", text: "Injusticas me afetam fisicamente — tensao, insonia, agitacao.", dimension: "emocional" },
    { id: "emo_3", text: "Tenho dificuldade de 'desligar' emocionalmente de situacoes que me tocam.", dimension: "emocional" },
    { id: "emo_4", text: "Minha sensibilidade emocional ja foi vista como 'exagero' por outros.", dimension: "emocional" },
    { id: "emo_5", text: "A dor emocional de outros me afeta como se fosse minha.", dimension: "emocional" },

    // Dimensao 3: Executiva (5 questoes)
    { id: "exe_1", text: "Mesmo sabendo exatamente o que fazer, tenho dificuldade de comecar.", dimension: "executiva" },
    { id: "exe_2", text: "Meu foco depende do nivel de interesse, nao da importancia da tarefa.", dimension: "executiva" },
    { id: "exe_3", text: "Comeco muitas coisas e termino poucas.", dimension: "executiva" },
    { id: "exe_4", text: "Preciso de pressao externa (prazo, cobranca) para finalizar tarefas.", dimension: "executiva" },
    { id: "exe_5", text: "Minha mente esta constantemente processando multiplas coisas ao mesmo tempo.", dimension: "executiva" },

    // Dimensao 4: Social (5 questoes)
    { id: "soc_1", text: "Interacoes sociais me cansam mais do que a maioria das pessoas relata.", dimension: "social" },
    { id: "soc_2", text: "Tenho dificuldade de perceber sinais sociais implicitos (tom, intencao).", dimension: "social" },
    { id: "soc_3", text: "Me sinto deslocado em grupos, mesmo quando sou bem recebido.", dimension: "social" },
    { id: "soc_4", text: "Preciso de tempo sozinho para me recuperar apos eventos sociais.", dimension: "social" },
    { id: "soc_5", text: "Ja me disseram que sou 'diferente' ou 'intenso demais' socialmente.", dimension: "social" },
  ],

  // ── CLUSTERS (Dimensoes) ──────────────────────────────────
  clusters: [
    {
      id: "cognitiva",
      label: "Complexidade Cognitiva",
      questionIds: ["cog_1", "cog_2", "cog_3", "cog_4", "cog_5"],
      color: "hsl(40, 88%, 61%)",     // dourado
    },
    {
      id: "emocional",
      label: "Intensidade Emocional",
      questionIds: ["emo_1", "emo_2", "emo_3", "emo_4", "emo_5"],
      color: "hsl(340, 55%, 55%)",    // rosa escuro
    },
    {
      id: "executiva",
      label: "Regulacao Executiva",
      questionIds: ["exe_1", "exe_2", "exe_3", "exe_4", "exe_5"],
      color: "hsl(0, 65%, 45%)",      // vermelho
      // inverted: false — score alto = mais dificuldade executiva
    },
    {
      id: "social",
      label: "Processamento Social",
      questionIds: ["soc_1", "soc_2", "soc_3", "soc_4", "soc_5"],
      color: "hsl(245, 60%, 65%)",    // roxo
    },
  ],

  // ── FAIXAS DE RESULTADO ───────────────────────────────────
  resultBands: [
    {
      min: 0,
      max: 39,
      label: "Poucos sinais identificados",
      color: "#8b9daf",
      description:
        "Seus padroes nao indicaram sinais significativos nas dimensoes avaliadas neste momento. Isso nao e definitivo — muitas pessoas passam anos sem identificacao adequada.",
      recommendation:
        "Se a duvida persistir, explore outros rastreios especificos ou converse com um profissional que entenda neurodivergencia.",
    },
    {
      min: 40,
      max: 64,
      label: "Sinais moderados",
      color: "#d4a03e",
      description:
        "Voce apresenta sinais de intensidade em algumas das dimensoes avaliadas. Padroes como hiperfoco, sensibilidade emocional e pensamento divergente sao compativeis com perfis de alta complexidade cognitiva.",
      recommendation:
        "Aprofunde a investigacao com um rastreio mais completo e considere conversar com profissional especializado.",
    },
    {
      min: 65,
      max: 84,
      label: "Sinais fortes",
      color: "#c9a227",
      description:
        "Seus padroes sao fortemente compativeis com os constructos avaliados. Voce provavelmente sente que funciona de maneira diferente — e os dados apoiam essa percepcao.",
      recommendation:
        "Recomendamos avaliacao com profissional qualificado em neurodivergencia para investigacao aprofundada.",
    },
    {
      min: 85,
      max: 100,
      label: "Sinais muito fortes",
      color: "#6a9b6a",
      description:
        "Indicadores muito elevados em multiplas dimensoes. Seu perfil sugere alta intensidade cognitiva e/ou neurofuncional que merece investigacao detalhada.",
      recommendation:
        "Inicie investigacao formal com profissional especializado. Seus indicadores sao significativos o suficiente para justificar avaliacao completa.",
    },
  ],

  // ── TEACHINGS (Momentos Educativos) ───────────────────────
  teachings: [
    {
      afterQuestion: 10,  // apos a 10a questao
      title: "Intensidade nao e defeito",
      body: "Sentir emocoes com mais forca, pensar com mais profundidade ou precisar de mais silencio nao sao falhas. Sao padroes de funcionamento que, quando compreendidos, podem ser canalizados de forma positiva. As proximas perguntas exploram como esses padroes se manifestam no seu dia a dia.",
    },
    {
      afterQuestion: 18,  // apos a 18a questao (quase no final)
      title: "Funcionar diferente nao e funcionar errado",
      body: "Se voce chegou ate aqui reconhecendo muitas das descricoes, saiba que milhoes de pessoas compartilham padroes similares. A neurodivergencia nao e um diagnostico de 'defeito' — e um mapeamento de como seu cerebro opera. Entender isso e o primeiro passo para criar estrategias que funcionem PARA voce, nao contra voce.",
    },
  ],

  // ── COMPARTILHAMENTO ──────────────────────────────────────
  shareText:
    "Fiz o Rastreio de [NOME] no AHSD Lab: {label} ({percentage}%). Faca o seu em ahsdlab.com",
};

export default MEU_TESTE_TEMPLATE;
```

### Como Usar Este Template

1. **Copie o arquivo inteiro** para `src/data/tests/meu-teste.ts`.
2. **Substitua** os textos entre `[COLCHETES]`.
3. **Adapte as questoes** para o seu constructo, seguindo os principios da Secao 2.
4. **Ajuste os clusters** para as dimensoes do seu teste.
5. **Calibre as faixas** com base na sua populacao-alvo.
6. **Teste localmente** respondendo em diferentes padroes (tudo baixo, tudo alto, misto).
7. **Passe pelo Checklist** (Secao 9) antes de publicar.
8. **Registre o teste** no array de testes da plataforma.

### Formula de Calculo de Score

```typescript
// Score por cluster (dimensao)
function calculateClusterScore(
  cluster: TestCluster,
  answers: Record<string, number>,
  maxPerQuestion: number = 5
): number {
  const total = cluster.questionIds.reduce((sum, qId) => {
    const value = answers[qId] || 0;
    return sum + (cluster.inverted ? (maxPerQuestion + 1 - value) : value);
  }, 0);
  const max = cluster.questionIds.length * maxPerQuestion;
  return Math.round((total / max) * 100);
}

// Score total do teste
function calculateTotalScore(
  questions: TestQuestion[],
  answers: Record<string, number>,
  clusters?: TestCluster[],
  maxPerQuestion: number = 5
): number {
  const invertedIds = new Set<string>();
  clusters?.forEach(c => {
    if (c.inverted) c.questionIds.forEach(id => invertedIds.add(id));
  });

  const total = questions.reduce((sum, q) => {
    const value = answers[q.id] || 0;
    return sum + (invertedIds.has(q.id) ? (maxPerQuestion + 1 - value) : value);
  }, 0);

  const max = questions.length * maxPerQuestion;
  return Math.round((total / max) * 100);
}

// Encontrar a faixa correspondente
function findBand(score: number, bands: ResultBand[]): ResultBand | null {
  return bands.find(b => score >= b.min && score <= b.max) || null;
}
```

---

## Apendice A: Glossario

| Termo | Definicao |
|-------|-----------|
| **TestDef** | Definicao completa de um teste (interface principal) |
| **QuestionBlock** | Agrupamento de questoes por tema (variante mind-atlas-quest) |
| **TestCluster** | Dimensao de analise que agrupa questoes para scoring |
| **ResultBand** | Faixa de resultado (ex: 65-84% = "Sinais fortes") |
| **Teaching** | Momento educativo entre questoes |
| **Likert** | Escala de resposta gradual (ex: Nunca → Sempre) |
| **indexWeights** | Pesos de contribuicao para os indices de Intensidade, Clareza e Ruido |
| **Inversao** | Questoes onde score alto = menos do constructo |
| **2e** | Dupla Excepcionalidade (alta capacidade + desafio neurofuncional) |
| **PsychEngine** | Motor de processamento psicometrico da plataforma AHSD Lab |
| **Funil** | Jornada do usuario: landing → quiz → resultado → conversao |

## Apendice B: Ordem de Implementacao

Para criar um teste novo do zero:

```
1. Definir constructo e dimensoes (30 min)
   ↓
2. Redigir questoes (2-4 horas)
   ↓
3. Criar clusters e mapear questoes (30 min)
   ↓
4. Definir faixas de resultado (1 hora)
   ↓
5. Redigir descricoes e recomendacoes por faixa (1-2 horas)
   ↓
6. Criar teachings (30 min)
   ↓
7. Configurar TestDef completo (30 min)
   ↓
8. Testar com dados sinteticos (1 hora)
   ↓
9. Passar pelo checklist (30 min)
   ↓
10. Publicar
```

**Tempo total estimado: 8-12 horas de trabalho focado.**

## Apendice C: Erros Comuns

| Erro | Consequencia | Correcao |
|------|-------------|----------|
| Gap nas ResultBands (ex: 0-39, 45-64...) | Scores de 40-44 nao tem faixa | Sempre cobrir 0-100 sem gaps |
| Questoes em terceira pessoa | Usuario nao se identifica, respostas menos honestas | Reescrever em primeira pessoa |
| Likert de 3 pontos | Pouca granularidade, todos marcam o meio | Usar 5 pontos |
| Sem teachings num teste de 50+ questoes | Fadiga, abandono no meio | Inserir a cada 10-15 questoes |
| Descricao da faixa diz "voce tem X" | Implica diagnostico, risco legal | Dizer "padroes compativeis com X" |
| Todas as questoes positivas | Nao detecta aquiescencia | Incluir 20-30% invertidas |
| Cores identicas para dimensoes | Usuario nao distingue no grafico | Usar paleta cromativa distinta |
| Sem disclaimer | Risco legal, etico e reputacional | SEMPRE incluir disclaimer |
| shareText sem placeholders | Compartilhamento generico, sem personalidade | Usar `{label}` e `{percentage}` |
| indexWeights zerados | PsychEngine nao registra contribuicao | Calibrar com base no constructo |

---

> **Documento criado em Fevereiro 2026.**
> Baseado nos padroes do mind-atlas-quest e AHSD Lab.
> Uso interno — Clinica Neurodivergentes / AHSD Lab.
