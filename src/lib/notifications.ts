import { prisma } from "@/lib/prisma";

export async function notifyUser(opts: {
  userId: string;
  type: string;
  title: string;
  body: string;
  link?: string;
}) {
  return prisma.notification.create({ data: opts });
}

export async function notifyAdmins(opts: {
  type: string;
  title: string;
  body: string;
  link?: string;
}) {
  const admins = await prisma.user.findMany({
    where: { role: "ADMIN", isBlocked: false },
    select: { id: true },
  });
  await Promise.all(admins.map((a) => notifyUser({ userId: a.id, ...opts })));
}

export async function notifySavedSearchesForListing(listingId: string) {
  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    include: { category: true },
  });
  if (!listing || listing.status !== "ACTIVE") return;

  const searches = await prisma.savedSearch.findMany({
    where: { notifyEnabled: true },
    include: { user: true },
  });

  for (const s of searches) {
    let filters: Record<string, string> = {};
    try {
      filters = JSON.parse(s.filters);
    } catch {
      continue;
    }

    const matchQ = !filters.q || listing.title.toLowerCase().includes(filters.q.toLowerCase());
    const matchCat = !filters.category || listing.category.slug === filters.category;
    const matchCity = !filters.city || listing.city === filters.city;

    if (matchQ && matchCat && matchCity) {
      await notifyUser({
        userId: s.userId,
        type: "saved_search",
        title: "Новое объявление по вашему поиску",
        body: listing.title,
        link: `/listing/${listing.id}`,
      });
    }
  }
}
