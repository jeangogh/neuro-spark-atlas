import { usePreferences, ColorTheme, FontTheme } from "@/hooks/usePreferences";
import { motion } from "framer-motion";

/* ─── Color Themes ─── */
const COLOR_THEMES: { id: ColorTheme; label: string; dot: string; title: string }[] = [
  { id: "eclipse", label: "Eclipse", dot: "#4a7a65", title: "Bege · Branco · Verde" },
  { id: "amber",   label: "Amber",   dot: "#d4a574", title: "Bege quente · Dourado" },
  { id: "cinema",  label: "Cinema",  dot: "#5a9a7d", title: "Escuro · Verde · Gold" },
];

/* ─── Font Themes ─── */
const FONT_THEMES: { id: FontTheme; label: string; sample: string }[] = [
  { id: "playfair",    label: "Playfair",    sample: "Aa" },
  { id: "instrument",  label: "Instrument",  sample: "Aa" },
  { id: "cormorant",   label: "Cormorant",   sample: "Aa" },
  { id: "dm-serif",    label: "DM Serif",    sample: "Aa" },
];

const FONT_FAMILY_MAP: Record<FontTheme, string> = {
  playfair:   "'Playfair Display', Georgia, serif",
  instrument: "'Instrument Serif', Georgia, serif",
  cormorant:  "'Cormorant Garamond', Georgia, serif",
  "dm-serif": "'DM Serif Display', Georgia, serif",
  // Note: default display font is now Fraunces (set in CSS base)
};

export function ThemeSwitcher() {
  const { theme, font, setTheme, setFont } = usePreferences();

  return (
    <div className="flex flex-col gap-2 px-1">
      {/* Color row */}
      <div className="flex items-center gap-1.5">
        {COLOR_THEMES.map((t) => (
          <motion.button
            key={t.id}
            onClick={() => setTheme(t.id)}
            title={t.title}
            whileTap={{ scale: 0.9 }}
            className="relative flex flex-col items-center gap-0.5 group"
          >
            <span
              className="block w-5 h-5 rounded-full border-2 transition-all"
              style={{
                backgroundColor: t.dot,
                borderColor: theme === t.id ? t.dot : "hsl(var(--border))",
                boxShadow: theme === t.id ? `0 0 8px ${t.dot}88` : "none",
                transform: theme === t.id ? "scale(1.15)" : "scale(1)",
              }}
            />
            <span className="text-[9px] text-muted-foreground group-hover:text-foreground transition-colors leading-none">
              {t.label}
            </span>
          </motion.button>
        ))}
      </div>

      {/* Font row */}
      <div className="flex items-center gap-1.5">
        {FONT_THEMES.map((f) => (
          <motion.button
            key={f.id}
            onClick={() => setFont(f.id)}
            title={f.label}
            whileTap={{ scale: 0.9 }}
            className="relative flex flex-col items-center gap-0.5 group"
          >
            <span
              className="block w-5 h-5 rounded-sm border-2 transition-all flex items-center justify-center text-[10px]"
              style={{
                fontFamily: FONT_FAMILY_MAP[f.id],
                borderColor: font === f.id ? "hsl(var(--primary))" : "hsl(var(--border))",
                color: font === f.id ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))",
                boxShadow: font === f.id ? "0 0 6px hsl(var(--primary) / 0.4)" : "none",
                background: font === f.id ? "hsl(var(--primary) / 0.08)" : "transparent",
                transform: font === f.id ? "scale(1.15)" : "scale(1)",
              }}
            >
              {f.sample}
            </span>
            <span className="text-[9px] text-muted-foreground group-hover:text-foreground transition-colors leading-none">
              {f.label}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
