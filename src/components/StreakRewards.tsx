const REWARDS = [
  { day: 1, label: "+1 XP", emoji: "✦" },
  { day: 2, label: "Discount", emoji: "%" },
  { day: 3, label: "Bonus FX", emoji: "✺" },
  { day: 4, label: "Rare boost", emoji: "◈" },
  { day: 5, label: "Badge", emoji: "🛡" },
  { day: 6, label: "2× chance", emoji: "⚡" },
  { day: 7, label: "Free open", emoji: "🎁" },
];

export function StreakRewards({ streak }: { streak: number }) {
  const dayInWeek = ((streak - 1) % 7) + 1;
  return (
    <div className="w-full max-w-md">
      <div className="text-[10px] uppercase tracking-[0.3em] opacity-60 mb-2 text-center">
        Daily Rewards
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {REWARDS.map((r) => {
          const earned = streak >= r.day;
          const today = streak > 0 && dayInWeek === r.day;
          return (
            <div
              key={r.day}
              className={`glass rounded-lg py-2 px-1 text-center transition ${
                today ? "ring-2 ring-[color:var(--color-legendary)] scale-105" : ""
              } ${earned ? "" : "opacity-40"}`}
            >
              <div className="text-[9px] uppercase opacity-60">D{r.day}</div>
              <div className="text-base leading-none my-1">{r.emoji}</div>
              <div className="text-[8px] uppercase tracking-wider leading-tight">{r.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
