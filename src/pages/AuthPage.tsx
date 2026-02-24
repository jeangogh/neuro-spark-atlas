import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";

export default function AuthPage() {
  const { user, loading, signIn, signUp } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (user) return <Navigate to="/triagem" replace />;

  const handleSubmit = async () => {
    setError(null);
    setSuccess(null);
    if (!email.trim() || !password.trim()) {
      setError("Preencha todos os campos.");
      return;
    }
    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    setSubmitting(true);
    if (mode === "login") {
      const { error } = await signIn(email.trim(), password);
      if (error) setError(error.message === "Invalid login credentials" ? "E-mail ou senha incorretos." : error.message);
    } else {
      const { error } = await signUp(email.trim(), password);
      if (error) {
        setError(error.message);
      } else {
        setSuccess("Conta criada! Verifique seu e-mail para confirmar o cadastro.");
      }
    }
    setSubmitting(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-5 py-12">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.25, 0.1, 0.25, 1] }}
        className="w-full max-w-md"
      >
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary mb-6 text-center">
          Rastreio de Altas Habilidades e Neurodivergência
        </p>

        <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground leading-tight mb-3 text-center">
          {mode === "login" ? (
            <>Acesse sua <span className="text-primary">conta</span></>
          ) : (
            <>Crie sua <span className="text-primary">conta</span></>
          )}
        </h1>

        <p className="text-muted-foreground text-sm text-center mb-8 leading-relaxed">
          {mode === "login"
            ? "Entre para acessar o rastreio e ver seus resultados salvos."
            : "Cadastre-se para salvar e revisar seus resultados."}
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

          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">
              Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Mínimo 6 caracteres"
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
            {success && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="text-[12px]"
                style={{ color: "hsl(141,58%,54%)" }}
              >
                {success}
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
              {submitting ? "Aguarde..." : mode === "login" ? "Entrar" : "Criar Conta"}
            </button>
          </div>

          <p className="text-center text-[13px] text-muted-foreground">
            {mode === "login" ? (
              <>
                Não tem conta?{" "}
                <button onClick={() => { setMode("signup"); setError(null); setSuccess(null); }} className="text-primary hover:underline font-medium">
                  Cadastre-se
                </button>
              </>
            ) : (
              <>
                Já tem conta?{" "}
                <button onClick={() => { setMode("login"); setError(null); setSuccess(null); }} className="text-primary hover:underline font-medium">
                  Entrar
                </button>
              </>
            )}
          </p>
        </div>
      </motion.div>
    </div>
  );
}
