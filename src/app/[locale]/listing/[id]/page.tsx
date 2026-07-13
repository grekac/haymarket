import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { MapPin, Eye, Clock, Store } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { listingService } from "@/modules/listings/listing.service";
import { listingRepository } from "@/modules/listings/listing.repository";
import { getSession } from "@/lib/auth";
import { favoriteService } from "@/modules/favorites/favorite.service";
import { formatPrice, formatDate, formatNumber } from "@/lib/utils";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { openGraphLocales, type AppLocale } from "@/i18n/routing";
import { listingAlternates } from "@/lib/seo";
import { getSiteUrl } from "@/lib/site-url";
import { BackButton } from "@/components/ui/BackButton";
import { ListingSpecs } from "@/components/listings/ListingSpecs";
import { ImageGallery } from "@/components/listings/ImageGallery";
import { ListingActions } from "@/components/listings/ListingActions";
import { ListingCard } from "@/components/listings/ListingCard";
import { SellerPreviewCard } from "@/components/seller/SellerPreviewCard";
import { Card } from "@/components/ui/Card";
import { SafetyBanner } from "@/components/trust/SafetyBanner";
import { ReportButton } from "@/components/trust/ReportButton";
import { SectionHeader } from "@/components/home/SectionHeader";
import { TrackRecentlyViewed } from "@/components/listings/TrackRecentlyViewed";
import { PriceEstimatePanel } from "@/components/listings/PriceEstimatePanel";
import { categoryLabel } from "@/lib/category-label";
import { fixMojibake } from "@/lib/text-encoding";
import { estimateCarPriceForListing } from "@/lib/ai-price-estimate";

type Params = Promise<{ locale: string; id: string }>;

export const revalidate = 60;

const CONDITION_KEYS = ["new", "used", "refurbished"] as const;

function conditionLabel(t: Awaited<ReturnType<typeof getTranslations>>, condition: string) {
  if (CONDITION_KEYS.includes(condition as (typeof CONDITION_KEYS)[number])) {
    return t(`condition.${condition as (typeof CONDITION_KEYS)[number]}`);
  }
  return condition;
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id, locale } = await params;
  const listing = await listingRepository.findById(id);
  if (!listing || listing.status !== "ACTIVE") {
    return { title: "HayMarket" };
  }

  const image = listing.images[0]?.url;
  const description = listing.description.slice(0, 160);
  const title = `${listing.title} — ${formatPrice(listing.price, listing.currency)}`;
  const appLocale = locale as AppLocale;

  return {
    title,
    description,
    alternates: listingAlternates(id, appLocale),
    openGraph: {
      title: listing.title,
      description,
      url: listingAlternates(id, appLocale).canonical,
      siteName: "HayMarket",
      images: image ? [{ url: image, width: 800, height: 600, alt: listing.title }] : [],
      locale: openGraphLocales[appLocale],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: listing.title,
      description,
      images: image ? [image] : [],
    },
  };
}

export default async function ListingPage({ params }: { params: Params }) {
  const { id, locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("listing");
  const tCat = await getTranslations("categories");
  const listing = await listingService.getById(id);
  if (!listing) notFound();

  const session = await getSession();
  const isFavorited = session ? await favoriteService.isFavorited(session.id, id) : false;
  const similar = await listingService.getSimilar(listing.categoryId, id);

  const [sellerActiveCount, sellerMeta] = await Promise.all([
    prisma.listing.count({
      where: { userId: listing.user.id, status: "ACTIVE" },
    }),
    prisma.user.findUnique({
      where: { id: listing.user.id },
      select: { createdAt: true },
    }),
  ]);

  const categoryName = categoryLabel(listing.category.slug, listing.category.name, tCat);

  const compareItem = {
    id: listing.id,
    title: fixMojibake(listing.title),
    price: listing.price,
    currency: listing.currency,
    image: listing.images[0]?.url,
    category: categoryName,
  };

  const liveEstimate =
    listing.carDetails && !listing.aiPriceHint
      ? await estimateCarPriceForListing(listing.id)
      : null;

  return (
    <div className="pb-28 md:pb-12">
      <TrackRecentlyViewed
        id={listing.id}
        title={listing.title}
        price={listing.price}
        currency={listing.currency}
        image={listing.images[0]?.url}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: listing.title,
            description: listing.description,
            image: listing.images.map((i) => i.url),
            offers: {
              "@type": "Offer",
              price: listing.price,
              priceCurrency: listing.currency,
              availability: "https://schema.org/InStock",
              url: getSiteUrl(`/${locale}/listing/${id}`),
            },
          }),
        }}
      />
      <div className="max-w-6xl mx-auto px-4 pt-4 md:pt-6">
        <BackButton href="/search" sticky className="md:mb-2" />
      </div>

      <div className="md:max-w-6xl md:mx-auto md:px-4">
        <ImageGallery images={listing.images} fullBleed />
      </div>

      <div className="max-w-6xl mx-auto px-4 pt-6 md:pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          <div className="lg:col-span-2 space-y-5">
            {/* Hero price block */}
            <Card className="p-5 md:p-6 border-[var(--border)]/80 shadow-[var(--shadow-sm)] overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[var(--accent)]/10 to-transparent rounded-bl-full pointer-events-none" />
              <div className="relative">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-[34px] md:text-[40px] font-bold tracking-tight leading-none">
                      {formatPrice(listing.price, listing.currency)}
                    </p>
                  </div>
                  <span className="px-3 py-1.5 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] text-xs font-semibold">
                    {categoryName}
                  </span>
                </div>

                {(listing.aiPriceHint || liveEstimate) && (
                  <PriceEstimatePanel
                    listedPrice={listing.price}
                    currency={listing.currency}
                    aiPriceHint={listing.aiPriceHint}
                    aiPriceMin={listing.aiPriceMin}
                    aiPriceMax={listing.aiPriceMax}
                    estimate={liveEstimate}
                  />
                )}

                <h1 className="text-lg md:text-xl font-semibold mt-4 leading-snug text-[var(--text-primary)]">
                  {listing.title}
                </h1>

                <div className="flex flex-wrap gap-2 mt-4">
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[var(--bg-secondary)] text-[12px] font-medium text-[var(--text-secondary)]">
                    <MapPin className="w-3.5 h-3.5" />
                    {[listing.city, listing.district].filter(Boolean).join(", ")}
                  </span>
                  <span className="px-3 py-1.5 rounded-full bg-[var(--bg-secondary)] text-[12px] font-medium text-[var(--text-secondary)]">
                    {conditionLabel(t, listing.condition)}
                  </span>
                </div>

                <div className="flex flex-wrap gap-4 mt-4 text-[13px] text-[var(--text-muted)]">
                  <span className="flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" />
                    {formatNumber(listing.views)} {t("views")}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {formatDate(listing.createdAt)}
                  </span>
                </div>
              </div>
            </Card>

            <div className="lg:hidden">
              <ListingActions listingId={id} isFavorited={isFavorited} phone={listing.user.phone} compare={compareItem} />
            </div>

            <Card className="p-5 md:p-6">
              <h2 className="font-semibold text-[16px] mb-3">{t("description")}</h2>
              <p className="text-[var(--text-secondary)] text-[15px] leading-relaxed whitespace-pre-wrap">
                {listing.description}
              </p>
            </Card>

            {listing.videoUrl && (
              <Card className="p-5">
                <h2 className="font-semibold text-[15px] mb-3">{t("video")}</h2>
                <video src={listing.videoUrl} controls className="w-full rounded-2xl" />
              </Card>
            )}

            <ListingSpecs
              categorySlug={listing.category.slug}
              condition={listing.condition}
              attributes={listing.attributes}
              carDetails={listing.carDetails}
              realEstate={listing.realEstate}
            />

            <SafetyBanner />
            <ReportButton listingId={id} />

            {/* Mobile seller channel CTA */}
            <Card className="p-5 lg:hidden border-[var(--accent)]/20 bg-gradient-to-br from-[var(--accent)]/5 to-transparent">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[var(--accent)] text-[var(--accent-fg)] flex items-center justify-center text-lg font-bold shrink-0">
                  {listing.user.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold">{listing.user.name}</p>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">
                    {formatNumber(sellerActiveCount)} {t("itemsForSale")}
                  </p>
                </div>
              </div>
              <Link
                href={`/seller/${listing.user.id}?from=${id}`}
                className="mt-4 w-full h-11 rounded-2xl bg-[var(--accent)] text-[var(--accent-fg)] font-semibold text-sm flex items-center justify-center gap-2"
              >
                <Store className="w-4 h-4" />
                {t("sellerChannel")}
              </Link>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="hidden lg:block sticky top-20 space-y-4">
              <SellerPreviewCard
                sellerId={listing.user.id}
                name={listing.user.name}
                phone={listing.user.phone}
                isVerified={listing.user.isVerified}
                ratingAvg={listing.user.ratingAvg}
                ratingCount={listing.user.ratingCount}
                activeCount={sellerActiveCount}
                memberSince={sellerMeta?.createdAt ?? listing.createdAt}
                listingId={id}
              />
              <ListingActions listingId={id} isFavorited={isFavorited} phone={listing.user.phone} compare={compareItem} />
            </div>
          </div>
        </div>

        {similar.length > 0 && (
          <section className="mt-12 mb-8">
            <SectionHeader title={t("similar")} href={`/search?category=${listing.category.slug}`} />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
              {similar.map((l) => (
                <ListingCard key={l.id} listing={l} variant="premium" />
              ))}
            </div>
          </section>
        )}
      </div>

      <ListingActions
        listingId={id}
        isFavorited={isFavorited}
        phone={listing.user.phone}
        compare={compareItem}
        compact
      />
    </div>
  );
}
