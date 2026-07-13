import { prisma } from "@/lib/prisma";

export class AdminService {
  async getStats() {
    const [users, listings, activeListings, pendingListings, messages] =
      await Promise.all([
        prisma.user.count(),
        prisma.listing.count(),
        prisma.listing.count({ where: { status: "ACTIVE" } }),
        prisma.listing.count({ where: { status: "PENDING" } }),
        prisma.message.count(),
      ]);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const newToday = await prisma.listing.count({
      where: { createdAt: { gte: today } },
    });

    return { users, listings, activeListings, pendingListings, messages, newToday };
  }

  async getListings(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      prisma.listing.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          category: true,
          images: { take: 1 },
          user: { select: { id: true, name: true, phone: true } },
        },
      }),
      prisma.listing.count(),
    ]);
    return { items, total, page, totalPages: Math.ceil(total / limit) };
  }

  async updateListingStatus(id: string, status: "ACTIVE" | "REJECTED" | "ARCHIVED") {
    const listing = await prisma.listing.update({ where: { id }, data: { status } });
    if (status === "ACTIVE") {
      const { notifySavedSearchesForListing, notifyUser } = await import("@/lib/notifications");
      notifySavedSearchesForListing(id).catch(() => {});
      notifyUser({
        userId: listing.userId,
        type: "listing_approved",
        title: "Объявление опубликовано",
        body: listing.title,
        link: `/listing/${id}`,
      }).catch(() => {});
    }
    return listing;
  }

  async deleteListing(id: string) {
    return prisma.listing.delete({ where: { id } });
  }

  async getUsers(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true, name: true, phone: true, email: true,
          role: true, isBlocked: true, isVerified: true,
          ratingAvg: true, ratingCount: true, createdAt: true,
          _count: { select: { listings: true } },
        },
      }),
      prisma.user.count(),
    ]);
    return { items, total, page, totalPages: Math.ceil(total / limit) };
  }

  async toggleBlockUser(id: string) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new Error("Пользователь не найден");
    return prisma.user.update({
      where: { id },
      data: { isBlocked: !user.isBlocked },
    });
  }

  async toggleVerifyUser(id: string) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new Error("Пользователь не найден");
    return prisma.user.update({
      where: { id },
      data: {
        isVerified: !user.isVerified,
        verifiedAt: !user.isVerified ? new Date() : null,
      },
    });
  }

  async getCategories() {
    return prisma.category.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      include: {
        parent: { select: { id: true, name: true, slug: true } },
        _count: { select: { listings: true, children: true } },
      },
    });
  }

  async createCategory(data: {
    name: string;
    slug: string;
    icon: string;
    imageUrl?: string;
    sortOrder?: number;
    parentId?: string | null;
    showOnHome?: boolean;
  }) {
    return prisma.category.create({
      data: {
        name: data.name.trim(),
        slug: data.slug.trim().toLowerCase(),
        icon: data.icon.trim(),
        imageUrl: data.imageUrl || null,
        sortOrder: data.sortOrder ?? 0,
        parentId: data.parentId || null,
        showOnHome: data.showOnHome ?? true,
        isActive: true,
      },
    });
  }

  async reorderCategories(items: Array<{ id: string; sortOrder: number }>) {
    await prisma.$transaction(
      items.map((item) =>
        prisma.category.update({
          where: { id: item.id },
          data: { sortOrder: item.sortOrder },
        })
      )
    );
  }

  private async isDescendant(ancestorId: string, candidateId: string): Promise<boolean> {
    let currentId: string | null = candidateId;
    const seen = new Set<string>();

    while (currentId) {
      if (currentId === ancestorId) return true;
      if (seen.has(currentId)) break;
      seen.add(currentId);
      const row: { parentId: string | null } | null = await prisma.category.findUnique({
        where: { id: currentId },
        select: { parentId: true },
      });
      currentId = row?.parentId ?? null;
    }

    return false;
  }

  async updateCategory(
    id: string,
    data: Partial<{
      name: string;
      slug: string;
      icon: string;
      imageUrl: string | null;
      sortOrder: number;
      parentId: string | null;
      showOnHome: boolean;
      isActive: boolean;
    }>
  ) {
    if (data.parentId !== undefined) {
      if (data.parentId === id) throw new Error("Категория не может быть родителем самой себе");
      if (data.parentId && (await this.isDescendant(id, data.parentId))) {
        throw new Error("Нельзя выбрать подкатегорию в качестве родителя");
      }
    }

    return prisma.category.update({
      where: { id },
      data: {
        ...(data.name !== undefined ? { name: data.name.trim() } : {}),
        ...(data.slug !== undefined ? { slug: data.slug.trim().toLowerCase() } : {}),
        ...(data.icon !== undefined ? { icon: data.icon.trim() } : {}),
        ...(data.imageUrl !== undefined ? { imageUrl: data.imageUrl } : {}),
        ...(data.sortOrder !== undefined ? { sortOrder: data.sortOrder } : {}),
        ...(data.parentId !== undefined ? { parentId: data.parentId } : {}),
        ...(data.showOnHome !== undefined ? { showOnHome: data.showOnHome } : {}),
        ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
      },
    });
  }

  async deleteCategory(id: string) {
    const count = await prisma.listing.count({ where: { categoryId: id } });
    if (count > 0) throw new Error("В категории есть объявления");
    const children = await prisma.category.count({ where: { parentId: id } });
    if (children > 0) throw new Error("У категории есть подкатегории");
    return prisma.category.delete({ where: { id } });
  }

  async getReports() {
    return prisma.report.findMany({
      where: { resolvedAt: null },
      orderBy: { createdAt: "desc" },
      include: {
        listing: { select: { id: true, title: true, status: true } },
        user: { select: { id: true, name: true, phone: true } },
      },
      take: 50,
    });
  }

  async resolveReport(id: string) {
    return prisma.report.update({
      where: { id },
      data: { resolvedAt: new Date() },
    });
  }

  async getListingsPendingFirst(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [all, total, pendingCount] = await Promise.all([
      prisma.listing.findMany({
        orderBy: { createdAt: "desc" },
        take: 200,
        include: {
          category: true,
          images: { take: 1 },
          user: { select: { id: true, name: true, phone: true } },
        },
      }),
      prisma.listing.count(),
      prisma.listing.count({ where: { status: "PENDING" } }),
    ]);

    const sorted = [...all].sort((a, b) => {
      if (a.status === "PENDING" && b.status !== "PENDING") return -1;
      if (b.status === "PENDING" && a.status !== "PENDING") return 1;
      return b.createdAt.getTime() - a.createdAt.getTime();
    });

    const items = sorted.slice(skip, skip + limit);
    return { items, total, pendingCount, page, totalPages: Math.ceil(total / limit) };
  }
}

export const adminService = new AdminService();
