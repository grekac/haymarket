import { prisma } from "@/lib/prisma";
import { cityCoords, haversineKm } from "@/lib/geo";
import { listingService } from "@/modules/listings/listing.service";

export type PersonalInsight = {
  id: string;
  type: "nearby" | "price_drop" | "match" | "views" | "new";
  title: string;
  subtitle?: string;
  href: string;
  accent?: "blue" | "emerald" | "neutral";
};

export async function getPersonalizedHome(userId?: string) {
  const center = cityCoords("Ереван");
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    nearbyListings,
    newListings,
    popularNearby,
    electronics,
    savedSearches,
    userListings,
  ] = await Promise.all([
    prisma.listing.findMany({
      where: { status: "ACTIVE", latitude: { not: null }, longitude: { not: null } },
      select: { id: true, latitude: true, longitude: true, createdAt: true },
    }),
    listingService.search({ limit: 6, sort: "newest" }),
    listingService.search({ limit: 6, sort: "popular", city: "Ереван" }),
    prisma.listing.findMany({
      where: {
        status: "ACTIVE",
        OR: [
          { title: { contains: "iPhone" } },
          { title: { contains: "iphone" } },
        ],
      },
      orderBy: { price: "asc" },
      take: 5,
      include: { images: { take: 1 } },
    }),
    userId
      ? prisma.savedSearch.findMany({ where: { userId }, take: 3 })
      : Promise.resolve([]),
    userId
      ? prisma.listing.findMany({
          where: { userId },
          orderBy: { views: "desc" },
          take: 1,
        })
      : Promise.resolve([]),
  ]);

  const nearbyCount = nearbyListings.filter((l) =>
    haversineKm(center.lat, center.lng, l.latitude!, l.longitude!) <= 15
  ).length;

  const insights: PersonalInsight[] = [];

  if (nearbyCount > 0) {
    insights.push({
      id: "nearby",
      type: "nearby",
      title: `${nearbyCount} новых рядом с вами`,
      subtitle: "В радиусе 15 км от Еревана",
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

  for (const search of savedSearches) {
    let filters: Record<string, string> = {};
    try { filters = JSON.parse(search.filters); } catch { continue; }

    const match = await prisma.listing.findFirst({
      where: {
        status: "ACTIVE",
        ...(filters.category ? { category: { slug: filters.category } } : {}),
        ...(filters.q ? { title: { contains: filters.q } } : {}),
        ...(filters.city ? { city: filters.city } : {}),
      },
      orderBy: { createdAt: "desc" },
    });

    if (match) {
      const label = filters.q || search.name;
      insights.push({
        id: `match-${search.id}`,
        type: "match",
        title: `Появилось: ${label}`,
        subtitle: match.title.slice(0, 50),
        href: `/listing/${match.id}`,
        accent: "blue",
      });
      break;
    }
  }

  if (!insights.some((i) => i.type === "match")) {
    const car = await prisma.listing.findFirst({
      where: { status: "ACTIVE", category: { slug: "cars" } },
      orderBy: { createdAt: "desc" },
    });
    if (car) {
      insights.push({
        id: "car-match",
        type: "match",
        title: "Появилась машина, которую вы искали",
        subtitle: car.title.slice(0, 50),
        href: `/listing/${car.id}`,
        accent: "blue",
      });
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

  const newToday = nearbyListings.filter((l) => l.createdAt >= today).length;
  if (newToday > 0 && insights.length < 4) {
    insights.push({
      id: "new-today",
      type: "new",
      title: `${newToday} объявлений сегодня`,
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
