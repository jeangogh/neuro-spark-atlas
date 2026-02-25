import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Navigate } from "react-router-dom";
import { Share2, Copy, Check, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import BottomNav from "@/components/BottomNav";
import { toast } from "sonner";

interface Invite {
  id: string;
  invite_code: string;
  guest_name: string | null;
  guest_email: string | null;
  used_at: string | null;
  created_at: string;
}

export default function SharePage() {
  const { user, loading } = useAuth();
  const [invites, setInvites] = useState<Invite[]>([]);
  const [creating, setCreating] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    fetchInvites();
  }, [user]);

  async function fetchInvites() {
    const { data } = await supabase
      .from("shared_invites")
      .select("*")
      .eq("inviter_id", user!.id)
      .order("created_at", { ascending: false });
    setInvites((data as any) ?? []);
  }

  async function handleCreate() {
    if (!user) return;
    setCreating(true);
    const { error } = await supabase
      .from("shared_invites")
      .insert({ inviter_id: user.id });
    if (error) {
      toast.error("Erro ao criar convite");
    } else {
      toast.success("Convite criado!");
      await fetchInvites();
    }
    setCreating(false);
  }

  function getInviteUrl(code: string) {
    return `${window.location.origin}/convite/${code}`;
  }

  async function handleCopy(code: string) {
    await navigator.clipboard.writeText(getInviteUrl(code));
    setCopied(code);
    toast.success("Link copiado!");
    setTimeout(() => setCopied(null), 2000);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;

  return (
    <div className="min-h-screen bg-background">
      <header className="pt-10 pb-6 px-5 text-center">
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-xl mx-auto"
        >
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 mx-auto">
            <Share2 className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Compartilhar Teste</h1>
          <p className="text-muted-foreground text-[13px] max-w-md mx-auto leading-relaxed">
            Gere um link único para outra pessoa fazer todos os testes gratuitamente (uso único).
          </p>
        </motion.div>
      </header>

      <main className="max-w-lg mx-auto px-5 pb-24 space-y-6">
        <Button onClick={handleCreate} disabled={creating} className="w-full" size="lg">
          {creating ? "Gerando..." : "Gerar novo convite"}
        </Button>

        {invites.length > 0 && (
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Seus convites ({invites.length})
            </p>
            {invites.map((inv, i) => (
              <motion.div
                key={inv.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-muted-foreground">
                          {new Date(inv.created_at).toLocaleDateString("pt-BR", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                        {inv.used_at ? (
                          <p className="text-sm font-medium text-foreground mt-0.5">
                            Usado por {inv.guest_name ?? inv.guest_email ?? "convidado"}
                          </p>
                        ) : (
                          <p className="text-sm text-primary font-medium mt-0.5">Pendente</p>
                        )}
                      </div>
                      {inv.used_at ? (
                        <span className="text-[10px] font-semibold px-2 py-1 rounded-full bg-muted text-muted-foreground">
                          Utilizado
                        </span>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCopy(inv.invite_code)}
                          className="shrink-0"
                        >
                          {copied === inv.invite_code ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                          Copiar
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  );
}
