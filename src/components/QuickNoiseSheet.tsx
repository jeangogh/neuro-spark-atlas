import { useState, useRef, useCallback, useEffect } from "react";
import { X, Check, Volume2 } from "lucide-react";
import { useAmbientSound, NOISE_OPTIONS, NATURE_OPTIONS, type NoiseType, type NatureType } from "@/contexts/AmbientSoundContext";

const QUICK_NOISE_TYPE_KEY = "quick_noise_type";
const QUICK_NOISE_VOL_KEY = "quick_noise_volume";

type QuickNoiseItem = {
  id: string;
  emoji: string;
  label: string;
  layer: "nature" | "noise";
  typeId: NatureType | NoiseType;
};

const QUICK_NOISE_LIST: QuickNoiseItem[] = [
  { id: "rain", emoji: "🌧️", label: "Chuva leve", layer: "nature", typeId: "rain" },
  { id: "ocean", emoji: "🌊", label: "Mar / Ondas", layer: "nature", typeId: "ocean" },
  { id: "forest", emoji: "🌿", label: "Floresta", layer: "nature", typeId: "forest" },
  { id: "fire", emoji: "🔥", label: "Lareira", layer: "nature", typeId: "fire" },
  { id: "wind", emoji: "💨", label: "Vento", layer: "nature", typeId: "wind" },
  { id: "agudo", emoji: "🤍", label: "Ruído branco", layer: "noise", typeId: "agudo" },
  { id: "medio", emoji: "🌀", label: "Ruído rosa", layer: "noise", typeId: "medio" },
  { id: "grave", emoji: "🟤", label: "Ruído marrom", layer: "noise", typeId: "grave" },
];

const loadSavedType = (): string => {
  try { return localStorage.getItem(QUICK_NOISE_TYPE_KEY) || "rain"; } catch { return "rain"; }
};
const loadSavedVol = (): number => {
  try { return parseInt(localStorage.getItem(QUICK_NOISE_VOL_KEY) || "40", 10); } catch { return 40; }
};

interface Props {
  open: boolean;
  onClose: () => void;
}

const QuickNoiseSheet = ({ open, onClose }: Props) => {
  const ambient = useAmbientSound();
  const [selected, setSelected] = useState<string>(loadSavedType);
  const [volume, setVolume] = useState(loadSavedVol);
  const [previewing, setPreviewing] = useState<string | null>(null);
  const previewTimerRef = useRef<number | null>(null);

  // Determine which item is actively playing in the ambient system
  const getActiveQuickId = (): string | null => {
    if (ambient.natureOn && ambient.nature) return ambient.nature;
    if (ambient.noiseOn && ambient.noise) return ambient.noise;
    return null;
  };

  const activeId = getActiveQuickId();

  const handlePreview = useCallback((item: QuickNoiseItem) => {
    if (previewTimerRef.current) clearTimeout(previewTimerRef.current);

    // Activate the sound temporarily
    if (item.layer === "nature") {
      ambient.setNature(item.typeId as NatureType);
      ambient.setNatureVol(volume);
      ambient.setNatureOn(true);
    } else {
      ambient.setNoise(item.typeId as NoiseType);
      ambient.setNoiseVol(volume);
      ambient.setNoiseOn(true);
    }
    setPreviewing(item.id);

    // Stop preview after 3 seconds (unless user confirms)
    previewTimerRef.current = window.setTimeout(() => {
      // Only stop if still previewing this sound
      setPreviewing((p) => {
        if (p === item.id) {
          if (item.layer === "nature") ambient.setNatureOn(false);
          else ambient.setNoiseOn(false);
        }
        return null;
      });
    }, 3000);
  }, [ambient, volume]);

  const handleSelect = (item: QuickNoiseItem) => {
    setSelected(item.id);
    localStorage.setItem(QUICK_NOISE_TYPE_KEY, item.id);
  };

  const handleActivate = () => {
    if (previewTimerRef.current) { clearTimeout(previewTimerRef.current); previewTimerRef.current = null; }
    setPreviewing(null);

    const item = QUICK_NOISE_LIST.find((n) => n.id === selected);
    if (!item) return;

    // Turn off the other layer to avoid conflicts
    if (item.layer === "nature") {
      ambient.setNoiseOn(false);
      ambient.setNature(item.typeId as NatureType);
      ambient.setNatureVol(volume);
      ambient.setNatureOn(true);
    } else {
      ambient.setNatureOn(false);
      ambient.setNoise(item.typeId as NoiseType);
      ambient.setNoiseVol(volume);
      ambient.setNoiseOn(true);
    }
    localStorage.setItem(QUICK_NOISE_VOL_KEY, String(volume));
    onClose();
  };

  useEffect(() => {
    return () => {
      if (previewTimerRef.current) clearTimeout(previewTimerRef.current);
    };
  }, []);

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-[70] bg-foreground/30" onClick={onClose} />

      <div
        className="fixed bottom-0 left-0 right-0 z-[71] bg-card shadow-lg animate-slide-up max-h-[80vh] overflow-y-auto"
        style={{ borderRadius: '21px 21px 0 0', paddingBottom: 'max(env(safe-area-inset-bottom, 21px), 21px)' }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between" style={{ padding: '8px 21px 13px' }}>
          <div>
            <h2 className="font-sans font-semibold text-foreground" style={{ fontSize: 17 }}>Ruído de Fundo</h2>
            <p className="font-sans text-muted-foreground" style={{ fontSize: 11, marginTop: 2 }}>
              Toque para ativar. Segure para escolher.
            </p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full">
            <X size={18} className="text-foreground/60" />
          </button>
        </div>

        {/* Noise list */}
        <div className="flex flex-wrap" style={{ padding: '0 21px', gap: 8 }}>
          {QUICK_NOISE_LIST.map((item) => {
            const isSelected = selected === item.id;
            const isActive = activeId === item.id;
            const isPreviewing = previewing === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item)}
                onDoubleClick={() => handlePreview(item)}
                className={`flex items-center border transition-all duration-200 active:scale-95 ${
                  isSelected
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card border-border text-foreground"
                }`}
                style={{
                  padding: '10px 14px',
                  borderRadius: 13,
                  gap: 8,
                  flex: '1 1 calc(50% - 4px)',
                  minWidth: 'calc(50% - 4px)',
                }}
              >
                <span style={{ fontSize: 18 }}>{item.emoji}</span>
                <span className="font-sans font-medium text-left flex-1" style={{ fontSize: 13 }}>{item.label}</span>
                {isActive && (
                  <Check size={14} className={isSelected ? "text-primary-foreground" : "text-primary"} />
                )}
                {isPreviewing && (
                  <Volume2 size={14} className={`animate-pulse ${isSelected ? "text-primary-foreground" : "text-primary"}`} />
                )}
              </button>
            );
          })}
        </div>

        {/* Volume slider */}
        <div style={{ padding: '21px 21px 0' }}>
          <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
            <span className="font-mono text-muted-foreground uppercase tracking-wider" style={{ fontSize: 10 }}>Volume</span>
            <span className="font-mono text-muted-foreground" style={{ fontSize: 11 }}>{volume}%</span>
          </div>
          <input
            type="range" min={0} max={100} value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="w-full h-1.5 appearance-none rounded-full outline-none cursor-pointer
              [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
              [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-sm"
            style={{
              background: `linear-gradient(to right, hsl(var(--primary)) ${volume}%, hsl(var(--border)) ${volume}%)`,
            }}
          />
        </div>

        {/* Activate button */}
        <div style={{ padding: '21px 21px 0' }}>
          <button
            onClick={handleActivate}
            className="w-full font-sans font-semibold bg-primary text-primary-foreground active:scale-[0.98] transition-transform"
            style={{ height: 48, borderRadius: 13, fontSize: 15 }}
          >
            Ativar agora
          </button>
        </div>
      </div>
    </>
  );
};

export default QuickNoiseSheet;
export { QUICK_NOISE_LIST, loadSavedType };
