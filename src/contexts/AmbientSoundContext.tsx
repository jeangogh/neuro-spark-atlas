import { createContext, useContext, useState, useRef, useCallback, useEffect, ReactNode } from "react";

// === Types ===
export type BinauralType = "delta" | "theta" | "alpha" | "beta" | "gamma" | null;
export type NoiseType = "grave" | "medio" | "agudo" | null;
export type NatureType = "ocean" | "rain" | "forest" | "wind" | "fire" | null;

export const BINAURAL_OPTIONS: { id: BinauralType; label: string; desc: string }[] = [
  { id: "delta", label: "Delta", desc: "Sono profundo e regeneração" },
  { id: "theta", label: "Theta", desc: "Criatividade e meditação" },
  { id: "alpha", label: "Alpha", desc: "Relaxamento e calma" },
  { id: "beta", label: "Beta", desc: "Foco e concentração" },
  { id: "gamma", label: "Gamma", desc: "Aprendizado e memória" },
];

export const NOISE_OPTIONS: { id: NoiseType; label: string }[] = [
  { id: "grave", label: "Grave" },
  { id: "medio", label: "Médio" },
  { id: "agudo", label: "Agudo" },
];

export const NATURE_OPTIONS: { id: NatureType; label: string; emoji: string }[] = [
  { id: "ocean", label: "Ondas do mar", emoji: "🌊" },
  { id: "rain", label: "Chuva", emoji: "🌧️" },
  { id: "forest", label: "Floresta", emoji: "🌿" },
  { id: "wind", label: "Vento", emoji: "💨" },
  { id: "fire", label: "Fogueira", emoji: "🔥" },
];

interface AmbientState {
  binaural: BinauralType;
  noise: NoiseType;
  nature: NatureType;
  binauralVol: number;
  noiseVol: number;
  natureVol: number;
  binauralOn: boolean;
  noiseOn: boolean;
  natureOn: boolean;
}

const STORAGE_KEY = "ambient-sound-config";

const DEFAULTS: AmbientState = {
  binaural: "alpha", noise: "grave", nature: "ocean",
  binauralVol: 30, noiseVol: 30, natureVol: 40,
  binauralOn: false, noiseOn: false, natureOn: false,
};

const loadState = (): AmbientState => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Migrate old grave/medio/agudo binaural to new types
      if (["grave", "medio", "agudo"].includes(parsed.binaural)) {
        parsed.binaural = "alpha";
      }
      return { ...DEFAULTS, ...parsed };
    }
  } catch {}
  return DEFAULTS;
};

const saveState = (s: AmbientState) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
};

// Scientific binaural beat frequencies: [carrier Hz, beat Hz]
const BINAURAL_FREQS: Record<string, [number, number]> = {
  delta: [150, 2],    // 0.5–4 Hz — deep sleep
  theta: [150, 6],    // 4–8 Hz — creativity, meditation
  alpha: [200, 10],   // 8–13 Hz — relaxation, calm focus
  beta: [200, 20],    // 13–30 Hz — active focus, concentration
  gamma: [300, 40],   // 30–100 Hz — learning, peak performance
};

const createSilentWavBlobUrl = () => {
  const sampleRate = 8000;
  const numSamples = sampleRate * 2;
  const dataSize = numSamples * 2;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);
  const ws = (offset: number, value: string) => {
    for (let i = 0; i < value.length; i++) view.setUint8(offset + i, value.charCodeAt(i));
  };
  ws(0, "RIFF"); view.setUint32(4, 36 + dataSize, true);
  ws(8, "WAVE"); ws(12, "fmt ");
  view.setUint32(16, 16, true); view.setUint16(20, 1, true);
  view.setUint16(22, 1, true); view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true); view.setUint16(32, 2, true);
  view.setUint16(34, 16, true); ws(36, "data"); view.setUint32(40, dataSize, true);
  return URL.createObjectURL(new Blob([buffer], { type: "audio/wav" }));
};

// === Context type ===
interface AmbientSoundContextType {
  binaural: BinauralType;
  noise: NoiseType;
  nature: NatureType;
  binauralVol: number;
  noiseVol: number;
  natureVol: number;
  binauralOn: boolean;
  noiseOn: boolean;
  natureOn: boolean;
  isActive: boolean;
  isOpen: boolean;
  setIsOpen: (v: boolean) => void;
  setBinauralOn: (on: boolean) => void;
  setNoiseOn: (on: boolean) => void;
  setNatureOn: (on: boolean) => void;
  setBinaural: (type: BinauralType) => void;
  setNoise: (type: NoiseType) => void;
  setNature: (type: NatureType) => void;
  setBinauralVol: (v: number) => void;
  setNoiseVol: (v: number) => void;
  setNatureVol: (v: number) => void;
  stopAll: () => void;
}

const AmbientSoundContext = createContext<AmbientSoundContextType | null>(null);

export const useAmbientSound = () => {
  const ctx = useContext(AmbientSoundContext);
  if (!ctx) throw new Error("useAmbientSound must be inside AmbientSoundProvider");
  return ctx;
};

export const AmbientSoundProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AmbientState>(loadState);
  const [isOpen, setIsOpen] = useState(false);

  const ctxRef = useRef<AudioContext | null>(null);
  const binauralNodesRef = useRef<{ osc1: OscillatorNode; osc2: OscillatorNode; gain: GainNode } | null>(null);
  const noiseNodesRef = useRef<{ source: AudioBufferSourceNode; gain: GainNode } | null>(null);
  const natureNodesRef = useRef<{ source: AudioBufferSourceNode; gain: GainNode } | null>(null);
  const keepAliveRef = useRef<HTMLAudioElement | null>(null);
  const keepAliveUrlRef = useRef<string | null>(null);
  const wasActiveBeforePauseRef = useRef({ binaural: false, noise: false, nature: false });

  const getCtx = useCallback(() => {
    if (!ctxRef.current || ctxRef.current.state === "closed") {
      ctxRef.current = new AudioContext();
    }
    if (ctxRef.current.state === "suspended") {
      ctxRef.current.resume().catch(() => {});
    }
    return ctxRef.current;
  }, []);

  // ---- Keep-alive ----
  const startKeepAlive = useCallback(() => {
    if (keepAliveRef.current) { keepAliveRef.current.play().catch(() => {}); return; }
    const audio = new Audio();
    const blobUrl = createSilentWavBlobUrl();
    keepAliveUrlRef.current = blobUrl;
    audio.src = blobUrl; audio.loop = true; audio.volume = 0.001;
    audio.preload = "auto"; audio.setAttribute("playsinline", "true");
    audio.play().catch(() => {});
    keepAliveRef.current = audio;
    if ("mediaSession" in navigator && !navigator.mediaSession.metadata) {
      navigator.mediaSession.metadata = new MediaMetadata({ title: "Som Ambiente", artist: "Gifted Lab" });
    }
  }, []);

  const stopKeepAlive = useCallback(() => {
    if (keepAliveRef.current) { keepAliveRef.current.pause(); keepAliveRef.current.src = ""; keepAliveRef.current = null; }
    if (keepAliveUrlRef.current) { URL.revokeObjectURL(keepAliveUrlRef.current); keepAliveUrlRef.current = null; }
  }, []);

  // ---- Noise buffer ----
  const createNoiseBuffer = useCallback((type: NoiseType) => {
    const ctx = getCtx();
    const len = ctx.sampleRate * 4;
    const buffer = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    if (type === "grave") {
      let last = 0;
      for (let i = 0; i < len; i++) { last = (last + 0.02 * data[i]) / 1.02; data[i] = last * 3.5; }
    } else if (type === "medio") {
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < len; i++) {
        const w = data[i];
        b0 = 0.99886 * b0 + w * 0.0555179;
        b1 = 0.99332 * b1 + w * 0.0750759;
        b2 = 0.969 * b2 + w * 0.153852;
        data[i] = (b0 + b1 + b2 + w * 0.5362) * 0.11;
      }
    }
    return buffer;
  }, [getCtx]);

  // ---- Nature sound buffer (procedural) ----
  const createNatureBuffer = useCallback((type: NatureType) => {
    const ctx = getCtx();
    const dur = 6; // longer loop for more natural feel
    const len = ctx.sampleRate * dur;
    const buffer = ctx.createBuffer(2, len, ctx.sampleRate);
    const L = buffer.getChannelData(0);
    const R = buffer.getChannelData(1);
    const sr = ctx.sampleRate;

    if (type === "ocean") {
      // Layered ocean: low rumble + surf wash cycles
      for (let i = 0; i < len; i++) {
        const t = i / sr;
        const wave = Math.sin(t * 0.4 * Math.PI * 2) * 0.5 + 0.5; // slow wash
        const noise = (Math.random() * 2 - 1);
        // Brown-ish noise shaped by wave envelope
        L[i] = noise * (0.15 + 0.35 * wave);
        R[i] = (Math.random() * 2 - 1) * (0.15 + 0.35 * Math.sin((t + 0.3) * 0.4 * Math.PI * 2) * 0.5 + 0.25);
      }
      // Low-pass filter effect
      let prevL = 0, prevR = 0;
      for (let i = 0; i < len; i++) {
        prevL = prevL * 0.96 + L[i] * 0.04; L[i] = prevL * 2.5;
        prevR = prevR * 0.96 + R[i] * 0.04; R[i] = prevR * 2.5;
      }
    } else if (type === "rain") {
      // Rain: white noise with slight low-pass + droplet texture
      for (let i = 0; i < len; i++) {
        L[i] = (Math.random() * 2 - 1) * 0.35;
        R[i] = (Math.random() * 2 - 1) * 0.35;
      }
      let pL = 0, pR = 0;
      for (let i = 0; i < len; i++) {
        pL = pL * 0.92 + L[i] * 0.08; L[i] = pL * 1.8;
        pR = pR * 0.92 + R[i] * 0.08; R[i] = pR * 1.8;
      }
    } else if (type === "forest") {
      // Forest: very quiet pink noise + occasional chirps
      for (let i = 0; i < len; i++) {
        const t = i / sr;
        const base = (Math.random() * 2 - 1) * 0.08;
        const chirp = Math.sin(t * 2200 + Math.sin(t * 7) * 500) * Math.max(0, Math.sin(t * 1.3) ** 20) * 0.15;
        const chirp2 = Math.sin(t * 3300 + Math.sin(t * 5) * 800) * Math.max(0, Math.sin(t * 0.7 + 2) ** 24) * 0.1;
        L[i] = base + chirp;
        R[i] = base * 0.9 + chirp2;
      }
      let pL = 0, pR = 0;
      for (let i = 0; i < len; i++) {
        pL = pL * 0.95 + L[i] * 0.05; L[i] = pL * 2;
        pR = pR * 0.95 + R[i] * 0.05; R[i] = pR * 2;
      }
    } else if (type === "wind") {
      // Wind: modulated brown noise
      for (let i = 0; i < len; i++) {
        const t = i / sr;
        const mod = 0.3 + 0.7 * (Math.sin(t * 0.3 * Math.PI * 2) * 0.5 + 0.5);
        L[i] = (Math.random() * 2 - 1) * mod * 0.3;
        R[i] = (Math.random() * 2 - 1) * mod * 0.3;
      }
      let pL = 0, pR = 0;
      for (let i = 0; i < len; i++) {
        pL = pL * 0.97 + L[i] * 0.03; L[i] = pL * 3;
        pR = pR * 0.97 + R[i] * 0.03; R[i] = pR * 3;
      }
    } else if (type === "fire") {
      // Fireplace: crackling noise
      for (let i = 0; i < len; i++) {
        const t = i / sr;
        const base = (Math.random() * 2 - 1) * 0.12;
        const crackle = Math.random() > 0.997 ? (Math.random() - 0.5) * 0.8 : 0;
        const rumble = Math.sin(t * 30) * 0.03;
        L[i] = base + crackle + rumble;
        R[i] = base * 0.95 + (Math.random() > 0.998 ? (Math.random() - 0.5) * 0.6 : 0) + rumble;
      }
      let pL = 0, pR = 0;
      for (let i = 0; i < len; i++) {
        pL = pL * 0.94 + L[i] * 0.06; L[i] = pL * 2;
        pR = pR * 0.94 + R[i] * 0.06; R[i] = pR * 2;
      }
    }
    return buffer;
  }, [getCtx]);

  // ---- Start / Stop Binaural ----
  const stopBinaural = useCallback(() => {
    const n = binauralNodesRef.current;
    if (n) { try { n.osc1.stop(); n.osc2.stop(); n.gain.disconnect(); } catch {} binauralNodesRef.current = null; }
  }, []);

  const startBinaural = useCallback((type: string, vol: number) => {
    stopBinaural();
    const freqs = BINAURAL_FREQS[type];
    if (!freqs) return;
    const ctx = getCtx();
    const [carrier, beat] = freqs;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime((vol / 100) * 0.3, ctx.currentTime + 1);
    gain.connect(ctx.destination);
    const osc1 = ctx.createOscillator(); osc1.frequency.value = carrier; osc1.type = "sine";
    const osc2 = ctx.createOscillator(); osc2.frequency.value = carrier + beat; osc2.type = "sine";
    const panL = ctx.createStereoPanner(); panL.pan.value = -1;
    const panR = ctx.createStereoPanner(); panR.pan.value = 1;
    osc1.connect(panL).connect(gain); osc2.connect(panR).connect(gain);
    osc1.start(); osc2.start();
    binauralNodesRef.current = { osc1, osc2, gain };
  }, [getCtx, stopBinaural]);

  // ---- Start / Stop Noise ----
  const stopNoise = useCallback(() => {
    const n = noiseNodesRef.current;
    if (n) { try { n.source.stop(); n.gain.disconnect(); } catch {} noiseNodesRef.current = null; }
  }, []);

  const startNoise = useCallback((type: NoiseType, vol: number) => {
    stopNoise();
    if (!type) return;
    const ctx = getCtx();
    const buffer = createNoiseBuffer(type);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime((vol / 100) * 0.4, ctx.currentTime + 1);
    gain.connect(ctx.destination);
    const source = ctx.createBufferSource(); source.buffer = buffer; source.loop = true;
    source.connect(gain); source.start();
    noiseNodesRef.current = { source, gain };
  }, [getCtx, createNoiseBuffer, stopNoise]);

  // ---- Start / Stop Nature ----
  const stopNature = useCallback(() => {
    const n = natureNodesRef.current;
    if (n) { try { n.source.stop(); n.gain.disconnect(); } catch {} natureNodesRef.current = null; }
  }, []);

  const startNature = useCallback((type: NatureType, vol: number) => {
    stopNature();
    if (!type) return;
    const ctx = getCtx();
    const buffer = createNatureBuffer(type);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime((vol / 100) * 0.5, ctx.currentTime + 1);
    gain.connect(ctx.destination);
    const source = ctx.createBufferSource(); source.buffer = buffer; source.loop = true;
    source.connect(gain); source.start();
    natureNodesRef.current = { source, gain };
  }, [getCtx, createNatureBuffer, stopNature]);

  // ---- Restore on foreground ----
  const restoreAmbientPlayback = useCallback(() => {
    const anyActive = state.binauralOn || state.noiseOn || state.natureOn;
    if (!anyActive) return;
    const ctx = getCtx();
    if (ctx.state === "suspended") ctx.resume().catch(() => {});
    startKeepAlive();
    if (state.binauralOn && state.binaural && !binauralNodesRef.current) startBinaural(state.binaural, state.binauralVol);
    if (state.noiseOn && state.noise && !noiseNodesRef.current) startNoise(state.noise, state.noiseVol);
    if (state.natureOn && state.nature && !natureNodesRef.current) startNature(state.nature, state.natureVol);
  }, [getCtx, startBinaural, startKeepAlive, startNoise, startNature, state]);

  // Sync audio with state
  useEffect(() => {
    saveState(state);
    const anyActive = state.binauralOn || state.noiseOn || state.natureOn;
    if (anyActive) startKeepAlive(); else stopKeepAlive();

    // Binaural
    if (state.binauralOn && state.binaural) {
      if (!binauralNodesRef.current) startBinaural(state.binaural, state.binauralVol);
      else {
        const ctx = ctxRef.current;
        if (ctx) binauralNodesRef.current.gain.gain.linearRampToValueAtTime((state.binauralVol / 100) * 0.3, ctx.currentTime + 0.1);
      }
    } else stopBinaural();

    // Noise
    if (state.noiseOn && state.noise) {
      if (!noiseNodesRef.current) startNoise(state.noise, state.noiseVol);
      else {
        const ctx = ctxRef.current;
        if (ctx) noiseNodesRef.current.gain.gain.linearRampToValueAtTime((state.noiseVol / 100) * 0.4, ctx.currentTime + 0.1);
      }
    } else stopNoise();

    // Nature
    if (state.natureOn && state.nature) {
      if (!natureNodesRef.current) startNature(state.nature, state.natureVol);
      else {
        const ctx = ctxRef.current;
        if (ctx) natureNodesRef.current.gain.gain.linearRampToValueAtTime((state.natureVol / 100) * 0.5, ctx.currentTime + 0.1);
      }
    } else stopNature();
  }, [state.binauralVol, state.noiseVol, state.natureVol, state.binaural, state.noise, state.nature, state.binauralOn, state.noiseOn, state.natureOn, startBinaural, startKeepAlive, startNoise, startNature, stopBinaural, stopKeepAlive, stopNoise, stopNature]);

  // Visibility / focus recovery
  useEffect(() => {
    const handleVisibility = () => { if (document.visibilityState === "visible") restoreAmbientPlayback(); };
    const handleFocus = () => restoreAmbientPlayback();
    window.addEventListener("focus", handleFocus);
    window.addEventListener("pageshow", handleFocus);
    window.addEventListener("resume", handleFocus as EventListener);
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("pageshow", handleFocus);
      window.removeEventListener("resume", handleFocus as EventListener);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [restoreAmbientPlayback]);

  // Listen for ambient-pause / ambient-resume
  useEffect(() => {
    const handlePause = () => {
      wasActiveBeforePauseRef.current = { binaural: state.binauralOn, noise: state.noiseOn, nature: state.natureOn };
      stopBinaural(); stopNoise(); stopNature(); stopKeepAlive();
    };
    const handleResume = () => {
      const { binaural, noise, nature } = wasActiveBeforePauseRef.current;
      if (!binaural && !noise && !nature) return;
      if (binaural && state.binauralOn && state.binaural) startBinaural(state.binaural, state.binauralVol);
      if (noise && state.noiseOn && state.noise) startNoise(state.noise, state.noiseVol);
      if (nature && state.natureOn && state.nature) startNature(state.nature, state.natureVol);
      if (binaural || noise || nature) startKeepAlive();
    };
    window.addEventListener("ambient-pause", handlePause);
    window.addEventListener("ambient-resume", handleResume);
    return () => { window.removeEventListener("ambient-pause", handlePause); window.removeEventListener("ambient-resume", handleResume); };
  }, [state, startBinaural, startNoise, startNature, startKeepAlive, stopBinaural, stopNoise, stopNature, stopKeepAlive]);

  // Cleanup
  useEffect(() => {
    return () => { stopBinaural(); stopNoise(); stopNature(); stopKeepAlive(); };
  }, [stopBinaural, stopNoise, stopNature, stopKeepAlive]);

  // Setters
  const setBinauralOn = useCallback((on: boolean) => { setState(s => ({ ...s, binauralOn: on })); if (!on) stopBinaural(); }, [stopBinaural]);
  const setNoiseOn = useCallback((on: boolean) => { setState(s => ({ ...s, noiseOn: on })); if (!on) stopNoise(); }, [stopNoise]);
  const setNatureOn = useCallback((on: boolean) => { setState(s => ({ ...s, natureOn: on })); if (!on) stopNature(); }, [stopNature]);
  const setBinaural = useCallback((type: BinauralType) => { setState(s => ({ ...s, binaural: type })); stopBinaural(); }, [stopBinaural]);
  const setNoise = useCallback((type: NoiseType) => { setState(s => ({ ...s, noise: type })); stopNoise(); }, [stopNoise]);
  const setNature = useCallback((type: NatureType) => { setState(s => ({ ...s, nature: type })); stopNature(); }, [stopNature]);
  const setBinauralVol = useCallback((v: number) => { setState(s => ({ ...s, binauralVol: v })); }, []);
  const setNoiseVol = useCallback((v: number) => { setState(s => ({ ...s, noiseVol: v })); }, []);
  const setNatureVol = useCallback((v: number) => { setState(s => ({ ...s, natureVol: v })); }, []);
  const stopAll = useCallback(() => {
    stopBinaural(); stopNoise(); stopNature(); stopKeepAlive();
    setState(s => ({ ...s, binauralOn: false, noiseOn: false, natureOn: false }));
  }, [stopBinaural, stopNoise, stopNature, stopKeepAlive]);

  const isActive = state.binauralOn || state.noiseOn || state.natureOn;

  return (
    <AmbientSoundContext.Provider value={{
      ...state, isActive, isOpen, setIsOpen,
      setBinauralOn, setNoiseOn, setNatureOn,
      setBinaural, setNoise, setNature,
      setBinauralVol, setNoiseVol, setNatureVol,
      stopAll,
    }}>
      {children}
    </AmbientSoundContext.Provider>
  );
};
