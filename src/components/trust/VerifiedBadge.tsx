import { BadgeCheck, Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function VerifiedBadge({ className }: { className?: string }) {
  return (
    <span className={cn(
      "inline-flex items-center gap-1 text-[12px] font-semibold text-[var(--emerald)] bg-[var(--emerald-soft)] px-2 py-0.5 rounded-full",
      className
    )}>
      <BadgeCheck className="w-3.5 h-3.5" />
      Проверен
    </span>
  );
}

export function RatingStars({ rating, count }: { rating: number; count?: number }) {
  if (!count) return null;
  return (
    <span className="inline-flex items-center gap-1 text-[12px] text-[var(--text-secondary)]">
      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
      {rating.toFixed(1)} <span className="text-[var(--text-muted)]">({count})</span>
    </span>
  );
}
