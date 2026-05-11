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
          header: process.env.FARCASTER_HEADER ?? "",
          payload: process.env.FARCASTER_PAYLOAD ?? "",
          signature: process.env.FARCASTER_SIGNATURE ?? "",
        };

        const manifest: Record<string, unknown> = {
          miniapp: {
            version: "1",
            name: "Press to Start",
            iconUrl: `${origin}/icon.png`,
            homeUrl: origin,
            imageUrl: "https://og.lovable.dev/?title=Press%20to%20Start",
            buttonTitle: "Press to Start",
            splashImageUrl: `${origin}/icon.png`,
            splashBackgroundColor: "#0b0220",
            primaryCategory: "games",
            tags: ["nft", "base", "rewards", "rarity"],
            description:
              "Tap a glowing button. Pull randomized ERC-1155 NFTs on Base.",
          },
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
