import { getAllProducts, getShopPolicies, getPage, isShopifyConfigured } from "@/lib/shopify";
import { getBundles } from "@/lib/bundles";
import { getProductContent } from "@/lib/products";
import Home from "@/components/Home";

export const metadata = {
  title: "SB Supplements — Creatine Monohydrate & L-Glutamine",
  description:
    "Single-ingredient supplements, precisely dosed and third-party tested. Micronized Creatine Monohydrate and pure L-Glutamine Powder — nothing else.",
  alternates: { canonical: "/" },
};

export default async function Page() {
  const [products, policies, faqPage] = await Promise.all([getAllProducts(), getShopPolicies(), getPage("faq")]);

  const productsWithBundles = products.map((product) => ({
    content: getProductContent(product.handle, product),
    product,
    bundles: getBundles(product),
  }));

  return (
    <Home
      productsWithBundles={productsWithBundles}
      products={products}
      policies={policies}
      faqPage={faqPage}
      shopifyConfigured={isShopifyConfigured}
    />
  );
}
