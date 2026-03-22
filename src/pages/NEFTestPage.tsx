import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useDropoutTracking } from "@/hooks/useDropoutTracking";
import PostResultFeedback from "@/components/PostResultFeedback";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ChevronDown, ChevronUp, Brain, Target, ArrowRight } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useQuota } from "@/hooks/useQuota";
import {
  NEFS,
  INTENSITY_ITEMS,
  HIERARCHY_ITEMS,
  PAIN_LABELS,
  shuffleWithSeed,
  computeNefScores,
} from "@/data/nefTest";
import type {
  IntensityAnswers,
  HierarchyAnswers,
  NefScore,
} from "@/data/nefTest";

type Phase = "intro" | "intensity" | "hierarchy" | "results";

export default function NEFTestPage() {
  const navigate = useNavigate();
  const { consume } = useQuota();

  const [phase, setPhase] = useState<Phase>("intro");
  const [intensityIdx, setIntensityIdx] = useState(0);
  const [hierarchyIdx, setHierarchyIdx] = useState(0);
  const [intensityAnswers, setIntensityAnswers] = useState<IntensityAnswers>({});
  const [hierarchyAnswers, setHierarchyAnswers] = useState<HierarchyAnswers>({});
  const [expandedNef, setExpandedNef] = useState<string | null>(null);
  const [isAdvancing, setIsAdvancing] = useState(false);

  // Shuffle questions deterministically with different seeds per phase
  const shuffledIntensity = useMemo(
    () => shuffleWithSeed(INTENSITY_ITEMS, 42),
    []
  );
  const shuffledHierarchy = useMemo(
    () => shuffleWithSeed(HIERARCHY_ITEMS, 77),
    []
  );

  const totalQuestions = shuffledIntensity.length + shuffledHierarchy.length;
  const answeredCount =
    phase === "intensity"
      ? intensityIdx
      : phase === "hierarchy"
        ? shuffledIntensity.length + hierarchyIdx
        : phase === "results"
          ? totalQuestions
          : 0;

  const progressPct = Math.round((answeredCount / totalQuestions) * 100);

  // ── Handlers ──

  const handleStart = () => {
    consume("testes", "nef");
    setPhase("intensity");
  };

  const handleIntensityAnswer = useCallback(
    (val: number) => {
      if (isAdvancing) return;
      const item = shuffledIntensity[intensityIdx];
      setIntensityAnswers((prev) => ({ ...prev, [item.id]: val }));
      setIsAdvancing(true);

      setTimeout(() => {
        if (intensityIdx + 1 < shuffledIntensity.length) {
          setIntensityIdx((i) => i + 1);
        } else {
          setPhase("hierarchy");
        }
        setIsAdvancing(false);
      }, 300);
    },
    [intensityIdx, shuffledIntensity, isAdvancing]
  );

  const handleHierarchyAnswer = useCallback(
    (val: number) => {
      if (isAdvancing) return;
      const item = shuffledHierarchy[hierarchyIdx];
      setHierarchyAnswers((prev) => ({ ...prev, [item.id]: val }));
      setIsAdvancing(true);

      setTimeout(() => {
        if (hierarchyIdx + 1 < shuffledHierarchy.length) {
          setHierarchyIdx((i) => i + 1);
        } else {
          setPhase("results");
        }
        setIsAdvancing(false);
      }, 300);
    },
    [hierarchyIdx, shuffledHierarchy, isAdvancing]
  );

  const handleBack = () => {
    if (phase === "intensity" && intensityIdx > 0) {
      setIntensityIdx((i) => i - 1);
    } else if (phase === "hierarchy" && hierarchyIdx > 0) {
      setHierarchyIdx((i) => i - 1);
    } else if (phase === "hierarchy" && hierarchyIdx === 0) {
      setPhase("intensity");
      setIntensityIdx(shuffledIntensity.length - 1);
    }
  };

  // ── Results computation ──
  const results: NefScore[] = useMemo(() => {
    if (phase !== "results") return [];
    return computeNefScores(intensityAnswers, hierarchyAnswers);
  }, [phase, intensityAnswers, hierarchyAnswers]);

  const primaryNef = results[0] ?? null;

  // ── Auth guard ──
  const { user, loading } = useAuth();

  // ── Save results to DB ──
  const savedRef = useRef(false);
  useEffect(() => {
    if (phase !== "results" || !user || savedRef.current || results.length === 0) return;
    savedRef.current = true;

    const scores: Record<string, number> = {};
    results.forEach((r) => { scores[r.id] = r.score; });

    supabase.from("quiz_results").insert({
      user_id: user.id,
      test_type: "nef",
      answers: { intensity: intensityAnswers, hierarchy: hierarchyAnswers } as any,
      scores: scores as any,
    }).then(({ error }) => {
      if (error) console.error("Erro ao salvar NEF:", error);
    });
  }, [phase, user, results, intensityAnswers, hierarchyAnswers]);

  // ── Dropout tracking ──
  useDropoutTracking("nef", totalQuestions, user?.id, answeredCount, phase === "results");

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  if (!user) return <Navigate to="/auth" replace />;

  // ═══════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════

  // ── INTRO ──
  if (phase === "intro") {
    return (
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border">
          <div className="max-w-2xl mx-auto px-5 h-12 flex items-center">
            <button
              onClick={() => navigate("/analises")}
              className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-[13px] font-medium">Voltar</span>
            </button>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-xl mx-auto px-5 pt-12 pb-16 text-center"
        >
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Brain className="w-7 h-7 text-primary" />
          </div>

          <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-4">
            Inventário de Núcleos Emocionais
          </h1>

          <p className="text-[14px] text-muted-foreground leading-relaxed mb-8 max-w-md mx-auto">
            Identifica qual significado emocional central organiza seu sofrimento
            — e como seus padrões se conectam.
          </p>

          {/* Stats */}
          <div className="flex items-center justify-center gap-6 mb-10">
            <div className="text-center">
              <p className="text-xl font-bold text-foreground">35</p>
              <p className="text-[11px] text-muted-foreground">itens</p>
            </div>
            <div className="w-px h-8 bg-border" />
            <div className="text-center">
              <p className="text-xl font-bold text-foreground">~8</p>
              <p className="text-[11px] text-muted-foreground">minutos</p>
            </div>
            <div className="w-px h-8 bg-border" />
            <div className="text-center">
              <p className="text-xl font-bold text-foreground">2</p>
              <p className="text-[11px] text-muted-foreground">etapas</p>
            </div>
          </div>

          <button
            onClick={handleStart}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-sm transition-all hover:scale-[1.02] bg-primary text-primary-foreground"
          >
            Começar
            <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>
      </div>
    );
  }

  // ── QUESTION PHASES (intensity + hierarchy) ──
  if (phase === "intensity" || phase === "hierarchy") {
    const isIntensity = phase === "intensity";
    const currentItem = isIntensity
      ? shuffledIntensity[intensityIdx]
      : shuffledHierarchy[hierarchyIdx];
    const currentIdx = isIntensity ? intensityIdx : hierarchyIdx;
    const phaseTotal = isIntensity
      ? shuffledIntensity.length
      : shuffledHierarchy.length;
    const phaseLabel = isIntensity
      ? "Etapa 1 — O que te afeta"
      : "Etapa 2 — Como se conectam";
    const onAnswer = isIntensity ? handleIntensityAnswer : handleHierarchyAnswer;
    const currentAnswers = isIntensity ? intensityAnswers : hierarchyAnswers;
    const selectedVal = currentAnswers[currentItem.id] ?? null;

    return (
      <div className="min-h-screen bg-background flex flex-col">
        {/* Top bar */}
        <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border">
          <div className="max-w-2xl mx-auto px-5">
            <div className="h-12 flex items-center justify-between">
              <button
                onClick={handleBack}
                disabled={phase === "intensity" && intensityIdx === 0}
                className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-[13px] font-medium">Voltar</span>
              </button>
              <span className="text-[12px] text-muted-foreground font-medium">
                {progressPct}%
              </span>
            </div>
            <Progress value={progressPct} className="h-1 mb-1" />
          </div>
        </div>

        {/* Phase label */}
        <div className="max-w-xl mx-auto px-5 pt-6">
          <p className="text-primary text-[10px] font-semibold uppercase tracking-[0.18em] mb-1">
            {phaseLabel}
          </p>
          <p className="text-[11px] text-muted-foreground mb-6">
            {currentIdx + 1} de {phaseTotal}
          </p>
        </div>

        {/* Question */}
        <div className="flex-1 flex items-start justify-center px-5">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentItem.id}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.25 }}
              className="max-w-xl w-full"
            >
              <p className="text-[16px] sm:text-[18px] text-foreground font-medium leading-relaxed mb-8">
                {currentItem.text}
              </p>

              {/* Horizontal scale buttons */}
              <div className="flex gap-2">
                {PAIN_LABELS.map((pl) => (
                  <button
                    key={pl.val}
                    onClick={() => onAnswer(pl.val)}
                    disabled={isAdvancing}
                    className={`flex-1 flex flex-col items-center gap-1.5 px-2 py-3.5 rounded-xl border transition-all active:scale-[0.96] ${
                      selectedVal === pl.val
                        ? "border-primary bg-primary/10 ring-1 ring-primary/30"
                        : "border-border bg-card hover:border-primary/40 hover:bg-primary/[0.04]"
                    } ${isAdvancing ? "pointer-events-none" : ""}`}
                  >
                    <span className="shrink-0 w-7 h-7 rounded-full bg-muted flex items-center justify-center text-[12px] font-bold text-muted-foreground">
                      {pl.val}
                    </span>
                    <span className="text-[11px] sm:text-[12px] text-foreground text-center leading-tight">
                      {pl.label}
                    </span>
                  </button>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    );
  }

  // ── RESULTS ──
  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="max-w-2xl mx-auto px-5 h-12 flex items-center">
          <button
            onClick={() => navigate("/analises")}
            className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-[13px] font-medium">Voltar</span>
          </button>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl mx-auto px-5 pt-8 pb-16"
      >
        <p className="text-primary text-[10px] font-semibold uppercase tracking-[0.18em] mb-3">
          Seu resultado
        </p>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-8">
          Núcleos Emocionais
        </h1>

        {/* ── Primary NEF (always expanded) ── */}
        {primaryNef && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="rounded-xl border-2 p-6 sm:p-8 mb-8"
            style={{ borderColor: primaryNef.color + "40" }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: primaryNef.color + "18" }}
              >
                <Target className="w-5 h-5" style={{ color: primaryNef.color }} />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Núcleo primário
                </p>
                <h2 className="text-[18px] font-bold text-foreground">
                  {primaryNef.name}
                </h2>
              </div>
            </div>

            {/* Score bar */}
            <div className="mb-5">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] text-muted-foreground">Intensidade</span>
                <span className="text-[13px] font-bold text-foreground">{primaryNef.score}</span>
              </div>
              <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${primaryNef.score}%` }}
                  transition={{ delay: 0.4, duration: 0.8, ease: "easeOut" }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: primaryNef.color }}
                />
              </div>
            </div>

            <p className="text-[13px] text-muted-foreground leading-relaxed mb-4">
              {primaryNef.desc}
            </p>

            <div className="rounded-lg border bg-background p-4 mb-4">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">
                O que está por baixo
              </p>
              <p className="text-[13px] text-foreground/90 leading-relaxed">
                {primaryNef.deep}
              </p>
            </div>

            <div className="rounded-lg border border-primary/20 bg-primary/[0.04] p-4">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-primary mb-2">
                Direção
              </p>
              <p className="text-[13px] text-foreground/90 leading-relaxed">
                {primaryNef.direction}
              </p>
            </div>
          </motion.div>
        )}

        {/* ── All NEFs ranked ── */}
        <h3 className="text-[14px] font-semibold text-foreground mb-4">
          Todos os núcleos (por intensidade)
        </h3>

        <div className="space-y-2.5 mb-10">
          {results.map((nef, i) => {
            const isExpanded = expandedNef === nef.id;
            const isPrimary = i === 0;

            return (
              <motion.div
                key={nef.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.06, duration: 0.3 }}
                className="rounded-xl border bg-card overflow-hidden"
              >
                <button
                  onClick={() => setExpandedNef(isExpanded ? null : nef.id)}
                  className="w-full px-4 py-3.5 flex items-center gap-3 text-left"
                >
                  <div
                    className="shrink-0 w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: nef.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[13px] font-semibold text-foreground truncate">
                        {nef.name}
                      </span>
                      {isPrimary && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-bold uppercase">
                          Primário
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${nef.score}%` }}
                          transition={{ delay: 0.5 + i * 0.06, duration: 0.6 }}
                          className="h-full rounded-full"
                          style={{ backgroundColor: nef.color }}
                        />
                      </div>
                      <span className="text-[12px] font-bold text-foreground tabular-nums w-8 text-right">
                        {nef.score}
                      </span>
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                  )}
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 space-y-3">
                        <p className="text-[12px] text-muted-foreground leading-relaxed">
                          {nef.desc}
                        </p>
                        <div className="rounded-lg border bg-background p-3">
                          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1.5">
                            O que está por baixo
                          </p>
                          <p className="text-[12px] text-foreground/85 leading-relaxed">
                            {nef.deep}
                          </p>
                        </div>
                        <div className="rounded-lg border border-primary/20 bg-primary/[0.04] p-3">
                          <p className="text-[10px] font-semibold uppercase tracking-widest text-primary mb-1.5">
                            Direção
                          </p>
                          <p className="text-[12px] text-foreground/85 leading-relaxed">
                            {nef.direction}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* ── Hierarchy insight ── */}
        {results.length >= 2 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.4 }}
            className="rounded-xl border bg-card p-5 sm:p-6 mb-8"
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground mb-3">
              Conexão entre núcleos
            </p>
            <p className="text-[13px] text-foreground/90 leading-relaxed">
              Seu núcleo primário ({results[0].name}) está conectado com{" "}
              {results[1].name}. Isso significa que um alimenta o outro —
              quando um se ativa, o segundo tende a acompanhar. Entender essa
              dinâmica é o primeiro passo para interromper o ciclo.
            </p>
          </motion.div>
        )}

        {/* Post-result feedback */}
        <PostResultFeedback testType="nef" />

        {/* ── Next step CTA ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.4 }}
          className="rounded-xl border border-primary/20 bg-primary/[0.04] p-6 text-center"
        >
          <h3 className="text-[16px] font-bold text-foreground mb-2">
            Próximo passo
          </h3>
          <p className="text-[13px] text-muted-foreground leading-relaxed mb-5 max-w-md mx-auto">
            Agora que você sabe quais núcleos organizam seu funcionamento,
            o Gifted Lab investiga cada um deles em profundidade — toda semana,
            com plano personalizado.
          </p>
          <button
            onClick={() => navigate("/explorar")}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all hover:scale-[1.02] bg-primary text-primary-foreground"
          >
            Conhecer o Gifted Lab
            <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}
