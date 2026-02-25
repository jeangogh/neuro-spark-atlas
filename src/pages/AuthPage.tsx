import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export default function AuthPage() {
  const navigate = useNavigate();
  const { user, loading, signInWithOtp } = useAuth();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState<"email" | "otp">("email");

  // If already authenticated, redirect
  useEffect(() => {
    if (!loading && user) {
      // Keep localStorage in sync for legacy compatibility
      localStorage.setItem("ahsd_user_email", user.email ?? "");
      navigate("/selecionar-teste", { replace: true });
    }
  }, [user, loading, navigate]);

  const handleSendOtp = async () => {
    setError(null);
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !trimmed.includes("@")) {
      setError("Informe um e-mail válido.");
      return;
    }
    setSubmitting(true);

    // Log funnel event (non-blocking)
    try {
      const sessionId = getSessionId();
      await supabase.from("funnel_events").insert({
        event_type: "login_email",
        session_id: sessionId,
        page: "/auth",
      });
    } catch {}

    const { error: otpError } = await signInWithOtp(trimmed);
    setSubmitting(false);

    if (otpError) {
      setError("Erro ao enviar código. Tente novamente.");
      return;
    }

    setStep("otp");
  };

  const handleVerifyOtp = async () => {
    setError(null);
    const code = otp.trim();
    if (code.length < 6) {
      setError("Informe o código de 6 dígitos.");
      return;
    }
    setSubmitting(true);

    const { error: verifyError } = await supabase.auth.verifyOtp({
      email: email.trim().toLowerCase(),
      token: code,
      type: "email",
    });

    setSubmitting(false);

    if (verifyError) {
      setError("Código inválido ou expirado. Tente novamente.");
      return;
    }
    // onAuthStateChange will handle the redirect via useEffect
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      step === "email" ? handleSendOtp() : handleVerifyOtp();
    }
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

        <AnimatePresence mode="wait">
          {step === "email" ? (
            <motion.div
              key="email-step"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground leading-tight mb-3 text-center">
                Entre com seu <span className="text-primary">e-mail</span>
              </h1>
              <p className="text-muted-foreground text-sm text-center mb-8 leading-relaxed">
                Enviaremos um código de acesso para o seu e-mail.
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
                    onClick={handleSendOtp}
                    disabled={submitting}
                    className="w-full py-3.5 rounded-xl font-semibold text-sm transition-all hover:scale-[1.01] hover:opacity-95 disabled:opacity-50 bg-primary text-primary-foreground"
                    style={{
                      boxShadow: "0 0 20px hsl(var(--primary) / 0.25), 0 4px 24px hsl(var(--primary) / 0.35)",
                    }}
                  >
                    {submitting ? "Enviando..." : "Enviar código"}
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="otp-step"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground leading-tight mb-3 text-center">
                Confira seu <span className="text-primary">e-mail</span>
              </h1>
              <p className="text-muted-foreground text-sm text-center mb-2 leading-relaxed">
                Enviamos um código de 6 dígitos para:
              </p>
              <p className="text-foreground text-sm text-center font-semibold mb-8">
                {email}
              </p>

              <div className="space-y-5">
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">
                    Código de acesso
                  </label>
                  <input
                    autoFocus
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    onKeyDown={handleKeyDown}
                    placeholder="000000"
                    className="w-full text-2xl text-center tracking-[0.3em] bg-transparent border-0 border-b-2 border-border pb-2 outline-none text-foreground placeholder:text-muted-foreground/40 transition-colors duration-200 focus:border-primary"
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

                <div className="pt-3 space-y-3">
                  <button
                    onClick={handleVerifyOtp}
                    disabled={submitting}
                    className="w-full py-3.5 rounded-xl font-semibold text-sm transition-all hover:scale-[1.01] hover:opacity-95 disabled:opacity-50 bg-primary text-primary-foreground"
                    style={{
                      boxShadow: "0 0 20px hsl(var(--primary) / 0.25), 0 4px 24px hsl(var(--primary) / 0.35)",
                    }}
                  >
                    {submitting ? "Verificando..." : "Entrar"}
                  </button>
                  <button
                    onClick={() => { setStep("email"); setOtp(""); setError(null); }}
                    className="w-full text-[12px] text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Usar outro e-mail
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
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
