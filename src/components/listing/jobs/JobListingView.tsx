import type { ListingWithRelations } from "@/modules/listings/listing.repository";
import type { CompareItem } from "@/lib/compare";
import { parseAttributes } from "@/lib/category-fields";
import { buildAttributeSpecSections, buildListingChips } from "@/lib/listing-specs-builder";
import { PremiumListingShell } from "@/components/listing/shared/PremiumListingShell";
import { Card } from "@/components/ui/Card";
import { formatAttributeValue } from "@/lib/category-fields";

type SimilarListing = Parameters<
  typeof import("@/components/listings/ListingCard").ListingCard
>[0]["listing"];

export type JobListingViewProps = {
  listing: ListingWithRelations;
  isFavorited: boolean;
  compare: CompareItem;
  conditionLabel: string;
  sellerActiveCount: number;
  viewsToday: number;
  similar: SimilarListing[];
  similarTitle: string;
};

export function JobListingView({
  listing,
  isFavorited,
  compare,
  conditionLabel,
  sellerActiveCount,
  viewsToday,
  similar,
  similarTitle,
}: JobListingViewProps) {
  const attrs = parseAttributes(listing.attributes);
  const isResume = attrs.listingType === "resume";
  const chips = buildListingChips(listing.category.slug, listing.attributes);
  const specSections = buildAttributeSpecSections(
    listing.category.slug,
    listing.attributes,
    conditionLabel
  );

  const duties = typeof attrs.duties === "string" ? attrs.duties : "";
  const requirements = typeof attrs.requirements === "string" ? attrs.requirements : "";
  const conditions = typeof attrs.conditions === "string" ? attrs.conditions : "";
  const skills = typeof attrs.skills === "string" ? attrs.skills : "";
  const education = typeof attrs.education === "string" ? attrs.education : "";
  const portfolio = typeof attrs.portfolio === "string" ? attrs.portfolio : "";

  const extraMain = (
    <>
      {isResume ? (
        <>
          {skills && (
            <Card className="p-5 md:p-6">
              <h2 className="font-semibold text-base mb-3">Навыки</h2>
              <p className="text-[15px] text-[var(--text-secondary)] whitespace-pre-wrap">{skills}</p>
            </Card>
          )}
          {education && (
            <Card className="p-5 md:p-6">
              <h2 className="font-semibold text-base mb-3">Образование</h2>
              <p className="text-[15px] text-[var(--text-secondary)] whitespace-pre-wrap">{education}</p>
            </Card>
          )}
          {portfolio && (
            <Card className="p-5 md:p-6">
              <h2 className="font-semibold text-base mb-3">Портфолио</h2>
              <p className="text-[15px] text-[var(--text-secondary)] whitespace-pre-wrap">{portfolio}</p>
            </Card>
          )}
        </>
      ) : (
        <>
          {typeof attrs.company === "string" && attrs.company && (
            <Card className="p-5 md:p-6 border-[var(--accent)]/20 bg-gradient-to-br from-[var(--accent)]/5 to-transparent">
              <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider">Компания</p>
              <p className="text-lg font-bold mt-1">{attrs.company}</p>
              {attrs.salaryNegotiable === true && (
                <p className="text-sm text-[var(--text-secondary)] mt-2">Зарплата по договорённости</p>
              )}
            </Card>
          )}
          {duties && (
            <Card className="p-5 md:p-6">
              <h2 className="font-semibold text-base mb-3">Обязанности</h2>
              <p className="text-[15px] text-[var(--text-secondary)] whitespace-pre-wrap">{duties}</p>
            </Card>
          )}
          {requirements && (
            <Card className="p-5 md:p-6">
              <h2 className="font-semibold text-base mb-3">Требования</h2>
              <p className="text-[15px] text-[var(--text-secondary)] whitespace-pre-wrap">{requirements}</p>
            </Card>
          )}
          {conditions && (
            <Card className="p-5 md:p-6">
              <h2 className="font-semibold text-base mb-3">Условия</h2>
              <p className="text-[15px] text-[var(--text-secondary)] whitespace-pre-wrap">{conditions}</p>
            </Card>
          )}
        </>
      )}
    </>
  );

  const titleChip =
    isResume
      ? "Поиск работы"
      : formatAttributeValue("listingType", attrs.listingType || "vacancy") || "Вакансия";

  return (
    <PremiumListingShell
      listingId={listing.id}
      title={listing.title}
      chips={[titleChip, ...chips.filter((c) => c !== titleChip)]}
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
      similarHref={`/search?category=jobs${isResume ? "&listingType=resume" : "&listingType=vacancy"}`}
      extraMain={extraMain}
    />
  );
}
