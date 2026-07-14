"use client";
import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Star } from "lucide-react";

export function Stars({ n, size = 13, className = "" }: { n: number; size?: number; className?: string }) {
  return (
    <span className={`flex gap-0.5 ${className}`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          fill={i <= n ? "var(--color-burgundy-500)" : "none"}
          stroke={i <= n ? "var(--color-burgundy-500)" : "var(--color-line)"}
          strokeWidth={1.5}
        />
      ))}
    </span>
  );
}

export function CountUp({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const duration = 1200;
    const step = (to / duration) * 16;
    const t = setInterval(() => {
      start = Math.min(start + step, to);
      setVal(Math.floor(start));
      if (start >= to) clearInterval(t);
    }, 16);
    return () => clearInterval(t);
  }, [inView, to]);

  return (
    <span ref={ref}>
      {inView ? val.toLocaleString() : 0}
      {suffix}
    </span>
  );
}

export function FadeUp({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function Eyebrow({ children, tone = "dark" }: { children: React.ReactNode; tone?: "dark" | "light" }) {
  return (
    <p
      className={`text-[11px] font-semibold uppercase tracking-[0.22em] mb-4 ${
        tone === "dark" ? "text-burgundy-500" : "text-cream/95"
      }`}
    >
      {children}
    </p>
  );
}

/** Oversized faint numeral used to label sections editorially (e.g. "01"). */
export function SectionNumber({ n, className = "" }: { n: string; className?: string }) {
  return <span className={`section-number text-[7rem] sm:text-[9rem] leading-none select-none ${className}`}>{n}</span>;
}
