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
  /** A product can have more than one active ingredient (e.g. creatine +
   *  electrolytes) — this is a list, not a single string, so real supplement
   *  facts never get silently truncated to fit a single-ingredient shape. */
  activeIngredients?: { name: string; amount: string }[];
  netWt?: string;
  otherIngredients?: string;
  standard: { title: string; body: string }[];
  activeCompound: { title: string; body: string };
};

const HAND_WRITTEN: Record<string, Omit<ProductContent, "handle">> = {
  // Real Shopify handle is "creatine-hydration-powder" (title: "Creatine
  // Hydration Powder") — NOT "creatine-monohydrate". Facts below are taken
  // directly from the live product page's supplement facts panel.
  "creatine-hydration-powder": {
    tone: "light",
    tagline: "Creatine + electrolytes. Precisely dosed.",
    heroLine1: "Power,",
    heroLine2: "hydrated.",
    servingSize: "1 Scoop (10g)",
    servingsPerContainer: 30,
    activeIngredients: [
      { name: "Creatine (as Creatine Monohydrate)", amount: "5,000 mg" },
      { name: "Magnesium (as Magnesium Malate)", amount: "60 mg" },
      { name: "Sodium (as Sea Salt)", amount: "1,000 mg" },
      { name: "Potassium (as Potassium Chloride)", amount: "200 mg" },
    ],
    otherIngredients: "Natural Flavors, Stevia Extract (Leaf), Silicon Dioxide",
    netWt: "10.6oz (300g)",
    tags: ["Lemon Flavor", "Electrolyte Blend", "Premium Quality"],
    labelBadges: ["Pure", "Hydration", "Energy"],
    suggestedUse:
      "As a dietary supplement, adults mix one (1) scoop (10g) with 6–8oz (177–237ml) of water or favorite beverage daily.",
    standard: [
      { title: "Sourced", body: "Raw compounds selected for purity before a single batch is manufactured." },
      { title: "Third-party tested", body: "Every batch is verified by an independent lab for purity and label accuracy." },
      { title: "Precisely dosed", body: "Exactly what the label says — no underfilled scoops, no rounding down." },
      { title: "Made in the USA", body: "Manufactured in a GMP-certified facility under strict quality controls." },
    ],
    activeCompound: {
      title: "Why creatine + electrolytes",
      body: "Creatine supports the rapid regeneration of ATP — the cell's primary energy currency — for strength and power output. Magnesium, sodium, and potassium round out the formula to help maintain hydration and normal muscle function during training, so one scoop covers both energy and fluid balance.",
    },
  },
  "l-glutamine": {
    tone: "dark",
    tagline: "Pure. Unflavored. Premium grade.",
    heroLine1: "Recovery,",
    heroLine2: "refined.",
    servingSize: "1 Scoop (3.3g)",
    servingsPerContainer: 30,
    activeIngredients: [{ name: "L-Glutamine Powder", amount: "3.15g" }],
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

  const title = product?.title ?? "SB Supplements";
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
        "Every SB product follows the same rule: one job, done precisely, with nothing extra added to hide behind.",
    },
  };
}

/** Convenience helper for known/curated handles (used for static param generation). */
export const CURATED_HANDLES = Object.keys(HAND_WRITTEN);
