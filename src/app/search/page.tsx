import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { listingService } from "@/modules/listings/listing.service";
import { ListingCard } from "@/components/listings/ListingCard";
import { PremiumSearchBar } from "@/components/home/PremiumSearchBar";
import { SectionHeader } from "@/components/home/SectionHeader";
import { Pagination } from "@/components/search/Pagination";
import { SearchFilters } from "@/components/search/SearchFilters";
import { SavedSearchButton } from "@/components/search/SavedSearchButton";

import { BackButton } from "@/components/ui/BackButton";

export const revalidate = 60;

type SP = Promise<Record<string, string | undefined>>;

export default async function SearchPage({ searchParams }: { searchParams: SP }) {
  const p = await searchParams;

  let categories: Awaited<ReturnType<typeof prisma.category.findMany>> = [];
  let result = { items: [] as Awaited<ReturnType<typeof listingService.search>>["items"], total: 0, page: 1, totalPages: 0 };

  try {
    categories = await prisma.category.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } });
    result = await listingService.search({
    search: p.q,
    category: p.category,
    city: p.city,
    minPrice: p.minPrice ? Number(p.minPrice) : undefined,
    maxPrice: p.maxPrice ? Number(p.maxPrice) : undefined,
    sort: (p.sort as "newest") ?? "newest",
    page: p.page ? Number(p.page) : 1,
    brand: p.brand,
    model: p.model,
    generation: p.generation,
    body: p.body,
    yearFrom: p.yearFrom ? Number(p.yearFrom) : undefined,
    propertyType: p.propertyType,
    dealType: p.dealType,
    rooms: p.rooms ? Number(p.rooms) : undefined,
    });
  } catch (error) {
    console.error("[search] database error:", error);
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 md:py-10">
      <BackButton href="/" />
      <SectionHeader
        title={p.q ? `«${p.q}»` : p.category ? categories.find((c) => c.slug === p.category)?.name ?? "Поиск" : "Все объявления"}
        subtitle={`${result.total} результатов`}
      />
      <div className="mb-4 flex flex-wrap gap-2 items-center">
        <div className="flex-1 min-w-[200px]"><PremiumSearchBar /></div>
        <SavedSearchButton filters={{ q: p.q, category: p.category, city: p.city }} />
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="lg:w-56 shrink-0">
          <Suspense fallback={null}>
            <SearchFilters categories={categories} />
          </Suspense>
        </aside>

        <div className="flex-1">
          {result.items.length === 0 ? (
            <p className="text-center py-20 text-[var(--text-muted)]">Ничего не найдено</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-4">
              {result.items.map((l) => <ListingCard key={l.id} listing={l} variant="premium" />)}
            </div>
          )}
          <Suspense fallback={null}>
            <Pagination page={result.page} totalPages={result.totalPages} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
