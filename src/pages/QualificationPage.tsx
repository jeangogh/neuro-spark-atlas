import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { ChevronRight, ChevronLeft, CheckCircle2 } from "lucide-react";

/* ── Question definitions ── */
interface Option {
  label: string;
  value: string;
}

interface Question {
  id: string;
  title: string;
  options: Option[];
  /** Only show when `interesse` matches one of these values */
  condition?: string[];
}

const QUESTIONS: Question[] = [
  {
    id: "interesse",
    title: "Qual é o seu interesse neste tema?",
    options: [
      { label: "Sou profissional da saúde mental", value: "profissional" },
      { label: "Sou pai/mãe de criança/adolescente", value: "pai_mae" },
      { label: "Quero entender melhor sobre mim mesmo(a)", value: "autoconhecimento" },
      { label: "Outro", value: "outro" },
    ],
  },
  {
    id: "faixa_renda",
    title: "Qual é a sua faixa de renda mensal familiar?",
    options: [
      { label: "Até R$3.000", value: "ate_3k" },
      { label: "R$3.000 – R$8.000", value: "3k_8k" },
      { label: "R$8.000 – R$15.000", value: "8k_15k" },
      { label: "R$15.000 – R$30.000", value: "15k_30k" },
      { label: "Acima de R$30.000", value: "acima_30k" },
    ],
  },
  {
    id: "preferencia_aprendizado",
    title: "Como você prefere aprender/ser atendido?",
    options: [
      { label: "Estudar sozinho no meu ritmo", value: "autodidata" },
      { label: "Experiência ao vivo com grupo", value: "grupo" },
      { label: "Atendimento individual personalizado", value: "individual" },
      { label: "Formação técnica completa", value: "formacao" },
    ],
  },
  {
    id: "momento_atual",
    title: "Qual é o seu momento atual?",
    options: [
      { label: "Preciso de respostas urgentes", value: "urgente" },
      { label: "Estou explorando, sem pressa", value: "explorando" },
      { label: "Quero me aprofundar sistematicamente", value: "aprofundar" },
      { label: "Busco certificação/credencial", value: "certificacao" },
    ],
  },
  {
    id: "investimento",
    title: "Quanto você pode investir agora em sua solução ideal?",
    options: [
      { label: "Até R$500", value: "ate_500" },
      { label: "R$500 – R$2.000", value: "500_2k" },
      { label: "R$2.000 – R$5.000", value: "2k_5k" },
      { label: "R$5.000 – R$10.000", value: "5k_10k" },
      { label: "Acima de R$10.000", value: "acima_10k" },
    ],
  },
  {
    id: "contato_ahsd",
    title: "Você já teve contato com o tema de AH/SD antes?",
    options: [
      { label: "Nunca ouvi falar até hoje", value: "nunca" },
      { label: "Já li/estudei por conta própria", value: "autodidata" },
      { label: "Já fiz avaliação ou tenho diagnóstico", value: "diagnostico" },
      { label: "Trabalho com isso", value: "profissional" },
    ],
  },
  // Conditional 7A – pai/mãe
  {
    id: "pergunta_condicional",
    title: "Seu filho(a) tem características de alta inteligência?",
    condition: ["pai_mae"],
    options: [
      { label: "Sim, claramente", value: "sim_claro" },
      { label: "Suspeito que sim", value: "suspeito" },
      { label: "Não sei identificar", value: "nao_sei" },
      { label: "Não, mas outras características importantes", value: "outras" },
    ],
  },
  // Conditional 7B – autoconhecimento
  {
    id: "pergunta_condicional",
    title: "O que você mais busca agora?",
    condition: ["autoconhecimento"],
    options: [
      { label: "Entender se sou superdotado", value: "entender" },
      { label: "Desenvolver meu potencial", value: "potencial" },
      { label: "Lidar com desafios emocionais", value: "emocional" },
      { label: "Encontrar meu propósito", value: "proposito" },
    ],
  },
  // Conditional 7C – profissional
  {
    id: "pergunta_condicional",
    title: "Você já atende pessoas com AH/SD?",
    condition: ["profissional"],
    options: [
      { label: "Sim, tenho casos atualmente", value: "sim_atende" },
      { label: "Ainda não, mas quero atender", value: "quer_atender" },
      { label: "Atendo mas tenho dúvidas", value: "duvidas" },
      { label: "Quero me especializar", value: "especializar" },
    ],
  },
];

export default function QualificationPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [alreadyDone, setAlreadyDone] = useState<boolean | null>(null);

  // Build visible questions based on branching
  const visibleQuestions = QUESTIONS.filter((q) => {
    if (!q.condition) return true;
    return q.condition.includes(answers.interesse ?? "");
  });

  const totalSteps = visibleQuestions.length;

  // Check if user already filled qualification
  useEffect(() => {
    if (!user) return;
    supabase
      .from("qualification_responses")
      .select("id")
      .eq("user_id", user.id)
      .limit(1)
      .then(({ data }) => {
        if (data && data.length > 0) {
          setAlreadyDone(true);
          navigate("/selecionar-teste", { replace: true });
        } else {
          setAlreadyDone(false);
        }
      });
  }, [user, navigate]);

  useEffect(() => {
    if (!loading && !user) navigate("/auth", { replace: true });
  }, [user, loading, navigate]);

  const saveAndNavigate = async (finalAnswers: Record<string, string>) => {
    setSaving(true);
    try {
      await supabase.from("qualification_responses").insert({
        user_id: user!.id,
        interesse: finalAnswers.interesse ?? "",
        faixa_renda: finalAnswers.faixa_renda ?? "",
        preferencia_aprendizado: finalAnswers.preferencia_aprendizado ?? "",
        momento_atual: finalAnswers.momento_atual ?? "",
        investimento: finalAnswers.investimento ?? "",
        contato_ahsd: finalAnswers.contato_ahsd ?? "",
        pergunta_condicional: finalAnswers.pergunta_condicional ?? null,
      });
    } catch {}
    navigate("/selecionar-teste", { replace: true });
  };

  // Auto-advance on select
  const handleSelect = (value: string) => {
    const updated = { ...answers, [visibleQuestions[step].id]: value };
    setAnswers(updated);

    // Recompute visible after this answer (branching may change)
    const nextVisible = QUESTIONS.filter((q) => {
      if (!q.condition) return true;
      return q.condition.includes(updated.interesse ?? "");
    });

    if (step < nextVisible.length - 1) {
      // Small delay so user sees their selection flash
      setTimeout(() => setStep(step + 1), 180);
    } else {
      // Last question — save immediately
      setTimeout(() => saveAndNavigate(updated), 180);
    }
  };

  if (loading || alreadyDone === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const current = visibleQuestions[step];
  if (!current) return null;

  const progress = ((step + 1) / totalSteps) * 100;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-5 py-12">
      {/* Progress — minimal */}
      <div className="w-full max-w-md mb-6">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            {step + 1} de {totalSteps}
          </span>
        </div>
        <div className="h-1 rounded-full bg-secondary overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-primary"
            initial={false}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.15 }}
          />
        </div>
      </div>

      {/* Question — fast transitions */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.15 }}
          className="w-full max-w-md"
        >
          <h2 className="text-lg sm:text-xl font-bold text-foreground leading-snug mb-5">
            {current.title}
          </h2>

          <div className="space-y-2">
            {current.options.map((opt) => {
              const selected = answers[current.id] === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => handleSelect(opt.value)}
                  className={`w-full text-left px-4 py-3 rounded-xl border transition-all duration-100 text-sm font-medium ${
                    selected
                      ? "border-primary bg-primary/10 text-foreground scale-[0.98]"
                      : "border-border bg-card text-foreground active:scale-[0.98]"
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Back only — no "Next" button needed */}
      {step > 0 && (
        <div className="w-full max-w-md mt-6">
          <button
            onClick={() => setStep(step - 1)}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Voltar
          </button>
        </div>
      )}
    </div>
  );
}
