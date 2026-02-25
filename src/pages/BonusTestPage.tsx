import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Navigate, useNavigate } from "react-router-dom";
import { Sparkles, Send, Clock, CheckCircle2, Users, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import BottomNav from "@/components/BottomNav";
import { toast } from "sonner";

const RELATIONSHIP_TYPES = [
  { id: "casal", label: "Casal", icon: "💑" },
  { id: "pai_filho", label: "Pai/Mãe e Filho(a)", icon: "👨‍👧" },
  { id: "irmaos", label: "Irmãos", icon: "👫" },
  { id: "amigos", label: "Amigos/Colegas", icon: "🤝" },
  { id: "outros", label: "Outros", icon: "👥" },
];

interface BonusRequest {
  id: string;
  partner_email: string;
  relationship_type: string;
  relationship_detail: string | null;
  status: string;
  partner_consented: boolean;
  created_at: string;
}

const STATUS_MAP: Record<string, { label: string; color: string; Icon: typeof Clock }> = {
  pending: { label: "Aguardando", color: "text-accent", Icon: Clock },
  consented: { label: "Consentido", color: "text-primary", Icon: CheckCircle2 },
  analyzed: { label: "Analisado", color: "text-primary", Icon: Sparkles },
};

export default function BonusTestPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState<BonusRequest[]>([]);
  const [fetching, setFetching] = useState(true);

  // Form state
  const [step, setStep] = useState<"list" | "form">("list");
  const [selectedType, setSelectedType] = useState("");
  const [detail, setDetail] = useState("");
  const [partnerEmail, setPartnerEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetchRequests();
  }, [user]);

  async function fetchRequests() {
    const { data } = await supabase
      .from("bonus_requests")
      .select("id, partner_email, relationship_type, relationship_detail, status, partner_consented, created_at")
      .eq("requester_id", user!.id)
      .order("created_at", { ascending: false });
    setRequests((data as any) ?? []);
    setFetching(false);
  }

  async function handleSubmit() {
    if (!selectedType || !partnerEmail.trim()) {
      toast.error("Selecione o tipo de relação e informe o email");
      return;
    }
    setSubmitting(true);

    const { error } = await supabase.from("bonus_requests").insert({
      requester_id: user!.id,
      partner_email: partnerEmail.trim(),
      relationship_type: selectedType,
      relationship_detail: selectedType === "outros" ? detail.trim() || null : null,
    });

    if (error) {
      toast.error("Erro ao enviar solicitação");
    } else {
      toast.success("Solicitação enviada! Um email será enviado para confirmação.");
      setStep("list");
      setSelectedType("");
      setDetail("");
      setPartnerEmail("");
      await fetchRequests();
    }
    setSubmitting(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;

  return (
    <div className="min-h-screen bg-background">
      <header className="pt-10 pb-6 px-5 text-center">
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="max-w-xl mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center mb-4 mx-auto">
            <Sparkles className="w-6 h-6 text-accent" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Teste Bônus</h1>
          <p className="text-muted-foreground text-[13px] max-w-md mx-auto leading-relaxed">
            Cruze seus resultados com outra pessoa e descubra insights sobre a interação entre vocês.
          </p>
        </motion.div>
      </header>

      <main className="max-w-lg mx-auto px-5 pb-24 space-y-6">
        <AnimatePresence mode="wait">
          {step === "list" ? (
            <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
              <Button onClick={() => setStep("form")} className="w-full" size="lg">
                <Users className="w-4 h-4 mr-2" />
                Nova análise cruzada
              </Button>

              {fetching ? (
                <p className="text-muted-foreground text-sm text-center">Carregando...</p>
              ) : requests.length > 0 ? (
                <div className="space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Suas solicitações ({requests.length})
                  </p>
                  {requests.map((req, i) => {
                    const st = STATUS_MAP[req.status] ?? STATUS_MAP.pending;
                    const relLabel = RELATIONSHIP_TYPES.find((r) => r.id === req.relationship_type)?.label ?? req.relationship_type;
                    return (
                      <motion.div
                        key={req.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04 }}
                      >
                        <Card>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0 flex-1">
                                <p className="text-xs text-muted-foreground">
                                  {new Date(req.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}
                                </p>
                                <p className="text-sm font-semibold text-foreground mt-0.5">{req.partner_email}</p>
                                <p className="text-[11px] text-muted-foreground mt-0.5">{relLabel}{req.relationship_detail ? ` — ${req.relationship_detail}` : ""}</p>
                              </div>
                              <div className="flex flex-col items-end gap-1.5">
                                <span className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-full bg-muted ${st.color}`}>
                                  <st.Icon className="w-3 h-3" />
                                  {st.label}
                                </span>
                                {(req.status === "consented" || req.status === "analyzed") && (
                                  <button
                                    onClick={() => navigate(`/teste-bonus/relatorio?id=${req.id}`)}
                                    className="flex items-center gap-1 text-[10px] font-semibold text-primary hover:underline"
                                  >
                                    <Eye className="w-3 h-3" />
                                    Ver Relatório
                                  </button>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-10">
                  <p className="text-muted-foreground text-sm">Você ainda não criou nenhuma análise cruzada.</p>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div key="form" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              {/* Relationship type selection */}
              <div>
                <Label className="text-sm font-semibold">Qual a relação entre vocês?</Label>
                <div className="grid grid-cols-2 gap-2 mt-3">
                  {RELATIONSHIP_TYPES.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setSelectedType(type.id)}
                      className={`flex items-center gap-2 p-3 rounded-xl border text-left transition-all text-sm ${
                        selectedType === type.id
                          ? "border-primary bg-primary/5 text-primary font-medium"
                          : "border-border bg-card text-foreground hover:border-primary/30"
                      }`}
                    >
                      <span className="text-lg">{type.icon}</span>
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              {selectedType === "outros" && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
                  <Label htmlFor="detail">Descreva a relação</Label>
                  <Input
                    id="detail"
                    value={detail}
                    onChange={(e) => setDetail(e.target.value)}
                    placeholder="Ex: Professor e aluno"
                    className="mt-1"
                  />
                </motion.div>
              )}

              <div>
                <Label htmlFor="partner-email">Email da outra pessoa</Label>
                <Input
                  id="partner-email"
                  type="email"
                  value={partnerEmail}
                  onChange={(e) => setPartnerEmail(e.target.value)}
                  placeholder="pessoa@email.com"
                  className="mt-1"
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                />
                <p className="text-[11px] text-muted-foreground mt-1.5">
                  A pessoa receberá um email pedindo consentimento para cruzar os resultados.
                </p>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep("list")} className="flex-1">
                  Voltar
                </Button>
                <Button onClick={handleSubmit} disabled={submitting} className="flex-1">
                  <Send className="w-4 h-4 mr-2" />
                  {submitting ? "Enviando..." : "Enviar"}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      <BottomNav />
    </div>
  );
}
