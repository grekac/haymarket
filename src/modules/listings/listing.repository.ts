import { prisma } from "@/lib/prisma";
import type { ListingStatus, Prisma } from "@prisma/client";

const listingListInclude = {
  category: true,
  images: { orderBy: { sortOrder: "asc" as const } },
  user: {
    select: {
      id: true,
      name: true,
      phone: true,
      avatar: true,
      isVerified: true,
      ratingAvg: true,
      ratingCount: true,
    },
  },
} satisfies Prisma.ListingInclude;

const listingInclude = {
  ...listingListInclude,
  carDetails: true,
  realEstate: true,
} satisfies Prisma.ListingInclude;

export type ListingWithRelations = Prisma.ListingGetPayload<{
  include: typeof listingInclude;
}>;

export class ListingRepository {
  async findMany(params: {
    where?: Prisma.ListingWhereInput;
    orderBy?: Prisma.ListingOrderByWithRelationInput | Prisma.ListingOrderByWithRelationInput[];
    skip?: number;
    take?: number;
  }) {
    return prisma.listing.findMany({ ...params, include: listingListInclude });
  }

  async count(where?: Prisma.ListingWhereInput) {
    return prisma.listing.count({ where });
  }

  async findById(id: string) {
    return prisma.listing.findUnique({ where: { id }, include: listingInclude });
  }

  async incrementViews(id: string) {
    return prisma.listing.update({
      where: { id },
      data: { views: { increment: 1 } },
    });
  }

  async create(data: Prisma.ListingCreateInput) {
    return prisma.listing.create({ data, include: listingInclude });
  }

  async update(id: string, data: Prisma.ListingUpdateInput) {
    return prisma.listing.update({ where: { id }, data, include: listingInclude });
  }

  async delete(id: string) {
    return prisma.listing.delete({ where: { id } });
  }

  async findSimilar(categoryId: string, excludeId: string, limit = 4) {
    return prisma.listing.findMany({
      where: { categoryId, status: "ACTIVE", id: { not: excludeId } },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: listingListInclude,
    });
  }
}

export const listingRepository = new ListingRepository();
