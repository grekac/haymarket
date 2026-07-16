import Image from "next/image";
import Link from "next/link";
import { formatPrice, formatDate, cn } from "@/lib/utils";
import { fixMojibake } from "@/lib/text-encoding";
import { isListingPromoted } from "@/lib/promotion";
import { ListingFavoriteButton } from "./ListingFavoriteButton";

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
  variant?: "default" | "premium" | "horizontal" | "feed";
  /** First above-the-fold cards — improves LCP */
  priority?: boolean;
};

export function ListingCard({ listing, className, variant = "default", priority = false }: Props) {
  const image = listing.images[0]?.url;
  const categoryName = fixMojibake(listing.category.name);
  const title = fixMojibake(listing.title);
  const top = isListingPromoted({
    isPromoted: !!listing.isPromoted,
    promotedUntil: listing.promotedUntil ?? null,
  });

  if (variant === "feed") {
    return (
      <article className={cn("block min-w-0", className)}>
        <Link href={`/listing/${listing.id}`} className="block group">
          <div className="relative aspect-square rounded-xl overflow-hidden bg-[var(--bg-secondary)]">
            {image ? (
              <Image
                src={image}
                alt={title}
                fill
                priority={priority}
                className="object-cover"
                sizes="(max-width:640px) 50vw, 25vw"
                quality={75}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-xs text-[var(--text-muted)] px-2 text-center">
                {categoryName}
              </div>
            )}
            {top && (
              <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/55 text-white text-[10px] font-semibold backdrop-blur-sm">
                ТОП
              </span>
            )}
          </div>
        </Link>

        <div className="pt-2 px-0.5">
          <div className="flex items-start gap-1">
            <Link href={`/listing/${listing.id}`} className="flex-1 min-w-0">
              <h3 className="text-[13px] font-medium text-[var(--text-primary)] line-clamp-2 leading-snug">
                {title}
              </h3>
            </Link>
            <ListingFavoriteButton listingId={listing.id} className="shrink-0 mt-0.5" />
          </div>

          <Link href={`/listing/${listing.id}`} className="block mt-1">
            <p className="text-[16px] font-bold tracking-tight tabular-nums leading-none">
              {formatPrice(listing.price, listing.currency)}
            </p>
            <p className="text-[11px] text-[var(--text-muted)] mt-1.5 truncate">{listing.city}</p>
          </Link>
        </div>
      </article>
    );
  }

  if (variant === "horizontal") {
    return (
      <Link href={`/listing/${listing.id}`} className={cn("block", className)}>
        <div className="premium-card flex gap-3 p-3 border border-[var(--border)]">
          <div className="relative w-[100px] h-[100px] rounded-[18px] overflow-hidden bg-[var(--bg-secondary)] shrink-0">
            {image ? (
              <Image src={image} alt="" fill priority={priority} className="object-cover" sizes="100px" quality={75} />
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
              {title}
            </h3>
            <p className="text-[11px] text-[var(--text-muted)] mt-2">{listing.city}</p>
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
                alt={title}
                fill
                priority={priority}
                className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
                sizes="(max-width:640px) 50vw, 25vw"
                quality={75}
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
              {title}
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
              alt={title}
              fill
              priority={priority}
              className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
              sizes="(max-width:640px) 50vw, 25vw"
              quality={75}
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
            {title}
          </h3>
          <div className="flex items-center gap-1 mt-2 text-[11px] text-[var(--text-muted)]">
            <span>{listing.city}</span>
            <span className="mx-1">·</span>
            <span>{formatDate(listing.createdAt)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
