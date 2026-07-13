import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getSession } from "@/lib/auth";
import { getPersonalizedHome } from "@/lib/personalization";
import { PremiumSearchBar } from "@/components/home/PremiumSearchBar";
import { InsightCards } from "@/components/home/InsightCards";
import { SectionHeader } from "@/components/home/SectionHeader";
import { CategoryShowcase } from "@/components/listings/CategoryShowcase";
import { ListingCard } from "@/components/listings/ListingCard";
import { Plus } from "lucide-react";
import { categoryLabel } from "@/lib/category-label";
import { getHomeCategories } from "@/lib/categories";
import { getSiteUrl } from "@/lib/site-url";
import { setRequestLocale } from "next-intl/server";

export const revalidate = 60;

type Props = { params: Promise<{ locale: string }> };

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("home");
  const tCat = await getTranslations("categories");
  const session = await getSession();

  let categories: Awaited<ReturnType<typeof getHomeCategories>> = [];
  let feed: Awaited<ReturnType<typeof getPersonalizedHome>> = {
    insights: [],
    newListings: [],
    popularNearby: [],
    total: 0,
  };

  try {
    [categories, feed] = await Promise.all([
      getHomeCategories(),
      getPersonalizedHome(session?.id),
    ]);
  } catch (error) {
    console.error("[homepage] database error:", error);
  }

  const displayCategories = categories.map((cat) => ({
    ...cat,
    name: categoryLabel(cat.slug, cat.name, tCat),
  }));

  const greeting = session
    ? t("greetingUser", { name: session.name.split(" ")[0] })
    : t("greeting");

  return (
    <div className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "HayMarket",
            url: getSiteUrl(`/${locale}`),
            inLanguage: locale === "hy" ? "hy-AM" : "ru-RU",
            potentialAction: {
              "@type": "SearchAction",
              target: `${getSiteUrl(`/${locale}/search`)}?q={search_term_string}`,
              "query-input": "required name=search_term_string",
            },
          }),
        }}
      />

      <section className="px-4 pt-2 pb-5 md:pt-6 md:pb-8 max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-4 animate-fade-up md:hidden">
          <div>
            <p className="text-[13px] text-[var(--text-muted)] font-medium">{t("country")}</p>
            <h1 className="text-[22px] font-bold tracking-tight leading-tight">{greeting}</h1>
          </div>
          <Link
            href="/create"
            className="w-10 h-10 rounded-full bg-[var(--accent)] text-[var(--accent-fg)] flex items-center justify-center shadow-[var(--shadow-md)] active:scale-95 transition-transform duration-200"
          >
            <Plus className="w-5 h-5" strokeWidth={2.5} />
          </Link>
        </div>

        <div className="hidden md:flex items-center justify-between mb-4 animate-fade-up">
          <div>
            <p className="text-[13px] text-[var(--text-muted)] font-medium">{t("country")}</p>
            <h1 className="text-[28px] md:text-[32px] font-bold tracking-tight leading-tight">{greeting}</h1>
          </div>
        </div>

        <div className="animate-fade-up animate-delay-1">
          <PremiumSearchBar large />
        </div>
      </section>

      {feed.insights.length > 0 && (
        <section className="mb-6 animate-fade-up animate-delay-2">
          <div className="px-4 max-w-6xl mx-auto mb-3">
            <h2 className="text-[17px] font-semibold tracking-tight">{t("forYou")}</h2>
          </div>
          <InsightCards insights={feed.insights} />
        </section>
      )}

      <section className="px-4 mb-8 max-w-6xl mx-auto animate-fade-up animate-delay-2">
        <SectionHeader title={t("categories")} href="/categories" />
        <CategoryShowcase categories={displayCategories} orb />
      </section>

      <section className="px-4 mb-10 max-w-6xl mx-auto animate-fade-up animate-delay-3">
        <SectionHeader
          title={t("newListings")}
          subtitle={t("onPlatform", { count: feed.total })}
          href="/search?sort=newest"
        />
        {feed.newListings.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--border)] p-6 text-center text-sm text-[var(--text-muted)]">
            <p>{t("noListings")}</p>
          </div>
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-none snap-x snap-mandatory md:grid md:grid-cols-3 lg:grid-cols-4 md:gap-4 md:overflow-visible md:mx-0 md:px-0">
            {feed.newListings.map((l) => (
              <ListingCard key={l.id} listing={l} variant="horizontal" className="snap-start shrink-0 w-[280px] md:w-auto" />
            ))}
          </div>
        )}
      </section>

      <section className="px-4 mb-10 max-w-6xl mx-auto bg-[var(--bg-secondary)] -mx-0 py-8 md:rounded-[24px] md:mx-auto md:max-w-6xl animate-fade-up animate-delay-4">
        <div className="max-w-6xl mx-auto">
          <SectionHeader title={t("popularNearby")} subtitle={t("nearYerevan")} href="/map" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {feed.popularNearby.map((l) => (
              <ListingCard key={l.id} listing={l} variant="premium" />
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 pb-10 max-w-6xl mx-auto">
        <Link
          href="/create"
          className="block p-5 rounded-[22px] bg-gradient-to-r from-[var(--accent)] to-[#1a5fbf] text-white shadow-[var(--shadow-float)] active:scale-[0.99] transition-transform duration-300"
        >
          <p className="font-semibold text-[17px]">{t("ctaTitle")}</p>
          <p className="text-sm opacity-80 mt-1">{t("ctaSubtitle")}</p>
        </Link>
      </section>
    </div>
  );
}
