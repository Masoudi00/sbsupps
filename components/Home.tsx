"use client";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useState } from "react";
import { ArrowRight, ArrowUpRight, ShieldCheck, FlaskConical, Leaf, Factory } from "lucide-react";
import { ShopifyProduct, ShopPolicies } from "@/lib/shopify";
import { Bundle } from "@/lib/bundles";
import { ProductContent } from "@/lib/products";
import Ribbon from "@/components/ui/Ribbon";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { FadeUp, Eyebrow, SectionNumber, Stars, CountUp } from "@/components/ui/Motion";
import Footer from "@/components/Footer";


type Entry = { content: ProductContent; product: ShopifyProduct; bundles: Bundle[] };
type FaqPage = { title: string; handle: string } | null;

const TRUST = [
  { Icon: Leaf, label: "Pure Ingredients" },
  { Icon: FlaskConical, label: "Lab Tested" },
  { Icon: ShieldCheck, label: "GMP Certified" },
  { Icon: Factory, label: "Made in the USA" },
];

const TESTIMONIALS = [
  { name: "Daniel R.", text: "The unflavored creatine dissolves completely — no grit, no aftertaste. I stopped noticing I was taking a supplement at all.", stars: 5 },
  { name: "Maya C.", text: "Everything about this feels considered. The dosing is exact, the packaging doesn't look like it belongs in a gym bag full of neon tubs.", stars: 5 },
  { name: "Owen T.", text: "Switched from three different brands to just these two. Simpler regimen, better results, and I actually trust what's in the scoop.", stars: 5 },
];

export default function Home({
  productsWithBundles,
  products,
  policies,
  faqPage,
  shopifyConfigured,
  reviews,
}: {
  productsWithBundles: Entry[];
  products: ShopifyProduct[];
  policies: ShopPolicies;
  faqPage: FaqPage;
  shopifyConfigured: boolean;
  reviews: any;
}) {
  const firstProduct = productsWithBundles[0];
const average =
  reviews.reviews.length > 0
    ? reviews.reviews.reduce(
        (sum: number, r: any) => sum + r.rating,
        0
      ) / reviews.reviews.length
    : 0;

  const [showAllReviews, setShowAllReviews] = useState(false);

  const sortedReviews = [...reviews.reviews].sort((a: any, b: any) => {
    if (b.rating !== a.rating) return b.rating - a.rating;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const visibleReviews = showAllReviews
    ? sortedReviews
    : sortedReviews.slice(0, 3);

  return (
    <main>
      {/* ══════════════════════════ HERO ══════════════════════════ */}
      <section className="relative overflow-hidden bg-cream">
        <Ribbon tone="blush" className="absolute -top-24 -right-40 w-[36rem] h-[36rem] opacity-70 blur-[2px]" />
        <Ribbon tone="mauve" flip className="absolute -bottom-32 -left-32 w-[28rem] h-[28rem] opacity-40 blur-[3px]" />

        <div className="relative mx-auto max-w-6xl px-6 sm:px-8 pt-20 pb-24 sm:pt-28 sm:pb-32">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <Eyebrow>SB Supplements · Health</Eyebrow>
            <h1 className="font-light text-[3rem] sm:text-[5rem] lg:text-[6.2rem] leading-[0.96] tracking-[-0.03em] text-charcoal max-w-4xl">
              Fewer ingredients.<br />
              <span className="font-semibold italic">Better science.</span>
            </h1>
            <p className="mt-8 text-[17px] sm:text-[19px] text-stone leading-relaxed max-w-lg font-light">
              Single-compound supplements, dosed precisely and tested independently. No proprietary blends. No fillers. Nothing to hide.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              {firstProduct ? (
                <Link href={`/products/${firstProduct.product.handle}`}>
                  <Button size="lg" icon={<ArrowRight size={15} />}>Shop {firstProduct.product.title}</Button>
                </Link>
              ) : (
                <a href="#shop">
                  <Button size="lg" icon={<ArrowRight size={15} />}>Shop Now</Button>
                </a>
              )}
              {productsWithBundles.length > 1 && (
                <a href="#shop">
                  <Button size="lg" variant="outline">View All Products</Button>
                </a>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="mt-20 flex flex-wrap gap-x-10 gap-y-4"
          >
            {TRUST.map(({ Icon, label }) => (
              <span key={label} className="flex items-center gap-2 text-[12.5px] font-medium text-charcoal/70 bg-cream/70 backdrop-blur-sm rounded-full px-3.5 py-2">
                <Icon size={15} strokeWidth={1.5} className="text-burgundy-500" />
                {label}
              </span>
            ))}
          </motion.div>
        </div>
      </section>

      <div className="hairline mx-auto max-w-6xl" />

      {/* ══════════════════════════ SHOP GRID ══════════════════════════ */}
      <section id="shop" className="py-24 sm:py-32">
        <div className="mx-auto max-w-6xl px-6 sm:px-8">
          <FadeUp className="flex items-end justify-between gap-6 mb-14 flex-wrap">
            <div>
              <Eyebrow>The Range</Eyebrow>
              <h2 className="font-light text-4xl sm:text-5xl text-charcoal tracking-[-0.02em]">
                {productsWithBundles.length > 1 ? <>Two compounds.<br /></> : null}
                <span className="font-semibold italic">One standard.</span>
              </h2>
            </div>
            <p className="text-[14px] text-stone max-w-xs font-light">
              Every product follows the same rule: one active ingredient, dosed exactly as labeled, verified by an independent lab.
            </p>
          </FadeUp>

          {productsWithBundles.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-line p-14 text-center">
              <p className="text-stone font-light">
                {shopifyConfigured
                  ? "No products found in the connected Shopify store yet."
                  : "Connect Shopify in .env.local to list your products here."}
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {productsWithBundles.map(({ content, product, bundles }, i) => {
                const price = bundles[0]?.price ?? 0;
                const isLight = content.tone === "light";
                const image = product?.images?.[0];
                return (
                  <FadeUp key={content.handle} delay={i * 0.1}>
                    <Link href={`/products/${content.handle}`} className="group block h-full">
                      <div className="relative overflow-hidden rounded-[28px] h-full min-h-[440px] transition-transform duration-500 group-hover:-translate-y-1.5">
                        {/* Background: real product photo, or an illustrated fallback when none exists yet */}
                        <div className="absolute inset-0">
                          {image ? (
                            <Image
                              src={image.url}
                              alt={image.altText || product.title}
                              fill
                              sizes="(max-width: 768px) 100vw, 50vw"
                              className="object-cover transition-all duration-500 sm:group-hover:scale-105 sm:group-hover:blur-md sm:group-hover:brightness-[0.6]"
                            />
                          ) : (
                            <div className={`w-full h-full ${isLight ? "bg-blush-100" : "bg-mauve-600"}`}>
                              <Ribbon
                                tone={isLight ? "blush" : "burgundy"}
                                flip={i % 2 === 1}
                                className={`absolute -right-16 -top-10 w-72 h-72 ${isLight ? "opacity-60" : "opacity-50"}`}
                              />
                            </div>
                          )}
                        </div>

                        {/* Always-visible top row */}
                        <div className="relative z-10 flex items-center justify-between p-9 sm:p-11">
                          <Badge tone={isLight || !image ? "burgundy" : "glass"}>Health</Badge>
                          <span
                            className={`flex items-center justify-center w-9 h-9 rounded-full transition-all duration-500 ${
                              image ? "glass opacity-0 sm:group-hover:opacity-100" : ""
                            }`}
                          >
                            <ArrowUpRight
                              size={18}
                              strokeWidth={1.5}
                              className={`transition-transform duration-500 group-hover:translate-x-1 group-hover:-translate-y-1 ${
                                isLight || !image ? "text-burgundy-600" : "text-cream"
                              }`}
                            />
                          </span>
                        </div>

                        {/* Desktop: name/price/CTA revealed on hover over the (now blurred) photo */}
                        {image ? (
                          <div className="hidden sm:flex absolute inset-0 flex-col justify-end p-11 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                            <p className="text-[13px] font-medium mb-2 text-cream/90">{content.tagline}</p>
                            <h3 className="text-3xl font-light tracking-[-0.02em] mb-4 text-cream">{product.title}</h3>
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-cream">From ${price.toFixed(2)}</span>
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-cream text-charcoal text-[12px] font-medium px-4 py-2">
                                View Product <ArrowRight size={12} />
                              </span>
                            </div>
                          </div>
                        ) : (
                          // No photo yet — the illustrated card has no legibility conflict, so show details directly.
                          <div className="relative z-10 p-9 sm:p-11 -mt-2">
                            <p className={`text-[13px] font-medium mb-2 ${isLight ? "text-burgundy-500" : "text-cream/90"}`}>{content.tagline}</p>
                            <h3 className={`text-3xl sm:text-4xl font-light tracking-[-0.02em] mb-4 ${isLight ? "text-charcoal" : "text-cream"}`}>{product.title}</h3>
                            <span className={`text-sm font-medium ${isLight ? "text-charcoal" : "text-cream"}`}>From ${price.toFixed(2)}</span>
                          </div>
                        )}

                        {/* Mobile: no hover available, so name/price/CTA sit in an always-visible bottom bar */}
                        {image && (
                          <div className="sm:hidden absolute inset-x-0 bottom-0 z-10 p-6 pt-14 bg-gradient-to-t from-charcoal/85 via-charcoal/50 to-transparent">
                            <p className="text-[12px] font-medium mb-1 text-cream/80">{content.tagline}</p>
                            <h3 className="text-xl font-light tracking-[-0.02em] mb-2.5 text-cream">{product.title}</h3>
                            <div className="flex items-center justify-between">
                              <span className="text-[13px] font-medium text-cream">From ${price.toFixed(2)}</span>
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-cream text-charcoal text-[11.5px] font-medium px-3.5 py-1.5">
                                View <ArrowRight size={11} />
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </Link>
                  </FadeUp>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ══════════════════════════ PHILOSOPHY ══════════════════════════ */}
      <section id="science" className="py-24 sm:py-32 bg-blush-50 relative overflow-hidden">
        <div className="mx-auto max-w-6xl px-6 sm:px-8 relative">
          <div className="grid lg:grid-cols-[auto_1fr] gap-8 lg:gap-16 items-start mb-16">
            <SectionNumber n="01" className="hidden lg:block" />
            <div>
              <Eyebrow>The Standard</Eyebrow>
              <h2 className="font-light text-4xl sm:text-5xl lg:text-6xl text-charcoal tracking-[-0.02em] max-w-2xl">
                One ingredient.<br /><span className="font-semibold italic">One job.</span>
              </h2>
              <p className="mt-6 text-[16px] text-stone leading-relaxed max-w-lg font-light">
                No proprietary blends to hide behind. Every SB product lists exactly what&apos;s inside, at exactly the
                dose studied — sourced, milled, and tested to a standard most commodity supplements never reach.
              </p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: "Sourced", body: "Raw compounds selected for purity before a single batch is manufactured." },
              { title: "Milled", body: "Micronized where it matters, for cleaner mixing and faster absorption." },
              { title: "Tested", body: "Independently verified by a third-party lab — every batch, no exceptions." },
              { title: "Dosed", body: "Exactly what the label says. No underfilled scoops, no rounding down." },
            ].map((item, i) => (
              <FadeUp key={item.title} delay={i * 0.08}>
                <div className="rounded-3xl bg-white border border-line p-7 h-full hover:shadow-lift transition-shadow duration-500">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-burgundy-500 mb-3">0{i + 1}</p>
                  <h3 className="font-medium text-charcoal text-lg mb-2">{item.title}</h3>
                  <p className="text-[13.5px] text-stone leading-relaxed">{item.body}</p>
                </div>
              </FadeUp>
            ))}
          </div>

          {productsWithBundles.length > 0 && (
            <FadeUp delay={0.2} className="grid sm:grid-cols-2 gap-6 mt-14">
              {productsWithBundles.map(({ content }) => (
                <div key={content.handle} className="glass rounded-3xl p-8">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-burgundy-500 mb-3">{content.activeCompound.title}</p>
                  <p className="text-[14.5px] text-charcoal/80 leading-relaxed font-light">{content.activeCompound.body}</p>
                  <Link
                    href={`/products/${content.handle}`}
                    className="inline-flex items-center gap-1.5 mt-5 text-[13px] font-medium text-burgundy-600 hover:gap-2.5 transition-all duration-300"
                  >
                    Read the full breakdown <ArrowRight size={13} />
                  </Link>
                </div>
              ))}
            </FadeUp>
          )}
        </div>
      </section>

      {/* ══════════════════════════ STATS ══════════════════════════ */}
      <section className="py-20 border-y border-line">
        <div className="mx-auto max-w-6xl px-6 sm:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
            {[
              { n: 1, label: "Active ingredient per product" },
              { n: 3, label: "Independent lab tests per batch" },
              { n: 100, s: "%", label: "Transparent labeling" },
              { n: 0, label: "Proprietary blends" },
            ].map((s, i) => (
              <FadeUp key={s.label} delay={i * 0.06}>
                <p className="text-4xl sm:text-5xl font-light text-charcoal tracking-[-0.02em]">
                  <CountUp to={s.n} suffix={s.s} />
                </p>
                <p className="text-[12.5px] text-stone mt-2 font-medium">{s.label}</p>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════ REVIEWS ══════════════════════════ */}
{/* ══════════════════════════ REVIEWS ══════════════════════════ */}
<section id="reviews" className="py-24 sm:py-32 bg-blush-50">
  <div className="mx-auto max-w-6xl px-6 sm:px-8">
    <FadeUp className="text-center mb-14">
      <Eyebrow>Reviews</Eyebrow>

      <h2 className="font-light text-4xl sm:text-5xl text-charcoal tracking-[-0.02em]">
        What people <span className="font-semibold italic">notice first.</span>
      </h2>

      <div className="mt-8 flex items-center justify-center gap-3">
        <Stars n={Math.round(average)} size={18} />

        <span className="text-2xl font-semibold text-charcoal">
          {average.toFixed(1)}
        </span>

        <span className="text-stone text-sm">
          ({reviews.reviews.length} reviews)
        </span>
      </div>
    </FadeUp>

    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
      {visibleReviews.map((review: any, i: number) => (
        <FadeUp key={review.id} delay={i * 0.08}>
          <article className="flex h-full flex-col rounded-3xl border border-line bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <Stars n={review.rating} size={15} />

              <span className="text-xs text-stone">
                {new Date(review.created_at).toLocaleDateString("en-US", {
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>

            <h3 className="mb-3 text-lg font-semibold text-charcoal">
              {review.title}
            </h3>

            <p className="flex-1 text-[15px] leading-7 text-stone">
              {review.body}
            </p>

            <div className="mt-8 flex items-center justify-between border-t border-line pt-5">
              <div>
                <p className="font-medium text-charcoal">
                  {review.reviewer.name}
                </p>

                <p className="text-xs text-stone">
                  Customer Review
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-charcoal text-sm font-semibold text-white">
                {review.reviewer.name.charAt(0).toUpperCase()}
              </div>
            </div>
          </article>
        </FadeUp>
      ))}
    </div>

    {reviews.reviews.length > 3 && (
      <FadeUp className="mt-12 flex justify-center">
        <button
          onClick={() => setShowAllReviews(!showAllReviews)}
          className="group inline-flex items-center gap-2 rounded-full border border-charcoal px-6 py-3 text-sm font-medium text-charcoal transition-all duration-300 hover:bg-charcoal hover:text-white"
        >
          {showAllReviews ? "Show Less" : "Show More Reviews"}

          <svg
            className={`h-4 w-4 transition-transform duration-300 ${
              showAllReviews ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      </FadeUp>
    )}
  </div>
</section>
      {/* ══════════════════════════ CTA ══════════════════════════ */}
      <section className="pb-24 sm:pb-32">
        <div className="mx-auto max-w-6xl px-6 sm:px-8">
          <FadeUp className="relative overflow-hidden rounded-[32px] bg-charcoal px-8 py-16 sm:px-16 sm:py-20 text-center">
            <Ribbon tone="burgundy" className="absolute -left-24 -top-24 w-96 h-96 opacity-30" />
            <Ribbon tone="mauve" flip className="absolute -right-24 -bottom-24 w-96 h-96 opacity-25" />
            <div className="relative">
              <h2 className="font-light text-3xl sm:text-5xl text-cream tracking-[-0.02em] max-w-2xl mx-auto">
                Start with what your body <span className="font-semibold italic">actually needs.</span>
              </h2>
              <div className="mt-9 flex flex-wrap justify-center gap-4">
                <a href="#shop">
                  <Button variant="glass" size="lg" className="text-cream" icon={<ArrowRight size={15} />}>Shop the Range</Button>
                </a>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      <Footer products={products} policies={policies} faqPage={faqPage} />
    </main>
  );
}
