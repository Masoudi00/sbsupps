import type { Metadata } from "next";
import "./globals.css";
import { StoreProvider } from "@/lib/store";
import Nav from "@/components/Nav";
import CartDrawer from "@/components/CartDrawer";

export const metadata: Metadata = {
  title: "SD Supplements — Creatine Monohydrate & L-Glutamine",
  description:
    "Single-ingredient supplements, precisely dosed and third-party tested. Micronized Creatine Monohydrate and pure L-Glutamine Powder — nothing else.",
  keywords: "creatine monohydrate, l-glutamine, supplements, micronized creatine, pure amino acids",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth font-sans">
      <body className="bg-cream text-charcoal antialiased">
        <StoreProvider>
          <Nav />
          {children}
          <CartDrawer />
        </StoreProvider>
      </body>
    </html>
  );
}
