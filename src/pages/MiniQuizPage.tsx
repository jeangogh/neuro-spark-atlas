import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const HOTMART_URL = "https://pay.hotmart.com/D104159427Y";

const QUESTIONS = [
  "Você sente que sua mente nunca para — mesmo quando quer descansar?",
  "Você percebe coisas que as outras pessoas parecem não notar (sons, emoções, padrões)?",
  "Você já se sentiu 'diferente' da maioria das pessoas ao seu redor, sem saber explicar por quê?",
  "Você se cobra mais do que qualquer pessoa já te cobrou?",
  "Você já ouviu que é 'intenso demais', 'sensível demais' ou 'complicado demais'?",
];

const SCALE_LABELS = ["Nunca", "Raramente", "Às vezes", "Frequentemente", "Sempre"];

type Phase = "intro" | "quiz" | "result";

function getResult(total: number): { level: string; label: string; color: string; message: string } {
  const pct = ((total - 5) / 20) * 100;
  if (pct < 40) return { level: "low", label: "Baixa", color: "#d4a574", message: "Seus traços aparecem de forma sutil. O rastreio completo pode revelar dimensões que você ainda não percebeu." };
  if (pct < 70) return { level: "mid", label: "Média", color: "#4a7a65", message: "Vários sinais estão presentes. O rastreio completo com 12 dimensões pode confirmar e detalhar seu perfil." };
  return { level: "high", label: "Alta", color: "#6dbf8b", message: "Seus traços são muito consistentes com superdotação. O rastreio completo vai mapear suas 12 dimensões em profundidade." };
}

export default function MiniQuizPage() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);

  const handleStart = useCallback(() => setPhase("quiz"), []);

  const handleAnswer = useCallback((value: number) => {
    const next = [...answers, value];
    setAnswers(next);
    if (next.length >= QUESTIONS.length) {
      setPhase("result");
    } else {
      setCurrent((c) => c + 1);
    }
  }, [answers]);

  const total = answers.reduce((a, b) => a + b, 0);
  const result = getResult(total);
  const pct = Math.round(((total - 5) / 20) * 100);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8"
      style={{ background: "#12110f", color: "#fafaf8", fontFamily: "'DM Sans', sans-serif" }}>

      <AnimatePresence mode="wait">
        {phase === "intro" && (
          <motion.div
            key="intro"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
            className="max-w-md w-full text-center space-y-8"
          >
            <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "2rem", lineHeight: 1.15, fontWeight: 600 }}>
              Será que o que você sente tem a ver com superdotação?
            </h1>
            <p style={{ color: "#a0a0a0", fontSize: "0.95rem" }}>
              5 perguntas. 2 minutos. Descubra se vale investigar.
            </p>
            <button
              onClick={handleStart}
              style={{
                background: "#4a7a65",
                color: "#fafaf8",
                border: "none",
                borderRadius: 14,
                padding: "14px 32px",
                fontSize: "1rem",
                fontWeight: 600,
                cursor: "pointer",
                width: "100%",
                maxWidth: 320,
              }}
            >
              Descobrir em 2 minutos
            </button>
          </motion.div>
        )}

        {phase === "quiz" && (
          <motion.div
            key={`q-${current}`}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35 }}
            className="max-w-md w-full space-y-6"
          >
            {/* Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs" style={{ fontFamily: "'DM Mono', monospace", color: "#a0a0a0" }}>
                <span>Pergunta {current + 1}/{QUESTIONS.length}</span>
                <span>{Math.round(((current) / QUESTIONS.length) * 100)}%</span>
              </div>
              <div style={{ background: "#2a2826", borderRadius: 14, height: 6, overflow: "hidden" }}>
                <motion.div
                  style={{ background: "#4a7a65", height: "100%", borderRadius: 14 }}
                  initial={{ width: `${((current) / QUESTIONS.length) * 100}%` }}
                  animate={{ width: `${((current + 1) / QUESTIONS.length) * 100}%` }}
                  transition={{ duration: 0.4 }}
                />
              </div>
            </div>

            {/* Question */}
            <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "1.5rem", lineHeight: 1.2, fontWeight: 500 }}>
              {QUESTIONS[current]}
            </h2>

            {/* Scale */}
            <div className="space-y-2">
              {SCALE_LABELS.map((label, i) => (
                <button
                  key={i}
                  onClick={() => handleAnswer(i + 1)}
                  style={{
                    display: "block",
                    width: "100%",
                    background: "#1e1d1b",
                    border: "1px solid #2a2826",
                    borderRadius: 14,
                    padding: "12px 16px",
                    color: "#fafaf8",
                    fontSize: "0.95rem",
                    textAlign: "left",
                    cursor: "pointer",
                    transition: "background 0.15s, border-color 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#2a2826";
                    e.currentTarget.style.borderColor = "#4a7a65";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "#1e1d1b";
                    e.currentTarget.style.borderColor = "#2a2826";
                  }}
                >
                  <span style={{ fontFamily: "'DM Mono', monospace", color: "#4a7a65", marginRight: 10, fontSize: "0.8rem" }}>
                    {i + 1}
                  </span>
                  {label}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {phase === "result" && (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="max-w-md w-full text-center space-y-6"
          >
            <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.75rem", color: "#a0a0a0", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Resultado
            </p>

            {/* Circular indicator */}
            <div className="flex justify-center">
              <div style={{ position: "relative", width: 140, height: 140 }}>
                <svg viewBox="0 0 140 140" width="140" height="140">
                  <circle cx="70" cy="70" r="60" fill="none" stroke="#2a2826" strokeWidth="8" />
                  <motion.circle
                    cx="70" cy="70" r="60"
                    fill="none"
                    stroke={result.color}
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 60}`}
                    initial={{ strokeDashoffset: 2 * Math.PI * 60 }}
                    animate={{ strokeDashoffset: 2 * Math.PI * 60 * (1 - pct / 100) }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    transform="rotate(-90 70 70)"
                  />
                </svg>
                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: "2rem", fontWeight: 700, color: result.color }}>{pct}%</span>
                  <span style={{ fontSize: "0.75rem", color: "#a0a0a0" }}>compatibilidade</span>
                </div>
              </div>
            </div>

            <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "1.75rem", fontWeight: 600, color: result.color }}>
              Compatibilidade {result.label}
            </h2>

            <p style={{ color: "#c0c0c0", fontSize: "0.95rem", lineHeight: 1.6 }}>
              {result.message}
            </p>

            <div style={{ background: "#1e1d1b", borderRadius: 14, padding: "16px 20px", border: "1px solid #2a2826" }}>
              <p style={{ fontSize: "0.85rem", color: "#d4a574", marginBottom: 4, fontWeight: 600 }}>
                🔬 Rastreio completo
              </p>
              <p style={{ fontSize: "0.8rem", color: "#a0a0a0" }}>
                12 dimensões · 64 perguntas · Relatório detalhado com perfil dimensional
              </p>
            </div>

            <a
              href={HOTMART_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-block",
                background: "#4a7a65",
                color: "#fafaf8",
                border: "none",
                borderRadius: 14,
                padding: "14px 32px",
                fontSize: "1rem",
                fontWeight: 600,
                textDecoration: "none",
                width: "100%",
                maxWidth: 320,
              }}
            >
              Fazer o rastreio completo →
            </a>

            <p style={{ fontSize: "0.7rem", color: "#666", marginTop: 8 }}>
              Este mini-rastreio não substitui avaliação profissional.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
