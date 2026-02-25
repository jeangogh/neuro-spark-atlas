import { motion } from "framer-motion";
import { Share2 } from "lucide-react";
import BottomNav from "@/components/BottomNav";

export default function SharePage() {
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
          <h1 className="text-foreground text-2xl font-bold mb-3">Compartilhar</h1>
          <p className="text-muted-foreground text-[14px] leading-relaxed mb-6">
            Em breve você poderá convidar outras pessoas para fazer os testes gratuitamente com um link exclusivo.
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
