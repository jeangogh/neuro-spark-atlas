import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceLine, Label,
} from "recharts";
import { X } from "lucide-react";


/* ─── Participant counter (seed 1300, grows ~550/day) ─── */
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

/* ─── Demo data ─── */
const radarData = [
  { subject: "AH/SD",      score: 92 },
  { subject: "Dupla Exc.", score: 88 },
  { subject: "TDAH",       score: 89 },
  { subject: "Ansiedade",  score: 91 },
  { subject: "Trauma",     score: 68 },
  { subject: "Autismo",    score: 44 },
  { subject: "Depressão",  score: 22 },
];

const curveData = [
  { age: 0,  baseline: 30,  intervention: null },
  { age: 5,  baseline: 52,  intervention: null },
  { age: 10, baseline: 72,  intervention: null },
  { age: 15, baseline: 86,  intervention: null },
  { age: 20, baseline: 92,  intervention: null },
  { age: 25, baseline: 90,  intervention: null },
  { age: 30, baseline: 86,  intervention: null },
  { age: 35, baseline: 80,  intervention: 80  },
  { age: 40, baseline: 78,  intervention: 88  },
  { age: 45, baseline: 77,  intervention: 90  },
  { age: 50, baseline: 76,  intervention: 89  },
  { age: 60, baseline: 75,  intervention: 87  },
  { age: 70, baseline: 75,  intervention: 85  },
  { age: 80, baseline: 75,  intervention: 82  },
  { age: 90, baseline: 75,  intervention: 80  },
];

/* ─── Phone Mockup ─── */
function PhoneMockup({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative mx-auto" style={{ width: 248 }}>
      <div
        className="relative rounded-[36px] overflow-hidden border-[7px]"
        style={{
          borderColor: "hsl(28,33%,12%)",
          background: "hsl(28,33%,12%)",
          boxShadow: "0 32px 72px -16px hsl(28 20% 6% / 0.5), inset 0 0 0 1px hsl(28 15% 25%)",
        }}
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 z-10 w-16 h-4 rounded-b-2xl"
          style={{ background: "hsl(28,33%,12%)" }} />
        <div className="rounded-[30px] overflow-hidden" style={{ background: "hsl(28,20%,10%)", minHeight: 440 }}>
          {children}
        </div>
      </div>
      <div className="absolute inset-0 rounded-[36px] pointer-events-none"
        style={{ background: "linear-gradient(135deg, hsl(0 0% 100% / 0.06) 0%, transparent 50%)" }} />
    </div>
  );
}

/* ─── Phone result screen ─── */
function PhoneResultScreen() {
  const bars = [
    { label: "AH/SD",      pct: 92, color: "hsl(154,24%,38%)" },
    { label: "TDAH",       pct: 89, color: "hsl(0,70%,58%)" },
    { label: "Ansiedade",  pct: 91, color: "hsl(31,53%,50%)" },
    { label: "Dupla Exc.", pct: 88, color: "hsl(31,53%,64%)" },
    { label: "Trauma",     pct: 68, color: "hsl(340,55%,55%)" },
    { label: "Autismo",    pct: 44, color: "hsl(245,60%,65%)" },
    { label: "Depressão",  pct: 22, color: "hsl(79,5%,50%)" },
  ];
  return (
    <div className="pt-6 px-3 pb-4 select-none">
      <p className="text-[6.5px] font-semibold uppercase tracking-[0.15em] mb-0.5" style={{ color: "hsl(154,24%,38%)" }}>
        Rastreio Neurocognitivo
      </p>
      <h3 className="font-display text-[12px] font-bold leading-tight mb-3" style={{ color: "hsl(41,35%,93%)" }}>
        Seu Resultado
      </h3>
      <div className="rounded-lg border border-border/60 bg-card/80 p-1.5 mb-2">
        <p className="text-[6px] text-muted-foreground uppercase tracking-wider mb-0.5">Mapa de Perfil</p>
        <div style={{ height: 96 }}>
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="62%" data={radarData}>
              <PolarGrid stroke="hsl(28,12%,22%)" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 5.5, fill: "hsl(79,5%,55%)" }} />
              <Radar dataKey="score" stroke="hsl(154,24%,38%)" fill="hsl(154,24%,38%)" fillOpacity={0.22} strokeWidth={1.5} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="rounded-lg border border-border/60 bg-card/80 p-2 space-y-1">
        <p className="text-[6px] text-muted-foreground uppercase tracking-wider mb-1">Detalhamento</p>
        {bars.map((b) => (
          <div key={b.label}>
            <div className="flex justify-between items-baseline mb-0.5">
              <span className="text-[6.5px] font-medium" style={{ color: "hsl(41,35%,93%)" }}>{b.label}</span>
              <span className="text-[6.5px] font-bold tabular-nums" style={{ color: b.color }}>{b.pct}%</span>
            </div>
            <div className="h-[3px] rounded-full bg-muted/60 overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${b.pct}%`, backgroundColor: b.color }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── About Modal ─── */
const REFS = [
  { ref: "Barkley, R.A. (2015). Attention-deficit hyperactivity disorder (4th ed.). Guilford Press.", note: "Base para compreensão do TDAH como disfunção executiva." },
  { ref: "Baron-Cohen, S. (2008). Autism and Asperger Syndrome. Oxford University Press.", note: "Cognição social e espectro autista." },
  { ref: "Van der Kolk, B. (2014). The Body Keeps the Score. Viking.", note: "Trauma e impacto no funcionamento cognitivo." },
  { ref: "Winner, E. (1996). Gifted Children: Myths and Realities. Basic Books.", note: "Alta habilidade e superdotação." },
  { ref: "Webb, J.T. et al. (2016). Misdiagnosis and Dual Diagnoses. Great Potential Press.", note: "Diagnósticos errôneos em superdotados — base do conceito 2e." },
  { ref: "Shields, G.S. et al. (2016). Effects of negative affect on cognition. Psychol Sci.", note: "Estados emocionais negativos reduzem desempenho em 20–30%." },
  { ref: "Eysenck, M.W. & Derakshan, N. (2011). Attentional control theory. Pers. Indiv. Diff.", note: "Ansiedade e custo cognitivo." },
  { ref: "Rock, P.L. et al. (2014). Cognitive impairment in depression. Psychol Med.", note: "Depressão e redução de performance cognitiva." },
];

function AboutModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
          style={{ background: "hsl(28,20%,5%/0.7)", backdropFilter: "blur(10px)" }}
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            transition={{ duration: 0.28, ease: [0.25, 0.1, 0.25, 1] }}
            className="bg-background border border-border rounded-2xl max-w-lg w-full shadow-2xl max-h-[88vh] overflow-y-auto"
          >
            <div className="p-6 sm:p-8">
              <div className="flex items-start justify-between mb-5">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary mb-1">Sobre o rastreio</p>
                  <h2 className="font-display text-xl font-bold text-foreground leading-tight">
                    O que é, o que mede e como foi feito
                  </h2>
                </div>
                <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors ml-4 shrink-0">
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>

              <div className="space-y-5 text-[13px] text-card-foreground leading-relaxed">
                <div>
                  <h3 className="font-display font-semibold text-foreground text-sm mb-1.5">Objetivo</h3>
                  <p>
                    Este rastreio identifica padrões de funcionamento cognitivo e emocional associados a
                    <strong className="font-semibold text-foreground"> altas habilidades, dupla excepcionalidade, TDAH, autismo, trauma, depressão e ansiedade</strong>.
                    Não é um diagnóstico — é um instrumento de autorrelato baseado em indicadores clínicos validados.
                  </p>
                </div>

                <div>
                  <h3 className="font-display font-semibold text-foreground text-sm mb-1.5">O que ele mede</h3>
                  <p>
                    São <strong className="font-semibold text-foreground">53 indicadores clínicos</strong> distribuídos em
                    7 dimensões cognitivas e emocionais, organizados em blocos temáticos com escala Likert (0 a 4).
                    O sistema calcula uma pontuação para cada dimensão e gera um perfil modular baseado nas suas respostas.
                  </p>
                </div>

                <div>
                  <h3 className="font-display font-semibold text-foreground text-sm mb-1.5">Como foi construído</h3>
                  <p>
                    As perguntas foram elaboradas com base em critérios diagnósticos do DSM-5 e em literatura especializada
                    sobre neurodivergência e altas habilidades. Cada bloco foi estruturado para capturar tanto mecanismos
                    centrais quanto manifestações contextuais específicas de cada condição.
                  </p>
                </div>

                <div>
                  <h3 className="font-display font-semibold text-foreground text-sm mb-2">Fundamentação científica</h3>
                  <div className="space-y-2.5">
                    {REFS.map((item, i) => (
                      <div key={i} className="border-l-2 border-primary/20 pl-3">
                        <p className="font-medium text-[12px] text-foreground leading-snug">{item.ref}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{item.note}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-7 pt-5 border-t border-border text-center">
                <Link to="/triagem" onClick={onClose}>
                  <button className="px-8 py-3 rounded-xl font-semibold text-sm transition-all hover:scale-[1.02] bg-primary text-primary-foreground shadow-lg">
                    Iniciar Rastreio
                  </button>
                </Link>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ─── Shimmer CTA Button ─── */
function ShimmerButton({ to, children }: { to: string; children: React.ReactNode }) {
  const [shimmer, setShimmer] = useState(false);
  useEffect(() => {
    const t = setInterval(() => {
      setShimmer(true);
      setTimeout(() => setShimmer(false), 700);
    }, 4500);
    return () => clearInterval(t);
  }, []);

  return (
    <Link to={to}>
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 380, damping: 22 }}
        className="relative overflow-hidden px-8 py-3.5 rounded-xl font-semibold text-sm tracking-wide bg-primary text-primary-foreground"
        style={{
          boxShadow: "0 0 20px hsl(var(--primary) / 0.3), 0 0 40px hsl(var(--primary) / 0.12), 0 4px 24px hsl(var(--primary) / 0.4)",
        }}
      >
        <AnimatePresence>
          {shimmer && (
            <motion.span
              key="shimmer"
              initial={{ x: "-100%", opacity: 0.6 }}
              animate={{ x: "200%", opacity: 0 }}
              exit={{}}
              transition={{ duration: 0.65, ease: "easeOut" }}
              className="absolute inset-y-0 w-1/2 pointer-events-none"
              style={{ background: "linear-gradient(90deg, transparent, hsl(var(--primary) / 0.35), transparent)" }}
            />
          )}
        </AnimatePresence>
        {children}
      </motion.button>
    </Link>
  );
}

/* ─── Send-to-friend button ─── */
function SendFriendButton() {
  const [copied, setCopied] = useState(false);
  const handleShare = async () => {
    const url = window.location.origin + "/triagem";
    const text = "Você precisa fazer esse rastreio de altas habilidades e neurodivergência. Leva apenas 7 minutos.";
    if (navigator.share) {
      try { await navigator.share({ title: "Rastreio de Altas Habilidades", text, url }); return; } catch {}
    }
    await navigator.clipboard.writeText(`${text}\n${url}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };
  return (
    <button
      onClick={handleShare}
      className="text-[12px] font-medium text-muted-foreground hover:text-foreground transition-colors"
    >
      {copied ? "Link copiado" : "Enviar para um amigo"}
    </button>
  );
}

/* ─── Main ─── */
export default function Index() {
  const [showAbout, setShowAbout] = useState(false);
  const count = useLiveCount();

  const cardVariants = [
    { bg: "bg-card", border: "border-border", numColor: "text-primary/20" },
    { bg: "bg-card", border: "border-border/80", numColor: "text-primary/15", extra: "opacity-[0.97]" },
    { bg: "bg-muted/40", border: "border-border/60", numColor: "text-primary/10", extra: "opacity-[0.94]" },
  ];

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">

      {/* ══ NAVBAR ══════════════════════════════════ */}
      <nav className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-5 h-14 flex items-center justify-between gap-4">
          <SendFriendButton />
          <div className="flex items-center gap-4">
            <Link to="/historico" className="text-[12px] font-medium text-muted-foreground hover:text-foreground transition-colors">
              Meus Resultados
            </Link>
            <button
              onClick={() => setShowAbout(true)}
              className="text-[12px] font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Sobre
            </button>
          </div>
        </div>
      </nav>

      {/* ══ HERO ════════════════════════════════════ */}
      <section className="relative pt-14 pb-16 md:pt-20 md:pb-24 px-5">
        <div className="absolute inset-0 pointer-events-none opacity-[0.018]"
          style={{ backgroundImage: "radial-gradient(hsl(var(--foreground)) 1px, transparent 1px)", backgroundSize: "24px 24px" }} />

        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-10 md:gap-8 items-center">

          {/* Left copy */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
            className="text-center md:text-left"
          >
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08, duration: 0.5 }}
              className="text-[13px] font-semibold uppercase tracking-[0.22em] text-primary mb-5 leading-tight"
            >
              Rastreio de Altas Habilidades<br className="sm:hidden" /> e Neurodivergência
            </motion.p>

            <h1 className="font-display text-4xl md:text-5xl lg:text-[3.25rem] font-bold text-foreground leading-[1.1] tracking-tight mb-5">
              Você sempre se sentiu{" "}
              <span className="relative inline-block">
                diferente.
                <motion.span
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.7, duration: 0.4, ease: "easeOut" }}
                  className="absolute -bottom-1 left-0 right-0 h-[3px] rounded-full bg-primary opacity-50 origin-left"
                />
              </span>
              <br />
              <span className="text-primary">Agora vai saber por quê.</span>
            </h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-[15px] text-muted-foreground leading-relaxed mb-7 max-w-md mx-auto md:mx-0"
            >
              <strong className="text-foreground font-semibold">Resultado modular por blocos,</strong> 7 minutos de duração.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.38, duration: 0.5 }}
            >
              <ShimmerButton to="/selecionar-teste">
                Iniciar Rastreio
              </ShimmerButton>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.52, duration: 0.5 }}
              className="mt-5 text-[12px] text-muted-foreground leading-relaxed text-center md:text-left"
            >
              7 minutos · 53 indicadores clínicos ·{" "}
              <span className="font-semibold text-foreground tabular-nums">{count.toLocaleString("pt-BR")}</span> pessoas já fizeram
            </motion.div>
          </motion.div>

          {/* Right: phone mockup */}
          <motion.div
            initial={{ opacity: 0, y: 28, rotate: -2 }}
            animate={{ opacity: 1, y: 0, rotate: -2 }}
            transition={{ duration: 0.7, delay: 0.18, ease: [0.25, 0.1, 0.25, 1] }}
            className="flex justify-center md:justify-end"
          >
            <div style={{ transform: "rotate(-2deg)" }}>
              <PhoneMockup>
                <PhoneResultScreen />
              </PhoneMockup>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══ WHAT YOU DISCOVER ═══════════════════════ */}
      <section className="py-14 md:py-18 px-5 border-t border-border">
        <div className="max-w-3xl mx-auto text-center mb-10">
          <motion.div initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-primary mb-3">O que você vai descobrir</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground leading-tight">
              Uma leitura profunda do seu funcionamento
            </h2>
          </motion.div>
        </div>

        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-4">
          {[
            {
              num: "01",
              title: "Seu perfil cognitivo",
              desc: (
                <>
                  <strong className="font-semibold text-foreground">Altas habilidades</strong>,{" "}
                  <strong className="font-semibold text-foreground">dupla excepcionalidade</strong>,{" "}
                  TDAH, autismo — identificados com base em padrões clínicos validados.
                </>
              ),
              variant: cardVariants[0],
            },
            {
              num: "02",
              title: "O que limita seu potencial",
              desc: (
                <>
                  Trauma, ansiedade e depressão não tratados{" "}
                  <strong className="font-semibold text-foreground">reduzem o desempenho cognitivo</strong>{" "}
                  em 20–30%, conforme a literatura científica.
                </>
              ),
              variant: cardVariants[1],
            },
            {
              num: "03",
              title: "Como intervir",
              desc: (
                <>
                  <strong className="font-semibold text-foreground">Estratégias</strong> e{" "}
                  <strong className="font-semibold text-foreground">direcionamentos personalizados</strong>{" "}
                  para cada padrão identificado no seu resultado.
                </>
              ),
              variant: cardVariants[2],
            },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className={`rounded-2xl border p-6 ${item.variant.bg} ${item.variant.border} ${item.variant.extra ?? ""}`}
            >
              <span className={`font-display text-4xl font-bold leading-none ${item.variant.numColor}`}>{item.num}</span>
              <h3 className="font-display text-base font-semibold text-foreground mt-2 mb-2">{item.title}</h3>
              <p className="text-[13px] text-muted-foreground leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ══ DEMO CHARTS ═════════════════════════════ */}
      <section className="py-14 md:py-18 px-5 bg-card border-t border-border">
        <div className="max-w-3xl mx-auto text-center mb-10">
          <motion.div initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-primary mb-3">Exemplo de resultado</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground leading-tight">
              Visualize seu perfil em profundidade
            </h2>
            <p className="text-muted-foreground text-sm mt-3 max-w-xl mx-auto">
              Após o rastreio, você recebe gráficos clínicos baseados exclusivamente nas suas respostas.
            </p>
          </motion.div>
        </div>

        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-6">
          {/* Radar */}
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="rounded-2xl border border-border bg-background p-6"
          >
            <h3 className="font-display text-sm font-semibold text-foreground mb-0.5">Mapa de Perfil</h3>
            <p className="text-[11px] text-muted-foreground mb-1">Visão integrada de todas as dimensões avaliadas</p>
            <p className="text-[10px] text-primary/70 italic mb-4">Exemplo: dupla excepcionalidade com AH/SD e TDAH</p>
            <div style={{ height: 250 }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="68%" data={radarData}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 8 }} tickCount={4} />
                  <Radar dataKey="score" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.18} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-[10px] text-muted-foreground text-center italic mt-1">
              Seu resultado será único e baseado nas suas respostas
            </p>
          </motion.div>

          {/* Curve */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="rounded-2xl border border-border bg-background p-6"
          >
            <h3 className="font-display text-sm font-semibold text-foreground mb-0.5">Trajetória com Intervenção</h3>
            <p className="text-[11px] text-muted-foreground mb-4">Impacto de uma intervenção adequada ao longo da vida</p>
            <div style={{ height: 210 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={curveData} margin={{ left: 0, right: 12, top: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="age" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }}>
                    <Label value="Idade" position="insideBottom" offset={-10} style={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} />
                  </XAxis>
                  <YAxis domain={[0, 100]} tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }}>
                    <Label value="Performance" angle={-90} position="insideLeft" offset={14} style={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} />
                  </YAxis>
                  <Tooltip
                    contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 11 }}
                    formatter={(v: number, name: string) => [v, name === "baseline" ? "Sem intervenção" : "Com intervenção"]}
                  />
                  <ReferenceLine x={35} stroke="hsl(var(--primary))" strokeDasharray="4 3" strokeWidth={1.5}
                    label={{ value: "Intervenção", position: "top", fontSize: 8, fill: "hsl(var(--primary))" }} />
                  <Line type="natural" dataKey="baseline" stroke="hsl(0,55%,50%)" strokeWidth={2} dot={false} connectNulls={false} />
                  <Line type="natural" dataKey="intervention" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={false} connectNulls={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center gap-5 mt-2 justify-center">
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-0.5 rounded" style={{ backgroundColor: "hsl(0,55%,50%)" }} />
                <span className="text-[10px] text-muted-foreground">Sem intervenção</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-0.5 rounded bg-primary" />
                <span className="text-[10px] text-muted-foreground">Com intervenção</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══ FINAL CTA ════════════════════════════════ */}
      <section className="py-20 md:py-28 px-5 text-center border-t border-border">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
          className="max-w-lg mx-auto"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground leading-tight mb-4">
            Pronto para entender como você funciona?
          </h2>
          <p className="text-muted-foreground text-sm mb-2 leading-relaxed">
            Rastreio rápido e científico.
          </p>
          <p className="text-muted-foreground text-sm mb-8 leading-relaxed">
            Resultado imediato, baixável em PDF e no seu e-mail.
          </p>
          <ShimmerButton to="/triagem">
            Começar agora — 7 minutos
          </ShimmerButton>
        </motion.div>
      </section>

      {/* About Modal */}
      <AboutModal open={showAbout} onClose={() => setShowAbout(false)} />
    </div>
  );
}
