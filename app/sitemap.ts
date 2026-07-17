import type { MetadataRoute } from "next";
import { getAllProducts, getShopPolicies } from "@/lib/shopify";
import { CURATED_HANDLES } from "@/lib/products";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.SITE_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://www.sbsupplements.com");

function normalizeUrl(url: string) {
  return url.replace(/\/+$/, "");
}

const baseUrl = normalizeUrl(siteUrl);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, policies] = await Promise.all([getAllProducts(), getShopPolicies()]);

  const productHandles = products.length > 0 ? products.map((product) => product.handle) : CURATED_HANDLES;

  const policyHandles = Object.values(policies).flatMap((policy) => {
    if (!policy || typeof policy !== "object" || !("handle" in policy)) return [];
    return [policy.handle];
  });

  const pages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/products`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    ...productHandles.map((handle) => ({
      url: `${baseUrl}/products/${handle}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...policyHandles.map((handle) => ({
      url: `${baseUrl}/policies/${handle}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.4,
    })),
  ];

  return pages;
}
