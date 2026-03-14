import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, Lock, Clock } from "lucide-react";
import { AUDIO_EPISODES } from "@/data/audioContent";
import { useQuota } from "@/hooks/useQuota";
import { useToast } from "@/hooks/use-toast";
import BottomNav from "@/components/BottomNav";

const TEXTS = AUDIO_EPISODES;

export default function AprenderPage() {
  const navigate = useNavigate();
  const { isLocked, remaining } = useQuota();
  const { toast } = useToast();
  const freeLeft = remaining("textos");

  const handleClick = (id: string) => {
    if (isLocked("textos", id)) {
      toast({
        title: "Limite gratuito atingido",
        description: "Assine o Gifted Lab para continuar lendo.",
      });
      navigate("/explorar");
      return;
    }
    navigate(`/aprender/${id}`);
  };

  const estimateReadTime = (content: string): number => {
    return Math.max(1, Math.round(content.length / 1000));
  };

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
            Biblioteca
          </p>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-2">
            Aprender
          </h1>
          <p className="text-[14px] text-muted-foreground leading-relaxed">
            Textos para entender como voce funciona
          </p>
        </motion.div>
      </header>

      {/* Quota badge */}
      <div className="px-5 max-w-2xl mx-auto mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
          <BookOpen className="w-3.5 h-3.5 text-primary" />
          <span className="text-[12px] font-medium text-primary">
            {freeLeft} {freeLeft === 1 ? "leitura gratis restante" : "leituras gratis restantes"}
          </span>
        </div>
      </div>

      {/* Text list */}
      <div className="px-5 max-w-2xl mx-auto space-y-3">
        {TEXTS.map((ep, i) => {
          const locked = isLocked("textos", ep.id);
          const readMin = estimateReadTime(ep.content);

          return (
            <motion.button
              key={ep.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.35 }}
              onClick={() => handleClick(ep.id)}
              className={`w-full text-left rounded-xl border p-5 transition-all ${
                locked
                  ? "bg-card/50 border-border opacity-60"
                  : "bg-card border-border hover:border-primary/30 hover:shadow-sm"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-[15px] font-semibold text-foreground mb-1 leading-snug">
                    {ep.title}
                  </h3>
                  <p className="text-[13px] text-muted-foreground leading-relaxed line-clamp-2">
                    {ep.subtitle}
                  </p>
                  <div className="flex items-center gap-1.5 mt-3">
                    <Clock className="w-3 h-3 text-muted-foreground" />
                    <span className="text-[11px] text-muted-foreground">
                      ~{readMin} min leitura
                    </span>
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

      <BottomNav />
    </div>
  );
}
