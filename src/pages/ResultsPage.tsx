import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ClipboardList, ArrowRight } from "lucide-react";

export default function ResultsPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navbar */}
      <nav className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-5 h-12 flex items-center">
          <Link to="/" className="text-[12px] font-medium text-muted-foreground hover:text-foreground transition-colors">
            ← Voltar
          </Link>
        </div>
      </nav>

      {/* Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-5 py-20 text-center">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
          <ClipboardList className="w-7 h-7 text-primary" />
        </div>
        <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
          Meus Resultados
        </h1>
        <p className="text-muted-foreground text-[15px] leading-relaxed max-w-sm mb-8">
          Você ainda não completou a triagem neurofuncional. Faça agora e descubra seu perfil cognitivo.
        </p>
        <Link to="/triagem">
          <Button size="lg" className="gap-2">
            Iniciar Triagem <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </main>
    </div>
  );
}
