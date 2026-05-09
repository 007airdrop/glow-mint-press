import { WagmiProvider } from "wagmi";
import { wagmiConfig } from "@/lib/wagmi";
import type { ReactNode } from "react";

export function Web3Providers({ children }: { children: ReactNode }) {
  return <WagmiProvider config={wagmiConfig}>{children}</WagmiProvider>;
}
