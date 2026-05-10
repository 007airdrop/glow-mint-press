import { useEffect } from "react";

/**
 * Signals to the Farcaster host (Warpcast / Base App) that the mini-app is
 * ready to be displayed. Without this, the splash screen never dismisses.
 * Safe no-op outside of a Farcaster client.
 */
export function MiniAppReady() {
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { sdk } = await import("@farcaster/miniapp-sdk");
        if (cancelled) return;
        await sdk.actions.ready();
      } catch {
        // Not in a Farcaster context — ignore.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);
  return null;
}
