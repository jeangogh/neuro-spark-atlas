import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Navigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { RotateCcw, LogOut } from "lucide-react";

interface QuizResult {
  id: string;
  created_at: string;
  scores: Record<string, number>;
}

const CONDITION_LABELS: Record<string, string> = {
  ahsd: "AH/SD",
  dupla_exc: "Dupla Exc.",
  tdah: "TDAH",
  tea: "Autismo",
  trauma: "Trauma",
  depressao: "Depressão",
  ansiedade: "Ansiedade",
};

export default function HistoryPage() {
  const { user, loading, signOut } = useAuth();
  const [results, setResults] = useState<QuizResult[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("quiz_results")
        .select("id, created_at, scores")
        .order("created_at", { ascending: false });
      setResults((data as any) ?? []);
      setFetching(false);
    })();
  }, [user]);

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
      <nav className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="max-w-3xl mx-auto px-5 h-14 flex items-center justify-between">
          <Link to="/triagem" className="flex items-center gap-2 text-[12px] font-medium text-primary hover:underline">
            <RotateCcw className="w-3.5 h-3.5" />
            Novo Rastreio
          </Link>
          <button onClick={signOut} className="flex items-center gap-2 text-[12px] font-medium text-muted-foreground hover:text-foreground transition-colors">
            <LogOut className="w-3.5 h-3.5" />
            Sair
          </button>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-5 py-10">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary mb-2">Seus Resultados</p>
          <h1 className="font-display text-2xl font-bold text-foreground mb-6">Histórico de Rastreios</h1>

          {fetching ? (
            <p className="text-muted-foreground text-sm">Carregando...</p>
          ) : results.length === 0 ? (
            <div className="rounded-xl border bg-card p-8 text-center">
              <p className="text-muted-foreground text-sm mb-4">Você ainda não fez nenhum rastreio.</p>
              <Link
                to="/triagem"
                className="inline-block px-6 py-2.5 rounded-xl font-semibold text-sm"
                style={{
                  background: "linear-gradient(135deg, hsl(40,88%,61%), hsl(36,87%,44%))",
                  color: "hsl(225,12%,7%)",
                }}
              >
                Iniciar Rastreio
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {results.map((r, i) => {
                const scores = r.scores as Record<string, number>;
                const topKeys = Object.entries(scores)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 3);

                return (
                  <motion.div
                    key={r.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="rounded-xl border bg-card p-5"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="text-[11px] text-muted-foreground">
                          {new Date(r.created_at).toLocaleDateString("pt-BR", {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                        <p className="text-sm font-semibold text-foreground mt-0.5">Rastreio #{results.length - i}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {topKeys.map(([key, score]) => (
                        <span
                          key={key}
                          className="text-[11px] font-medium px-2.5 py-1 rounded-md"
                          style={{ backgroundColor: "hsl(var(--primary) / 0.1)", color: "hsl(var(--primary))" }}
                        >
                          {CONDITION_LABELS[key] ?? key}: {score}%
                        </span>
                      ))}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
