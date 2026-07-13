import { prisma } from "@/lib/prisma";
import { isListingPromoted } from "@/lib/promotion";

function startOfDay(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export async function expirePromotions() {
  await prisma.listing.updateMany({
    where: {
      isPromoted: true,
      promotedUntil: { lt: new Date() },
    },
    data: { isPromoted: false },
  });
}

export async function recordListingView(listingId: string) {
  const today = startOfDay();

  await prisma.$transaction([
    prisma.listing.update({
      where: { id: listingId },
      data: { views: { increment: 1 } },
    }),
    prisma.listingViewDaily.upsert({
      where: { listingId_date: { listingId, date: today } },
      create: { listingId, date: today, views: 1 },
      update: { views: { increment: 1 } },
    }),
  ]);
}

export async function getSellerStats(userId: string) {
  const since7 = startOfDay();
  since7.setDate(since7.getDate() - 6);

  const listings = await prisma.listing.findMany({
    where: { userId },
    select: {
      id: true,
      title: true,
      views: true,
      status: true,
      isPromoted: true,
      promotedUntil: true,
      _count: { select: { favorites: true, conversations: true } },
    },
    orderBy: { views: "desc" },
  });

  const listingIds = listings.map((l) => l.id);

  const [dailyViews, orders, favoritesTotal, messagesTotal] = await Promise.all([
    listingIds.length
      ? prisma.listingViewDaily.groupBy({
          by: ["date"],
          where: { listingId: { in: listingIds }, date: { gte: since7 } },
          _sum: { views: true },
          orderBy: { date: "asc" },
        })
      : [],
    prisma.promotionOrder.aggregate({
      where: { userId, status: "PAID" },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.favorite.count({ where: { listing: { userId } } }),
    prisma.message.count({
      where: {
        conversation: {
          listing: { userId },
          OR: [{ buyerId: userId }, { sellerId: userId }],
        },
        senderId: { not: userId },
      },
    }),
  ]);

  const viewsByListing7d = listingIds.length
    ? await prisma.listingViewDaily.groupBy({
        by: ["listingId"],
        where: { listingId: { in: listingIds }, date: { gte: since7 } },
        _sum: { views: true },
      })
    : [];

  const views7dMap = new Map(viewsByListing7d.map((r) => [r.listingId, r._sum.views ?? 0]));

  const activePromotions = listings.filter((l) => isListingPromoted(l)).length;
  const totalViews = listings.reduce((sum, l) => sum + l.views, 0);
  const viewsLast7Days = dailyViews.reduce((sum, d) => sum + (d._sum.views ?? 0), 0);

  return {
    totalViews,
    viewsLast7Days,
    viewsByDay: dailyViews.map((d) => ({
      date: d.date.toISOString().slice(0, 10),
      views: d._sum.views ?? 0,
    })),
    activeListings: listings.filter((l) => l.status === "ACTIVE").length,
    totalFavorites: favoritesTotal,
    totalMessages: messagesTotal,
    activePromotions,
    revenueSpent: orders._sum.amount ?? 0,
    promotionOrders: orders._count,
    listings: listings.map((l) => ({
      id: l.id,
      title: l.title,
      views: l.views,
      viewsLast7Days: views7dMap.get(l.id) ?? 0,
      favorites: l._count.favorites,
      messages: l._count.conversations,
      isPromoted: isListingPromoted(l),
      promotedUntil: l.promotedUntil,
      status: l.status,
    })),
  };
}

export async function getAdminAnalytics() {
  const today = startOfDay();
  const since7 = startOfDay();
  since7.setDate(since7.getDate() - 6);
  const since30 = startOfDay();
  since30.setDate(since30.getDate() - 29);

  const [
    revenueAll,
    revenue30d,
    ordersCount,
    activePromotions,
    viewsToday,
    views7d,
    totalViewsAgg,
    topCategories,
    ordersRecent,
  ] = await Promise.all([
    prisma.promotionOrder.aggregate({
      where: { status: "PAID" },
      _sum: { amount: true },
    }),
    prisma.promotionOrder.aggregate({
      where: { status: "PAID", createdAt: { gte: since30 } },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.promotionOrder.count({ where: { status: "PAID" } }),
    prisma.listing.count({
      where: { isPromoted: true, OR: [{ promotedUntil: null }, { promotedUntil: { gt: new Date() } }] },
    }),
    prisma.listingViewDaily.aggregate({
      where: { date: today },
      _sum: { views: true },
    }),
    prisma.listingViewDaily.aggregate({
      where: { date: { gte: since7 } },
      _sum: { views: true },
    }),
    prisma.listing.aggregate({ _sum: { views: true } }),
    prisma.listing.groupBy({
      by: ["categoryId"],
      where: { status: "ACTIVE" },
      _count: true,
      orderBy: { _count: { categoryId: "desc" } },
      take: 5,
    }),
    prisma.promotionOrder.findMany({
      where: { status: "PAID" },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        listing: { select: { title: true } },
        user: { select: { name: true } },
      },
    }),
  ]);

  const categoryIds = topCategories.map((c) => c.categoryId);
  const categories = categoryIds.length
    ? await prisma.category.findMany({ where: { id: { in: categoryIds } }, select: { id: true, name: true } })
    : [];
  const catMap = new Map(categories.map((c) => [c.id, c.name]));

  return {
    totalRevenue: revenueAll._sum.amount ?? 0,
    revenueLast30Days: revenue30d._sum.amount ?? 0,
    ordersLast30Days: revenue30d._count,
    promotionOrdersCount: ordersCount,
    activePromotions,
    viewsToday: viewsToday._sum.views ?? 0,
    viewsLast7Days: views7d._sum.views ?? 0,
    totalViews: totalViewsAgg._sum.views ?? 0,
    topCategories: topCategories.map((c) => ({
      name: catMap.get(c.categoryId) ?? "—",
      count: c._count,
    })),
    recentOrders: ordersRecent.map((o) => ({
      id: o.id,
      amount: o.amount,
      package: o.package,
      listingTitle: o.listing.title,
      userName: o.user.name,
      createdAt: o.createdAt,
    })),
  };
}
