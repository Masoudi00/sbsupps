import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getShopPolicies, getAllProducts, getPage, ShopPolicy } from "@/lib/shopify";
import Footer from "@/components/Footer";
import Ribbon from "@/components/ui/Ribbon";
import { JsonLd, breadcrumbSchema } from "@/lib/seo";

export async function generateStaticParams() {
  const policies = await getShopPolicies();
  return Object.values(policies)
    .filter((p): p is NonNullable<ShopPolicy> => Boolean(p && typeof p === "object" && "handle" in p))
    .map((p) => ({ handle: p.handle }));
}

export async function generateMetadata({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const policies = await getShopPolicies();
  const policy = [
    policies.privacyPolicy,
    policies.refundPolicy,
    policies.shippingPolicy,
    policies.termsOfService,
    policies.subscriptionPolicy,
  ].find((p) => p?.handle === handle);

  if (!policy) return {};

  return {
    title: policy.title,
    description: `${policy.title} for SB Supplements.`,
    alternates: { canonical: `/policies/${handle}` },
    // Legal/policy boilerplate isn't content worth ranking for and can read
    // as thin/duplicate content to search engines — keep it out of the
    // index while still linking it normally from the footer.
    robots: { index: false, follow: true },
  };
}

export default async function PolicyPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const [policies, products, faqPage] = await Promise.all([getShopPolicies(), getAllProducts(), getPage("faq")]);

  const policy = [
    policies.privacyPolicy,
    policies.refundPolicy,
    policies.shippingPolicy,
    policies.termsOfService,
    policies.subscriptionPolicy,
  ].find((p) => p?.handle === handle);

  if (!policy) notFound();

  return (
    <main>
      <JsonLd data={breadcrumbSchema([{ name: "Home", path: "/" }, { name: policy.title, path: `/policies/${handle}` }])} />
      <section className="relative overflow-hidden bg-blush-50">
        <Ribbon tone="blush" className="absolute -top-24 -right-40 w-[28rem] h-[28rem] opacity-50" />
        <div className="relative mx-auto max-w-3xl px-6 sm:px-8 pt-16 pb-20">
          <Link href="/" className="inline-flex items-center gap-1.5 text-[13px] font-medium text-burgundy-600 hover:gap-2.5 transition-all duration-300 mb-8">
            <ArrowLeft size={14} /> Back to home
          </Link>
          <h1 className="font-light text-4xl sm:text-5xl text-charcoal tracking-[-0.02em]">{policy.title}</h1>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-6 sm:px-8">
          <div
            className="policy-content text-[15px] leading-relaxed text-charcoal/85 font-light [&_h1]:font-medium [&_h1]:text-2xl [&_h1]:text-charcoal [&_h1]:mt-10 [&_h1]:mb-4 [&_h2]:font-medium [&_h2]:text-xl [&_h2]:text-charcoal [&_h2]:mt-8 [&_h2]:mb-3 [&_p]:mb-4 [&_ul]:mb-4 [&_ul]:pl-5 [&_li]:mb-2 [&_li]:list-disc [&_a]:text-burgundy-600 [&_a]:underline [&_a]:underline-offset-2"
            dangerouslySetInnerHTML={{ __html: policy.body }}
          />
        </div>
      </section>

      <Footer products={products} policies={policies} faqPage={faqPage} />
    </main>
  );
}
