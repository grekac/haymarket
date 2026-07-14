import type { PriceEstimateResult } from "@/lib/ai-price-estimate";
import type { CompareItem } from "@/lib/compare";
import type { ListingWithRelations } from "@/modules/listings/listing.repository";
import {
  buildCarListingTitle,
  buildCarSubtitleChips,
  parseCarListingExtras,
} from "@/lib/car-listing-extra";
import { fixMojibake } from "@/lib/text-encoding";
import { formatPrice } from "@/lib/utils";
import { CarPremiumGallery } from "./CarPremiumGallery";
import { CarExclusivityBadge } from "./CarExclusivityBadge";
import { CarSpecsTable, CarDamageBadge } from "./CarSpecsTable";
import { CarPriceAnalysis } from "./CarPriceAnalysis";
import { CarLocationBlock } from "./CarLocationBlock";
import { CarOptionsChecklist } from "./CarOptionsChecklist";
import { CarQuickMessages } from "./CarQuickMessages";
import { CarContactActions, CarContactBarMobile } from "./CarContactActions";
import { CarAdBanner } from "./CarAdBanner";
import { SafetyBanner } from "@/components/trust/SafetyBanner";
import { ReportButton } from "@/components/trust/ReportButton";
import { SectionHeader } from "@/components/home/SectionHeader";
import { ListingCard } from "@/components/listings/ListingCard";
import { ListingSellerStrip } from "@/components/listing/shared/ListingSellerStrip";
import { ListingCallWrite } from "@/components/listing/shared/ListingCallWrite";
import { ListingDescriptionClamp } from "@/components/listing/shared/ListingDescriptionClamp";
import { ListingMetaFooter } from "@/components/listing/shared/ListingMetaFooter";
import { AskSellerButton } from "@/components/chat/AskSellerButton";

type SimilarListing = Parameters<typeof ListingCard>[0]["listing"];

export type CarListingViewProps = {
  listing: ListingWithRelations;
  isFavorited: boolean;
  compare: CompareItem;
  conditionLabel: string;
  sellerActiveCount: number;
  viewsToday: number;
  liveEstimate?: Pick<
    PriceEstimateResult,
    "price" | "priceMin" | "priceMax" | "reasoning" | "verdict" | "comparablesCount"
  > | null;
  similar: SimilarListing[];
  similarTitle: string;
};

export function CarListingView({
  listing,
  isFavorited,
  compare,
  conditionLabel,
  sellerActiveCount,
  viewsToday,
  liveEstimate,
  similar,
  similarTitle,
}: CarListingViewProps) {
  const car = listing.carDetails!;
  const extras = parseCarListingExtras(listing.attributes);
  const title = buildCarListingTitle(car, extras, fixMojibake(listing.title));
  const chips = buildCarSubtitleChips(car);
  const sellerName = fixMojibake(listing.user.name);

  return (
    <div className="pb-28 md:pb-12">
      <div className="max-w-6xl mx-auto px-4 pt-0 md:pt-4">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 lg:gap-10 items-start">
          <div className="min-w-0">
            <CarPremiumGallery
              images={listing.images}
              listingId={listing.id}
              title={title}
              price={listing.price}
              currency={listing.currency}
              isFavorited={isFavorited}
            />

            <div className="pt-4 space-y-5">
              <div className="space-y-2">
                <p className="text-[28px] md:text-[32px] font-extrabold tracking-tight leading-none tabular-nums">
                  {formatPrice(listing.price, listing.currency)}
                </p>
                <h1 className="text-[20px] md:text-[24px] font-bold leading-snug tracking-tight">
                  {title}
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
                <CarDamageBadge extras={extras} />
              </div>

              <ListingSellerStrip
                sellerId={listing.user.id}
                name={sellerName}
                isVerified={listing.user.isVerified}
                ratingAvg={listing.user.ratingAvg}
                ratingCount={listing.user.ratingCount}
                listingId={listing.id}
              />

              <div className="lg:hidden">
                <ListingCallWrite listingId={listing.id} phone={listing.user.phone} />
              </div>

              <CarLocationBlock
                city={listing.city}
                district={listing.district}
                address={listing.address}
                latitude={listing.latitude}
                longitude={listing.longitude}
              />

              <CarSpecsTable car={car} extras={extras} conditionLabel={conditionLabel} />
              <CarOptionsChecklist options={extras.options} />
              <ListingDescriptionClamp description={fixMojibake(listing.description)} />

              <CarPriceAnalysis
                listedPrice={listing.price}
                currency={listing.currency}
                estimate={liveEstimate}
                aiPriceHint={listing.aiPriceHint}
                aiPriceMin={listing.aiPriceMin}
                aiPriceMax={listing.aiPriceMax}
                liquidityNote={extras.liquidityNote}
              />

              <section className="space-y-3 pt-1">
                <h2 className="font-semibold text-base">Спросить у продавца</h2>
                <AskSellerButton
                  listingId={listing.id}
                  label="Написать продавцу"
                  className="w-full justify-center h-11"
                />
                <CarQuickMessages listingId={listing.id} />
              </section>

              <CarAdBanner />
              <SafetyBanner />
              <CarExclusivityBadge />

              {similar.length > 0 && (
                <section className="pt-2">
                  <SectionHeader
                    title={similarTitle}
                    href={`/search?category=cars&brand=${encodeURIComponent(car.brand)}&model=${encodeURIComponent(car.model)}`}
                  />
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mt-4">
                    {similar.map((l) => (
                      <ListingCard key={l.id} listing={l} variant="premium" />
                    ))}
                  </div>
                </section>
              )}

              <ListingMetaFooter
                listingId={listing.id}
                articleNo={listing.articleNo}
                createdAt={listing.createdAt}
                viewsTotal={listing.views}
              />

              <div className="pb-2">
                <ReportButton listingId={listing.id} />
              </div>

              <p className="sr-only">
                Просмотров сегодня: {viewsToday}, объявлений продавца: {sellerActiveCount}
              </p>
            </div>
          </div>

          <aside className="hidden lg:block space-y-4 sticky top-20">
            <CarContactActions
              listingId={listing.id}
              title={title}
              price={listing.price}
              currency={listing.currency}
              phone={listing.user.phone}
              isFavorited={isFavorited}
              compare={compare}
              sellerId={listing.user.id}
            />
            <ListingSellerStrip
              sellerId={listing.user.id}
              name={sellerName}
              isVerified={listing.user.isVerified}
              ratingAvg={listing.user.ratingAvg}
              ratingCount={listing.user.ratingCount}
              listingId={listing.id}
            />
          </aside>
        </div>
      </div>

      <CarContactBarMobile
        listingId={listing.id}
        title={title}
        price={listing.price}
        currency={listing.currency}
        phone={listing.user.phone}
        isFavorited={isFavorited}
        compare={compare}
        sellerId={listing.user.id}
      />
    </div>
  );
}
