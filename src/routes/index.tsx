import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useAccount } from "wagmi";
import { PressButton } from "@/components/PressButton";
import { RewardReveal } from "@/components/RewardReveal";
import { StreakBadge } from "@/components/StreakBadge";
import { rollRarity, type Rarity, RARITY_META } from "@/lib/rarity";
import {
  addReward,
  getLastMint,
  getReferrer,
  getReferralCount,
  getStreak,
  setLastMint,
  setReferrer,
  tickStreak,
  creditReferral,
  getRewards,
  type Streak,
} from "@/lib/storage";
import { isContractConfigured } from "@/lib/contract";
import { RewardCard } from "@/components/RewardCard";

const APP_URL = "https://glow-mint-press.lovable.app";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Press to Start — NFT rarity rewards on Base" },
      { name: "description", content: "Tap a glowing button. Pull randomized ERC-1155 NFTs on Base. Streaks, leaderboards, Farcaster sharing." },
      { property: "og:title", content: "Press to Start" },
      { property: "og:description", content: "Tap. Roll. Mint randomized NFTs on Base." },
      // Farcaster Mini App embed (renders a launch card in feeds)
      {
        property: "fc:miniapp",
        content: JSON.stringify({
          version: "1",
          imageUrl: `${APP_URL}/cover.png`,
          button: {
            title: "Press to Start",
            action: {
              type: "launch_miniapp",
              name: "Press to Start",
              url: APP_URL,
              splashBackgroundColor: "#0b0220",
            },
          },
        }),
      },
      // Backwards-compat for older Frame parsers
      {
        property: "fc:frame",
        content: JSON.stringify({
          version: "1",
          imageUrl: `${APP_URL}/cover.png`,
          button: {
            title: "Press to Start",
            action: {
              type: "launch_frame",
              name: "Press to Start",
              url: APP_URL,
              splashBackgroundColor: "#0b0220",
            },
          },
        }),
      },
    ],
  }),
  component: HomePage,
});

const COOLDOWN_MS = 60_000;

function HomePage() {
  const { address, isConnected } = useAccount();
  const [reveal, setReveal] = useState<Rarity | null>(null);
  const [rolling, setRolling] = useState(false);
  const [now, setNow] = useState(Date.now());
  const [streak, setStreak] = useState<Streak>({ count: 0, lastDay: "" });
  const [referrals, setReferrals] = useState(0);
  const [recent, setRecent] = useState<Rarity[]>([]);

  // Capture referrer from URL
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (ref) setReferrer(ref);
  }, []);

  // Hydrate per-wallet state
  useEffect(() => {
    if (!address) return;
    setStreak(getStreak(address));
    const ref = getReferrer();
    if (ref && ref.toLowerCase() !== address.toLowerCase()) {
      creditReferral(ref);
      setReferrals(getReferralCount(ref));
    } else {
      setReferrals(getReferralCount(address));
    }
    setRecent(getRewards(address).slice(0, 4).map((r) => r.rarity));
  }, [address]);

  // Cooldown ticker
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const cooldownRemaining = useMemo(() => {
    if (!address) return 0;
    const last = getLastMint(address);
    return Math.max(0, COOLDOWN_MS - (now - last));
  }, [now, address, reveal]);

  const cooldownLabel =
    cooldownRemaining > 0 ? `${Math.ceil(cooldownRemaining / 1000)}s` : undefined;

  const handlePress = async () => {
    if (!address || cooldownRemaining > 0 || rolling) return;
    setRolling(true);
    // Roll suspense
    await new Promise((r) => setTimeout(r, 900));
    const rarity = rollRarity();
    addReward(address, {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      rarity,
      mintedAt: Date.now(),
    });
    setLastMint(address, Date.now());
    setStreak(tickStreak(address));
    setRecent((r) => [rarity, ...r].slice(0, 4));
    setReveal(rarity);
    setRolling(false);
  };

  return (
    <div className="px-4 sm:px-6 max-w-3xl mx-auto flex flex-col items-center gap-6">
      <section className="text-center pt-4 sm:pt-8">
        <div className="inline-flex glass rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.3em] opacity-80">
          {isContractConfigured ? "Live on Base" : "Mock mint mode"}
        </div>
        <h1 className="font-display font-extrabold text-4xl sm:text-6xl mt-4 leading-[1.05]">
          Press the button.<br />
          <span className="text-gradient">Pull a rarity.</span>
        </h1>
        <p className="mt-3 text-sm sm:text-base text-muted-foreground max-w-md mx-auto">
          A Farcaster mini-game on Base. Common to Legendary — every press
          mints an ERC-1155.
        </p>
      </section>

      <RarityOdds />

      <PressButton
        onPress={handlePress}
        loading={rolling}
        disabled={!isConnected}
        cooldownLabel={cooldownLabel}
      />

      {!isConnected && (
        <div className="glass rounded-2xl px-5 py-3 text-sm text-center max-w-sm">
          Connect your <span className="text-gradient font-semibold">Coinbase Smart Wallet</span> to start pulling rewards.
        </div>
      )}

      {isConnected && <StreakBadge streak={streak} referrals={referrals} />}

      {recent.length > 0 && (
        <section className="w-full">
          <div className="text-xs uppercase tracking-[0.3em] opacity-60 mb-3 text-center">
            Recent pulls
          </div>
          <div className="flex justify-center gap-3 flex-wrap">
            {recent.map((r, i) => (
              <RewardCard key={i} rarity={r} index={i} size="sm" />
            ))}
          </div>
        </section>
      )}

      <RewardReveal rarity={reveal} onClose={() => setReveal(null)} />
    </div>
  );
}

function RarityOdds() {
  const order: Rarity[] = ["Common", "Uncommon", "Rare", "Legendary"];
  const odds: Record<Rarity, string> = { Common: "50%", Uncommon: "30%", Rare: "15%", Legendary: "5%" };
  return (
    <div className="grid grid-cols-4 gap-2 w-full max-w-md">
      {order.map((r) => {
        const m = RARITY_META[r];
        return (
          <div key={r} className="glass rounded-xl p-2 text-center">
            <div className="text-2xl" style={{ color: m.color }}>{m.emoji}</div>
            <div className="text-[10px] uppercase tracking-wider opacity-70 mt-1">{r}</div>
            <div className="text-xs font-semibold" style={{ color: m.color }}>{odds[r]}</div>
          </div>
        );
      })}
    </div>
  );
}
