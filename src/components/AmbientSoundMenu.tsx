import { X } from "lucide-react";
import {
  useAmbientSound,
  BINAURAL_OPTIONS,
  NOISE_OPTIONS,
  NATURE_OPTIONS,
} from "@/contexts/AmbientSoundContext";

type AmbientSoundHook = ReturnType<typeof useAmbientSound>;

interface Props {
  ambient: AmbientSoundHook;
}

const Toggle = ({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) => (
  <button
    onClick={() => onChange(!on)}
    className="w-11 h-6 rounded-full transition-all duration-200 relative flex-shrink-0 bg-border"
    style={{ background: on ? "hsl(var(--primary))" : undefined }}
  >
    <div
      className="w-5 h-5 rounded-full bg-white shadow-sm absolute top-0.5 transition-all duration-200"
      style={{ left: on ? 22 : 2 }}
    />
  </button>
);

const pillActive = "bg-primary text-primary-foreground border-primary";
const pillInactive = "bg-card border-border text-foreground";

const SliderInput = ({ value, onChange, disabled }: { value: number; onChange: (v: number) => void; disabled: boolean }) => (
  <input
    type="range" min={0} max={100} value={value}
    onChange={(e) => onChange(Number(e.target.value))}
    disabled={disabled}
    className="w-full h-1.5 mt-3 appearance-none rounded-full outline-none cursor-pointer
      [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
      [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-sm"
    style={{
      background: `linear-gradient(to right, hsl(var(--primary)) ${value}%, hsl(var(--border)) ${value}%)`,
      opacity: disabled ? 0.3 : 1,
    }}
  />
);

const AmbientSoundMenu = ({ ambient }: Props) => {
  if (!ambient.isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-[60] bg-foreground/30" onClick={() => ambient.setIsOpen(false)} />

      <div className="fixed bottom-0 left-0 right-0 z-[61] bg-card rounded-t-2xl shadow-lg animate-slide-up max-h-[85vh] overflow-y-auto" style={{ paddingBottom: 34 }}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 sticky top-0 bg-card z-10">
          <h2 className="font-sans font-semibold text-base text-foreground">Som ambiente</h2>
          <button onClick={() => ambient.setIsOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full">
            <X size={18} className="text-foreground/60" />
          </button>
        </div>

        <div className="px-5 space-y-5">
          {/* ─── Binaural ─── */}
          <section>
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs uppercase tracking-wider text-foreground/40">Ondas Binaurais</span>
              <Toggle on={ambient.binauralOn} onChange={ambient.setBinauralOn} />
            </div>
            <div className="flex flex-wrap gap-2">
              {BINAURAL_OPTIONS.map((opt) => {
                const active = ambient.binaural === opt.id && ambient.binauralOn;
                const disabled = !ambient.binauralOn;
                return (
                  <button
                    key={opt.id}
                    onClick={() => ambient.setBinaural(opt.id)}
                    disabled={disabled}
                    className={`flex flex-col items-start border rounded-xl transition-all duration-200 active:scale-95 ${active ? pillActive : pillInactive}`}
                    style={{
                      padding: "8px 12px",
                      minWidth: "calc(50% - 4px)",
                      flex: "1 1 calc(50% - 4px)",
                      opacity: disabled ? 0.3 : 1,
                    }}
                  >
                    <span className="font-sans font-semibold" style={{ fontSize: 13 }}>{opt.label}</span>
                    <span className={`font-sans ${active ? "text-primary-foreground/70" : "text-muted-foreground"}`} style={{ fontSize: 10, lineHeight: 1.3 }}>
                      {opt.desc}
                    </span>
                  </button>
                );
              })}
            </div>
            <SliderInput value={ambient.binauralVol} onChange={ambient.setBinauralVol} disabled={!ambient.binauralOn} />
          </section>

          <div className="h-px bg-border" />

          {/* ─── Ruído ─── */}
          <section>
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs uppercase tracking-wider text-foreground/40">Ruído</span>
              <Toggle on={ambient.noiseOn} onChange={ambient.setNoiseOn} />
            </div>
            <div className="flex gap-2">
              {NOISE_OPTIONS.map((opt) => {
                const active = ambient.noise === opt.id && ambient.noiseOn;
                const disabled = !ambient.noiseOn;
                return (
                  <button
                    key={opt.id}
                    onClick={() => ambient.setNoise(opt.id)}
                    disabled={disabled}
                    className={`flex-1 py-2.5 rounded-full border text-sm font-sans font-medium transition-all duration-200 active:scale-95 ${active ? pillActive : pillInactive}`}
                    style={{ opacity: disabled ? 0.3 : 1 }}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
            <SliderInput value={ambient.noiseVol} onChange={ambient.setNoiseVol} disabled={!ambient.noiseOn} />
          </section>

          <div className="h-px bg-border" />

          {/* ─── Sons Naturais ─── */}
          <section>
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs uppercase tracking-wider text-foreground/40">Sons Naturais</span>
              <Toggle on={ambient.natureOn} onChange={ambient.setNatureOn} />
            </div>
            <div className="flex flex-wrap gap-2">
              {NATURE_OPTIONS.map((opt) => {
                const active = ambient.nature === opt.id && ambient.natureOn;
                const disabled = !ambient.natureOn;
                return (
                  <button
                    key={opt.id}
                    onClick={() => ambient.setNature(opt.id)}
                    disabled={disabled}
                    className={`flex items-center gap-2 border rounded-full font-sans font-medium transition-all duration-200 active:scale-95 ${active ? pillActive : pillInactive}`}
                    style={{
                      padding: "8px 14px",
                      fontSize: 13,
                      opacity: disabled ? 0.3 : 1,
                    }}
                  >
                    <span>{opt.emoji}</span>
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>
            <SliderInput value={ambient.natureVol} onChange={ambient.setNatureVol} disabled={!ambient.natureOn} />
          </section>
        </div>
      </div>
    </>
  );
};

export default AmbientSoundMenu;
