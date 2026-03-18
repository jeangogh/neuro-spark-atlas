import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

type InviteStatus = "loading" | "valid" | "used" | "invalid";

export default function GuestInvitePage() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const [status, setStatus] = useState<InviteStatus>("loading");
  const [inviteId, setInviteId] = useState<string>("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!code) { setStatus("invalid"); return; }
    (async () => {
      const { data, error } = await supabase
        .from("shared_invites")
        .select("id, used_at")
        .eq("invite_code", code)
        .maybeSingle();
      if (error || !data) { setStatus("invalid"); return; }
      if (data.used_at) { setStatus("used"); return; }
      setInviteId(data.id);
      setStatus("valid");
    })();
  }, [code]);

  async function handleSubmit() {
    if (!name.trim() || !email.trim()) {
      toast.error("Preencha nome e email");
      return;
    }
    setSubmitting(true);

    // Sign up guest with OTP
    const { error: authError } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: window.location.origin + "/selecionar-teste" },
    });
    if (authError) {
      toast.error("Erro ao criar conta: " + authError.message);
      setSubmitting(false);
      return;
    }

    // Store invite info in sessionStorage for after OTP verification
    sessionStorage.setItem("guest_invite", JSON.stringify({
      invite_id: inviteId,
      invite_code: code,
      guest_name: name.trim(),
      guest_email: email.trim(),
    }));

    toast.success("Verifique seu email para continuar!");
    setSubmitting(false);
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (status === "invalid") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-5">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center max-w-sm">
          <h1 className="text-2xl font-bold text-foreground mb-3">Convite inválido</h1>
          <p className="text-muted-foreground text-sm mb-6">
            Este link de convite não existe ou está incorreto.
          </p>
          <Button onClick={() => navigate("/")} variant="outline">Ir para o início</Button>
        </motion.div>
      </div>
    );
  }

  if (status === "used") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-5">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center max-w-sm">
          <h1 className="text-2xl font-bold text-foreground mb-3">Convite já utilizado</h1>
          <p className="text-muted-foreground text-sm mb-6">
            Este convite já foi usado. Para fazer o rastreio, adquira seu acesso.
          </p>
          <Button asChild>
            <a href="https://www.rastreioaltashabilidadesjeanalessandro.com/" target="_blank" rel="noopener noreferrer">
              Adquirir acesso
            </a>
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-5">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm space-y-6"
      >
        <div className="text-center">
          <p className="text-primary text-[10px] font-semibold uppercase tracking-[0.18em] mb-2">
            Convite especial
          </p>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Rastreio de Altas Habilidades
          </h1>
          <p className="text-muted-foreground text-[13px] leading-relaxed">
            Você recebeu um convite para realizar todos os testes gratuitamente. Preencha seus dados para começar.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="guest-name">Nome completo</Label>
            <Input
              id="guest-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="guest-email">Email</Label>
            <Input
              id="guest-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="mt-1"
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />
          </div>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full"
          size="lg"
        >
          {submitting ? "Enviando..." : "Começar rastreio"}
        </Button>

        <p className="text-[11px] text-muted-foreground text-center">
          Um código de verificação será enviado ao seu email.
        </p>
      </motion.div>
    </div>
  );
}
