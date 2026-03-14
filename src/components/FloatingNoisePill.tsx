import { X, AudioLines } from "lucide-react";
import { useAmbientSound } from "@/contexts/AmbientSoundContext";
import { QUICK_NOISE_LIST } from "@/components/QuickNoiseSheet";

const getActiveLabel = (ambient: ReturnType<typeof useAmbientSound>): string | null => {
  if (ambient.natureOn && ambient.nature) {
    const item = QUICK_NOISE_LIST.find((n) => n.layer === "nature" && n.typeId === ambient.nature);
    return item ? `${item.emoji} ${item.label}` : null;
  }
  if (ambient.noiseOn && ambient.noise) {
    const item = QUICK_NOISE_LIST.find((n) => n.layer === "noise" && n.typeId === ambient.noise);
    return item ? `${item.emoji} ${item.label}` : null;
  }
  return null;
};

interface Props {
  onTap: () => void;
}

const FloatingNoisePill = ({ onTap }: Props) => {
  const ambient = useAmbientSound();

  // Only show when noise is active
  const label = getActiveLabel(ambient);
  if (!label) return null;

  const handleStop = (e: React.MouseEvent) => {
    e.stopPropagation();
    ambient.stopAll();
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 62,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 48,
      }}
    >
      <button
        onClick={onTap}
        className="flex items-center shadow-lg animate-fade-in active:scale-95 transition-transform"
        style={{
          gap: 8,
          padding: '8px 14px 8px 12px',
          borderRadius: 34,
          background: 'hsl(var(--card))',
          border: '1px solid hsl(var(--border))',
        }}
      >
        <AudioLines size={15} className="text-primary animate-pulse" />
        <span className="font-sans font-medium text-foreground" style={{ fontSize: 12 }}>
          {label} · ativo
        </span>
        <div
          onClick={handleStop}
          className="flex items-center justify-center rounded-full"
          style={{
            width: 22,
            height: 22,
            background: 'hsl(var(--border))',
            marginLeft: 4,
          }}
        >
          <X size={12} className="text-muted-foreground" />
        </div>
      </button>
    </div>
  );
};

export default FloatingNoisePill;
