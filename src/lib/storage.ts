import type { Rarity } from "./rarity";

export type RewardEntry = { id: string; rarity: Rarity; mintedAt: number; txHash?: string };
export type LeaderEntry = { address: string; score: number; legendary: number; total: number };

const KEYS = {
  rewards: (addr: string) => `pts:rewards:${addr.toLowerCase()}`,
  streak: (addr: string) => `pts:streak:${addr.toLowerCase()}`,
  referrer: "pts:referrer",
  referrals: (addr: string) => `pts:referrals:${addr.toLowerCase()}`,
  leaderboard: "pts:leaderboard",
  lastMint: (addr: string) => `pts:lastmint:${addr.toLowerCase()}`,
};

const RARITY_SCORE: Record<Rarity, number> = { Common: 1, Uncommon: 3, Rare: 8, Legendary: 25 };

const safeGet = <T>(k: string, fallback: T): T => {
  if (typeof window === "undefined") return fallback;
  try {
    const v = localStorage.getItem(k);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
};
const safeSet = (k: string, v: unknown) => {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(k, JSON.stringify(v)); } catch {}
};

export function getRewards(addr: string): RewardEntry[] {
  return safeGet<RewardEntry[]>(KEYS.rewards(addr), []);
}
export function addReward(addr: string, entry: RewardEntry) {
  const list = getRewards(addr);
  list.unshift(entry);
  safeSet(KEYS.rewards(addr), list);
  bumpLeaderboard(addr, entry.rarity);
}

export function getLastMint(addr: string): number {
  return safeGet<number>(KEYS.lastMint(addr), 0);
}
export function setLastMint(addr: string, ts: number) {
  safeSet(KEYS.lastMint(addr), ts);
}

export type Streak = { count: number; lastDay: string };
const dayKey = (d = new Date()) => d.toISOString().slice(0, 10);
export function getStreak(addr: string): Streak {
  return safeGet<Streak>(KEYS.streak(addr), { count: 0, lastDay: "" });
}
export function tickStreak(addr: string): Streak {
  const today = dayKey();
  const cur = getStreak(addr);
  if (cur.lastDay === today) return cur;
  const yest = dayKey(new Date(Date.now() - 86_400_000));
  const next: Streak = {
    count: cur.lastDay === yest ? cur.count + 1 : 1,
    lastDay: today,
  };
  safeSet(KEYS.streak(addr), next);
  return next;
}

export function setReferrer(ref: string) {
  if (!ref) return;
  if (safeGet<string>(KEYS.referrer, "")) return;
  safeSet(KEYS.referrer, ref);
}
export function getReferrer(): string {
  return safeGet<string>(KEYS.referrer, "");
}
export function creditReferral(addr: string) {
  const list = safeGet<string[]>(KEYS.referrals(addr), []);
  if (!list.includes(addr)) {
    list.push(addr);
    safeSet(KEYS.referrals(addr), list);
  }
}
export function getReferralCount(addr: string): number {
  return safeGet<string[]>(KEYS.referrals(addr), []).length;
}

function bumpLeaderboard(addr: string, rarity: Rarity) {
  const board = safeGet<Record<string, LeaderEntry>>(KEYS.leaderboard, {});
  const key = addr.toLowerCase();
  const cur = board[key] ?? { address: key, score: 0, legendary: 0, total: 0 };
  cur.score += RARITY_SCORE[rarity];
  cur.total += 1;
  if (rarity === "Legendary") cur.legendary += 1;
  board[key] = cur;
  safeSet(KEYS.leaderboard, board);
}
export function getLeaderboard(): LeaderEntry[] {
  const board = safeGet<Record<string, LeaderEntry>>(KEYS.leaderboard, {});
  return Object.values(board).sort((a, b) => b.score - a.score).slice(0, 50);
}
