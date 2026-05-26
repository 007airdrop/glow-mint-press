import { createFileRoute } from "@tanstack/react-router";

/**
 * Farcaster Mini App manifest.
 *
 * Two ways to make this valid:
 *
 * 1) HOSTED MANIFEST (easiest — what the "Create Hosted Manifest" button does)
 *    In the Farcaster dev tools, click "Create Hosted Manifest" for your domain.
 *    It will give you a URL like:
 *      https://api.farcaster.xyz/miniapps/hosted-manifest/<id>
 *    Set that URL as the FARCASTER_HOSTED_MANIFEST_URL env var (Project →
 *    Settings → Environment) and this route will 307-redirect to it. Done.
 *
 * 2) SELF-HOSTED — paste the signed accountAssociation values returned by the
 *    Farcaster manifest tool into the object below and remove the redirect.
 *
 * Spec: https://miniapps.farcaster.xyz/docs/specification#manifest
 */
export const Route = createFileRoute("/.well-known/farcaster.json")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const hosted = process.env.FARCASTER_HOSTED_MANIFEST_URL;
        if (hosted && /^https?:\/\//.test(hosted)) {
          return new Response(null, {
            status: 307,
            headers: {
              Location: hosted,
              "Cache-Control": "public, max-age=300",
            },
          });
        }

        const origin = new URL(request.url).origin;

        // Self-hosted manifest. accountAssociation MUST be filled in with
        // values from the Farcaster manifest signing tool for your domain,
        // otherwise Warpcast / Base App will report "does not have a valid
        // manifest setup."
        const accountAssociation = {
          header:
            "eyJmaWQiOjUzMDg4MCwidHlwZSI6ImF1dGgiLCJrZXkiOiIweERGMTI2NkY3Njg1MWZEODYwMEM2MDhCMWNlMDFlNDlGMDlkMERBM0QifQ",
          payload: "eyJkb21haW4iOiJnbG93LW1pbnQtcHJlc3MubG92YWJsZS5hcHAifQ",
          signature:
            "kSs9Ws2QNV4no/FUGHyujzpEW5s8dDHsoO0mZ77WIFN0CWuj/2vv2mBUvCq4hfgD5ExM9s7Z35N82JFaw88aNhw=",
        };

        // miniapp block is the canonical Base App / Farcaster v1 manifest.
        // `frame` is kept as a back-compat alias for older clients.
        const miniapp = {
          version: "1",
          name: "Press to Start",
          subtitle: "Pull rarity NFTs on Base",
          description:
            "Tap a glowing button. Pull randomized ERC-1155 NFTs on Base. Streaks, serials, capped supply.",
          iconUrl: `${origin}/icon.png`,
          homeUrl: origin,
          imageUrl: `${origin}/cover.png`,
          buttonTitle: "Press to Start",
          splashImageUrl: `${origin}/icon.png`,
          splashBackgroundColor: "#0b0220",
          primaryCategory: "games",
          tags: ["nft", "base", "rewards", "rarity", "baseapp"],
          ogTitle: "Press to Start",
          ogDescription: "Tap. Roll. Mint rarity NFTs on Base.",
          ogImageUrl: `${origin}/cover.png`,
          heroImageUrl: `${origin}/cover.png`,
          tagline: "Press. Pull. Flex.",
          requiredChains: ["eip155:8453"],
          requiredCapabilities: [
            "actions.ready",
            "wallet.getEthereumProvider",
          ],
          noindex: false,
        };

        const manifest: Record<string, unknown> = {
          miniapp,
          // Back-compat: some clients still read `frame`.
          frame: miniapp,
        };

        // Only include accountAssociation when it's actually signed — an
        // object full of empty strings is what makes the manifest "invalid".
        if (
          accountAssociation.header &&
          accountAssociation.payload &&
          accountAssociation.signature
        ) {
          manifest.accountAssociation = accountAssociation;
        }

        return new Response(JSON.stringify(manifest, null, 2), {
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "public, max-age=300",
          },
        });
      },
    },
  },
});
