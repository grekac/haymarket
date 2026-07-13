import type { ListingWithRelations } from "@/modules/listings/listing.repository";
import type { CompareItem } from "@/lib/compare";
import { parseAttributes } from "@/lib/category-fields";
import { buildAttributeSpecSections, buildListingChips } from "@/lib/listing-specs-builder";
import { PremiumListingShell } from "@/components/listing/shared/PremiumListingShell";
import { ServiceOrderButton } from "@/components/listing/shared/ServiceOrderButton";
import { Card } from "@/components/ui/Card";

type SimilarListing = Parameters<
  typeof import("@/components/listings/ListingCard").ListingCard
>[0]["listing"];

export type PremiumListingViewProps = {
  listing: ListingWithRelations;
  isFavorited: boolean;
  compare: CompareItem;
  conditionLabel: string;
  sellerActiveCount: number;
  viewsToday: number;
  similar: SimilarListing[];
  similarTitle: string;
};

export function PremiumListingView({
  listing,
  isFavorited,
  compare,
  conditionLabel,
  sellerActiveCount,
  viewsToday,
  similar,
  similarTitle,
}: PremiumListingViewProps) {
  const slug = listing.category.slug;
  const attrs = parseAttributes(listing.attributes);
  const chips = buildListingChips(slug, listing.attributes);
  const specSections = buildAttributeSpecSections(
    slug,
    listing.attributes,
    conditionLabel
  );

  const isServices = slug === "services";
  const options = Array.isArray(attrs.options)
    ? attrs.options.map(String)
    : Array.isArray(attrs.equipment)
      ? attrs.equipment.map(String)
      : [];

  const extraMain =
    options.length > 0 ? (
      <Card className="p-5 md:p-6">
        <h2 className="font-semibold text-base mb-3">Комплектация и опции</h2>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {options.map((opt) => (
            <li key={opt} className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] shrink-0" />
              {opt}
            </li>
          ))}
        </ul>
      </Card>
    ) : null;

  const contactExtra = isServices ? <ServiceOrderButton listingId={listing.id} /> : null;

  return (
    <PremiumListingShell
      listingId={listing.id}
      title={listing.title}
      chips={chips}
      description={listing.description}
      price={listing.price}
      currency={listing.currency}
      phone={listing.user.phone}
      images={listing.images}
      videoUrl={listing.videoUrl}
      city={listing.city}
      district={listing.district}
      address={listing.address}
      latitude={listing.latitude}
      longitude={listing.longitude}
      createdAt={listing.createdAt}
      updatedAt={listing.updatedAt}
      viewsTotal={listing.views}
      viewsToday={viewsToday}
      isFavorited={isFavorited}
      compare={compare}
      seller={{
        id: listing.user.id,
        name: listing.user.name,
        isVerified: listing.user.isVerified,
        ratingAvg: listing.user.ratingAvg,
        ratingCount: listing.user.ratingCount,
        activeCount: sellerActiveCount,
        type: typeof attrs.sellerType === "string" ? attrs.sellerType : "private",
      }}
      specSections={specSections}
      categorySlug={slug}
      similar={similar}
      similarTitle={similarTitle}
      similarHref={`/search?category=${slug}`}
      extraMain={extraMain}
      contactExtra={contactExtra}
    />
  );
}
