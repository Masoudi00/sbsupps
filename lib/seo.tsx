import { ShopifyProduct } from "@/lib/shopify";
import { Bundle } from "@/lib/bundles";

export const SITE_URL = "https://www.sbsupps.store";
export const SITE_NAME = "SB Supplements";
export const SITE_DESCRIPTION =
  "Single-ingredient supplements, precisely dosed and third-party tested. Micronized Creatine Monohydrate and pure L-Glutamine Powder — nothing else.";
/** Used for Twitter Card metadata. Update if/when a real @handle exists. */
export const TWITTER_HANDLE: string | undefined = undefined;

export function absoluteUrl(path: string): string {
  return new URL(path, SITE_URL).toString();
}

/**
 * Renders a JSON-LD <script> tag. Escapes `<` so the JSON payload can never
 * prematurely close the script tag or inject markup, without needing a
 * client-side sanitizer — this is plain data going straight into HTML.
 */
export function JsonLd({ data }: { data: object }) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: SITE_URL,
    logo: absoluteUrl("/logo.svg"),
    email: "support@sbsupplements.com",
  };
}

export function websiteSchema() {
  // No SearchAction here on purpose: the site doesn't have a working search
  // endpoint yet, and Google's guidelines require the action to resolve to
  // real results. Add `potentialAction` once /search (or similar) exists —
  // shipping it now would be structured data that doesn't match reality.
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: SITE_NAME,
    publisher: { "@id": `${SITE_URL}/#organization` },
  };
}

export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

/**
 * Builds Product schema from live Shopify data only — price, currency,
 * availability, and images all come straight from the connected store.
 *
 * Deliberately omits `review`/`aggregateRating`: the testimonials currently
 * shown on product pages are placeholder copy, not verified customer
 * reviews. Marking them up as schema would violate Google's structured
 * data policies (and Merchant Center's) and is genuinely misleading. Once
 * a real reviews platform (Judge.me, Loox, Shopify Product Reviews, etc.)
 * is connected, pull real aggregate rating/review data from it here.
 */
export function productSchema({
  product,
  bundles,
  path,
}: {
  product: ShopifyProduct;
  bundles: Bundle[];
  path: string;
}) {
  const url = absoluteUrl(path);
  const prices = bundles.map((b) => b.price).filter((p) => p > 0);
  const lowPrice = prices.length ? Math.min(...prices) : undefined;
  const highPrice = prices.length ? Math.max(...prices) : undefined;
  const anyAvailable = product.variants.some((v) => v.available);

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${url}#product`,
    name: product.title,
    description: product.description || undefined,
    image: product.images.map((img) => img.url),
    sku: product.id.split("/").pop(),
    brand: { "@type": "Brand", name: SITE_NAME },
    url,
    offers:
      prices.length > 0
        ? {
            "@type": "AggregateOffer",
            priceCurrency: "USD",
            lowPrice: lowPrice?.toFixed(2),
            highPrice: highPrice?.toFixed(2),
            offerCount: bundles.length,
            availability: anyAvailable
              ? "https://schema.org/InStock"
              : "https://schema.org/OutOfStock",
            url,
          }
        : undefined,
  };
}

export function faqSchema(items: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}

export function collectionPageSchema({
  name,
  path,
  products,
}: {
  name: string;
  path: string;
  products: ShopifyProduct[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    url: absoluteUrl(path),
    mainEntity: {
      "@type": "ItemList",
      itemListElement: products.map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: absoluteUrl(`/products/${p.handle}`),
      })),
    },
  };
}
