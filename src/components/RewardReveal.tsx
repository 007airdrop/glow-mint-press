import { useEffect } from "react";
import confetti from "canvas-confetti";
import { AnimatePresence, motion } from "framer-motion";
import { RARITY_META, type Rarity } from "@/lib/rarity";
import { RewardCard } from "./RewardCard";
import { ShareButton } from "./ShareButton";

export function RewardReveal({
  rarity,
  onClose,
}: {
  rarity: Rarity | null;
  onClose: () => void;
}) {
  useEffect(() => {
    if (rarity === "Legendary") {
      const fire = (particleRatio: number, opts: confetti.Options) => {
        confetti({
          origin: { y: 0.6 },
          particleCount: Math.floor(220 * particleRatio),
          colors: ["#fbbf24", "#a855f7", "#3b82f6", "#f97316"],
          ...opts,
        });
      };
      fire(0.25, { spread: 26, startVelocity: 55 });
      fire(0.2, { spread: 60 });
      fire(0.35, { spread: 100, decay: 0.91, scalar: 0.9 });
      fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
      fire(0.1, { spread: 120, startVelocity: 45 });
    } else if (rarity === "Rare") {
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 }, colors: ["#3b82f6", "#a855f7"] });
    }
  }, [rarity]);

  return (
    <AnimatePresence>
      {rarity && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.6, y: 30 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", stiffness: 240, damping: 20 }}
            className="glass-strong rounded-[2rem] p-8 max-w-sm w-full flex flex-col items-center gap-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-xs uppercase tracking-[0.4em] opacity-70">You received</div>
            <RewardCard rarity={rarity} size="lg" />
            <p className="text-center text-sm text-muted-foreground italic">
              {RARITY_META[rarity].tagline}
            </p>
            <div className="flex flex-col gap-2 w-full">
              <ShareButton rarity={rarity} />
              <button
                onClick={onClose}
                className="glass rounded-full py-3 text-sm font-medium hover:bg-white/10 transition"
              >
                Continue
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
