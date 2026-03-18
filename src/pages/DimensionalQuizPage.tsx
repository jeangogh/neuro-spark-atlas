import { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Navigate, Link, useNavigate } from "react-router-dom";
import { exportElementAsPdf } from "@/lib/exportPdf";
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import { RotateCcw, History, LogOut, Download, ChevronRight, MessageCircle, Twitter, Copy, Check } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { Textarea } from "@/components/ui/textarea";
import {
  DIMENSIONS,
  SCALE_LABELS,
  SCALE_MAX,
  MAX_SCORE_C1,
  THRESHOLD_ALOSTASE,
  TOTAL_C1_QUESTIONS,
  ESTIMATED_MINUTES_C1,
  scoreItem,
  calculateC1Scores,
  calculateC2Scores,
  getZone,
  getZoneColor,
  getZoneLabel,
  type DimensionalQuestion,
  type C1Scores,
  type C2DomainScores,
  type DimZone,
} from "@/data/dimensionalTest";

/* ────── Likert Scale ────── */
function DimLikertScale({ questionId, value, onChange }: {
  questionId: string; value: number | undefined; onChange: (id: string, val: number) => void;
}) {
  const [lastClicked, setLastClicked] = useState<number | null>(null);
  const handleClick = (v: number) => {
    onChange(questionId, v);
    setLastClicked(v);
    setTimeout(() => setLastClicked(null), 500);
  };

  return (
    <div className="flex gap-1 sm:gap-1.5 w-full">
      {SCALE_LABELS.map((opt) => {
        const selected = value === opt.value;
        const shimming = lastClicked === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => handleClick(opt.value)}
            className={`relative flex-1 flex flex-col items-center gap-0.5 py-2 px-0.5 rounded-lg border text-xs transition-all duration-150 overflow-hidden ${
              selected
                ? "text-primary-foreground border-primary/60 scale-[1.03] bg-primary"
                : "bg-card border-border text-muted-foreground hover:border-primary/30 hover:bg-primary/[0.02]"
            }`}
          >
            {shimming && (
              <motion.span
                initial={{ x: "-100%", opacity: 0.55 }}
                animate={{ x: "200%", opacity: 0 }}
                transition={{ duration: 0.48, ease: "easeOut" }}
                className="absolute inset-y-0 w-1/2 pointer-events-none"
                style={{ background: "linear-gradient(90deg, transparent, hsl(var(--accent) / 0.5), transparent)" }}
              />
            )}
            <span className="font-semibold text-sm relative z-[1]">{opt.value}</span>
            <span className="leading-tight text-center hidden sm:block text-[10px] relative z-[1]">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/* ────── Score Bar (reusable) ────── */
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

/* ────── Tripartite Cost Bar ────── */
function CostBar({ label, score, max, delay = 0 }: { label: string; score: number; max: number; delay?: number }) {
  const pct = max > 0 ? Math.round((score / max) * 100) : 0;
  const isHighCost = pct >= 70;
  const color = isHighCost ? "hsl(12, 50%, 48%)" : pct >= 40 ? "hsl(var(--accent))" : "hsl(var(--primary))";
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[11px]">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-bold tabular-nums" style={{ color }}>{score}/{max}{isHighCost ? " ← custo principal" : ""}</span>
      </div>
      <ScoreBar score={score} max={max} color={color} delay={delay} />
    </div>
  );
}

/* ────── Share Buttons ────── */
function DimShareButtons() {
  const [copied, setCopied] = useState(false);
  const url = encodeURIComponent(window.location.origin + "/selecionar-teste");
  const text = encodeURIComponent("Fiz um rastreio dimensional de adaptação — você precisa conhecer.");
  const whatsappUrl = `https://api.whatsapp.com/send?text=${text}%20${url}`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;

  const handleCopy = async () => {
    const shareText = "Fiz um rastreio dimensional de adaptação — você precisa conhecer.";
    const shareUrl = window.location.origin + "/selecionar-teste";
    if (navigator.share) {
      try { await navigator.share({ title: "Painel Dimensional", text: shareText, url: shareUrl }); } catch {}
    } else {
      await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-[11px] text-muted-foreground uppercase tracking-widest">Compartilhar resultado</p>
      <div className="flex gap-2.5">
        <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-[12px] text-white transition-all hover:opacity-90 hover:scale-[1.03]"
          style={{ background: "#25D366" }}>
          <MessageCircle className="w-4 h-4" /> WhatsApp
        </a>
        <a href={twitterUrl} target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-[12px] text-white transition-all hover:opacity-90 hover:scale-[1.03]"
          style={{ background: "#000" }}>
          <Twitter className="w-4 h-4" /> X
        </a>
        <button onClick={handleCopy}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-card hover:bg-muted transition-all text-[12px] font-medium text-foreground hover:scale-[1.03]">
          {copied ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
          {copied ? "Copiado!" : "Copiar link"}
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   PHASE: C1 RESULTS
   ═══════════════════════════════════════════ */
function C1ResultsView({ c1Scores, onDeepen, onSkipToFinal, onSignOut }: {
  c1Scores: C1Scores;
  onDeepen: () => void;
  onSkipToFinal: () => void;
  onSignOut?: () => void;
}) {
  const radarData = DIMENSIONS.map((dim) => ({
    subject: dim.shortLabel,
    score: c1Scores.dimensions[dim.key]?.score ?? 0,
    fullMark: MAX_SCORE_C1,
  }));

  const hasAlostatic = c1Scores.alostatic.length > 0;

  return (
    <div className="min-h-screen bg-background">
      <header className="pt-10 pb-6 md:pt-14 md:pb-8 px-5 text-center">
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="max-w-xl mx-auto">
          <p className="text-primary text-[10px] font-semibold uppercase tracking-[0.18em] mb-2">Painel Dimensional</p>
          <h1 className="text-foreground mb-1.5">
            Screening — Camada 1
          </h1>
          <p className="text-muted-foreground text-[13px] max-w-md mx-auto leading-relaxed">
            Seu perfil dimensional em 7 eixos. Dimensões em vermelho indicam alostase — custo adaptativo elevado.
          </p>
        </motion.div>
      </header>

      <main className="max-w-2xl mx-auto px-5 pb-24 space-y-6">
        {/* Radar */}
        <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border bg-card p-5 sm:p-6">
          <h2 className="text-foreground mb-1">Mapa Dimensional</h2>
          <div className="w-full aspect-square max-w-[340px] mx-auto">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="65%" data={radarData}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                <PolarRadiusAxis angle={90} domain={[0, MAX_SCORE_C1]} tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} tickCount={4} />
                <Radar name="Perfil" dataKey="score" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.15} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </motion.section>

        {/* Per-dimension bars */}
        <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="rounded-xl border bg-card p-5 sm:p-6">
          <h2 className="text-foreground mb-4">Detalhamento por Dimensão</h2>
          <div className="space-y-4">
            {DIMENSIONS.map((dim, i) => {
              const { score, zone } = c1Scores.dimensions[dim.key] ?? { score: 0, zone: "regulado" as DimZone };
              const color = getZoneColor(zone);
              return (
                <div key={dim.key}>
                  <div className="flex justify-between items-baseline text-[12px] mb-1">
                    <span className="font-medium text-foreground">{dim.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold tabular-nums" style={{ color }}>{score}/{MAX_SCORE_C1}</span>
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded" style={{
                        backgroundColor: `${color}20`,
                        color,
                      }}>{getZoneLabel(zone)}</span>
                    </div>
                  </div>
                  <ScoreBar score={score} max={MAX_SCORE_C1} color={color} delay={0.05 + i * 0.03} />
                </div>
              );
            })}
          </div>
        </motion.section>

        {/* CTA for Layer 2 */}
        {hasAlostatic ? (
          <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="rounded-xl border border-destructive/30 bg-destructive/[0.04] p-5 sm:p-6 text-center"
          >
            <h2 className="text-foreground mb-2">
              {c1Scores.alostatic.length} {c1Scores.alostatic.length === 1 ? "dimensão" : "dimensões"} com custo alto
            </h2>
            <p className="text-[13px] text-muted-foreground mb-4 leading-relaxed">
              Identificamos dimensões com custo adaptativo elevado. O aprofundamento mapeia onde esse custo está caindo — em desempenho, vínculo ou fisiologia.
            </p>
            <button
              onClick={onDeepen}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all hover:scale-[1.02] bg-primary text-primary-foreground"
            >
              Aprofundar dimensões alostáticas
              <ChevronRight className="w-4 h-4" />
            </button>
          </motion.section>
        ) : (
          <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="rounded-xl border border-clarity/30 bg-clarity/[0.04] p-5 sm:p-6 text-center"
          >
            <h2 className="text-foreground mb-2">Perfil Regulado</h2>
            <p className="text-[13px] text-muted-foreground mb-4 leading-relaxed">
              Nenhuma dimensão atingiu o limiar de alostase. Seu perfil indica regulação suficiente nas 7 dimensões avaliadas.
            </p>
            <button
              onClick={onSkipToFinal}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-all"
            >
              Ver resultado final
              <ChevronRight className="w-4 h-4" />
            </button>
          </motion.section>
        )}

        {/* Disclaimer */}
        <div className="rounded-xl border border-accent/20 bg-accent/[0.03] p-4 sm:p-5">
          <p className="text-[12px] text-card-foreground leading-relaxed">
            Este instrumento é de autorrelato e <strong>não substitui avaliação profissional</strong>. Os resultados indicam padrões de funcionamento que merecem investigação qualificada.
          </p>
        </div>

        {/* Sign out */}
        {onSignOut && (
          <div className="flex justify-center print:hidden">
            <button onClick={onSignOut} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-card hover:bg-muted transition-all text-[12px] font-medium text-muted-foreground hover:scale-[1.02]">
              <LogOut className="w-4 h-4" /> Sair
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

/* ═══════════════════════════════════════════
   PHASE: C2 QUIZ (one dimension at a time)
   ═══════════════════════════════════════════ */
function C2QuizView({ dimKey, answers, openAnswers, onAnswer, onOpenAnswer, onComplete, onSignOut }: {
  dimKey: string;
  answers: Record<string, number>;
  openAnswers: Record<string, string>;
  onAnswer: (id: string, val: number) => void;
  onOpenAnswer: (id: string, val: string) => void;
  onComplete: () => void;
  onSignOut?: () => void;
}) {
  const dim = DIMENSIONS.find((d) => d.key === dimKey);
  if (!dim) return null;

  const allLikert = [...dim.layer2.desempenho, ...dim.layer2.vinculo, ...dim.layer2.fisiologico];
  const allAnswered = allLikert.every((q) => answers[q.id] !== undefined);

  const sections: { label: string; items: DimensionalQuestion[] }[] = [
    { label: "Impacto em Desempenho", items: dim.layer2.desempenho },
    { label: "Impacto em Vínculo", items: dim.layer2.vinculo },
    { label: "Custo Fisiológico", items: dim.layer2.fisiologico },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="pt-10 pb-5 md:pt-14 md:pb-7 px-5 text-center">
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="max-w-md mx-auto space-y-2">
          <p className="text-primary text-[10px] font-semibold uppercase tracking-[0.18em]">Camada 2 — Aprofundamento</p>
          <h1 className="text-foreground">
            {dim.label}
          </h1>
          <p className="text-muted-foreground text-[13px] leading-relaxed">
            Mapeando onde o custo desta dimensão está caindo no seu funcionamento.
          </p>
        </motion.div>
      </header>

      <main className="max-w-lg mx-auto w-full px-5 pb-24 flex-1 space-y-8">
        {/* Scale legend (mobile) */}
        <div className="flex justify-between text-[10px] text-muted-foreground sm:hidden px-0.5 uppercase tracking-widest">
          <span>0 Não me reconheço</span>
          <span>4 Totalmente eu</span>
        </div>

        {sections.map((section) => (
          <div key={section.label}>
            <h3 className="text-[11px] uppercase tracking-widest text-primary font-semibold mb-3">{section.label}</h3>
            <div className="space-y-5">
              {section.items.map((q) => (
                <motion.div key={q.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <p className="text-[13px] text-foreground leading-relaxed mb-2">{q.text}</p>
                  <DimLikertScale questionId={q.id} value={answers[q.id]} onChange={onAnswer} />
                </motion.div>
              ))}
            </div>
          </div>
        ))}

        {/* Open questions */}
        <div>
          <h3 className="text-[11px] uppercase tracking-widest text-primary font-semibold mb-3">Perguntas Abertas</h3>
          <div className="space-y-5">
            {dim.layer2.abertas.map((oq) => (
              <div key={oq.id}>
                <p className="text-[13px] text-foreground leading-relaxed mb-2">{oq.prompt}</p>
                <Textarea
                  value={openAnswers[oq.id] ?? ""}
                  onChange={(e) => onOpenAnswer(oq.id, e.target.value)}
                  placeholder="Sua resposta (opcional)..."
                  className="min-h-[100px] text-sm"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Next / Complete */}
        <div className="pt-4">
           <button
            onClick={onComplete}
            disabled={!allAnswered}
            className={`w-full py-3 rounded-xl font-semibold text-sm transition-all disabled:opacity-40 ${allAnswered ? 'bg-primary text-primary-foreground' : ''}`}
          >
            Concluir {dim.shortLabel}
          </button>
          {onSignOut && (
            <button
              onClick={onSignOut}
              className="w-full py-2.5 rounded-xl border border-border bg-card hover:bg-muted transition-all text-[12px] font-medium text-muted-foreground flex items-center justify-center gap-2"
            >
              <LogOut className="w-3.5 h-3.5" /> Sair
            </button>
          )}
        </div>
      </main>
    </div>
  );
}

/* ═══════════════════════════════════════════
   PHASE: FINAL INTEGRATED RESULTS
   ═══════════════════════════════════════════ */
function FinalResultsView({ c1Scores, c2Scores, onRestart, onSignOut }: {
  c1Scores: C1Scores;
  c2Scores: Record<string, C2DomainScores>;
  onRestart: () => void;
  onSignOut?: () => void;
}) {
  const radarData = DIMENSIONS.map((dim) => ({
    subject: dim.shortLabel,
    score: c1Scores.dimensions[dim.key]?.score ?? 0,
    fullMark: MAX_SCORE_C1,
  }));

  // Generate synthesis
  const alostaticDims = c1Scores.alostatic.map((k) => DIMENSIONS.find((d) => d.key === k)!);
  const regulatedDims = DIMENSIONS.filter((d) => c1Scores.dimensions[d.key]?.zone === "regulado");

  const resultRef = useRef<HTMLDivElement>(null);

  // Find dominant cost across alostatic dims
  const costSummary: string[] = [];
  for (const dim of alostaticDims) {
    const scores = c2Scores[dim.key];
    if (!scores) continue;
    const desempPct = scores.desempenho.max > 0 ? scores.desempenho.score / scores.desempenho.max : 0;
    const vincPct = scores.vinculo.max > 0 ? scores.vinculo.score / scores.vinculo.max : 0;
    const fisioPct = scores.fisiologico.max > 0 ? scores.fisiologico.score / scores.fisiologico.max : 0;
    const highest = Math.max(desempPct, vincPct, fisioPct);
    const domains: string[] = [];
    if (desempPct === highest) domains.push("desempenho");
    if (vincPct === highest) domains.push("vínculo");
    if (fisioPct === highest) domains.push("fisiologia");
    costSummary.push(`${dim.shortLabel}: custo principal em ${domains.join(" e ")}`);
  }

  return (
    <div ref={resultRef} className="min-h-screen bg-background print:bg-white">
      <header className="pt-10 pb-6 md:pt-14 md:pb-8 px-5 text-center">
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="max-w-xl mx-auto">
          <p className="text-primary text-[10px] font-semibold uppercase tracking-[0.18em] mb-2">Painel Dimensional de Adaptação</p>
          <h1 className="text-foreground mb-1.5">
            Resultado Integrado
          </h1>
        </motion.div>
      </header>

      <main className="max-w-2xl mx-auto px-5 pb-24 space-y-6">
        {/* Radar */}
        <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border bg-card p-5 sm:p-6">
          <h2 className="text-foreground mb-1">Screening — Camada 1</h2>
          <div className="w-full aspect-square max-w-[320px] mx-auto">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="65%" data={radarData}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                <PolarRadiusAxis angle={90} domain={[0, MAX_SCORE_C1]} tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} tickCount={4} />
                <Radar name="Perfil" dataKey="score" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.15} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3 mt-4">
            {DIMENSIONS.map((dim, i) => {
              const { score, zone } = c1Scores.dimensions[dim.key] ?? { score: 0, zone: "regulado" as DimZone };
              const color = getZoneColor(zone);
              return (
                <div key={dim.key}>
                  <div className="flex justify-between items-baseline text-[12px] mb-1">
                    <span className="font-medium text-foreground">{dim.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold tabular-nums" style={{ color }}>{score}/{MAX_SCORE_C1}</span>
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded" style={{
                        backgroundColor: `${color}20`,
                        color,
                      }}>{getZoneLabel(zone)}</span>
                    </div>
                  </div>
                  <ScoreBar score={score} max={MAX_SCORE_C1} color={color} delay={0.05 + i * 0.02} />
                </div>
              );
            })}
          </div>
        </motion.section>

        {/* C2 Deep-dive for alostatic dimensions */}
        {alostaticDims.length > 0 && (
          <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
            className="rounded-xl border bg-card p-5 sm:p-6"
          >
            <h2 className="text-foreground mb-1">Aprofundamento — Camada 2</h2>
            <p className="text-[11px] text-muted-foreground mb-5">Mapa de custo por domínio funcional nas dimensões alostáticas</p>
            <div className="space-y-6">
              {alostaticDims.map((dim) => {
                const scores = c2Scores[dim.key];
                if (!scores) return null;
                return (
                  <div key={dim.key} className="border-t border-border pt-4 first:border-0 first:pt-0">
                    <h3 className="text-foreground mb-3">{dim.label}</h3>
                    <div className="space-y-2.5">
                      <CostBar label="Desempenho" score={scores.desempenho.score} max={scores.desempenho.max} delay={0.1} />
                      <CostBar label="Vínculo" score={scores.vinculo.score} max={scores.vinculo.max} delay={0.15} />
                      <CostBar label="Fisiológico" score={scores.fisiologico.score} max={scores.fisiologico.max} delay={0.2} />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.section>
        )}

        {/* Synthesis */}
        <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="rounded-xl border border-primary/15 bg-primary/[0.03] p-5 sm:p-6"
        >
          <h2 className="text-foreground mb-2">Síntese</h2>
          <div className="space-y-2 text-[13px] text-card-foreground leading-relaxed">
            {alostaticDims.length > 0 ? (
              <>
                <p>Sistema com {alostaticDims.length} {alostaticDims.length === 1 ? "dimensão alostática" : "dimensões alostáticas"}: {alostaticDims.map((d) => d.shortLabel).join(", ")}.</p>
                {costSummary.map((s, i) => <p key={i}>• {s}</p>)}
                {regulatedDims.length > 0 && (
                  <p>{regulatedDims.map((d) => d.shortLabel).join(", ")} {regulatedDims.length === 1 ? "regulado" : "regulados"} = {regulatedDims.length === 1 ? "recurso" : "recursos"} disponível{regulatedDims.length > 1 ? "s" : ""} para intervenção.</p>
                )}
              </>
            ) : (
              <p>Perfil regulado em todas as dimensões. Nenhuma dimensão atingiu o limiar de alostase.</p>
            )}
          </div>
        </motion.section>

        {/* Disclaimer */}
        <div className="rounded-xl border border-accent/20 bg-accent/[0.03] p-4 sm:p-5">
          <h3 className="text-foreground mb-1">Nota Importante</h3>
          <p className="text-[12px] text-card-foreground leading-relaxed">
            Este instrumento é de autorrelato e <strong>não substitui avaliação profissional</strong>. Os resultados mapeiam padrões de funcionamento e custo adaptativo que merecem investigação com profissional qualificado.
          </p>
        </div>

        {/* Share */}
        <DimShareButtons />

        {/* Actions */}
        <div className="flex gap-3 justify-center flex-wrap print:hidden">
          <button onClick={async () => { if (resultRef.current) await exportElementAsPdf(resultRef.current, "painel-dimensional.pdf"); }} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-card hover:bg-muted transition-all text-[12px] font-medium text-foreground hover:scale-[1.02]">
            <Download className="w-4 h-4" /> Exportar PDF
          </button>
          <button onClick={onRestart} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-card hover:bg-muted transition-all text-[12px] font-medium text-foreground hover:scale-[1.02]">
            <RotateCcw className="w-4 h-4" /> Refazer
          </button>
          <Link to="/selecionar-teste" className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-card hover:bg-muted transition-all text-[12px] font-medium text-foreground hover:scale-[1.02]">
            Outros Testes
          </Link>
          <Link to="/historico" className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-card hover:bg-muted transition-all text-[12px] font-medium text-foreground hover:scale-[1.02]">
            <History className="w-4 h-4" /> Meus Resultados
          </Link>
          {onSignOut && (
            <button onClick={onSignOut} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-card hover:bg-muted transition-all text-[12px] font-medium text-muted-foreground hover:scale-[1.02]">
              <LogOut className="w-4 h-4" /> Sair
            </button>
          )}
        </div>
      </main>
    </div>
  );
}

/* ═══════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════ */
type Phase = "loading" | "c1_quiz" | "c1_results" | "c2_quiz" | "final";

export default function DimensionalQuizPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>("loading");
  const [currentQuestion, setCurrentQuestion] = useState(0); // C1: flat index across all 56
  const [c1Answers, setC1Answers] = useState<Record<string, number>>({});
  const [c2Answers, setC2Answers] = useState<Record<string, number>>({});
  const [openAnswers, setOpenAnswers] = useState<Record<string, string>>({});
  const [c1Scores, setC1Scores] = useState<C1Scores | null>(null);
  const [c2Scores, setC2Scores] = useState<Record<string, C2DomainScores>>({});
  const [c2DimIndex, setC2DimIndex] = useState(0); // which alostatic dim we're deepening
  const [resultsSaved, setResultsSaved] = useState(false);
  const [savedScores, setSavedScores] = useState<any>(null);

  // Flatten C1 questions
  const allC1Questions = useMemo(() =>
    DIMENSIONS.flatMap((dim) => dim.questionsC1),
    []
  );

  const c1Progress = TOTAL_C1_QUESTIONS > 0 ? Math.round((Object.keys(c1Answers).length / TOTAL_C1_QUESTIONS) * 100) : 0;
  const currentQ = allC1Questions[currentQuestion];

  // Check for saved result on mount
  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const { data, error } = await supabase
          .from("quiz_results")
          .select("scores")
          .eq("user_id", user.id)
          .eq("test_type", "dimensional")
          .order("created_at", { ascending: false })
          .limit(1);
        if (error) {
          console.warn("Error loading saved results:", error);
          setPhase("c1_quiz");
          return;
        }
        if (data && data.length > 0) {
          const saved = data[0].scores as any;
          if (saved?.c1Scores) {
            setC1Scores(saved.c1Scores);
            setC2Scores(saved.c2Scores ?? {});
            setSavedScores(saved);
            setPhase("final");
          } else {
            setPhase("c1_quiz");
          }
        } else {
          setPhase("c1_quiz");
        }
      } catch (e) {
        console.warn("Failed to load saved results:", e);
        setPhase("c1_quiz");
      }
    })();
  }, [user]);

  const saveResults = async (c1: C1Scores, c2: Record<string, C2DomainScores>) => {
    if (resultsSaved || !user) return;
    try {
      await supabase.from("quiz_results").insert({
        user_id: user.id,
        answers: { c1: c1Answers, c2: c2Answers, open: openAnswers } as any,
        scores: { c1Scores: c1, c2Scores: c2 } as any,
        test_type: "dimensional",
      });
      setResultsSaved(true);
    } catch (e) {
      console.warn("Error saving results:", e);
    }
  };

  if (!loading && !user) return <Navigate to="/auth" replace />;

  if (loading || phase === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const handleC1Answer = (id: string, val: number) => {
    setC1Answers((p) => ({ ...p, [id]: val }));
    // Auto-advance after short delay
    setTimeout(() => {
      setCurrentQuestion((c) => {
        if (c < allC1Questions.length - 1) {
          window.scrollTo({ top: 0, behavior: "smooth" });
          return c + 1;
        }
        return c;
      });
    }, 350);
  };

  const handleC1Finish = () => {
    const scores = calculateC1Scores(c1Answers);
    setC1Scores(scores);
    setPhase("c1_results");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeepen = () => {
    setC2DimIndex(0);
    setPhase("c2_quiz");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleC2Answer = (id: string, val: number) => setC2Answers((p) => ({ ...p, [id]: val }));
  const handleOpenAnswer = (id: string, val: string) => setOpenAnswers((p) => ({ ...p, [id]: val }));

  const handleC2DimComplete = () => {
    if (!c1Scores) return;
    const dimKey = c1Scores.alostatic[c2DimIndex];
    const scores = calculateC2Scores(dimKey, c2Answers);
    const newC2 = { ...c2Scores, [dimKey]: scores };
    setC2Scores(newC2);

    if (c2DimIndex < c1Scores.alostatic.length - 1) {
      setC2DimIndex((i) => i + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      saveResults(c1Scores, newC2);
      setPhase("final");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSkipToFinal = () => {
    if (c1Scores) {
      saveResults(c1Scores, {});
    }
    setPhase("final");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleRestart = () => {
    setC1Answers({});
    setC2Answers({});
    setOpenAnswers({});
    setC1Scores(null);
    setC2Scores({});
    setC2DimIndex(0);
    setCurrentQuestion(0);
    setResultsSaved(false);
    setSavedScores(null);
    setPhase("c1_quiz");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ──── C1 RESULTS ────
  if (phase === "c1_results" && c1Scores) {
    return <C1ResultsView c1Scores={c1Scores} onDeepen={handleDeepen} onSkipToFinal={handleSkipToFinal} onSignOut={() => navigate("/selecionar-teste")} />;
  }

  // ──── C2 QUIZ ────
  if (phase === "c2_quiz" && c1Scores) {
    const dimKey = c1Scores.alostatic[c2DimIndex];
    return (
      <C2QuizView
        dimKey={dimKey}
        answers={c2Answers}
        openAnswers={openAnswers}
        onAnswer={handleC2Answer}
        onOpenAnswer={handleOpenAnswer}
        onComplete={handleC2DimComplete}
        onSignOut={() => navigate("/selecionar-teste")}
      />
    );
  }

  // ──── FINAL RESULTS ────
  if (phase === "final") {
    const finalC1 = c1Scores ?? savedScores?.c1Scores;
    const finalC2 = Object.keys(c2Scores).length > 0 ? c2Scores : (savedScores?.c2Scores ?? {});
    if (finalC1) {
      return <FinalResultsView c1Scores={finalC1} c2Scores={finalC2} onRestart={handleRestart} onSignOut={() => navigate("/selecionar-teste")} />;
    }
  }

  // ──── C1 QUIZ ────
  // Find which dimension the current question belongs to
  let dimLabel = "";
  let dimIdx = 0;
  let countSoFar = 0;
  for (let i = 0; i < DIMENSIONS.length; i++) {
    if (currentQuestion < countSoFar + DIMENSIONS[i].questionsC1.length) {
      dimLabel = DIMENSIONS[i].label;
      dimIdx = currentQuestion - countSoFar + 1;
      break;
    }
    countSoFar += DIMENSIONS[i].questionsC1.length;
  }

  const isLastQuestion = currentQuestion === allC1Questions.length - 1;
  const allC1Answered = Object.keys(c1Answers).length === TOTAL_C1_QUESTIONS;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="pt-10 pb-5 md:pt-14 md:pb-7 px-5 text-center">
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="max-w-md mx-auto space-y-2">
          <p className="text-primary text-[10px] font-semibold uppercase tracking-[0.18em]">
            Painel Dimensional de Adaptação
          </p>
          <h1 className="text-foreground">
            Screening Dimensional
          </h1>
          <p className="text-muted-foreground text-[13px] leading-relaxed">
            56 itens · 7 dimensões · <span className="font-semibold text-foreground">~{ESTIMATED_MINUTES_C1} minutos</span>
          </p>
        </motion.div>
      </header>

      {/* Progress */}
      <div className="max-w-lg mx-auto w-full px-5 mb-2">
        <div className="flex items-baseline justify-between mb-1.5">
          <span className="font-semibold text-foreground text-sm tabular-nums">{c1Progress}%</span>
          <span className="text-[11px] text-muted-foreground tabular-nums">{Object.keys(c1Answers).length}/{TOTAL_C1_QUESTIONS}</span>
        </div>
        <div className="w-full h-1.5 rounded-full overflow-hidden bg-muted">
          <motion.div
            className="h-full rounded-full bg-primary"
            animate={{ width: `${c1Progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Dimension label */}
      <div className="max-w-lg mx-auto w-full px-5 mb-5">
        <span className="text-[10px] uppercase tracking-widest text-primary font-semibold">{dimLabel}</span>
      </div>

      {/* Question */}
      <main className="max-w-lg mx-auto w-full px-5 pb-24 flex-1">
        {/* Scale legend (mobile) */}
        <div className="flex justify-between text-[10px] text-muted-foreground sm:hidden px-0.5 uppercase tracking-widest mb-3">
          <span>0 Não me reconheço</span>
          <span>4 Totalmente eu</span>
        </div>

        {currentQ && (
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQ.id}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
              className="space-y-4"
            >
              <p className="text-base text-foreground leading-relaxed font-medium">
                {currentQ.text}
              </p>
              <DimLikertScale
                questionId={currentQ.id}
                value={c1Answers[currentQ.id]}
                onChange={handleC1Answer}
              />
            </motion.div>
          </AnimatePresence>
        )}

        {/* Navigation */}
        <div className="flex gap-3 mt-8">
          <button
            onClick={() => { setCurrentQuestion((c) => Math.max(0, c - 1)); window.scrollTo({ top: 0, behavior: "smooth" }); }}
            disabled={currentQuestion === 0}
            className="flex-1 py-2.5 rounded-xl border border-border bg-card text-foreground text-sm font-medium disabled:opacity-30 hover:bg-muted transition-all"
          >
            ← Anterior
          </button>
          {isLastQuestion ? (
            <button
              onClick={handleC1Finish}
              disabled={!allC1Answered}
              className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all disabled:opacity-40 ${allC1Answered ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
            >
              {allC1Answered ? "Ver Resultado →" : `Faltam ${TOTAL_C1_QUESTIONS - Object.keys(c1Answers).length} respostas`}
            </button>
          ) : (
            <button
              onClick={() => { setCurrentQuestion((c) => Math.min(allC1Questions.length - 1, c + 1)); window.scrollTo({ top: 0, behavior: "smooth" }); }}
              disabled={c1Answers[currentQ?.id] === undefined}
              className="flex-1 py-2.5 rounded-xl border border-border bg-card text-foreground text-sm font-medium disabled:opacity-30 hover:bg-muted transition-all"
            >
              Próxima →
            </button>
          )}
        </div>
        <div className="flex justify-center mt-4">
          <button
            onClick={() => navigate("/selecionar-teste")}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-border bg-card hover:bg-muted transition-all text-[11px] font-medium text-muted-foreground"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sair do teste
          </button>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
