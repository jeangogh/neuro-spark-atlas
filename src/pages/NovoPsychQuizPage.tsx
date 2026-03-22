import { useState, useCallback, useEffect } from "react";
import { useDropoutTracking } from "@/hooks/useDropoutTracking";
import PostResultFeedback from "@/components/PostResultFeedback";
import { useNavigate, useParams, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, AlertTriangle, BookOpen } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import {
  getNovoPsychTest,
  computeNovoPsychScore,
  getNovoPsychCutoff,
  type NovoPsychTest,
  type NovoPsychCutoff,
} from "@/data/novopsychTests";

const COLOR_MAP: Record<NovoPsychCutoff["color"], string> = {
  green: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  yellow: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  amber: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  red: "text-red-400 bg-red-400/10 border-red-400/20",
};

function fmt(n: number, avg: boolean) {
  return avg ? n.toFixed(2) : String(n);
}

function ScoreDisplay({ test, total, cutoff }: {
  test: NovoPsychTest;
  total: number;
  cutoff: NovoPsychCutoff;
}) {
  const isProfile = test.primaryDisplay === "subscales";
  if (isProfile) {
    return (
      <div className={`rounded-xl border p-5 text-center ${COLOR_MAP[cutoff.color]}`}>
        <p className="text-[11px] uppercase tracking-widest mb-1">Perfil por dimensão</p>
        <h2 className="text-lg font-bold">{cutoff.label}</h2>
      </div>
    );
  }
  return (
    <div className={`rounded-xl border p-5 text-center ${COLOR_MAP[cutoff.color]}`}>
      <div className="text-5xl font-bold tabular-nums mb-1">{fmt(total, !!test.isAverage)}</div>
      <p className="text-[11px] uppercase tracking-widest mb-1">
        {test.higherIsBetter ? "maior = melhor" : "menor = melhor"}
      </p>
      <h2 className="text-lg font-bold">{cutoff.label}</h2>
    </div>
  );
}

function ResultView({ test, answers }: { test: NovoPsychTest; answers: Record<string, number> }) {
  const navigate = useNavigate();
  const { total, subscaleScores } = computeNovoPsychScore(test, answers);
  const cutoff = getNovoPsychCutoff(test.cutoffs, total);
  const safetyValue = test.safetyItemId ? (answers[test.safetyItemId] ?? 0) : 0;
  const showSafety = test.safetyItemId && safetyValue >= (test.safetyThreshold ?? 1);

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="pt-10 pb-6 px-5 text-center max-w-2xl mx-auto">
        <p className="text-primary text-[10px] font-semibold uppercase tracking-[0.18em] mb-2">
          {test.shortTitle}
        </p>
        <h1 className="font-display text-2xl font-bold text-foreground mb-2">Seu Resultado</h1>
        <p className="text-[13px] text-muted-foreground">
          Instrumento de autorrelato — não substitui avaliação profissional.
        </p>
      </header>

      <main className="max-w-2xl mx-auto px-5 space-y-5">
        {/* Safety alert */}
        {showSafety && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-red-400/30 bg-red-400/10 p-5"
          >
            <div className="flex gap-3">
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <p className="text-[13px] text-red-300 leading-relaxed">{test.safetyMessage}</p>
            </div>
          </motion.div>
        )}

        {/* Note */}
        {test.noteText && (
          <div className="rounded-xl border border-border bg-card/50 px-4 py-3">
            <p className="text-[12px] text-muted-foreground">{test.noteText}</p>
          </div>
        )}

        {/* Score */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <ScoreDisplay test={test} total={total} cutoff={cutoff} />
        </motion.div>

        {/* Interpretation */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-xl border bg-card p-5"
        >
          <h2 className="text-[15px] font-semibold text-foreground mb-2">Interpretação</h2>
          <p className="text-[13px] text-muted-foreground leading-relaxed">{cutoff.description}</p>
        </motion.div>

        {/* Subscales */}
        {test.subscales && test.subscales.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-xl border bg-card p-5"
          >
            <h2 className="text-[15px] font-semibold text-foreground mb-4">
              {test.primaryDisplay === "subscales" ? "Perfil por dimensão" : "Detalhamento"}
            </h2>
            <div className="space-y-4">
              {test.subscales.map((sub) => {
                const score = subscaleScores[sub.key] ?? 0;
                const displayScore = sub.isAverage ? score.toFixed(2) : String(score);
                return (
                  <div key={sub.key}>
                    <div className="flex justify-between items-baseline mb-1">
                      <span className="text-[13px] font-medium text-foreground">{sub.label}</span>
                      <span className="text-[13px] font-bold tabular-nums text-primary">
                        {displayScore}
                      </span>
                    </div>
                    {sub.isAverage ? (
                      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          className="h-full rounded-full bg-primary"
                          initial={{ width: 0 }}
                          animate={{ width: `${(score / 7) * 100}%` }}
                          transition={{ duration: 0.7, ease: "easeOut" }}
                        />
                      </div>
                    ) : (
                      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          className="h-full rounded-full bg-primary"
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(100, (score / (sub.questionIds.length * 5)) * 100)}%` }}
                          transition={{ duration: 0.7, ease: "easeOut" }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* All cutoffs table */}
        {test.cutoffs.length > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="rounded-xl border bg-card p-5"
          >
            <h2 className="text-[15px] font-semibold text-foreground mb-3">Faixas de referência</h2>
            <div className="space-y-2">
              {[...test.cutoffs].sort((a, b) => a.minScore - b.minScore).map((c) => (
                <div
                  key={c.minScore}
                  className={`flex items-start gap-2 px-3 py-2 rounded-lg text-[12px] ${
                    c.label === cutoff.label
                      ? `border ${COLOR_MAP[c.color]} font-semibold`
                      : "text-muted-foreground"
                  }`}
                >
                  <span className="shrink-0 tabular-nums">≥ {fmt(c.minScore, !!test.isAverage)}</span>
                  <span>{c.label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Reference */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex gap-2 px-4 py-3 rounded-xl border border-border bg-card/30"
        >
          <BookOpen className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
          <p className="text-[11px] text-muted-foreground leading-relaxed">{test.reference}</p>
        </motion.div>

        {/* Post-result feedback */}
        <PostResultFeedback testType={test.key} />

        {/* Disclaimer */}
        <div className="px-4 py-3 rounded-xl border border-border bg-card/30">
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Este questionário é um instrumento de autorrelato e <strong>não substitui avaliação profissional</strong>.
            Os resultados levantam hipóteses que merecem investigação com profissional qualificado.
          </p>
        </div>

        <button
          onClick={() => navigate("/analises")}
          className="w-full py-3 rounded-xl border border-border text-[14px] font-medium text-foreground hover:bg-muted transition-colors"
        >
          Ver outros testes
        </button>
      </main>
    </div>
  );
}

export default function NovoPsychQuizPage() {
  const { testKey } = useParams<{ testKey: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const test = testKey ? getNovoPsychTest(testKey) : undefined;

  const [questionIdx, setQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showResult, setShowResult] = useState(false);
  const [isAdvancing, setIsAdvancing] = useState(false);

  // Scroll to top on question change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [questionIdx]);

  if (authLoading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!user) return <Navigate to="/auth" replace />;
  if (!test) return (
    <div className="min-h-screen bg-background flex items-center justify-center px-5">
      <div className="text-center">
        <p className="text-[16px] font-semibold mb-2">Teste não encontrado</p>
        <button onClick={() => navigate("/analises")} className="text-primary text-[14px]">
          ← Voltar aos testes
        </button>
      </div>
    </div>
  );

  if (showResult) return <ResultView test={test} answers={answers} />;

  const questions = test.questions;
  const totalQ = questions.length;
  const currentQ = questions[questionIdx];
  const progressPct = Math.round((questionIdx / totalQ) * 100);
  const useVertical = test.options.length >= 5;

  const handleAnswer = useCallback((value: number) => {
    if (isAdvancing) return;
    const newAnswers = { ...answers, [currentQ.id]: value };
    setAnswers(newAnswers);

    if (test.options.length <= 4) {
      // Auto-advance for short scales
      setIsAdvancing(true);
      setTimeout(() => {
        if (questionIdx + 1 < totalQ) setQuestionIdx(i => i + 1);
        else setShowResult(true);
        setIsAdvancing(false);
      }, 280);
    } else {
      // For long scales, advance immediately without animation delay
      if (questionIdx + 1 < totalQ) setQuestionIdx(i => i + 1);
      else setShowResult(true);
    }
  }, [isAdvancing, answers, currentQ, questionIdx, totalQ, test.options.length]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="flex items-center gap-3 px-5 pt-10 pb-4 max-w-2xl mx-auto w-full">
        <button
          onClick={() => questionIdx > 0 ? setQuestionIdx(i => i - 1) : navigate("/analises")}
          className="p-2 rounded-lg hover:bg-muted transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </button>
        <div className="flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-primary">
            {test.shortTitle}
          </p>
          <Progress value={progressPct} className="mt-1.5 h-1.5" />
        </div>
        <span className="text-[12px] text-muted-foreground tabular-nums">
          {questionIdx + 1}/{totalQ}
        </span>
      </header>

      {/* Instruction (first question only) */}
      {questionIdx === 0 && (
        <div className="px-5 max-w-2xl mx-auto w-full mb-2">
          <div className="rounded-xl border border-border bg-card/50 px-4 py-3">
            <p className="text-[12px] text-muted-foreground leading-relaxed">{test.instruction}</p>
          </div>
        </div>
      )}

      {/* Note */}
      {questionIdx === 0 && test.noteText && (
        <div className="px-5 max-w-2xl mx-auto w-full mb-2">
          <div className="rounded-xl border border-amber-400/20 bg-amber-400/5 px-4 py-3">
            <p className="text-[12px] text-amber-300 leading-relaxed">{test.noteText}</p>
          </div>
        </div>
      )}

      {/* Question */}
      <main className="flex-1 px-5 max-w-2xl mx-auto w-full pt-4 pb-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={questionIdx}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.22 }}
          >
            <p className="text-[16px] sm:text-[18px] font-medium text-foreground leading-snug mb-8">
              {currentQ.text}
            </p>

            {useVertical ? (
              // Vertical list for 5+ options
              <div className="space-y-2">
                {test.options.map((opt) => {
                  const selected = answers[currentQ.id] === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => handleAnswer(opt.value)}
                      className={`w-full text-left px-4 py-3 rounded-xl border text-[14px] transition-all ${
                        selected
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-card border-border text-foreground hover:border-primary/40"
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            ) : (
              // Horizontal row for 2-4 options
              <div className="flex gap-2">
                {test.options.map((opt) => {
                  const selected = answers[currentQ.id] === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => handleAnswer(opt.value)}
                      className={`flex-1 flex flex-col items-center gap-1 py-3 px-1 rounded-xl border text-[11px] transition-all ${
                        selected
                          ? "bg-primary text-primary-foreground border-primary scale-[1.03]"
                          : "bg-card border-border text-muted-foreground hover:border-primary/40"
                      }`}
                    >
                      <span className="font-bold text-base">{opt.value}</span>
                      <span className="text-center leading-tight hidden sm:block">{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
