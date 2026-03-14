import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export default function AuthPage() {
  const navigate = useNavigate();
  const { user, loading, signInWithOtp } = useAuth();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      // Check if user already completed qualification
      supabase
        .from("qualification_responses")
        .select("id")
        .eq("user_id", user.id)
        .limit(1)
        .then(({ data }) => {
          if (data && data.length > 0) {
            navigate("/selecionar-teste", { replace: true });
          } else {
            navigate("/qualificacao", { replace: true });
          }
        });
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

    // Send OTP magic link
    const { error: otpError } = await signInWithOtp(trimmed);

    if (otpError) {
      setSubmitting(false);
      setError("Erro ao enviar o link. Tente novamente.");
      return;
    }

    setSubmitting(false);
    setOtpSent(true);
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

        {otpSent ? (
          <>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground leading-tight mb-3 text-center">
              Verifique seu <span className="text-primary">e-mail</span>
            </h1>
            <p className="text-muted-foreground text-sm text-center mb-8 leading-relaxed">
              Enviamos um link de acesso para <strong className="text-foreground">{email}</strong>. Clique no link para entrar.
            </p>
            <div className="pt-3">
              <button
                onClick={() => { setOtpSent(false); setEmail(""); }}
                className="w-full py-3.5 rounded-xl font-semibold text-sm transition-all hover:scale-[1.01] hover:opacity-95 bg-muted text-foreground"
              >
                Usar outro e-mail
              </button>
            </div>
          </>
        ) : (
          <>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground leading-tight mb-3 text-center">
              Entre com seu <span className="text-primary">e-mail</span>
            </h1>
            <p className="text-muted-foreground text-sm text-center mb-8 leading-relaxed">
              Informe seu e-mail para receber um link de acesso.
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
                  {submitting ? "Enviando..." : "Enviar link de acesso"}
                </button>
              </div>
            </div>
          </>
        )}
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
