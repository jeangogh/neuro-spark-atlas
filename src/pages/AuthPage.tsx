import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const FALLBACK_PASSWORD = "ahsd-lab-access-2024-x7k";

export default function AuthPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      navigate("/selecionar-teste", { replace: true });
    }
  }, [user, loading, navigate]);

  const handleLogin = async () => {
    setError(null);
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !trimmed.includes("@")) {
      setError("Informe um e-mail válido.");
      return;
    }
    setSubmitting(true);

    // Track funnel event
    try {
      const sessionId = getSessionId();
      await supabase.from("funnel_events").insert({
        event_type: "login_email",
        session_id: sessionId,
        page: "/auth",
      });
    } catch {}

    // Try sign in first, then sign up if user doesn't exist
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: trimmed,
      password: FALLBACK_PASSWORD,
    });

    if (signInError) {
      // User doesn't exist — try to create account
      const { error: signUpError } = await supabase.auth.signUp({
        email: trimmed,
        password: FALLBACK_PASSWORD,
      });

      if (signUpError) {
        // User exists but with a different password (pre-migration) — reset via edge function
        if (signUpError.message?.includes("already") || (signUpError as any).code === "user_already_exists") {
          try {
            const res = await fetch(
              `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/reset-user-password`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json", "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY },
                body: JSON.stringify({ email: trimmed, password: FALLBACK_PASSWORD }),
              }
            );
            if (res.ok) {
              // Retry sign in with updated password
              const { error: retryError } = await supabase.auth.signInWithPassword({
                email: trimmed,
                password: FALLBACK_PASSWORD,
              });
              if (retryError) {
                setSubmitting(false);
                setError("Erro ao entrar. Tente novamente.");
                return;
              }
            } else {
              setSubmitting(false);
              setError("Erro ao entrar. Tente novamente.");
              return;
            }
          } catch {
            setSubmitting(false);
            setError("Erro ao entrar. Tente novamente.");
            return;
          }
        } else {
          setSubmitting(false);
          setError("Erro ao entrar. Tente novamente.");
          return;
        }
      }
    }

    // onAuthStateChange will handle redirect via useEffect
    setSubmitting(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleLogin();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
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
          Informe seu e-mail para acessar os rastreios.
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
              onClick={handleLogin}
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
