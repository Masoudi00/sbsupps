import type { Metadata } from "next";
import "./globals.css";
import { StoreProvider } from "@/lib/store";
import Nav from "@/components/Nav";
import CartDrawer from "@/components/CartDrawer";
import { JsonLd, organizationSchema, websiteSchema, SITE_URL, SITE_NAME, SITE_DESCRIPTION } from "@/lib/seo";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Creatine Monohydrate & L-Glutamine`,
    template: `%s — ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: "creatine monohydrate, l-glutamine, supplements, micronized creatine, pure amino acids",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Creatine Monohydrate & L-Glutamine`,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    locale: "en_US",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: SITE_NAME }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — Creatine Monohydrate & L-Glutamine`,
    description: SITE_DESCRIPTION,
    images: ["/og-image.png"],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth font-sans">
      <body className="bg-cream text-charcoal antialiased">
        <JsonLd data={organizationSchema()} />
        <JsonLd data={websiteSchema()} />
        <StoreProvider>
          <Analytics />
          <Nav />
          {children}
          <CartDrawer />
        </StoreProvider>
      </body>
    </html>
  );
}
