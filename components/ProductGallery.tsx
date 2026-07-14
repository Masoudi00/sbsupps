"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ShopifyImage } from "@/lib/shopify";

export default function ProductGallery({
  images,
  productName,
  tone,
  initialIndex = 0,
}: {
  images: ShopifyImage[];
  productName: string;
  tone: "light" | "dark";
  /** Index to start on — pass a new `key` from the parent (e.g. the selected
   *  variant id) alongside this when a variant's image should reset the gallery. */
  initialIndex?: number;
}) {
  const isLight = tone === "light";
  const [index, setIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(false);
  const [origin, setOrigin] = useState("50% 50%");
  const mobileRef = useRef<HTMLDivElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);

  const count = images.length;

  const goTo = useCallback((i: number) => {
    if (count === 0) return;
    setIndex(((i % count) + count) % count);
    setZoom(false);
  }, [count]);

  // Keyboard navigation when the gallery has focus.
  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowLeft") { e.preventDefault(); goTo(index - 1); }
    if (e.key === "ArrowRight") { e.preventDefault(); goTo(index + 1); }
  }

  // Mobile: sync dot indicator to native scroll-snap position.
  useEffect(() => {
    const el = mobileRef.current;
    if (!el) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const i = Math.round(el.scrollLeft / el.clientWidth);
        setIndex((prev) => (prev === i ? prev : i));
      });
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => { el.removeEventListener("scroll", onScroll); cancelAnimationFrame(raf); };
  }, []);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setOrigin(`${x}% ${y}%`);
  }

  if (count === 0) {
    return (
      <div className={`rounded-[28px] aspect-[4/5] flex items-center justify-center ${isLight ? "glass" : "glass-dark"}`}>
        <span className={`text-sm font-medium ${isLight ? "text-stone" : "text-cream/70"}`}>{productName}</span>
      </div>
    );
  }

  return (
    <div ref={galleryRef} onKeyDown={onKeyDown} tabIndex={0} role="group" aria-roledescription="carousel" aria-label={`${productName} images`} className="outline-none">
      {/* ── Desktop: thumbnails + featured image ── */}
      <div className="hidden sm:flex gap-4">
        {count > 1 && (
          <div className="flex flex-col gap-3 w-16 flex-shrink-0 max-h-[560px] overflow-y-auto no-scrollbar">
            {images.map((img, i) => (
              <button
                key={img.url + i}
                onClick={() => goTo(i)}
                aria-label={`View image ${i + 1} of ${count}`}
                aria-current={i === index}
                className={`relative rounded-xl overflow-hidden aspect-square border-2 transition-colors duration-300 flex-shrink-0 ${
                  i === index ? "border-burgundy-500" : "border-line hover:border-burgundy-300"
                }`}
              >
                <Image src={img.url} alt={img.altText || `${productName} thumbnail ${i + 1}`} fill sizes="64px" className="object-cover" />
              </button>
            ))}
          </div>
        )}

        <div
          className={`relative flex-1 rounded-[28px] overflow-hidden aspect-[4/5] bg-white ${zoom ? "cursor-zoom-out" : "cursor-zoom-in"}`}
          onClick={() => setZoom((z) => !z)}
          onMouseMove={zoom ? handleMouseMove : undefined}
          onMouseLeave={() => setZoom(false)}
          role="button"
          tabIndex={-1}
          aria-label={zoom ? "Click to zoom out" : "Click to zoom in"}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0"
            >
              <Image
                src={images[index].url}
                alt={images[index].altText || productName}
                fill
                sizes="(max-width: 1024px) 90vw, 620px"
                className="object-cover transition-transform duration-300 ease-out"
                style={{ transformOrigin: origin, transform: zoom ? "scale(1.5)" : "scale(1)" }}
                priority={index === 0}
              />
            </motion.div>
          </AnimatePresence>

          {count > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); goTo(index - 1); }}
                aria-label="Previous image"
                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full glass flex items-center justify-center hover:scale-105 transition-transform duration-200"
              >
                <ChevronLeft size={16} className="text-charcoal" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); goTo(index + 1); }}
                aria-label="Next image"
                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full glass flex items-center justify-center hover:scale-105 transition-transform duration-200"
              >
                <ChevronRight size={16} className="text-charcoal" />
              </button>
              <span className="absolute bottom-3 right-3 rounded-full bg-charcoal/70 backdrop-blur-sm text-cream text-[11px] font-medium px-2.5 py-1">
                {index + 1} / {count}
              </span>
            </>
          )}
        </div>
      </div>

      {/* ── Mobile: swipe carousel + dots ── */}
      <div className="sm:hidden">
        <div
          ref={mobileRef}
          className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar rounded-[24px]"
          style={{ scrollSnapType: "x mandatory" }}
        >
          {images.map((img, i) => (
            <div key={img.url + i} className="relative w-full flex-shrink-0 aspect-[4/5] snap-center">
              <Image
                src={img.url}
                alt={img.altText || `${productName} ${i + 1}`}
                fill
                sizes="100vw"
                className="object-cover"
                priority={i === 0}
                loading={i === 0 ? "eager" : "lazy"}
              />
            </div>
          ))}
        </div>
        {count > 1 && (
          <div className="flex justify-center gap-1.5 mt-4">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  mobileRef.current?.scrollTo({ left: i * (mobileRef.current?.clientWidth ?? 0), behavior: "smooth" });
                }}
                aria-label={`Go to image ${i + 1}`}
                aria-current={i === index}
                className={`rounded-full transition-all duration-300 ${i === index ? "w-6 h-2 bg-burgundy-500" : "w-2 h-2 bg-burgundy-500/25"}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
