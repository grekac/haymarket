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
    return prisma.listing.update({ where: { id }, data: { status } });
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
}

export const adminService = new AdminService();
