import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Zap, Heart, Sparkles, Target, Flame, Sprout, ChevronDown, Check, AlertTriangle, Compass, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface ProfileData {
  id: number;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  colorClass: string;
  borderClass: string;
  bgClass: string;
  synthesis: string;
  practice: string[];
  strengths: string[];
  warnings: string[];
  warningIntro?: string;
  direction: string;
}

const profiles: ProfileData[] = [
  {
    id: 1,
    title: "Explorador Cognitivo",
    subtitle: "indícios de AH/SD",
    icon: <Brain className="w-6 h-6" />,
    colorClass: "text-profile-1",
    borderClass: "border-profile-1",
    bgClass: "bg-profile-1/10",
    synthesis: "Seu padrão indica funcionamento cognitivo acima da média, com alta curiosidade, necessidade de profundidade e busca constante por sentido.",
    practice: [
      "Aprende rápido",
      "Se entedia com superficialidade",
      "Questiona autoridades e sistemas",
      "Sente que pensa diferente das pessoas",
    ],
    strengths: ["Raciocínio complexo", "Criatividade", "Visão sistêmica", "Autonomia intelectual"],
    warningIntro: "Pessoas com esse perfil muitas vezes:",
    warnings: [
      "Se sentem deslocadas",
      "Subestimam seu potencial",
      "Acumulam frustração por falta de desafios adequados",
    ],
    direction: "Você se beneficia de ambientes que estimulem seu intelecto, tragam profundidade real e conectem propósito e conhecimento.",
  },
  {
    id: 2,
    title: "Mente em Alta Rotação",
    subtitle: "indícios TDAH",
    icon: <Zap className="w-6 h-6" />,
    colorClass: "text-profile-2",
    borderClass: "border-profile-2",
    bgClass: "bg-profile-2/10",
    synthesis: "Seu padrão sugere um cérebro rápido, associativo e criativo, mas com desafios de regulação executiva.",
    practice: [
      "Tem muitas ideias simultâneas",
      "Começa projetos com entusiasmo",
      "Tem dificuldade em finalizar",
      "Alterna foco rapidamente",
    ],
    strengths: ["Criatividade", "Pensamento fora da caixa", "Energia mental elevada", "Capacidade de inovação"],
    warningIntro: "Sem estratégias adequadas, isso pode gerar:",
    warnings: ["Procrastinação", "Autocrítica excessiva", "Sensação de 'não render o que poderia'"],
    direction: "Estruturas externas e métodos de organização potencializam muito seu desempenho.",
  },
  {
    id: 3,
    title: "Sensível-Adaptativo",
    subtitle: "indícios trauma/ansiedade",
    icon: <Heart className="w-6 h-6" />,
    colorClass: "text-profile-3",
    borderClass: "border-profile-3",
    bgClass: "bg-profile-3/10",
    synthesis: "Seu padrão mostra alta sensibilidade ao ambiente e às relações, com forte sistema de alerta emocional.",
    practice: [
      "Percebe nuances emocionais dos outros",
      "Antecipa problemas",
      "Sente-se sobrecarregado com facilidade",
      "Precisa de segurança para se expressar",
    ],
    strengths: ["Empatia", "Leitura social", "Intuição", "Cuidado com os outros"],
    warningIntro: "Experiências passadas podem ter moldado respostas de proteção que hoje limitam seu potencial.",
    warnings: [],
    direction: "Ambientes seguros e processos de autocompreensão trazem grande liberação de energia emocional.",
  },
  {
    id: 4,
    title: "Dupla Excepcionalidade (2e)",
    subtitle: "AH/SD + ND",
    icon: <Sparkles className="w-6 h-6" />,
    colorClass: "text-profile-4",
    borderClass: "border-profile-4",
    bgClass: "bg-profile-4/10",
    synthesis: "Seu resultado sugere coexistência de alta capacidade cognitiva com desafios neurofuncionais.",
    practice: [
      "É brilhante em algumas áreas",
      "Tem dificuldade em outras básicas",
      "Sente-se 'contraditório'",
      "Oscila entre alto desempenho e bloqueios",
    ],
    strengths: ["Potencial intelectual elevado", "Originalidade", "Pensamento profundo"],
    warningIntro: "Sem entendimento adequado, esse perfil gera:",
    warnings: ["Frustração", "Baixa autoestima injustificada", "Sensação de não pertencimento"],
    direction: "Compreender seu funcionamento é chave para desbloquear seu potencial real.",
  },
  {
    id: 5,
    title: "Autodidata Estratégico",
    subtitle: "perfil mentoria/empresarial",
    icon: <Target className="w-6 h-6" />,
    colorClass: "text-profile-5",
    borderClass: "border-profile-5",
    bgClass: "bg-profile-5/10",
    synthesis: "Você tem autonomia intelectual, foco em resultados e busca soluções diretas.",
    practice: [
      "Prefere aprender sozinho",
      "Quer aplicar rápido",
      "Valoriza eficiência",
      "Evita conteúdos longos sem aplicação",
    ],
    strengths: ["Independência", "Visão estratégica", "Execução"],
    warningIntro: "",
    warnings: ["Pode pular etapas importantes por pressa ou excesso de autossuficiência."],
    direction: "Modelos práticos e orientação estratégica aceleram seus resultados.",
  },
  {
    id: 6,
    title: "Buscador de Transformação",
    subtitle: "perfil imersão",
    icon: <Flame className="w-6 h-6" />,
    colorClass: "text-profile-6",
    borderClass: "border-profile-6",
    bgClass: "bg-profile-6/10",
    synthesis: "Você está em momento de mudança e busca clareza interna.",
    practice: [
      "Sente que pode mais",
      "Quer desbloquear padrões",
      "Busca evolução pessoal",
    ],
    strengths: ["Abertura para crescimento", "Consciência emocional", "Motivação interna"],
    warningIntro: "",
    warnings: ["Sem direcionamento, pode consumir muito conteúdo sem transformação real."],
    direction: "Experiências intensivas de autodesenvolvimento trazem grandes ganhos.",
  },
  {
    id: 7,
    title: "Potencial em Consolidação",
    subtitle: "perfil produtos acessíveis",
    icon: <Sprout className="w-6 h-6" />,
    colorClass: "text-profile-7",
    borderClass: "border-profile-7",
    bgClass: "bg-profile-7/10",
    synthesis: "Você está construindo autoconhecimento e recursos internos.",
    practice: [
      "Momento de organização",
      "Clareza de metas",
      "Fortalecimento de base emocional e cognitiva",
    ],
    strengths: ["Abertura para aprender", "Desejo de evolução"],
    warnings: [],
    warningIntro: "",
    direction: "Pequenas mudanças consistentes geram grande impacto.",
  },
];

function ProfileCard({ profile, index }: { profile: ProfileData; index: number }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.5, ease: "easeOut" }}
    >
      <div
        className={`rounded-xl border-l-4 ${borderClass(profile.id)} bg-card shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden cursor-pointer`}
        onClick={() => setIsOpen(!isOpen)}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 md:p-6">
          <div className="flex items-center gap-4">
            <div className={`p-2.5 rounded-lg ${profile.bgClass} ${profile.colorClass}`}>
              {profile.icon}
            </div>
            <div>
              <h3 className="font-display text-lg md:text-xl font-semibold text-card-foreground">
                Perfil {profile.id} — {profile.title}
              </h3>
              <p className={`text-sm font-medium ${profile.colorClass}`}>({profile.subtitle})</p>
            </div>
          </div>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.3 }}
            className="text-muted-foreground"
          >
            <ChevronDown className="w-5 h-5" />
          </motion.div>
        </div>

        {/* Content */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
            >
              <div className="px-5 pb-6 md:px-6 space-y-5">
                {/* Síntese */}
                <div className={`p-4 rounded-lg ${profile.bgClass}`}>
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">Síntese</p>
                  <p className="text-card-foreground leading-relaxed">{profile.synthesis}</p>
                </div>

                {/* Na prática */}
                <div>
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Na prática</p>
                  <ul className="space-y-1.5">
                    {profile.practice.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-card-foreground">
                        <span className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 bg-muted-foreground/40`} />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Forças */}
                <div>
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Forças</p>
                  <div className="flex flex-wrap gap-2">
                    {profile.strengths.map((s, i) => (
                      <span key={i} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${profile.bgClass} ${profile.colorClass}`}>
                        <Check className="w-3.5 h-3.5" />
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Atenções */}
                {(profile.warnings.length > 0 || profile.warningIntro) && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Atenções</p>
                    {profile.warningIntro && <p className="text-card-foreground text-sm mb-2">{profile.warningIntro}</p>}
                    <ul className="space-y-1.5">
                      {profile.warnings.map((w, i) => (
                        <li key={i} className="flex items-start gap-2 text-card-foreground text-sm">
                          <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0 text-accent" />
                          {w}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Direcionamento */}
                <div className="border-t border-border pt-4">
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Compass className="w-4 h-4" /> Direcionamento
                  </p>
                  <p className="text-card-foreground leading-relaxed font-medium">{profile.direction}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function borderClass(id: number) {
  const map: Record<number, string> = {
    1: "border-profile-1",
    2: "border-profile-2",
    3: "border-profile-3",
    4: "border-profile-4",
    5: "border-profile-5",
    6: "border-profile-6",
    7: "border-profile-7",
  };
  return map[id] || "";
}

export default function ProfilesPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <header className="py-16 md:py-24 px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Brain className="w-4 h-4" />
            Mapeamento Neurocognitivo
          </div>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-4">
            Perfis Cognitivos
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-xl mx-auto mb-8">
            Descubra seu padrão de funcionamento mental e emocional. Cada perfil revela forças únicas e caminhos de desenvolvimento.
          </p>
          <Link to="/triagem">
            <Button size="lg" className="gap-2">
              Iniciar Triagem Neurofuncional <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </motion.div>
      </header>

      {/* Profiles */}
      <main className="max-w-3xl mx-auto px-4 pb-20 space-y-4">
        {profiles.map((profile, index) => (
          <ProfileCard key={profile.id} profile={profile} index={index} />
        ))}
      </main>
    </div>
  );
}
