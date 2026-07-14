# SD Supplements — Storefront

Next.js 16 + Tailwind v4 headless Shopify storefront for SD Supplements
(Creatine Monohydrate, L-Glutamine — more products can be added the same way).

## Design system

The visual language is sourced directly from the product packaging: a soft
blush/rose palette, flowing ribbon motifs echoing the label's logomark, thin
elegant sans typography, frosted-glass panels, and generous editorial
whitespace — closer to Aesop/Apple/Nothing than a typical supplement store.

- **Blush** (`--color-blush-*`) — pale end of the packaging palette (Creatine).
- **Mauve** (`--color-mauve-*`) — the deeper packaging tone (L-Glutamine).
- **Burgundy** (`--color-burgundy-*`) — the accent/wordmark color off the label.
- **Charcoal/cream neutrals** for body text and dark sections (footer, CTA band).

Each product's `tone` field (`light` | `dark`) in `lib/products.ts` decides
which end of the palette its hero/cards lean toward — mirroring its actual
packaging. All tokens live in `app/globals.css` under `@theme`, with custom
rules kept inside `@layer base`/`@layer components` (Tailwind utilities must
stay layered too, or unlayered CSS silently overrides them — see comments
in that file). Fonts are self-hosted via `@fontsource/manrope` (weights
200–800, no serif) — no external font CDN calls.

Reusable components live in `components/ui/`: `Button`, `Badge`, `Ribbon`
(the flowing SVG motif), `Logo`, and `Motion.tsx` (`Stars`, `CountUp`,
`FadeUp`, `Eyebrow`, `SectionNumber`).

## Architecture

- `app/page.tsx` + `components/Home.tsx` — brand homepage. Fetches **every**
  product currently in your connected Shopify store via `getAllProducts()`
  and renders a shop-grid card for each — including bundle products. Nothing
  to hardcode; whatever's in Shopify shows up here.
- `app/products/page.tsx` — `/products` index: every Shopify product in a
  responsive grid, synced live (no hardcoded list).
- `app/products/[handle]/page.tsx` + `components/ProductExperience.tsx` —
  reusable PDP template, one route per real Shopify product handle
  (`generateStaticParams` pulls the handle list live from Shopify).
  Name/description/price/images/variants always come from Shopify; only the
  editorial voice (hero headline split, "Standard" copy, active-compound
  blurb) is layered on top from `lib/products.ts`, with sensible
  auto-generated defaults for any product that doesn't have hand-written
  copy yet (so new products — including your Creatine + L-Glutamine bundle —
  render a complete page immediately, no manual setup required).
- `app/policies/[handle]/page.tsx` — renders your real Shopify policies
  (Refund, Shipping, Terms, Privacy, Subscription — whichever you've filled
  in under Shopify Admin → Settings → Policies) in the site's own design,
  linked from the footer.
- `lib/products.ts` — editorial enrichment only, keyed by handle. Add a
  hand-written entry here any time you want a product's story told with
  more care than the auto-generated default.
- `lib/shopify.ts` — `getProduct`, `getAllProducts`, `getShopPolicies`,
  `getPage`, `createCheckout`. All server-only.
- `lib/parseDescription.ts` — splits a Shopify product's `descriptionHtml`
  into sections by its own `<h2>`/`<h3>` headings, so a merchant-formatted
  description renders as distinct sections instead of one big paragraph.

## Product page

- `components/ProductGallery.tsx` — loads every image from the Shopify
  product's `images` array (no hardcoded URLs, works with 1 or 20+ images).
  Desktop: thumbnail strip + featured image with fade transitions,
  prev/next arrows, hover zoom, keyboard arrow-key navigation. Mobile:
  native swipe carousel (scroll-snap) with pagination dots. If a variant
  has its own image (e.g. a flavor), selecting it resets the gallery to
  that image via a `key`-based remount rather than syncing state in an
  effect.
- Layout is a 7/5-column grid (`app/products/[handle]/page.tsx` →
  `ProductExperience`) at up to `max-w-[1400px]`: gallery first in the DOM
  (so it's always first on mobile), purchase card `lg:sticky` on desktop.
  Description/Benefits/Ingredients/Supplement Facts/Shipping/FAQ render
  full-width below as `components/product/DescriptionSections.tsx` — fully
  expanded on desktop, accordion on mobile.

## What was removed

**The "Subscribe & Save 20%" toggle was removed.** It was a purely
client-side fake discount with no real subscription behind it — actually
selling subscriptions on Shopify requires a subscriptions app/API (Shopify
Subscriptions, Recharge, etc.) issuing real selling plans, which isn't
connected here. `lib/shopify.ts` has a `subscriptionPolicy` query wired up
already; if/when you add a real subscriptions app, that's the natural place
to reintroduce a subscribe option tied to actual selling plans instead of a
fake price multiplier.

## Connecting Shopify (headless)

Every page fetches live data from Shopify's Storefront API server-side and
falls back to static placeholder content if it isn't configured — so the
site always renders, with or without Shopify.

1. Copy your credentials into `.env.local` (already gitignored):

   ```
   SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
   SHOPIFY_STOREFRONT_ACCESS_TOKEN=your-storefront-access-token
   ```

2. Get a Storefront API token in Shopify Admin → **Settings → Apps and sales
   channels → Develop apps** → create an app → **Storefront API** → enable
   `unauthenticated_read_product_listings` and `unauthenticated_write_checkouts`
   → install the app → copy the **Storefront API access token**.

3. Restart `npm run dev`. Every product in your store shows up on the
   homepage and gets its own `/products/[handle]` page automatically —
   including bundle products. Your existing Creatine Monohydrate and
   L-Glutamine products get the hand-written copy from `lib/products.ts`
   if their handles match `creatine-monohydrate` / `l-glutamine`; any other
   product (including your bundle) gets sensible auto-generated copy
   immediately, no setup required.

4. Fill in **Shopify Admin → Settings → Policies** (Refund, Shipping, Terms,
   Privacy) and they'll appear in the footer, linked to a matching-design
   page at `/policies/[handle]`.

Both env vars are read server-only (`lib/shopify.ts`, `app/api/checkout/route.ts`)
and are never exposed to the browser.

---



## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
