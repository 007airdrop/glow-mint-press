/**
 * Tiny Web Audio synth — no asset downloads.
 * All sounds are short and royalty-free by construction.
 */
let ctx: AudioContext | null = null;
let muted = false;

function ac(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (muted) return null;
  if (!ctx) {
    try {
      const Ctor =
        (window as unknown as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext }).AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return null;
      ctx = new Ctor();
    } catch {
      return null;
    }
  }
  return ctx;
}

export function setMuted(v: boolean) { muted = v; }
export function isMuted() { return muted; }

function tone(freq: number, dur: number, type: OscillatorType = "sine", gain = 0.08, delay = 0) {
  const a = ac();
  if (!a) return;
  const start = a.currentTime + delay;
  const osc = a.createOscillator();
  const g = a.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  g.gain.setValueAtTime(0.0001, start);
  g.gain.exponentialRampToValueAtTime(gain, start + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  osc.connect(g).connect(a.destination);
  osc.start(start);
  osc.stop(start + dur + 0.02);
}

export function sfxClick() { tone(620, 0.06, "square", 0.04); }
export function sfxHeartbeat() {
  tone(70, 0.12, "sine", 0.12, 0);
  tone(60, 0.14, "sine", 0.10, 0.18);
}
export function sfxFlicker() { tone(180 + Math.random() * 120, 0.04, "sawtooth", 0.03); }

export function sfxRevealCommon() {
  tone(440, 0.18, "triangle", 0.08);
  tone(660, 0.22, "triangle", 0.06, 0.08);
}
export function sfxRevealUncommon() {
  tone(523, 0.18, "triangle", 0.08);
  tone(784, 0.22, "triangle", 0.07, 0.08);
}
export function sfxRevealRare() {
  tone(523, 0.16, "sine", 0.08);
  tone(784, 0.16, "sine", 0.08, 0.1);
  tone(1047, 0.28, "sine", 0.08, 0.22);
}
export function sfxRevealLegendary() {
  // Bass hit + ascending stinger
  tone(55, 0.5, "sawtooth", 0.18);
  tone(110, 0.5, "sine", 0.10, 0.02);
  tone(523, 0.18, "triangle", 0.09, 0.15);
  tone(659, 0.18, "triangle", 0.09, 0.28);
  tone(880, 0.28, "triangle", 0.10, 0.42);
  tone(1318, 0.45, "sine", 0.09, 0.58);
}
