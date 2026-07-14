import { ShopifyProduct } from "./shopify";

export type ProductTone = "light" | "dark";

/** Editorial copy that Shopify doesn't natively store (no metafields set up yet).
 *  Core facts — name, description, price, images — always come from Shopify;
 *  this only supplies brand voice/storytelling around them. */
export type ProductContent = {
  handle: string;
  tone: ProductTone;
  tagline: string;
  heroLine1: string;
  heroLine2: string;
  labelBadges: string[];
  tags: string[];
  suggestedUse: string;
  servingSize?: string;
  servingsPerContainer?: number;
  amountPerServing?: string;
  netWt?: string;
  otherIngredients?: string;
  standard: { title: string; body: string }[];
  activeCompound: { title: string; body: string };
};

const HAND_WRITTEN: Record<string, Omit<ProductContent, "handle">> = {
  "creatine-monohydrate": {
    tone: "light",
    tagline: "Micronized. Unflavored. Precisely dosed.",
    heroLine1: "Output,",
    heroLine2: "measured.",
    servingSize: "1 Scoop (5.6g)",
    servingsPerContainer: 50,
    amountPerServing: "Creatine Monohydrate — 5,000mg",
    netWt: "9.9oz (281g)",
    tags: ["Unflavored", "Micronized", "Premium Quality"],
    labelBadges: ["Pure", "Strength", "Energy"],
    suggestedUse:
      "Mix one (1) scoop with 8oz (237ml) of water or juice. Take 1 to 4 times daily for the first 5 days (loading phase), then take 1–2 times daily thereafter, or as directed by a healthcare professional.",
    standard: [
      { title: "Micronized", body: "Milled to a finer particle size for smoother mixing and faster suspension in liquid." },
      { title: "Third-party tested", body: "Every batch is verified by an independent lab for purity and label accuracy." },
      { title: "Unflavored", body: "No sweeteners, no dyes, no fillers — stack it into anything you're already drinking." },
      { title: "Made in the USA", body: "Manufactured in a GMP-certified facility under strict quality controls." },
    ],
    activeCompound: {
      title: "Why creatine monohydrate",
      body: "Creatine is one of the most researched compounds in sports nutrition. It supports the rapid regeneration of ATP — the cell's primary energy currency — which is why it's associated with gains in strength, power output, and lean body mass over time.",
    },
  },
  "l-glutamine": {
    tone: "dark",
    tagline: "Pure. Unflavored. Premium grade.",
    heroLine1: "Recovery,",
    heroLine2: "refined.",
    servingSize: "1 Scoop (3.3g)",
    servingsPerContainer: 30,
    amountPerServing: "L-Glutamine Powder — 3.15g",
    netWt: "3.46oz (98g)",
    tags: ["Unflavored", "Pure", "Premium Grade"],
    labelBadges: ["Pure", "Unflavored", "Premium Grade"],
    suggestedUse: "Mix 1 scoop (3.3g) with 8–12oz of water or your favorite beverage. Take 1 to 3 times daily.",
    otherIngredients: "Silicon Dioxide",
    standard: [
      { title: "Pharmaceutical grade", body: "Sourced and processed to a purity standard well above typical commodity powders." },
      { title: "Third-party tested", body: "Every batch is verified by an independent lab for purity and label accuracy." },
      { title: "Unflavored", body: "Just one ingredient plus a trace anti-caking agent — nothing to mask, nothing added." },
      { title: "Made in the USA", body: "Manufactured in a GMP-certified facility under strict quality controls." },
    ],
    activeCompound: {
      title: "Why L-Glutamine",
      body: "Glutamine is the most abundant amino acid in the body — and one of the first depleted under physical stress. Supplementing it is associated with support for lean muscle mass, cell growth, and the body's natural recovery processes.",
    },
  },
};

/** Splits a product title into two hero lines the way the hand-written
 *  entries do ("Output," / "measured."), for any product without curated copy. */
function autoHeroLines(title: string): [string, string] {
  const words = title.trim().split(/\s+/);
  if (words.length <= 1) return [title, ""];
  const mid = Math.ceil(words.length / 2);
  return [words.slice(0, mid).join(" ") + ",", words.slice(mid).join(" ").toLowerCase() + "."];
}

/**
 * Returns editorial content for a product. Uses hand-written copy when
 * available (creatine, l-glutamine); otherwise generates sensible defaults
 * from the live Shopify product so any product added in Shopify — including
 * bundles — still renders a complete, on-brand page with zero manual setup.
 */
export function getProductContent(handle: string, product?: ShopifyProduct | null): ProductContent {
  const curated = HAND_WRITTEN[handle];
  if (curated) return { handle, ...curated };

  const title = product?.title ?? "SD Supplements";
  const [heroLine1, heroLine2] = autoHeroLines(title);
  const isBundle = /bundle|stack|kit|combo/i.test(title);

  return {
    handle,
    tone: "light",
    tagline: isBundle ? "Two formulas. One order." : "Precisely dosed. Independently tested.",
    heroLine1,
    heroLine2: heroLine2 || "delivered.",
    tags: ["Third-Party Tested", "Made in USA"],
    labelBadges: ["Pure", "Tested", "Precise"],
    suggestedUse: "Follow the directions on your product label, or as directed by a healthcare professional.",
    standard: [
      { title: "Sourced", body: "Raw compounds selected for purity before a single batch is manufactured." },
      { title: "Tested", body: "Independently verified by a third-party lab — every batch, no exceptions." },
      { title: "Dosed", body: "Exactly what the label says. No underfilled scoops, no rounding down." },
      { title: "Made in the USA", body: "Manufactured in a GMP-certified facility under strict quality controls." },
    ],
    activeCompound: {
      title: isBundle ? "Why stack these together" : "What's inside",
      body:
        product?.description?.slice(0, 220) ||
        "Every SDproduct follows the same rule: one job, done precisely, with nothing extra added to hide behind.",
    },
  };
}

/** Convenience helper for known/curated handles (used for static param generation). */
export const CURATED_HANDLES = Object.keys(HAND_WRITTEN);
