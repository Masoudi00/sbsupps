import { BadgeCheck } from "lucide-react";
import { ExtractedBadge } from "@/lib/parseDescription";

export default function BadgeGrid({ badges }: { badges: ExtractedBadge[] }) {
  if (badges.length === 0) return null;

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-x-4 gap-y-6 py-2">
      {badges.map((b) => (
        <div key={b.label} className="flex flex-col items-center text-center gap-2.5">
          <div className="w-14 h-14 rounded-full border border-line flex items-center justify-center flex-shrink-0">
            <BadgeCheck size={22} strokeWidth={1.4} className="text-burgundy-500" aria-hidden />
          </div>
          <span className="text-[10.5px] font-medium uppercase tracking-[0.06em] text-charcoal/70 leading-tight">
            {b.label}
          </span>
        </div>
      ))}
    </div>
  );
}
