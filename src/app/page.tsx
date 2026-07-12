import Link from "next/link";
import { getSession } from "@/lib/auth";
import { getPersonalizedHome } from "@/lib/personalization";
import { PremiumSearchBar } from "@/components/home/PremiumSearchBar";
import { InsightCards } from "@/components/home/InsightCards";
import { SectionHeader } from "@/components/home/SectionHeader";
import { CategoryShowcase } from "@/components/listings/CategoryShowcase";
import { ListingCard } from "@/components/listings/ListingCard";
import { Plus } from "lucide-react";
import { getHomeCategories } from "@/lib/categories";

export default async function HomePage() {
  const session = await getSession();
  const [categories, feed] = await Promise.all([
    getHomeCategories(),
    getPersonalizedHome(session?.id),
  ]);

  const greeting = session
    ? `Привет, ${session.name.split(" ")[0]}`
    : "HayMarket";

  return (
    <div className="min-h-screen">
      {/* Hero: search + greeting */}
      <section className="px-4 pt-2 pb-5 md:pt-6 md:pb-8 max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-4 animate-fade-up md:hidden">
          <div>
            <p className="text-[13px] text-[var(--text-muted)] font-medium">Армения</p>
            <h1 className="text-[22px] font-bold tracking-tight leading-tight">
              {greeting}
            </h1>
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
            <p className="text-[13px] text-[var(--text-muted)] font-medium">Армения</p>
            <h1 className="text-[28px] md:text-[32px] font-bold tracking-tight leading-tight">
              {greeting}
            </h1>
          </div>
        </div>

        <div className="animate-fade-up animate-delay-1">
          <PremiumSearchBar large />
        </div>
      </section>

      {/* Personal insights */}
      {feed.insights.length > 0 && (
        <section className="mb-6 animate-fade-up animate-delay-2">
          <div className="px-4 max-w-6xl mx-auto mb-3">
            <h2 className="text-[17px] font-semibold tracking-tight">Для вас</h2>
          </div>
          <InsightCards insights={feed.insights} />
        </section>
      )}

      {/* Round category icons */}
      <section className="px-4 mb-8 max-w-6xl mx-auto animate-fade-up animate-delay-2">
        <SectionHeader title="Категории" href="/categories" />
        <CategoryShowcase categories={categories} orb />
      </section>

      {/* New listings */}
      <section className="px-4 mb-10 max-w-6xl mx-auto animate-fade-up animate-delay-3">
        <SectionHeader
          title="Новые объявления"
          subtitle={`${feed.total} на платформе`}
          href="/search?sort=newest"
        />
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-none snap-x snap-mandatory md:grid md:grid-cols-3 lg:grid-cols-4 md:gap-4 md:overflow-visible md:mx-0 md:px-0">
          {feed.newListings.map((l) => (
            <ListingCard key={l.id} listing={l} variant="horizontal" className="snap-start shrink-0 w-[280px] md:w-auto" />
          ))}
        </div>
      </section>

      {/* Popular nearby */}
      <section className="px-4 mb-10 max-w-6xl mx-auto bg-[var(--bg-secondary)] -mx-0 py-8 md:rounded-[24px] md:mx-auto md:max-w-6xl animate-fade-up animate-delay-4">
        <div className="max-w-6xl mx-auto">
          <SectionHeader
            title="Популярные рядом"
            subtitle="В Ереване и окрестностях"
            href="/map"
          />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {feed.popularNearby.map((l) => (
              <ListingCard key={l.id} listing={l} variant="premium" />
            ))}
          </div>
        </div>
      </section>

      {/* Single useful CTA — no banner spam */}
      <section className="px-4 pb-10 max-w-6xl mx-auto">
        <Link
          href="/create"
          className="block p-5 rounded-[22px] bg-gradient-to-r from-[var(--accent)] to-[#1a5fbf] text-white shadow-[var(--shadow-float)] active:scale-[0.99] transition-transform duration-300"
        >
          <p className="font-semibold text-[17px]">Подать объявление за 30 сек</p>
          <p className="text-sm opacity-80 mt-1">AI напишет описание и подскажет цену</p>
        </Link>
      </section>
    </div>
  );
}
