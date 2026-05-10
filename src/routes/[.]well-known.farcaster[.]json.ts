import { createFileRoute } from "@tanstack/react-router";

/**
 * Farcaster Mini App manifest. After deploying, register the domain in the
 * Farcaster developer tools and paste the resulting accountAssociation here.
 * See: https://miniapps.farcaster.xyz/docs/specification#manifest
 */
export const Route = createFileRoute("/.well-known/farcaster.json")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const origin = new URL(request.url).origin;
        const manifest = {
          // Replace with the values returned by the Farcaster manifest tool
          // once the production domain is known.
          accountAssociation: {
            header: "",
            payload: "",
            signature: "",
          },
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
