import { ShopifyProduct } from "./shopify";

export type Bundle = {
  id: string;
  variantId?: string;
  qty: number;
  label: string;
  price: number;
  compareAtPrice: number | null;
  perStrip: string;
  badge?: string;
  savePct: number;
};

const FALLBACK_BUNDLES: Bundle[] = [
  { id: "b1", qty: 1, label: "Starter Pack", price: 29.99, compareAtPrice: null, perStrip: "$1.00/strip", savePct: 0 },
  { id: "b2", qty: 2, label: "Two-Pack", price: 49.99, compareAtPrice: 59.99, perStrip: "$0.83/strip", badge: "Most Popular", savePct: 17 },
  { id: "b3", qty: 3, label: "Three-Pack", price: 64.99, compareAtPrice: 89.99, perStrip: "$0.72/strip", badge: "Best Value", savePct: 28 },
];

const STRIPS_PER_BOX = 30;

/**
 * Turns live Shopify variants into the bundle cards the buy-box renders.
 * Falls back to static placeholder bundles when Shopify isn't configured
 * or the product has no variants, so the page always renders something.
 */
export function getBundles(product: ShopifyProduct | null): Bundle[] {
  if (!product || product.variants.length === 0) return FALLBACK_BUNDLES;

  return product.variants.map((v, i) => {
    const qtyMatch = v.title.match(/(\d+)/);
    const qty = qtyMatch ? parseInt(qtyMatch[1], 10) : i + 1;
    const haSDiscount = v.compareAtPrice !== null && v.compareAtPrice > v.price;
    const savePct = haSDiscount ? Math.round((1 - v.price / v.compareAtPrice!) * 100) : 0;

    return {
      id: v.id,
      variantId: v.id,
      qty,
      label: v.title === "Default Title" ? product.title : v.title,
      price: v.price,
      compareAtPrice: haSDiscount ? v.compareAtPrice : null,
      perStrip: `$${(v.price / (qty * STRIPS_PER_BOX)).toFixed(2)}/strip`,
      badge: i === 1 ? "Most Popular" : i === product.variants.length - 1 && product.variants.length > 2 ? "Best Value" : undefined,
      savePct,
    };
  });
}
