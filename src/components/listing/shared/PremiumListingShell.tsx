import type { ReactNode } from "react";
import type { CompareItem } from "@/lib/compare";
import type { SpecSection } from "@/lib/listing-specs-builder";
import { fixMojibake } from "@/lib/text-encoding";
import { SafetyBanner } from "@/components/trust/SafetyBanner";
import { ReportButton } from "@/components/trust/ReportButton";
import { SectionHeader } from "@/components/home/SectionHeader";
import { ListingCard } from "@/components/listings/ListingCard";
import {
  PremiumGallery,
  ListingHeader,
  DescriptionBlock,
  VideoBlock,
  PremiumSpecsTable,
  PremiumContactActions,
  PremiumContactBarMobile,
  PremiumSellerCard,
  PremiumLocationBlock,
  PremiumListingStats,
  PremiumExclusivityBadge,
  PremiumAdBanner,
} from "@/components/listing/shared";
import { CategoryQuickMessages } from "@/components/listing/shared/CategoryQuickMessages";

type SimilarListing = Parameters<typeof ListingCard>[0]["listing"];

export type PremiumListingShellProps = {
  listingId: string;
  title: string;
  chips: string[];
  description: string;
  price: number;
  currency: string;
  phone: string;
  images: { url: string }[];
  videoUrl?: string | null;
  city: string;
  district?: string | null;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  createdAt: Date;
  updatedAt: Date;
  viewsTotal: number;
  viewsToday: number;
  isFavorited: boolean;
  compare: CompareItem;
  seller: {
    id: string;
    name: string;
    isVerified: boolean;
    ratingAvg: number;
    ratingCount: number;
    activeCount: number;
    type?: string;
  };
  specSections: SpecSection[];
  categorySlug: string;
  similar: SimilarListing[];
  similarTitle: string;
  similarHref: string;
  extraSidebar?: ReactNode;
  extraMain?: ReactNode;
  contactExtra?: ReactNode;
  quickMessagePresets?: string[];
};

export function PremiumListingShell({
  listingId,
  title,
  chips,
  description,
  price,
  currency,
  phone,
  images,
  videoUrl,
  city,
  district,
  address,
  latitude,
  longitude,
  createdAt,
  updatedAt,
  viewsTotal,
  viewsToday,
  isFavorited,
  compare,
  seller,
  specSections,
  categorySlug,
  similar,
  similarTitle,
  similarHref,
  extraSidebar,
  extraMain,
  contactExtra,
  quickMessagePresets,
}: PremiumListingShellProps) {
  const displayTitle = fixMojibake(title);
  const displayDescription = fixMojibake(description);
  const displayName = fixMojibake(seller.name);

  const contactProps = {
    listingId,
    title: displayTitle,
    price,
    currency,
    phone,
    isFavorited,
    compare,
    sellerId: seller.id,
  };

  return (
    <div className="pb-28 md:pb-12">
      <div className="max-w-6xl mx-auto px-4 pt-2 md:pt-4">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 lg:gap-8 items-start">
          <div className="space-y-5 min-w-0">
            <ListingHeader title={displayTitle} chips={chips} />
            <PremiumGallery images={images} />
            <PremiumExclusivityBadge />

            <div className="lg:hidden space-y-4">
              <PremiumContactActions {...contactProps} />
              {contactExtra}
            </div>

            {extraMain}
            <PremiumSpecsTable sections={specSections} />
            <PremiumLocationBlock
              city={city}
              district={district}
              address={address}
              latitude={latitude}
              longitude={longitude}
            />
            <DescriptionBlock description={displayDescription} />
            {videoUrl && <VideoBlock url={videoUrl} />}
            <PremiumListingStats
              createdAt={createdAt}
              updatedAt={updatedAt}
              viewsTotal={viewsTotal}
              viewsToday={viewsToday}
            />
            <CategoryQuickMessages
              listingId={listingId}
              categorySlug={categorySlug}
              presets={quickMessagePresets}
            />
            <PremiumAdBanner />
            <SafetyBanner />
            <ReportButton listingId={listingId} />

            <div className="lg:hidden">
              <PremiumSellerCard
                sellerId={seller.id}
                name={displayName}
                isVerified={seller.isVerified}
                ratingAvg={seller.ratingAvg}
                ratingCount={seller.ratingCount}
                activeCount={seller.activeCount}
                sellerType={seller.type}
                listingId={listingId}
              />
            </div>
          </div>

          <aside className="hidden lg:block space-y-4">
            <PremiumContactActions {...contactProps} sticky />
            {contactExtra}
            {extraSidebar}
            <PremiumSellerCard
              sellerId={seller.id}
              name={displayName}
              isVerified={seller.isVerified}
              ratingAvg={seller.ratingAvg}
              ratingCount={seller.ratingCount}
              activeCount={seller.activeCount}
              sellerType={seller.type}
              listingId={listingId}
            />
          </aside>
        </div>

        {similar.length > 0 && (
          <section className="mt-12 mb-8">
            <SectionHeader title={similarTitle} href={similarHref} />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 mt-4">
              {similar.map((l) => (
                <ListingCard key={l.id} listing={l} variant="premium" />
              ))}
            </div>
          </section>
        )}
      </div>

      <PremiumContactBarMobile {...contactProps} />
    </div>
  );
}
