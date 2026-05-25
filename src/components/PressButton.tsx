import { motion } from "framer-motion";
import { useEffect } from "react";
import { sfxClick, sfxFlicker, sfxHeartbeat } from "@/lib/sound";

type Props = {
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  cooldownLabel?: string;
};

export function PressButton({ onPress, disabled, loading, cooldownLabel }: Props) {
  // While loading, fire heartbeat + flicker SFX in waves
  useEffect(() => {
    if (!loading) return;
    let cancelled = false;
    sfxClick();
    const beats = [0, 700, 1300, 1800, 2200];
    beats.forEach((t) => setTimeout(() => !cancelled && sfxHeartbeat(), t));
    const flickerInt = setInterval(() => !cancelled && sfxFlicker(), 140);
    return () => {
      cancelled = true;
      clearInterval(flickerInt);
    };
  }, [loading]);

  return (
    <div className="relative flex items-center justify-center py-12">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.div
          animate={loading ? { opacity: [0.3, 0.7, 0.3] } : { opacity: 0.3 }}
          transition={{ duration: 0.4, repeat: loading ? Infinity : 0 }}
          className="size-72 rounded-full bg-brand blur-3xl animate-float"
        />
      </div>
      <motion.button
        onClick={() => {
          sfxClick();
          onPress();
        }}
        disabled={disabled || loading}
        whileTap={{ scale: 0.93 }}
        whileHover={{ scale: disabled ? 1 : 1.04 }}
        animate={
          loading
            ? {
                x: [0, -3, 4, -3, 2, -2, 0],
                filter: [
                  "brightness(1)",
                  "brightness(1.6)",
                  "brightness(0.7)",
                  "brightness(1.4)",
                  "brightness(1)",
                ],
              }
            : {}
        }
        transition={loading ? { duration: 0.35, repeat: Infinity } : {}}
        className="relative size-56 rounded-full bg-brand text-primary-foreground font-bold text-2xl tracking-wide animate-pulse-glow disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          boxShadow: "0 0 80px 10px var(--glow-1), 0 0 160px 30px var(--glow-2)",
        }}
      >
        <span className="absolute inset-0 rounded-full ring-1 ring-white/30" />
        <span className="absolute inset-2 rounded-full ring-1 ring-white/15" />
        <span className="relative z-10 flex flex-col items-center gap-1">
          {loading ? (
            <>
              <motion.span
                animate={{ opacity: [1, 0.2, 1] }}
                transition={{ duration: 0.25, repeat: Infinity }}
                className="text-xs uppercase tracking-[0.4em]"
              >
                Decoding
              </motion.span>
              <span className="text-3xl font-mono">▓▒░</span>
            </>
          ) : cooldownLabel ? (
            <>
              <span className="text-xs uppercase opacity-80 tracking-widest">Cooldown</span>
              <span className="text-2xl font-mono">{cooldownLabel}</span>
            </>
          ) : (
            <>
              <span className="text-xs uppercase opacity-80 tracking-[0.3em]">Press</span>
              <span className="text-3xl">to Start</span>
            </>
          )}
        </span>
      </motion.button>
    </div>
  );
}
