import { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useFunnelTracking, getLayoutVariant, getLeadVariant } from "@/hooks/useFunnelTracking";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Cell, Tooltip, LineChart, Line, ReferenceLine, Label, AreaChart, Area,
} from "recharts";
import {
  MessageCircle, Twitter, Download, RotateCcw, Copy, Check, ChevronDown, Lock,
} from "lucide-react";
import {
  questionBlocks,
  likertOptions,
  type Answers,
  calculateScores,
  interpretResults,
  type HypothesisResult,
  ESTIMATED_MINUTES,
  TOTAL_QUESTIONS,
} from "@/data/quizQuestions";

/* ────── CONSTANTS ────── */
const HYPOTHESIS_ORDER = ["ahsd", "dupla_exc", "tdah", "tea", "trauma", "depressao", "ansiedade"];

const CONDITION_COLORS: Record<string, { hue: number; label: string }> = {
  ahsd:      { hue: 40,  label: "AH/SD" },
  dupla_exc: { hue: 36,  label: "Dupla Exc." },
  tdah:      { hue: 0,   label: "TDAH" },
  tea:       { hue: 15,  label: "Autismo" },
  trauma:    { hue: 340, label: "Trauma" },
  depressao: { hue: 300, label: "Depressão" },
  ansiedade: { hue: 32,  label: "Ansiedade" },
};

function conditionColor(id: string, score: number) {
  const cfg = CONDITION_COLORS[id];
  if (!cfg) return `hsl(${Math.round(40 - (score / 100) * 10)}, 80%, 55%)`;
  if (id === "ahsd") return `hsl(40, 88%, 61%)`;
  if (id === "dupla_exc") return `hsl(36, 87%, 44%)`;
  return `hsl(${cfg.hue}, 65%, 45%)`;
}

/* ────── Dark theme colors (result section) ────── */
const DARK = {
  bg: "hsl(225, 12%, 7%)",
  bgMid: "hsl(225, 12%, 10%)",
  border: "hsl(225, 10%, 18%)",
  text: "hsl(42, 30%, 96%)",
  muted: "hsl(40, 12%, 58%)",
  accent: "hsl(40, 88%, 61%)",
  accentDeep: "hsl(36, 87%, 44%)",
};

/* ────── Demographic Survey ────── */
interface DemographicData {
  nome: string;
  idade: string;
  sexo: string;
  profissao: string;
  laudo: string;
  qualLaudo: string;
}

function DemographicSurvey({ onComplete }: { onComplete: (data: DemographicData) => void }) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<DemographicData>({
    nome: "", idade: "", sexo: "", profissao: "", laudo: "", qualLaudo: ""
  });
  const [inputVal, setInputVal] = useState("");

  const fields = [
    { key: "nome",      label: "Como você se chama?",                    placeholder: "Seu nome",           type: "text" },
    { key: "idade",     label: "Qual é a sua idade?",                    placeholder: "Ex: 32",             type: "number" },
    { key: "sexo",      label: "Com qual gênero você se identifica?",    placeholder: "Ex: Feminino, Masculino, Não-binário…", type: "text" },
    { key: "profissao", label: "Qual é a sua profissão ou área de atuação?", placeholder: "Ex: Designer, Professora, Dev…", type: "text" },
    { key: "laudo",     label: "Você já tem algum laudo formal de saúde mental ou neurodesenvolvimento?", placeholder: "", type: "select" },
    { key: "qualLaudo", label: "Qual é o laudo (ou suspeita diagnóstica)?", placeholder: "Ex: TDAH, TEA, TEPT, nenhum por enquanto…", type: "text" },
  ];

  const currentField = fields[step];
  const isLaudoStep = currentField.key === "laudo";
  const showQualLaudoStep = currentField.key === "qualLaudo";
  const totalSteps = data.laudo === "nao" && step === 5 ? fields.length : fields.length;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isLaudoStep) handleNext();
  };

  const handleNext = () => {
    const newData = { ...data, [currentField.key]: inputVal || data[currentField.key as keyof DemographicData] };
    setData(newData);
    if (step < fields.length - 1) {
      setStep(s => s + 1);
      setInputVal("");
    } else {
      onComplete(newData);
    }
  };

  const handleSelect = (val: string) => {
    const newData = { ...data, laudo: val };
    setData(newData);
    setStep(s => s + 1);
    setInputVal("");
  };

  const handleSkipLaudo = () => {
    onComplete({ ...data, laudo: "nao", qualLaudo: "" });
  };

  const progress = ((step) / fields.length) * 100;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="pt-10 pb-5 px-5 text-center">
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="max-w-md mx-auto">
          <p className="text-primary text-[11px] font-semibold uppercase tracking-[0.15em] mb-4">
            Rastreio de Altas Habilidades e Neurodivergência
          </p>
          <div className="flex items-baseline justify-between mb-1.5">
            <span className="font-semibold text-foreground text-sm tabular-nums">{Math.round(progress)}%</span>
            <span className="text-[11px] text-muted-foreground">Dados iniciais</span>
          </div>
          <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: "hsl(var(--muted))" }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: "linear-gradient(90deg, hsl(40,88%,61%), hsl(36,87%,44%))" }}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </motion.div>
      </header>

      <main className="max-w-lg mx-auto w-full px-5 flex-1 flex flex-col justify-center pb-24">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            className="space-y-5"
          >
            <div>
              <p className="text-[11px] text-muted-foreground uppercase tracking-widest mb-2">{step + 1} de {fields.length}</p>
              <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground leading-tight">
                {currentField.label}
              </h2>
            </div>

            {isLaudoStep ? (
              <div className="space-y-3">
                {["Sim, tenho laudo formal", "Tenho suspeita diagnóstica", "Não tenho laudo"].map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => handleSelect(i === 0 ? "sim" : i === 1 ? "suspeita" : "nao")}
                    className="w-full text-left p-4 rounded-xl border border-border bg-card hover:border-primary/40 hover:bg-primary/[0.03] transition-all duration-200 text-sm font-medium text-foreground"
                  >
                    {opt}
                  </button>
                ))}
                <button
                  onClick={handleSkipLaudo}
                  className="w-full text-center text-[11px] text-muted-foreground hover:text-primary transition-colors mt-2"
                >
                  Prefiro não informar — continuar sem essa pergunta
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative">
                  <input
                    autoFocus
                    type={currentField.type === "number" ? "number" : "text"}
                    value={inputVal}
                    onChange={e => setInputVal(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={currentField.placeholder}
                    className="w-full text-lg sm:text-xl font-medium bg-transparent border-0 border-b-2 border-border focus:border-primary outline-none pb-2 text-foreground placeholder:text-muted-foreground/40 transition-colors duration-200"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => { setStep(s => Math.max(0, s - 1)); setInputVal(""); }}
                    disabled={step === 0}
                    className="text-[12px] text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
                  >
                    Voltar
                  </button>
                  <div className="flex items-center gap-3">
                    {showQualLaudoStep && (
                      <button
                        onClick={() => onComplete({ ...data, qualLaudo: "" })}
                        className="text-[12px] text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Pular
                      </button>
                    )}
                    <button
                      onClick={handleNext}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-primary-foreground transition-all hover:scale-[1.02]"
                      style={{ background: "linear-gradient(135deg, hsl(40,88%,61%), hsl(36,87%,44%))", color: "hsl(225,12%,7%)" }}
                    >
                      {step === fields.length - 1 ? "Iniciar Rastreio" : "Continuar"}
                      <span className="text-[11px] opacity-70">↵</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

/* ────── Likert Scale — with shimmer on select ────── */
function LikertScale({ questionId, value, onChange }: {
  questionId: string; value: number | undefined; onChange: (id: string, val: number) => void;
}) {
  const [lastClicked, setLastClicked] = useState<number | null>(null);

  const handleClick = (v: number) => {
    onChange(questionId, v);
    setLastClicked(v);
    setTimeout(() => setLastClicked(null), 500);
  };

  return (
    <div className="flex gap-1 sm:gap-1.5 w-full">
      {likertOptions.map((opt) => {
        const selected = value === opt.value;
        const shimming = lastClicked === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => handleClick(opt.value)}
            className={`relative flex-1 flex flex-col items-center gap-0.5 py-2 px-0.5 rounded-lg border text-xs transition-all duration-150 overflow-hidden ${
              selected
                ? "text-primary-foreground border-primary/60 scale-[1.03]"
                : "bg-card border-border text-muted-foreground hover:border-primary/30 hover:bg-primary/[0.02]"
            }`}
            style={selected ? {
              background: "linear-gradient(135deg, hsl(40,88%,61%), hsl(36,87%,44%))",
              color: "hsl(225,12%,7%)",
            } : undefined}
          >
            {shimming && (
              <motion.span
                initial={{ x: "-100%", opacity: 0.55 }}
                animate={{ x: "200%", opacity: 0 }}
                transition={{ duration: 0.48, ease: "easeOut" }}
                className="absolute inset-y-0 w-1/2 pointer-events-none"
                style={{ background: "linear-gradient(90deg, transparent, hsl(42,95%,81%/0.5), transparent)" }}
              />
            )}
            <span className="font-semibold text-sm relative z-[1]">{opt.value}</span>
            <span className="leading-tight text-center hidden sm:block text-[10px] relative z-[1]">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/* ────── Motivational Toast — top of screen ────── */
function MotivationalToast({ message }: { message: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -24, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -16, scale: 0.97 }}
      transition={{ duration: 0.32, ease: [0.25, 0.1, 0.25, 1] }}
      className="fixed z-50 left-1/2 -translate-x-1/2 px-5 py-3 rounded-xl shadow-2xl text-[13px] font-medium max-w-sm text-center pointer-events-none"
      style={{
        top: "4.5rem",
        background: "linear-gradient(135deg, hsl(40,88%,61%), hsl(36,87%,44%))",
        color: "hsl(225,12%,7%)",
        boxShadow: "0 0 20px hsl(40 88% 61% / 0.3), 0 8px 32px hsl(40,88%,61%/0.4)",
      }}
    >
      {message}
    </motion.div>
  );
}

/* ────── Score Bar ────── */
function ScoreBar({ score, id, delay = 0 }: { score: number; id?: string; delay?: number }) {
  const color = id ? conditionColor(id, score) : `hsl(${Math.round(120 - (score / 100) * 120)}, 65%, 45%)`;
  return (
    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
      <motion.div
        className="h-full rounded-full"
        style={{ backgroundColor: color }}
        initial={{ width: 0 }}
        animate={{ width: `${score}%` }}
        transition={{ duration: 0.8, delay, ease: "easeOut" }}
      />
    </div>
  );
}

/* ────── Radar Chart ────── */
function ProfileRadarChart({ hypotheses }: { hypotheses: HypothesisResult[] }) {
  const data = hypotheses.map((h) => ({
    subject: CONDITION_COLORS[h.id]?.label ?? h.label.split(" — ")[0].slice(0, 10),
    score: h.score,
    fullMark: 100,
  }));
  return (
    <div className="w-full aspect-square max-w-[320px] mx-auto">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="68%" data={data}>
          <PolarGrid stroke="hsl(var(--border))" />
          <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
          <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} tickCount={4} />
          <Radar name="Perfil" dataKey="score" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.15} strokeWidth={2} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ────── Simplified Potential Chart: 3 bars per hypothesis ────── */
function PotentialExpressionChart({ hypotheses }: { hypotheses: HypothesisResult[] }) {
  const BARRIER_IDS = ["tdah", "tea", "trauma", "ansiedade", "depressao"];
  const data = hypotheses.map((h) => {
    const isBarrier = BARRIER_IDS.includes(h.id);
    const expressao = h.score;
    // potencial: strengths get +15, barriers get inflated potencial
    const potencial = isBarrier ? Math.min(100, Math.round(h.score * 1.08 + 12)) : Math.min(100, Math.round(h.score + 12));
    const melhoria = isBarrier ? Math.min(100, Math.round(h.score * 0.72)) : Math.min(100, Math.round(h.score + 22));
    return {
      name: CONDITION_COLORS[h.id]?.label ?? h.id,
      potencial,
      expressao,
      melhoria,
      id: h.id,
    };
  });

  return (
    <div className="w-full" style={{ height: Math.max(280, data.length * 50) }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 6, right: 36, top: 4, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
          <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => `${v}%`} />
          <YAxis dataKey="name" type="category" width={72} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
          <Tooltip
            contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
            formatter={(value: number, name: string) => {
              const labels: Record<string, string> = {
                potencial: "Potencial identificado",
                expressao: "Expressão identificada",
                melhoria: "Possível melhoria pós-intervenção",
              };
              return [`${value}%`, labels[name] ?? name];
            }}
          />
          <Bar dataKey="potencial" radius={[0, 3, 3, 0]} barSize={11} fill="hsl(0,60%,52%)" fillOpacity={0.85} />
          <Bar dataKey="expressao" radius={[0, 3, 3, 0]} barSize={11} fill="hsl(40,88%,61%)" fillOpacity={0.85} />
          <Bar dataKey="melhoria" radius={[0, 3, 3, 0]} barSize={11} fill="hsl(36,87%,44%)" fillOpacity={0.85} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ────── Intervention Curve — dynamic based on barrier scores ────── */
function InterventionCurveChart({ dark = false, barrierAvg = 50 }: { dark?: boolean; barrierAvg?: number }) {
  // The higher the barrier score, the lower the floor and more dramatic the intervention lift
  const floor = Math.max(60, Math.round(82 - barrierAvg * 0.12));
  const peak  = Math.round(88 + barrierAvg * 0.04);
  const intPeak = Math.round(88 + barrierAvg * 0.06);

  const data = [
    { age: 0,  baseline: 28,        intervention: null },
    { age: 5,  baseline: 50,        intervention: null },
    { age: 10, baseline: 70,        intervention: null },
    { age: 15, baseline: 84,        intervention: null },
    { age: 20, baseline: peak,      intervention: null },
    { age: 25, baseline: peak - 1,  intervention: null },
    { age: 30, baseline: peak - 4,  intervention: null },
    { age: 35, baseline: floor + 8, intervention: floor + 8 },
    { age: 40, baseline: floor + 5, intervention: intPeak },
    { age: 45, baseline: floor + 3, intervention: intPeak - 1 },
    { age: 50, baseline: floor + 2, intervention: intPeak - 2 },
    { age: 60, baseline: floor + 1, intervention: intPeak - 4 },
    { age: 70, baseline: floor,     intervention: intPeak - 7 },
    { age: 80, baseline: floor,     intervention: intPeak - 10 },
    { age: 90, baseline: floor,     intervention: intPeak - 13 },
  ];

  const borderColor = dark ? DARK.border : "hsl(var(--border))";
  const mutedColor  = dark ? DARK.muted  : "hsl(var(--muted-foreground))";
  const cardColor   = dark ? DARK.bgMid  : "hsl(var(--card))";

  return (
    <div className="w-full" style={{ height: 220 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ left: 0, right: 16, top: 12, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={borderColor} />
          <XAxis dataKey="age" tick={{ fontSize: 10, fill: mutedColor }} tickFormatter={(v) => `${v}`}>
            <Label value="Idade" position="insideBottom" offset={-10} style={{ fontSize: 10, fill: mutedColor }} />
          </XAxis>
          <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: mutedColor }}>
            <Label value="Performance" angle={-90} position="insideLeft" offset={14} style={{ fontSize: 10, fill: mutedColor }} />
          </YAxis>
          <Tooltip
            contentStyle={{ backgroundColor: cardColor, border: `1px solid ${borderColor}`, borderRadius: 8, fontSize: 11, color: dark ? DARK.text : undefined }}
            formatter={(value: number, name: string) => [
              `${value}`,
              name === "baseline" ? "Sem intervenção" : "Com intervenção direcionada",
            ]}
          />
          <ReferenceLine x={35} stroke={DARK.accent} strokeDasharray="4 3" strokeWidth={1.5}
            label={{ value: "Intervenção", position: "top", fontSize: 9, fill: DARK.accent }} />
          <Line type="natural" dataKey="baseline" stroke="hsl(0,55%,50%)" strokeWidth={2} dot={false} connectNulls={false} />
          <Line type="natural" dataKey="intervention" stroke="hsl(40,88%,61%)" strokeWidth={2.5} dot={false} connectNulls={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ────── Dark Radar Chart ────── */
function DarkRadarChart({ hypotheses }: { hypotheses: HypothesisResult[] }) {
  const data = hypotheses.map((h) => ({
    subject: CONDITION_COLORS[h.id]?.label ?? h.id,
    score: h.score,
    fullMark: 100,
  }));
  return (
    <div className="w-full" style={{ height: 220 }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="65%" data={data}>
          <PolarGrid stroke={DARK.border} />
          <PolarAngleAxis dataKey="subject" tick={{ fontSize: 9, fill: DARK.muted }} />
          <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 8, fill: DARK.muted }} tickCount={4} />
          <Radar name="Perfil" dataKey="score" stroke={DARK.accent} fill={DARK.accent} fillOpacity={0.18} strokeWidth={2} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ────── Dark Bar Chart ────── */
function DarkBarChart({ hypotheses }: { hypotheses: HypothesisResult[] }) {
  const data = hypotheses.map((h) => ({
    name: CONDITION_COLORS[h.id]?.label ?? h.id,
    score: h.score,
    id: h.id,
  }));
  return (
    <div className="w-full" style={{ height: 200 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 4, right: 30, top: 4, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={DARK.border} horizontal={false} />
          <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 9, fill: DARK.muted }} tickFormatter={(v) => `${v}%`} />
          <YAxis dataKey="name" type="category" width={68} tick={{ fontSize: 9, fill: DARK.muted }} />
          <Bar dataKey="score" radius={[0, 4, 4, 0]} barSize={12}>
            {data.map((entry) => <Cell key={entry.id} fill={conditionColor(entry.id, entry.score)} opacity={0.8} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ────── Dark Area Chart (decorative) ────── */
function DarkAreaChart() {
  const data = [
    { x: 0, a: 30, b: 55 }, { x: 1, a: 45, b: 38 }, { x: 2, a: 62, b: 70 },
    { x: 3, a: 48, b: 85 }, { x: 4, a: 78, b: 62 }, { x: 5, a: 55, b: 90 },
    { x: 6, a: 88, b: 72 }, { x: 7, a: 70, b: 55 }, { x: 8, a: 92, b: 80 },
    { x: 9, a: 65, b: 95 }, { x: 10, a: 80, b: 68 },
  ];
  return (
    <div className="w-full" style={{ height: 120 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ left: 0, right: 0, top: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="gradA" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(40,88%,61%)" stopOpacity={0.4} />
              <stop offset="95%" stopColor="hsl(40,88%,61%)" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="gradB" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(36,87%,44%)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(36,87%,44%)" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <Area type="natural" dataKey="a" stroke="hsl(40,88%,61%)" strokeWidth={1.5} fill="url(#gradA)" dot={false} />
          <Area type="natural" dataKey="b" stroke="hsl(36,87%,44%)" strokeWidth={1.5} fill="url(#gradB)" dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ────── Scientific References Modal ────── */
function ReferencesModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-5"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.94, opacity: 0, y: 16 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.94, opacity: 0 }}
        transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
        className="bg-card border rounded-xl p-6 max-w-lg w-full shadow-2xl max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-display text-lg font-bold text-foreground mb-4">Referências Científicas</h2>
        <div className="space-y-3 text-[12px] text-card-foreground leading-relaxed">
          {[
            { ref: "Barkley, R.A. (2015). Attention-deficit hyperactivity disorder (4th ed.). Guilford Press.", note: "Base para compreensão do TDAH como disfunção executiva." },
            { ref: "Baron-Cohen, S. (2008). Autism and Asperger Syndrome. Oxford University Press.", note: "Cognição social e espectro autista." },
            { ref: "Van der Kolk, B. (2014). The Body Keeps the Score. Viking.", note: "Trauma e impacto no funcionamento cognitivo." },
            { ref: "Winner, E. (1996). Gifted Children: Myths and Realities. Basic Books.", note: "Alta habilidade/superdotação e dupla excepcionalidade." },
            { ref: "Webb, J.T. et al. (2016). Misdiagnosis and Dual Diagnoses. Great Potential Press.", note: "Diagnósticos errôneos em superdotados — base do conceito 2e." },
            { ref: "Shields, G.S. et al. (2016). Effects of negative affect on cognition. Psychol Sci.", note: "Estados emocionais negativos reduzem desempenho em 20–30%." },
            { ref: "Eysenck, M.W. & Derakshan, N. (2011). Attentional control theory. Pers. Indiv. Diff.", note: "Ansiedade e custo cognitivo." },
            { ref: "Rock, P.L. et al. (2014). Cognitive impairment in depression. Psychol Med.", note: "Depressão e redução de performance cognitiva." },
          ].map((item, i) => (
            <div key={i} className="border-b border-border pb-2.5 last:border-0">
              <p className="font-medium text-foreground mb-0.5">{item.ref}</p>
              <p className="text-muted-foreground">{item.note}</p>
            </div>
          ))}
        </div>
        <button onClick={onClose} className="mt-4 text-[11px] text-primary hover:underline">Fechar</button>
      </motion.div>
    </motion.div>
  );
}

/* ────── Expandable Hypothesis Card ────── */
function HypothesisCard({ hypothesis, index }: { hypothesis: HypothesisResult; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const color = conditionColor(hypothesis.id, hypothesis.score);

  function formatDescription(text: string) {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={i} className="font-semibold italic text-foreground">{part.slice(2, -2)}</strong>;
      }
      return <span key={i}>{part}</span>;
    });
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.06 + index * 0.035 }}
      className="rounded-xl border bg-card overflow-hidden"
    >
      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <div className="flex-1">
            <h3 className="font-display font-semibold text-foreground text-[13px] sm:text-sm leading-snug">{hypothesis.label}</h3>
            {(hypothesis.id === "ahsd") && (
              <p className="text-[10px] text-muted-foreground mt-0.5 italic">
                Funcionamento cognitivo de alta complexidade — não se resume a notas ou QI
              </p>
            )}
          </div>
          <span
            className="text-[11px] font-bold px-2.5 py-1 rounded-md shrink-0 tabular-nums"
            style={{ backgroundColor: `${color}18`, color }}
          >
            {hypothesis.score}%
          </span>
        </div>
        <ScoreBar score={hypothesis.score} id={hypothesis.id} delay={0.1 + index * 0.035} />
        <p className="text-[13px] text-muted-foreground leading-relaxed mt-2.5">{hypothesis.shortDescription}</p>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-primary text-[11px] font-medium mt-2 hover:underline tracking-wide uppercase"
        >
          {expanded ? "Fechar" : "Entender este bloco"}
        </button>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            className="overflow-hidden"
          >
            <div className="px-4 sm:px-5 pb-5 border-t border-border">
              <div className="text-[13px] text-card-foreground leading-relaxed whitespace-pre-line mt-3 space-y-2">
                {hypothesis.fullDescription.split("\n\n").map((para, pi) => (
                  <p key={pi}>{formatDescription(para)}</p>
                ))}
              </div>
              {hypothesis.id === "ahsd" && (
                <div className="mt-3 p-3 rounded-lg bg-primary/5 border border-primary/15">
                  <p className="text-[12px] text-primary font-medium italic">
                    AH/SD é um <strong>modo de funcionar</strong>, não um título. Pessoas superdotadas frequentemente <strong>não se reconhecem</strong> como tal — porque seus desafios dominam sua autoimagem.
                  </p>
                </div>
              )}
              {hypothesis.id === "dupla_exc" && (
                <div className="mt-3 p-3 rounded-lg bg-secondary/50 border border-border">
                  <p className="text-[12px] text-card-foreground italic">
                    <strong>"Eu sei que sou capaz, mas não consigo render como deveria."</strong> — essa frase descreve a experiência central da dupla excepcionalidade.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ────── Share Buttons (social style) ────── */
function ShareButtons({ onShare }: { onShare: () => void }) {
  const [copied, setCopied] = useState(false);
  const url = encodeURIComponent(window.location.origin + "/triagem");
  const text = encodeURIComponent("Fiz o rastreio de Altas Habilidades e Neurodivergência — você precisa conhecer.");
  const whatsappUrl = `https://api.whatsapp.com/send?text=${text}%20${url}`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;

  const handleCopy = async () => {
    await onShare();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-[11px] text-muted-foreground uppercase tracking-widest">Compartilhar resultado</p>
      <div className="flex gap-2.5">
        <a
          href={whatsappUrl} target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-[12px] text-white transition-all hover:opacity-90 hover:scale-[1.03]"
          style={{ background: "#25D366" }}
        >
          <MessageCircle className="w-4 h-4" />
          <span>WhatsApp</span>
        </a>
        <a
          href={twitterUrl} target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-[12px] text-white transition-all hover:opacity-90 hover:scale-[1.03]"
          style={{ background: "#000" }}
        >
          <Twitter className="w-4 h-4" />
          <span>X</span>
        </a>
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-card hover:bg-muted transition-all text-[12px] font-medium text-foreground hover:scale-[1.03]"
        >
          {copied ? <Check className="w-4 h-4" style={{ color: "hsl(141,58%,54%)" }} /> : <Copy className="w-4 h-4" />}
          <span>{copied ? "Copiado!" : "Copiar link"}</span>
        </button>
      </div>
    </div>
  );
}

/* ────── Lead Capture Form (inside popup) ────── */
function LeadCaptureForm({ onSubmit }: { onSubmit: (d: { nome: string; whatsapp: string; email: string }) => void }) {
  const [form, setForm] = useState({ nome: "", whatsapp: "", email: "" });
  const [step, setStep] = useState(0);

  const handleChange = (field: string, val: string) => setForm(p => ({ ...p, [field]: val }));

  const isValid = form.nome.trim() && form.email.includes("@");

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      <div className="space-y-3">
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wider mb-1.5 block" style={{ color: DARK.muted }}>Nome</label>
          <input
            type="text"
            value={form.nome}
            onChange={e => handleChange("nome", e.target.value)}
            placeholder="Seu nome"
            className="w-full rounded-lg px-3.5 py-2.5 text-sm bg-transparent border outline-none focus:border-opacity-80 transition-all"
            style={{
              borderColor: DARK.border,
              color: DARK.text,
              background: "hsl(225,12%,13%)",
            }}
          />
        </div>
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wider mb-1.5 block" style={{ color: DARK.muted }}>E-mail</label>
          <input
            type="email"
            value={form.email}
            onChange={e => handleChange("email", e.target.value)}
            placeholder="seu@email.com"
            className="w-full rounded-lg px-3.5 py-2.5 text-sm bg-transparent border outline-none transition-all"
            style={{ borderColor: DARK.border, color: DARK.text, background: "hsl(225,12%,13%)" }}
          />
        </div>
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wider mb-1.5 block" style={{ color: DARK.muted }}>WhatsApp (opcional)</label>
          <input
            type="tel"
            value={form.whatsapp}
            onChange={e => handleChange("whatsapp", e.target.value)}
            placeholder="(11) 99999-9999"
            className="w-full rounded-lg px-3.5 py-2.5 text-sm bg-transparent border outline-none transition-all"
            style={{ borderColor: DARK.border, color: DARK.text, background: "hsl(225,12%,13%)" }}
          />
        </div>
      </div>
      <button
        onClick={() => isValid && onSubmit(form)}
        disabled={!isValid}
        className="w-full py-3.5 rounded-xl font-semibold text-sm transition-all hover:opacity-90 hover:scale-[1.01] disabled:opacity-40 disabled:cursor-not-allowed"
        style={{
          background: isValid ? "linear-gradient(135deg, hsl(40,88%,61%), hsl(36,87%,44%))" : "hsl(225,12%,15%)",
          color: isValid ? "hsl(225,12%,7%)" : "hsl(40,12%,40%)",
          boxShadow: isValid ? "0 0 20px hsl(40 88% 61% / 0.3), 0 4px 24px hsl(40,88%,61%/0.4)" : undefined,
        }}
      >
        Acessar Relatório Aprofundado
      </button>
    </motion.div>
  );
}

/* ────── Results View ────── */
function ResultsView({ answers, onRestart, onCheckout }: { answers: Answers; onRestart: () => void; onCheckout?: () => void }) {
  const scores = useMemo(() => calculateScores(answers), [answers]);
  const results = useMemo(() => interpretResults(scores), [scores]);
  const [showRefs, setShowRefs] = useState(false);
  const blurRef = useRef<HTMLDivElement>(null);

  const sortedHypotheses = useMemo(() => {
    return [...results.hypotheses].sort((a, b) => {
      const ai = HYPOTHESIS_ORDER.indexOf(a.id);
      const bi = HYPOTHESIS_ORDER.indexOf(b.id);
      return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
    });
  }, [results.hypotheses]);

  const barrierIds = ["tdah", "tea", "trauma", "ansiedade", "depressao"];
  const activeBarriers = sortedHypotheses.filter(h => barrierIds.includes(h.id) && h.score >= 40);
  const avgBarrierScore = activeBarriers.length
    ? activeBarriers.reduce((sum, h) => sum + h.score, 0) / activeBarriers.length
    : 0;
  const potentialLoss = Math.round(20 + (avgBarrierScore / 100) * 10);

  const handleShare = async () => {
    const text = "Fiz o rastreio de Altas Habilidades e Neurodivergência — você precisa conhecer.";
    const url = window.location.origin + "/triagem";
    if (navigator.share) {
      try { await navigator.share({ title: "Rastreio de Altas Habilidades", text, url }); } catch {}
    } else {
      await navigator.clipboard.writeText(`${text}\n${url}`);
    }
  };

  const handleUnlockClick = () => {
    onCheckout?.(); // rastreia checkout no funil
    window.open("https://hotmart.com", "_blank");
  };

  return (
    <div className="min-h-screen bg-background print:bg-white">
      {/* Header */}
      <header className="pt-10 pb-6 md:pt-14 md:pb-8 px-5 text-center">
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="max-w-xl mx-auto">
          <p className="text-primary text-[10px] font-semibold uppercase tracking-[0.18em] mb-2">Rastreio de Altas Habilidades e Neurodivergência</p>
          <h1 className="font-display text-2xl md:text-[2rem] font-bold text-foreground mb-1.5 tracking-tight">
            Seu Resultado
          </h1>
          <p className="text-muted-foreground text-[13px] max-w-md mx-auto leading-relaxed">
            Análise baseada em suas respostas. Este resultado levanta hipóteses — não constitui diagnóstico.
          </p>
        </motion.div>
      </header>

      <main className="max-w-2xl mx-auto px-5 pb-24 space-y-8">
        {/* Summary */}
        <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="rounded-xl border border-primary/15 bg-primary/[0.03] p-5 sm:p-6">
          <h2 className="font-display text-lg font-semibold text-foreground mb-2">Síntese Geral</h2>
          <p className="text-[13px] text-card-foreground leading-relaxed whitespace-pre-line">{results.summary}</p>
        </motion.section>

        {/* Potential vs Expression */}
        <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.05 }} className="rounded-xl border border-accent/20 bg-accent/[0.03] p-5 sm:p-6">
          <h2 className="font-display text-lg font-semibold text-foreground mb-2">Potencial vs. Expressão</h2>
          <p className="text-[13px] text-card-foreground leading-relaxed whitespace-pre-line">{results.potentialVsExpression}</p>
        </motion.section>

        {/* Detalhamento por Área */}
        <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.08 }} className="rounded-xl border bg-card p-5 sm:p-6">
          <h2 className="font-display text-lg font-semibold text-foreground mb-1">Detalhamento por Área</h2>
          <p className="text-[11px] text-muted-foreground mb-4 leading-relaxed">Intensidade dos padrões identificados em cada dimensão</p>
          <div className="space-y-3.5">
            {sortedHypotheses.map((h, i) => {
              const color = conditionColor(h.id, h.score);
              return (
                <div key={h.id}>
                  <div className="flex justify-between items-baseline text-[12px] mb-1">
                    <span className="font-medium text-foreground">{CONDITION_COLORS[h.id]?.label ?? h.label.split(" — ")[0]}</span>
                    <span className="font-bold tabular-nums text-[13px]" style={{ color }}>{h.score}%</span>
                  </div>
                  <ScoreBar score={h.score} id={h.id} delay={0.08 + i * 0.03} />
                </div>
              );
            })}
          </div>
        </motion.section>

        {/* Entenda Cada Área */}
        <section className="space-y-2.5">
          <div className="mb-1">
            <h2 className="font-display text-lg font-semibold text-foreground">Entenda Cada Bloco</h2>
            <p className="text-[11px] text-muted-foreground mt-0.5">Toque em cada área para expandir a explicação completa</p>
          </div>
          {sortedHypotheses.map((h, i) => (
            <HypothesisCard key={h.id} hypothesis={h} index={i} />
          ))}
        </section>

        {/* Mapa de Perfil */}
        <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.12 }} className="rounded-xl border bg-card p-5 sm:p-6">
          <h2 className="font-display text-lg font-semibold text-foreground mb-1">Mapa de Perfil</h2>
          <p className="text-[11px] text-muted-foreground mb-4">Visão integrada de todas as dimensões avaliadas</p>
          <ProfileRadarChart hypotheses={sortedHypotheses} />
        </motion.section>

        {/* Propensão de Expressão do Potencial */}
        <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.14 }} className="rounded-xl border bg-card p-5 sm:p-6">
          <h2 className="font-display text-lg font-semibold text-foreground mb-1">Propensão de Expressão do Potencial</h2>
          <p className="text-[11px] text-muted-foreground mb-1 leading-relaxed">
            Barras coloridas = intensidade atual · Barras verdes = estimativa com intervenção adequada
          </p>
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: "hsl(0,65%,45%)" }} />
            <span className="text-[11px] text-muted-foreground">Barreiras ao potencial</span>
            <span className="inline-block w-3 h-3 rounded-sm bg-primary ml-2" />
            <span className="text-[11px] text-muted-foreground">Forças cognitivas</span>
            <span className="inline-block w-3 h-3 rounded-sm ml-2" style={{ backgroundColor: "hsl(36,87%,44%)" }} />
            <span className="text-[11px] text-muted-foreground">Com intervenção</span>
          </div>
          <PotentialExpressionChart hypotheses={sortedHypotheses} />
          <div className="mt-4 p-3.5 rounded-lg bg-primary/5 border border-primary/15">
            <p className="text-[12px] text-card-foreground leading-relaxed">
              <strong className="italic">Pesquisas indicam que transtornos emocionais e neurofuncionais não tratados reduzem o desempenho cognitivo em 20 a 30%.</strong> Este gráfico mostra o quanto cada área pode melhorar com intervenção direcionada.
            </p>
            <button onClick={() => setShowRefs(true)} className="text-[11px] text-primary hover:underline mt-1.5">
              Ver referências
            </button>
          </div>
        </motion.section>

        {/* Curva de Intervenção */}
        <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.16 }} className="rounded-xl border bg-card p-5 sm:p-6">
          <h2 className="font-display text-lg font-semibold text-foreground mb-1">Trajetória com Intervenção</h2>
          <p className="text-[11px] text-muted-foreground mb-4 leading-relaxed">
            Projeção de desempenho cognitivo e performance ao longo da vida
          </p>
          <InterventionCurveChart />
          <div className="flex items-center gap-5 mt-3 justify-center">
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-0.5" style={{ backgroundColor: "hsl(0,55%,50%)" }} />
              <span className="text-[11px] text-muted-foreground">Sem intervenção</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-0.5" style={{ backgroundColor: "hsl(40,88%,61%)" }} />
              <span className="text-[11px] text-muted-foreground">Com intervenção direcionada</span>
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground mt-3 text-center italic">
            O ponto de inflexão aos 35 anos representa o momento em que intervenção adequada pode reverter a curva descendente.
          </p>
        </motion.section>

        {/* Disclaimer */}
        <div className="rounded-xl border border-accent/20 bg-accent/[0.03] p-4 sm:p-5">
          <h3 className="font-display font-semibold text-foreground text-[13px] mb-1">Nota Importante</h3>
          <p className="text-[12px] text-card-foreground leading-relaxed">
            Este questionário é um instrumento de autorrelato e <strong>não substitui avaliação profissional</strong>. Os resultados indicam padrões de funcionamento que merecem investigação com profissional qualificado.
          </p>
        </div>

        <div className="text-center">
          <button onClick={() => setShowRefs(true)} className="text-[12px] text-muted-foreground hover:text-primary underline underline-offset-4 transition-colors">
            Referências científicas utilizadas neste material
          </button>
        </div>


        {/* Share Buttons */}
        <div className="py-4">
          <ShareButtons onShare={handleShare} />
        </div>

        {/* Actions row */}
        <div className="flex gap-3 justify-center flex-wrap print:hidden">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-card hover:bg-muted transition-all text-[12px] font-medium text-foreground hover:scale-[1.02]"
          >
            <Download className="w-4 h-4" />
            <span>Exportar PDF</span>
          </button>
          <button
            onClick={onRestart}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-card hover:bg-muted transition-all text-[12px] font-medium text-foreground hover:scale-[1.02]"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Refazer Questionário</span>
          </button>
        </div>

      </main>

      {/* References modal */}
      <AnimatePresence>
        {showRefs && <ReferencesModal open={showRefs} onClose={() => setShowRefs(false)} />}
      </AnimatePresence>
    </div>
  );
}

/* ────── Participant Counter ────── */
const PARTICIPANT_BASE = 4_217; // seed count — replace with real backend value

function ParticipantCounter() {
  const [count, setCount] = useState(PARTICIPANT_BASE);
  useEffect(() => {
    // Simulate real-time increments (replace with API call in production)
    const interval = setInterval(() => {
      setCount(c => c + Math.floor(Math.random() * 2));
    }, 8000);
    return () => clearInterval(interval);
  }, []);
  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      <div className="flex -space-x-1.5">
        {["hsl(174,55%,39%)", "hsl(213,73%,59%)", "hsl(0,70%,58%)", "hsl(40,88%,61%)"].map((bg, i) => (
          <div
            key={i}
            className="w-6 h-6 rounded-full border-2 border-background"
            style={{ background: bg }}
          />
        ))}
      </div>
      <p className="text-[12px] text-muted-foreground">
        <span className="font-semibold text-foreground tabular-nums">
          {count.toLocaleString("pt-BR")}
        </span>{" "}
        pessoas já fizeram este rastreio
      </p>
    </div>
  );
}

/* ────── Lead Capture Pre-Quiz ────── */
function LeadCapturePre({ onComplete }: { onComplete: (data: { nome: string; email: string; telefone: string }) => void }) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [focused, setFocused] = useState<string | null>(null);

  /* ── Validation ── */
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  // Accepts: (11) 99999-9999 / 11999999999 / +55 11 99999-9999
  const phoneRegex = /^(\+?55\s?)?(\(?\d{2}\)?[\s-]?)(\d{4,5}[\s-]?\d{4})$/;

  const errors = {
    nome: nome.trim().length === 0
      ? "Nome é obrigatório"
      : nome.trim().length < 2
      ? "Nome muito curto"
      : null,
    email: email.trim().length === 0
      ? "E-mail é obrigatório"
      : !emailRegex.test(email.trim())
      ? "E-mail inválido"
      : null,
    telefone: telefone.trim().length === 0
      ? "WhatsApp é obrigatório"
      : !phoneRegex.test(telefone.trim())
      ? "Número inválido — use (11) 99999-9999"
      : null,
  };

  const isValid = !errors.nome && !errors.email && !errors.telefone;

  const handleBlur = (field: string) => {
    setFocused(null);
    setTouched(p => ({ ...p, [field]: true }));
  };

  const handleSubmit = () => {
    setTouched({ nome: true, email: true, telefone: true });
    if (!isValid) return;
    onComplete({ nome: nome.trim(), email: email.trim(), telefone: telefone.trim() });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSubmit();
  };

  const borderColor = (field: string, hasError: boolean) => {
    if (focused === field) return "hsl(174,55%,39%)";
    if (touched[field] && hasError) return "hsl(0,70%,58%)";
    if (touched[field] && !hasError) return "hsl(141,58%,54%)";
    return "hsl(var(--border))";
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
          Para onde quer que{" "}
          <span className="text-primary">enviemos seu</span>
          <br />
          relatório gratuito?
        </h1>

        <p className="text-muted-foreground text-sm text-center mb-8 leading-relaxed">
          Preencha os dados abaixo para receber seu resultado.<br />
          <span className="text-foreground font-medium">Gratuito. Leva ~7 minutos.</span>
        </p>

        <div className="space-y-5">
          {/* Nome */}
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">
              Nome *
            </label>
            <input
              autoFocus
              type="text"
              value={nome}
              maxLength={100}
              onChange={e => setNome(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setFocused("nome")}
              onBlur={() => handleBlur("nome")}
              placeholder="Seu nome completo"
              className="w-full text-base bg-transparent border-0 border-b-2 pb-2 outline-none text-foreground placeholder:text-muted-foreground/40 transition-colors duration-200"
              style={{ borderBottomColor: borderColor("nome", !!errors.nome) }}
            />
            <AnimatePresence>
              {touched.nome && errors.nome && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.18 }}
                  className="text-[11px] mt-1" style={{ color: "hsl(0,65%,50%)" }}
                >
                  {errors.nome}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Email */}
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">
              E-mail *
            </label>
            <input
              type="email"
              value={email}
              maxLength={255}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setFocused("email")}
              onBlur={() => handleBlur("email")}
              placeholder="seu@email.com"
              className="w-full text-base bg-transparent border-0 border-b-2 pb-2 outline-none text-foreground placeholder:text-muted-foreground/40 transition-colors duration-200"
              style={{ borderBottomColor: borderColor("email", !!errors.email) }}
            />
            <AnimatePresence>
              {touched.email && errors.email && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.18 }}
                  className="text-[11px] mt-1" style={{ color: "hsl(0,65%,50%)" }}
                >
                  {errors.email}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Telefone */}
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">
              WhatsApp *
            </label>
            <input
              type="tel"
              value={telefone}
              maxLength={20}
              onChange={e => setTelefone(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setFocused("telefone")}
              onBlur={() => handleBlur("telefone")}
              placeholder="(11) 99999-9999"
              className="w-full text-base bg-transparent border-0 border-b-2 pb-2 outline-none text-foreground placeholder:text-muted-foreground/40 transition-colors duration-200"
              style={{ borderBottomColor: borderColor("telefone", !!errors.telefone) }}
            />
            <AnimatePresence>
              {touched.telefone && errors.telefone && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.18 }}
                  className="text-[11px] mt-1" style={{ color: "hsl(0,65%,50%)" }}
                >
                  {errors.telefone}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* CTA */}
          <div className="pt-3">
            <button
              onClick={handleSubmit}
              className="w-full py-3.5 rounded-xl font-semibold text-sm transition-all hover:scale-[1.01] hover:opacity-95"
              style={{
                background: isValid
                  ? "linear-gradient(135deg, hsl(174,55%,39%), hsl(174,62%,29%))"
                  : "hsl(var(--muted))",
                color: isValid ? "hsl(0,0%,97%)" : "hsl(var(--muted-foreground))",
                boxShadow: isValid ? "0 0 20px hsl(174 55% 39% / 0.25), 0 4px 24px hsl(174,55%,39%/0.35)" : undefined,
                cursor: isValid ? "pointer" : "default",
              }}
            >
              Iniciar Rastreio Gratuito →
            </button>
            <p className="text-[11px] text-muted-foreground text-center mt-3 leading-snug">
              Seus dados são confidenciais e não serão compartilhados.
            </p>
          </div>
        </div>

        <ParticipantCounter />
      </motion.div>
    </div>
  );
}

/* ────── Lead Capture Post-Quiz ────── */
function LeadCapturePost({ onComplete }: { onComplete: (data: { nome: string; email: string; telefone: string }) => void }) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [focused, setFocused] = useState<string | null>(null);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const phoneRegex = /^(\+?55\s?)?(\(?\d{2}\)?[\s-]?)(\d{4,5}[\s-]?\d{4})$/;

  const errors = {
    nome: nome.trim().length === 0 ? "Nome é obrigatório" : nome.trim().length < 2 ? "Nome muito curto" : null,
    email: email.trim().length === 0 ? "E-mail é obrigatório" : !emailRegex.test(email.trim()) ? "E-mail inválido" : null,
    telefone: telefone.trim().length === 0 ? "WhatsApp é obrigatório" : !phoneRegex.test(telefone.trim()) ? "Número inválido — use (11) 99999-9999" : null,
  };
  const isValid = !errors.nome && !errors.email && !errors.telefone;

  const handleBlur = (field: string) => { setFocused(null); setTouched(p => ({ ...p, [field]: true })); };
  const handleSubmit = () => {
    setTouched({ nome: true, email: true, telefone: true });
    if (!isValid) return;
    onComplete({ nome: nome.trim(), email: email.trim(), telefone: telefone.trim() });
  };
  const handleKeyDown = (e: React.KeyboardEvent) => { if (e.key === "Enter") handleSubmit(); };

  const borderColor = (field: string, hasError: boolean) => {
    if (focused === field) return "hsl(40,88%,61%)";
    if (touched[field] && hasError) return "hsl(0,70%,58%)";
    if (touched[field] && !hasError) return "hsl(141,58%,54%)";
    return "hsl(var(--border))";
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-5 py-12">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.25, 0.1, 0.25, 1] }}
        className="w-full max-w-md"
      >
        {/* Badge de conclusão */}
        <div className="flex justify-center mb-6">
          <motion.div
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 320, damping: 20 }}
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"
            style={{ background: "linear-gradient(135deg, hsl(40,88%,61%), hsl(36,87%,44%))" }}
          >
            ✓
          </motion.div>
        </div>

        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary mb-3 text-center">
          Rastreio concluído
        </p>

        <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground leading-tight mb-3 text-center">
          Para onde enviamos{" "}
          <span className="text-primary">seu resultado?</span>
        </h1>

        <p className="text-muted-foreground text-sm text-center mb-8 leading-relaxed">
          Seu perfil cognitivo está pronto. Insira seus dados para<br />
          <span className="text-foreground font-medium">visualizar o resultado completo agora.</span>
        </p>

        <div className="space-y-5">
          {/* Nome */}
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">Nome *</label>
            <input
              autoFocus type="text" value={nome} maxLength={100}
              onChange={e => setNome(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setFocused("nome")}
              onBlur={() => handleBlur("nome")}
              placeholder="Seu nome completo"
              className="w-full text-base bg-transparent border-0 border-b-2 pb-2 outline-none text-foreground placeholder:text-muted-foreground/40 transition-colors duration-200"
              style={{ borderBottomColor: borderColor("nome", !!errors.nome) }}
            />
            <AnimatePresence>
              {touched.nome && errors.nome && (
                <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.18 }}
                  className="text-[11px] mt-1" style={{ color: "hsl(0,65%,50%)" }}>
                  {errors.nome}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Email */}
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">E-mail *</label>
            <input
              type="email" value={email} maxLength={255}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setFocused("email")}
              onBlur={() => handleBlur("email")}
              placeholder="seu@email.com"
              className="w-full text-base bg-transparent border-0 border-b-2 pb-2 outline-none text-foreground placeholder:text-muted-foreground/40 transition-colors duration-200"
              style={{ borderBottomColor: borderColor("email", !!errors.email) }}
            />
            <AnimatePresence>
              {touched.email && errors.email && (
                <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.18 }}
                  className="text-[11px] mt-1" style={{ color: "hsl(0,65%,50%)" }}>
                  {errors.email}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Telefone */}
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">WhatsApp *</label>
            <input
              type="tel" value={telefone} maxLength={20}
              onChange={e => setTelefone(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setFocused("telefone")}
              onBlur={() => handleBlur("telefone")}
              placeholder="(11) 99999-9999"
              className="w-full text-base bg-transparent border-0 border-b-2 pb-2 outline-none text-foreground placeholder:text-muted-foreground/40 transition-colors duration-200"
              style={{ borderBottomColor: borderColor("telefone", !!errors.telefone) }}
            />
            <AnimatePresence>
              {touched.telefone && errors.telefone && (
                <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.18 }}
                  className="text-[11px] mt-1" style={{ color: "hsl(0,65%,50%)" }}>
                  {errors.telefone}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* CTA */}
          <div className="pt-3">
            <button
              onClick={handleSubmit}
              className="w-full py-3.5 rounded-xl font-semibold text-sm transition-all hover:scale-[1.01] hover:opacity-95"
              style={{
                background: isValid
                  ? "linear-gradient(135deg, hsl(40,88%,61%), hsl(36,87%,44%))"
                  : "hsl(var(--muted))",
                color: isValid ? "hsl(225,12%,7%)" : "hsl(var(--muted-foreground))",
                boxShadow: isValid ? "0 0 20px hsl(40 88% 61% / 0.25), 0 4px 24px hsl(40,88%,61%/0.35)" : undefined,
                cursor: isValid ? "pointer" : "default",
              }}
            >
              Ver meu resultado completo →
            </button>
            <p className="text-[11px] text-muted-foreground text-center mt-3 leading-snug">
              Seus dados são confidenciais e não serão compartilhados.
            </p>
          </div>
        </div>

        <ParticipantCounter />
      </motion.div>
    </div>
  );
}

/* ────── Quiz Page ────── */
export default function QuizPage() {
  const leadVariant = getLeadVariant(); // 'pre' | 'post' — A/B por sessão
  const initialPhase = leadVariant === "pre" ? "lead" : "demographic";

  const [phase, setPhase] = useState<"lead" | "demographic" | "quiz" | "lead_post" | "results">(initialPhase);
  const [leadData, setLeadData] = useState<{ nome: string; email: string; telefone: string } | null>(null);
  const [demographicData, setDemographicData] = useState<any>(null);
  const [currentBlock, setCurrentBlock] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [motivationalMsg, setMotivationalMsg] = useState<string | null>(null);

  // ── Funil tracking ──
  const { trackStart, trackStep, trackComplete, trackCheckout } = useFunnelTracking(TOTAL_QUESTIONS);
  const layout = getLayoutVariant(); // 'single' | 'multi' — atribuído automaticamente por sessão

  const block = questionBlocks[currentBlock];
  const answeredCount = Object.keys(answers).length;
  const progress = Math.round((answeredCount / TOTAL_QUESTIONS) * 100);
  const blockComplete = block?.questions.every((q) => answers[q.id] !== undefined);
  const isLast = currentBlock === questionBlocks.length - 1;

  useEffect(() => {
    let msg: string | null = null;
    if (progress >= 80 && progress < 85) msg = "Quase lá — faltam poucas perguntas.";
    else if (progress >= 40 && progress < 45) {
      const secs = (TOTAL_QUESTIONS - answeredCount) * 8;
      msg = `Metade concluída. Faltam ~${Math.ceil(secs / 60)} min.`;
    } else if (progress >= 95) msg = "Últimas perguntas. Seu resultado está quase pronto.";
    if (msg) {
      setMotivationalMsg(msg);
      const t = setTimeout(() => setMotivationalMsg(null), 3500);
      return () => clearTimeout(t);
    }
  }, [progress, answeredCount]);

  const handleAnswer = (id: string, val: number) => setAnswers((p) => ({ ...p, [id]: val }));
  const handleNext = () => {
    if (isLast) {
      trackComplete();
      if (leadVariant === "post") {
        // Variante B: mostrar captura de lead DEPOIS do quiz
        setPhase("lead_post");
      } else {
        setPhase("results");
      }
    } else {
      setCurrentBlock((c) => c + 1);
      trackStep(answeredCount);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };
  const handleBack = () => { setCurrentBlock((c) => Math.max(0, c - 1)); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const handleRestart = () => {
    setAnswers({});
    setCurrentBlock(0);
    setPhase(leadVariant === "pre" ? "lead" : "demographic");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Phases
  if (phase === "lead") {
    return <LeadCapturePre onComplete={(data) => {
      setLeadData(data);
      setPhase("demographic");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }} />;
  }
  if (phase === "demographic") {
    return <DemographicSurvey onComplete={(data) => {
      setDemographicData(data);
      trackStart(); // ← início do quiz após dados demográficos
      setPhase("quiz");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }} />;
  }
  if (phase === "lead_post") {
    return <LeadCapturePost onComplete={(data) => {
      setLeadData(data);
      setPhase("results");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }} />;
  }
  if (phase === "results") return <ResultsView answers={answers} onRestart={handleRestart} onCheckout={trackCheckout} />;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="pt-10 pb-5 md:pt-14 md:pb-7 px-5 text-center">
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="max-w-md mx-auto space-y-3">
          <p className="text-primary text-[11px] font-semibold uppercase tracking-[0.15em]">
            Rastreio de Altas Habilidades e Neurodivergência
          </p>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground tracking-tight leading-[1.2]">
            Você sempre se sentiu diferente.
            <br />
            <span className="text-primary">Agora vai saber por quê.</span>
          </h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Descubra seu perfil cognitivo em apenas <span className="font-semibold text-foreground">~{ESTIMATED_MINUTES} minutos</span>.
          </p>
        </motion.div>
      </header>

      {/* Progress Bar */}
      <div className="max-w-lg mx-auto w-full px-5 mb-5">
        <div className="flex items-baseline justify-between mb-1.5">
          <span className="font-semibold text-foreground text-sm tabular-nums">{progress}%</span>
          <span className="text-[11px] text-muted-foreground tabular-nums">{answeredCount}/{TOTAL_QUESTIONS}</span>
        </div>
        <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: "hsl(var(--muted))" }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: "linear-gradient(90deg, hsl(174,62%,29%), hsl(172,55%,20%))" }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Questions */}
      <main className="max-w-lg mx-auto w-full px-5 pb-24 flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={block.id}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <div className="flex justify-between text-[10px] text-muted-foreground mb-3 sm:hidden px-0.5 uppercase tracking-widest">
              <span>0 Nunca</span>
              <span>4 Quase sempre</span>
            </div>

            <div className="space-y-3">
              {block.questions.map((q, qi) => (
                <motion.div
                  key={q.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: qi * 0.04, duration: 0.3 }}
                  className="rounded-lg border bg-card p-3.5 sm:p-4"
                >
                  <p className="text-card-foreground mb-2.5 leading-relaxed text-[13px] sm:text-sm">
                    {q.text}
                  </p>
                  <LikertScale questionId={q.id} value={answers[q.id]} onChange={handleAnswer} />
                </motion.div>
              ))}
            </div>

            <div className="flex items-center justify-between mt-6">
              <Button
                variant="ghost" size="sm"
                onClick={handleBack}
                disabled={currentBlock === 0}
                className="text-xs h-9 px-4"
              >
                Anterior
              </Button>
              <button
                onClick={handleNext}
                disabled={!blockComplete}
                className="flex items-center gap-2 h-9 px-5 rounded-xl font-semibold text-sm text-white transition-all hover:scale-[1.02] disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100"
                style={{
                  background: "linear-gradient(135deg, hsl(174,62%,29%), hsl(172,55%,20%))",
                  boxShadow: blockComplete ? "0 0 20px hsl(174 55% 39% / 0.25), 0 4px 20px hsl(174,55%,39%/0.35)" : undefined,
                }}
              >
                {isLast ? "Ver Resultado" : "Próximo"}
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {motivationalMsg && <MotivationalToast message={motivationalMsg} />}
      </AnimatePresence>
    </div>
  );
}
