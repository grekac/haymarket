import Link from "next/link";
import { User } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { VerifiedBadge, RatingStars } from "@/components/trust/VerifiedBadge";
import { formatNumber } from "@/lib/utils";
import { SELLER_TYPE_LABELS } from "@/lib/car-listing-extra";

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

      <Link
        href={listingId ? `/seller/${sellerId}?from=${listingId}` : `/seller/${sellerId}`}
        className="mt-4 w-full h-11 rounded-xl bg-[var(--accent)] text-[var(--accent-fg)] font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
      >
        <User className="w-4 h-4" />
        Посмотреть профиль
      </Link>
    </Card>
  );
}
