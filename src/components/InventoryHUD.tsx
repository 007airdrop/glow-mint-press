import { motion } from "framer-motion";

type Props = {
  total: number;
  legendary: number;
  opensLeft: number;
  pulse?: boolean;
};

export function InventoryHUD({ total, legendary, opensLeft, pulse }: Props) {
  return (
    <motion.div
      animate={pulse ? { scale: [1, 1.06, 1] } : {}}
      transition={{ duration: 0.45 }}
      className="glass-strong rounded-2xl px-4 py-3 w-full max-w-md"
    >
      <div className="text-[10px] uppercase tracking-[0.35em] opacity-60 mb-2 text-center">
        Inventory
      </div>
      <div className="grid grid-cols-3 gap-2 text-center">
        <Stat label="Total" value={total} />
        <Stat label="Legendary" value={legendary} accent="legendary" />
        <Stat label="Opens Left" value={opensLeft} accent={opensLeft === 0 ? "danger" : undefined} />
      </div>
    </motion.div>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: "legendary" | "danger";
}) {
  const color =
    accent === "legendary"
      ? "var(--color-legendary)"
      : accent === "danger"
      ? "oklch(0.7 0.2 25)"
      : undefined;
  return (
    <div>
      <div className="text-2xl font-bold font-mono" style={{ color }}>
        {value}
      </div>
      <div className="text-[10px] uppercase tracking-widest opacity-70 mt-0.5">{label}</div>
    </div>
  );
}
