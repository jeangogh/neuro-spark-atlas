import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Play, Pause, Volume2 } from "lucide-react";
import { AUDIO_EPISODES } from "@/data/audioContent";
import { useQuota } from "@/hooks/useQuota";

/** Minimal markdown-to-JSX renderer for article content. */
function renderMarkdown(md: string): React.ReactNode[] {
  const blocks = md.split(/\n\n+/);
  return blocks.map((block, i) => {
    const trimmed = block.trim();
    if (!trimmed) return null;
    if (/^-{3,}$/.test(trimmed)) return <hr key={i} className="my-8 border-border" />;
    if (trimmed.startsWith("# ")) return <h1 key={i} className="font-display text-2xl sm:text-3xl font-bold text-foreground mt-8 mb-4 leading-tight">{inlineFormat(trimmed.slice(2))}</h1>;
    if (trimmed.startsWith("## ")) return <h2 key={i} className="font-display text-xl sm:text-2xl font-bold text-foreground mt-8 mb-3 leading-tight">{inlineFormat(trimmed.slice(3))}</h2>;
    if (trimmed.startsWith("### ")) return <h3 key={i} className="font-display text-lg sm:text-xl font-semibold text-foreground mt-6 mb-2 leading-snug">{inlineFormat(trimmed.slice(4))}</h3>;
    if (trimmed === "[breve pausa]" || trimmed === "[pausa]" || trimmed === "[pausa longa]" || trimmed === "[thoughtful]") {
      return <div key={i} className="flex items-center justify-center gap-2 my-8"><span className="w-1.5 h-1.5 rounded-full bg-primary/40" /><span className="w-1.5 h-1.5 rounded-full bg-primary/40" /><span className="w-1.5 h-1.5 rounded-full bg-primary/40" /></div>;
    }
    if (/^\*[^*]+\*$/.test(trimmed)) return <p key={i} className="text-[14px] sm:text-[15px] text-muted-foreground italic leading-relaxed my-4">{trimmed.slice(1, -1)}</p>;
    return <p key={i} className="text-[15px] sm:text-[16px] text-foreground/90 leading-[1.8] my-4">{inlineFormat(trimmed)}</p>;
  });
}

function inlineFormat(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*(.+?)\*\*|\*(.+?)\*|\[breve pausa\]|\[pausa longa\]|\[thoughtful\])/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) parts.push(text.slice(lastIndex, match.index));
    if (match[2]) parts.push(<strong key={match.index} className="font-semibold text-foreground">{match[2]}</strong>);
    else if (match[3]) parts.push(<em key={match.index} className="italic text-muted-foreground">{match[3]}</em>);
    else parts.push(<span key={match.index} className="inline-block mx-1 text-muted-foreground/50">...</span>);
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return parts.length > 0 ? parts : [text];
}

function formatTime(s: number): string {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

export default function AprenderReadPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { consume } = useQuota();

  const episode = useMemo(() => AUDIO_EPISODES.find((ep) => ep.id === id), [id]);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (id) {
      consume("textos", id);
      consume("audios", id);
    }
    window.scrollTo(0, 0);
  }, [id, consume]);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const togglePlay = () => {
    if (!episode?.audioUrl) return;
    if (!audioRef.current) {
      const audio = new Audio(episode.audioUrl);
      audio.addEventListener("timeupdate", () => setCurrentTime(audio.currentTime));
      audio.addEventListener("loadedmetadata", () => setDuration(audio.duration));
      audio.addEventListener("ended", () => { setPlaying(false); setCurrentTime(0); });
      audioRef.current = audio;
    }
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      audioRef.current.play().catch(() => {});
      setPlaying(true);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = val;
      setCurrentTime(val);
    }
  };

  if (!episode) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center px-5">
          <p className="text-muted-foreground mb-4">Conteudo nao encontrado.</p>
          <button onClick={() => navigate(-1)} className="text-primary text-sm font-medium hover:underline">Voltar</button>
        </div>
      </div>
    );
  }

  const rendered = renderMarkdown(episode.content);
  const hasAudio = !!episode.audioUrl;
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="min-h-screen bg-background" style={{ paddingBottom: hasAudio ? 100 : 16 }}>
      {/* Top bar */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="max-w-2xl mx-auto px-5 h-12 flex items-center">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-[13px] font-medium">Voltar</span>
          </button>
        </div>
      </div>

      {/* Article */}
      <motion.article initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="max-w-2xl mx-auto px-5 pt-8 pb-16">
        <header className="mb-8">
          <p className="text-primary text-[10px] font-semibold uppercase tracking-[0.18em] mb-3">Leitura + Audio</p>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground leading-tight mb-3">{episode.title}</h1>
          <p className="text-[14px] text-muted-foreground leading-relaxed">{episode.subtitle}</p>
          <div className="flex items-center gap-3 mt-3 text-[11px] text-muted-foreground">
            <span>{episode.duration} de audio</span>
            <span>·</span>
            <span>~{Math.max(1, Math.round(episode.content.length / 1000))} min leitura</span>
          </div>
        </header>
        <hr className="border-border mb-8" />
        <div>{rendered}</div>
      </motion.article>

      {/* Sticky audio player */}
      {hasAudio && (
        <div
          className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-t border-border"
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          {/* Progress bar */}
          <div className="w-full h-1 bg-muted">
            <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>

          <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
            {/* Play button */}
            <button
              onClick={togglePlay}
              className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 active:scale-95 transition-transform"
            >
              {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
            </button>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-foreground truncate">{episode.title}</p>
              <p className="text-[11px] text-muted-foreground">
                {formatTime(currentTime)} / {formatTime(duration || episode.durationSeconds)}
              </p>
            </div>

            {/* Volume indicator */}
            <Volume2 className="w-4 h-4 text-muted-foreground shrink-0" />
          </div>

          {/* Seek slider */}
          <div className="max-w-2xl mx-auto px-4 pb-2">
            <input
              type="range"
              min={0}
              max={duration || episode.durationSeconds}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-1 appearance-none rounded-full outline-none cursor-pointer
                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3
                [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
              style={{
                background: `linear-gradient(to right, hsl(var(--primary)) ${progress}%, hsl(var(--border)) ${progress}%)`,
              }}
            />
          </div>
        </div>
      )}

      {/* No audio fallback message */}
      {!hasAudio && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-t border-border" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
          <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0">
              <Volume2 className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-[13px] font-medium text-foreground">{episode.title}</p>
              <p className="text-[11px] text-muted-foreground">Audio em breve</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
