import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

interface DropoutRow {
  test_type: string;
  last_question_index: number;
  total_questions: number;
}

interface TestStats {
  testType: string;
  totalStarts: number;
  totalDropouts: number;
  dropoutRate: number;
  questionDropouts: Record<number, number>;
  totalQuestions: number;
}

const TEST_LABELS: Record<string, string> = {
  neurocognitivo: "Neurocognitivo (53q)",
  ahsd_adulto: "AH/SD Adulto (60q)",
  ahsd_infantil: "AH/SD Infantil (50q)",
  dimensional: "Dimensional (56q)",
  nef: "NEF",
};

export default function DropoutAnalyticsPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<TestStats[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [completions, setCompletions] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!user) return;
    (async () => {
      // Fetch dropouts
      const { data: dropouts } = await supabase
        .from("quiz_dropouts")
        .select("test_type, last_question_index, total_questions");

      // Fetch completions count per test_type
      const { data: results } = await supabase
        .from("quiz_results")
        .select("test_type");

      const compMap: Record<string, number> = {};
      (results ?? []).forEach((r: any) => {
        compMap[r.test_type] = (compMap[r.test_type] || 0) + 1;
      });
      setCompletions(compMap);

      // Group by test_type
      const grouped: Record<string, DropoutRow[]> = {};
      (dropouts ?? []).forEach((d: any) => {
        if (!grouped[d.test_type]) grouped[d.test_type] = [];
        grouped[d.test_type].push(d);
      });

      const computed: TestStats[] = Object.entries(grouped).map(([testType, rows]) => {
        const totalQ = rows[0]?.total_questions ?? 0;
        const questionDropouts: Record<number, number> = {};
        rows.forEach((r) => {
          questionDropouts[r.last_question_index] = (questionDropouts[r.last_question_index] || 0) + 1;
        });
        const totalCompleted = compMap[testType] || 0;
        const totalStarts = rows.length + totalCompleted;
        return {
          testType,
          totalStarts,
          totalDropouts: rows.length,
          dropoutRate: totalStarts > 0 ? (rows.length / totalStarts) * 100 : 0,
          questionDropouts,
          totalQuestions: totalQ,
        };
      });

      // Add tests with completions but no dropouts
      Object.entries(compMap).forEach(([testType, count]) => {
        if (!grouped[testType]) {
          computed.push({
            testType,
            totalStarts: count,
            totalDropouts: 0,
            dropoutRate: 0,
            questionDropouts: {},
            totalQuestions: 0,
          });
        }
      });

      computed.sort((a, b) => b.dropoutRate - a.dropoutRate);
      setStats(computed);
      setLoadingData(false);
    })();
  }, [user]);

  if (loading || loadingData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="pt-8 pb-4 px-5">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-foreground">Desistência por Teste</h1>
            <p className="text-xs text-muted-foreground">Taxa de dropout e questão onde o usuário parou</p>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-5 space-y-6">
        {stats.length === 0 && (
          <p className="text-muted-foreground text-center py-10">Nenhum dado de desistência registrado ainda.</p>
        )}

        {stats.map((s, si) => {
          const maxDropout = Math.max(1, ...Object.values(s.questionDropouts));
          return (
            <motion.div
              key={s.testType}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: si * 0.05 }}
              className="rounded-xl border bg-card p-5"
            >
              <div className="flex items-baseline justify-between mb-4">
                <h2 className="font-semibold text-foreground">
                  {TEST_LABELS[s.testType] || s.testType}
                </h2>
                <div className="flex gap-4 text-xs text-muted-foreground">
                  <span>Iniciaram: <b className="text-foreground">{s.totalStarts}</b></span>
                  <span>Desistiram: <b className="text-destructive">{s.totalDropouts}</b></span>
                  <span>Completaram: <b className="text-primary">{completions[s.testType] || 0}</b></span>
                </div>
              </div>

              {/* Overall dropout rate */}
              <div className="mb-4">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Taxa de desistência</span>
                  <span className="font-bold text-foreground">{s.dropoutRate.toFixed(1)}%</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-destructive/70"
                    style={{ width: `${Math.min(s.dropoutRate, 100)}%` }}
                  />
                </div>
              </div>

              {/* Per-question dropout */}
              {s.totalQuestions > 0 && Object.keys(s.questionDropouts).length > 0 && (
                <div>
                  <p className="text-[11px] text-muted-foreground uppercase tracking-widest mb-2">
                    Dropout por questão respondida
                  </p>
                  <div className="space-y-1">
                    {Array.from({ length: s.totalQuestions }, (_, i) => i + 1).map((qNum) => {
                      const count = s.questionDropouts[qNum] || 0;
                      if (count === 0) return null;
                      const pct = (count / s.totalDropouts) * 100;
                      return (
                        <div key={qNum} className="flex items-center gap-2 text-xs">
                          <span className="w-12 text-right text-muted-foreground tabular-nums">Q{qNum}</span>
                          <div className="flex-1 h-3 rounded bg-muted overflow-hidden">
                            <div
                              className="h-full rounded bg-destructive/60"
                              style={{ width: `${(count / maxDropout) * 100}%` }}
                            />
                          </div>
                          <span className="w-16 text-right tabular-nums text-muted-foreground">
                            {count} ({pct.toFixed(0)}%)
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
      </main>
    </div>
  );
}
