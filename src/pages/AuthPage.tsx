import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export default function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [checking, setChecking] = useState(false);

  // Check if already "logged in" via localStorage
  const stored = localStorage.getItem("ahsd_user_email");
  if (stored && !checking) {
    // Already entered, go straight
    navigate("/selecionar-teste", { replace: true });
    return null;
  }

  const handleSubmit = async () => {
    setError(null);
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !trimmed.includes("@")) {
      setError("Informe um e-mail válido.");
      return;
    }
    setSubmitting(true);

    // Register the access in the leads-style log (funnel_events)
    try {
      const sessionId = getSessionId();
      await supabase.from("funnel_events").insert({
        event_type: "login_email",
        session_id: sessionId,
        page: "/auth",
      });
    } catch {
      // non-blocking
    }

    // Store email locally
    localStorage.setItem("ahsd_user_email", trimmed);

    setSubmitting(false);
    setChecking(true);

    // Show "checking credentials" for 2s then redirect
    setTimeout(() => {
      navigate("/selecionar-teste", { replace: true });
    }, 2200);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSubmit();
  };

  // Credential checking screen
  if (checking) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-5">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-6" />
          <h1 className="text-xl font-bold text-foreground mb-2">
            Conferindo suas credenciais
          </h1>
          <p className="text-muted-foreground text-sm">Aguarde um momento...</p>
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

        <h1 className="text-3xl sm:text-4xl font-bold text-foreground leading-tight mb-3 text-center">
          Entre com seu <span className="text-primary">e-mail</span>
        </h1>

        <p className="text-muted-foreground text-sm text-center mb-8 leading-relaxed">
          Informe seu e-mail para começar.
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
              onChange={(e) => setEmail(e.target.value)}
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
              className="w-full py-3.5 rounded-xl font-semibold text-sm transition-all hover:scale-[1.01] hover:opacity-95 disabled:opacity-50 bg-primary text-primary-foreground"
              style={{
                boxShadow: "0 0 20px hsl(var(--primary) / 0.25), 0 4px 24px hsl(var(--primary) / 0.35)",
              }}
            >
              {submitting ? "Entrando..." : "Entrar"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function getSessionId(): string {
  let sid = sessionStorage.getItem("sid");
  if (!sid) {
    sid = crypto.randomUUID();
    sessionStorage.setItem("sid", sid);
  }
  return sid;
}
