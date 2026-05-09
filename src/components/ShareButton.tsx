import { RARITY_META, type Rarity } from "@/lib/rarity";
import { useAccount } from "wagmi";

export function ShareButton({ rarity }: { rarity: Rarity }) {
  const { address } = useAccount();

  const handleShare = () => {
    const meta = RARITY_META[rarity];
    const url =
      typeof window !== "undefined"
        ? `${window.location.origin}${address ? `?ref=${address}` : ""}`
        : "";
    const text = `I just pulled a ${rarity} ${meta.name} ${meta.emoji} on Press to Start!\n\nMint your own on Base 👇`;
    const intent = `https://warpcast.com/~/compose?text=${encodeURIComponent(text)}&embeds[]=${encodeURIComponent(url)}`;
    if (typeof window !== "undefined") window.open(intent, "_blank");
  };

  return (
    <button
      onClick={handleShare}
      className="bg-brand rounded-full py-3 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)] hover:scale-[1.02] active:scale-[0.98] transition"
    >
      Share to Farcaster
    </button>
  );
}
