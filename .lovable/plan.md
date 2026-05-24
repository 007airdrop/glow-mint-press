
## Problems

1. **"Ready not called"** (screenshot 1) — the Farcaster host (Warpcast / Base App) waits for `sdk.actions.ready()` before dismissing the splash. Your app never calls it, so the splash stays forever.
2. **"refused to connect"** (screenshot 2) — `my-mystic-crate-git-main-007airdrops-projects.vercel.app` is sending `X-Frame-Options: DENY` (Vercel preview/protected deployments do this by default) and/or `Content-Security-Policy: frame-ancestors 'none'`. Farcaster embeds your app in an iframe, so the browser blocks it.
3. **Manifest points at the wrong domain** — your manifest's `homeUrl` / `iconUrl` should point at the **production** Vercel domain (`my-mystic-crate.vercel.app`), not the per-commit preview URL. Preview URLs are also gated by Vercel's deployment protection, which is what causes "refused to connect".

## Fix 1 — Call `sdk.actions.ready()` (dismisses splash)

Install the SDK and call `ready()` once your UI has painted.

```bash
npm i @farcaster/miniapp-sdk
```

Create `components/MiniAppReady.tsx`:

```tsx
"use client";
import { useEffect } from "react";

export function MiniAppReady() {
  useEffect(() => {
    (async () => {
      try {
        const { sdk } = await import("@farcaster/miniapp-sdk");
        await sdk.actions.ready();
      } catch {}
    })();
  }, []);
  return null;
}
```

Mount it in `app/layout.tsx` (App Router) inside `<body>`, or in `pages/_app.tsx` (Pages Router) at the top of the returned tree. It's a client component, safe no-op outside Farcaster.

## Fix 2 — Allow Farcaster to iframe the app

The root cause is HTTP response headers, not code. Two things to do in the Vercel project:

**A. Turn off Deployment Protection for Production** (Vercel dashboard → Project → Settings → Deployment Protection → set to "Disabled" or "Only Preview Deployments"). Without this, every request returns a Vercel auth wall that browsers render as "refused to connect" inside an iframe.

**B. Remove / override frame-blocking headers.** Add `next.config.js` (or merge into your existing one):

```js
/** @type {import('next').NextConfig} */
module.exports = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // Explicitly allow embedding from Farcaster hosts
          {
            key: "Content-Security-Policy",
            value: "frame-ancestors 'self' https://warpcast.com https://*.warpcast.com https://farcaster.xyz https://*.farcaster.xyz https://*.base.org https://base.app https://*.base.app;",
          },
        ],
      },
    ];
  },
};
```

Do NOT set `X-Frame-Options` — CSP `frame-ancestors` supersedes it and supports multiple origins. If anywhere in your code (middleware, a custom server, or `vercel.json`) you're setting `X-Frame-Options: DENY` or `SAMEORIGIN`, remove that line.

## Fix 3 — Manifest must use the production domain

In `public/.well-known/farcaster.json` (or your route serving it), every URL must be on the **same** public production domain that you signed the `accountAssociation` for. From your screenshot the app is published at `my-mystic-crate.vercel.app`, so:

```json
{
  "accountAssociation": { "header": "...", "payload": "...", "signature": "..." },
  "miniapp": {
    "version": "1",
    "name": "Mystic Crate",
    "iconUrl": "https://my-mystic-crate.vercel.app/icon.png",
    "homeUrl": "https://my-mystic-crate.vercel.app",
    "imageUrl": "https://my-mystic-crate.vercel.app/cover.png",
    "buttonTitle": "Open Mystic Crate",
    "splashImageUrl": "https://my-mystic-crate.vercel.app/icon.png",
    "splashBackgroundColor": "#0b0220",
    "primaryCategory": "games",
    "tags": ["nft", "base", "rewards"]
  }
}
```

The `payload` you signed earlier encodes the exact domain — if you signed for `my-mystic-crate.vercel.app`, the manifest MUST be served from that host. If you signed for a different domain, re-sign with the Farcaster manifest tool against the production domain.

## Verify

After deploying:

1. `curl -I https://my-mystic-crate.vercel.app` → should NOT show `x-frame-options: DENY` and CSP should include `frame-ancestors ... warpcast.com ... base.app`.
2. `curl https://my-mystic-crate.vercel.app/.well-known/farcaster.json` → returns the JSON above (not Vercel's HTML auth page).
3. In Warpcast Mini App developer tools, click **Refetch** on the manifest, then **Preview** — splash should dismiss within ~1s and the app should render.

## Why I can't auto-fix it for you

Your Mystic Crate repo lives on GitHub (`007airdrop/my-mystic-crate`), not in this Lovable project, so I can't push commits to it from here. Two options:

- Apply the three changes above in your own repo (~5 min).
- Or import the project into Lovable via the GitHub integration (Plus menu → GitHub → Connect project), and I'll make the edits directly.
