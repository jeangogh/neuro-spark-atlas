import { useEffect, useState, useMemo, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Navigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import {
  RotateCcw, LogOut, Download, ChevronDown, ChevronUp, Zap,
  AlertTriangle, CheckCircle2, Info, ArrowRight,
} from "lucide-react";
import BottomNav from "@/components/BottomNav";
import {
  generateIntegratedAnalysis,
  getZoneColor, getZoneLabel, getSeverityColor, conditionColor,
  CONDITION_LABELS, DIM_LABELS, DIM_SHORT, AHSD_CAT_LABELS,
  type NeurocogScores, type DimensionalScores, type AhsdAdultoScores,
  type IntegratedResult,
} from "@/data/integratedAnalysis";

/* ═══════════════════════════════════════════
   SHARED UI
   ═══════════════════════════════════════════ */

function ScoreBar({ score, max, color, delay = 0 }: { score: number; max: number; color: string; delay?: number }) {
  const pct = max > 0 ? Math.round((score / max) * 100) : 0;
  return (
    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
      <motion.div
        className="h-full rounded-full"
        style={{ backgroundColor: color }}
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.8, delay, ease: "easeOut" }}
      />
    </div>
  );
}

function PctBar({ label, pct, color, delay = 0, badge }: {
  label: string; pct: number; color: string; delay?: number; badge?: { text: string; color: string };
}) {
  return (
    <div>
      <div className="flex justify-between items-baseline text-[12px] mb-1">
        <span className="font-medium text-foreground">{label}</span>
        <div className="flex items-center gap-2">
          <span className="font-bold tabular-nums" style={{ color }}>{pct}%</span>
          {badge && (
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
              style={{ backgroundColor: `${badge.color}20`, color: badge.color }}>
              {badge.text}
            </span>
          )}
        </div>
      </div>
      <ScoreBar score={pct} max={100} color={color} delay={delay} />
    </div>
  );
}

function SectionCard({ children, delay = 0, className = "" }: {
  children: React.ReactNode; delay?: number; className?: string;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.45 }}
      className={`rounded-xl border bg-card p-5 sm:p-6 ${className}`}
    >
      {children}
    </motion.section>
  );
}

/* ═══════════════════════════════════════════
   INDIVIDUAL RESULT VIEWS
   ═══════════════════════════════════════════ */

function NeurocogView({ scores, date }: { scores: NeurocogScores; date: string }) {
  const [expanded, setExpanded] = useState(false);
  const entries = (Object.entries(scores) as [string, number][])
    .filter(([k]) => CONDITION_LABELS[k])
    .sort(([, a], [, b]) => b - a);
  const top3 = entries.slice(0, 3);
  const rest = entries.slice(3);

  const radarData = entries.map(([k, v]) => ({
    subject: CONDITION_LABELS[k] ?? k,
    score: v,
    fullMark: 100,
  }));

  return (
    <SectionCard>
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-[10px] text-primary font-semibold uppercase tracking-[0.18em]">Rastreio Neurocognitivo</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">{date}</p>
        </div>
        <Link to="/triagem" className="text-[11px] text-primary font-medium hover:underline flex items-center gap-1">
          Refazer <RotateCcw className="w-3 h-3" />
        </Link>
      </div>

      {/* Radar */}
      <div className="w-full aspect-square max-w-[260px] mx-auto mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="60%" data={radarData}>
            <PolarGrid stroke="hsl(var(--border))" />
            <PolarAngleAxis dataKey="subject" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} />
            <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 8, fill: "hsl(var(--muted-foreground))" }} tickCount={3} />
            <Radar name="Perfil" dataKey="score" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.15} strokeWidth={2} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Top 3 */}
      <div className="space-y-3">
        {top3.map(([k, v], i) => (
          <PctBar key={k} label={CONDITION_LABELS[k] ?? k} pct={v} color={conditionColor(k)} delay={0.05 + i * 0.03} />
        ))}
      </div>

      {/* Expand */}
      {rest.length > 0 && (
        <>
          <button onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 mt-3 text-[11px] text-muted-foreground hover:text-foreground transition-colors">
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            {expanded ? "Fechar" : `Ver todas (${rest.length} mais)`}
          </button>
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="space-y-3 mt-3">
                  {rest.map(([k, v], i) => (
                    <PctBar key={k} label={CONDITION_LABELS[k] ?? k} pct={v} color={conditionColor(k)} delay={0.02 * i} />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </SectionCard>
  );
}

function DimensionalView({ scores, date }: { scores: DimensionalScores; date: string }) {
  const dims = scores.c1Scores.dimensions;
  const entries = Object.entries(dims).sort(([, a], [, b]) => b.score - a.score);
  const radarData = entries.map(([k, d]) => ({
    subject: DIM_SHORT[k] ?? k,
    score: d.score,
    fullMark: 32,
  }));

  return (
    <SectionCard delay={0.05}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-[10px] text-primary font-semibold uppercase tracking-[0.18em]">Painel Dimensional</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">{date}</p>
        </div>
        <Link to="/triagem/dimensional" className="text-[11px] text-primary font-medium hover:underline flex items-center gap-1">
          Refazer <RotateCcw className="w-3 h-3" />
        </Link>
      </div>

      <div className="w-full aspect-square max-w-[260px] mx-auto mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="60%" data={radarData}>
            <PolarGrid stroke="hsl(var(--border))" />
            <PolarAngleAxis dataKey="subject" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} />
            <PolarRadiusAxis angle={90} domain={[0, 32]} tick={{ fontSize: 8, fill: "hsl(var(--muted-foreground))" }} tickCount={3} />
            <Radar name="Perfil" dataKey="score" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.15} strokeWidth={2} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-3">
        {entries.map(([k, d], i) => {
          const color = getZoneColor(d.zone);
          return (
            <div key={k}>
              <div className="flex justify-between items-baseline text-[12px] mb-1">
                <span className="font-medium text-foreground">{DIM_LABELS[k] ?? k}</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold tabular-nums" style={{ color }}>{d.score}/32</span>
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
                    style={{ backgroundColor: `${color}20`, color }}>
                    {getZoneLabel(d.zone)}
                  </span>
                </div>
              </div>
              <ScoreBar score={d.score} max={32} color={color} delay={0.05 + i * 0.03} />
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}

function AhsdView({ scores, date, testType }: {
  scores: AhsdAdultoScores; date: string; testType: string;
}) {
  const isChild = testType === "ahsd_infantil";
  const title = isChild ? "AH/SD Infantil (Pais)" : "AH/SD Adulto";
  const route = isChild ? "/triagem/ahsd_infantil" : "/triagem/ahsd_adulto";
  const cats = Object.entries(scores.categoryScores).sort(([, a], [, b]) => b.pct - a.pct);
  const hues = [40, 174, 280, 340, 210, 120];

  return (
    <SectionCard delay={0.1}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-[10px] text-primary font-semibold uppercase tracking-[0.18em]">{title}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">{date}</p>
        </div>
        <Link to={route} className="text-[11px] text-primary font-medium hover:underline flex items-center gap-1">
          Refazer <RotateCcw className="w-3 h-3" />
        </Link>
      </div>

      {/* Overall */}
      <div className="flex items-center gap-3 mb-4 p-3 rounded-lg bg-primary/[0.06]">
        <span className="text-2xl font-bold text-primary tabular-nums">{scores.pct}%</span>
        <div>
          <p className="text-[12px] font-semibold text-foreground">Pontuação Global</p>
          <p className="text-[11px] text-muted-foreground">Percentil {scores.percentile}</p>
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-3">
        {cats.map(([k, v], i) => (
          <PctBar
            key={k}
            label={AHSD_CAT_LABELS[k] ?? k}
            pct={v.pct}
            color={`hsl(${hues[i % hues.length]}, 65%, 50%)`}
            delay={0.05 + i * 0.03}
          />
        ))}
      </div>

      {isChild && (
        <p className="text-[11px] text-muted-foreground mt-3 italic">
          Este teste avalia o perfil da criança e não é incluído no cruzamento de resultados.
        </p>
      )}
    </SectionCard>
  );
}

/* ═══════════════════════════════════════════
   CROSS-ANALYSIS VIEW
   ═══════════════════════════════════════════ */

function CrossResultsView({ analysis, neurocog, dimensional, ahsdAdulto }: {
  analysis: IntegratedResult;
  neurocog: NeurocogScores | null;
  dimensional: DimensionalScores | null;
  ahsdAdulto: AhsdAdultoScores | null;
}) {
  // Build unified radar: 7 dimensions (0-100%) + top conditions (0-100%)
  const radarData: { subject: string; dim?: number; cond?: number }[] = [];

  if (dimensional) {
    for (const [k, d] of Object.entries(dimensional.c1Scores.dimensions)) {
      radarData.push({
        subject: DIM_SHORT[k] ?? k,
        dim: Math.round((d.score / 32) * 100),
        cond: neurocog ? (neurocog as any)[
          Object.entries(CONDITION_LABELS).find(([, v]) =>
            v === DIM_LABELS[k])?.[0] ?? ""
        ] ?? undefined : undefined,
      });
    }
  }

  // If we have neurocog but no dimensional, show conditions only
  const condRadarData = neurocog
    ? (Object.entries(neurocog) as [string, number][])
        .filter(([k]) => CONDITION_LABELS[k])
        .sort(([, a], [, b]) => b - a)
        .slice(0, 7)
        .map(([k, v]) => ({ subject: CONDITION_LABELS[k], score: v, fullMark: 100 }))
    : [];

  const dimRadarData = dimensional
    ? Object.entries(dimensional.c1Scores.dimensions).map(([k, d]) => ({
        subject: DIM_SHORT[k] ?? k,
        score: Math.round((d.score / 32) * 100),
        fullMark: 100,
      }))
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <p className="text-primary text-[10px] font-semibold uppercase tracking-[0.18em] mb-2">Análise Integrada</p>
        <h2 className="font-display text-xl font-bold text-foreground mb-1.5">Cruzamento de Resultados</h2>
        <p className="text-[13px] text-muted-foreground max-w-md mx-auto leading-relaxed">
          {analysis.hasNeurocog && analysis.hasDimensional
            ? "Seus testes foram cruzados para revelar onde as condições identificadas impactam seu funcionamento dimensional."
            : "Análise parcial — complete mais testes para um cruzamento mais profundo."}
        </p>
      </motion.div>

      {/* Dual Radar */}
      {condRadarData.length > 0 && dimRadarData.length > 0 && (
        <SectionCard delay={0.05}>
          <h3 className="text-foreground font-semibold mb-1 text-[15px]">Mapa Comparativo</h3>
          <p className="text-[11px] text-muted-foreground mb-4">Condições neurocognitivas vs. dimensões de adaptação</p>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-[10px] text-center text-muted-foreground uppercase tracking-widest mb-1">Condições</p>
              <div className="aspect-square">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="55%" data={condRadarData}>
                    <PolarGrid stroke="hsl(var(--border))" />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 8, fill: "hsl(var(--muted-foreground))" }} />
                    <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar dataKey="score" stroke="hsl(var(--accent))" fill="hsl(var(--accent))" fillOpacity={0.15} strokeWidth={2} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div>
              <p className="text-[10px] text-center text-muted-foreground uppercase tracking-widest mb-1">Dimensões</p>
              <div className="aspect-square">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="55%" data={dimRadarData}>
                    <PolarGrid stroke="hsl(var(--border))" />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 8, fill: "hsl(var(--muted-foreground))" }} />
                    <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar dataKey="score" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.15} strokeWidth={2} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </SectionCard>
      )}

      {/* Insights */}
      {analysis.insights.length > 0 && (
        <SectionCard delay={0.1}>
          <h3 className="text-foreground font-semibold mb-1 text-[15px]">Pontes entre Testes</h3>
          <p className="text-[11px] text-muted-foreground mb-4">Onde suas condições se relacionam com suas dimensões</p>
          <div className="space-y-4">
            {analysis.insights.map((insight, i) => {
              const Icon = insight.severity === "high" ? AlertTriangle
                : insight.severity === "medium" ? Info : CheckCircle2;
              const iconColor = getSeverityColor(insight.severity);
              return (
                <motion.div key={i}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + i * 0.04 }}
                  className="rounded-lg border p-4"
                  style={{ borderColor: `${iconColor}30` }}
                >
                  <div className="flex items-start gap-3">
                    <Icon className="w-4 h-4 mt-0.5 shrink-0" style={{ color: iconColor }} />
                    <div>
                      <p className="text-[13px] font-semibold text-foreground leading-snug">{insight.title}</p>
                      <p className="text-[12px] text-muted-foreground mt-1.5 leading-relaxed">{insight.body}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </SectionCard>
      )}

      {/* Priority Map */}
      {analysis.priorities.length > 0 && (
        <SectionCard delay={0.15}>
          <h3 className="text-foreground font-semibold mb-1 text-[15px]">Prioridades de Intervenção</h3>
          <p className="text-[11px] text-muted-foreground mb-4">Dimensões ranqueadas por custo adaptativo + condições associadas</p>
          <div className="space-y-3.5">
            {analysis.priorities.map((p, i) => {
              const color = getZoneColor(p.zone);
              return (
                <div key={p.dim}>
                  <div className="flex justify-between items-baseline text-[12px] mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground tabular-nums w-5">{i + 1}.</span>
                      <span className="font-medium text-foreground">{p.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold tabular-nums" style={{ color }}>{p.score}/{p.maxScore}</span>
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
                        style={{ backgroundColor: `${color}20`, color }}>
                        {getZoneLabel(p.zone)}
                      </span>
                    </div>
                  </div>
                  <ScoreBar score={p.score} max={p.maxScore} color={color} delay={0.05 + i * 0.03} />
                  {p.linkedConditions.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {p.linkedConditions.map(c => (
                        <span key={c} className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-accent/10 text-accent">
                          {c}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </SectionCard>
      )}

      {/* Synthesis */}
      <SectionCard delay={0.2} className="border-primary/15 bg-primary/[0.03]">
        <h3 className="text-foreground font-semibold mb-2 text-[15px]">Síntese</h3>
        <p className="text-[13px] text-card-foreground leading-relaxed">{analysis.summary}</p>
      </SectionCard>

      {/* Disclaimer */}
      <div className="rounded-xl border border-accent/20 bg-accent/[0.03] p-4 sm:p-5">
        <p className="text-[12px] text-card-foreground leading-relaxed">
          Esta análise cruzada é de autorrelato e <strong>não substitui avaliação profissional</strong>.
          Os padrões identificados indicam hipóteses que merecem investigação com profissional qualificado.
        </p>
      </div>

      {/* Export */}
      <div className="flex justify-center print:hidden">
        <button onClick={() => window.print()}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border bg-card hover:bg-muted transition-all text-[12px] font-medium text-foreground hover:scale-[1.02]">
          <Download className="w-4 h-4" /> Exportar PDF
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════ */

interface QuizResult {
  id: string;
  created_at: string;
  scores: any;
  test_type: string;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit", month: "long", year: "numeric",
  });
}

export default function HistoryPage() {
  const { user, loading, signOut } = useAuth();
  const [results, setResults] = useState<QuizResult[]>([]);
  const [fetching, setFetching] = useState(true);
  const [showCross, setShowCross] = useState(false);
  const crossRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const { data, error } = await supabase
          .from("quiz_results")
          .select("id, created_at, scores, test_type")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });
        if (error) console.warn("Error fetching results:", error);
        setResults((data as any) ?? []);
      } catch (e) {
        console.warn("Failed to fetch results:", e);
      }
      setFetching(false);
    })();
  }, [user]);

  // Extract latest of each type
  const latest = useMemo(() => {
    const map: Record<string, QuizResult> = {};
    for (const r of results) {
      if (!map[r.test_type]) map[r.test_type] = r;
    }
    return map;
  }, [results]);

  const neurocog = latest["neurocognitivo"]?.scores as NeurocogScores | undefined;
  const dimensional = latest["dimensional"]?.scores as DimensionalScores | undefined;
  const ahsdAdulto = latest["ahsd_adulto"]?.scores as AhsdAdultoScores | undefined;
  const ahsdInfantil = latest["ahsd_infantil"]?.scores as AhsdAdultoScores | undefined;

  // Can cross = at least 2 adult tests (excluding infantil)
  const adultTestCount = [neurocog, dimensional, ahsdAdulto].filter(Boolean).length;
  const canCross = adultTestCount >= 2;

  const crossAnalysis = useMemo(() => {
    if (!canCross) return null;
    return generateIntegratedAnalysis(
      neurocog ?? null,
      dimensional ?? null,
      ahsdAdulto ?? null,
    );
  }, [neurocog, dimensional, ahsdAdulto, canCross]);

  const handleCross = async () => {
    setShowCross(true);
    setTimeout(() => crossRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    // Salvar cruzamento no Supabase
    if (crossAnalysis && user) {
      try {
        await supabase.from("quiz_results").upsert([{
          user_id: user.id,
          test_type: "cross_analysis",
          answers: {},
          scores: {
            insights: crossAnalysis.insights,
            priorities: crossAnalysis.priorities,
            summary: crossAnalysis.summary,
            hasNeurocog: crossAnalysis.hasNeurocog,
            hasDimensional: crossAnalysis.hasDimensional,
            hasAhsdAdulto: crossAnalysis.hasAhsdAdulto,
            testsUsed: adultTestCount,
            generatedAt: new Date().toISOString(),
          },
        }], { onConflict: "user_id,test_type" });
      } catch (e) {
        console.warn("Failed to save cross analysis:", e);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-md print:hidden">
        <div className="max-w-3xl mx-auto px-5 h-14 flex items-center justify-between">
          <Link to="/selecionar-teste" className="flex items-center gap-2 text-[12px] font-medium text-primary hover:underline">
            <RotateCcw className="w-3.5 h-3.5" /> Novo Rastreio
          </Link>
          <button onClick={signOut} className="flex items-center gap-2 text-[12px] font-medium text-muted-foreground hover:text-foreground transition-colors">
            <LogOut className="w-3.5 h-3.5" /> Sair
          </button>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-5 py-10 pb-28">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <p className="text-primary text-[10px] font-semibold uppercase tracking-[0.18em] mb-2">Seus Resultados</p>
          <h1 className="font-display text-2xl font-bold text-foreground tracking-tight mb-2">
            Histórico de Rastreios
          </h1>
          <p className="text-muted-foreground text-[13px] max-w-md mx-auto leading-relaxed">
            {results.length === 0
              ? "Você ainda não fez nenhum rastreio."
              : `${results.length} ${results.length === 1 ? "teste realizado" : "testes realizados"}`}
          </p>
        </motion.div>

        {fetching ? (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : results.length === 0 ? (
          <div className="rounded-xl border bg-card p-8 text-center">
            <p className="text-muted-foreground text-sm mb-4">Nenhum teste encontrado.</p>
            <Link to="/selecionar-teste"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm bg-primary text-primary-foreground">
              Iniciar Rastreio <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Individual Results */}
            {neurocog && latest["neurocognitivo"] && (
              <NeurocogView scores={neurocog} date={formatDate(latest["neurocognitivo"].created_at)} />
            )}
            {dimensional && latest["dimensional"] && (
              <DimensionalView scores={dimensional} date={formatDate(latest["dimensional"].created_at)} />
            )}
            {ahsdAdulto && latest["ahsd_adulto"] && (
              <AhsdView scores={ahsdAdulto} date={formatDate(latest["ahsd_adulto"].created_at)} testType="ahsd_adulto" />
            )}
            {ahsdInfantil && latest["ahsd_infantil"] && (
              <AhsdView scores={ahsdInfantil} date={formatDate(latest["ahsd_infantil"].created_at)} testType="ahsd_infantil" />
            )}

            {/* Missing tests CTA */}
            {adultTestCount < 3 && adultTestCount > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="rounded-xl border-2 border-primary/30 bg-primary/[0.04] p-5 sm:p-6"
              >
                <div className="flex items-start gap-3 mb-4">
                  <div className="shrink-0 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center mt-0.5">
                    <Zap className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-[14px] font-semibold text-foreground mb-1">
                      {adultTestCount === 1 ? "Falta 1 teste" : `Faltam ${3 - adultTestCount} testes`} para análise completa
                    </p>
                    <p className="text-[12px] text-muted-foreground leading-relaxed">
                      {!neurocog && !dimensional
                        ? "Complete o Neurocognitivo e o Dimensional para cruzar quais condições impactam quais dimensões do seu funcionamento."
                        : !neurocog
                        ? "O Neurocognitivo identifica suas hipóteses (TDAH, TEA, AH/SD...). Sem ele, o cruzamento não sabe quais condições investigar."
                        : !dimensional
                        ? "O Dimensional mapeia 7 dimensões do seu funcionamento. Sem ele, não há como ver onde as condições do Neurocognitivo impactam."
                        : "O teste AH/SD Adulto detalha seu perfil de superdotação por categoria. Adiciona profundidade ao cruzamento."}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  {!neurocog && (
                    <Link to="/triagem" className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-[12px] bg-primary text-primary-foreground hover:scale-[1.02] transition-all">
                      <ArrowRight className="w-3.5 h-3.5" /> Fazer Neurocognitivo
                    </Link>
                  )}
                  {!dimensional && (
                    <Link to="/triagem/dimensional" className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-[12px] bg-primary text-primary-foreground hover:scale-[1.02] transition-all">
                      <ArrowRight className="w-3.5 h-3.5" /> Fazer Dimensional
                    </Link>
                  )}
                  {!ahsdAdulto && (
                    <Link to="/triagem/ahsd_adulto" className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-[12px] border-2 border-primary text-primary hover:bg-primary/10 transition-all">
                      <ArrowRight className="w-3.5 h-3.5" /> Fazer AH/SD Adulto
                    </Link>
                  )}
                </div>
              </motion.div>
            )}

            {/* CRUZAR RESULTADOS BUTTON */}
            {canCross && !showCross && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="text-center py-4"
              >
                <button
                  onClick={handleCross}
                  className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-xl font-bold text-sm transition-all hover:scale-[1.03] bg-primary text-primary-foreground"
                  style={{
                    boxShadow: "0 0 20px hsl(var(--primary) / 0.25), 0 4px 20px hsl(var(--primary) / 0.35)",
                  }}
                >
                  <Zap className="w-5 h-5" />
                  CRUZAR RESULTADOS
                </button>
                <p className="text-[11px] text-muted-foreground mt-2">
                  {adultTestCount} testes disponíveis para cruzamento
                </p>
              </motion.div>
            )}

            {/* Cross-Analysis */}
            {showCross && crossAnalysis && (
              <div ref={crossRef}>
                <div className="w-full h-px bg-border my-4" />
                <CrossResultsView
                  analysis={crossAnalysis}
                  neurocog={neurocog ?? null}
                  dimensional={dimensional ?? null}
                  ahsdAdulto={ahsdAdulto ?? null}
                />
              </div>
            )}
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  );
}
