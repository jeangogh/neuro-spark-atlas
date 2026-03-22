import { useState, useMemo, useCallback, useEffect } from "react";
import { useDropoutTracking } from "@/hooks/useDropoutTracking";
import PostResultFeedback from "@/components/PostResultFeedback";
import { useNavigate, useParams, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useQuota } from "@/hooks/useQuota";
import { getMiniTeste, MT_OPCOES, computeMiniTesteScore } from "@/data/minitestes";

export default function MinitesteQuizPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { consume } = useQuota();
  const { user, loading: authLoading } = useAuth();

  const miniteste = useMemo(() => getMiniTeste(id ?? ""), [id]);

  const [questionIdx, setQuestionIdx] = useState(0);
  const [respostas, setRespostas] = useState<Record<string, number>>({});
  const [showResult, setShowResult] = useState(false);
  const [isAdvancing, setIsAdvancing] = useState(false);

  // Consume quota on mount
  useEffect(() => {
    if (id) {
      consume("testes", id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const perguntas = miniteste?.perguntas ?? [];
  const totalPerguntas = perguntas.length;
  const progressPct = totalPerguntas > 0 ? Math.round((questionIdx / totalPerguntas) * 100) : 0;

  // ── Dropout tracking ──
  useDropoutTracking(id ?? "miniteste", totalPerguntas, user?.id, Object.keys(respostas).length, showResult);

  const handleAnswer = useCallback(
    (valor: number) => {
      if (isAdvancing || !perguntas.length) return;
      const pergunta = perguntas[questionIdx];
      setRespostas((prev) => ({ ...prev, [pergunta.id]: valor }));
      setIsAdvancing(true);

      setTimeout(() => {
        if (questionIdx + 1 < totalPerguntas) {
          setQuestionIdx((i) => i + 1);
        } else {
          setShowResult(true);
        }
        setIsAdvancing(false);
      }, 300);
    },
    [questionIdx, perguntas, totalPerguntas, isAdvancing]
  );

  const handleBack = useCallback(() => {
    if (questionIdx > 0) {
      setQuestionIdx((i) => i - 1);
    }
  }, [questionIdx]);

  const handleReset = useCallback(() => {
    setQuestionIdx(0);
    setRespostas({});
    setShowResult(false);
  }, []);

  const score = useMemo(() => {
    if (!showResult) return 0;
    return computeMiniTesteScore(respostas, totalPerguntas);
  }, [showResult, respostas, totalPerguntas]);

  const interpretation = useMemo(() => {
    if (score <= 30)
      return { label: "Baixa identificação", colorClass: "text-primary" };
    if (score <= 60)
      return { label: "Identificação moderada", colorClass: "text-accent" };
    return { label: "Alta identificação", colorClass: "text-destructive" };
  }, [score]);

  // ── Auth guard (after all hooks) ──
  if (authLoading) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  if (!user) return <Navigate to="/auth" replace />;

  // ── Not found ──
  if (!miniteste) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center px-5">
          <p className="text-[16px] font-semibold text-foreground mb-2">
            Teste não encontrado
          </p>
          <p className="text-[13px] text-muted-foreground mb-6">
            O miniteste "{id}" não existe ou foi removido.
          </p>
          <button
            onClick={() => navigate("/analises")}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm bg-primary text-primary-foreground hover:scale-[1.02] transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar aos testes
          </button>
        </div>
      </div>
    );
  }

  // ── Circular progress ring ──
  const ringSize = 160;
  const strokeWidth = 10;
  const radius = (ringSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  // ═══════════════════════════════════════
  // RENDER -- RESULT
  // ═══════════════════════════════════════

  if (showResult) {
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
          className="max-w-xl mx-auto px-5 pt-10 pb-16 text-center"
        >
          <p className="text-primary text-[10px] font-semibold uppercase tracking-[0.18em] mb-6">
            Seu resultado
          </p>

          {/* Circular progress ring */}
          <div className="relative inline-flex items-center justify-center mb-6">
            <svg
              width={ringSize}
              height={ringSize}
              className="transform -rotate-90"
            >
              {/* Background ring */}
              <circle
                cx={ringSize / 2}
                cy={ringSize / 2}
                r={radius}
                fill="none"
                stroke="currentColor"
                strokeWidth={strokeWidth}
                className="text-muted"
              />
              {/* Progress ring */}
              <motion.circle
                cx={ringSize / 2}
                cy={ringSize / 2}
                r={radius}
                fill="none"
                stroke="currentColor"
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                className={interpretation.colorClass}
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ delay: 0.3, duration: 1, ease: "easeOut" }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.span
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, duration: 0.4 }}
                className="text-4xl font-bold text-foreground tabular-nums"
              >
                {score}
              </motion.span>
            </div>
          </div>

          {/* Interpretation */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.3 }}
            className={`text-[16px] font-semibold mb-2 ${interpretation.colorClass}`}
          >
            {interpretation.label}
          </motion.p>

          {/* Post-result feedback */}
          <div className="mt-6 text-left">
            <PostResultFeedback testType={`miniteste-${id}`} />
          </div>

          {/* Test name */}
          <motion.h2
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.3 }}
            className="font-display text-xl sm:text-2xl font-bold text-foreground mb-10"
          >
            {miniteste.nome}
          </motion.h2>

          {/* Action buttons */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <button
              onClick={() => navigate("/analises")}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all hover:scale-[1.02] bg-primary text-primary-foreground"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar aos testes
            </button>
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all hover:scale-[1.02] border border-border bg-card text-foreground hover:bg-muted"
            >
              <RotateCcw className="w-4 h-4" />
              Refazer
            </button>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  // ═══════════════════════════════════════
  // RENDER -- QUIZ
  // ═══════════════════════════════════════

  const currentPergunta = perguntas[questionIdx];
  const selectedVal = respostas[currentPergunta.id] ?? null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="max-w-2xl mx-auto px-5">
          <div className="h-12 flex items-center justify-between">
            <button
              onClick={handleBack}
              disabled={questionIdx === 0}
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

      {/* Title + subtitle */}
      <div className="max-w-xl mx-auto px-5 pt-6">
        <h1 className="text-[15px] font-bold text-foreground mb-0.5">
          {miniteste.nome}
        </h1>
        <p className="text-[11px] text-muted-foreground mb-1">
          {miniteste.foco}
        </p>
        <p className="text-[11px] text-muted-foreground mb-6">
          {questionIdx + 1} de {totalPerguntas}
        </p>
      </div>

      {/* Question */}
      <div className="flex-1 flex items-start justify-center px-5">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPergunta.id}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.25 }}
            className="max-w-xl w-full"
          >
            <p className="text-[16px] sm:text-[18px] text-foreground font-medium leading-relaxed mb-8">
              {currentPergunta.texto}
            </p>

            {/* Horizontal Likert buttons */}
            <div className="flex gap-2">
              {MT_OPCOES.map((op) => (
                <button
                  key={op.valor}
                  onClick={() => handleAnswer(op.valor)}
                  disabled={isAdvancing}
                  className={`flex-1 flex flex-col items-center gap-1.5 px-2 py-3.5 rounded-xl border transition-all active:scale-[0.96] ${
                    selectedVal === op.valor
                      ? "border-primary bg-primary/10 ring-1 ring-primary/30"
                      : "border-border bg-card hover:border-primary/40 hover:bg-primary/[0.04]"
                  } ${isAdvancing ? "pointer-events-none" : ""}`}
                >
                  <span className="shrink-0 w-7 h-7 rounded-full bg-muted flex items-center justify-center text-[12px] font-bold text-muted-foreground">
                    {op.valor}
                  </span>
                  <span className="text-[10px] sm:text-[11px] text-foreground text-center leading-tight">
                    {op.texto}
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
