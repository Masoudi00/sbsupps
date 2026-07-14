import { notFound } from "next/navigation";
import { getAllProducts, getProduct, getShopPolicies, getPage } from "@/lib/shopify";
import { getBundles } from "@/lib/bundles";
import { getProductContent, CURATED_HANDLES } from "@/lib/products";
import ProductExperience from "@/components/ProductExperience";

/**
 * Generates one route per product actually in the connected Shopify store,
 * so every product (including bundles) gets a page automatically — nothing
 * to hardcode here. Falls back to the curated handles if Shopify isn't
 * configured yet, so the site still has something to show.
 */
export async function generateStaticParams() {
  const products = await getAllProducts();
  if (products.length) return products.map((p) => ({ handle: p.handle }));
  return CURATED_HANDLES.map((handle) => ({ handle }));
}

export async function generateMetadata({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const product = await getProduct(handle);
  if (!product) return {};
  return {
    title: `${product.title} — SD Supplements`,
    description: product.description?.slice(0, 160),
  };
}

export default async function ProductPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const [product, products, policies, faqPage] = await Promise.all([
    getProduct(handle),
    getAllProducts(),
    getShopPolicies(),
    getPage("faq"),
  ]);

  if (!product && !CURATED_HANDLES.includes(handle)) notFound();

  const content = getProductContent(handle, product);
  const bundles = getBundles(product);

  return (
    <ProductExperience
      product={product}
      bundles={bundles}
      content={content}
      products={products}
      policies={policies}
      faqPage={faqPage}
    />
  );
}
