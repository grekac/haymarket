import type { ReactNode } from "react";
import type { CompareItem } from "@/lib/compare";
import type { SpecSection } from "@/lib/listing-specs-builder";
import { fixMojibake } from "@/lib/text-encoding";
import { formatPrice } from "@/lib/utils";
import { SafetyBanner } from "@/components/trust/SafetyBanner";
import { ReportButton } from "@/components/trust/ReportButton";
import { SectionHeader } from "@/components/home/SectionHeader";
import { ListingCard } from "@/components/listings/ListingCard";
import { AskSellerButton } from "@/components/chat/AskSellerButton";
import {
  PremiumGallery,
  VideoBlock,
  PremiumSpecsTable,
  PremiumContactActions,
  PremiumContactBarMobile,
  PremiumLocationBlock,
  PremiumExclusivityBadge,
  PremiumAdBanner,
} from "@/components/listing/shared";
import { CategoryQuickMessages } from "@/components/listing/shared/CategoryQuickMessages";
import { ListingSellerStrip } from "@/components/listing/shared/ListingSellerStrip";
import { ListingCallWrite } from "@/components/listing/shared/ListingCallWrite";
import { ListingDescriptionClamp } from "@/components/listing/shared/ListingDescriptionClamp";
import { ListingMetaFooter } from "@/components/listing/shared/ListingMetaFooter";

type SimilarListing = Parameters<typeof ListingCard>[0]["listing"];

export type PremiumListingShellProps = {
  listingId: string;
  articleNo?: number | null;
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
  articleNo,
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
  viewsTotal,
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
      <div className="max-w-6xl mx-auto px-4 pt-0 md:pt-4">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 lg:gap-10 items-start">
          <div className="min-w-0">
            <PremiumGallery
              images={images}
              listingId={listingId}
              title={displayTitle}
              price={price}
              currency={currency}
              isFavorited={isFavorited}
            />

            <div className="pt-4 space-y-5">
              <div className="space-y-2">
                <p className="text-[28px] md:text-[32px] font-extrabold tracking-tight leading-none tabular-nums">
                  {formatPrice(price, currency)}
                </p>
                <h1 className="text-[20px] md:text-[24px] font-bold leading-snug tracking-tight">
                  {displayTitle}
                </h1>
                {chips.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {chips.map((c) => (
                      <span
                        key={c}
                        className="px-2 py-0.5 rounded-md text-[12px] bg-[var(--bg-secondary)] text-[var(--text-secondary)]"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <ListingSellerStrip
                sellerId={seller.id}
                name={displayName}
                isVerified={seller.isVerified}
                ratingAvg={seller.ratingAvg}
                ratingCount={seller.ratingCount}
                listingId={listingId}
              />

              <div className="lg:hidden space-y-3">
                <ListingCallWrite listingId={listingId} phone={phone} />
                {contactExtra}
              </div>

              <PremiumLocationBlock
                city={city}
                district={district}
                address={address}
                latitude={latitude}
                longitude={longitude}
              />

              {extraMain}
              <PremiumSpecsTable sections={specSections} />
              <ListingDescriptionClamp description={displayDescription} />
              {videoUrl && <VideoBlock url={videoUrl} />}

              <section className="space-y-3 pt-1">
                <h2 className="font-semibold text-base">Спросить у продавца</h2>
                <AskSellerButton
                  listingId={listingId}
                  label="Написать продавцу"
                  className="w-full justify-center h-11"
                />
                <CategoryQuickMessages
                  listingId={listingId}
                  categorySlug={categorySlug}
                  presets={quickMessagePresets}
                />
              </section>

              <PremiumAdBanner />
              <SafetyBanner />
              <PremiumExclusivityBadge />

              {similar.length > 0 && (
                <section className="pt-2">
                  <SectionHeader title={similarTitle} href={similarHref} />
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mt-4">
                    {similar.map((l) => (
                      <ListingCard key={l.id} listing={l} variant="premium" />
                    ))}
                  </div>
                </section>
              )}

              <ListingMetaFooter
                listingId={listingId}
                articleNo={articleNo}
                createdAt={createdAt}
                viewsTotal={viewsTotal}
              />

              <div className="pb-2">
                <ReportButton listingId={listingId} />
              </div>
            </div>
          </div>

          <aside className="hidden lg:block space-y-4 sticky top-20">
            <PremiumContactActions {...contactProps} />
            {contactExtra}
            {extraSidebar}
            <ListingSellerStrip
              sellerId={seller.id}
              name={displayName}
              isVerified={seller.isVerified}
              ratingAvg={seller.ratingAvg}
              ratingCount={seller.ratingCount}
              listingId={listingId}
            />
          </aside>
        </div>
      </div>

      <PremiumContactBarMobile {...contactProps} />
    </div>
  );
}
