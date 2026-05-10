import { WagmiProvider } from "wagmi";
import { OnchainKitProvider } from "@coinbase/onchainkit";
import { base } from "wagmi/chains";
import { wagmiConfig } from "@/lib/wagmi";
import { MiniAppReady } from "@/components/MiniAppReady";
import type { ReactNode } from "react";

export function Web3Providers({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <OnchainKitProvider chain={base}>
        <MiniAppReady />
        {children}
      </OnchainKitProvider>
    </WagmiProvider>
  );
}
