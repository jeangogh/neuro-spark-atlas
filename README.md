# Mind Atlas Quest — Documentação Completa do Sistema

> **Leia-me técnico completo** — rotas, testes A/B, analytics, temas, fontes, funil e código-fonte de todos os módulos de rastreio.  
> Serve como referência para reimplementar o sistema em outra aplicação.

---

## Índice

1. [Visão Geral do Produto](#1-visão-geral-do-produto)  
2. [Rotas da Aplicação](#2-rotas-da-aplicação)  
3. [Sistema de Testes A/B — Completo](#3-sistema-de-testes-ab--completo)  
4. [Sistema de Temas e Fontes](#4-sistema-de-temas-e-fontes)  
5. [Dashboard de Analytics](#5-dashboard-de-analytics)  
6. [Banco de Dados](#6-banco-de-dados)  
7. [Funil de Conversão](#7-funil-de-conversão)  
8. [Código-fonte dos módulos de rastreio](#8-código-fonte-dos-módulos-de-rastreio)  
9. [Hipóteses e Cores](#9-hipóteses-e-cores)  
10. [Referências Científicas](#10-referências-científicas)  
11. [Próximos Passos](#11-próximos-passos)

---

## 1. Visão Geral do Produto

Aplicação web de rastreio cognitivo e neurodivergente com funil de conversão freemium.  
O usuário realiza um questionário de 53 perguntas (blocos Likert 0–4) e recebe um relatório gratuito com hipóteses diagnósticas (AH/SD, TDAH, TEA, Trauma, Ansiedade, Depressão, Dupla Excepcionalidade). O gatilho de conversão é o "Relatório Aprofundado" — pago — que redireciona para uma página de vendas externa (Hotmart).

**Stack:** React 18 + Vite + TypeScript + Tailwind CSS + Framer Motion + Recharts + React Router DOM + Supabase (Lovable Cloud)

**URLs:**
- Preview: `https://id-preview--27944fb0-963d-438c-bdb7-71c81c54b7e8.lovable.app`
- Produção: `https://mind-atlas-quest.lovable.app`

---

## 2. Rotas da Aplicação

| Rota | Arquivo | Descrição |
|------|---------|-----------|
| `/` | `src/pages/Index.tsx` | Landing page com mockup, radar demo e curva de intervenção |
| `/triagem` | `src/pages/QuizPage.tsx` | Funil completo: lead → demográficos → quiz → resultado → paywall |
| `/resultados` | `src/pages/ResultsPage.tsx` | Página de resultados (rota auxiliar) |
| `/admin/preferencias` | `src/pages/PrefsAnalyticsPage.tsx` | **Dashboard privado** de analytics A/B |
| `*` | `src/pages/NotFound.tsx` | 404 |

> **Para acessar o dashboard:** vá para `/admin/preferencias` na URL do app.

---

## 3. Sistema de Testes A/B — Completo

O sistema roda **3 testes A/B simultâneos e independentes**, todos atribuídos por sessão (persistidos em `sessionStorage`) e rastreados no banco de dados.

### 3.1 Teste 1 — Momento da Captura de Lead

| Variante | Chave | Fluxo |
|----------|-------|-------|
| **A** | `pre` | Lead (e-mail/WhatsApp) → Demográficos → Quiz → Resultado |
| **B** | `post` | Demográficos → Quiz → Lead ("Para onde enviamos seu resultado?") → Resultado |

**Atribuição:** 50% para cada, aleatória por sessão, persistida em `sessionStorage["funnel_lead_variant"]`.

### 3.2 Teste 2 — Layout do Quiz

| Variante | Chave | Descrição |
|----------|-------|-----------|
| **A** | `single` | Uma pergunta por tela |
| **B** | `multi` | Múltiplas perguntas por tela (bloco inteiro) |

**Atribuição:** 50/50, persistida em `sessionStorage["funnel_layout"]`.

### 3.3 Teste 3 — Tema Visual (Cor + Fonte)

Não é um teste A/B puro — o usuário pode trocar manualmente pelo `ThemeSwitcher` no canto da tela. Toda troca é rastreada na tabela `preference_events`.

**Temas de cor disponíveis:**
- `eclipse` — Preto profundo + âmbar dourado (padrão)
- `amber` — Bege quente + âmbar dourado (claro)
- `cinema` — Preto extremo + verde signal

**Fontes disponíveis:**
- `playfair` — Playfair Display (padrão)
- `instrument` — Instrument Serif
- `cormorant` — Cormorant Garamond
- `dm-serif` — DM Serif Display

**Onde cada teste impacta a conversão?** → Ver Dashboard em `/admin/preferencias`, aba "Funil de Conversão", tabelas por variante.

### 3.4 O que o dashboard mostra por variante

Para cada teste, são calculados:
- **Inícios** — sessions com `quiz_start`
- **Taxa de conclusão** — `quiz_complete / quiz_start`
- **Taxa de abandono** — `quiz_abandon / quiz_start`
- **Taxa de checkout** — `checkout_click / quiz_complete`
- **Tempo médio** — ms médio da sessão até `quiz_complete`

---

## 4. Sistema de Temas e Fontes

### Como funciona

1. O usuário seleciona tema/fonte pelo `ThemeSwitcher` (componente flutuante)
2. O hook `usePreferences` aplica `data-theme` e `data-font` no `<html>`
3. O CSS em `src/index.css` usa seletores `[data-theme="..."]` para sobrescrever variáveis CSS
4. A seleção é salva em `localStorage` (persiste entre sessões) e rastreada no banco

### Variáveis CSS por tema

```css
/* Eclipse (padrão — escuro) */
[data-theme="eclipse"] {
  --background:        225 12% 7%;
  --foreground:        42 30% 96%;
  --primary:           40 88% 61%;   /* âmbar */
  --card:              225 12% 11%;
  --border:            225 10% 18%;
}

/* Amber (claro) */
[data-theme="amber"] {
  --background:        40 60% 96%;
  --foreground:        32 40% 12%;
  --primary:           36 87% 44%;   /* âmbar dourado escuro */
  --card:              40 50% 100%;
  --border:            36 20% 80%;
}

/* Cinema (preto extremo + verde) */
[data-theme="cinema"] {
  --background:        220 25% 5%;
  --foreground:        160 20% 94%;
  --primary:           174 55% 40%;  /* verde signal */
  --card:              220 22% 9%;
  --border:            220 18% 16%;
}
```

### Fontes (seletores CSS)

```css
[data-font="playfair"]   .font-display { font-family: 'Playfair Display', Georgia, serif; }
[data-font="instrument"] .font-display { font-family: 'Instrument Serif', Georgia, serif; }
[data-font="cormorant"]  .font-display { font-family: 'Cormorant Garamond', Georgia, serif; }
[data-font="dm-serif"]   .font-display { font-family: 'DM Serif Display', Georgia, serif; }
```

---

## 5. Dashboard de Analytics

**Rota:** `/admin/preferencias`  
**Arquivo:** `src/pages/PrefsAnalyticsPage.tsx`

### Abas disponíveis

| Aba | O que mostra |
|-----|-------------|
| **Funil de Conversão** | Métricas globais + tabelas A/B por: lead variant, layout, cor e fonte |
| **Temas de Cor** | Distribuição de escolhas de tema (barra proporcional) |
| **Tipografia** | Distribuição de escolhas de fonte |

### Métricas globais exibidas

- Inícios do quiz (total)
- Taxa de conclusão (%)
- Taxa de abandono (%)
- Conversão para checkout (%)
- Tempo médio para completar
- Total de sessões únicas

---

## 6. Banco de Dados

Projeto: **Lovable Cloud** (Supabase gerenciado)

### Tabela `funnel_events`

Registra cada evento do funil de conversão.

```sql
CREATE TABLE public.funnel_events (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id   TEXT NOT NULL,
  event_type   TEXT NOT NULL,  -- 'quiz_start' | 'step_advance' | 'quiz_complete' | 'checkout_click' | 'quiz_abandon'
  step         INTEGER,        -- número da questão atual (para step_advance)
  total_steps  INTEGER,        -- total de questões (53)
  elapsed_ms   INTEGER,        -- ms desde o início da sessão
  layout       TEXT DEFAULT 'single',   -- 'single' | 'multi'
  lead_variant TEXT DEFAULT 'pre',      -- 'pre' | 'post'
  color_theme  TEXT DEFAULT 'eclipse',  -- 'eclipse' | 'amber' | 'cinema'
  font_theme   TEXT DEFAULT 'playfair', -- 'playfair' | 'instrument' | 'cormorant' | 'dm-serif'
  page         TEXT,           -- pathname da URL
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE public.funnel_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can insert funnel events" ON public.funnel_events FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can read funnel events"  ON public.funnel_events FOR SELECT USING (true);
```

### Tabela `preference_events`

Registra cada troca manual de tema ou fonte.

```sql
CREATE TABLE public.preference_events (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  event_type TEXT NOT NULL,  -- 'theme' | 'font'
  value      TEXT NOT NULL,  -- 'eclipse' | 'amber' | 'cinema' | 'playfair' | ...
  page       TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE public.preference_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can insert preference events" ON public.preference_events FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can read preference events"  ON public.preference_events FOR SELECT USING (true);
```

---

## 7. Funil de Conversão

```
Landing Page (/)
  ↓ [CTA: Iniciar Rastreio Gratuito]

── VARIANTE A (lead_variant = 'pre') ──────────────────
Captura de Lead (/triagem - fase: lead)
  → "Para onde quer que enviemos seu relatório gratuito?"
  → Campos: E-mail (obrigatório) + WhatsApp (opcional)
  ↓
Pesquisa Demográfica
  → Nome → Idade → Sexo → Profissão → Laudo formal? → Qual laudo?
  ↓
── VARIANTE B (lead_variant = 'post') ─────────────────
Pesquisa Demográfica (sem lead primeiro)
  → Nome → Idade → Sexo → Profissão → Laudo formal? → Qual laudo?
  ↓
Quiz (53 perguntas em blocos Likert 0–4)
  → Blocos: AH/SD, TDAH, TEA, Trauma, Depressão, Ansiedade, Dupla Excepcionalidade
  ↓
[Apenas Variante B] Captura de Lead pós-quiz
  → "Para onde enviamos seu resultado?"
  ↓
Resultado Gratuito
  → Síntese Geral
  → Detalhamento por Área (barras + %)
  → Entenda Cada Bloco (expansível)
  → Mapa de Perfil (RadarChart)
  → Propensão de Expressão do Potencial (BarChart)
  → Trajetória com Intervenção (LineChart)
  → Teaser borrado ~1,5 páginas do Relatório Aprofundado
  ↓ [CTA: Desbloquear Relatório Aprofundado]
Página de Vendas (Hotmart — URL externa, _blank)
```

### Para alterar a URL do Hotmart

Arquivo: `src/pages/QuizPage.tsx`  
Função: `handleUnlockClick()`  
Substituir: `"https://hotmart.com"` → URL real do produto

```typescript
const salesUrl = new URL("https://hotmart.com/product/SEU-PRODUTO");
salesUrl.searchParams.set("utm_source", "mind-atlas-quiz");
salesUrl.searchParams.set("utm_medium", "result-page");
salesUrl.searchParams.set("utm_campaign", "paywall-unlock");
window.open(salesUrl.toString(), "_blank");
```

---

## 8. Código-fonte dos módulos de rastreio

### 8.1 `src/hooks/useFunnelTracking.ts` — Rastreio do funil

```typescript
import { useRef, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export type LayoutVariant = "single" | "multi";
export type LeadVariant = "pre" | "post";

const SESSION_KEY      = "pref_session_id";
const LAYOUT_KEY       = "funnel_layout";
const LEAD_VARIANT_KEY = "funnel_lead_variant";
const START_KEY        = "funnel_start_ms";

function getSessionId(): string {
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) { id = crypto.randomUUID(); sessionStorage.setItem(SESSION_KEY, id); }
  return id;
}

/** Atribui layout A/B de forma persistente por sessão */
export function getLayoutVariant(): LayoutVariant {
  let v = sessionStorage.getItem(LAYOUT_KEY) as LayoutVariant | null;
  if (!v) {
    v = Math.random() < 0.5 ? "single" : "multi";
    sessionStorage.setItem(LAYOUT_KEY, v);
  }
  return v;
}

/** Atribui variante de captura de lead: 'pre' (antes) ou 'post' (depois do quiz) */
export function getLeadVariant(): LeadVariant {
  let v = sessionStorage.getItem(LEAD_VARIANT_KEY) as LeadVariant | null;
  if (!v) {
    v = Math.random() < 0.5 ? "pre" : "post";
    sessionStorage.setItem(LEAD_VARIANT_KEY, v);
  }
  return v;
}

function getTheme(): string {
  return localStorage.getItem("color_theme") ?? "eclipse";
}

function getFont(): string {
  return localStorage.getItem("font_theme") ?? "playfair";
}

function elapsedMs(): number {
  const start = sessionStorage.getItem(START_KEY);
  if (!start) return 0;
  return Date.now() - Number(start);
}

async function push(
  event_type: string,
  extras: { step?: number; total_steps?: number } = {}
) {
  try {
    await supabase.from("funnel_events").insert({
      session_id:   getSessionId(),
      event_type,
      step:         extras.step ?? null,
      total_steps:  extras.total_steps ?? 53,
      elapsed_ms:   elapsedMs(),
      layout:       getLayoutVariant(),
      lead_variant: getLeadVariant(),
      color_theme:  getTheme(),
      font_theme:   getFont(),
      page:         window.location.pathname,
    });
  } catch (e) {
    console.warn("funnel tracking error", e);
  }
}

export function useFunnelTracking(totalSteps = 53) {
  const startedRef  = useRef(false);
  const lastStepRef = useRef<number | null>(null);

  /** Chama quando o usuário confirma lead capture e começa o quiz */
  const trackStart = useCallback(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    sessionStorage.setItem(START_KEY, String(Date.now()));
    push("quiz_start", { total_steps: totalSteps });
  }, [totalSteps]);

  /** Chama em cada avanço de questão */
  const trackStep = useCallback((step: number) => {
    if (step === lastStepRef.current) return;
    lastStepRef.current = step;
    push("step_advance", { step, total_steps: totalSteps });
  }, [totalSteps]);

  /** Chama quando o quiz é concluído (última questão respondida) */
  const trackComplete = useCallback(() => {
    push("quiz_complete", { step: totalSteps, total_steps: totalSteps });
  }, [totalSteps]);

  /** Chama quando o usuário clica em ir para o checkout */
  const trackCheckout = useCallback(() => {
    push("checkout_click", { step: totalSteps, total_steps: totalSteps });
  }, [totalSteps]);

  /** Detecta abandono por saída da página (usa sendBeacon) */
  useEffect(() => {
    const handleLeave = () => {
      if (!startedRef.current) return;
      if (lastStepRef.current === totalSteps) return;
      const payload = JSON.stringify({
        session_id:   getSessionId(),
        event_type:   "quiz_abandon",
        step:         lastStepRef.current,
        total_steps:  totalSteps,
        elapsed_ms:   elapsedMs(),
        layout:       getLayoutVariant(),
        lead_variant: getLeadVariant(),
        color_theme:  getTheme(),
        font_theme:   getFont(),
        page:         window.location.pathname,
      });
      const url = `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/funnel_events`;
      navigator.sendBeacon(url, new Blob([payload], { type: "application/json" }));
    };
    window.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") handleLeave();
    });
    window.addEventListener("beforeunload", handleLeave);
    return () => { window.removeEventListener("beforeunload", handleLeave); };
  }, [totalSteps]);

  return { trackStart, trackStep, trackComplete, trackCheckout };
}
```

### 8.2 `src/hooks/usePreferences.ts` — Temas e Fontes

```typescript
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export type ColorTheme = "eclipse" | "amber" | "cinema";
export type FontTheme  = "playfair" | "instrument" | "cormorant" | "dm-serif";

const SESSION_KEY = "pref_session_id";

function getSessionId() {
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) { id = crypto.randomUUID(); sessionStorage.setItem(SESSION_KEY, id); }
  return id;
}

async function trackEvent(type: "theme" | "font", value: string) {
  try {
    await supabase.from("preference_events").insert({
      session_id: getSessionId(),
      event_type: type,
      value,
      page: window.location.pathname,
    });
  } catch (e) {
    console.warn("preference tracking error", e);
  }
}

export function usePreferences() {
  const [theme, setThemeState] = useState<ColorTheme>(() =>
    (localStorage.getItem("color_theme") as ColorTheme) ?? "eclipse"
  );
  const [font, setFontState] = useState<FontTheme>(() =>
    (localStorage.getItem("font_theme") as FontTheme) ?? "playfair"
  );

  const setTheme = useCallback(async (t: ColorTheme) => {
    setThemeState(t);
    localStorage.setItem("color_theme", t);
    await trackEvent("theme", t);
  }, []);

  const setFont = useCallback(async (f: FontTheme) => {
    setFontState(f);
    localStorage.setItem("font_theme", f);
    await trackEvent("font", f);
  }, []);

  // Aplica tema no <html>
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // Aplica fonte no <html>
  useEffect(() => {
    document.documentElement.setAttribute("data-font", font);
  }, [font]);

  return { theme, font, setTheme, setFont };
}
```

### 8.3 `src/App.tsx` — Roteamento + ThemeProvider

```typescript
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import { usePreferences } from "@/hooks/usePreferences";

const Index             = lazy(() => import("./pages/Index"));
const QuizPage          = lazy(() => import("./pages/QuizPage"));
const ResultsPage       = lazy(() => import("./pages/ResultsPage"));
const PrefsAnalyticsPage = lazy(() => import("./pages/PrefsAnalyticsPage"));
const NotFound          = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

function ThemeProvider({ children }: { children: React.ReactNode }) {
  usePreferences(); // aplica data-theme e data-font no <html> globalmente
  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ThemeProvider>
          <Suspense fallback={null}>
            <Routes>
              <Route path="/"                    element={<Index />} />
              <Route path="/triagem"             element={<QuizPage />} />
              <Route path="/resultados"          element={<ResultsPage />} />
              <Route path="/admin/preferencias"  element={<PrefsAnalyticsPage />} />
              <Route path="*"                    element={<NotFound />} />
            </Routes>
          </Suspense>
        </ThemeProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
```

### 8.4 Como usar `useFunnelTracking` em qualquer componente

```typescript
import { useFunnelTracking, getLeadVariant } from "@/hooks/useFunnelTracking";

function MeuComponente() {
  const { trackStart, trackStep, trackComplete, trackCheckout } = useFunnelTracking(53);
  const leadVariant = getLeadVariant(); // 'pre' | 'post'

  // Quando o usuário começa o quiz:
  const handleStart = () => trackStart();

  // Quando avança uma questão:
  const handleNext  = (step: number) => trackStep(step);

  // Quando conclui o quiz:
  const handleDone  = () => trackComplete();

  // Quando clica em ir para o Hotmart:
  const handleBuy   = () => {
    trackCheckout();
    window.open("https://hotmart.com/...", "_blank");
  };
}
```

---

## 9. Hipóteses e Cores

| ID | Label | Cor | Tipo |
|----|-------|-----|------|
| `ahsd` | Altas Habilidades / Superdotação | `hsl(40, 88%, 61%)` âmbar | Força |
| `dupla_exc` | Dupla Excepcionalidade (2e) | `hsl(36, 87%, 44%)` âmbar escuro | Força+Barreira |
| `tdah` | TDAH | `hsl(0, 65%, 45%)` vermelho | Barreira |
| `tea` | Autismo (TEA) | `hsl(15, 65%, 45%)` laranja-terra | Barreira |
| `trauma` | Trauma | `hsl(340, 65%, 45%)` bordô | Barreira |
| `depressao` | Depressão | `hsl(300, 65%, 45%)` violeta | Barreira |
| `ansiedade` | Ansiedade | `hsl(32, 65%, 45%)` âmbar-laranja | Barreira |

---

## 10. Referências Científicas

- Barkley, R.A. (2015). *Attention-deficit hyperactivity disorder* (4th ed.). Guilford Press.
- Baron-Cohen, S. (2008). *Autism and Asperger Syndrome*. Oxford University Press.
- Van der Kolk, B. (2014). *The Body Keeps the Score*. Viking.
- Winner, E. (1996). *Gifted Children: Myths and Realities*. Basic Books.
- Webb, J.T. et al. (2016). *Misdiagnosis and Dual Diagnoses*. Great Potential Press.
- Shields, G.S. et al. (2016). Effects of negative affect on cognition. *Psychol Sci.*
- Eysenck, M.W. & Derakshan, N. (2011). Attentional control theory. *Pers. Indiv. Diff.*
- Rock, P.L. et al. (2014). Cognitive impairment in depression. *Psychol Med.*

---

## 11. Próximos Passos

- [ ] Substituir URL do Hotmart pela URL real do produto
- [ ] Adicionar Meta Pixel + Google Tag Manager nos eventos de checkout
- [ ] Envio automático de e-mail com resultado (Resend ou SendGrid via Edge Function)
- [ ] Conectar contador de participantes ao banco (endpoint real)
- [ ] A/B test na headline da tela de captura de lead (copy alternativo)
- [ ] Filtros por período no dashboard (24h / 7d / 30d)
- [ ] Adicionar captura do e-mail/WhatsApp no banco junto com os scores do resultado

---

*Documento gerado e mantido automaticamente — atualizar a cada nova sessão de prompts.*
