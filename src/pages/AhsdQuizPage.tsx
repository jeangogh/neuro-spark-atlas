import { useState, useMemo, useEffect, useRef } from "react";
import { useDropoutTracking } from "@/hooks/useDropoutTracking";
import PostResultFeedback from "@/components/PostResultFeedback";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Navigate, Link, useParams, useNavigate } from "react-router-dom";
import { exportElementAsPdf } from "@/lib/exportPdf";
import { Button } from "@/components/ui/button";
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import { RotateCcw, History, LogOut, Download, MessageCircle, Twitter, Copy, Check } from "lucide-react";
import { getTestByKey } from "@/data/testRegistry";
import {
  type TestDefinition,
  getTotalQuestions,
  calculateTestScores,
  classifyResult,
  evaluateDimensionRules,
} from "@/data/testDefinitions";

/* ────── Category colors (hue based on index) ────── */
const CAT_HUES = [40, 174, 280, 340, 210, 120];
function catColor(idx: number) {
  return `hsl(${CAT_HUES[idx % CAT_HUES.length]}, 65%, 50%)`;
}

/* ────── Likert Scale ────── */
function AhsdLikertScale({ questionId, value, onChange, labels }: {
  questionId: string; value: number | undefined; onChange: (id: string, val: number) => void;
  labels: { value: number; label: string }[];
}) {
  const [lastClicked, setLastClicked] = useState<number | null>(null);
  const handleClick = (v: number) => {
    onChange(questionId, v);
    setLastClicked(v);
    setTimeout(() => setLastClicked(null), 500);
  };

  return (
    <div className="flex gap-1 sm:gap-1.5 w-full">
      {labels.map((opt) => {
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

/* ────── Score Bar ────── */
function ScoreBar({ score, color, delay = 0 }: { score: number; color: string; delay?: number }) {
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

/* ────── Share Buttons ────── */
function ShareButtonsAhsd() {
  const [copied, setCopied] = useState(false);
  const url = encodeURIComponent(window.location.origin + "/selecionar-teste");
  const text = encodeURIComponent("Fiz um rastreio de Altas Habilidades — você precisa conhecer.");
  const whatsappUrl = `https://api.whatsapp.com/send?text=${text}%20${url}`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;

  const handleCopy = async () => {
    const shareText = "Fiz um rastreio de Altas Habilidades — você precisa conhecer.";
    const shareUrl = window.location.origin + "/selecionar-teste";
    if (navigator.share) {
      try { await navigator.share({ title: "Rastreio AH/SD", text: shareText, url: shareUrl }); } catch {}
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

/* ────── AHSD Results View ────── */
function AhsdResultsView({ test, scores, onRestart, onSignOut }: {
  test: TestDefinition;
  scores: { pct: number; percentile: number; categoryScores: Record<string, { pct: number }> };
  onRestart: () => void;
  onSignOut?: () => void;
}) {
  const classification = classifyResult(test, scores.pct);
  const dimensionMessages = evaluateDimensionRules(test, scores.categoryScores);
  const resultRef = useRef<HTMLDivElement>(null);

  const radarData = test.categories.map((cat) => ({
    subject: cat.label,
    score: scores.categoryScores[cat.key]?.pct ?? 0,
    fullMark: 100,
  }));

  // Find highest category for complement
  const highestCat = test.categories.reduce((best, cat) => {
    const pct = scores.categoryScores[cat.key]?.pct ?? 0;
    return pct > (scores.categoryScores[best.key]?.pct ?? 0) ? cat : best;
  }, test.categories[0]);

  return (
    <div ref={resultRef} className="min-h-screen bg-background print:bg-white">
      <header className="pt-10 pb-6 md:pt-14 md:pb-8 px-5 text-center">
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="max-w-xl mx-auto">
          <p className="text-primary text-[10px] font-semibold uppercase tracking-[0.18em] mb-2">{test.title}</p>
           <h1 className="text-foreground mb-1.5">
            Seu Resultado
          </h1>
          <p className="text-muted-foreground text-[13px] max-w-md mx-auto leading-relaxed">
            Análise baseada em suas respostas. Este resultado levanta hipóteses — não constitui diagnóstico.
          </p>
        </motion.div>
      </header>

      <main className="max-w-2xl mx-auto px-5 pb-24 space-y-6">
        {/* Overall Score */}
        <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-primary/15 bg-primary/[0.03] p-5 sm:p-6 text-center">
          <div className="text-5xl font-bold text-primary mb-1 tabular-nums">{scores.pct}%</div>
          <p className="text-[11px] text-muted-foreground mb-3">Percentil estimado: {scores.percentile}</p>
          <h2 className="text-foreground">{classification.label}</h2>
        </motion.section>

        {/* Classification Description */}
        <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="rounded-xl border bg-card p-5 sm:p-6">
          <h2 className="text-foreground mb-2">Interpretação</h2>
          <p className="text-[13px] text-card-foreground leading-relaxed whitespace-pre-line">{classification.description}</p>
        </motion.section>

        {/* Dimension Rules */}
        {dimensionMessages.length > 0 && (
          <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="rounded-xl border border-accent/20 bg-accent/[0.03] p-5 sm:p-6">
            <h2 className="text-foreground mb-2">Análise Dimensional</h2>
            <div className="space-y-2">
              {dimensionMessages.map((msg, i) => (
                <p key={i} className="text-[13px] text-card-foreground leading-relaxed">• {msg}</p>
              ))}
            </div>
          </motion.section>
        )}

        {/* Category Scores */}
        <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-xl border bg-card p-5 sm:p-6">
          <h2 className="text-foreground mb-1">Detalhamento por Dimensão</h2>
          <p className="text-[11px] text-muted-foreground mb-4">Intensidade em cada área avaliada</p>
          <div className="space-y-3.5">
            {test.categories.map((cat, i) => {
              const pct = scores.categoryScores[cat.key]?.pct ?? 0;
              const color = catColor(i);
              return (
                <div key={cat.key}>
                  <div className="flex justify-between items-baseline text-[12px] mb-1">
                    <span className="font-medium text-foreground">{cat.label}</span>
                    <span className="font-bold tabular-nums text-[13px]" style={{ color }}>{pct}%</span>
                  </div>
                  <ScoreBar score={pct} color={color} delay={0.08 + i * 0.03} />
                </div>
              );
            })}
          </div>
        </motion.section>

        {/* Radar Chart */}
        <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }} className="rounded-xl border bg-card p-5 sm:p-6">
          <h2 className="text-foreground mb-1">Mapa de Perfil</h2>
          <div className="w-full aspect-square max-w-[320px] mx-auto">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="68%" data={radarData}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} tickCount={4} />
                <Radar name="Perfil" dataKey="score" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.15} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </motion.section>

        {/* Highest dimension complement */}
        <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }} className="rounded-xl border border-primary/15 bg-primary/[0.03] p-4 sm:p-5">
          <h3 className="text-foreground mb-1">Dimensão mais alta: {highestCat.label}</h3>
          <p className="text-[12px] text-card-foreground leading-relaxed">
            Essa foi a dimensão com maior pontuação no seu perfil ({scores.categoryScores[highestCat.key]?.pct}%). Considere investigar mais a fundo com um profissional especializado.
          </p>
        </motion.section>

        {/* Post-result feedback */}
        <PostResultFeedback testType={test.key} />

        {/* Disclaimer */}
        <div className="rounded-xl border border-accent/20 bg-accent/[0.03] p-4 sm:p-5">
          <h3 className="text-foreground mb-1">Nota Importante</h3>
          <p className="text-[12px] text-card-foreground leading-relaxed">
            Este questionário é um instrumento de autorrelato e <strong>não substitui avaliação profissional</strong>. Os resultados indicam padrões de funcionamento que merecem investigação com profissional qualificado.
          </p>
        </div>

        {/* Share */}
        <ShareButtonsAhsd />

        {/* Actions */}
        <div className="flex gap-3 justify-center flex-wrap print:hidden">
          <button
            onClick={async () => { if (resultRef.current) await exportElementAsPdf(resultRef.current, `rastreio-${test.key}.pdf`); }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-card hover:bg-muted transition-all text-[12px] font-medium text-foreground hover:scale-[1.02]"
          >
            <Download className="w-4 h-4" />
            Exportar PDF
          </button>
          <button
            onClick={onRestart}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-card hover:bg-muted transition-all text-[12px] font-medium text-foreground hover:scale-[1.02]"
          >
            <RotateCcw className="w-4 h-4" />
            Refazer
          </button>
          <Link
            to="/selecionar-teste"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-card hover:bg-muted transition-all text-[12px] font-medium text-foreground hover:scale-[1.02]"
          >
            Outros Testes
          </Link>
          <Link
            to="/historico"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-card hover:bg-muted transition-all text-[12px] font-medium text-foreground hover:scale-[1.02]"
          >
            <History className="w-4 h-4" />
            Meus Resultados
          </Link>
          {onSignOut && (
            <button
              onClick={onSignOut}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-card hover:bg-muted transition-all text-[12px] font-medium text-muted-foreground hover:scale-[1.02]"
            >
              <LogOut className="w-4 h-4" />
              Sair
            </button>
          )}
        </div>
      </main>
    </div>
  );
}

/* ────── Main AHSD Quiz Page ────── */
export default function AhsdQuizPage() {
  const { testKey } = useParams<{ testKey: string }>();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const test = testKey ? getTestByKey(testKey) : undefined;

  const [phase, setPhase] = useState<"loading" | "quiz" | "results">("loading");
  const [currentBlock, setCurrentBlock] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [resultsSaved, setResultsSaved] = useState(false);
  const [savedScores, setSavedScores] = useState<any>(null);

  const totalQuestions = test ? getTotalQuestions(test) : 0;
  const block = test?.questionBlocks[currentBlock];
  const answeredCount = Object.keys(answers).length;
  const progress = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;
  const blockComplete = block?.questions.every((q) => answers[q.id] !== undefined);
  const isLast = test ? currentBlock === test.questionBlocks.length - 1 : false;

  // ── Dropout tracking ──
  useDropoutTracking(test?.key ?? "unknown", totalQuestions, user?.id, answeredCount, phase === "results");

  // Check for saved result on mount (with 5s timeout)
  useEffect(() => {
    if (!user || !test) return;
    (async () => {
      try {
        const query = supabase
          .from("quiz_results")
          .select("scores")
          .eq("test_type", test.key)
          .order("created_at", { ascending: false })
          .limit(1);
        const timeout = new Promise<{ data: null }>((resolve) =>
          setTimeout(() => resolve({ data: null }), 5000)
        );
        const { data } = await Promise.race([query, timeout]);
        if (data && data.length > 0) {
          setSavedScores(data[0].scores);
          setPhase("results");
        } else {
          setPhase("quiz");
        }
      } catch {
        setPhase("quiz");
      }
    })();
  }, [user, test]);

  const saveResults = async () => {
    if (resultsSaved || !user || !test) return;
    try {
      const computed = calculateTestScores(test, answers);
      await supabase.from("quiz_results").insert({
        user_id: user.id,
        answers: answers as any,
        scores: computed as any,
        test_type: test.key,
      });
      setResultsSaved(true);
    } catch (e) {
      console.warn("Error saving results:", e);
    }
  };

  if (!loading && !user) return <Navigate to="/auth" replace />;
  if (!test) return <Navigate to="/selecionar-teste" replace />;

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
      setPhase("results");
    } else {
      setCurrentBlock((c) => c + 1);
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
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Results phase
  if (phase === "results") {
    const computed = Object.keys(answers).length > 0
      ? calculateTestScores(test, answers)
      : savedScores;

    if (Object.keys(answers).length > 0 && !resultsSaved) saveResults();

    if (computed) {
      return <AhsdResultsView test={test} scores={computed} onRestart={handleRestart} onSignOut={() => navigate("/selecionar-teste")} />;
    }
  }

  // Quiz phase
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="pt-10 pb-5 md:pt-14 md:pb-7 px-5 text-center">
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="max-w-md mx-auto space-y-3">
          <p className="text-primary text-[11px] font-semibold uppercase tracking-[0.15em]">
            {test.title}
          </p>
          <h1 className="text-foreground">
            {test.shortTitle}
          </h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {test.subtitle} · <span className="font-semibold text-foreground">~{test.estimatedMinutes} minutos</span>
          </p>
        </motion.div>
      </header>

      {/* Progress */}
      <div className="max-w-lg mx-auto w-full px-5 mb-5">
        <div className="flex items-baseline justify-between mb-1.5">
          <span className="font-semibold text-foreground text-sm tabular-nums">{progress}%</span>
          <span className="text-[11px] text-muted-foreground tabular-nums">{answeredCount}/{totalQuestions}</span>
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
        {block && (
          <AnimatePresence mode="wait">
            <motion.div
              key={block.id}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <div className="flex justify-between text-[10px] text-muted-foreground mb-3 sm:hidden px-0.5 uppercase tracking-widest">
                <span>{test.scaleLabels[0].value} {test.scaleLabels[0].label}</span>
                <span>{test.scaleLabels[test.scaleLabels.length - 1].value} {test.scaleLabels[test.scaleLabels.length - 1].label}</span>
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
                    <AhsdLikertScale questionId={q.id} value={answers[q.id]} onChange={handleAnswer} labels={test.scaleLabels} />
                  </motion.div>
                ))}
              </div>

              <div className="flex items-center justify-between mt-6">
                <Button variant="ghost" size="sm" onClick={handleBack} disabled={currentBlock === 0} className="text-xs h-9 px-4">
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
        )}
      </main>
    </div>
  );
}
