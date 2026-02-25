import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import { Mail } from "lucide-react";

export default function AuthPage() {
  const { user, loading, signInWithOtp } = useAuth();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (user) return <Navigate to="/selecionar-teste" replace />;

  const handleSubmit = async () => {
    setError(null);
    if (!email.trim()) {
      setError("Informe seu e-mail.");
      return;
    }
    setSubmitting(true);
    const { error } = await signInWithOtp(email.trim());
    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
    setSubmitting(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSubmit();
  };

  if (sent) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-5 py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.45 }}
          className="w-full max-w-md text-center"
        >
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 mx-auto">
            <Mail className="w-7 h-7 text-primary" />
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-3">
            Verifique seu e-mail
          </h1>
          <p className="text-muted-foreground text-[14px] leading-relaxed mb-2">
            Enviamos um link de acesso para
          </p>
          <p className="text-foreground font-semibold text-[15px] mb-6">{email}</p>
          <p className="text-muted-foreground text-[13px] leading-relaxed">
            Clique no link no e-mail para entrar. Verifique também a pasta de spam.
          </p>
          <button
            onClick={() => { setSent(false); setEmail(""); }}
            className="mt-6 text-[12px] text-primary hover:underline font-medium"
          >
            Usar outro e-mail
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-5 py-12">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.25, 0.1, 0.25, 1] }}
        className="w-full max-w-md"
      >
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary mb-6 text-center">
          AHSD Lab
        </p>

        <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground leading-tight mb-3 text-center">
          Entre com seu <span className="text-primary">e-mail</span>
        </h1>

        <p className="text-muted-foreground text-sm text-center mb-8 leading-relaxed">
          Enviaremos um link de acesso direto — sem senha.
        </p>

        <div className="space-y-5">
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">
              E-mail
            </label>
            <input
              autoFocus
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="seu@email.com"
              className="w-full text-base bg-transparent border-0 border-b-2 border-border pb-2 outline-none text-foreground placeholder:text-muted-foreground/40 transition-colors duration-200 focus:border-primary"
            />
          </div>

          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="text-[12px] text-destructive"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          <div className="pt-3">
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full py-3.5 rounded-xl font-semibold text-sm transition-all hover:scale-[1.01] hover:opacity-95 disabled:opacity-50"
              style={{
                background: "linear-gradient(135deg, hsl(40,88%,61%), hsl(36,87%,44%))",
                color: "hsl(225,12%,7%)",
                boxShadow: "0 0 20px hsl(40 88% 61% / 0.25), 0 4px 24px hsl(40,88%,61%/0.35)",
              }}
            >
              {submitting ? "Enviando..." : "Enviar link de acesso"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
