import Image from "next/image";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { formatPrice, formatDate, cn } from "@/lib/utils";
import { fixMojibake } from "@/lib/text-encoding";
import { isListingPromoted } from "@/lib/promotion";

type ListingData = {
  id: string;
  title: string;
  price: number;
  currency: string;
  city: string;
  views: number;
  createdAt: Date;
  isPromoted?: boolean;
  promotedUntil?: Date | string | null;
  images: { url: string }[];
  category: { name: string };
  carDetails?: { brand: string; model: string; generation?: string | null; year: number } | null;
};

type Props = {
  listing: ListingData;
  className?: string;
  variant?: "default" | "premium" | "horizontal";
};

export function ListingCard({ listing, className, variant = "default" }: Props) {
  const image = listing.images[0]?.url;
  const categoryName = fixMojibake(listing.category.name);
  const top = isListingPromoted({
    isPromoted: !!listing.isPromoted,
    promotedUntil: listing.promotedUntil ?? null,
  });

  if (variant === "horizontal") {
    return (
      <Link href={`/listing/${listing.id}`} className={cn("block", className)}>
        <div className="premium-card flex gap-3 p-3 border border-[var(--border)]">
          <div className="relative w-[100px] h-[100px] rounded-[18px] overflow-hidden bg-[var(--bg-secondary)] shrink-0">
            {image ? (
              <Image src={image} alt="" fill unoptimized className="object-cover" sizes="100px" />
            ) : (
              <div className="flex items-center justify-center h-full text-[10px] text-[var(--text-muted)] p-2 text-center">
                {categoryName}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0 py-0.5">
            <p className="text-[17px] font-bold tracking-tight text-[var(--text-primary)]">
              {formatPrice(listing.price, listing.currency)}
            </p>
            <h3 className="text-[13px] text-[var(--text-secondary)] line-clamp-2 mt-1 leading-snug">
              {listing.title}
            </h3>
            <p className="text-[11px] text-[var(--text-muted)] mt-2 flex items-center gap-1">
              <MapPin className="w-3 h-3" /> {listing.city}
            </p>
          </div>
        </div>
      </Link>
    );
  }

  if (variant === "premium") {
    return (
      <Link href={`/listing/${listing.id}`} className={cn("block group", className)}>
        <div className="premium-card overflow-hidden border border-[var(--border)]/60">
          <div className="relative aspect-[4/5] bg-[var(--bg-secondary)] overflow-hidden">
            {image ? (
              <Image
                src={image}
                alt={listing.title}
                fill
                unoptimized
                className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
                sizes="(max-width:640px) 50vw, 25vw"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-xs text-[var(--text-muted)]">
                {categoryName}
              </div>
            )}
            {top && (
              <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-[var(--accent)] text-white text-[10px] font-semibold">
                ТОП
              </span>
            )}
          </div>
          <div className="p-3.5">
            <p className="text-[17px] font-bold tracking-tight">
              {formatPrice(listing.price, listing.currency)}
            </p>
            <h3 className="text-[13px] text-[var(--text-secondary)] line-clamp-2 mt-1 leading-snug">
              {listing.title}
            </h3>
            <p className="text-[11px] text-[var(--text-muted)] mt-2">{listing.city}</p>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/listing/${listing.id}`} className={cn("block group", className)}>
      <div className="premium-card overflow-hidden border border-[var(--border)]/60">
        <div className="relative aspect-[4/3] bg-[var(--bg-secondary)] overflow-hidden">
          {image ? (
            <Image
              src={image}
              alt={listing.title}
              fill
              unoptimized
              className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
              sizes="(max-width:640px) 50vw, 25vw"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-xs text-[var(--text-muted)]">
              {categoryName}
            </div>
          )}
          {top && (
            <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-[var(--accent)] text-white text-[10px] font-semibold">
              ТОП
            </span>
          )}
        </div>
        <div className="p-3.5">
          <p className="text-base font-bold tracking-tight">
            {formatPrice(listing.price, listing.currency)}
          </p>
          <h3 className="text-sm text-[var(--text-secondary)] line-clamp-2 mt-1 leading-snug">
            {listing.title}
          </h3>
          <div className="flex items-center gap-1 mt-2 text-[11px] text-[var(--text-muted)]">
            <MapPin className="w-3 h-3" />
            <span>{listing.city}</span>
            <span className="mx-1">·</span>
            <span>{formatDate(listing.createdAt)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
