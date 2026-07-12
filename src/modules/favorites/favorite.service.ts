import { prisma } from "@/lib/prisma";

export class FavoriteService {
  async toggle(userId: string, listingId: string) {
    const existing = await prisma.favorite.findUnique({
      where: { userId_listingId: { userId, listingId } },
    });

    if (existing) {
      await prisma.favorite.delete({ where: { id: existing.id } });
      return { favorited: false };
    }

    await prisma.favorite.create({ data: { userId, listingId } });
    return { favorited: true };
  }

  async getUserFavorites(userId: string) {
    const favorites = await prisma.favorite.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        listing: {
          include: {
            category: true,
            images: { orderBy: { sortOrder: "asc" }, take: 1 },
            user: { select: { id: true, name: true } },
          },
        },
      },
    });
    return favorites.map((f) => f.listing);
  }

  async isFavorited(userId: string, listingId: string) {
    const fav = await prisma.favorite.findUnique({
      where: { userId_listingId: { userId, listingId } },
    });
    return !!fav;
  }
}

export const favoriteService = new FavoriteService();
