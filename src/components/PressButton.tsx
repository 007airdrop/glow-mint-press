import { motion } from "framer-motion";

type Props = {
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  cooldownLabel?: string;
};

export function PressButton({ onPress, disabled, loading, cooldownLabel }: Props) {
  return (
    <div className="relative flex items-center justify-center py-12">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="size-72 rounded-full bg-brand opacity-30 blur-3xl animate-float" />
      </div>
      <motion.button
        onClick={onPress}
        disabled={disabled || loading}
        whileTap={{ scale: 0.93 }}
        whileHover={{ scale: disabled ? 1 : 1.04 }}
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
              <span className="text-sm opacity-80">Rolling…</span>
              <span className="text-3xl">✨</span>
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
