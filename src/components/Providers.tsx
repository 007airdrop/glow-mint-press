import { WagmiProvider } from "wagmi";
import { wagmiConfig } from "@/lib/wagmi";
import { MiniAppReady } from "@/components/MiniAppReady";
import type { ReactNode } from "react";

export function Web3Providers({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <MiniAppReady />
      {children}
    </WagmiProvider>
  );
}
