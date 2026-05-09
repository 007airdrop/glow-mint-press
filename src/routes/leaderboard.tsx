import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { getLeaderboard, type LeaderEntry } from "@/lib/storage";

export const Route = createFileRoute("/leaderboard")({
  head: () => ({
    meta: [
      { title: "Leaderboard — Press to Start" },
      { name: "description", content: "Top collectors on Press to Start, ranked by rarity score." },
    ],
  }),
  component: LeaderboardPage,
});

function LeaderboardPage() {
  const { address } = useAccount();
  const [board, setBoard] = useState<LeaderEntry[]>([]);
  useEffect(() => { setBoard(getLeaderboard()); }, []);

  return (
    <div className="px-4 sm:px-6 max-w-3xl mx-auto pt-2">
      <h1 className="font-display font-extrabold text-3xl sm:text-5xl">
        <span className="text-gradient">Leaderboard</span>
      </h1>
      <p className="text-muted-foreground text-sm mt-2">
        Score = Common 1 · Uncommon 3 · Rare 8 · Legendary 25
      </p>

      <div className="mt-6 glass rounded-3xl overflow-hidden">
        {board.length === 0 && (
          <div className="p-10 text-center text-sm text-muted-foreground">No scores yet. Be the first to press.</div>
        )}
        {board.map((row, i) => {
          const me = address?.toLowerCase() === row.address;
          return (
            <div
              key={row.address}
              className={`flex items-center gap-3 px-4 sm:px-5 py-3 border-b border-white/5 last:border-0 ${me ? "bg-white/5" : ""}`}
            >
              <div className={`size-8 rounded-full flex items-center justify-center font-bold text-sm ${i < 3 ? "bg-brand text-primary-foreground" : "glass"}`}>
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-mono text-sm truncate">
                  {row.address.slice(0, 6)}…{row.address.slice(-4)}
                  {me && <span className="ml-2 text-[10px] uppercase tracking-widest text-gradient">you</span>}
                </div>
                <div className="text-xs text-muted-foreground">
                  {row.total} pulls · {row.legendary} legendary
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-gradient">{row.score}</div>
                <div className="text-[10px] uppercase tracking-widest opacity-60">score</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
