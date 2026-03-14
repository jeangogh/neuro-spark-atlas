import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { AUDIO_EPISODES } from "@/data/audioContent";
import { useQuota } from "@/hooks/useQuota";

/** Minimal markdown-to-JSX renderer for article content. */
function renderMarkdown(md: string): React.ReactNode[] {
  const blocks = md.split(/\n\n+/);
  return blocks.map((block, i) => {
    const trimmed = block.trim();
    if (!trimmed) return null;

    // Horizontal rule
    if (/^-{3,}$/.test(trimmed)) {
      return <hr key={i} className="my-8 border-border" />;
    }

    // H1
    if (trimmed.startsWith("# ")) {
      return (
        <h1 key={i} className="font-display text-2xl sm:text-3xl font-bold text-foreground mt-8 mb-4 leading-tight">
          {inlineFormat(trimmed.slice(2))}
        </h1>
      );
    }

    // H2
    if (trimmed.startsWith("## ")) {
      return (
        <h2 key={i} className="font-display text-xl sm:text-2xl font-bold text-foreground mt-8 mb-3 leading-tight">
          {inlineFormat(trimmed.slice(3))}
        </h2>
      );
    }

    // H3
    if (trimmed.startsWith("### ")) {
      return (
        <h3 key={i} className="font-display text-lg sm:text-xl font-semibold text-foreground mt-6 mb-2 leading-snug">
          {inlineFormat(trimmed.slice(4))}
        </h3>
      );
    }

    // Visual break marker
    if (trimmed === "[breve pausa]" || trimmed === "[pausa]") {
      return (
        <div key={i} className="flex items-center justify-center gap-2 my-8">
          <span className="w-1.5 h-1.5 rounded-full bg-primary/40" />
          <span className="w-1.5 h-1.5 rounded-full bg-primary/40" />
          <span className="w-1.5 h-1.5 rounded-full bg-primary/40" />
        </div>
      );
    }

    // Italic block (single line starting with *)
    if (/^\*[^*]+\*$/.test(trimmed)) {
      return (
        <p key={i} className="text-[14px] sm:text-[15px] text-muted-foreground italic leading-relaxed my-4">
          {trimmed.slice(1, -1)}
        </p>
      );
    }

    // Regular paragraph
    return (
      <p key={i} className="text-[15px] sm:text-[16px] text-foreground/90 leading-[1.8] my-4">
        {inlineFormat(trimmed)}
      </p>
    );
  });
}

/** Handle inline bold, italic, and visual break markers. */
function inlineFormat(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  // Match **bold**, *italic*, and [breve pausa]
  const regex = /(\*\*(.+?)\*\*|\*(.+?)\*|\[breve pausa\])/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    if (match[2]) {
      // bold
      parts.push(
        <strong key={match.index} className="font-semibold text-foreground">
          {match[2]}
        </strong>
      );
    } else if (match[3]) {
      // italic
      parts.push(
        <em key={match.index} className="italic text-muted-foreground">
          {match[3]}
        </em>
      );
    } else if (match[0] === "[breve pausa]") {
      parts.push(
        <span key={match.index} className="inline-block mx-1 text-muted-foreground/50">
          ...
        </span>
      );
    }
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : [text];
}

export default function AprenderReadPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { consume } = useQuota();

  const episode = useMemo(
    () => AUDIO_EPISODES.find((ep) => ep.id === id),
    [id]
  );

  useEffect(() => {
    if (id) {
      consume("textos", id);
    }
    window.scrollTo(0, 0);
  }, [id, consume]);

  if (!episode) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center px-5">
          <p className="text-muted-foreground mb-4">Texto nao encontrado.</p>
          <button
            onClick={() => navigate("/aprender")}
            className="text-primary text-sm font-medium hover:underline"
          >
            Voltar para Aprender
          </button>
        </div>
      </div>
    );
  }

  const rendered = renderMarkdown(episode.content);

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="max-w-2xl mx-auto px-5 h-12 flex items-center">
          <button
            onClick={() => navigate("/aprender")}
            className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-[13px] font-medium">Voltar</span>
          </button>
        </div>
      </div>

      {/* Article */}
      <motion.article
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-2xl mx-auto px-5 pt-8 pb-16"
      >
        {/* Article header */}
        <header className="mb-8">
          <p className="text-primary text-[10px] font-semibold uppercase tracking-[0.18em] mb-3">
            Leitura
          </p>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground leading-tight mb-3">
            {episode.title}
          </h1>
          <p className="text-[14px] text-muted-foreground leading-relaxed">
            {episode.subtitle}
          </p>
        </header>

        <hr className="border-border mb-8" />

        {/* Content */}
        <div>{rendered}</div>
      </motion.article>
    </div>
  );
}
