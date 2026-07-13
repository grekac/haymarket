import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { listingService } from "@/modules/listings/listing.service";
import { listingRepository } from "@/modules/listings/listing.repository";
import { getSession } from "@/lib/auth";
import { favoriteService } from "@/modules/favorites/favorite.service";
import { formatPrice } from "@/lib/utils";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { openGraphLocales, type AppLocale } from "@/i18n/routing";
import { listingAlternates } from "@/lib/seo";
import { getSiteUrl } from "@/lib/site-url";
import { BackButton } from "@/components/ui/BackButton";
import { TrackRecentlyViewed } from "@/components/listings/TrackRecentlyViewed";
import { CarListingView } from "@/components/listing/car/CarListingView";
import { RealEstateListingView } from "@/components/listing/real-estate/RealEstateListingView";
import { JobListingView } from "@/components/listing/jobs/JobListingView";
import { PremiumListingView } from "@/components/listing/premium/PremiumListingView";
import { resolveListingLayout } from "@/lib/listing-layout";
import { fixMojibake } from "@/lib/text-encoding";
import { estimateCarPriceForListing } from "@/lib/ai-price-estimate";
import { buildCarListingTitle, parseCarListingExtras } from "@/lib/car-listing-extra";

type Params = Promise<{ locale: string; id: string }>;

export const revalidate = 60;

const CONDITION_KEYS = ["new", "used", "refurbished"] as const;

function conditionLabel(t: Awaited<ReturnType<typeof getTranslations>>, condition: string) {
  if (CONDITION_KEYS.includes(condition as (typeof CONDITION_KEYS)[number])) {
    return t(`condition.${condition as (typeof CONDITION_KEYS)[number]}`);
  }
  return condition;
}

function startOfDay(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id, locale } = await params;
  const listing = await listingRepository.findById(id);
  if (!listing || listing.status !== "ACTIVE") {
    return { title: "HayMarket" };
  }

  const image = listing.images[0]?.url;
  const extras = parseCarListingExtras(listing.attributes);
  const displayTitle = listing.carDetails
    ? buildCarListingTitle(listing.carDetails, extras, fixMojibake(listing.title))
    : fixMojibake(listing.title);
  const description = listing.description.slice(0, 160);
  const title = `${displayTitle} — ${formatPrice(listing.price, listing.currency)}`;
  const appLocale = locale as AppLocale;

  return {
    title,
    description,
    alternates: listingAlternates(id, appLocale),
    openGraph: {
      title: displayTitle,
      description,
      url: listingAlternates(id, appLocale).canonical,
      siteName: "HayMarket",
      images: image ? [{ url: image, width: 800, height: 600, alt: displayTitle }] : [],
      locale: openGraphLocales[appLocale],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: displayTitle,
      description,
      images: image ? [image] : [],
    },
  };
}

export default async function ListingPage({ params }: { params: Params }) {
  const { id, locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("listing");
  const listing = await listingService.getById(id);
  if (!listing) notFound();

  const session = await getSession();
  const isFavorited = session ? await favoriteService.isFavorited(session.id, id) : false;

  const [sellerActiveCount, viewsTodayRow] = await Promise.all([
    prisma.listing.count({
      where: { userId: listing.user.id, status: "ACTIVE" },
    }),
    prisma.listingViewDaily
      .findUnique({
        where: { listingId_date: { listingId: id, date: startOfDay() } },
      })
      .catch(() => null),
  ]);

  const condLabel = conditionLabel(t, listing.condition);

  const compareItem = {
    id: listing.id,
    title: fixMojibake(listing.title),
    price: listing.price,
    currency: listing.currency,
    image: listing.images[0]?.url,
    category: listing.category.name,
  };

  const liveEstimate =
    listing.carDetails && !listing.aiPriceHint
      ? await estimateCarPriceForListing(listing.id)
      : null;

  const similar = listing.carDetails
    ? await listingService.getSimilarCars({
        id: listing.id,
        categoryId: listing.categoryId,
        carDetails: listing.carDetails,
      })
    : await listingService.getSimilar(listing.categoryId, id);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: listing.carDetails
      ? buildCarListingTitle(
          listing.carDetails,
          parseCarListingExtras(listing.attributes),
          listing.title
        )
      : listing.title,
    description: listing.description,
    image: listing.images.map((i) => i.url),
    offers: {
      "@type": "Offer",
      price: listing.price,
      priceCurrency: listing.currency,
      availability: "https://schema.org/InStock",
      url: getSiteUrl(`/${locale}/listing/${id}`),
    },
  };

  return (
    <>
      <TrackRecentlyViewed
        id={listing.id}
        title={listing.title}
        price={listing.price}
        currency={listing.currency}
        image={listing.images[0]?.url}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="max-w-6xl mx-auto px-4 pt-4 md:pt-6">
        <BackButton href="/search" sticky className="md:mb-2" />
      </div>

      {(() => {
        const layout = resolveListingLayout(listing);
        const common = {
          listing,
          isFavorited,
          compare: compareItem,
          conditionLabel: condLabel,
          sellerActiveCount,
          viewsToday: viewsTodayRow?.views ?? 0,
          similar,
          similarTitle: t("similar"),
        };

        if (layout === "car") {
          return (
            <CarListingView
              {...common}
              liveEstimate={liveEstimate}
              similarTitle={`Похожие ${listing.carDetails!.brand} ${listing.carDetails!.model}`}
            />
          );
        }
        if (layout === "real-estate") {
          return <RealEstateListingView {...common} similarTitle={t("similar")} />;
        }
        if (layout === "jobs") {
          return <JobListingView {...common} similarTitle={t("similar")} />;
        }
        return <PremiumListingView {...common} similarTitle={t("similar")} />;
      })()}
    </>
  );
}
