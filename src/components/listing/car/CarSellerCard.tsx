"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Store, Bell } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { VerifiedBadge, RatingStars } from "@/components/trust/VerifiedBadge";
import { formatNumber } from "@/lib/utils";
import { SELLER_TYPE_LABELS } from "@/lib/car-listing-extra";
import { cn } from "@/lib/utils";

type Props = {
  sellerId: string;
  name: string;
  isVerified: boolean;
  ratingAvg: number;
  ratingCount: number;
  activeCount: number;
  sellerType?: string;
  listingId?: string;
};

export function CarSellerCard({
  sellerId,
  name,
  isVerified,
  ratingAvg,
  ratingCount,
  activeCount,
  sellerType = "private",
  listingId,
}: Props) {
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    setSubscribed(localStorage.getItem(`haymarket_sub_${sellerId}`) === "1");
  }, [sellerId]);

  function toggleSubscribe() {
    const key = `haymarket_sub_${sellerId}`;
    const next = !subscribed;
    setSubscribed(next);
    if (next) localStorage.setItem(key, "1");
    else localStorage.removeItem(key);
  }

  const typeLabel = SELLER_TYPE_LABELS[sellerType] ?? SELLER_TYPE_LABELS.private;

  return (
    <Card className="p-5 md:p-6">
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--accent)] to-[var(--accent-hover)] text-[var(--accent-fg)] flex items-center justify-center text-xl font-bold shrink-0">
          {name.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-lg leading-tight">{name}</p>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            {isVerified && <VerifiedBadge />}
            <RatingStars rating={ratingAvg} count={ratingCount} />
          </div>
          <p className="text-xs text-[var(--text-muted)] mt-2">{typeLabel}</p>
          <p className="text-xs text-[var(--text-muted)]">
            {formatNumber(activeCount)} объявлений в продаже
          </p>
        </div>
      </div>

      <div className="flex gap-2 mt-4">
        <button
          type="button"
          onClick={toggleSubscribe}
          className={cn(
            "flex-1 h-11 rounded-xl font-semibold text-sm border transition-colors flex items-center justify-center gap-2",
            subscribed
              ? "bg-[var(--accent)]/10 border-[var(--accent)]/30 text-[var(--accent)]"
              : "border-[var(--border)] bg-[var(--bg-secondary)] hover:bg-[var(--bg-hover)]"
          )}
        >
          <Bell className="w-4 h-4" />
          {subscribed ? "Подписаны" : "Подписаться"}
        </button>
        <Link
          href={listingId ? `/seller/${sellerId}?from=${listingId}` : `/seller/${sellerId}`}
          className="flex-1 h-11 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] font-semibold text-sm flex items-center justify-center gap-2 hover:bg-[var(--bg-hover)] transition-colors"
        >
          <Store className="w-4 h-4" />
          Канал
        </Link>
      </div>
    </Card>
  );
}
