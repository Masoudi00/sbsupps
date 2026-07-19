import type { MetadataRoute } from "next";
import { getAllProducts, getShopPolicies, ShopPolicy } from "@/lib/shopify";
import { SITE_URL } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, policies] = await Promise.all([getAllProducts(), getShopPolicies()]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/products`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
  ];

  const productRoutes: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${SITE_URL}/products/${p.handle}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const policyRoutes: MetadataRoute.Sitemap = [
    policies.privacyPolicy,
    policies.refundPolicy,
    policies.shippingPolicy,
    policies.termsOfService,
    policies.subscriptionPolicy,
  ]
    .filter((p): p is NonNullable<ShopPolicy> => Boolean(p))
    .map((p) => ({
      url: `${SITE_URL}/policies/${p.handle}`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    }));

  return [...staticRoutes, ...productRoutes, ...policyRoutes];
}
