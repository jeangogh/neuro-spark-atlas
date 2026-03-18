import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import { Lock, ClipboardList, Beaker, ChevronRight, ArrowRight } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useQuota } from "@/hooks/useQuota";
import { HOTMART_URL } from "@/lib/constants";
import { ALL_MINITESTES, JORNADA_LABELS } from "@/data/minitestes";
import type { JornadaId } from "@/data/minitestes";
import BottomNav from "@/components/BottomNav";

const INVENTARIOS = [
  {
    title: "Painel Dimensional",
    description: "7 dimensões de funcionamento, 2 camadas",
    items: 56,
    link: "/triagem/dimensional",
  },
  {
    title: "Rastreio Neurocognitivo",
    description: "AHSD, TDAH, TEA e mais",
    items: 53,
    link: "/triagem",
  },
  {
    title: "AHSD Adulto",
    description: "Rastreio completo de superdotação",
    items: 60,
    link: "/triagem/ahsd-adulto",
  },
  {
    title: "AHSD Infantil",
    description: "Rastreio para crianças (pais respondem)",
    items: 50,
    link: "/triagem/ahsd-infantil",
  },
  {
    title: "Nucleos Emocionais (NEF)",
    description: "7 padrões emocionais dominantes",
    items: 35,
    link: "/nef",
  },
];

const JORNADA_IDS: JornadaId[] = ["J1", "J2", "J3", "J4", "J5", "J6"];

export default function AnalysesPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { isLocked, remaining, consume } = useQuota();
  const [jornadaFilter, setJornadaFilter] = useState<JornadaId | "all">("all");

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  if (!user) return <Navigate to="/auth" replace />;
  const freeLeft = remaining("testes");
  const showPaywall = freeLeft === 0;

  const handleTestClick = (link: string, testId: string) => {
    if (isLocked("testes", testId)) return;
    consume("testes", testId);
    navigate(link);
  };

  const filteredMinitestes =
    jornadaFilter === "all"
      ? ALL_MINITESTES
      : ALL_MINITESTES.filter((m) => m.jornada === jornadaFilter);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="px-5 pt-12 pb-6 max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <p className="text-primary text-[10px] font-semibold uppercase tracking-[0.18em] mb-2">
            Testes
          </p>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-2">
            Análises
          </h1>
          <p className="text-[14px] text-muted-foreground leading-relaxed">
            Testes de rastreio e autoconhecimento
          </p>
        </motion.div>
      </header>

      {/* Quota badge */}
      {!showPaywall && (
        <div className="px-5 max-w-2xl mx-auto mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
            <ClipboardList className="w-3.5 h-3.5 text-primary" />
            <span className="text-[12px] font-medium text-primary">
              {freeLeft} {freeLeft === 1 ? "teste grátis restante" : "testes grátis restantes"}
            </span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="px-5 max-w-2xl mx-auto">
        <Tabs defaultValue="inventarios" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="inventarios" className="flex-1">
              <ClipboardList className="w-3.5 h-3.5 mr-1.5" />
              Inventários
            </TabsTrigger>
            <TabsTrigger value="minitestes" className="flex-1">
              <Beaker className="w-3.5 h-3.5 mr-1.5" />
              Minitestes
            </TabsTrigger>
          </TabsList>

          {/* ── Inventarios tab ── */}
          <TabsContent value="inventarios">
            <div className="space-y-3 mt-4">
              {INVENTARIOS.map((inv, i) => {
                const testId = `inv-${i}`;
                const locked = isLocked("testes", testId);

                return (
                  <motion.button
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06, duration: 0.3 }}
                    onClick={() => handleTestClick(inv.link, testId)}
                    className={`w-full text-left rounded-xl border p-4 sm:p-5 transition-all ${
                      locked
                        ? "bg-card/50 border-border opacity-60"
                        : "bg-card border-border hover:border-primary/30 hover:shadow-sm"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-[14px] font-semibold text-foreground mb-0.5">
                          {inv.title}
                        </h3>
                        <p className="text-[12px] text-muted-foreground leading-relaxed">
                          {inv.description}
                        </p>
                        <span className="inline-block mt-2 text-[11px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">
                          {inv.items} itens
                        </span>
                      </div>
                      {locked ? (
                        <Lock className="w-4 h-4 text-muted-foreground shrink-0" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </TabsContent>

          {/* ── Minitestes tab ── */}
          <TabsContent value="minitestes">
            {/* Jornada filter pills */}
            <div className="mt-4 mb-5 overflow-x-auto scrollbar-hide">
              <div className="flex gap-2 pb-1">
                <button
                  onClick={() => setJornadaFilter("all")}
                  className={`shrink-0 px-3 py-1.5 rounded-full text-[12px] font-medium transition-all border ${
                    jornadaFilter === "all"
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card text-muted-foreground border-border hover:border-primary/30"
                  }`}
                >
                  Todos
                </button>
                {JORNADA_IDS.map((jid) => (
                  <button
                    key={jid}
                    onClick={() => setJornadaFilter(jid)}
                    className={`shrink-0 px-3 py-1.5 rounded-full text-[12px] font-medium transition-all border ${
                      jornadaFilter === jid
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-card text-muted-foreground border-border hover:border-primary/30"
                    }`}
                  >
                    {jid}
                  </button>
                ))}
              </div>
            </div>

            {/* Jornada label */}
            {jornadaFilter !== "all" && (
              <p className="text-[12px] text-muted-foreground mb-4">
                {JORNADA_LABELS[jornadaFilter]}
              </p>
            )}

            {/* Miniteste grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredMinitestes.map((mt, i) => {
                const locked = isLocked("testes", mt.id);

                return (
                  <motion.button
                    key={mt.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.03, 0.3), duration: 0.3 }}
                    onClick={() => handleTestClick(`/miniteste/${mt.id}`, mt.id)}
                    className={`text-left rounded-xl border p-4 transition-all ${
                      locked
                        ? "bg-card/50 border-border opacity-60"
                        : "bg-card border-border hover:border-primary/30 hover:shadow-sm"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-semibold">
                            {mt.jornada}
                          </span>
                          {locked && <Lock className="w-3 h-3 text-muted-foreground" />}
                        </div>
                        <h4 className="text-[13px] font-semibold text-foreground mb-0.5 leading-snug">
                          {mt.nome}
                        </h4>
                        <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">
                          {mt.foco}
                        </p>
                        <span className="inline-block mt-2 text-[10px] text-muted-foreground">
                          {mt.perguntas.length} perguntas
                        </span>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Paywall after 3 tests */}
      {showPaywall && (
        <div className="px-5 max-w-2xl mx-auto mt-8">
          <div className="rounded-2xl border border-primary/20 bg-primary/[0.04] p-6 text-center">
            <ClipboardList className="w-8 h-8 text-primary mx-auto mb-3" />
            <h2 className="font-display text-xl font-bold text-foreground mb-2">Você fez seus 3 testes gratuitos</h2>
            <p className="text-[14px] text-muted-foreground leading-relaxed mb-5">
              Para continuar acessando todos os testes, áudios e textos — assine o Gifted Lab.
            </p>
            <a
              href={HOTMART_URL}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-sm bg-primary text-primary-foreground hover:scale-[1.02] transition-all"
              style={{ boxShadow: "0 0 20px hsl(var(--primary) / 0.25), 0 4px 20px hsl(var(--primary) / 0.35)" }}
            >
              Assinar Gifted Lab — R$29,90/mês <ArrowRight className="w-4 h-4" />
            </a>
            <p className="text-[11px] text-muted-foreground mt-3">7 dias de garantia · Cancela quando quiser</p>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
