export default function Logo({ size = 28, tone = "burgundy" }: { size?: number; tone?: "burgundy" | "cream" }) {
  const fill = tone === "burgundy" ? "var(--color-burgundy-500)" : "var(--color-cream)";
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden>
      <path
        d="M20 3C13 3 9 9 12 14C14.5 18 20 17 21 21C22 25 17 27 13 24C9.5 21.5 9 17 9 17"
        stroke={fill}
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <path
        d="M20 37C27 37 31 31 28 26C25.5 22 20 23 19 19C18 15 23 13 27 16C30.5 18.5 31 23 31 23"
        stroke={fill}
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </svg>
  );
}
