import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { getSiteUrl } from "@/lib/site-url";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: getSiteUrl("/"), changeFrequency: "hourly", priority: 1 },
    { url: getSiteUrl("/search"), changeFrequency: "hourly", priority: 0.9 },
    { url: getSiteUrl("/categories"), changeFrequency: "daily", priority: 0.8 },
    { url: getSiteUrl("/categories/cars"), changeFrequency: "daily", priority: 0.8 },
    { url: getSiteUrl("/create"), changeFrequency: "monthly", priority: 0.6 },
  ];

  try {
    const [listings, categories] = await Promise.all([
      prisma.listing.findMany({
        where: { status: "ACTIVE" },
        select: { id: true, updatedAt: true },
        orderBy: { updatedAt: "desc" },
        take: 5000,
      }),
      prisma.category.findMany({
        where: { isActive: true },
        select: { slug: true, createdAt: true },
      }),
    ]);

    return [
      ...staticPages,
      ...categories.map((c) => ({
        url: getSiteUrl(`/search?category=${c.slug}`),
        lastModified: c.createdAt,
        changeFrequency: "daily" as const,
        priority: 0.7,
      })),
      ...listings.map((l) => ({
        url: getSiteUrl(`/listing/${l.id}`),
        lastModified: l.updatedAt,
        changeFrequency: "daily" as const,
        priority: 0.8,
      })),
    ];
  } catch {
    return staticPages;
  }
}
