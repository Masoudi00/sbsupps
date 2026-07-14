import { getAllProducts, getShopPolicies, getPage, isShopifyConfigured } from "@/lib/shopify";
import { getBundles } from "@/lib/bundles";
import { getProductContent } from "@/lib/products";
import Home from "@/components/Home";

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
