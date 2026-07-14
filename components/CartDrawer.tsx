"use client";
import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { X, Plus, Minus, ShoppingBag, ArrowRight, Loader2 } from "lucide-react";
import { useStore } from "@/lib/store";

const FREE_SHIP = 60;

export default function CartDrawer() {
  const { items, drawerOpen, dispatch, subtotal, count } = useStore();
  const pct = Math.min((subtotal / FREE_SHIP) * 100, 100);
  const left = Math.max(FREE_SHIP - subtotal, 0);
  const [checkingOut, setCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  async function handleCheckout() {
    const lines = items.filter((i) => i.variantId).map((i) => ({ merchandiseId: i.variantId!, quantity: i.qty }));

    if (!lines.length) {
      setCheckoutError("Connect Shopify in .env.local to enable live checkout.");
      return;
    }

    setCheckingOut(true);
    setCheckoutError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lines }),
      });
      const data = await res.json();
      if (!res.ok || !data.checkoutUrl) throw new Error(data.error || "Checkout failed");
      window.location.href = data.checkoutUrl;
    } catch (err) {
      setCheckoutError(err instanceof Error ? err.message : "Checkout failed. Please try again.");
      setCheckingOut(false);
    }
  }

  return (
    <AnimatePresence>
      {drawerOpen && (
        <>
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 bg-charcoal/35 backdrop-blur-sm"
            onClick={() => dispatch({ type: "CLOSE" })}
          />
          <motion.aside
            key="drawer"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 320 }}
            className="fixed right-0 top-0 z-50 h-[100dvh] w-full max-w-sm bg-cream flex flex-col shadow-lift"
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-line">
              <span className="font-semibold text-charcoal text-[15px] tracking-[-0.01em]">Bag ({count})</span>
              <button
                onClick={() => dispatch({ type: "CLOSE" })}
                className="rounded-full p-1.5 hover:bg-black/[0.04] transition-colors duration-300"
                aria-label="Close cart"
              >
                <X size={16} />
              </button>
            </div>

            <div className="px-6 py-4 bg-blush-100">
              <p className="text-[12px] font-medium text-burgundy-600 mb-2">
                {left > 0 ? (
                  <>${left.toFixed(2)} away from complimentary shipping</>
                ) : (
                  <>You&apos;ve unlocked complimentary shipping</>
                )}
              </p>
              <div className="h-[3px] rounded-full bg-white/70 overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-burgundy-500"
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-3">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
                  <div className="w-14 h-14 rounded-full bg-blush-100 flex items-center justify-center">
                    <ShoppingBag size={22} strokeWidth={1.4} className="text-burgundy-500" />
                  </div>
                  <p className="font-medium text-[15px] text-charcoal">Your bag is empty</p>
                  <button
                    onClick={() => dispatch({ type: "CLOSE" })}
                    className="text-[13px] font-medium text-burgundy-600 underline underline-offset-4"
                  >
                    Continue shopping
                  </button>
                </div>
              ) : (
                items.map((item) => (
                  <motion.div
                    layout
                    key={item.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex gap-3 bg-white rounded-2xl p-3 border border-line/70"
                  >
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-blush-200 to-rose-300">
                      {item.image && (
                        <Image src={item.image} alt={item.name} fill sizes="64px" className="object-cover" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-[13.5px] text-charcoal leading-tight truncate">{item.name}</p>
                      <p className="text-[11.5px] text-stone mt-0.5">{item.variant}</p>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-0 rounded-full border border-line overflow-hidden">
                          <button
                            onClick={() => dispatch({ type: "DEC", id: item.id })}
                            className="px-2.5 py-1.5 hover:bg-blush-100 transition-colors text-xs"
                            aria-label="Decrease quantity"
                          >
                            <Minus size={11} />
                          </button>
                          <span className="w-6 text-center text-xs font-semibold">{item.qty}</span>
                          <button
                            onClick={() => dispatch({ type: "INC", id: item.id })}
                            className="px-2.5 py-1.5 hover:bg-blush-100 transition-colors text-xs"
                            aria-label="Increase quantity"
                          >
                            <Plus size={11} />
                          </button>
                        </div>
                        <span className="font-semibold text-[13.5px] text-charcoal">${(item.price * item.qty).toFixed(2)}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => dispatch({ type: "REMOVE", id: item.id })}
                      className="self-start text-stone hover:text-burgundy-600 p-0.5 transition-colors duration-300"
                      aria-label="Remove item"
                    >
                      <X size={14} />
                    </button>
                  </motion.div>
                ))
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t border-line px-6 py-6 space-y-3 bg-white">
                <div className="flex justify-between items-center">
                  <span className="text-[13px] text-stone font-medium">Subtotal</span>
                  <span className="font-semibold text-lg text-charcoal">${subtotal.toFixed(2)}</span>
                </div>
                <button
                  onClick={handleCheckout}
                  disabled={checkingOut}
                  className="w-full rounded-full bg-charcoal py-4 text-[13.5px] font-medium text-cream hover:bg-burgundy-600 transition-colors duration-300 flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {checkingOut ? (
                    <><Loader2 size={16} className="animate-spin" /> Redirecting…</>
                  ) : (
                    <>Checkout <ArrowRight size={15} /></>
                  )}
                </button>
                {checkoutError && <p className="text-center text-xs text-burgundy-600">{checkoutError}</p>}
                <p className="text-center text-[11px] text-stone">Secure checkout · 30-day returns</p>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
