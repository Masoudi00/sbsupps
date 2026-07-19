"use client";
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Check, ShieldCheck, Truck, RotateCcw, ArrowRight, Plus, Minus,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { ShopifyProduct, ShopPolicies } from "@/lib/shopify";
import { Bundle } from "@/lib/bundles";
import { ProductContent } from "@/lib/products";
import { parseDescriptionSections, extractBadgeGrid } from "@/lib/parseDescription";
import { GENERIC_PRODUCT_FAQ } from "@/lib/faq";
import { Stars, FadeUp, Eyebrow } from "@/components/ui/Motion";
import Button from "@/components/ui/Button";
import Ribbon from "@/components/ui/Ribbon";
import Footer from "@/components/Footer";
import ProductGallery from "@/components/ProductGallery";
import DescriptionSections, { Section } from "@/components/product/DescriptionSections";
import BadgeGrid from "@/components/product/BadgeGrid";

const REVIEW_TEMPLATES = [
  { name: "Jordan P.", text: "No taste, no grit, fully dissolved. First supplement I've taken where I genuinely forget I'm taking anything.", stars: 5, date: "June 2026" },
  { name: "Simone K.", text: "The labeling is exact and the packaging doesn't embarrass me at the gym. Small thing, but it matters.", stars: 5, date: "May 2026" },
  { name: "Rhys A.", text: "Did the research on dosing before buying — this matches published studies exactly. Rare to find that.", stars: 5, date: "June 2026" },
];

type FaqPage = { title: string; handle: string; body: string } | null;

export default function ProductExperience({
  product,
  bundles,
  content,
  products = [],
  policies,
  faqPage = null,
}: {
  product: ShopifyProduct | null;
  bundles: Bundle[];
  content: ProductContent;
  products?: ShopifyProduct[];
  policies?: ShopPolicies;
  faqPage?: FaqPage;
}) {
  const [bundle, setBundle] = useState<Bundle>(bundles[1] ?? bundles[0]);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const { dispatch } = useStore();

  const isLight = content.tone === "light";
  const name = product?.title ?? "SB Supplements";
  const description =
    product?.description ||
    "One active ingredient, dosed precisely and tested independently — nothing else in the formula.";
  const hasSupplementFacts = Boolean(content.servingSize || (content.activeIngredients && content.activeIngredients.length > 0));

  // If the selected bundle maps to a real Shopify variant with its own image
  // (e.g. a flavor variant), the gallery resets to that image — remounted via
  // `key` below so this is a plain derived value, not state synced in an effect.
  const activeVariantImageIndex = useMemo(() => {
    if (!product || !bundle.variantId) return 0;
    const url = product.variants.find((v) => v.id === bundle.variantId)?.image?.url;
    if (!url) return 0;
    const i = product.images.findIndex((img) => img.url === url);
    return i === -1 ? 0 : i;
  }, [product, bundle]);

  // Prefer the selected variant's own image (e.g. a flavor shot); fall back
  // to the product's primary image so the cart/drawer always has something.
  const cartImage = useMemo(() => {
    const variantImage = product?.variants.find((v) => v.id === bundle.variantId)?.image?.url;
    return variantImage ?? product?.images?.[0]?.url ?? "";
  }, [product, bundle]);

  function addToCart() {
    dispatch({
      type: "ADD",
      item: {
        id: `${content.handle}-${bundle.id}`,
        name,
        variant: bundle.label,
        price: bundle.price,
        qty,
        image: cartImage,
        variantId: bundle.variantId,
      },
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  const sections = useMemo(() => {
    const list: Section[] = [];

    // 1. Overview — parsed straight from the real Shopify description.
    const parsed = parseDescriptionSections(product?.descriptionHtml);
    parsed.forEach((s, i) => {
      const { badges, html: cleanedHtml } = extractBadgeGrid(s.html);
      list.push({
        id: `overview-${i}`,
        heading: s.heading,
        content: (
          <>
            <div dangerouslySetInnerHTML={{ __html: cleanedHtml }} />
            <BadgeGrid badges={badges} />
          </>
        ),
      });
    });

    // 2. Benefits — the editorial "Standard" points.
    list.push({
      id: "benefits",
      heading: "Benefits",
      content: (
        <div className="grid sm:grid-cols-2 gap-x-8 gap-y-5">
          {content.standard.map((item) => (
            <div key={item.title}>
              <p className="font-medium text-charcoal mb-1">{item.title}</p>
              <p className="text-[14.5px] text-charcoal/70">{item.body}</p>
            </div>
          ))}
        </div>
      ),
    });

    // 3. How It Works / Ingredients
    list.push({
      id: "ingredients",
      heading: content.activeCompound.title,
      content: <p>{content.activeCompound.body}</p>,
    });

    // 4. Suggested Use
    list.push({
      id: "suggested-use",
      heading: "Suggested Use",
      content: <p>{content.suggestedUse}</p>,
    });

    // 5. Supplement Facts (only if we have curated facts for this product)
    if (hasSupplementFacts) {
      list.push({
        id: "supplement-facts",
        heading: "Supplement Facts",
        content: (
          <dl className="divide-y divide-line">
            {content.servingSize && (
              <div className="flex justify-between py-2.5">
                <dt className="text-charcoal/60">Serving Size</dt>
                <dd className="font-medium text-charcoal">{content.servingSize}</dd>
              </div>
            )}
            {content.servingsPerContainer && (
              <div className="flex justify-between py-2.5">
                <dt className="text-charcoal/60">Servings Per Container</dt>
                <dd className="font-medium text-charcoal">{content.servingsPerContainer}</dd>
              </div>
            )}
            {content.activeIngredients && content.activeIngredients.length > 0 && (
              <>
                <div className="hairline my-1" />
                {content.activeIngredients.map((ing) => (
                  <div key={ing.name} className="flex justify-between py-2.5 gap-4">
                    <dt className="font-medium text-charcoal">{ing.name}</dt>
                    <dd className="font-medium text-charcoal text-right flex-shrink-0">{ing.amount}</dd>
                  </div>
                ))}
              </>
            )}
            {content.otherIngredients && (
              <div className="py-2.5 text-[13.5px]">Other Ingredients: {content.otherIngredients}</div>
            )}
          </dl>
        ),
      });
    }

    // 6. Shipping
    list.push({
      id: "shipping",
      heading: "Shipping",
      content: policies?.shippingPolicy ? (
        <p>
          Free shipping on orders over $60. See our{" "}
          <a href={`/policies/${policies.shippingPolicy.handle}`}>full shipping policy</a> for delivery windows and rates.
        </p>
      ) : (
        <p>Free shipping on orders over $60. Orders ship within 1–2 business days and typically arrive in 2–5 business days.</p>
      ),
    });

    // 7. FAQ
    list.push({
      id: "faq",
      heading: faqPage?.title ?? "FAQ",
      content: faqPage ? (
        <div dangerouslySetInnerHTML={{ __html: faqPage.body }} />
      ) : (
        <div className="space-y-5">
          {GENERIC_PRODUCT_FAQ.map((item) => (
            <div key={item.question}>
              <p className="font-medium text-charcoal mb-1">{item.question}</p>
              <p className="text-[14.5px] text-charcoal/70">{item.answer}</p>
            </div>
          ))}
        </div>
      ),
    });

    return list;
  }, [product, content, hasSupplementFacts, policies, faqPage]);

  return (
    <main>
      {/* ══════════════════════════ GALLERY + PURCHASE ══════════════════════════ */}
      <section className={`relative overflow-hidden ${isLight ? "bg-blush-50" : "bg-mauve-600"}`}>
        <Ribbon
          tone={isLight ? "blush" : "burgundy"}
          className={`absolute -top-20 -right-32 w-[34rem] h-[34rem] pointer-events-none ${isLight ? "opacity-60" : "opacity-30"}`}
        />

        <div className="relative mx-auto max-w-[1400px] px-6 sm:px-8 pt-8 pb-16 sm:pt-12 sm:pb-24">
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-14">
            {/* Gallery — always first, so it's first on mobile too */}
            <div className="lg:col-span-7">
              <ProductGallery
                key={bundle.variantId ?? "default"}
                images={product?.images ?? []}
                productName={name}
                tone={content.tone}
                initialIndex={activeVariantImageIndex}
              />
            </div>

            {/* Purchase column — sticky on desktop */}
            <div className="lg:col-span-5">
              <div className="lg:sticky lg:top-28 lg:self-start" id="product">
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}>
                  <Eyebrow tone={isLight ? "dark" : "light"}>Health · {content.tags[0]}</Eyebrow>
                  <h1 className={`font-light text-[2.25rem] sm:text-[2.75rem] leading-[1.05] tracking-[-0.02em] mb-3 ${isLight ? "text-charcoal" : "text-cream"}`}>
                    {name}
                  </h1>
                  <div className="flex items-center gap-2 mb-4">
                    <Stars n={5} size={14} />
                    <span className={`text-[13px] font-medium ${isLight ? "text-stone" : "text-cream/80"}`}>4.9 (900+ reviews)</span>
                  </div>
                  <p className={`text-[15px] leading-relaxed mb-6 font-light line-clamp-3 ${isLight ? "text-stone" : "text-cream/90"}`}>
                    {description}
                  </p>
                  {product && product.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-8">
                      {product.tags.map((tag) => (
                        <span
                          key={tag}
                          className={`text-[11px] font-medium rounded-full px-3 py-1.5 whitespace-nowrap ${
                            isLight ? "bg-blush-100 text-burgundy-600" : "bg-white/10 text-cream/90"
                          }`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                  className="rounded-[28px] bg-white shadow-lift p-6 sm:p-7"
                >
                  {/* Variant / bundle selector */}
                  <fieldset className="space-y-2.5 mb-6">
                    <legend className="text-[11px] font-medium text-stone uppercase tracking-[0.1em] mb-2.5">Choose an option</legend>
                    {bundles.map((b) => (
                      <button
                        key={b.id}
                        onClick={() => setBundle(b)}
                        aria-pressed={bundle.id === b.id}
                        className={`relative w-full rounded-2xl border p-4 text-left transition-all duration-300 ${
                          bundle.id === b.id ? "border-burgundy-500 bg-blush-50" : "border-line hover:border-burgundy-300"
                        }`}
                      >
                        {b.badge && (
                          <span className="absolute -top-2.5 left-5 rounded-full bg-charcoal text-cream text-[9.5px] font-semibold px-3 py-0.5 uppercase tracking-[0.08em]">
                            {b.badge}
                          </span>
                        )}
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 transition-colors duration-300 ${bundle.id === b.id ? "border-burgundy-500 bg-burgundy-500" : "border-line"}`}>
                              {bundle.id === b.id && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                            </div>
                            <div>
                              <p className="font-medium text-[14px] text-charcoal leading-none">{b.label}</p>
                              <p className="text-[12px] text-stone mt-1">{b.perStrip}</p>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div className="flex items-baseline gap-2 justify-end">
                              <p className="font-semibold text-[17px] text-charcoal leading-none">${b.price.toFixed(2)}</p>
                              {b.compareAtPrice && (
                                <p className="text-[12px] text-stone/70 line-through leading-none">${b.compareAtPrice.toFixed(2)}</p>
                              )}
                            </div>
                            {b.savePct > 0 && <p className="text-[11px] font-medium text-burgundy-600 mt-1">Save {b.savePct}%</p>}
                          </div>
                        </div>
                      </button>
                    ))}
                  </fieldset>

                  <div className="flex items-center gap-3 mb-6">
                    <label htmlFor="qty" className="text-[11px] font-medium text-stone uppercase tracking-[0.1em]">Qty</label>
                    <div className="flex items-center gap-0 rounded-full border border-line overflow-hidden">
                      <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="px-3.5 py-2.5 hover:bg-blush-50 transition-colors duration-300 text-stone" aria-label="Decrease quantity">
                        <Minus size={13} />
                      </button>
                      <span id="qty" className="w-9 text-center font-semibold text-charcoal" aria-live="polite">{qty}</span>
                      <button onClick={() => setQty((q) => q + 1)} className="px-3.5 py-2.5 hover:bg-blush-50 transition-colors duration-300 text-stone" aria-label="Increase quantity">
                        <Plus size={13} />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-baseline gap-3 mb-5">
                    <span className="text-3xl font-light text-charcoal tracking-[-0.02em]">${(bundle.price * qty).toFixed(2)}</span>
                    {bundle.compareAtPrice && (
                      <span className="text-lg text-stone/70 line-through">${(bundle.compareAtPrice * qty).toFixed(2)}</span>
                    )}
                  </div>

                  <Button onClick={addToCart} size="lg" className="w-full" variant="solid">
                    {added ? <><Check size={17} strokeWidth={2.5} /> Added to bag</> : <>Add to Bag · ${(bundle.price * qty).toFixed(2)}</>}
                  </Button>

                  <div className="grid grid-cols-3 gap-2 mt-5">
                    {[{ Icon: ShieldCheck, t: "30-Day" }, { Icon: Truck, t: "Free Ship" }, { Icon: RotateCcw, t: "Easy Returns" }].map(({ Icon, t }) => (
                      <div key={t} className="flex flex-col items-center gap-1.5 rounded-xl bg-blush-50/60 py-3 px-2 text-center">
                        <Icon size={14} strokeWidth={1.4} className="text-burgundy-500" />
                        <span className="text-[10px] font-medium text-stone">{t}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════ FULL-WIDTH DESCRIPTION SECTIONS ══════════════════════════ */}
      <DescriptionSections sections={sections} />

      {/* ══════════════════════════ REVIEWS ══════════════════════════ */}
      <section id="reviews" className="py-24 sm:py-32 border-t border-line">
        <div className="mx-auto max-w-[1400px] px-6 sm:px-8">
          <FadeUp className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-14">
            <div>
              <Eyebrow>Reviews</Eyebrow>
              <h2 className="font-light text-4xl text-charcoal tracking-[-0.02em]">
                What people <span className="font-semibold italic">notice first.</span>
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <Stars n={5} size={16} />
              <p className="font-medium text-charcoal">4.9/5 · 900+ reviews</p>
            </div>
          </FadeUp>

          <div className="grid sm:grid-cols-3 gap-8">
            {REVIEW_TEMPLATES.map((r, i) => (
              <FadeUp key={r.name} delay={i * 0.08}>
                <div className="flex flex-col gap-5 h-full">
                  <Stars n={r.stars} size={13} />
                  <p className="text-[15px] text-charcoal leading-relaxed font-light flex-1">&ldquo;{r.text}&rdquo;</p>
                  <div className="flex items-center justify-between">
                    <p className="text-[13px] font-medium text-stone">{r.name}</p>
                    <p className="text-[11px] text-stone/70">{r.date}</p>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════ GUARANTEE ══════════════════════════ */}
      <section className="pb-24 sm:pb-32">
        <div className="mx-auto max-w-[1400px] px-6 sm:px-8">
          <FadeUp className="relative overflow-hidden rounded-[32px] bg-charcoal px-8 py-16 sm:px-16 sm:py-20 text-center">
            <Ribbon tone="burgundy" className="absolute -left-20 -top-20 w-80 h-80 opacity-30 pointer-events-none" />
            <Ribbon tone="mauve" flip className="absolute -right-20 -bottom-20 w-80 h-80 opacity-25 pointer-events-none" />
            <div className="relative">
              <div className="w-14 h-14 rounded-full bg-cream/10 border border-cream/15 flex items-center justify-center mx-auto mb-6">
                <ShieldCheck size={22} strokeWidth={1.4} className="text-cream" />
              </div>
              <h2 className="font-light text-3xl sm:text-4xl text-cream tracking-[-0.02em] max-w-lg mx-auto">
                Works or it&apos;s free. <span className="font-semibold italic">No fine print.</span>
              </h2>
              <p className="mt-5 text-cream/90 leading-relaxed max-w-md mx-auto font-light text-[14.5px]">
                Try {name} for 30 days. If it isn&apos;t right for you, email us and we&apos;ll refund every penny.
              </p>
              <div className="mt-8">
                <a href="#product">
                  <Button variant="glass" size="lg" className="mx-auto text-cream" icon={<ArrowRight size={15} />}>
                    Try Risk-Free
                  </Button>
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
