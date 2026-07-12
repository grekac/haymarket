import Link from "next/link";
import { ChevronRight, Store } from "lucide-react";
import { VerifiedBadge, RatingStars } from "@/components/trust/VerifiedBadge";
import { PhoneButton } from "@/components/listings/ListingActions";
import { Card } from "@/components/ui/Card";
import { formatNumber } from "@/lib/utils";

type Props = {
  sellerId: string;
  name: string;
  phone: string;
  isVerified: boolean;
  ratingAvg: number;
  ratingCount: number;
  activeCount: number;
  memberSince: Date;
  listingId?: string;
};

function marketSince(date: Date) {
  const months = Math.max(
    1,
    Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24 * 30))
  );
  if (months < 12) return `${months} мес.`;
  const years = Math.floor(months / 12);
  return `${years} г.`;
}

export function SellerPreviewCard({
  sellerId,
  name,
  phone,
  isVerified,
  ratingAvg,
  ratingCount,
  activeCount,
  memberSince,
  listingId,
}: Props) {
  return (
    <Card className="p-5 md:p-6 shadow-[var(--shadow-md)] overflow-hidden">
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
          <p className="text-xs text-[var(--text-muted)] mt-2">
            {marketSince(memberSince)} на рынке · {formatNumber(activeCount)} в продаже
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-2">
        <PhoneButton phone={phone} />
        <Link
          href={listingId ? `/seller/${sellerId}?from=${listingId}` : `/seller/${sellerId}`}
          className="w-full h-12 rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] font-semibold text-[14px] flex items-center justify-center gap-2 hover:bg-[var(--bg-hover)] transition-colors"
        >
          <Store className="w-4 h-4" />
          Канал продавца
          <ChevronRight className="w-4 h-4 opacity-50" />
        </Link>
      </div>
    </Card>
  );
}
