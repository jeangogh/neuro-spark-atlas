import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";

type Status = "loading" | "invalid" | "already" | "ready" | "done";

const RELATIONSHIP_LABELS: Record<string, string> = {
  casal: "Casal",
  pai_filho: "Pai/Mãe e Filho(a)",
  irmaos: "Irmãos",
  amigos: "Amigos/Colegas",
  outros: "Outros",
};

export default function ConsentPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const token = params.get("token");

  const [status, setStatus] = useState<Status>("loading");
  const [requestInfo, setRequestInfo] = useState<{
    relationship_type: string;
    relationship_detail: string | null;
    partner_email: string;
  } | null>(null);
  const [consenting, setConsenting] = useState(false);

  useEffect(() => {
    if (!token) { setStatus("invalid"); return; }

    (async () => {
      const { data, error } = await supabase
        .from("bonus_requests")
        .select("id, relationship_type, relationship_detail, partner_email, partner_consented, status")
        .eq("consent_token", token)
        .maybeSingle();

      if (error || !data) { setStatus("invalid"); return; }
      if (data.partner_consented) { setStatus("already"); return; }

      setRequestInfo({
        relationship_type: data.relationship_type,
        relationship_detail: data.relationship_detail,
        partner_email: data.partner_email,
      });
      setStatus("ready");
    })();
  }, [token]);

  async function handleConsent() {
    if (!user || !token) {
      toast.error("Você precisa estar logado para consentir");
      return;
    }
    setConsenting(true);

    const { error } = await supabase
      .from("bonus_requests")
      .update({
        partner_id: user.id,
        partner_consented: true,
        status: "consented",
        consented_at: new Date().toISOString(),
      })
      .eq("consent_token", token)
      .eq("status", "pending");

    if (error) {
      toast.error("Erro ao registrar consentimento");
    } else {
      setStatus("done");
      toast.success("Consentimento registrado!");
    }
    setConsenting(false);
  }

  if (authLoading || status === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (status === "invalid") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-5">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center max-w-sm">
          <XCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-3">Link inválido</h1>
          <p className="text-muted-foreground text-sm mb-6">Este link de consentimento não existe ou está incorreto.</p>
          <Button onClick={() => navigate("/")} variant="outline">Ir para o início</Button>
        </motion.div>
      </div>
    );
  }

  if (status === "already" || status === "done") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-5">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-sm">
          <CheckCircle2 className="w-12 h-12 text-primary mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-3">Consentimento registrado</h1>
          <p className="text-muted-foreground text-sm mb-6">
            {status === "done"
              ? "Seu consentimento foi registrado com sucesso! A análise cruzada será gerada em breve."
              : "Este consentimento já foi registrado anteriormente."}
          </p>
          <Button onClick={() => navigate("/selecionar-teste")}>Ir para os testes</Button>
        </motion.div>
      </div>
    );
  }

  // status === "ready"
  const relLabel = RELATIONSHIP_LABELS[requestInfo?.relationship_type ?? ""] ?? requestInfo?.relationship_type;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-5">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <p className="text-primary text-[10px] font-semibold uppercase tracking-[0.18em] mb-2">
            AHSD Lab — Teste Bônus
          </p>
          <h1 className="text-2xl font-bold text-foreground mb-3">Consentimento para Análise Cruzada</h1>
          <p className="text-muted-foreground text-[13px] leading-relaxed">
            Alguém solicitou uma análise cruzada dos resultados de rastreio entre vocês.
          </p>
        </div>

        <div className="rounded-xl border bg-card p-5 space-y-3">
          <div>
            <p className="text-xs text-muted-foreground">Tipo de relação</p>
            <p className="text-sm font-semibold text-foreground">
              {relLabel}
              {requestInfo?.relationship_detail ? ` — ${requestInfo.relationship_detail}` : ""}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Ao consentir, você autoriza</p>
            <p className="text-[13px] text-foreground leading-relaxed mt-1">
              O cruzamento dos seus resultados de rastreio com os da outra pessoa, gerando um relatório de interação entre ambos os perfis.
            </p>
          </div>
        </div>

        {!user ? (
          <div className="space-y-3">
            <p className="text-[13px] text-muted-foreground text-center">
              Você precisa ter uma conta para consentir. Faça login ou crie uma conta primeiro.
            </p>
            <Button onClick={() => navigate("/auth")} className="w-full" size="lg">
              Entrar / Criar conta
            </Button>
          </div>
        ) : (
          <Button onClick={handleConsent} disabled={consenting} className="w-full" size="lg">
            {consenting ? "Registrando..." : "Concordo e autorizo"}
          </Button>
        )}

        <p className="text-[10px] text-muted-foreground text-center leading-relaxed">
          Seus dados pessoais não serão compartilhados. Apenas os perfis de rastreio serão cruzados para gerar insights de convivência.
        </p>
      </motion.div>
    </div>
  );
}
