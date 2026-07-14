import type { ListingWithRelations } from "@/modules/listings/listing.repository";
import type { CompareItem } from "@/lib/compare";
import { parseAttributes } from "@/lib/category-fields";
import {
  buildListingChips,
  buildRealEstateSpecSections,
} from "@/lib/listing-specs-builder";
import { PremiumListingShell } from "@/components/listing/shared/PremiumListingShell";

type SimilarListing = Parameters<
  typeof import("@/components/listings/ListingCard").ListingCard
>[0]["listing"];

export type RealEstateListingViewProps = {
  listing: ListingWithRelations;
  isFavorited: boolean;
  compare: CompareItem;
  conditionLabel: string;
  sellerActiveCount: number;
  viewsToday: number;
  similar: SimilarListing[];
  similarTitle: string;
};

export function RealEstateListingView({
  listing,
  isFavorited,
  compare,
  conditionLabel,
  sellerActiveCount,
  viewsToday,
  similar,
  similarTitle,
}: RealEstateListingViewProps) {
  const re = listing.realEstate!;
  const attrs = parseAttributes(listing.attributes);
  const chips = buildListingChips(listing.category.slug, listing.attributes, re);
  const specSections = buildRealEstateSpecSections(re, listing.attributes, conditionLabel);

  return (
    <PremiumListingShell
      listingId={listing.id}
      articleNo={listing.articleNo}
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
      categorySlug={listing.category.slug}
      similar={similar}
      similarTitle={similarTitle}
      similarHref={`/search?category=real-estate&dealType=${re.dealType}&propertyType=${re.propertyType}`}
    />
  );
}
