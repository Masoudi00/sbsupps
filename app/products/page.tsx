import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { getAllProducts, getShopPolicies, getPage } from "@/lib/shopify";
import { getBundles } from "@/lib/bundles";
import { getProductContent } from "@/lib/products";
import Footer from "@/components/Footer";
import Ribbon from "@/components/ui/Ribbon";
import { Eyebrow, FadeUp } from "@/components/ui/Motion";

export const metadata = {
  title: "All Products — SB Supplements",
  description: "Every SB Supplements product, synced live from our store.",
};

export default async function ProductsIndexPage() {
  const [products, policies, faqPage] = await Promise.all([
    getAllProducts(),
    getShopPolicies(),
    getPage("faq"),
  ]);

  return (
    <main>
      <section className="relative overflow-hidden bg-blush-50">
        <Ribbon tone="blush" className="absolute -top-24 -right-40 w-[30rem] h-[30rem] opacity-50 pointer-events-none" />
        <div className="relative mx-auto max-w-6xl px-6 sm:px-8 pt-16 pb-16 sm:pt-20 sm:pb-20">
          <Eyebrow>SB Supplements</Eyebrow>
          <h1 className="font-light text-4xl sm:text-6xl text-charcoal tracking-[-0.02em]">
            All products.<br /><span className="font-semibold italic">One standard.</span>
          </h1>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-6 sm:px-8">
          {products.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-line p-14 text-center">
              <p className="text-stone font-light">Connect Shopify in .env.local to list your products here.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product, i) => {
                const content = getProductContent(product.handle, product);
                const bundles = getBundles(product);
                const price = bundles[0]?.price ?? 0;
                const image = product.images[0];
                return (
                  <FadeUp key={product.handle} delay={i * 0.06}>
                    <Link href={`/products/${product.handle}`} className="group block h-full">
                      <article className="h-full rounded-3xl border border-line bg-white overflow-hidden hover:shadow-lift transition-shadow duration-500">
                        <div className="relative aspect-square bg-blush-50">
                          {image ? (
                            <Image
                              src={image.url}
                              alt={image.altText || product.title}
                              fill
                              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                              className="object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-stone text-sm">{product.title}</div>
                          )}
                        </div>
                        <div className="p-6">
                          <p className="text-[12px] font-medium text-burgundy-500 mb-1.5">{content.tagline}</p>
                          <h2 className="text-xl font-medium text-charcoal tracking-[-0.01em] mb-2">{product.title}</h2>
                          {product.description && (
                            <p className="text-[13.5px] text-stone leading-relaxed line-clamp-2 mb-4">{product.description}</p>
                          )}
                          <div className="flex items-center justify-between">
                            <span className="text-[15px] font-semibold text-charcoal">From ${price.toFixed(2)}</span>
                            <span className="inline-flex items-center gap-1 text-[13px] font-medium text-burgundy-600 group-hover:gap-2 transition-all duration-300">
                              View Product <ArrowRight size={13} />
                            </span>
                          </div>
                        </div>
                      </article>
                    </Link>
                  </FadeUp>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <Footer products={products} policies={policies} faqPage={faqPage} />
    </main>
  );
}
