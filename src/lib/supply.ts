import type { Rarity } from "./rarity";

/** Hard caps — mirrors the on-chain MysticCrateCapped contract. */
export const SUPPLY_CAPS: Record<Rarity, number> = {
  Common: 1000,
  Uncommon: 500,
  Rare: 150,
  Legendary: 20,
};

/** Daily opens per wallet (UI cap; contract enforces real cooldown). */
export const DAILY_OPENS = 10;

const KEY_MINTED = "pts:supply:minted";
const KEY_DAILY = (addr: string, day: string) =>
  `pts:daily:${addr.toLowerCase()}:${day}`;

type MintedMap = Record<Rarity, number>;
const EMPTY: MintedMap = { Common: 0, Uncommon: 0, Rare: 0, Legendary: 0 };

function read(): MintedMap {
  if (typeof window === "undefined") return { ...EMPTY };
  try {
    const v = localStorage.getItem(KEY_MINTED);
    return v ? { ...EMPTY, ...(JSON.parse(v) as MintedMap) } : { ...EMPTY };
  } catch {
    return { ...EMPTY };
  }
}
function write(m: MintedMap) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY_MINTED, JSON.stringify(m));
  } catch {}
}

export function getMintedCounts(): MintedMap {
  return read();
}

export function remaining(rarity: Rarity): number {
  return Math.max(0, SUPPLY_CAPS[rarity] - read()[rarity]);
}

export function isSoldOut(rarity: Rarity): boolean {
  return remaining(rarity) === 0;
}

/** Returns the serial assigned to this mint (1-indexed). */
export function consumeSerial(rarity: Rarity): number {
  const m = read();
  m[rarity] = Math.min(SUPPLY_CAPS[rarity], m[rarity] + 1);
  write(m);
  return m[rarity];
}

const todayKey = () => new Date().toISOString().slice(0, 10);

export function getOpensLeft(addr: string): number {
  if (!addr || typeof window === "undefined") return DAILY_OPENS;
  try {
    const v = localStorage.getItem(KEY_DAILY(addr, todayKey()));
    const used = v ? Number(v) : 0;
    return Math.max(0, DAILY_OPENS - used);
  } catch {
    return DAILY_OPENS;
  }
}

export function consumeDailyOpen(addr: string) {
  if (!addr || typeof window === "undefined") return;
  const k = KEY_DAILY(addr, todayKey());
  try {
    const used = Number(localStorage.getItem(k) ?? 0) + 1;
    localStorage.setItem(k, String(used));
  } catch {}
}
