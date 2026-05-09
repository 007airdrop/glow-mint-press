import { useAccount, useConnect, useDisconnect } from "wagmi";

export function WalletButton() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();

  if (isConnected && address) {
    return (
      <button
        onClick={() => disconnect()}
        className="glass-strong rounded-full px-4 py-2 text-sm font-medium hover:scale-[1.02] transition"
      >
        <span className="text-gradient font-semibold">
          {address.slice(0, 6)}…{address.slice(-4)}
        </span>
      </button>
    );
  }

  const cb = connectors.find((c) => c.id === "coinbaseWalletSDK") ?? connectors[0];

  return (
    <button
      onClick={() => cb && connect({ connector: cb })}
      disabled={isPending}
      className="bg-brand rounded-full px-5 py-2 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)] hover:scale-[1.03] active:scale-[0.98] transition disabled:opacity-60"
    >
      {isPending ? "Connecting…" : "Connect Smart Wallet"}
    </button>
  );
}
