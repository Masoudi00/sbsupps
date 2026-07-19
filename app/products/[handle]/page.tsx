import { notFound } from "next/navigation";
import { getAllProducts, getProduct, getShopPolicies, getPage } from "@/lib/shopify";
import { getBundles } from "@/lib/bundles";
import { getProductContent, CURATED_HANDLES } from "@/lib/products";
import { GENERIC_PRODUCT_FAQ } from "@/lib/faq";
import { JsonLd, productSchema, breadcrumbSchema, faqSchema } from "@/lib/seo";
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

function humanizeHandle(handle: string): string {
  return handle.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export async function generateMetadata({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const product = await getProduct(handle);

  if (!product && !CURATED_HANDLES.includes(handle)) return {};

  const path = `/products/${handle}`;
  const title = product?.title ?? humanizeHandle(handle);
  const description = product?.description?.slice(0, 160) || `Shop ${title} at SB Supplements.`;
  const image = product?.images[0]?.url;

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      title,
      description,
      url: path,
      images: image ? [{ url: image, alt: product?.images[0]?.altText || title }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : undefined,
    },
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
  const path = `/products/${handle}`;

  return (
    <>
      {product && <JsonLd data={productSchema({ product, bundles, path })} />}
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Products", path: "/products" },
          { name: product?.title ?? humanizeHandle(handle), path },
        ])}
      />
      {/* Only the generic fallback FAQ has clean structured text to mark up —
          a merchant-authored Shopify Page's FAQ body is arbitrary rich HTML,
          which isn't safe to parse into Question/Answer pairs automatically. */}
      {!faqPage && <JsonLd data={faqSchema(GENERIC_PRODUCT_FAQ.map((f) => ({ question: f.question, answer: f.answer })))} />}
      <ProductExperience
        product={product}
        bundles={bundles}
        content={content}
        products={products}
        policies={policies}
        faqPage={faqPage}
      />
    </>
  );
}
