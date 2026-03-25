import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ClipboardList, BarChart3, FileText, Compass, Gift,
  Video, Brain, LayoutDashboard, ChevronDown, CheckCircle2,
  Quote, BookOpen, Sparkles, Star, Headphones, Activity,
  TrendingUp, Radio, ArrowRight,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";


/* ─── Participant counter ─── */
const SEED_COUNT = 2_378;
const SEED_DATE  = new Date("2026-02-18").getTime();
const DAILY_RATE = 18;

function useLiveCount() {
  const [count, setCount] = useState(() => {
    const days = (Date.now() - SEED_DATE) / 86_400_000;
    return Math.floor(SEED_COUNT + days * DAILY_RATE);
  });
  useEffect(() => {
    const t = setInterval(() => setCount(c => c + 1), 14_000);
    return () => clearInterval(t);
  }, []);
  return count;
}

/* ─── Shimmer CTA Button (supports both internal and external links) ─── */
function ShimmerButton({
  href,
  children,
  variant = "primary",
}: {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary";
}) {
  const [shimmer, setShimmer] = useState(false);
  useEffect(() => {
    if (variant !== "primary") return;
    const t = setInterval(() => {
      setShimmer(true);
      setTimeout(() => setShimmer(false), 700);
    }, 4500);
    return () => clearInterval(t);
  }, [variant]);

  const isPrimary = variant === "primary";

  return (
    <a href={href}>
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 380, damping: 22 }}
        className={`relative overflow-hidden px-8 py-3.5 rounded-xl font-semibold text-sm tracking-wide ${
          isPrimary
            ? "bg-primary text-primary-foreground"
            : "bg-transparent text-muted-foreground border border-border hover:text-foreground hover:border-foreground/30"
        }`}
        style={
          isPrimary
            ? {
                boxShadow:
                  "0 0 20px hsl(var(--primary) / 0.3), 0 0 40px hsl(var(--primary) / 0.12), 0 4px 24px hsl(var(--primary) / 0.4)",
              }
            : undefined
        }
      >
        <AnimatePresence>
          {shimmer && isPrimary && (
            <motion.span
              key="shimmer"
              initial={{ x: "-100%", opacity: 0.6 }}
              animate={{ x: "200%", opacity: 0 }}
              exit={{}}
              transition={{ duration: 0.65, ease: "easeOut" }}
              className="absolute inset-y-0 w-1/2 pointer-events-none"
              style={{
                background:
                  "linear-gradient(90deg, transparent, hsl(var(--primary) / 0.35), transparent)",
              }}
            />
          )}
        </AnimatePresence>
        {children}
      </motion.button>
    </a>
  );
}

/* ─── Section wrapper ─── */
function Section({
  children,
  className = "",
  border = true,
  bg = "",
  id = "",
}: {
  children: React.ReactNode;
  className?: string;
  border?: boolean;
  bg?: string;
  id?: string;
}) {
  return (
    <section
      id={id}
      className={`py-14 md:py-20 px-5 ${border ? "border-t border-border" : ""} ${bg} ${className}`}
    >
      <div className="max-w-4xl mx-auto">{children}</div>
    </section>
  );
}

/* ─── Constants ─── */
const BUNDLE_CTA = "#assinar-bundle";
const RASTREIO_ONLY_URL = "https://pay.hotmart.com/P104729957Y?off=ntj8v232";

/* ═══════════════════════════════════════════════════════
   MAIN — Bundle Landing Page (G-Lab R$1.000/ano + Rastreio R$47)
   ═══════════════════════════════════════════════════════ */
export default function BundlePage() {
  const count = useLiveCount();

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">

      {/* ══ NAVBAR ══════════════════════════════════ */}
      <nav className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-5 h-14 flex items-center justify-between gap-4">
          <span className="text-[12px] font-medium text-muted-foreground">
            R$2,74/dia · Pagamento unico · 7 dias de garantia
          </span>
          <a
            href={BUNDLE_CTA}
            className="text-[12px] font-semibold text-primary hover:text-primary/80 transition-colors"
          >
            Ver oferta
          </a>
        </div>
      </nav>

      {/* ══════════════════════════════════════════════
          SECTION 1 — HERO
          ══════════════════════════════════════════════ */}
      <section className="relative pt-16 pb-18 md:pt-24 md:pb-28 px-5">
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.018]"
          style={{
            backgroundImage:
              "radial-gradient(hsl(var(--foreground)) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground leading-[1.15] tracking-tight mb-6 max-w-3xl mx-auto">
              Voce sempre sentiu que tinha algo diferente...{" "}
              <span className="text-primary">mas nunca soube o que era?</span>
            </h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-[15px] md:text-base text-muted-foreground leading-relaxed mb-8 max-w-2xl mx-auto"
            >
              Descubra se o que voce chama de "intensidade demais" pode ser
              superdotacao. Faca o rastreio, entenda seu perfil e receba
              acompanhamento personalizado com planos de 3, 6 ou 12 meses.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.5 }}
              className="mb-6"
            >
              <ShimmerButton href={BUNDLE_CTA}>
                Ver planos e comecar
              </ShimmerButton>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-[12px] text-muted-foreground"
            >
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                Rastreio completo + App incluso
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                Resultado imediato
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                Acompanhamento personalizado
              </span>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="mt-5 text-[12px] text-muted-foreground"
            >
              <span className="font-semibold text-foreground tabular-nums">
                {count.toLocaleString("pt-BR")}
              </span>{" "}
              pessoas ja fizeram o rastreio
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          SECTION 2 — COMO FUNCIONA (6 steps)
          ══════════════════════════════════════════════ */}
      <Section>
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-primary mb-3">
            Na pratica
          </p>
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground leading-tight">
            Veja como funciona na pratica
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          {[
            {
              icon: ClipboardList,
              step: "01",
              title: "Faca o rastreio",
              desc: "Descubra seu perfil em 7 minutos",
            },
            {
              icon: BarChart3,
              step: "02",
              title: "Veja seu resultado",
              desc: "Graficos visuais da sua mente, na hora",
            },
            {
              icon: Compass,
              step: "03",
              title: "Receba seu plano",
              desc: "O app identifica o que trabalhar primeiro",
            },
            {
              icon: Headphones,
              step: "04",
              title: "Ouca os audios",
              desc: "Conteudo terapeutico enquanto faz outras coisas",
            },
            {
              icon: Activity,
              step: "05",
              title: "Monitore seu progresso",
              desc: "Check-in diario + relatorio de evolucao",
            },
            {
              icon: TrendingUp,
              step: "06",
              title: "Evolua com dados",
              desc: "Veja a mudanca ao longo dos meses",
            },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              className="rounded-2xl border border-border bg-card p-5 text-center"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <item.icon className="w-5 h-5 text-primary" />
              </div>
              <span className="text-[10px] font-bold text-primary/40 uppercase tracking-wider">
                {item.step}
              </span>
              <h3 className="font-display text-[13px] font-semibold text-foreground mt-1">
                {item.title}
              </h3>
              <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                {item.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ══════════════════════════════════════════════
          SECTION 3 — PAIN / PROBLEM
          ══════════════════════════════════════════════ */}
      <Section bg="bg-card">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <div className="max-w-2xl mx-auto mb-8">
            <Quote className="w-8 h-8 text-primary/30 mx-auto mb-4" />
            <p className="font-display text-xl md:text-2xl font-semibold text-foreground leading-snug italic">
              "Desde crianca eu me sentia deslocada. Inteligente, sim... Mas
              tambem cansada. Confusa. Incompreendida."
            </p>
          </div>

          <p className="text-[14px] text-muted-foreground leading-relaxed max-w-xl mx-auto mb-8">
            Essa e a frase mais comum entre as milhares de pessoas que passaram
            por essa jornada.
          </p>

          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {[
              "Excesso de pensamento",
              "Empatia extrema",
              "Sensibilidade emocional",
              "Desconexao social",
              "Hiperfoco",
              "Bloqueios de acao",
              "Inquietacao cronica",
            ].map((symptom) => (
              <Badge
                key={symptom}
                variant="outline"
                className="px-3 py-1.5 text-[12px] font-medium border-primary/20 text-foreground bg-primary/5"
              >
                {symptom}
              </Badge>
            ))}
          </div>

          <div className="max-w-lg mx-auto">
            <p className="font-display text-lg font-bold text-primary mb-2">
              1 em cada 6 superdotados nunca sao identificados.
            </p>
            <p className="text-[13px] text-muted-foreground leading-relaxed">
              Passam a vida tentando se encaixar em um molde que nunca foi feito
              pra eles.
            </p>
          </div>
        </motion.div>
      </Section>

      {/* ══════════════════════════════════════════════
          SECTION 4 — EDUCATION / REFRAME
          ══════════════════════════════════════════════ */}
      <Section>
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto"
        >
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-primary mb-3">
            Entenda
          </p>
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground leading-tight mb-5">
            Altas Habilidades / Superdotacao
          </h2>
          <p className="text-[15px] text-muted-foreground leading-relaxed">
            Diferente do que te ensinaram, isso nao tem a ver com notas altas.
            Tem a ver com como voce{" "}
            <strong className="text-foreground font-semibold">sente</strong>.
            Como voce{" "}
            <strong className="text-foreground font-semibold">pensa</strong>.
            Como voce{" "}
            <strong className="text-foreground font-semibold">vive</strong>.
          </p>
        </motion.div>
      </Section>

      {/* ══════════════════════════════════════════════
          SECTION 5 — THE GAP (why screening alone isn't enough)
          ══════════════════════════════════════════════ */}
      <Section bg="bg-card">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto"
        >
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-primary mb-3">
            O proximo passo
          </p>
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground leading-tight mb-6">
            O rastreio mostra quem voce e.{" "}
            <span className="text-primary">O app mostra o que fazer.</span>
          </h2>

          <div className="space-y-5 text-left">
            <div className="rounded-2xl border border-border bg-background p-5">
              <p className="text-[14px] text-muted-foreground leading-relaxed">
                Milhares de pessoas fizeram o rastreio e disseram:{" "}
                <strong className="text-foreground font-semibold italic">
                  "E agora? O que eu faco com isso?"
                </strong>
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-background p-5">
              <p className="text-[14px] text-muted-foreground leading-relaxed">
                Entender e o primeiro passo. Mas sem acompanhamento, o
                entendimento vira mais uma informacao que{" "}
                <strong className="text-foreground font-semibold">
                  nao muda nada
                </strong>
                .
              </p>
            </div>

            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5">
              <p className="text-[14px] text-foreground leading-relaxed font-medium">
                Por isso criamos o G-Lab: um sistema completo que vai do
                rastreio ate a transformacao. Nao e so um teste. E um caminho.
              </p>
            </div>
          </div>
        </motion.div>
      </Section>

      {/* ══════════════════════════════════════════════
          SECTION 6 — APP FEATURES (what's included)
          ══════════════════════════════════════════════ */}
      <Section>
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-primary mb-3">
            Incluso em todos os planos
          </p>
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground leading-tight mb-2">
            O que voce recebe no G-Lab
          </h2>
          <p className="text-[14px] text-muted-foreground max-w-xl mx-auto">
            Rastreio + acompanhamento + ferramentas. Tudo num lugar so.
          </p>
        </motion.div>

        <div className="space-y-4 max-w-2xl mx-auto">
          {[
            {
              num: "01",
              icon: ClipboardList,
              title: "Rastreio completo",
              desc: "AH/SD, TDAH, TEA, Trauma — resultado imediato com relatorio visual.",
            },
            {
              num: "02",
              icon: BookOpen,
              title: "Trilhas terapeuticas",
              desc: "Conteudo organizado por necessidade, nao por modulo generico.",
            },
            {
              num: "03",
              icon: Headphones,
              title: "Audios terapeuticos",
              desc: "Ouca enquanto lava louca, corre ou dirige. De 10 a 30 minutos.",
            },
            {
              num: "04",
              icon: Activity,
              title: "Check-in diario",
              desc: "Monitore humor, energia e padroes comportamentais.",
            },
            {
              num: "05",
              icon: Compass,
              title: "Motor de recomendacao",
              desc: "O sistema te diz o que fazer hoje, baseado no seu perfil.",
            },
            {
              num: "06",
              icon: FileText,
              title: "Relatorio de evolucao",
              desc: "Compartilhe com seu terapeuta ou psiquiatra.",
            },
            {
              num: "07",
              icon: Radio,
              title: "Sons de concentracao",
              desc: "Brown noise, binaural beats e sons naturais.",
            },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06, duration: 0.5 }}
              className="flex gap-4 items-start rounded-2xl border border-border bg-card p-5"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <item.icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-display text-[14px] font-semibold text-foreground mb-1">
                  {item.title}
                </h3>
                <p className="text-[13px] text-muted-foreground leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA mid-page */}
        <div className="text-center mt-10">
          <ShimmerButton href={BUNDLE_CTA}>
            Ver planos
          </ShimmerButton>
        </div>
      </Section>

      {/* ══════════════════════════════════════════════
          SECTION 7 — BONUSES
          ══════════════════════════════════════════════ */}
      <Section bg="bg-card">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Gift className="w-5 h-5 text-primary" />
          </div>
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground leading-tight mb-2">
            3 bonus inclusos no pacote
          </h2>
          <p className="text-[14px] text-muted-foreground">
            Alem do rastreio e do app, voce recebe sem custo adicional:
          </p>
        </motion.div>

        <div className="space-y-6">
          {/* Bonus 1 — Workshop */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="rounded-2xl border border-primary/20 bg-background p-6 md:p-8"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Video className="w-4.5 h-4.5 text-primary" />
              </div>
              <div>
                <Badge
                  variant="outline"
                  className="text-[10px] border-primary/30 text-primary mb-1"
                >
                  BONUS 1
                </Badge>
                <h3 className="font-display text-base font-bold text-foreground">
                  Workshop ao vivo
                </h3>
              </div>
            </div>
            <p className="font-display text-[14px] font-semibold text-foreground mb-4">
              Sinais e Caracteristicas de AHSD e Dupla Excepcionalidade
            </p>
            <ul className="space-y-2.5 mb-5">
              {[
                "Os sinais de superdotacao que aparecem no dia a dia (e que a maioria confunde com 'ser intenso demais')",
                "O que e dupla excepcionalidade e por que muda tudo no diagnostico",
                "Diferencas entre AHSD, TDAH e TEA que profissionais costumam misturar",
                "Proximos passos praticos depois de se identificar",
              ].map((topic, i) => (
                <li
                  key={i}
                  className="flex gap-2.5 text-[13px] text-muted-foreground leading-relaxed"
                >
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>{topic}</span>
                </li>
              ))}
            </ul>
            <div className="border-t border-border pt-4 text-[12px] text-muted-foreground space-y-1">
              <p className="font-semibold text-foreground">
                Com Jean Alessandro | CRP-07/29.848
              </p>
              <p>
                Psicologo especializado em AHSD e neurodivergencia · Formato
                online, ao vivo
              </p>
            </div>
          </motion.div>

          {/* Bonus 2 — Rastreio Neurocognitivo */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="rounded-2xl border border-border bg-background p-6 md:p-8"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Brain className="w-4.5 h-4.5 text-primary" />
              </div>
              <div>
                <Badge
                  variant="outline"
                  className="text-[10px] border-primary/30 text-primary mb-1"
                >
                  BONUS 2
                </Badge>
                <h3 className="font-display text-base font-bold text-foreground">
                  Rastreio Neurocognitivo
                </h3>
              </div>
            </div>
            <p className="font-display text-[14px] font-semibold text-foreground mb-2">
              TDAH, TEA, Trauma e Neurodivergencia
            </p>
            <p className="text-[13px] text-muted-foreground leading-relaxed">
              Identifique se TDAH, autismo, trauma ou neurodivergencia explicam
              o que voce sente — com hipoteses ranqueadas por probabilidade.
            </p>
          </motion.div>

          {/* Bonus 3 — Painel Dimensional */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="rounded-2xl border border-border bg-background p-6 md:p-8"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <LayoutDashboard className="w-4.5 h-4.5 text-primary" />
              </div>
              <div>
                <Badge
                  variant="outline"
                  className="text-[10px] border-primary/30 text-primary mb-1"
                >
                  BONUS 3
                </Badge>
                <h3 className="font-display text-base font-bold text-foreground">
                  Painel Dimensional
                </h3>
              </div>
            </div>
            <p className="font-display text-[14px] font-semibold text-foreground mb-2">
              Onde seu potencial bloqueia
            </p>
            <p className="text-[13px] text-muted-foreground leading-relaxed">
              Veja exatamente em quais dimensoes cognitivas e emocionais seu
              potencial esta sendo freado — e onde agir primeiro.
            </p>
          </motion.div>
        </div>
      </Section>

      {/* ══════════════════════════════════════════════
          SECTION 8 — TESTIMONIALS
          ══════════════════════════════════════════════ */}
      <Section>
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-primary mb-3">
            Depoimentos
          </p>
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground leading-tight">
            Quem ja passou por aqui
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-3 gap-4">
          {[
            {
              name: "Camila, 35 anos",
              text: "Achei que era so ansiedade, mas na verdade minha mente funciona diferente. O rastreamento me deu paz.",
            },
            {
              name: "Rodrigo, 42 anos",
              text: "Foi a primeira vez que me senti compreendido sem precisar me explicar.",
            },
            {
              name: "Julia, 27 anos",
              text: "Depois que vi meu resultado, chorei. Era tudo o que eu precisava saber e ninguem nunca soube me dizer.",
            },
          ].map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="rounded-2xl border border-border bg-card p-5"
            >
              <div className="flex gap-0.5 mb-3">
                {[...Array(5)].map((_, j) => (
                  <Star
                    key={j}
                    className="w-3.5 h-3.5 text-primary fill-primary"
                  />
                ))}
              </div>
              <p className="text-[13px] text-muted-foreground leading-relaxed italic mb-4">
                "{t.text}"
              </p>
              <p className="text-[12px] font-semibold text-foreground">
                {t.name}
              </p>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ══════════════════════════════════════════════
          SECTION 9 — OBJECTION HANDLING (4 items)
          ══════════════════════════════════════════════ */}
      <Section bg="bg-card">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground leading-tight">
            Mas sera que serve pra mim?
          </h2>
        </motion.div>

        <div className="space-y-4 max-w-2xl mx-auto">
          {[
            {
              q: "Nao sei se sou superdotado(a).",
              a: "O rastreamento existe justamente para te ajudar a explorar essa possibilidade com profundidade.",
            },
            {
              q: "Tenho medo de me frustrar com o resultado.",
              a: "Voce nao vai receber um 'sim' ou 'nao'. Vai receber um mapa da sua mente. Isso nao frustra — liberta.",
            },
            {
              q: "Ja sou adulto(a), sera que faz sentido fazer isso agora?",
              a: "Faz mais sentido do que nunca. A maioria dos nossos usuarios tem entre 28 e 55 anos.",
            },
            {
              q: "Posso fazer so o rastreio?",
              a: "Sim. O rastreio avulso custa R$47 e te mostra se voce tem indicativos de superdotacao. O G-Lab inclui o rastreio + app completo + 48 aulas ao vivo com o Jean + comunidade.",
            },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              className="rounded-2xl border border-border bg-background p-5"
            >
              <p className="font-display text-[14px] font-semibold text-foreground mb-2 italic">
                "{item.q}"
              </p>
              <p className="text-[13px] text-muted-foreground leading-relaxed">
                {item.a}
              </p>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ══════════════════════════════════════════════
          SECTION 10 — PRICING (single hero + value comparison)
          ══════════════════════════════════════════════ */}
      <Section id="assinar-bundle">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-primary mb-3">
            G-Lab · Acesso completo
          </p>
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground leading-tight mb-3">
            Voce ja sabe quem e.<br />Agora destrave quem pode ser.
          </h2>
          <p className="text-[13px] text-muted-foreground mb-10 max-w-lg mx-auto">
            Rastreio + app + aulas ao vivo com o Jean + comunidade. Tudo num lugar so.
          </p>

          {/* ── HERO CARD: G-Lab Anual ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="rounded-2xl border-2 border-primary/40 bg-card p-8 max-w-md mx-auto mb-10 relative"
            style={{
              boxShadow: "0 0 40px hsl(var(--primary) / 0.12), 0 4px 24px hsl(var(--primary) / 0.08)",
            }}
          >
            <p className="font-display text-5xl font-bold text-primary leading-none mb-1">
              R$1.000
            </p>
            <p className="text-[13px] text-muted-foreground mb-1">
              por ano · pagamento unico
            </p>
            <p className="text-[15px] text-primary font-semibold mb-6">
              R$2,74/dia
            </p>

            <div className="space-y-3 mb-8 text-left">
              {[
                "Rastreio completo de superdotacao",
                "App GiftedLab — 12 meses",
                "48 aulas ao vivo semanais com o Jean",
                "10 testes + mega relatorio dimensional",
                "Rastreios adicionais (TDAH, TEA, Trauma)",
                "Audios praticos + series por tema",
                "Monitoramento diario + relatorios",
                "Sons para concentracao",
                "Recomendacao personalizada",
                "Comunidade WhatsApp exclusiva",
                "Match de perfis (em breve)",
                "Prioridade nas aulas ao vivo",
              ].map((f, i) => (
                <div key={i} className="flex items-start gap-2.5 text-[13px] text-muted-foreground">
                  <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <span>{f}</span>
                </div>
              ))}
            </div>

            <ShimmerButton href={BUNDLE_CTA} className="w-full text-[15px]">
              Entrar no G-Lab
            </ShimmerButton>

            <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-[11px] text-muted-foreground mt-4">
              <span>Acesso imediato</span>
              <span>·</span>
              <span>Garantia de 7 dias</span>
              <span>·</span>
              <span>Cancele quando quiser</span>
            </div>
          </motion.div>

          {/* ── VALUE COMPARISON ── */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="max-w-md mx-auto mb-10"
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-primary mb-5 text-center">
              Por que isso e um investimento, nao um gasto
            </p>

            <div className="space-y-4">
              {/* Aula ao vivo */}
              <div className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[13px] text-muted-foreground">Sessao com psicologo</span>
                  <span className="text-[13px] text-muted-foreground/50 line-through">R$250</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[13px] text-foreground font-semibold">Aula ao vivo com o Jean</span>
                  <span className="text-[15px] text-primary font-bold">R$20</span>
                </div>
              </div>

              {/* Mega relatorio */}
              <div className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[13px] text-muted-foreground">Avaliacao psicologica</span>
                  <span className="text-[13px] text-muted-foreground/50 line-through">R$500 a R$4.000</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[13px] text-foreground font-semibold">10 testes + mega relatorio</span>
                  <span className="text-[15px] text-primary font-bold">Incluso</span>
                </div>
              </div>

              {/* App diario */}
              <div className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[13px] text-muted-foreground">App de saude mental</span>
                  <span className="text-[13px] text-muted-foreground/50 line-through">R$40-80/mes</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[13px] text-foreground font-semibold">2 audios/dia + check-in + monitoramento semanal</span>
                  <span className="text-[15px] text-primary font-bold">R$2,74/dia</span>
                </div>
                <p className="text-[11px] text-muted-foreground/60 mt-1">Menos que um cafe.</p>
              </div>
            </div>
          </motion.div>

          {/* Rastreio avulso */}
          <div className="text-center">
            <a
              href={RASTREIO_ONLY_URL}
              className="inline-flex items-center gap-1 text-[12px] text-muted-foreground hover:text-foreground transition-colors"
            >
              Quero so o rastreio por R$47
              <ArrowRight className="w-3 h-3" />
            </a>
          </div>
        </motion.div>
      </Section>

      {/* ══════════════════════════════════════════════
          SECTION 11 — FAQ (7 items)
          ══════════════════════════════════════════════ */}
      <Section bg="bg-card">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground leading-tight">
            Duvidas frequentes
          </h2>
        </motion.div>

        <div className="max-w-2xl mx-auto">
          <Accordion type="single" collapsible className="space-y-2">
            {[
              {
                q: "Esse teste e um diagnostico oficial?",
                a: "Nao. E um rastreamento baseado em escalas cientificas validadas. Ele indica possibilidades e sugere proximos passos, mas nao substitui avaliacao clinica formal.",
              },
              {
                q: "E so para criancas?",
                a: "Nao. Foi desenvolvido especificamente para adultos. A maioria dos nossos usuarios tem entre 28 e 55 anos.",
              },
              {
                q: "Tem resultado imediato?",
                a: "Sim. Ao finalizar, voce recebe seu resultado com graficos e relatorio explicativo na hora.",
              },
              {
                q: "Tenho que responder tudo de uma vez?",
                a: "Idealmente sim, mas voce pode pausar e retomar quando quiser.",
              },
              {
                q: "Posso indicar para amigos ou pacientes?",
                a: "Sim. Muitos profissionais de saude indicam para seus pacientes como ferramenta complementar.",
              },
              {
                q: "O que acontece quando o plano termina?",
                a: "Voce pode renovar qualquer plano ou fazer upgrade. Seus dados e resultados ficam salvos.",
              },
              {
                q: "Posso cancelar?",
                a: "Sim. Garantia de 7 dias em todos os planos. Depois disso, o acesso e garantido pelo periodo contratado.",
              },
            ].map((item, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="border border-border rounded-xl px-5 data-[state=open]:bg-background"
              >
                <AccordionTrigger className="text-[14px] font-semibold text-foreground text-left py-4 hover:no-underline">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-[13px] text-muted-foreground leading-relaxed pb-4">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </Section>

      {/* ══════════════════════════════════════════════
          SECTION 12 — SCIENTIFIC REFERENCES
          ══════════════════════════════════════════════ */}
      <Section>
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-primary mb-3">
            Fundamentacao
          </p>
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground leading-tight mb-2">
            Referencias Cientificas
          </h2>
          <p className="text-[13px] text-muted-foreground">
            Principais referencias utilizadas na construcao do rastreio:
          </p>
        </motion.div>

        <div className="space-y-4 max-w-2xl mx-auto">
          {[
            {
              author: "Kazimierz Dabrowski",
              theory:
                "Teoria das Sobre-excitabilidades (Overexcitabilities)",
              work: "Positive Disintegration (1964)",
            },
            {
              author: "Linda Silverman",
              theory: "Escala de Superdotacao em Adultos",
              work: "Giftedness in Adults Rating Scale",
            },
            {
              author: "Freitas & Perez",
              theory: "Questionario QIIAHSD (Brasil)",
              work: "Altas habilidades/superdotacao: atendimento especializado (2012)",
            },
            {
              author: "Referencias de apoio",
              theory:
                "Mary-Elaine Jacobsen, Paula Prober, Zaia & Nakano (2020)",
              work: "",
            },
          ].map((ref, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              className="border-l-2 border-primary/20 pl-4 py-1"
            >
              <p className="font-display text-[13px] font-semibold text-foreground">
                {ref.author}
              </p>
              <p className="text-[12px] text-muted-foreground leading-relaxed">
                {ref.theory}
              </p>
              {ref.work && (
                <p className="text-[11px] text-muted-foreground/70 italic mt-0.5">
                  {ref.work}
                </p>
              )}
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ══════════════════════════════════════════════
          SECTION 13 — CLOSING CTA
          ══════════════════════════════════════════════ */}
      <section className="py-20 md:py-28 px-5 text-center border-t border-border">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
          className="max-w-lg mx-auto"
        >
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground leading-tight mb-5">
            Voce chegou ate aqui por um motivo.
          </h2>
          <p className="text-[15px] text-muted-foreground leading-relaxed mb-2">
            Nao se trata so de um teste. E um sistema completo de
            autoconhecimento.
          </p>
          <p className="text-[15px] text-muted-foreground leading-relaxed mb-8">
            Rastreio + acompanhamento + evolucao. Tudo num lugar so.
          </p>
          <ShimmerButton href={BUNDLE_CTA}>
            Entrar no G-Lab · R$2,74/dia
          </ShimmerButton>

          <div className="mt-4">
            <a
              href={RASTREIO_ONLY_URL}
              className="inline-flex items-center gap-1 text-[12px] text-muted-foreground hover:text-foreground transition-colors"
            >
              Quero so o rastreio por R$47
              <ArrowRight className="w-3 h-3" />
            </a>
          </div>
        </motion.div>
      </section>

      {/* ══ FOOTER ══════════════════════════════════ */}
      <footer className="py-6 px-5 border-t border-border text-center">
        <p className="text-[11px] text-muted-foreground">
          &copy; 2026 Todos os direitos reservados
        </p>
      </footer>
    </div>
  );
}
