import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { RewardCard } from "@/components/RewardCard";
import { getRewards, type RewardEntry } from "@/lib/storage";
import { RARITY_META } from "@/lib/rarity";

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "Gallery — Press to Start" },
      { name: "description", content: "Your collection of rarity-ranked NFTs from Press to Start." },
    ],
  }),
  component: GalleryPage,
});

function GalleryPage() {
  const { address, isConnected } = useAccount();
  const [items, setItems] = useState<RewardEntry[]>([]);

  useEffect(() => {
    if (address) setItems(getRewards(address));
  }, [address]);

  return (
    <div className="px-4 sm:px-6 max-w-5xl mx-auto pt-2">
      <h1 className="font-display font-extrabold text-3xl sm:text-5xl">
        Your <span className="text-gradient">collection</span>
      </h1>
      <p className="text-muted-foreground text-sm mt-2">
        {items.length} {items.length === 1 ? "pull" : "pulls"}
      </p>

      {!isConnected && (
        <div className="glass rounded-2xl p-6 mt-6 text-center text-sm">
          Connect your wallet to view your collection.
        </div>
      )}

      {isConnected && items.length === 0 && (
        <div className="glass rounded-2xl p-10 mt-6 text-center">
          <div className="text-5xl mb-2">🎁</div>
          <div className="font-semibold">Nothing here yet</div>
          <div className="text-sm text-muted-foreground mt-1">Press the button on the home screen to pull your first reward.</div>
        </div>
      )}

      {items.length > 0 && (
        <>
          <Stats items={items} />
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {items.map((it, i) => (
              <RewardCard key={it.id} rarity={it.rarity} index={i} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function Stats({ items }: { items: RewardEntry[] }) {
  const counts = { Common: 0, Uncommon: 0, Rare: 0, Legendary: 0 };
  items.forEach((i) => counts[i.rarity]++);
  return (
    <div className="grid grid-cols-4 gap-2 sm:gap-3 mt-5">
      {(Object.keys(counts) as (keyof typeof counts)[]).map((k) => (
        <div key={k} className="glass rounded-2xl p-3 text-center">
          <div className="text-2xl" style={{ color: RARITY_META[k].color }}>{RARITY_META[k].emoji}</div>
          <div className="text-2xl font-bold mt-1" style={{ color: RARITY_META[k].color }}>{counts[k]}</div>
          <div className="text-[10px] uppercase tracking-widest opacity-70">{k}</div>
        </div>
      ))}
    </div>
  );
}
