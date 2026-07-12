import Image from "next/image";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { formatPrice, formatDate } from "@/lib/utils";

type ListingCardProps = {
  listing: {
    id: string;
    title: string;
    price: number;
    currency: string;
    city: string;
    imageUrl: string | null;
    createdAt: Date;
    category: { name: string };
  };
};

export function ListingCard({ listing }: ListingCardProps) {
  return (
    <Link
      href={`/listing/${listing.id}`}
      className="group block rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
    >
      <div className="relative aspect-[4/3] bg-[var(--bg-secondary)] overflow-hidden">
        {listing.imageUrl ? (
          <Image
            src={listing.imageUrl}
            alt={listing.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, 25vw"
            quality={90}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-[var(--text-muted)] text-sm">
            {listing.category.name}
          </div>
        )}
        <div className="absolute top-3 left-3">
          <span className="px-2.5 py-1 rounded-lg bg-white/90 backdrop-blur-sm text-xs font-semibold text-[var(--text-primary)] shadow-sm">
            {listing.category.name}
          </span>
        </div>
      </div>

      <div className="p-4">
        <p className="text-lg font-bold text-[var(--text-primary)] mb-1">
          {formatPrice(listing.price, listing.currency)}
        </p>
        <h3 className="text-sm text-[var(--text-secondary)] line-clamp-2 leading-relaxed mb-3">
          {listing.title}
        </h3>
        <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {listing.city}
          </span>
          <span>{formatDate(listing.createdAt)}</span>
        </div>
      </div>
    </Link>
  );
}
