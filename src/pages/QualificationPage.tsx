import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle2 } from "lucide-react";

/* ── Compact chip selector ── */
function ChipSelect({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { label: string; value: string }[];
  value: string | undefined;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold text-foreground">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const selected = value === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => onChange(opt.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-100 ${
                selected
                  ? "border-primary bg-primary/10 text-foreground"
                  : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── Data ── */
const Q = {
  interesse: {
    label: "Qual é o seu interesse neste tema?",
    options: [
      { label: "Profissional da saúde mental", value: "profissional" },
      { label: "Pai/mãe", value: "pai_mae" },
      { label: "Sobre mim mesmo(a)", value: "autoconhecimento" },
      { label: "Outro", value: "outro" },
    ],
  },
  faixa_renda: {
    label: "Faixa de renda mensal familiar?",
    options: [
      { label: "Até R$3k", value: "ate_3k" },
      { label: "R$3k–8k", value: "3k_8k" },
      { label: "R$8k–15k", value: "8k_15k" },
      { label: "R$15k–30k", value: "15k_30k" },
      { label: "+R$30k", value: "acima_30k" },
    ],
  },
  preferencia_aprendizado: {
    label: "Como prefere aprender?",
    options: [
      { label: "Sozinho(a)", value: "autodidata" },
      { label: "Grupo ao vivo", value: "grupo" },
      { label: "Individual", value: "individual" },
      { label: "Formação completa", value: "formacao" },
    ],
  },
  momento_atual: {
    label: "Seu momento atual?",
    options: [
      { label: "Busco solução urgente", value: "urgente" },
      { label: "Estou explorando com calma", value: "explorando" },
      { label: "Quero me aprofundar no tema", value: "aprofundar" },
      { label: "Busco certificação profissional", value: "certificacao" },
    ],
  },
  contato_ahsd: {
    label: "Contato prévio com AH/SD?",
    options: [
      { label: "Nunca", value: "nunca" },
      { label: "Já estudei", value: "autodidata" },
      { label: "Tenho diagnóstico", value: "diagnostico" },
      { label: "Trabalho com isso", value: "profissional" },
    ],
  },
};

const CONDITIONAL: Record<string, { label: string; options: { label: string; value: string }[] }> = {
  pai_mae: {
    label: "Seu filho(a) tem características de alta inteligência?",
    options: [
      { label: "Sim, claramente", value: "sim_claro" },
      { label: "Suspeito que sim", value: "suspeito" },
      { label: "Não sei identificar", value: "nao_sei" },
      { label: "Outras características", value: "outras" },
    ],
  },
  autoconhecimento: {
    label: "O que você mais busca agora?",
    options: [
      { label: "Saber se sou superdotado", value: "entender" },
      { label: "Desenvolver potencial", value: "potencial" },
      { label: "Desafios emocionais", value: "emocional" },
      { label: "Encontrar propósito", value: "proposito" },
    ],
  },
  profissional: {
    label: "Você já atende pessoas com AH/SD?",
    options: [
      { label: "Sim, atualmente", value: "sim_atende" },
      { label: "Quero atender", value: "quer_atender" },
      { label: "Atendo, mas com dúvidas", value: "duvidas" },
      { label: "Quero me especializar", value: "especializar" },
    ],
  },
};

const REQUIRED_KEYS = ["interesse", "faixa_renda", "preferencia_aprendizado", "momento_atual", "contato_ahsd"] as const;

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export default function QualificationPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [alreadyDone, setAlreadyDone] = useState<boolean | null>(null);
  const [phase, setPhase] = useState<"main" | "conditional">("main");
  const topRef = useRef<HTMLDivElement>(null);

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

  if (loading || alreadyDone === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const set = (key: string, value: string) => setAnswers((p) => ({ ...p, [key]: value }));

  const allMainFilled = REQUIRED_KEYS.every((k) => !!answers[k]);
  const hasConditional = !!CONDITIONAL[answers.interesse];
  const conditionalFilled = !hasConditional || !!answers.pergunta_condicional;

  const handleContinue = () => {
    if (hasConditional && phase === "main") {
      setPhase("conditional");
      topRef.current?.scrollIntoView({ behavior: "instant" });
      return;
    }
    handleSave();
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await supabase.from("qualification_responses").insert({
        user_id: user!.id,
        interesse: answers.interesse ?? "",
        faixa_renda: answers.faixa_renda ?? "",
        preferencia_aprendizado: answers.preferencia_aprendizado ?? "",
        momento_atual: answers.momento_atual ?? "",
        investimento: answers.investimento ?? "",
        contato_ahsd: answers.contato_ahsd ?? "",
        pergunta_condicional: answers.pergunta_condicional ?? null,
      });
    } catch {}
    navigate("/selecionar-teste", { replace: true });
  };

  const canProceed = phase === "main" ? allMainFilled : conditionalFilled;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center px-5 py-8 sm:py-12">
      <div ref={topRef} className="w-full max-w-lg">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary mb-2">
            Perfil rápido · {phase === "main" ? "1/2" : "2/2"}
          </p>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground leading-snug mb-1">
            {phase === "main" ? "Conte um pouco sobre você" : "Mais uma pergunta"}
          </h1>
          <p className="text-xs text-muted-foreground mb-6">
            {phase === "main" ? "Para personalizar sua experiência." : "Quase lá!"}
          </p>
        </motion.div>

        {/* Questions */}
        <motion.div
          key={phase}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.15 }}
          className="space-y-5"
        >
          {phase === "main" ? (
            <>
              {Object.entries(Q).map(([key, q]) => (
                <ChipSelect
                  key={key}
                  label={q.label}
                  options={q.options}
                  value={answers[key]}
                  onChange={(v) => set(key, v)}
                />
              ))}
            </>
          ) : (
            <ChipSelect
              label={CONDITIONAL[answers.interesse].label}
              options={CONDITIONAL[answers.interesse].options}
              value={answers.pergunta_condicional}
              onChange={(v) => {
                set("pergunta_condicional", v);
                // Auto-save after selecting
                setTimeout(() => {
                  setSaving(true);
                  supabase.from("qualification_responses").insert({
                    user_id: user!.id,
                    interesse: answers.interesse ?? "",
                    faixa_renda: answers.faixa_renda ?? "",
                    preferencia_aprendizado: answers.preferencia_aprendizado ?? "",
                    momento_atual: answers.momento_atual ?? "",
                    investimento: answers.investimento ?? "",
                    contato_ahsd: answers.contato_ahsd ?? "",
                    pergunta_condicional: v,
                  }).then(() => navigate("/selecionar-teste", { replace: true }));
                }, 200);
              }}
            />
          )}
        </motion.div>

        {/* CTA — only on main screen */}
        {phase === "main" && (
          <div className="mt-8">
            <button
              onClick={handleContinue}
              disabled={!canProceed || saving}
              className="w-full py-3 rounded-xl font-semibold text-sm bg-primary text-primary-foreground transition-all hover:scale-[1.01] disabled:opacity-40"
              style={{
                boxShadow: canProceed
                  ? "0 0 16px hsl(var(--primary) / 0.2), 0 4px 16px hsl(var(--primary) / 0.25)"
                  : "none",
              }}
            >
              {saving ? "Salvando..." : hasConditional ? "Continuar →" : "Iniciar rastreios →"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
