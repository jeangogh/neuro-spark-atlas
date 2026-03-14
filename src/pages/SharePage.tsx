import { Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Share2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import BottomNav from "@/components/BottomNav";

export default function SharePage() {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  if (!user) return <Navigate to="/auth" replace />;

  return (
    <div className="min-h-screen bg-background">
      <main className="flex flex-col items-center justify-center px-5 py-20 text-center min-h-[80vh]">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="max-w-sm"
        >
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 mx-auto">
            <Share2 className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-foreground text-2xl font-bold mb-3">Compartilhar com Amigos</h1>
          <p className="text-muted-foreground text-[14px] leading-relaxed mb-4">
            Estamos preparando algo especial para você!
          </p>
          <ul className="text-muted-foreground text-[13px] leading-relaxed text-left space-y-2 mb-6">
            <li>🔗 Gere um <strong className="text-foreground">link exclusivo</strong> para amigos e familiares</li>
            <li>🧠 Eles poderão fazer <strong className="text-foreground">todos os testes gratuitamente</strong></li>
            <li>📊 Compare perfis e descubra <strong className="text-foreground">como vocês se complementam</strong></li>
          </ul>
          <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-[12px] font-semibold uppercase tracking-wider">
            Em breve
          </span>
        </motion.div>
      </main>
      <BottomNav />
    </div>
  );
}
