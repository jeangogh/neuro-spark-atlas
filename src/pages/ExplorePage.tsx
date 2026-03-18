import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  ChevronDown, ArrowRight, Check, Zap, ScanSearch, FileText,
  Route, TrendingUp, Camera, Film, X, Play, Pause, Lock, Headphones,
} from "lucide-react";
import { AUDIO_EPISODES } from "@/data/audioContent";
import { useQuota } from "@/hooks/useQuota";
import { HOTMART_URL } from "@/lib/constants";
import BottomNav from "@/components/BottomNav";

// ── Subscription content (preserved from original) ──

const STEPS = [
  { icon: ScanSearch, num: "01", title: "Análise", text: "A plataforma investiga uma dimensão do seu funcionamento por semana. Cruza com o que o rastreio já revelou. Resultado: um retrato preciso do que está acontecendo com você agora." },
  { icon: FileText, num: "02", title: "Relatório", text: "O que está regulado. O que está em sobrecarga. Onde está o travamento. Sem jargão. Sem teoria. Sobre você." },
  { icon: Route, num: "03", title: "Plano", text: "Com base no resultado, a IA monta seu plano. Conteúdo direcionado — aulas, protocolos, exercícios — pra resolver o que foi identificado. Não o que é popular. O que você precisa." },
  { icon: TrendingUp, num: "04", title: "Evolução", text: "Na semana seguinte, mede o que mudou. Ajusta. Evolui. A IA já conhece seu rastreio. Em 3 meses, a precisão é outra." },
];

const INCLUDES = [
  "Teste dimensional completo — 7 dimensões, perfil molecular, assinatura de funcionamento",
  "Análises semanais com IA — relatório personalizado toda semana",
  "Monitoramento diário — check-in de 2-3 minutos, dashboard em tempo real",
  "Plano personalizado semanal — atualizado com base no que apareceu",
  "Conteúdo de intervenção — não aula genérica, material pra trabalhar padrões",
  "Relatório mensal — o que mudou, o que travou, comparativo com o rastreio",
];

const COMPARISONS = [
  { rastreio: "Um resultado estático", giftedlab: "Análise que evolui toda semana" },
  { rastreio: "Você sabe que é superdotado", giftedlab: "Você sabe COMO funciona — e o que fazer" },
  { rastreio: "Informação genérica sobre AHSD", giftedlab: "Plano personalizado pro SEU padrão" },
  { rastreio: "Alívio de saber o nome", giftedlab: "Ferramenta pra mudar o que trava" },
  { rastreio: "Mesma resposta pra todo mundo", giftedlab: "IA que já conhece seu rastreio e adapta" },
  { rastreio: "Foto do momento", giftedlab: "Filme em tempo real" },
];

const FAQS = [
  { q: "Já fiz o rastreio. Qual a diferença?", a: "O rastreio é uma foto. O Gifted Lab é um filme. Ele pega o que o rastreio revelou e investiga toda semana — medindo evolução, identificando padrões e ajustando seu plano." },
  { q: "Preciso refazer o teste?", a: "Não. A plataforma já parte do seu resultado. Tudo que o rastreio mapeou é ponto de partida pro ciclo semanal." },
  { q: "Quanto tempo por dia?", a: "2-3 minutos no check-in diário. 15-20 minutos nas análises semanais." },
  { q: "Posso cancelar quando quiser?", a: "Sim. Mensal sem fidelidade. Cancela pelo app." },
  { q: "E se não fizer sentido?", a: "7 dias de garantia. Pede reembolso. Sem atrito." },
];

const AUDIOS = AUDIO_EPISODES;

export default function ExplorePage() {
  const { user, loading } = useAuth();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [showSticky, setShowSticky] = useState(false);
  const heroCtaRef = useRef<HTMLButtonElement>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { isLocked, remaining, consume } = useQuota();

  // Observe heroCtaRef to show/hide sticky CTA
  useEffect(() => {
    const el = heroCtaRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setShowSticky(!entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  if (!user) return <Navigate to="/auth" replace />;
  const freeLeft = remaining("audios");
  const showPaywall = freeLeft === 0;

  const handleCta = () => {
    window.location.href = HOTMART_URL;
  };

  const handlePlay = (id: string, audioUrl: string) => {
    if (isLocked("audios", id)) return;
    consume("audios", id);
    if (playingId === id && audioRef.current) {
      if (audioRef.current.paused) audioRef.current.play(); else audioRef.current.pause();
      return;
    }
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    if (audioUrl) {
      const a = new Audio(audioUrl);
      a.play().catch(() => {});
      a.addEventListener("ended", () => setPlayingId(null));
      audioRef.current = a;
    }
    setPlayingId(id);
  };

  return (
    <div className="min-h-screen bg-background pb-20">

      {/* ═══ AUDIO SECTION ═══ */}
      <header className="px-5 pt-12 pb-6 max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <p className="text-primary text-[10px] font-semibold uppercase tracking-[0.18em] mb-2">
            Conteúdo
          </p>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-2">
            Explorar
          </h1>
          <p className="text-[14px] text-muted-foreground leading-relaxed">
            Áudios narrados por Peter
          </p>
        </motion.div>
      </header>

      {/* Quota badge */}
      <div className="px-5 max-w-2xl mx-auto mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
          <Headphones className="w-3.5 h-3.5 text-primary" />
          <span className="text-[12px] font-medium text-primary">
            {freeLeft} {freeLeft === 1 ? "áudio grátis restante" : "áudios grátis restantes"}
          </span>
        </div>
      </div>

      {/* Audio cards */}
      <div className="px-5 max-w-2xl mx-auto space-y-3 mb-8">
        {AUDIOS.map((ep, i) => {
          const locked = isLocked("audios", ep.id);
          const isPlaying = playingId === ep.id;

          return (
            <motion.div
              key={ep.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.35 }}
              className={`rounded-xl border p-5 transition-all ${
                locked ? "bg-card/50 border-border opacity-50"
                : isPlaying ? "bg-card border-primary/30 shadow-sm"
                : "bg-card border-border"
              }`}
            >
              <div className="flex items-start gap-4">
                <button
                  onClick={() => handlePlay(ep.id, ep.audioUrl)}
                  disabled={locked}
                  className={`shrink-0 w-11 h-11 rounded-full flex items-center justify-center transition-all active:scale-95 ${
                    locked ? "bg-muted" : isPlaying ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary hover:bg-primary/20"
                  }`}
                >
                  {locked ? <Lock className="w-4 h-4 text-muted-foreground" />
                    : isPlaying ? <Pause className="w-4 h-4" />
                    : <Play className="w-4 h-4 ml-0.5" />}
                </button>
                <div className="flex-1 min-w-0">
                  <h3 className="text-[15px] font-semibold text-foreground mb-1 leading-snug">{ep.title}</h3>
                  <p className="text-[13px] text-muted-foreground leading-relaxed line-clamp-2">{ep.subtitle}</p>
                  <span className="inline-block mt-2 text-[11px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">{ep.duration}</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Paywall after 3 audios */}
      {showPaywall && (
        <div className="px-5 max-w-2xl mx-auto mb-8">
          <div className="rounded-2xl border border-primary/20 bg-primary/[0.04] p-6 text-center">
            <Headphones className="w-8 h-8 text-primary mx-auto mb-3" />
            <h2 className="font-display text-xl font-bold text-foreground mb-2">Você ouviu seus 3 áudios gratuitos</h2>
            <p className="text-[14px] text-muted-foreground leading-relaxed mb-5">
              Para continuar acessando todos os áudios, textos e análises — assine o Gifted Lab.
            </p>
            <button
              onClick={handleCta}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-sm bg-primary text-primary-foreground hover:scale-[1.02] transition-all"
              style={{ boxShadow: "0 0 20px hsl(var(--primary) / 0.25), 0 4px 20px hsl(var(--primary) / 0.35)" }}
            >
              Assinar Gifted Lab — R$29,90/mês <ArrowRight className="w-4 h-4" />
            </button>
            <p className="text-[11px] text-muted-foreground mt-3">7 dias de garantia · Cancela quando quiser</p>
          </div>
        </div>
      )}

      {/* ═══ DIVIDER ═══ */}
      <div className="max-w-2xl mx-auto px-5 mb-8">
        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-border" />
          <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
            Próximo passo
          </span>
          <div className="flex-1 h-px bg-border" />
        </div>
      </div>

      {/* ═══ HERO ═══ */}
      <section className="px-5 pt-4 pb-12 max-w-2xl mx-auto text-center">
        <motion.div initial={{ opacity: 0, y: -16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
          <p className="text-primary text-[10px] font-semibold uppercase tracking-[0.18em] mb-4">Gifted Lab</p>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground leading-[1.1] mb-6">
            Você fez o rastreio.
            <br />
            Sabe que é superdotado.
            <br />
            <span className="text-muted-foreground">E agora?</span>
          </h2>

          <div className="space-y-3 text-[15px] text-muted-foreground leading-relaxed max-w-lg mx-auto mb-8">
            <p>Saber o nome não muda nada sozinho.</p>
            <p>
              Você precisa de mapa. Precisa de ferramenta. Precisa de algo que investigue o que está acontecendo com você toda semana e te diga:{" "}
              <span className="text-foreground font-medium">aqui é onde trava. Aqui é o que fazer.</span>
            </p>
            <p>O rastreio te deu o nome. O Gifted Lab te dá o caminho.</p>
          </div>

          <button
            ref={heroCtaRef}
            onClick={handleCta}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-sm transition-all hover:scale-[1.02] bg-primary text-primary-foreground"
            style={{ boxShadow: "0 0 20px hsl(var(--primary) / 0.25), 0 4px 20px hsl(var(--primary) / 0.35)" }}
          >
            Assinar o Gifted Lab — R$29,90/mês
            <ArrowRight className="w-4 h-4" />
          </button>
          <p className="text-[11px] text-muted-foreground mt-3">
            Menos de R$1/dia · 7 dias de garantia · Cancela quando quiser
          </p>
        </motion.div>
      </section>

      {/* ═══ O PROBLEMA ═══ */}
      <section className="px-5 py-10 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.45 }}>
          <p className="text-primary text-[10px] font-semibold uppercase tracking-[0.18em] mb-4">O problema</p>
          <div className="rounded-xl border bg-card p-5 sm:p-6 space-y-4 text-[14px] text-muted-foreground leading-relaxed">
            <p>Você descobriu que é superdotado. Sentiu alívio. Talvez euforia.</p>
            <p className="text-foreground font-medium">E depois veio o vazio.</p>
            <p>
              Porque saber que seu motor é diferente não conserta a pista. Saber que sua mente funciona em 7 dimensões não regula nenhuma delas.
              Saber que você tem assinatura de Camaleão Exausto não faz o mascaramento parar.
            </p>
            <p>
              Informação sem personalização é ruído. Saber que superdotados têm dificuldade com perfeccionismo não resolve o{" "}
              <span className="text-foreground font-medium">seu</span> perfeccionismo.
            </p>
            <p className="text-foreground font-medium">Você precisa de investigação contínua. Não de mais conteúdo genérico.</p>
          </div>
        </motion.div>
      </section>

      {/* ═══ COMPARACAO ═══ */}
      <section className="px-5 py-10 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.45 }}>
          <p className="text-primary text-[10px] font-semibold uppercase tracking-[0.18em] mb-4">O que muda</p>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground mb-8">De foto parada pra filme em tempo real.</h2>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-muted/50 border border-border">
              <Camera className="w-4 h-4 text-muted-foreground shrink-0" />
              <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Rastreio</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary/[0.06] border border-primary/20">
              <Film className="w-4 h-4 text-primary shrink-0" />
              <span className="text-[11px] font-semibold uppercase tracking-widest text-primary">Gifted Lab</span>
            </div>
          </div>

          <div className="space-y-2.5">
            {COMPARISONS.map((row, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                className="grid grid-cols-2 gap-3"
              >
                <div className="rounded-xl border border-border bg-card p-4 flex items-start gap-2.5">
                  <X className="w-3.5 h-3.5 text-muted-foreground/40 shrink-0 mt-0.5" />
                  <p className="text-[12px] sm:text-[13px] text-muted-foreground leading-relaxed">{row.rastreio}</p>
                </div>
                <div className="rounded-xl border border-primary/15 bg-primary/[0.03] p-4 flex items-start gap-2.5">
                  <Check className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                  <p className="text-[12px] sm:text-[13px] text-foreground font-medium leading-relaxed">{row.giftedlab}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ═══ COMO FUNCIONA ═══ */}
      <section className="px-5 py-10 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.45 }}>
          <p className="text-primary text-[10px] font-semibold uppercase tracking-[0.18em] mb-4">Como funciona</p>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground mb-8">O ciclo semanal.</h2>

          <div className="space-y-4">
            {STEPS.map(({ icon: Icon, num, title, text }, i) => (
              <motion.div key={num}
                initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="rounded-xl border bg-card p-5 flex gap-4"
              >
                <div className="shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[10px] font-semibold text-muted-foreground tabular-nums">{num}</span>
                    <span className="text-[14px] font-semibold text-foreground">{title}</span>
                  </div>
                  <p className="text-[13px] text-muted-foreground leading-relaxed">{text}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ═══ INCLUSO ═══ */}
      <section className="px-5 py-10 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.45 }}>
          <p className="text-primary text-[10px] font-semibold uppercase tracking-[0.18em] mb-4">Acesso completo</p>
          <div className="rounded-xl border bg-card p-5 sm:p-6">
            <div className="space-y-3">
              {INCLUDES.map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="shrink-0 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                    <Check className="w-3 h-3 text-primary" />
                  </div>
                  <p className="text-[13px] text-card-foreground leading-relaxed">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* ═══ PRECO ═══ */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }} whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }} transition={{ duration: 0.4 }}
          className="rounded-xl border border-primary/20 bg-primary/[0.03] p-8 sm:p-10 text-center"
        >
          <div className="mb-2">
            <span className="font-display text-4xl sm:text-5xl font-bold text-foreground">R$29,90</span>
            <span className="text-lg text-muted-foreground ml-1">/mes</span>
          </div>
          <p className="text-[12px] text-muted-foreground mb-8">
            Menos de R$1 por dia · Cancela quando quiser
          </p>

          <button
            onClick={handleCta}
            className="inline-flex items-center gap-2 px-10 py-4 rounded-xl font-bold text-base transition-all hover:scale-[1.02] bg-primary text-primary-foreground"
            style={{ boxShadow: "0 0 24px hsl(var(--primary) / 0.3), 0 6px 24px hsl(var(--primary) / 0.4)" }}
          >
            <Zap className="w-5 h-5" />
            Assinar agora
          </button>
          <p className="text-[11px] text-muted-foreground mt-3">
            7 dias pra testar. Não fez sentido, pede reembolso.
          </p>
        </motion.div>
      </section>

      {/* ═══ FAQ ═══ */}
      <section className="px-5 py-10 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.45 }}>
          <p className="text-primary text-[10px] font-semibold uppercase tracking-[0.18em] mb-6">Perguntas frequentes</p>

          <div className="rounded-xl border bg-card overflow-hidden">
            {FAQS.map((faq, i) => (
              <div key={i} className={i > 0 ? "border-t" : ""}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-4 sm:p-5 text-left"
                >
                  <span className="text-[13px] font-medium text-foreground pr-4">{faq.q}</span>
                  <ChevronDown
                    className="w-4 h-4 text-muted-foreground shrink-0 transition-transform duration-200"
                    style={{ transform: openFaq === i ? "rotate(180deg)" : "rotate(0)" }}
                  />
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <p className="px-4 sm:px-5 pb-4 sm:pb-5 text-[13px] text-muted-foreground leading-relaxed">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ═══ FECHAMENTO ═══ */}
      <section className="px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.45 }}>
          <div className="space-y-3 text-[15px] text-muted-foreground leading-relaxed max-w-lg mx-auto text-center mb-8">
            <p>Você já deu o passo mais difícil: olhou pra dentro e descobriu como funciona.</p>
            <p className="text-foreground font-medium">Agora a pergunta é: vai fazer o que com isso?</p>
            <p>A IA já tem seu rastreio. Está pronta pra continuar.</p>
          </div>

          <div className="text-center">
            <button
              onClick={handleCta}
              className="inline-flex items-center gap-2 px-10 py-4 rounded-xl font-bold text-sm transition-all hover:scale-[1.02] bg-primary text-primary-foreground"
              style={{ boxShadow: "0 0 20px hsl(var(--primary) / 0.25), 0 4px 20px hsl(var(--primary) / 0.35)" }}
            >
              Assinar agora — R$29,90/mês
              <ArrowRight className="w-4 h-4" />
            </button>
            <p className="text-[11px] text-muted-foreground mt-3">7 dias de garantia</p>
          </div>
        </motion.div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="px-5 py-6 text-center border-t mb-14">
        <p className="text-[11px] text-muted-foreground">Gifted Lab · teste-superdotacao.com</p>
      </footer>

      {/* ═══ STICKY CTA ═══ */}
      <AnimatePresence>
        {showSticky && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-14 left-0 right-0 z-40 px-4 py-3 flex items-center justify-between border-t"
            style={{
              backgroundColor: "hsl(var(--background) / 0.95)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              paddingBottom: "max(12px, env(safe-area-inset-bottom))",
            }}
          >
            <div>
              <span className="font-semibold text-foreground text-sm">Gifted Lab</span>
              <span className="text-[11px] text-muted-foreground ml-2">R$29,90/mês</span>
            </div>
            <button
              onClick={handleCta}
              className="px-5 py-2.5 rounded-xl font-semibold text-sm bg-primary text-primary-foreground transition-all hover:scale-[1.02]"
            >
              Assinar
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <BottomNav />
    </div>
  );
}
