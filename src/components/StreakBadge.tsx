import type { Streak } from "@/lib/storage";

export function StreakBadge({ streak, referrals }: { streak: Streak; referrals: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 w-full max-w-md">
      <div className="glass rounded-2xl p-4 text-center">
        <div className="text-3xl">🔥</div>
        <div className="text-2xl font-bold text-gradient mt-1">{streak.count}</div>
        <div className="text-xs uppercase tracking-widest opacity-70 mt-1">Day Streak</div>
      </div>
      <div className="glass rounded-2xl p-4 text-center">
        <div className="text-3xl">🤝</div>
        <div className="text-2xl font-bold text-gradient mt-1">{referrals}</div>
        <div className="text-xs uppercase tracking-widest opacity-70 mt-1">Referrals</div>
      </div>
    </div>
  );
}
