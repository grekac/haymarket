import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { listingService } from "@/modules/listings/listing.service";

export type PersonalInsight = {
  id: string;
  type: "nearby" | "price_drop" | "match" | "views" | "new";
  title: string;
  subtitle?: string;
  href: string;
  accent?: "blue" | "emerald" | "neutral";
};

type HomeFeed = {
  insights: PersonalInsight[];
  newListings: Awaited<ReturnType<typeof listingService.search>>["items"];
  popularNearby: Awaited<ReturnType<typeof listingService.search>>["items"];
  total: number;
};

/** Public home feed — cached; no full-table geo scan. */
async function loadPublicHomeFeed(): Promise<HomeFeed> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [newListings, popularNearby, electronics, newTodayCount, carsCount] = await Promise.all([
    listingService.search({ limit: 6, sort: "newest" }),
    listingService.search({ limit: 6, sort: "popular", city: "Ереван" }),
    prisma.listing.findMany({
      where: {
        status: "ACTIVE",
        OR: [{ title: { contains: "iPhone" } }, { title: { contains: "iphone" } }],
      },
      orderBy: { price: "asc" },
      take: 5,
      select: { id: true, title: true, price: true },
    }),
    prisma.listing.count({
      where: { status: "ACTIVE", createdAt: { gte: today } },
    }),
    prisma.listing.count({
      where: {
        status: "ACTIVE",
        latitude: { not: null },
        longitude: { not: null },
        city: { in: ["Ереван", "Yerevan", "Երևան"] },
      },
    }),
  ]);

  const insights: PersonalInsight[] = [];

  if (carsCount > 0) {
    insights.push({
      id: "nearby",
      type: "nearby",
      title: `${carsCount}+ объявлений в Ереване`,
      subtitle: "Смотрите на карте рядом с вами",
      href: "/map",
      accent: "blue",
    });
  }

  if (electronics.length >= 2) {
    const avg = electronics.reduce((s, l) => s + l.price, 0) / electronics.length;
    const cheapest = electronics[0];
    const drop = Math.round(((avg - cheapest.price) / avg) * 100);
    if (drop > 3) {
      insights.push({
        id: "iphone",
        type: "price_drop",
        title: `Цена на iPhone упала на ${drop}%`,
        subtitle: cheapest.title.slice(0, 40),
        href: `/listing/${cheapest.id}`,
        accent: "emerald",
      });
    }
  }

  const car = await prisma.listing.findFirst({
    where: { status: "ACTIVE", category: { slug: "cars" } },
    orderBy: { createdAt: "desc" },
    select: { id: true, title: true },
  });
  if (car) {
    insights.push({
      id: "car-match",
      type: "match",
      title: "Свежие авто на HayMarket",
      subtitle: car.title.slice(0, 50),
      href: `/listing/${car.id}`,
      accent: "blue",
    });
  }

  if (newTodayCount > 0 && insights.length < 4) {
    insights.push({
      id: "new-today",
      type: "new",
      title: `${newTodayCount} объявлений сегодня`,
      subtitle: "Свежие предложения на HayMarket",
      href: "/search?sort=newest",
      accent: "neutral",
    });
  }

  return {
    insights: insights.slice(0, 4),
    newListings: newListings.items,
    popularNearby: popularNearby.items,
    total: newListings.total,
  };
}

const getCachedPublicHome = unstable_cache(loadPublicHomeFeed, ["home-public-feed"], {
  revalidate: 60,
  tags: ["home-feed", "listings"],
});

/** Optional per-user insights (not cached) — keep light. */
async function loadUserInsights(userId: string): Promise<PersonalInsight[]> {
  const insights: PersonalInsight[] = [];

  const [savedSearches, userListings] = await Promise.all([
    prisma.savedSearch.findMany({ where: { userId }, take: 3 }),
    prisma.listing.findMany({
      where: { userId },
      orderBy: { views: "desc" },
      take: 1,
      select: { id: true, title: true },
    }),
  ]);

  for (const search of savedSearches) {
    let filters: Record<string, string> = {};
    try {
      filters = JSON.parse(search.filters);
    } catch {
      continue;
    }

    const match = await prisma.listing.findFirst({
      where: {
        status: "ACTIVE",
        ...(filters.category ? { category: { slug: filters.category } } : {}),
        ...(filters.q ? { title: { contains: filters.q } } : {}),
        ...(filters.city ? { city: filters.city } : {}),
      },
      orderBy: { createdAt: "desc" },
      select: { id: true, title: true },
    });

    if (match) {
      insights.push({
        id: `match-${search.id}`,
        type: "match",
        title: `Появилось: ${filters.q || search.name}`,
        subtitle: match.title.slice(0, 50),
        href: `/listing/${match.id}`,
        accent: "blue",
      });
      break;
    }
  }

  if (userListings[0]) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayRow = await prisma.listingViewDaily.findUnique({
      where: {
        listingId_date: { listingId: userListings[0].id, date: today },
      },
    });
    const todayViews = todayRow?.views ?? 0;
    if (todayViews > 0) {
      insights.push({
        id: "views",
        type: "views",
        title: `У вашего объявления ${todayViews} просмотров`,
        subtitle: userListings[0].title.slice(0, 40),
        href: `/listing/${userListings[0].id}`,
        accent: "emerald",
      });
    }
  }

  return insights.slice(0, 2);
}

/**
 * Home data. Without userId — fully cacheable public feed.
 * With userId — merges light personal insights (extra queries, no geo scan).
 */
export async function getPersonalizedHome(userId?: string): Promise<HomeFeed> {
  const feed = await getCachedPublicHome();
  if (!userId) return feed;

  try {
    const personal = await loadUserInsights(userId);
    if (personal.length === 0) return feed;
    const merged = [...personal, ...feed.insights]
      .filter((insight, i, arr) => arr.findIndex((x) => x.id === insight.id) === i)
      .slice(0, 4);
    return { ...feed, insights: merged };
  } catch {
    return feed;
  }
}
