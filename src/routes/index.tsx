import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useAccount } from "wagmi";
import { PressButton } from "@/components/PressButton";
import { RewardReveal } from "@/components/RewardReveal";
import { StreakBadge } from "@/components/StreakBadge";
import { StreakRewards } from "@/components/StreakRewards";
import { InventoryHUD } from "@/components/InventoryHUD";
import { SupplyStrip, ExtinctBanner } from "@/components/SoldOutBanner";
import { rollRarity, type Rarity } from "@/lib/rarity";
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
import {
  consumeDailyOpen,
  consumeSerial,
  getOpensLeft,
  getMintedCounts,
  isSoldOut,
  SUPPLY_CAPS,
} from "@/lib/supply";
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
const TENSION_MS = 2500; // intensity 3: ~2.5s build-up before reveal

function HomePage() {
  const { address, isConnected } = useAccount();
  const [reveal, setReveal] = useState<{ rarity: Rarity; serial: number } | null>(null);
  const [rolling, setRolling] = useState(false);
  const [now, setNow] = useState(Date.now());
  const [streak, setStreak] = useState<Streak>({ count: 0, lastDay: "" });
  const [referrals, setReferrals] = useState(0);
  const [recent, setRecent] = useState<Rarity[]>([]);
  const [opensLeft, setOpensLeft] = useState(10);
  const [hudPulse, setHudPulse] = useState(false);
  const [extinct, setExtinct] = useState<Rarity | null>(null);
  const [tick, setTick] = useState(0); // force supply strip refresh

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (ref) setReferrer(ref);
  }, []);

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
    setOpensLeft(getOpensLeft(address));
  }, [address]);

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

  const userRewards = useMemo(
    () => (address ? getRewards(address) : []),
    [address, reveal, tick]
  );
  const legendaryCount = useMemo(
    () => userRewards.filter((r) => r.rarity === "Legendary").length,
    [userRewards]
  );

  const handlePress = async () => {
    if (!address || cooldownRemaining > 0 || rolling || opensLeft === 0) return;
    setRolling(true);
    // Tension build-up
    await new Promise((r) => setTimeout(r, TENSION_MS));

    // Re-roll if rarity is sold out (drop to next available tier)
    let rarity = rollRarity();
    const order: Rarity[] = ["Legendary", "Rare", "Uncommon", "Common"];
    if (isSoldOut(rarity)) {
      const fallback = order.find((r) => !isSoldOut(r));
      if (!fallback) {
        setRolling(false);
        return;
      }
      rarity = fallback;
    }

    const serial = consumeSerial(rarity);

    // Check if this mint exhausted the tier
    if (serial === SUPPLY_CAPS[rarity]) {
      setExtinct(rarity);
      setTimeout(() => setExtinct(null), 5000);
    }

    addReward(address, {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      rarity,
      mintedAt: Date.now(),
    });
    setLastMint(address, Date.now());
    setStreak(tickStreak(address));
    consumeDailyOpen(address);
    setOpensLeft(getOpensLeft(address));
    setRecent((r) => [rarity, ...r].slice(0, 4));
    setReveal({ rarity, serial });
    setHudPulse(true);
    setTimeout(() => setHudPulse(false), 500);
    setTick((t) => t + 1);
    setRolling(false);
  };

  return (
    <div className="px-4 sm:px-6 max-w-3xl mx-auto flex flex-col items-center gap-5">
      <ExtinctBanner rarity={extinct} onClose={() => setExtinct(null)} />

      <section className="text-center pt-4 sm:pt-8">
        <div className="inline-flex glass rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.3em] opacity-80">
          {isContractConfigured ? "Live on Base" : "Mock mint mode"}
        </div>
        <h1 className="font-display font-extrabold text-4xl sm:text-6xl mt-4 leading-[1.05]">
          Press the button.<br />
          <span className="text-gradient">Pull a rarity.</span>
        </h1>
        <p className="mt-3 text-sm sm:text-base text-muted-foreground max-w-md mx-auto">
          A Farcaster mini-game on Base. Capped supply, real serial numbers, every press
          mints an ERC-1155.
        </p>
      </section>

      <SupplyStrip key={tick} />

      <PressButton
        onPress={handlePress}
        loading={rolling}
        disabled={!isConnected || opensLeft === 0}
        cooldownLabel={opensLeft === 0 ? "0/day" : cooldownLabel}
      />

      {!isConnected && (
        <div className="glass rounded-2xl px-5 py-3 text-sm text-center max-w-sm">
          Connect your <span className="text-gradient font-semibold">Coinbase Smart Wallet</span> to start pulling rewards.
        </div>
      )}

      {isConnected && (
        <>
          <InventoryHUD
            total={userRewards.length}
            legendary={legendaryCount}
            opensLeft={opensLeft}
            pulse={hudPulse}
          />
          <StreakBadge streak={streak} referrals={referrals} />
          <StreakRewards streak={streak.count} />
        </>
      )}

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

      <RewardReveal payload={reveal} onClose={() => setReveal(null)} />
    </div>
  );
}
