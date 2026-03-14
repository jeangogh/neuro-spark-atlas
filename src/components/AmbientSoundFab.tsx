import { AudioLines } from "lucide-react";
import { useAmbientSound } from "@/contexts/AmbientSoundContext";
import AmbientSoundMenu from "@/components/AmbientSoundMenu";

const AmbientSoundFab = () => {
  const ambient = useAmbientSound();

  return (
    <>
      <button
        onClick={() => ambient.setIsOpen(true)}
        className="fixed z-[50] flex items-center justify-center rounded-full shadow-lg transition-all duration-300 active:scale-95"
        style={{
          bottom: 100,
          right: 16,
          width: 52,
          height: 52,
          background: ambient.isActive ? "hsl(var(--primary))" : "hsl(var(--card))",
          border: ambient.isActive ? "none" : "1px solid hsl(var(--border))",
        }}
        aria-label="Som ambiente"
      >
        <AudioLines
          size={22}
          style={{ color: ambient.isActive ? "hsl(var(--primary-foreground))" : "hsl(var(--muted-foreground))" }}
        />
        {ambient.isActive && (
          <span
            className="absolute rounded-full bg-accent"
            style={{ width: 8, height: 8, top: 10, right: 10 }}
          />
        )}
      </button>
      <AmbientSoundMenu ambient={ambient} />
    </>
  );
};

export default AmbientSoundFab;
