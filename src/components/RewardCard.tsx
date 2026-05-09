import { RARITY_META, type Rarity } from "@/lib/rarity";
import { motion } from "framer-motion";

export function RewardCard({
  rarity,
  index = 0,
  size = "md",
}: {
  rarity: Rarity;
  index?: number;
  size?: "sm" | "md" | "lg";
}) {
  const m = RARITY_META[rarity];
  const dim =
    size === "lg" ? "size-72" : size === "sm" ? "size-28" : "size-44";
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.04, type: "spring", stiffness: 220, damping: 22 }}
      className={`glass relative ${dim} rounded-3xl overflow-hidden flex flex-col items-center justify-center`}
      style={{ boxShadow: `0 20px 60px -20px ${m.glow}` }}
    >
      <div
        className="absolute inset-0 opacity-50"
        style={{
          background: `radial-gradient(circle at 50% 30%, ${m.glow}, transparent 65%)`,
        }}
      />
      <div className="absolute inset-0 shimmer opacity-30 pointer-events-none" />
      <div
        className="relative z-10 text-6xl mb-2 drop-shadow-[0_0_12px_currentColor]"
        style={{ color: m.color }}
      >
        {m.emoji}
      </div>
      <div className="relative z-10 text-center px-3">
        <div className="text-xs uppercase tracking-[0.25em] opacity-70" style={{ color: m.color }}>
          {rarity}
        </div>
        {size !== "sm" && (
          <div className="font-display font-bold text-lg mt-1">{m.name}</div>
        )}
      </div>
    </motion.div>
  );
}
