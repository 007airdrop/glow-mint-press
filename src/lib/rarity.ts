export type Rarity = "Common" | "Uncommon" | "Rare" | "Legendary";

export const RARITY_WEIGHTS: Record<Rarity, number> = {
  Common: 50,
  Uncommon: 30,
  Rare: 15,
  Legendary: 5,
};

export const RARITY_TOKEN_ID: Record<Rarity, number> = {
  Common: 1,
  Uncommon: 2,
  Rare: 3,
  Legendary: 4,
};

export const RARITY_META: Record<
  Rarity,
  { name: string; tagline: string; color: string; glow: string; ring: string; emoji: string }
> = {
  Common: {
    name: "Pulse Shard",
    tagline: "A whisper from the chain.",
    color: "var(--color-common)",
    glow: "oklch(0.78 0.04 250 / 0.5)",
    ring: "ring-[color:var(--color-common)]",
    emoji: "◆",
  },
  Uncommon: {
    name: "Verdant Cipher",
    tagline: "Rare signal, calm energy.",
    color: "var(--color-uncommon)",
    glow: "oklch(0.78 0.18 145 / 0.55)",
    ring: "ring-[color:var(--color-uncommon)]",
    emoji: "✦",
  },
  Rare: {
    name: "Azure Relic",
    tagline: "Forged in deep blocks.",
    color: "var(--color-rare)",
    glow: "oklch(0.7 0.22 255 / 0.6)",
    ring: "ring-[color:var(--color-rare)]",
    emoji: "✺",
  },
  Legendary: {
    name: "Solar Sovereign",
    tagline: "One in twenty. Burn bright.",
    color: "var(--color-legendary)",
    glow: "oklch(0.82 0.2 80 / 0.75)",
    ring: "ring-[color:var(--color-legendary)]",
    emoji: "☀",
  },
};

export function rollRarity(seed?: number): Rarity {
  const r = (seed ?? Math.random()) * 100;
  let cum = 0;
  for (const k of Object.keys(RARITY_WEIGHTS) as Rarity[]) {
    cum += RARITY_WEIGHTS[k];
    if (r < cum) return k;
  }
  return "Common";
}
