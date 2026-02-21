import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

/* ────── Types ────── */
type PrefRow = { value: string; count: number };
type FunnelRow = {
  session_id: string;
  event_type: string;
  step: number | null;
  total_steps: number | null;
  elapsed_ms: number | null;
  layout: string;
  lead_variant: string;
  color_theme: string;
  font_theme: string;
  created_at: string;
};


type Tab = "cores" | "fontes" | "funil";

/* ────── Labels ────── */
const THEME_LABELS: Record<string, string> = {
  eclipse: "Eclipse (Preto/Âmbar)",
  amber:   "Amber (Bege/Dourado)",
  cinema:  "Cinema (Preto/Verde)",
};
const FONT_LABELS: Record<string, string> = {
  playfair:    "Playfair Display",
  instrument:  "Instrument Serif",
  cormorant:   "Cormorant Garamond",
  "dm-serif":  "DM Serif Display",
};
const LAYOUT_LABELS: Record<string, string> = {
  single: "Uma pergunta por tela",
  multi:  "Múltiplas por tela",
};
const LEAD_LABELS: Record<string, string> = {
  pre:  "Lead antes do quiz (A)",
  post: "Lead após quiz (B)",
};


/* ────── Bar component ────── */
function Bar({ label, count, total, color }: { label: string; count: number; total: number; color: string }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="mb-3">
      <div className="flex justify-between text-xs text-muted-foreground mb-1">
        <span className="font-medium text-foreground">{label}</span>
        <span className="tabular-nums">{count} ({pct}%)</span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

/* ────── Stat Card ────── */
function StatCard({ label, value, sub, color }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-1">{label}</p>
      <p className="font-display text-2xl font-bold" style={{ color: color ?? "hsl(var(--foreground))" }}>{value}</p>
      {sub && <p className="text-[11px] text-muted-foreground mt-0.5">{sub}</p>}
    </div>
  );
}

/* ────── Funnel metrics by variant ────── */
type Variant = { key: string; label: string };
type VariantMetrics = {
  starts: number;
  completes: number;
  checkouts: number;
  abandons: number;
  avgElapsedMs: number | null;
};

function computeMetrics(rows: FunnelRow[], groupBy: keyof FunnelRow): Record<string, VariantMetrics> {
  const map: Record<string, VariantMetrics> = {};
  const ensure = (k: string) => {
    if (!map[k]) map[k] = { starts: 0, completes: 0, checkouts: 0, abandons: 0, avgElapsedMs: null };
  };

  // per-session elapsed (from quiz_complete or quiz_abandon)
  const sessionElapsed: Record<string, number> = {};
  const sessionGroup: Record<string, string> = {};

  for (const row of rows) {
    const grp = String(row[groupBy] ?? "unknown");
    ensure(grp);
    sessionGroup[row.session_id] = grp;

    if (row.event_type === "quiz_start")     map[grp].starts++;
    if (row.event_type === "quiz_complete")  { map[grp].completes++; if (row.elapsed_ms) sessionElapsed[row.session_id] = row.elapsed_ms; }
    if (row.event_type === "checkout_click") map[grp].checkouts++;
    if (row.event_type === "quiz_abandon")   { map[grp].abandons++; if (row.elapsed_ms) sessionElapsed[row.session_id] = row.elapsed_ms; }
  }

  // compute avgElapsedMs per group (from completed sessions only)
  const completeSessions = Object.entries(sessionElapsed);
  const groupElapsed: Record<string, number[]> = {};
  for (const [sid, ms] of completeSessions) {
    const g = sessionGroup[sid];
    if (!g) continue;
    if (!groupElapsed[g]) groupElapsed[g] = [];
    groupElapsed[g].push(ms);
  }
  for (const [g, arr] of Object.entries(groupElapsed)) {
    if (arr.length > 0) map[g].avgElapsedMs = Math.round(arr.reduce((a, b) => a + b, 0) / arr.length);
  }

  return map;
}

function fmtMs(ms: number | null): string {
  if (ms === null || ms === 0) return "—";
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s}s`;
  return `${Math.floor(s / 60)}m ${s % 60}s`;
}

function pct(num: number, den: number): string {
  if (den === 0) return "—";
  return `${Math.round((num / den) * 100)}%`;
}

/* ────── Variant table ────── */
function VariantTable({ title, variants, metrics }: { title: string; variants: Variant[]; metrics: Record<string, VariantMetrics> }) {
  const cols = ["Variante", "Inícios", "Conclusão", "Abandono", "Checkout", "Tempo médio"];
  return (
    <div className="bg-card border border-border rounded-2xl p-5 mb-5 overflow-x-auto">
      <h3 className="font-display text-base text-foreground mb-4">{title}</h3>
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-border">
            {cols.map(c => <th key={c} className="text-left py-2 pr-4 text-muted-foreground font-medium whitespace-nowrap">{c}</th>)}
          </tr>
        </thead>
        <tbody>
          {variants.map(({ key, label }) => {
            const m = metrics[key] ?? { starts: 0, completes: 0, checkouts: 0, abandons: 0, avgElapsedMs: null };
            return (
              <tr key={key} className="border-b border-border/40 hover:bg-muted/30 transition-colors">
                <td className="py-2.5 pr-4 font-medium text-foreground whitespace-nowrap">{label}</td>
                <td className="py-2.5 pr-4 tabular-nums">{m.starts}</td>
                <td className="py-2.5 pr-4 tabular-nums text-primary">{pct(m.completes, m.starts)}</td>
                <td className="py-2.5 pr-4 tabular-nums text-destructive">{pct(m.abandons, m.starts)}</td>
                <td className="py-2.5 pr-4 tabular-nums text-accent-foreground" style={{ color: "hsl(141 58% 54%)" }}>{pct(m.checkouts, m.completes)}</td>
                <td className="py-2.5 tabular-nums text-muted-foreground">{fmtMs(m.avgElapsedMs)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* ────── Main Page ────── */
export default function PrefsAnalyticsPage() {
  const [tab, setTab] = useState<Tab>("funil");
  const [themes, setThemes]     = useState<PrefRow[]>([]);
  const [fonts, setFonts]       = useState<PrefRow[]>([]);
  const [funnelRows, setFunnelRows] = useState<FunnelRow[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    async function load() {
      const [{ data: prefData }, { data: funnelData }] = await Promise.all([
        supabase.from("preference_events").select("event_type, value"),
        supabase.from("funnel_events").select("session_id, event_type, step, total_steps, elapsed_ms, layout, lead_variant, color_theme, font_theme, created_at"),
      ]);

      // preference_events
      if (prefData) {
        const themeMap: Record<string, number> = {};
        const fontMap: Record<string, number> = {};
        prefData.forEach(r => {
          if (r.event_type === "theme") themeMap[r.value] = (themeMap[r.value] ?? 0) + 1;
          if (r.event_type === "font")  fontMap[r.value]  = (fontMap[r.value]  ?? 0) + 1;
        });
        setThemes(Object.entries(themeMap).map(([value, count]) => ({ value, count })).sort((a, b) => b.count - a.count));
        setFonts(Object.entries(fontMap).map(([value, count]) => ({ value, count })).sort((a, b) => b.count - a.count));
      }

      if (funnelData) setFunnelRows(funnelData as FunnelRow[]);
      setLoading(false);
    }
    load();
  }, []);

  /* ── Funnel global stats ── */
  const sessions = [...new Set(funnelRows.filter(r => r.event_type === "quiz_start").map(r => r.session_id))];
  const completes = [...new Set(funnelRows.filter(r => r.event_type === "quiz_complete").map(r => r.session_id))];
  const checkouts = [...new Set(funnelRows.filter(r => r.event_type === "checkout_click").map(r => r.session_id))];
  const abandons  = [...new Set(funnelRows.filter(r => r.event_type === "quiz_abandon").map(r => r.session_id))];

  const totalStarts    = sessions.length;
  const totalCompletes = completes.length;
  const totalCheckouts = checkouts.length;
  const totalAbandons  = abandons.length;

  const completedElapsed = funnelRows
    .filter(r => r.event_type === "quiz_complete" && r.elapsed_ms)
    .map(r => r.elapsed_ms as number);
  const avgElapsed = completedElapsed.length > 0
    ? Math.round(completedElapsed.reduce((a, b) => a + b, 0) / completedElapsed.length)
    : null;

  /* ── By variant ── */
  const byLayout   = computeMetrics(funnelRows, "layout");
  const byLeadVar  = computeMetrics(funnelRows, "lead_variant");
  const byTheme    = computeMetrics(funnelRows, "color_theme");
  const byFont     = computeMetrics(funnelRows, "font_theme");


  const THEME_COLORS = ["hsl(40,88%,61%)", "hsl(38,88%,52%)", "hsl(174,55%,40%)"];
  const FONT_COLORS  = ["hsl(40,88%,61%)", "hsl(174,55%,40%)", "hsl(340,55%,55%)", "hsl(245,60%,65%)"];
  const totalThemes  = themes.reduce((s, r) => s + r.count, 0);
  const totalFonts   = fonts.reduce((s, r) => s + r.count, 0);

  const TABS: { id: Tab; label: string }[] = [
    { id: "funil",  label: "Funil de Conversão" },
    { id: "cores",  label: "Temas de Cor" },
    { id: "fontes", label: "Tipografia" },
  ];

  return (
    <div className="min-h-screen bg-background px-5 py-10">
      <div className="max-w-2xl mx-auto">
        <Link to="/" className="text-xs text-muted-foreground hover:text-foreground transition-colors mb-8 inline-block">← Voltar</Link>

        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-primary mb-2">Analytics</p>
        <h1 className="font-display text-3xl text-foreground mb-6">Painel de Preferências</h1>

        {/* Tabs */}
        <div className="flex gap-1 mb-8 bg-muted/40 rounded-xl p-1">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all"
              style={{
                background: tab === t.id ? "hsl(var(--card))" : "transparent",
                color: tab === t.id ? "hsl(var(--foreground))" : "hsl(var(--muted-foreground))",
                boxShadow: tab === t.id ? "0 1px 6px hsl(var(--background) / 0.4)" : "none",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-muted-foreground text-sm">Carregando dados…</p>
        ) : (
          <>
            {/* ── FUNIL ── */}
            {tab === "funil" && (
              <div>
                {/* Global stats */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                  <StatCard label="Inícios do quiz"   value={String(totalStarts)}    color="hsl(var(--primary))" />
                  <StatCard label="Taxa de conclusão" value={pct(totalCompletes, totalStarts)} sub={`${totalCompletes} completos`} color="hsl(40,88%,61%)" />
                  <StatCard label="Taxa de abandono"  value={pct(totalAbandons, totalStarts)}  sub={`${totalAbandons} saídas`}    color="hsl(0,70%,58%)" />
                  <StatCard label="Conv. p/ checkout" value={pct(totalCheckouts, totalCompletes)} sub={`${totalCheckouts} cliques`} color="hsl(141,58%,54%)" />
                  <StatCard label="Tempo médio"       value={fmtMs(avgElapsed)} sub="para completar" />
                  <StatCard label="Total de sessões"  value={String(new Set(funnelRows.map(r => r.session_id)).size)} sub="sessões únicas" />
                </div>

                {/* By variant tables */}
                <VariantTable
                  title="Captura de lead — A/B (antes vs depois do quiz)"
                  variants={Object.entries(LEAD_LABELS).map(([key, label]) => ({ key, label }))}
                  metrics={byLeadVar}
                />
                <VariantTable
                  title="Por layout (A/B automático)"
                  variants={[{ key: "single", label: LAYOUT_LABELS.single }, { key: "multi", label: LAYOUT_LABELS.multi }]}
                  metrics={byLayout}
                />
                <VariantTable
                  title="Por tema de cor"
                  variants={Object.entries(THEME_LABELS).map(([key, label]) => ({ key, label }))}
                  metrics={byTheme}
                />
                <VariantTable
                  title="Por tipografia"
                  variants={Object.entries(FONT_LABELS).map(([key, label]) => ({ key, label }))}
                  metrics={byFont}
                />

                {totalStarts === 0 && (
                  <p className="text-sm text-muted-foreground text-center mt-4">Nenhum evento de funil registrado ainda. Complete o quiz para ver dados aqui.</p>
                )}

              </div>
            )}

            {/* ── CORES ── */}
            {tab === "cores" && (
              <div className="bg-card border border-border rounded-2xl p-6">
                <div className="flex items-baseline justify-between mb-5">
                  <h2 className="font-display text-lg text-foreground">Tema de cor</h2>
                  <span className="text-xs text-muted-foreground">{totalThemes} seleções</span>
                </div>
                {themes.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhuma escolha registrada ainda.</p>
                ) : (
                  themes.map((r, i) => (
                    <Bar key={r.value} label={THEME_LABELS[r.value] ?? r.value} count={r.count} total={totalThemes} color={THEME_COLORS[i % THEME_COLORS.length]} />
                  ))
                )}
              </div>
            )}

            {/* ── FONTES ── */}
            {tab === "fontes" && (
              <div className="bg-card border border-border rounded-2xl p-6">
                <div className="flex items-baseline justify-between mb-5">
                  <h2 className="font-display text-lg text-foreground">Tipografia</h2>
                  <span className="text-xs text-muted-foreground">{totalFonts} seleções</span>
                </div>
                {fonts.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhuma escolha registrada ainda.</p>
                ) : (
                  fonts.map((r, i) => (
                    <Bar key={r.value} label={FONT_LABELS[r.value] ?? r.value} count={r.count} total={totalFonts} color={FONT_COLORS[i % FONT_COLORS.length]} />
                  ))
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
