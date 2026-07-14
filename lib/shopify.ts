// Minimal Shopify Storefront API client.
// Reads credentials from server-only env vars (never exposed to the client).
// See .env.local for the two values this needs.

const DOMAIN = process.env.SHOPIFY_STORE_DOMAIN; // e.g. "your-store.myshopify.com"
const TOKEN = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
const API_VERSION = "2025-01";

export type ShopifyImage = { url: string; altText: string | null };

export type ShopifyVariant = {
  id: string;
  title: string;
  price: number;
  compareAtPrice: number | null;
  available: boolean;
  image: ShopifyImage | null;
};

export type ShopifyProduct = {
  id: string;
  handle: string;
  title: string;
  description: string;
  descriptionHtml: string;
  images: ShopifyImage[];
  variants: ShopifyVariant[];
  tags: string[];
};

async function shopifyFetch<T>(query: string, variables: Record<string, unknown> = {}): Promise<T | null> {
  if (!DOMAIN || !TOKEN) return null; // Not configured — caller falls back to static content.

  try {
    const res = await fetch(`https://${DOMAIN}/api/${API_VERSION}/graphql.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": TOKEN,
      },
      body: JSON.stringify({ query, variables }),
      // Revalidate product data every 5 minutes rather than on every request.
      next: { revalidate: 300 },
    });

    if (!res.ok) {
      console.error("Shopify Storefront API error:", res.status, await res.text());
      return null;
    }

    const json = await res.json();
    if (json.errors) {
      console.error("Shopify Storefront API GraphQL errors:", json.errors);
      return null;
    }
    return json.data as T;
  } catch (err) {
    console.error("Shopify Storefront API request failed:", err);
    return null;
  }
}

const PRODUCT_QUERY = /* GraphQL */ `
  query ProductByHandle($handle: String!) {
    product(handle: $handle) {
      id
      handle
      title
      description
      descriptionHtml
      tags
      images(first: 20) {
        edges { node { url altText } }
      }
      variants(first: 20) {
        edges {
          node {
            id
            title
            availableForSale
            price { amount }
            compareAtPrice { amount }
            image { url altText }
          }
        }
      }
    }
  }
`;

/**
 * Fetches a single product by its Shopify handle (the slug in the product URL).
 * Returns null if env vars aren't set or the request fails — callers should
 * fall back to static placeholder content in that case.
 */
export async function getProduct(handle: string): Promise<ShopifyProduct | null> {
  const data = await shopifyFetch<{ product: RawProductNode | null }>(PRODUCT_QUERY, { handle });
  const product = data?.product;
  if (!product) return null;
  return mapProduct(product);
}

const PRODUCTS_QUERY = /* GraphQL */ `
  query AllProducts($first: Int!) {
    products(first: $first, sortKey: TITLE) {
      edges {
        node {
          id
          handle
          title
          description
          descriptionHtml
          tags
          images(first: 20) {
            edges { node { url altText } }
          }
          variants(first: 20) {
            edges {
              node {
                id
                title
                availableForSale
                price { amount }
                compareAtPrice { amount }
                image { url altText }
              }
            }
          }
        }
      }
    }
  }
`;

type RawProductNode = {
  id: string;
  handle: string;
  title: string;
  description: string;
  descriptionHtml: string;
  tags: string[];
  images: { edges: { node: { url: string; altText: string | null } }[] };
  variants: {
    edges: {
      node: {
        id: string;
        title: string;
        availableForSale: boolean;
        price: { amount: string };
        compareAtPrice: { amount: string } | null;
        image: { url: string; altText: string | null } | null;
      };
    }[];
  };
};

function mapProduct(product: RawProductNode): ShopifyProduct {
  return {
    id: product.id,
    handle: product.handle,
    title: product.title,
    description: product.description,
    descriptionHtml: product.descriptionHtml,
    tags: product.tags ?? [],
    images: product.images.edges.map((e) => ({ url: e.node.url, altText: e.node.altText })),
    variants: product.variants.edges.map((e) => ({
      id: e.node.id,
      title: e.node.title,
      price: parseFloat(e.node.price.amount),
      compareAtPrice: e.node.compareAtPrice ? parseFloat(e.node.compareAtPrice.amount) : null,
      available: e.node.availableForSale,
      image: e.node.image ? { url: e.node.image.url, altText: e.node.image.altText } : null,
    })),
  };
}

/**
 * Fetches every product currently in the connected Shopify store (up to
 * `first`). This is what powers the homepage shop grid and product routes —
 * whatever exists in Shopify (including bundle products) shows up here
 * automatically, with no per-product hardcoding required on this end.
 * Returns [] if Shopify isn't configured or the request fails.
 */
export async function getAllProducts(first = 24): Promise<ShopifyProduct[]> {
  const data = await shopifyFetch<{ products: { edges: { node: RawProductNode }[] } }>(PRODUCTS_QUERY, { first });
  if (!data?.products) return [];
  return data.products.edges.map((e) => mapProduct(e.node));
}

export type ShopPolicy = { title: string; body: string; handle: string; url: string } | null;

const POLICIES_QUERY = /* GraphQL */ `
  query ShopPolicies {
    shop {
      name
      privacyPolicy { title body handle url }
      refundPolicy { title body handle url }
      shippingPolicy { title body handle url }
      termsOfService { title body handle url }
      subscriptionPolicy { title body handle url }
    }
  }
`;

export type ShopPolicies = {
  shopName: string | null;
  privacyPolicy: ShopPolicy;
  refundPolicy: ShopPolicy;
  shippingPolicy: ShopPolicy;
  termsOfService: ShopPolicy;
  subscriptionPolicy: ShopPolicy;
};

const EMPTY_POLICIES: ShopPolicies = {
  shopName: null,
  privacyPolicy: null,
  refundPolicy: null,
  shippingPolicy: null,
  termsOfService: null,
  subscriptionPolicy: null,
};

/**
 * Fetches the store's real legal/policy pages (privacy, refund, shipping,
 * terms, subscription) exactly as written in Shopify Admin → Settings →
 * Policies. Renders them on-site at /policies/[handle] instead of linking
 * out, so they match the site's design. Returns nulls if unconfigured.
 */
export async function getShopPolicies(): Promise<ShopPolicies> {
  const data = await shopifyFetch<{ shop: Omit<ShopPolicies, "shopName"> & { name: string } }>(POLICIES_QUERY);
  if (!data?.shop) return EMPTY_POLICIES;
  const { name, ...policies } = data.shop;
  return { shopName: name, ...policies };
}

const PAGE_QUERY = /* GraphQL */ `
  query PageByHandle($handle: String!) {
    page(handle: $handle) {
      title
      body
      handle
    }
  }
`;

/**
 * Fetches a generic Shopify "Page" (Online Store → Pages) by handle, e.g.
 * an FAQ page the merchant created. Returns null if it doesn't exist.
 */
export async function getPage(handle: string): Promise<{ title: string; body: string; handle: string } | null> {
  const data = await shopifyFetch<{ page: { title: string; body: string; handle: string } | null }>(PAGE_QUERY, { handle });
  return data?.page ?? null;
}


const CART_CREATE_MUTATION = /* GraphQL */ `
  mutation CartCreate($lines: [CartLineInput!]!) {
    cartCreate(input: { lines: $lines }) {
      cart { id checkoutUrl }
      userErrors { message }
    }
  }
`;

/**
 * Creates a Shopify cart with the given line items and returns the hosted
 * checkout URL to redirect the customer to.
 */
export async function createCheckout(lines: { merchandiseId: string; quantity: number }[]) {
  const data = await shopifyFetch<{
    cartCreate: { cart: { id: string; checkoutUrl: string } | null; userErrors: { message: string }[] };
  }>(CART_CREATE_MUTATION, { lines });

  if (!data?.cartCreate?.cart) return null;
  return data.cartCreate.cart.checkoutUrl;
}

export const isShopifyConfigured = Boolean(DOMAIN && TOKEN);
