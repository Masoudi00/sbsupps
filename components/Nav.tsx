"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ShoppingBag, Menu, X } from "lucide-react";
import { useStore } from "@/lib/store";
import Logo from "@/components/ui/Logo";

const LINKS = [
  ["Products", "/products"],
  ["Science", "/#science"],
  ["Reviews", "/#reviews"],
];

export default function Nav() {
  const { count, dispatch } = useStore();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 8);
    h();
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <>
      <div className="bg-charcoal text-cream/70 h-9 flex items-center justify-center">
        <p className="text-[11px] font-medium tracking-[0.08em]">Complimentary shipping on orders over $60</p>
      </div>

      <header
        className={`sticky top-0 z-40 border-b transition-all duration-500 ${
          scrolled ? "bg-cream/85 backdrop-blur-xl shadow-soft border-line" : "bg-cream border-transparent"
        }`}
      >
        <div className="mx-auto max-w-6xl px-5 sm:px-8 h-[72px] flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2.5 flex-shrink-0 group">
            <Logo size={26} />
            <span className="font-semibold text-[17px] text-charcoal tracking-[-0.01em]">
              SB<span className="font-light text-stone"> Supplements</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-9">
            {LINKS.map(([l, h]) => (
              <Link
                key={h}
                href={h}
                className="relative text-[13.5px] font-medium text-stone hover:text-charcoal transition-colors duration-300 py-1 after:absolute after:left-0 after:-bottom-0.5 after:h-px after:w-0 after:bg-burgundy-500 after:transition-all after:duration-300 hover:after:w-full"
              >
                {l}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1">
            <button
              onClick={() => dispatch({ type: "OPEN" })}
              className="relative p-2.5 rounded-full hover:bg-black/[0.04] transition-colors duration-300"
              aria-label="Open cart"
            >
              <ShoppingBag size={18} strokeWidth={1.6} className="text-charcoal" />
              {count > 0 && (
                <motion.span
                  key={count}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 15 }}
                  className="absolute top-1 right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-burgundy-500 text-[8px] font-bold text-cream"
                >
                  {count}
                </motion.span>
              )}
            </button>
            <button
              className="md:hidden p-2.5 rounded-full hover:bg-black/[0.04] transition-colors duration-300"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={18} strokeWidth={1.6} className="text-charcoal" />
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-50 bg-charcoal/40 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 32, stiffness: 320 }}
              className="fixed inset-y-0 right-0 z-50 w-[85vw] max-w-80 bg-cream shadow-lift flex flex-col"
            >
              <div className="flex justify-between items-center p-6 border-b border-line">
                <span className="font-semibold text-charcoal">SB Supplements</span>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-1.5 rounded-full hover:bg-black/[0.04] transition-colors"
                  aria-label="Close menu"
                >
                  <X size={18} />
                </button>
              </div>
              <nav className="flex-1 p-6 space-y-1">
                {LINKS.map(([l, h]) => (
                  <Link
                    key={h}
                    href={h}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center rounded-xl px-4 py-3.5 text-[15px] font-medium text-charcoal hover:bg-blush-100 transition-colors duration-300"
                  >
                    {l}
                  </Link>
                ))}
              </nav>
              <div className="p-6 border-t border-line">
                <Link
                  href="/products"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center w-full rounded-full bg-charcoal py-3.5 text-[13.5px] font-medium text-cream hover:bg-burgundy-600 transition-colors duration-300"
                >
                  Shop All Products
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
