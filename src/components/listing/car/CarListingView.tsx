import type { CarDetails } from "@prisma/client";
import type { PriceEstimateResult } from "@/lib/ai-price-estimate";
import type { CompareItem } from "@/lib/compare";
import type { ListingWithRelations } from "@/modules/listings/listing.repository";
import {
  buildCarListingTitle,
  buildCarSubtitleChips,
  parseCarListingExtras,
} from "@/lib/car-listing-extra";
import { fixMojibake } from "@/lib/text-encoding";
import { CarPremiumGallery } from "./CarPremiumGallery";
import { CarListingHeader, CarDescriptionBlock } from "./CarListingHeader";
import { CarExclusivityBadge } from "./CarExclusivityBadge";
import { CarSpecsTable } from "./CarSpecsTable";
import { CarBodyDiagram } from "./CarBodyDiagram";
import { CarPriceAnalysis } from "./CarPriceAnalysis";
import { CarLocationBlock } from "./CarLocationBlock";
import { CarOptionsChecklist } from "./CarOptionsChecklist";
import { CarListingStats } from "./CarListingStats";
import { CarQuickMessages } from "./CarQuickMessages";
import { CarContactActions, CarContactBarMobile } from "./CarContactActions";
import { CarSellerCard } from "./CarSellerCard";
import { CarAdBanner } from "./CarAdBanner";
import { SafetyBanner } from "@/components/trust/SafetyBanner";
import { ReportButton } from "@/components/trust/ReportButton";
import { SectionHeader } from "@/components/home/SectionHeader";
import { ListingCard } from "@/components/listings/ListingCard";

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

  return (
    <div className="pb-28 md:pb-12">
      <div className="max-w-6xl mx-auto px-4 pt-2 md:pt-4">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 lg:gap-8 items-start">
          <div className="space-y-5 min-w-0">
            <CarListingHeader title={title} chips={chips} />
            <CarPremiumGallery images={listing.images} />
            <CarExclusivityBadge />

            <div className="lg:hidden">
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
            </div>

            <CarPriceAnalysis
              listedPrice={listing.price}
              currency={listing.currency}
              estimate={liveEstimate}
              aiPriceHint={listing.aiPriceHint}
              aiPriceMin={listing.aiPriceMin}
              aiPriceMax={listing.aiPriceMax}
              liquidityNote={extras.liquidityNote}
            />

            <CarSpecsTable car={car} extras={extras} conditionLabel={conditionLabel} />
            <CarBodyDiagram paintedParts={extras.bodyPaint} />
            <CarOptionsChecklist options={extras.options} />
            <CarLocationBlock
              city={listing.city}
              district={listing.district}
              address={listing.address}
              latitude={listing.latitude}
              longitude={listing.longitude}
            />
            <CarDescriptionBlock description={fixMojibake(listing.description)} />
            <CarListingStats
              createdAt={listing.createdAt}
              updatedAt={listing.updatedAt}
              viewsTotal={listing.views}
              viewsToday={viewsToday}
            />
            <CarQuickMessages listingId={listing.id} />
            <CarAdBanner />
            <SafetyBanner />
            <ReportButton listingId={listing.id} />

            <div className="lg:hidden">
              <CarSellerCard
                sellerId={listing.user.id}
                name={fixMojibake(listing.user.name)}
                isVerified={listing.user.isVerified}
                ratingAvg={listing.user.ratingAvg}
                ratingCount={listing.user.ratingCount}
                activeCount={sellerActiveCount}
                sellerType={extras.sellerType}
                listingId={listing.id}
              />
            </div>
          </div>

          <aside className="hidden lg:block space-y-4">
            <CarContactActions
              listingId={listing.id}
              title={title}
              price={listing.price}
              currency={listing.currency}
              phone={listing.user.phone}
              isFavorited={isFavorited}
              compare={compare}
              sellerId={listing.user.id}
              sticky
            />
            <CarSellerCard
              sellerId={listing.user.id}
              name={fixMojibake(listing.user.name)}
              isVerified={listing.user.isVerified}
              ratingAvg={listing.user.ratingAvg}
              ratingCount={listing.user.ratingCount}
              activeCount={sellerActiveCount}
              sellerType={extras.sellerType}
              listingId={listing.id}
            />
          </aside>
        </div>

        {similar.length > 0 && (
          <section className="mt-12 mb-8">
            <SectionHeader title={similarTitle} href={`/search?category=cars&brand=${encodeURIComponent(car.brand)}&model=${encodeURIComponent(car.model)}`} />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 mt-4">
              {similar.map((l) => (
                <ListingCard key={l.id} listing={l} variant="premium" />
              ))}
            </div>
          </section>
        )}
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
