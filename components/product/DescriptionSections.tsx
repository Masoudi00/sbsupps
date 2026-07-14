"use client";
import { useState, ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

export type Section = { id: string; heading: string; content: ReactNode };

export default function DescriptionSections({ sections }: { sections: Section[] }) {
  const [openId, setOpenId] = useState<string | null>(sections[0]?.id ?? null);

  if (sections.length === 0) return null;

  return (
    <section className="py-20 sm:py-24 border-t border-line">
      <div className="mx-auto max-w-[1400px] px-6 sm:px-8">
        {/* Desktop: everything visible, generously spaced */}
        <div className="hidden sm:block max-w-3xl mx-auto space-y-16">
          {sections.map((s) => (
            <div key={s.id} id={s.id}>
              <h2 className="font-light text-3xl text-charcoal tracking-[-0.02em] mb-5">{s.heading}</h2>
              <div className="prose-section text-[15.5px] leading-[1.75] text-charcoal/80 font-light">{s.content}</div>
            </div>
          ))}
        </div>

        {/* Mobile: accordion */}
        <div className="sm:hidden max-w-3xl mx-auto space-y-2">
          {sections.map((s) => {
            const open = openId === s.id;
            return (
              <div key={s.id} className={`rounded-2xl border transition-colors duration-300 overflow-hidden ${open ? "border-burgundy-300 bg-white" : "border-line bg-white/50"}`}>
                <button
                  onClick={() => setOpenId(open ? null : s.id)}
                  aria-expanded={open}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4.5 text-left"
                >
                  <span className="font-medium text-charcoal text-[15px]">{s.heading}</span>
                  <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}>
                    <ChevronDown size={16} className="text-burgundy-500 flex-shrink-0" />
                  </motion.span>
                </button>
                <AnimatePresence>
                  {open && (
                    <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }} className="overflow-hidden">
                      <div className="px-5 pb-5 prose-section text-[14px] leading-[1.75] text-charcoal/80 font-light">{s.content}</div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
