import { useNavigate, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, Lock, Clock, ArrowRight } from "lucide-react";
import { AUDIO_EPISODES } from "@/data/audioContent";
import { useQuota } from "@/hooks/useQuota";
import { useAuth } from "@/hooks/useAuth";
import { HOTMART_URL } from "@/lib/constants";
import BottomNav from "@/components/BottomNav";

export default function AprenderPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { isLocked, remaining, consume } = useQuota();
  const freeLeft = remaining("textos");
  const showPaywall = freeLeft === 0;

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  if (!user) return <Navigate to="/auth" replace />;

  const handleClick = (id: string) => {
    if (isLocked("textos", id)) return;
    consume("textos", id);
    navigate(`/aprender/${id}`);
  };

  const estimateReadTime = (content: string): number => Math.max(1, Math.round(content.length / 1000));

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="px-5 pt-12 pb-6 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-primary text-[10px] font-semibold uppercase tracking-[0.18em] mb-2">Biblioteca</p>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-2">Aprender</h1>
          <p className="text-[14px] text-muted-foreground leading-relaxed">Textos para entender como você funciona</p>
        </motion.div>
      </header>

      {!showPaywall && (
        <div className="px-5 max-w-2xl mx-auto mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
            <BookOpen className="w-3.5 h-3.5 text-primary" />
            <span className="text-[12px] font-medium text-primary">
              {freeLeft} {freeLeft === 1 ? "leitura grátis restante" : "leituras grátis restantes"}
            </span>
          </div>
        </div>
      )}

      {/* Text list — show all, lock after 3 */}
      <div className="px-5 max-w-2xl mx-auto space-y-3">
        {AUDIO_EPISODES.map((ep, i) => {
          const locked = isLocked("textos", ep.id);
          const readMin = estimateReadTime(ep.content);

          return (
            <motion.button
              key={ep.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.35 }}
              onClick={() => handleClick(ep.id)}
              disabled={locked}
              className={`w-full text-left rounded-xl border p-5 transition-all ${
                locked ? "bg-card/50 border-border opacity-50" : "bg-card border-border hover:border-primary/30 hover:shadow-sm"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-[15px] font-semibold text-foreground mb-1 leading-snug">{ep.title}</h3>
                  <p className="text-[13px] text-muted-foreground leading-relaxed line-clamp-2">{ep.subtitle}</p>
                  <div className="flex items-center gap-1.5 mt-3">
                    <Clock className="w-3 h-3 text-muted-foreground" />
                    <span className="text-[11px] text-muted-foreground">~{readMin} min leitura</span>
                  </div>
                </div>
                {locked && (
                  <div className="shrink-0 w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                    <Lock className="w-4 h-4 text-muted-foreground" />
                  </div>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Paywall after 3 texts consumed */}
      {showPaywall && (
        <div className="px-5 max-w-2xl mx-auto mt-8">
          <div className="rounded-2xl border border-primary/20 bg-primary/[0.04] p-6 text-center">
            <BookOpen className="w-8 h-8 text-primary mx-auto mb-3" />
            <h2 className="font-display text-xl font-bold text-foreground mb-2">Você leu seus 3 textos gratuitos</h2>
            <p className="text-[14px] text-muted-foreground leading-relaxed mb-5">
              Para continuar acessando todos os textos, áudios e análises — assine o Gifted Lab.
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
