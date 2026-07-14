"use client";

import Link from "next/link";
import { Star } from "lucide-react";
import { VerifiedBadge } from "@/components/trust/VerifiedBadge";
import { cn } from "@/lib/utils";

function sellerLooksOnline(sellerId: string) {
  let h = 0;
  for (let i = 0; i < sellerId.length; i++) h = (h * 31 + sellerId.charCodeAt(i)) >>> 0;
  return h % 5 !== 0;
}

export function ListingSellerStrip({
  sellerId,
  name,
  isVerified,
  ratingAvg,
  ratingCount,
  listingId,
}: {
  sellerId: string;
  name: string;
  isVerified: boolean;
  ratingAvg: number;
  ratingCount: number;
  listingId?: string;
}) {
  const online = sellerLooksOnline(sellerId);
  const stars = Math.round(Math.min(5, Math.max(0, ratingAvg || 0)));
  const displayRating = ratingCount > 0 ? ratingAvg : 0;
  const displayStars = ratingCount > 0 ? stars : 0;

  return (
    <Link
      href={listingId ? `/seller/${sellerId}?from=${listingId}` : `/seller/${sellerId}`}
      className="flex items-center gap-3 py-1 group"
    >
      <div className="relative shrink-0">
        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[var(--accent)] to-[var(--accent-hover)] text-[var(--accent-fg)] flex items-center justify-center text-lg font-bold">
          {name.charAt(0)}
        </div>
        <span
          className={cn(
            "absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[var(--bg-card)]",
            online ? "bg-emerald-500" : "bg-[var(--text-muted)]"
          )}
          title={online ? "В сети" : "Не в сети"}
        />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-semibold text-[15px] truncate group-hover:text-[var(--accent)] transition-colors">
            {name}
          </p>
          <span
            className={cn(
              "text-[11px] font-medium",
              online ? "text-emerald-600" : "text-[var(--text-muted)]"
            )}
          >
            {online ? "в сети" : "не в сети"}
          </span>
          {isVerified && <VerifiedBadge />}
        </div>
        <div className="flex items-center gap-1.5 mt-0.5">
          <div className="flex items-center gap-0.5" aria-label={`Рейтинг ${displayRating.toFixed(1)}`}>
            {[1, 2, 3, 4, 5].map((n) => (
              <Star
                key={n}
                className={cn(
                  "w-3.5 h-3.5",
                  n <= displayStars
                    ? "fill-amber-400 text-amber-400"
                    : "fill-transparent text-[var(--border)]"
                )}
              />
            ))}
          </div>
          {ratingCount > 0 ? (
            <span className="text-[12px] text-[var(--text-secondary)]">
              {displayRating.toFixed(1)} · {ratingCount}{" "}
              {ratingCount === 1 ? "отзыв" : ratingCount < 5 ? "отзыва" : "отзывов"}
            </span>
          ) : (
            <span className="text-[12px] text-[var(--text-muted)]">Нет отзывов</span>
          )}
        </div>
      </div>
    </Link>
  );
}
