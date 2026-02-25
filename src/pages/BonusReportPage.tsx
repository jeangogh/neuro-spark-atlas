import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { generateCrossAnalysis, type CrossAnalysis, getTraitLabel } from "@/data/crossAnalysis";
import { ArrowLeft, Sparkles, Heart, AlertTriangle, Lightbulb } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const ICON_MAP = {
  strength: Heart,
  challenge: AlertTriangle,
  tip: Lightbulb,
};

const COLOR_MAP = {
  strength: "text-primary",
  challenge: "text-accent",
  tip: "text-muted-foreground",
};

const RELATIONSHIP_LABELS: Record<string, string> = {
  casal: "Casal",
  pai_filho: "Pai/Mãe e Filho(a)",
  irmaos: "Irmãos",
  amigos: "Amigos/Colegas",
  outros: "Outros",
};

export default function BonusReportPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const requestId = params.get("id");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<CrossAnalysis | null>(null);
  const [relType, setRelType] = useState("");
  const [relDetail, setRelDetail] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading || !user || !requestId) return;

    (async () => {
      // Fetch the bonus request
      const { data: req, error: reqErr } = await supabase
        .from("bonus_requests")
        .select("*")
        .eq("id", requestId)
        .maybeSingle();

      if (reqErr || !req) {
        setError("Solicitação não encontrada.");
        setLoading(false);
        return;
      }

      // Check authorization
      if (req.requester_id !== user.id && req.partner_id !== user.id) {
        setError("Você não tem permissão para ver este relatório.");
        setLoading(false);
        return;
      }

      if (req.status === "pending" || !req.partner_consented) {
        setError("O parceiro ainda não consentiu. Aguarde a confirmação.");
        setLoading(false);
        return;
      }

      setRelType(req.relationship_type);
      setRelDetail(req.relationship_detail);

      // If already analyzed, use cached result
      if (req.analysis_result) {
        setAnalysis(req.analysis_result as unknown as CrossAnalysis);
        setLoading(false);
        return;
      }

      // Fetch both users' latest results
      const [resA, resB] = await Promise.all([
        supabase
          .from("quiz_results")
          .select("scores")
          .eq("user_id", req.requester_id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase
          .from("quiz_results")
          .select("scores")
          .eq("user_id", req.partner_id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);

      if (!resA.data?.scores || !resB.data?.scores) {
        setError("Ambas as pessoas precisam ter feito pelo menos um teste para gerar o relatório.");
        setLoading(false);
        return;
      }

      const scoresA = resA.data.scores as Record<string, number>;
      const scoresB = resB.data.scores as Record<string, number>;
      const result = generateCrossAnalysis(scoresA, scoresB, req.relationship_type);

      // Cache the result
      await supabase
        .from("bonus_requests")
        .update({
          analysis_result: result as any,
          status: "analyzed",
          analyzed_at: new Date().toISOString(),
        })
        .eq("id", requestId);

      setAnalysis(result);
      setLoading(false);
    })();
  }, [authLoading, user, requestId]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">Gerando análise cruzada...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-5">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center max-w-sm">
          <AlertTriangle className="w-12 h-12 text-accent mx-auto mb-4" />
          <h1 className="text-xl font-bold text-foreground mb-3">{error}</h1>
          <Button onClick={() => navigate("/teste-bonus")} variant="outline">Voltar</Button>
        </motion.div>
      </div>
    );
  }

  if (!analysis) return null;

  const relLabel = RELATIONSHIP_LABELS[relType] ?? relType;

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur border-b border-border px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate("/teste-bonus")} className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg">Relatório Cruzado</h1>
      </header>

      <main className="max-w-2xl mx-auto px-5 py-8 space-y-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mb-4 mx-auto">
            <Sparkles className="w-7 h-7 text-accent" />
          </div>
          <Badge className="bg-accent/10 text-accent border-0 mb-3">
            {relLabel}{relDetail ? ` — ${relDetail}` : ""}
          </Badge>
          <h2 className="text-xl font-bold text-foreground mb-3">Análise de Interação</h2>
          <p className="text-muted-foreground text-[13px] max-w-md mx-auto leading-relaxed">
            {analysis.intro}
          </p>
        </motion.div>

        <Separator />

        {/* Dominant traits */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Traços dominantes</p>
          <div className="grid grid-cols-2 gap-3">
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Pessoa A</p>
                <p className="text-sm font-bold text-foreground mt-1">{analysis.personADominant.label}</p>
                <p className="text-2xl font-bold text-primary mt-1">{analysis.personADominant.pct}%</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Pessoa B</p>
                <p className="text-sm font-bold text-foreground mt-1">{analysis.personBDominant.label}</p>
                <p className="text-2xl font-bold text-accent mt-1">{analysis.personBDominant.pct}%</p>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        <Separator />

        {/* Insights */}
        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Insights da interação</p>
          {analysis.insights.map((insight, i) => {
            const Icon = ICON_MAP[insight.type];
            const color = COLOR_MAP[insight.type];
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.05 }}
              >
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 ${color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{insight.title}</p>
                        <p className="text-[13px] text-muted-foreground mt-1 leading-relaxed">{insight.body}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <Separator />

        {/* Summary */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-primary/20">
            <CardContent className="p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-2">Resumo</p>
              <p className="text-[14px] text-foreground leading-relaxed">{analysis.summary}</p>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
