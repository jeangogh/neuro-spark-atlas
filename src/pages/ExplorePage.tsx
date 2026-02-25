import { motion } from "framer-motion";
import { Compass } from "lucide-react";
import BottomNav from "@/components/BottomNav";

export default function ExplorePage() {
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
            <Compass className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-foreground text-2xl font-bold mb-3">Explorar</h1>
          <p className="text-muted-foreground text-[14px] leading-relaxed mb-6">
            Novos protocolos de rastreio estão sendo desenvolvidos. Em breve você terá acesso a novas avaliações aqui.
          </p>
          <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-[12px] font-semibold uppercase tracking-wider">
            Em breve
          </span>
        </motion.div>
      </main>
      <BottomNav />
    </div>
  );
}
