import { ReactNode } from "react";

type Tone = "blush" | "burgundy" | "glass" | "line";

const TONES: Record<Tone, string> = {
  blush: "bg-blush-100 text-burgundy-600",
  burgundy: "bg-burgundy-500 text-cream",
  glass: "glass text-charcoal",
  line: "border border-line text-stone",
};

export default function Badge({
  children,
  tone = "blush",
  className = "",
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[11px] font-medium uppercase tracking-[0.12em] ${TONES[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
