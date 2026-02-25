import { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useFunnelTracking, getLayoutVariant, getLeadVariant } from "@/hooks/useFunnelTracking";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Navigate, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Cell, Tooltip, LineChart, Line, ReferenceLine, Label, AreaChart, Area,
} from "recharts";
import {
  MessageCircle, Twitter, Download, RotateCcw, Copy, Check, ChevronDown, Lock, LogOut, History,
} from "lucide-react";
import {
  questionBlocks,
  likertOptions,
  type Answers,
  calculateScores,
  interpretResults,
  type HypothesisResult,
  ESTIMATED_MINUTES,
  TOTAL_QUESTIONS,
} from "@/data/quizQuestions";

/* ────── CONSTANTS ────── */
const HYPOTHESIS_ORDER = ["ahsd", "dupla_exc", "tdah", "tea", "trauma", "depressao", "ansiedade"];

const CONDITION_COLORS: Record<string, { hue: number; label: string }> = {
  ahsd:      { hue: 40,  label: "AH/SD" },
  dupla_exc: { hue: 36,  label: "Dupla Exc." },
  tdah:      { hue: 0,   label: "TDAH" },
  tea:       { hue: 15,  label: "Autismo" },
  trauma:    { hue: 340, label: "Trauma" },
  depressao: { hue: 300, label: "Depressão" },
  ansiedade: { hue: 32,  label: "Ansiedade" },
};

function conditionColor(id: string, score: number) {
  const cfg = CONDITION_COLORS[id];
  if (!cfg) return `hsl(${Math.round(154 - (score / 100) * 10)}, 24%, 38%)`;
  if (id === "ahsd") return `hsl(154, 24%, 38%)`;
  if (id === "dupla_exc") return `hsl(31, 53%, 50%)`;
  return `hsl(${cfg.hue}, 65%, 45%)`;
}

/* ────── Theme colors (result section) ────── */
const THEME = {
  bg: "hsl(var(--background))",
  bgMid: "hsl(var(--card))",
  border: "hsl(var(--border))",
  text: "hsl(var(--foreground))",
  muted: "hsl(var(--muted-foreground))",
  accent: "hsl(var(--primary))",
  accentDeep: "hsl(var(--accent))",
};

/* ────── Likert Scale — with shimmer on select ────── */
function LikertScale({ questionId, value, onChange }: {
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
      {likertOptions.map((opt) => {
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

/* ────── Motivational Toast — top of screen ────── */
function MotivationalToast({ message }: { message: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -24, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -16, scale: 0.97 }}
      transition={{ duration: 0.32, ease: [0.25, 0.1, 0.25, 1] }}
      className="fixed z-50 left-1/2 -translate-x-1/2 px-5 py-3 rounded-xl shadow-2xl text-[13px] font-medium max-w-sm text-center pointer-events-none bg-primary text-primary-foreground"
      style={{
        top: "4.5rem",
        boxShadow: "0 0 20px hsl(var(--primary) / 0.3), 0 8px 32px hsl(var(--primary) / 0.4)",
      }}
    >
      {message}
    </motion.div>
  );
}

/* ────── Score Bar ────── */
function ScoreBar({ score, id, delay = 0 }: { score: number; id?: string; delay?: number }) {
  const color = id ? conditionColor(id, score) : `hsl(${Math.round(120 - (score / 100) * 120)}, 65%, 45%)`;
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

/* ────── Radar Chart ────── */
function ProfileRadarChart({ hypotheses }: { hypotheses: HypothesisResult[] }) {
  const data = hypotheses.map((h) => ({
    subject: CONDITION_COLORS[h.id]?.label ?? h.label.split(" — ")[0].slice(0, 10),
    score: h.score,
    fullMark: 100,
  }));
  return (
    <div className="w-full aspect-square max-w-[320px] mx-auto">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="68%" data={data}>
          <PolarGrid stroke="hsl(var(--border))" />
          <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
          <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} tickCount={4} />
          <Radar name="Perfil" dataKey="score" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.15} strokeWidth={2} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ────── Intervention Curve — dynamic based on barrier scores ────── */
function InterventionCurveChart({ dark = false, barrierAvg = 50 }: { dark?: boolean; barrierAvg?: number }) {
  const floor = Math.max(60, Math.round(82 - barrierAvg * 0.12));
  const peak  = Math.round(88 + barrierAvg * 0.04);
  const intPeak = Math.round(88 + barrierAvg * 0.06);

  const data = [
    { age: 0,  baseline: 28,        intervention: null },
    { age: 5,  baseline: 50,        intervention: null },
    { age: 10, baseline: 70,        intervention: null },
    { age: 15, baseline: 84,        intervention: null },
    { age: 20, baseline: peak,      intervention: null },
    { age: 25, baseline: peak - 1,  intervention: null },
    { age: 30, baseline: peak - 4,  intervention: null },
    { age: 35, baseline: floor + 8, intervention: floor + 8 },
    { age: 40, baseline: floor + 5, intervention: intPeak },
    { age: 45, baseline: floor + 3, intervention: intPeak - 1 },
    { age: 50, baseline: floor + 2, intervention: intPeak - 2 },
    { age: 60, baseline: floor + 1, intervention: intPeak - 4 },
    { age: 70, baseline: floor,     intervention: intPeak - 7 },
    { age: 80, baseline: floor,     intervention: intPeak - 10 },
    { age: 90, baseline: floor,     intervention: intPeak - 13 },
  ];

  const borderColor = "hsl(var(--border))";
  const mutedColor  = "hsl(var(--muted-foreground))";
  const cardColor   = "hsl(var(--card))";

  return (
    <div className="w-full" style={{ height: 220 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ left: 0, right: 16, top: 12, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={borderColor} />
          <XAxis dataKey="age" tick={{ fontSize: 10, fill: mutedColor }} tickFormatter={(v) => `${v}`}>
            <Label value="Idade" position="insideBottom" offset={-10} style={{ fontSize: 10, fill: mutedColor }} />
          </XAxis>
          <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: mutedColor }}>
            <Label value="Performance" angle={-90} position="insideLeft" offset={14} style={{ fontSize: 10, fill: mutedColor }} />
          </YAxis>
          <Tooltip
            contentStyle={{ backgroundColor: cardColor, border: `1px solid ${borderColor}`, borderRadius: 8, fontSize: 11 }}
            formatter={(value: number, name: string) => [
              `${value}`,
              name === "baseline" ? "Sem intervenção" : "Com intervenção direcionada",
            ]}
          />
          <ReferenceLine x={35} stroke="hsl(var(--primary))" strokeDasharray="4 3" strokeWidth={1.5}
            label={{ value: "Intervenção", position: "top", fontSize: 9, fill: "hsl(var(--primary))" }} />
          <Line type="natural" dataKey="baseline" stroke="hsl(0,55%,50%)" strokeWidth={2} dot={false} connectNulls={false} />
          <Line type="natural" dataKey="intervention" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={false} connectNulls={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ────── Scientific References Modal ────── */
function ReferencesModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-5"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.94, opacity: 0, y: 16 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.94, opacity: 0 }}
        transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
        className="bg-card border rounded-xl p-6 max-w-lg w-full shadow-2xl max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-foreground mb-4">Referências Científicas</h2>
        <div className="space-y-3 text-[12px] text-card-foreground leading-relaxed">
          {[
            { ref: "Barkley, R.A. (2015). Attention-deficit hyperactivity disorder (4th ed.). Guilford Press.", note: "Base para compreensão do TDAH como disfunção executiva." },
            { ref: "Baron-Cohen, S. (2008). Autism and Asperger Syndrome. Oxford University Press.", note: "Cognição social e espectro autista." },
            { ref: "Van der Kolk, B. (2014). The Body Keeps the Score. Viking.", note: "Trauma e impacto no funcionamento cognitivo." },
            { ref: "Winner, E. (1996). Gifted Children: Myths and Realities. Basic Books.", note: "Alta habilidade/superdotação e dupla excepcionalidade." },
            { ref: "Webb, J.T. et al. (2016). Misdiagnosis and Dual Diagnoses. Great Potential Press.", note: "Diagnósticos errôneos em superdotados — base do conceito 2e." },
            { ref: "Shields, G.S. et al. (2016). Effects of negative affect on cognition. Psychol Sci.", note: "Estados emocionais negativos reduzem desempenho em 20–30%." },
            { ref: "Eysenck, M.W. & Derakshan, N. (2011). Attentional control theory. Pers. Indiv. Diff.", note: "Ansiedade e custo cognitivo." },
            { ref: "Rock, P.L. et al. (2014). Cognitive impairment in depression. Psychol Med.", note: "Depressão e redução de performance cognitiva." },
          ].map((item, i) => (
            <div key={i} className="border-b border-border pb-2.5 last:border-0">
              <p className="font-medium text-foreground mb-0.5">{item.ref}</p>
              <p className="text-muted-foreground">{item.note}</p>
            </div>
          ))}
        </div>
        <button onClick={onClose} className="mt-4 text-[11px] text-primary hover:underline">Fechar</button>
      </motion.div>
    </motion.div>
  );
}

/* ────── Expandable Hypothesis Card ────── */
function HypothesisCard({ hypothesis, index, forceExpanded = false }: { hypothesis: HypothesisResult; index: number; forceExpanded?: boolean }) {
  const [expanded, setExpanded] = useState(forceExpanded);
  useEffect(() => { if (forceExpanded) setExpanded(true); }, [forceExpanded]);
  const color = conditionColor(hypothesis.id, hypothesis.score);

  function formatDescription(text: string) {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={i} className="font-semibold italic text-foreground">{part.slice(2, -2)}</strong>;
      }
      return <span key={i}>{part}</span>;
    });
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.06 + index * 0.035 }}
      className="rounded-xl border bg-card overflow-hidden"
    >
      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <div className="flex-1">
            <h3 className="text-foreground leading-snug">{hypothesis.label}</h3>
            {(hypothesis.id === "ahsd") && (
              <p className="text-[10px] text-muted-foreground mt-0.5 italic">
                Funcionamento cognitivo de alta complexidade — não se resume a notas ou QI
              </p>
            )}
          </div>
          <span
            className="text-[11px] font-bold px-2.5 py-1 rounded-md shrink-0 tabular-nums"
            style={{ backgroundColor: `${color}18`, color }}
          >
            {hypothesis.score}%
          </span>
        </div>
        <ScoreBar score={hypothesis.score} id={hypothesis.id} delay={0.1 + index * 0.035} />
        <p className="text-[13px] text-muted-foreground leading-relaxed mt-2.5">{hypothesis.shortDescription}</p>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-primary text-[11px] font-medium mt-2 hover:underline tracking-wide uppercase"
        >
          {expanded ? "Fechar" : "Entender este bloco"}
        </button>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            className="overflow-hidden"
          >
            <div className="px-4 sm:px-5 pb-5 border-t border-border">
              <div className="text-[13px] text-card-foreground leading-relaxed whitespace-pre-line mt-3 space-y-2">
                {hypothesis.fullDescription.split("\n\n").map((para, pi) => (
                  <p key={pi}>{formatDescription(para)}</p>
                ))}
              </div>
              {hypothesis.id === "ahsd" && (
                <div className="mt-3 p-3 rounded-lg bg-primary/5 border border-primary/15">
                  <p className="text-[12px] text-primary font-medium italic">
                    AH/SD é um <strong>modo de funcionar</strong>, não um título. Pessoas superdotadas frequentemente <strong>não se reconhecem</strong> como tal — porque seus desafios dominam sua autoimagem.
                  </p>
                </div>
              )}
              {hypothesis.id === "dupla_exc" && (
                <div className="mt-3 p-3 rounded-lg bg-secondary/50 border border-border">
                  <p className="text-[12px] text-card-foreground italic">
                    <strong>"Eu sei que sou capaz, mas não consigo render como deveria."</strong> — essa frase descreve a experiência central da dupla excepcionalidade.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ────── Share Buttons (social style) ────── */
function ShareButtons({ onShare }: { onShare: () => void }) {
  const [copied, setCopied] = useState(false);
  const url = encodeURIComponent(window.location.origin + "/triagem");
  const text = encodeURIComponent("Fiz o rastreio de Altas Habilidades e Neurodivergência — você precisa conhecer.");
  const whatsappUrl = `https://api.whatsapp.com/send?text=${text}%20${url}`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;

  const handleCopy = async () => {
    await onShare();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-[11px] text-muted-foreground uppercase tracking-widest">Compartilhar resultado</p>
      <div className="flex gap-2.5">
        <a
          href={whatsappUrl} target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-[12px] text-white transition-all hover:opacity-90 hover:scale-[1.03]"
          style={{ background: "#25D366" }}
        >
          <MessageCircle className="w-4 h-4" />
          <span>WhatsApp</span>
        </a>
        <a
          href={twitterUrl} target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-[12px] text-white transition-all hover:opacity-90 hover:scale-[1.03]"
          style={{ background: "#000" }}
        >
          <Twitter className="w-4 h-4" />
          <span>X</span>
        </a>
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-card hover:bg-muted transition-all text-[12px] font-medium text-foreground hover:scale-[1.03]"
        >
          {copied ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
          <span>{copied ? "Copiado!" : "Copiar link"}</span>
        </button>
      </div>
    </div>
  );
}

/* ────── Results View (works with answers OR scores directly) ────── */
function ResultsView({ answers, scores: scoresProp, onRestart, onSignOut }: {
  answers?: Answers;
  scores?: Record<string, number>;
  onRestart: () => void;
  onSignOut?: () => void;
}) {
  const scores = useMemo(() => scoresProp ?? (answers ? calculateScores(answers) : null), [answers, scoresProp]) as any;
  const results = useMemo(() => interpretResults(scores), [scores]);
  const [showRefs, setShowRefs] = useState(false);
  const [printMode, setPrintMode] = useState(false);

  const sortedHypotheses = useMemo(() => {
    return [...results.hypotheses].sort((a, b) => {
      const ai = HYPOTHESIS_ORDER.indexOf(a.id);
      const bi = HYPOTHESIS_ORDER.indexOf(b.id);
      return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
    });
  }, [results.hypotheses]);

  const handleShare = async () => {
    const text = "Fiz o rastreio de Altas Habilidades e Neurodivergência — você precisa conhecer.";
    const url = window.location.origin + "/triagem";
    if (navigator.share) {
      try { await navigator.share({ title: "Rastreio de Altas Habilidades", text, url }); } catch {}
    } else {
      await navigator.clipboard.writeText(`${text}\n${url}`);
    }
  };

  return (
    <div className="min-h-screen bg-background print:bg-white">
      {/* Header */}
      <header className="pt-10 pb-6 md:pt-14 md:pb-8 px-5 text-center">
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="max-w-xl mx-auto">
          <p className="text-primary text-[10px] font-semibold uppercase tracking-[0.18em] mb-2">Rastreio de Altas Habilidades e Neurodivergência</p>
          <h1 className="text-foreground mb-1.5">
            Seu Resultado
          </h1>
          <p className="text-muted-foreground text-[13px] max-w-md mx-auto leading-relaxed">
            Análise baseada em suas respostas. Este resultado levanta hipóteses — não constitui diagnóstico.
          </p>
        </motion.div>
      </header>

      <main className="max-w-2xl mx-auto px-5 pb-24 space-y-8">
        {/* Summary */}
        <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="rounded-xl border border-primary/15 bg-primary/[0.03] p-5 sm:p-6">
          <h2 className="text-foreground mb-2">Síntese Geral</h2>
          <p className="text-[13px] text-card-foreground leading-relaxed whitespace-pre-line">{results.summary}</p>
        </motion.section>

        {/* Potential vs Expression */}
        <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.05 }} className="rounded-xl border border-accent/20 bg-accent/[0.03] p-5 sm:p-6">
          <h2 className="text-foreground mb-2">Potencial vs. Expressão</h2>
          <p className="text-[13px] text-card-foreground leading-relaxed whitespace-pre-line">{results.potentialVsExpression}</p>
        </motion.section>

        {/* Detalhamento por Área */}
        <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.08 }} className="rounded-xl border bg-card p-5 sm:p-6">
          <h2 className="text-foreground mb-1">Detalhamento por Área</h2>
          <p className="text-[11px] text-muted-foreground mb-4 leading-relaxed">Intensidade dos padrões identificados em cada dimensão</p>
          <div className="space-y-3.5">
            {sortedHypotheses.map((h, i) => {
              const color = conditionColor(h.id, h.score);
              return (
                <div key={h.id}>
                  <div className="flex justify-between items-baseline text-[12px] mb-1">
                    <span className="font-medium text-foreground">{CONDITION_COLORS[h.id]?.label ?? h.label.split(" — ")[0]}</span>
                    <span className="font-bold tabular-nums text-[13px]" style={{ color }}>{h.score}%</span>
                  </div>
                  <ScoreBar score={h.score} id={h.id} delay={0.08 + i * 0.03} />
                </div>
              );
            })}
          </div>
        </motion.section>

        {/* Entenda Cada Área */}
        <section className="space-y-2.5">
          <div className="mb-1">
            <h2 className="text-foreground">Entenda Cada Bloco</h2>
            <p className="text-[11px] text-muted-foreground mt-0.5">Toque em cada área para expandir a explicação completa</p>
          </div>
          {sortedHypotheses.map((h, i) => (
            <HypothesisCard key={h.id} hypothesis={h} index={i} forceExpanded={printMode} />
          ))}
        </section>

        {/* Mapa de Perfil */}
        <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.12 }} className="rounded-xl border bg-card p-5 sm:p-6">
          <h2 className="text-foreground mb-1">Mapa de Perfil</h2>
          <p className="text-[11px] text-muted-foreground mb-4">Visão integrada de todas as dimensões avaliadas</p>
          <ProfileRadarChart hypotheses={sortedHypotheses} />
        </motion.section>

        {/* Propensão de Expressão do Potencial */}
        <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.14 }} className="rounded-xl border bg-card p-5 sm:p-6">
          <h2 className="text-foreground mb-1">Propensão de Expressão do Potencial</h2>
          <div className="mt-3 p-3.5 rounded-lg bg-primary/5 border border-primary/15">
            <p className="text-[12px] text-card-foreground leading-relaxed">
              <strong className="italic">Pesquisas indicam que transtornos emocionais e neurofuncionais não tratados reduzem o desempenho cognitivo em 20 a 30%.</strong> Este gráfico mostra o quanto cada área pode melhorar com intervenção direcionada.
            </p>
            <button onClick={() => setShowRefs(true)} className="text-[11px] text-primary hover:underline mt-1.5">
              Ver referências
            </button>
          </div>
        </motion.section>

        {/* Curva de Intervenção */}
        <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.16 }} className="rounded-xl border bg-card p-5 sm:p-6">
          <h2 className="text-foreground mb-1">Trajetória com Intervenção</h2>
          <p className="text-[11px] text-muted-foreground mb-4 leading-relaxed">
            Projeção de desempenho cognitivo e performance ao longo da vida
          </p>
          <InterventionCurveChart />
          <div className="flex items-center gap-5 mt-3 justify-center">
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-0.5" style={{ backgroundColor: "hsl(0,55%,50%)" }} />
              <span className="text-[11px] text-muted-foreground">Sem intervenção</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-0.5 bg-primary" />
              <span className="text-[11px] text-muted-foreground">Com intervenção direcionada</span>
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground mt-3 text-center italic">
            O ponto de inflexão aos 35 anos representa o momento em que intervenção adequada pode reverter a curva descendente.
          </p>
        </motion.section>

        {/* Disclaimer */}
        <div className="rounded-xl border border-accent/20 bg-accent/[0.03] p-4 sm:p-5">
          <h3 className="text-foreground mb-1">Nota Importante</h3>
          <p className="text-[12px] text-card-foreground leading-relaxed">
            Este questionário é um instrumento de autorrelato e <strong>não substitui avaliação profissional</strong>. Os resultados indicam padrões de funcionamento que merecem investigação com profissional qualificado.
          </p>
        </div>

        <div className="text-center">
          <button onClick={() => setShowRefs(true)} className="text-[12px] text-muted-foreground hover:text-primary underline underline-offset-4 transition-colors">
            Referências científicas utilizadas neste material
          </button>
        </div>

        {/* Share Buttons */}
        <div className="py-4">
          <ShareButtons onShare={handleShare} />
        </div>

        {/* Actions row */}
        <div className="flex gap-3 justify-center flex-wrap print:hidden">
          <button
            onClick={() => {
              setPrintMode(true);
              setTimeout(() => {
                window.print();
                setTimeout(() => setPrintMode(false), 500);
              }, 300);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-card hover:bg-muted transition-all text-[12px] font-medium text-foreground hover:scale-[1.02]"
          >
            <Download className="w-4 h-4" />
            <span>Exportar PDF</span>
          </button>
          <button
            onClick={onRestart}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-card hover:bg-muted transition-all text-[12px] font-medium text-foreground hover:scale-[1.02]"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Refazer Questionário</span>
          </button>
          <Link
            to="/selecionar-teste"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-card hover:bg-muted transition-all text-[12px] font-medium text-foreground hover:scale-[1.02]"
          >
            <span>Outros Testes</span>
          </Link>
          <Link
            to="/historico"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-card hover:bg-muted transition-all text-[12px] font-medium text-foreground hover:scale-[1.02]"
          >
            <History className="w-4 h-4" />
            <span>Meus Resultados</span>
          </Link>
          {onSignOut && (
            <button
              onClick={onSignOut}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-card hover:bg-muted transition-all text-[12px] font-medium text-muted-foreground hover:scale-[1.02]"
            >
              <LogOut className="w-4 h-4" />
              <span>Sair</span>
            </button>
          )}
        </div>
      </main>

      {/* References modal */}
      <AnimatePresence>
        {showRefs && <ReferencesModal open={showRefs} onClose={() => setShowRefs(false)} />}
      </AnimatePresence>
    </div>
  );
}

/* ────── Quiz Page ────── */
export default function QuizPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const [phase, setPhase] = useState<"loading" | "quiz" | "results">("loading");
  const [currentBlock, setCurrentBlock] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [motivationalMsg, setMotivationalMsg] = useState<string | null>(null);
  const [resultsSaved, setResultsSaved] = useState(false);
  const [savedScores, setSavedScores] = useState<Record<string, number> | null>(null);

  // ── Funil tracking ──
  const { trackStart, trackStep, trackComplete } = useFunnelTracking(TOTAL_QUESTIONS);

  const block = questionBlocks[currentBlock];
  const answeredCount = Object.keys(answers).length;
  const progress = Math.round((answeredCount / TOTAL_QUESTIONS) * 100);
  const blockComplete = block?.questions.every((q) => answers[q.id] !== undefined);
  const isLast = currentBlock === questionBlocks.length - 1;

  // On mount: check if user has a saved result
  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("quiz_results")
        .select("scores")
        .eq("test_type", "neurocognitivo")
        .order("created_at", { ascending: false })
        .limit(1);
      if (data && data.length > 0) {
        setSavedScores(data[0].scores as any);
        setPhase("results");
      } else {
        setPhase("quiz");
        trackStart();
      }
    })();
  }, [user]);

  // Save results to database
  const saveResults = async () => {
    if (resultsSaved || !user) return;
    try {
      const scores = calculateScores(answers);
      await supabase.from("quiz_results").insert({
        user_id: user.id,
        answers: answers as any,
        scores: scores as any,
        test_type: "neurocognitivo",
      });
      setResultsSaved(true);
    } catch (e) {
      console.warn("Error saving results:", e);
    }
  };

  useEffect(() => {
    let msg: string | null = null;
    if (progress >= 80 && progress < 85) msg = "Quase lá — faltam poucas perguntas.";
    else if (progress >= 40 && progress < 45) {
      const secs = (TOTAL_QUESTIONS - answeredCount) * 8;
      msg = `Metade concluída. Faltam ~${Math.ceil(secs / 60)} min.`;
    } else if (progress >= 95) msg = "Últimas perguntas. Seu resultado está quase pronto.";
    if (msg) {
      setMotivationalMsg(msg);
      const t = setTimeout(() => setMotivationalMsg(null), 3500);
      return () => clearTimeout(t);
    }
  }, [progress, answeredCount]);

  // Redirect to auth if not logged in
  if (!loading && !user) {
    return <Navigate to="/auth" replace />;
  }

  if (loading || phase === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const handleAnswer = (id: string, val: number) => setAnswers((p) => ({ ...p, [id]: val }));
  const handleNext = () => {
    if (isLast) {
      trackComplete();
      setPhase("results");
    } else {
      setCurrentBlock((c) => c + 1);
      trackStep(answeredCount);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };
  const handleBack = () => { setCurrentBlock((c) => Math.max(0, c - 1)); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const handleRestart = () => {
    setAnswers({});
    setCurrentBlock(0);
    setResultsSaved(false);
    setSavedScores(null);
    setPhase("quiz");
    trackStart();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Results phase
  if (phase === "results") {
    // If we have fresh answers, save & show from answers; otherwise show from saved scores
    if (Object.keys(answers).length > 0) {
      if (!resultsSaved) saveResults();
      return <ResultsView answers={answers} onRestart={handleRestart} onSignOut={() => navigate("/selecionar-teste")} />;
    }
    if (savedScores) {
      return <ResultsView scores={savedScores} onRestart={handleRestart} onSignOut={() => navigate("/selecionar-teste")} />;
    }
  }

  // Quiz phase
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="pt-10 pb-5 md:pt-14 md:pb-7 px-5 text-center">
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="max-w-md mx-auto space-y-3">
          <p className="text-primary text-[11px] font-semibold uppercase tracking-[0.15em]">
            Rastreio de Altas Habilidades e Neurodivergência
          </p>
          <h1 className="text-foreground">
            Você sempre se sentiu diferente.
            <br />
            <span className="text-primary">Agora vai saber por quê.</span>
          </h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Descubra seu perfil cognitivo em apenas <span className="font-semibold text-foreground">~{ESTIMATED_MINUTES} minutos</span>.
          </p>
        </motion.div>
      </header>

      {/* Progress Bar */}
      <div className="max-w-lg mx-auto w-full px-5 mb-5">
        <div className="flex items-baseline justify-between mb-1.5">
          <span className="font-semibold text-foreground text-sm tabular-nums">{progress}%</span>
          <span className="text-[11px] text-muted-foreground tabular-nums">{answeredCount}/{TOTAL_QUESTIONS}</span>
        </div>
        <div className="w-full h-1.5 rounded-full overflow-hidden bg-muted">
          <motion.div
            className="h-full rounded-full bg-primary"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Questions */}
      <main className="max-w-lg mx-auto w-full px-5 pb-24 flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={block.id}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <div className="flex justify-between text-[10px] text-muted-foreground mb-3 sm:hidden px-0.5 uppercase tracking-widest">
              <span>0 Nunca</span>
              <span>4 Quase sempre</span>
            </div>

            <div className="space-y-3">
              {block.questions.map((q, qi) => (
                <motion.div
                  key={q.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: qi * 0.04, duration: 0.3 }}
                  className="rounded-lg border bg-card p-3.5 sm:p-4"
                >
                  <p className="text-card-foreground mb-2.5 leading-relaxed text-[13px] sm:text-sm">
                    {q.text}
                  </p>
                  <LikertScale questionId={q.id} value={answers[q.id]} onChange={handleAnswer} />
                </motion.div>
              ))}
            </div>

            <div className="flex items-center justify-between mt-6">
              <Button
                variant="ghost" size="sm"
                onClick={handleBack}
                disabled={currentBlock === 0}
                className="text-xs h-9 px-4"
              >
                Anterior
              </Button>
              <div className="flex items-center gap-2">
                <button
                   onClick={() => navigate("/selecionar-teste")}
                   className="flex items-center gap-1.5 h-9 px-3 rounded-xl border border-border bg-card hover:bg-muted transition-all text-[11px] font-medium text-muted-foreground"
                 >
                   <LogOut className="w-3.5 h-3.5" />
                   Sair do teste
                 </button>
                <button
                  onClick={handleNext}
                  disabled={!blockComplete}
                  className="flex items-center gap-2 h-9 px-5 rounded-xl font-semibold text-sm transition-all hover:scale-[1.02] disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100 bg-primary text-primary-foreground"
                  style={{
                    boxShadow: blockComplete ? "0 0 20px hsl(var(--primary) / 0.25), 0 4px 20px hsl(var(--primary) / 0.35)" : undefined,
                  }}
                >
                  {isLast ? "Ver Resultado" : "Próximo"}
                </button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {motivationalMsg && <MotivationalToast message={motivationalMsg} />}
      </AnimatePresence>
    </div>
  );
}
