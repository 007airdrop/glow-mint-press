import { AnimatePresence, motion } from "framer-motion";
import type { Rarity } from "@/lib/rarity";
import { SUPPLY_CAPS, getMintedCounts } from "@/lib/supply";
import { RARITY_META } from "@/lib/rarity";

const ORDER: Rarity[] = ["Common", "Uncommon", "Rare", "Legendary"];

export function SupplyStrip() {
  const minted = getMintedCounts();
  return (
    <div className="grid grid-cols-4 gap-2 w-full max-w-md">
      {ORDER.map((r) => {
        const left = SUPPLY_CAPS[r] - minted[r];
        const pct = (minted[r] / SUPPLY_CAPS[r]) * 100;
        const out = left === 0;
        const m = RARITY_META[r];
        return (
          <div key={r} className="glass rounded-xl p-2 text-center relative overflow-hidden">
            <div className="text-lg" style={{ color: m.color }}>
              {m.emoji}
            </div>
            <div className="text-[10px] uppercase tracking-wider opacity-70 mt-0.5">{r}</div>
            <div className="text-[11px] font-mono mt-0.5" style={{ color: m.color }}>
              {out ? "0" : left} / {SUPPLY_CAPS[r]}
            </div>
            <div className="h-1 bg-white/10 rounded-full mt-1 overflow-hidden">
              <div
                className="h-full transition-all"
                style={{ width: `${pct}%`, background: m.color }}
              />
            </div>
            {out && (
              <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                <span className="text-[10px] font-bold tracking-widest text-red-400">SOLD OUT</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function ExtinctBanner({ rarity, onClose }: { rarity: Rarity | null; onClose: () => void }) {
  return (
    <AnimatePresence>
      {rarity && (
        <motion.div
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -80, opacity: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 18 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-40 glass-strong rounded-full px-5 py-2.5 flex items-center gap-3 shadow-2xl"
          style={{ borderColor: RARITY_META[rarity].color }}
        >
          <span className="text-lg" style={{ color: RARITY_META[rarity].color }}>
            {RARITY_META[rarity].emoji}
          </span>
          <span className="text-xs font-bold tracking-[0.25em] uppercase">
            {rarity} Class Extinct
          </span>
          <button onClick={onClose} className="text-xs opacity-60 hover:opacity-100">
            ✕
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
