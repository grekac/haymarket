import { listingRepository } from "./listing.repository";
import { smartSearch, tokenize } from "@/lib/search";
import { prisma } from "@/lib/prisma";
import { expirePromotions } from "@/lib/analytics";
import { isListingPromoted } from "@/lib/promotion";
import { getVariantCodesFromGenerations } from "@/lib/car-generation-groups";
import type { Prisma, DealType, PropertyType } from "@prisma/client";

export interface ListingFilters {
  search?: string;
  category?: string;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: "newest" | "price_asc" | "price_desc" | "popular";
  page?: number;
  limit?: number;
  brand?: string;
  model?: string;
  generation?: string;
  body?: string;
  generationIn?: string[];
  yearFrom?: number;
  yearTo?: number;
  propertyType?: string;
  dealType?: string;
  rooms?: number;
}

export class ListingService {
  private repo = listingRepository;

  private buildWhere(filters: ListingFilters): Prisma.ListingWhereInput {
    const where: Prisma.ListingWhereInput = { status: "ACTIVE" };

    if (filters.category) where.category = { slug: filters.category };
    if (filters.city) where.city = filters.city;

    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      where.price = {};
      if (filters.minPrice !== undefined) where.price.gte = filters.minPrice;
      if (filters.maxPrice !== undefined) where.price.lte = filters.maxPrice;
    }

    if (filters.brand || filters.model || filters.generation || filters.body || filters.yearFrom || filters.yearTo) {
      const carWhere: Prisma.CarDetailsWhereInput = {};
      if (filters.brand) carWhere.brand = filters.brand;
      if (filters.model) carWhere.model = filters.model;
      if (filters.body) {
        carWhere.generation = filters.body;
      } else if (filters.generationIn?.length) {
        carWhere.generation = { in: filters.generationIn };
      } else if (filters.generation) {
        carWhere.generation = filters.generation;
      }
      if (filters.yearFrom || filters.yearTo) {
        carWhere.year = {
          ...(filters.yearFrom ? { gte: filters.yearFrom } : {}),
          ...(filters.yearTo ? { lte: filters.yearTo } : {}),
        };
      }
      where.carDetails = carWhere;
    }
    if (filters.propertyType || filters.dealType || filters.rooms) {
      const reWhere: Prisma.RealEstateDetailsWhereInput = {};
      if (filters.propertyType) {
        reWhere.propertyType = filters.propertyType as PropertyType;
      }
      if (filters.dealType) {
        reWhere.dealType = filters.dealType as DealType;
      }
      if (filters.rooms) reWhere.rooms = filters.rooms;
      where.realEstate = reWhere;
    }

    if (filters.search) {
      const tokens = tokenize(filters.search);
      if (tokens.length > 0) {
        where.OR = tokens.flatMap((t) => [
          { title: { contains: t } },
          { description: { contains: t } },
        ]);
      }
    }

    return where;
  }

  private buildOrderBy(sort?: string): Prisma.ListingOrderByWithRelationInput[] {
    const promoted: Prisma.ListingOrderByWithRelationInput = { isPromoted: "desc" };
    switch (sort) {
      case "price_asc": return [promoted, { price: "asc" }];
      case "price_desc": return [promoted, { price: "desc" }];
      case "popular": return [promoted, { views: "desc" }];
      default: return [promoted, { createdAt: "desc" }];
    }
  }

  private sortPromotedFirst<
    T extends { isPromoted: boolean; promotedUntil: Date | null; price: number; views: number; createdAt: Date }
  >(items: T[], sort?: string) {
    const cmp = (a: T, b: T) => {
      const aPromo = isListingPromoted(a);
      const bPromo = isListingPromoted(b);
      if (aPromo !== bPromo) return aPromo ? -1 : 1;
      if (sort === "price_asc") return a.price - b.price;
      if (sort === "price_desc") return b.price - a.price;
      if (sort === "popular") return b.views - a.views;
      return b.createdAt.getTime() - a.createdAt.getTime();
    };
    return [...items].sort(cmp);
  }

  async search(filters: ListingFilters) {
    await expirePromotions();
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;
    const skip = (page - 1) * limit;
    const resolved = await this.resolveCarFilters(filters);
    const where = this.buildWhere(resolved);

    if (filters.search?.trim()) {
      let items = await this.repo.findMany({ where, take: 200 });
      items = smartSearch(filters.search, items);
      const total = items.length;
      items = this.sortPromotedFirst(items, filters.sort);
      return {
        items: items.slice(skip, skip + limit),
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };
    }

    const [items, total] = await Promise.all([
      this.repo.findMany({
        where,
        orderBy: this.buildOrderBy(filters.sort),
        skip,
        take: limit,
      }),
      this.repo.count(where),
    ]);

    return { items, total, page, totalPages: Math.ceil(total / limit) };
  }

  private async resolveCarFilters(filters: ListingFilters): Promise<ListingFilters> {
    if (filters.body || !filters.generation || !filters.brand || !filters.model) {
      return filters;
    }

    const model = await prisma.carModel.findFirst({
      where: { name: filters.model, brand: { name: filters.brand } },
      select: {
        generations: {
          select: {
            id: true,
            code: true,
            name: true,
            yearFrom: true,
            yearTo: true,
            imageUrl: true,
            modelId: true,
          },
        },
        brand: { select: { slug: true } },
      },
    });

    if (!model) return filters;

    const codes = getVariantCodesFromGenerations(
      model.generations,
      filters.generation,
      model.brand.slug
    );

    if (codes.length <= 1) return filters;
    return { ...filters, generationIn: codes };
  }

  async getById(id: string) {
    await expirePromotions();
    const listing = await this.repo.findById(id);
    if (!listing || listing.status !== "ACTIVE") return null;
    const { recordListingView } = await import("@/lib/analytics");
    await recordListingView(id);
    return listing;
  }

  async getSimilar(categoryId: string, excludeId: string) {
    return this.repo.findSimilar(categoryId, excludeId);
  }

  async getSimilarCars(
    listing: { id: string; categoryId: string; carDetails: { brand: string; model: string; year: number; mileage: number } | null },
    limit = 8
  ) {
    if (!listing.carDetails) {
      return this.repo.findSimilar(listing.categoryId, listing.id, limit);
    }
    const { brand, model, year, mileage } = listing.carDetails;
    return prisma.listing.findMany({
      where: {
        status: "ACTIVE",
        id: { not: listing.id },
        carDetails: {
          brand,
          model,
          year: { gte: year - 2, lte: year + 2 },
          mileage: { gte: Math.max(0, mileage - 50000), lte: mileage + 50000 },
        },
      },
      orderBy: [{ isPromoted: "desc" }, { createdAt: "desc" }],
      take: limit,
      include: {
        category: true,
        images: { orderBy: { sortOrder: "asc" } },
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
      },
    });
  }

  async update(
    id: string,
    userId: string,
    data: {
      title?: string;
      description?: string;
      price?: number;
      city?: string;
      district?: string;
      condition?: string;
    },
    isAdmin = false
  ) {
    const listing = await prisma.listing.findUnique({ where: { id } });
    if (!listing) throw new Error("Объявление не найдено");
    if (!isAdmin && listing.userId !== userId) throw new Error("Нет доступа");

    return prisma.listing.update({
      where: { id },
      data: {
        ...(data.title !== undefined ? { title: data.title.trim() } : {}),
        ...(data.description !== undefined ? { description: data.description.trim() } : {}),
        ...(data.price !== undefined ? { price: Number(data.price) } : {}),
        ...(data.city !== undefined ? { city: data.city } : {}),
        ...(data.district !== undefined ? { district: data.district || null } : {}),
        ...(data.condition !== undefined ? { condition: data.condition } : {}),
      },
      include: {
        category: true,
        images: { orderBy: { sortOrder: "asc" } },
        user: { select: { id: true, name: true, phone: true } },
      },
    });
  }

  async delete(id: string, userId: string, isAdmin = false) {
    const listing = await prisma.listing.findUnique({ where: { id } });
    if (!listing) throw new Error("Объявление не найдено");
    if (!isAdmin && listing.userId !== userId) throw new Error("Нет доступа");
    await prisma.listing.delete({ where: { id } });
    return { ok: true };
  }
}

export const listingService = new ListingService();
