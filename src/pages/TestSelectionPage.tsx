import { motion } from "framer-motion";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { LogOut } from "lucide-react";
import { ALL_TESTS } from "@/data/testRegistry";

export default function TestSelectionPage() {
  const { user, loading, signOut } = useAuth();

  if (!loading && !user) return <Navigate to="/auth" replace />;
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="pt-10 pb-6 md:pt-14 md:pb-8 px-5 text-center">
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="max-w-xl mx-auto"
        >
          <p className="text-primary text-[10px] font-semibold uppercase tracking-[0.18em] mb-2">
            AHSD Lab
          </p>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground tracking-tight mb-2">
            Qual rastreio você quer fazer?
          </h1>
          <p className="text-muted-foreground text-[13px] max-w-md mx-auto leading-relaxed">
            Escolha o protocolo mais adequado. Seus resultados ficam salvos e você pode acessar a qualquer momento.
          </p>
        </motion.div>
      </header>

      <main className="max-w-2xl mx-auto px-5 pb-24 space-y-4">
        {ALL_TESTS.map((test, i) => (
          <motion.div
            key={test.key}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 + i * 0.06, duration: 0.4 }}
          >
            <Link to={test.route} className="block">
              <div className="rounded-xl border bg-card p-5 sm:p-6 hover:border-primary/30 hover:shadow-lg transition-all group cursor-pointer">
                <div className="flex items-start gap-4">
                  <span className="text-3xl">{test.icon}</span>
                  <div className="flex-1 min-w-0">
                    <h2 className="font-display font-semibold text-foreground text-base sm:text-lg group-hover:text-primary transition-colors">
                      {test.title}
                    </h2>
                    <p className="text-[12px] text-primary font-medium mt-0.5">{test.subtitle}</p>
                    <p className="text-[13px] text-muted-foreground mt-2 leading-relaxed">
                      {test.description}
                    </p>
                  </div>
                  <div className="shrink-0 mt-1">
                    <span className="text-primary text-xl group-hover:translate-x-1 transition-transform inline-block">→</span>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}

        <div className="flex justify-center gap-4 pt-6">
          <Link
            to="/historico"
            className="text-[12px] font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Meus Resultados
          </Link>
          <button
            onClick={signOut}
            className="flex items-center gap-1.5 text-[12px] font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sair
          </button>
        </div>
      </main>
    </div>
  );
}
