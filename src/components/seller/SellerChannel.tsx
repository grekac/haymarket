"use client";

import { useState } from "react";
import Link from "next/link";
import { Calendar, Package, ShoppingBag, Star } from "lucide-react";
import { ListingCard } from "@/components/listings/ListingCard";
import { VerifiedBadge, RatingStars } from "@/components/trust/VerifiedBadge";
import { ReviewSection } from "@/components/trust/ReviewSection";
import { Card } from "@/components/ui/Card";
import { formatDate, formatNumber } from "@/lib/utils";

type ListingItem = {
  id: string;
  title: string;
  price: number;
  currency: string;
  city: string;
  views: number;
  createdAt: Date;
  isPromoted?: boolean;
  images: { url: string }[];
  category: { name: string };
  status: string;
};

type SellerData = {
  id: string;
  name: string;
  isVerified: boolean;
  ratingAvg: number;
  ratingCount: number;
  createdAt: Date;
  activeCount: number;
  soldCount: number;
  totalListings: number;
};

type Props = {
  seller: SellerData;
  activeListings: ListingItem[];
  soldListings: ListingItem[];
  highlightListingId?: string;
};

function marketSince(date: Date) {
  const months = Math.max(
    1,
    Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24 * 30))
  );
  if (months < 12) return `${months} мес. на рынке`;
  const years = Math.floor(months / 12);
  return `${years} ${years === 1 ? "год" : years < 5 ? "года" : "лет"} на рынке`;
}

export function SellerChannel({ seller, activeListings, soldListings, highlightListingId }: Props) {
  const [tab, setTab] = useState<"active" | "sold" | "reviews">("active");

  const tabs = [
    { id: "active" as const, label: "В продаже", count: activeListings.length },
    { id: "sold" as const, label: "Продано", count: soldListings.length },
    { id: "reviews" as const, label: "Отзывы", count: seller.ratingCount },
  ];

  return (
    <div className="space-y-6">
      <Card className="p-6 md:p-8 overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent)]/8 via-transparent to-[var(--emerald)]/5 pointer-events-none" />
        <div className="relative flex flex-col sm:flex-row gap-5 items-start sm:items-center">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[var(--accent)] to-[var(--accent-hover)] text-[var(--accent-fg)] flex items-center justify-center text-3xl font-bold shadow-lg shrink-0">
            {seller.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold tracking-tight">{seller.name}</h1>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              {seller.isVerified && <VerifiedBadge />}
              <RatingStars rating={seller.ratingAvg} count={seller.ratingCount} />
            </div>
            <p className="text-sm text-[var(--text-muted)] mt-2 flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              {marketSince(seller.createdAt)} · с {new Date(seller.createdAt).toLocaleDateString("ru-RU", { month: "long", year: "numeric" })}
            </p>
          </div>
        </div>

        <div className="relative grid grid-cols-3 gap-3 mt-6">
          {[
            { icon: ShoppingBag, label: "В продаже", value: seller.activeCount },
            { icon: Package, label: "Продано", value: seller.soldCount },
            { icon: Star, label: "Отзывов", value: seller.ratingCount },
          ].map(({ icon: Icon, label, value }) => (
            <div
              key={label}
              className="rounded-2xl bg-[var(--bg-secondary)]/80 border border-[var(--border)] p-4 text-center"
            >
              <Icon className="w-5 h-5 mx-auto text-[var(--accent)] mb-2" />
              <p className="text-xl font-bold">{formatNumber(value)}</p>
              <p className="text-[11px] text-[var(--text-muted)] mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </Card>

      <div className="flex gap-1 p-1 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)]">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`flex-1 py-2.5 px-3 rounded-xl text-sm font-semibold transition-all ${
              tab === t.id
                ? "bg-[var(--bg-card)] shadow-sm text-[var(--text-primary)]"
                : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
            }`}
          >
            {t.label}
            {t.count > 0 && (
              <span className="ml-1.5 text-xs opacity-70">{t.count}</span>
            )}
          </button>
        ))}
      </div>

      {tab === "active" && (
        activeListings.length === 0 ? (
          <p className="text-center py-16 text-[var(--text-muted)]">Сейчас нет активных объявлений</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {activeListings.map((l) => (
              <div key={l.id} className={l.id === highlightListingId ? "ring-2 ring-[var(--accent)] rounded-2xl" : ""}>
                <ListingCard listing={l} variant="premium" />
              </div>
            ))}
          </div>
        )
      )}

      {tab === "sold" && (
        soldListings.length === 0 ? (
          <p className="text-center py-16 text-[var(--text-muted)]">История продаж пока пуста</p>
        ) : (
          <div className="space-y-3">
            {soldListings.map((l) => (
              <Link
                key={l.id}
                href={`/listing/${l.id}`}
                className="flex items-center gap-4 p-4 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] hover:shadow-md transition-shadow opacity-80"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium line-clamp-1">{l.title}</p>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">
                    {l.category.name} · {l.status === "SOLD" ? "Продано" : "Снято"} · {formatDate(l.createdAt)}
                  </p>
                </div>
                <span className="text-sm font-bold shrink-0">{formatNumber(l.price)} ֏</span>
              </Link>
            ))}
          </div>
        )
      )}

      {tab === "reviews" && (
        <Card className="p-6">
          <ReviewSection targetId={seller.id} listingId={highlightListingId ?? ""} />
        </Card>
      )}
    </div>
  );
}
