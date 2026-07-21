import Link from "next/link";
import Logo from "@/components/ui/Logo";
import { ShopifyProduct, ShopPolicies } from "@/lib/shopify";

type FaqPage = { title: string; handle: string } | null;

export default function Footer({
  products = [],
  policies,
  faqPage = null,
}: {
  products?: ShopifyProduct[];
  policies?: ShopPolicies;
  faqPage?: FaqPage;
}) {
  const policyLinks = policies
    ? [
        policies.shippingPolicy && ["Shipping Policy", policies.shippingPolicy],
        policies.refundPolicy && ["Refund Policy", policies.refundPolicy],
        policies.termsOfService && ["Terms of Service", policies.termsOfService],
        policies.privacyPolicy && ["Privacy Policy", policies.privacyPolicy],
        policies.subscriptionPolicy && ["Subscription Policy", policies.subscriptionPolicy],
      ].filter((x): x is [string, NonNullable<ShopPolicies["shippingPolicy"]>] => Boolean(x))
    : [];

  return (
    <footer className="bg-charcoal text-cream/55">
      <div className="mx-auto max-w-6xl px-6 sm:px-8 py-16 sm:py-20">
        <div className="grid sm:grid-cols-3 gap-12 mb-14">
          <div>
            <div className="flex items-center gap-2.5 mb-5">
              <Logo size={24} tone="cream" />
              <span className="font-semibold text-cream text-[15px] tracking-[-0.01em]">SB Supplements</span>
            </div>
            <p className="text-[13.5px] leading-relaxed max-w-56">
              Single-ingredient supplements, precisely dosed, third-party tested. Nothing else.
            </p>
          </div>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-cream/50 mb-5">Shop</p>
            <ul className="space-y-3">
              {products.length > 0 ? (
                products.map((p) => (
                  <li key={p.handle}>
                    <Link href={`/products/${p.handle}`} className="text-[13.5px] hover:text-cream transition-colors duration-300">
                      {p.title}
                    </Link>
                  </li>
                ))
              ) : (
                <li className="text-[13.5px] text-cream/35">Connect Shopify to list products</li>
              )}
            </ul>
          </div>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-cream/50 mb-5">Support</p>
            <ul className="space-y-3">
              {faqPage && (
                <li>
                  <a href={`#${faqPage.handle}`} className="text-[13.5px] hover:text-cream transition-colors duration-300">
                    {faqPage.title}
                  </a>
                </li>
              )}
              <li>
                <a href="mailto:support@sbsupps.store" className="text-[13.5px] hover:text-cream transition-colors duration-300">
                  Contact Us
                </a>
              </li>
              {policyLinks.map(([label, policy]) => (
                <li key={policy.handle}>
                  <Link href={`/policies/${policy.handle}`} className="text-[13.5px] hover:text-cream transition-colors duration-300">
                    {label}
                  </Link>
                </li>
              ))}
              {policyLinks.length === 0 && (
                <li className="text-[13.5px] text-cream/35">Connect Shopify to show policies</li>
              )}
            </ul>
          </div>
        </div>
        <div className="border-t border-cream/10 pt-8 space-y-3">
          <p className="text-[11.5px] leading-relaxed max-w-3xl text-cream/50">
            *These statements have not been evaluated by the Food and Drug Administration. This product is not
            intended to diagnose, treat, cure, or prevent any disease. Consult your physician before use if
            pregnant, nursing, under 18, or have a medical condition.
          </p>
          <p className="text-[11.5px] text-cream/50">© 2026 SB Supplements · All rights reserved</p>
        </div>
      </div>
    </footer>
  );
}
