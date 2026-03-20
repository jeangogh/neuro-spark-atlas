import { useState } from "react";
import { MessageSquarePlus } from "lucide-react";
import { useLocation } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

const VISIBLE_PATHS = ["/", "/explorar", "/aprender"];

export default function FeedbackFab() {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [bom, setBom] = useState("");
  const [ruim, setRuim] = useState("");
  const [quer, setQuer] = useState("");
  const [sending, setSending] = useState(false);

  if (!VISIBLE_PATHS.includes(pathname) || !user) return null;

  const handleSend = async () => {
    if (!bom.trim() && !ruim.trim() && !quer.trim()) {
      toast({ title: "Preencha pelo menos um campo", variant: "destructive" });
      return;
    }
    setSending(true);
    const { error } = await supabase.from("feedbacks").insert({
      user_id: user.id,
      pagina: pathname,
      o_que_esta_bom: bom.trim() || null,
      o_que_esta_ruim: ruim.trim() || null,
      o_que_quer: quer.trim() || null,
    });
    setSending(false);
    if (error) {
      toast({ title: "Erro ao enviar feedback", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Feedback enviado! 🎉", description: "Obrigado por compartilhar sua opinião." });
    setBom("");
    setRuim("");
    setQuer("");
    setOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed z-[50] flex items-center justify-center rounded-full shadow-lg transition-all duration-300 active:scale-95 bg-accent text-accent-foreground border border-border hover:border-primary/30"
        style={{ bottom: 100, left: 16, width: 52, height: 52 }}
        aria-label="Enviar feedback"
      >
        <MessageSquarePlus size={22} />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg">Seu feedback importa 💬</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Nos ajude a melhorar o app com suas impressões.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">O que está bom no app?</label>
              <Textarea value={bom} onChange={(e) => setBom(e.target.value)} placeholder="Adorei que..." rows={2} />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">O que está ruim?</label>
              <Textarea value={ruim} onChange={(e) => setRuim(e.target.value)} placeholder="Acho que poderia..." rows={2} />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">O que você quer que tenha?</label>
              <Textarea value={quer} onChange={(e) => setQuer(e.target.value)} placeholder="Queria que tivesse..." rows={2} />
            </div>
            <Button onClick={handleSend} disabled={sending} className="w-full">
              {sending ? "Enviando..." : "Enviar feedback"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
