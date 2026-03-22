import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const VARIANTE_A = "Você sente que algo sobre como você funciona foi explicado — ou que finalmente entendeu algo profundo sobre você?";
const VARIANTE_B = "Você sente que as coisas finalmente fazem sentido depois desse resultado?";

interface Props {
  testType: string;
}

export default function PostResultFeedback({ testType }: Props) {
  const { user } = useAuth();
  const [step, setStep] = useState<"pergunta" | "laudo" | "done">("pergunta");
  const [sentiuEntendeu, setSentiuEntendeu] = useState<boolean | null>(null);
  const [temLaudo, setTemLaudo] = useState<boolean | null>(null);

  const variante = useMemo(() => (Math.random() < 0.5 ? "A" : "B"), []);
  const pergunta = variante === "A" ? VARIANTE_A : VARIANTE_B;

  const handlePergunta = async (valor: boolean) => {
    setSentiuEntendeu(valor);
    setStep("laudo");
  };

  const handleLaudo = async (valor: boolean) => {
    setTemLaudo(valor);
    setStep("done");

    if (!user) return;
    try {
      await supabase.from("eficacia").insert({
        user_id: user.id,
        test_type: testType,
        sentiu_entendeu: sentiuEntendeu ?? valor,
        tem_laudo: valor,
        variante_pergunta: variante,
      } as any);
    } catch (e) {
      console.warn("PostResultFeedback save error", e);
    }
  };

  if (step === "done") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-primary/15 bg-primary/[0.03] p-5 text-center"
      >
        <p className="text-[13px] text-foreground font-medium">Obrigado pela sua resposta!</p>
        <p className="text-[11px] text-muted-foreground mt-1">Isso nos ajuda a melhorar continuamente.</p>
      </motion.div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      {step === "pergunta" && (
        <motion.div
          key="pergunta"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="rounded-xl border border-primary/20 bg-primary/[0.04] p-5 sm:p-6"
        >
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary mb-3">
            Queremos saber
          </p>
          <p className="text-[14px] sm:text-[15px] font-medium text-foreground leading-relaxed mb-5">
            {pergunta}
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => handlePergunta(true)}
              className="px-6 py-2.5 rounded-xl font-semibold text-sm bg-primary text-primary-foreground hover:scale-[1.02] transition-all"
            >
              Sim
            </button>
            <button
              onClick={() => handlePergunta(false)}
              className="px-6 py-2.5 rounded-xl font-semibold text-sm border border-border bg-card text-foreground hover:bg-muted hover:scale-[1.02] transition-all"
            >
              Não
            </button>
          </div>
        </motion.div>
      )}

      {step === "laudo" && (
        <motion.div
          key="laudo"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="rounded-xl border border-primary/20 bg-primary/[0.04] p-5 sm:p-6"
        >
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary mb-3">
            Mais uma pergunta
          </p>
          <p className="text-[14px] sm:text-[15px] font-medium text-foreground leading-relaxed mb-5">
            Você possui laudo ou diagnóstico formal de Altas Habilidades / Superdotação?
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => handleLaudo(true)}
              className="px-6 py-2.5 rounded-xl font-semibold text-sm bg-primary text-primary-foreground hover:scale-[1.02] transition-all"
            >
              Sim, tenho laudo
            </button>
            <button
              onClick={() => handleLaudo(false)}
              className="px-6 py-2.5 rounded-xl font-semibold text-sm border border-border bg-card text-foreground hover:bg-muted hover:scale-[1.02] transition-all"
            >
              Não tenho
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
