import { useRef, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export type LayoutVariant = "single" | "multi";
export type LeadVariant = "pre" | "post";

const SESSION_KEY     = "pref_session_id";
const LAYOUT_KEY      = "funnel_layout";
const LEAD_VARIANT_KEY = "funnel_lead_variant";
const START_KEY       = "funnel_start_ms";

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

/** Atribui variante de captura de lead por sessão: 'pre' (antes do quiz) ou 'post' (depois) */
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
  const startedRef = useRef(false);
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

  /** Chama quando o usuário clica em ir para o checkout (Hotmart) */
  const trackCheckout = useCallback(() => {
    push("checkout_click", { step: totalSteps, total_steps: totalSteps });
  }, [totalSteps]);

  /** Detecta abandono por saída da página */
  useEffect(() => {
    const handleLeave = () => {
      if (!startedRef.current) return;
      if (lastStepRef.current === totalSteps) return; // já completou
      // usa sendBeacon para garantir envio mesmo com a aba fechando
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
      navigator.sendBeacon(
        url,
        new Blob([payload], { type: "application/json" })
      );
    };
    window.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") handleLeave();
    });
    window.addEventListener("beforeunload", handleLeave);
    return () => {
      window.removeEventListener("beforeunload", handleLeave);
    };
  }, [totalSteps]);

  return { trackStart, trackStep, trackComplete, trackCheckout };
}
