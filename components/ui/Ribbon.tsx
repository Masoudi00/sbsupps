"use client";
import { motion } from "framer-motion";

type Tone = "blush" | "rose" | "mauve" | "burgundy";

const TONES: Record<Tone, { a: string; b: string }> = {
  blush: { a: "#F5D9D7", b: "#EFC5C3" },
  rose: { a: "#E3B2B4", b: "#CE8B93" },
  mauve: { a: "#CE8B93", b: "#A9677A" },
  burgundy: { a: "#B76F7C", b: "#7E3F4B" },
};

/**
 * A soft, blurred flowing ribbon shape used behind hero/section content.
 * Purely decorative (aria-hidden), GPU-friendly (transform-only drift).
 */
export default function Ribbon({
  tone = "blush",
  className = "",
  flip = false,
}: {
  tone?: Tone;
  className?: string;
  flip?: boolean;
}) {
  const { a, b } = TONES[tone];
  const id = `ribbon-${tone}-${flip ? "f" : "n"}`;

  return (
    <motion.svg
      aria-hidden
      viewBox="0 0 600 600"
      className={`drift pointer-events-none ${className}`}
      style={{ transform: flip ? "scaleX(-1)" : undefined }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <defs>
        <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={a} />
          <stop offset="100%" stopColor={b} />
        </linearGradient>
      </defs>
      <path
        d="M 120 40
           C 260 40, 300 140, 220 220
           C 140 300, 180 400, 320 420
           C 460 440, 480 340, 400 280
           C 340 235, 360 170, 440 160
           C 520 150, 560 220, 540 300
           C 510 420, 400 520, 260 540
           C 120 560, 20 460, 40 340
           C 55 250, 130 260, 150 200
           C 170 140, 100 120, 80 80
           C 65 55, 90 40, 120 40 Z"
        fill={`url(#${id})`}
      />
    </motion.svg>
  );
}
