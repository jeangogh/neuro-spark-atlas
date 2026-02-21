import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export type ColorTheme = "eclipse" | "amber" | "cinema";
export type FontTheme = "playfair" | "instrument" | "cormorant" | "dm-serif";

const SESSION_KEY = "pref_session_id";

function getSessionId() {
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(SESSION_KEY, id);
  }
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
    // silent fail — analytics nao devem bloquear UX
    console.warn("preference tracking error", e);
  }
}

/**
 * Query funnel_events to find which font_theme or color_theme has the
 * highest completion rate (quiz_complete / quiz_start).
 * Returns null if there is no data or no variant meets the minimum sample size.
 */
async function fetchWinningVariant(
  dimension: "font_theme" | "color_theme"
): Promise<string | null> {
  try {
    const { data } = await supabase
      .from("funnel_events")
      .select("session_id, event_type, font_theme, color_theme");

    if (!data || data.length === 0) return null;

    // Group by variant — count starts and completes
    const variants: Record<string, { starts: number; completes: number }> = {};
    for (const row of data) {
      const key = dimension === "font_theme" ? row.font_theme : row.color_theme;
      if (!key) continue;
      if (!variants[key]) variants[key] = { starts: 0, completes: 0 };
      if (row.event_type === "quiz_start") variants[key].starts++;
      if (row.event_type === "quiz_complete") variants[key].completes++;
    }

    // Find winner by completion rate (minimum 3 starts)
    let bestKey: string | null = null;
    let bestRate = -1;
    for (const [key, { starts, completes }] of Object.entries(variants)) {
      if (starts < 3) continue;
      const rate = completes / starts;
      if (rate > bestRate) {
        bestRate = rate;
        bestKey = key;
      }
    }
    return bestKey;
  } catch {
    return null;
  }
}

export function usePreferences() {
  const [theme, setThemeState] = useState<ColorTheme>(() => {
    return (localStorage.getItem("color_theme") as ColorTheme) ?? "eclipse";
  });
  const [font, setFontState] = useState<FontTheme>(() => {
    return (localStorage.getItem("font_theme") as FontTheme) ?? "playfair";
  });

  // On mount: if no localStorage values, auto-select winning variants from analytics
  useEffect(() => {
    const hasStoredColor = localStorage.getItem("color_theme") !== null;
    const hasStoredFont = localStorage.getItem("font_theme") !== null;

    if (hasStoredColor && hasStoredFont) return;

    let cancelled = false;

    (async () => {
      const [winningColor, winningFont] = await Promise.all([
        hasStoredColor ? Promise.resolve(null) : fetchWinningVariant("color_theme"),
        hasStoredFont ? Promise.resolve(null) : fetchWinningVariant("font_theme"),
      ]);

      if (cancelled) return;

      if (winningColor && !hasStoredColor) {
        const color = winningColor as ColorTheme;
        setThemeState(color);
        localStorage.setItem("color_theme", color);
        trackEvent("theme", color);
      }

      if (winningFont && !hasStoredFont) {
        const font = winningFont as FontTheme;
        setFontState(font);
        localStorage.setItem("font_theme", font);
        trackEvent("font", font);
      }
    })();

    return () => { cancelled = true; };
  }, []);

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

  // Apply theme to <html>
  useEffect(() => {
    const html = document.documentElement;
    html.setAttribute("data-theme", theme);
  }, [theme]);

  // Apply font to <html>
  useEffect(() => {
    const html = document.documentElement;
    html.setAttribute("data-font", font);
  }, [font]);

  return { theme, font, setTheme, setFont };
}
