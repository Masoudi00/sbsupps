"use client";
import { motion, HTMLMotionProps } from "framer-motion";
import { ReactNode } from "react";

type Variant = "solid" | "outline" | "ghost" | "glass";
type Size = "sm" | "md" | "lg";

const VARIANTS: Record<Variant, string> = {
  solid: "bg-charcoal text-cream hover:bg-burgundy-600",
  outline: "bg-transparent text-charcoal border border-charcoal/20 hover:border-charcoal/50",
  ghost: "bg-transparent text-charcoal hover:bg-black/[0.04]",
  glass: "glass text-charcoal hover:shadow-soft",
};

const SIZES: Record<Size, string> = {
  sm: "px-4 py-2.5 text-[13px]",
  md: "px-6 py-3.5 text-[14px]",
  lg: "px-8 py-4 text-[15px]",
};

type Props = {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  className?: string;
  icon?: ReactNode;
} & Omit<HTMLMotionProps<"button">, "children">;

export default function Button({
  children,
  variant = "solid",
  size = "md",
  className = "",
  icon,
  ...props
}: Props) {
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      whileHover={{ y: -1 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className={`inline-flex items-center justify-center gap-2 rounded-full font-medium tracking-[-0.01em] transition-all duration-300 ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    >
      {children}
      {icon}
    </motion.button>
  );
}
