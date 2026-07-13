import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { getSiteUrl } from "@/lib/site-url";
import { locales } from "@/i18n/routing";
import { localizedPath } from "@/lib/seo";

const STATIC_PATHS = ["/", "/search", "/categories", "/categories/cars", "/create"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = locales.flatMap((locale) =>
    STATIC_PATHS.map((path) => ({
      url: getSiteUrl(localizedPath(path, locale)),
      changeFrequency: path === "/" || path === "/search" ? ("hourly" as const) : ("daily" as const),
      priority: path === "/" ? 1 : path === "/search" ? 0.9 : 0.7,
      alternates: {
        languages: Object.fromEntries(
          locales.map((l) => [l, getSiteUrl(localizedPath(path, l))])
        ),
      },
    }))
  );

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

    const listingPages = listings.flatMap((l) =>
      locales.map((locale) => ({
        url: getSiteUrl(localizedPath(`/listing/${l.id}`, locale)),
        lastModified: l.updatedAt,
        changeFrequency: "daily" as const,
        priority: 0.8,
        alternates: {
          languages: Object.fromEntries(
            locales.map((lang) => [lang, getSiteUrl(localizedPath(`/listing/${l.id}`, lang))])
          ),
        },
      }))
    );

    const categoryPages = categories.flatMap((c) =>
      locales.map((locale) => ({
        url: getSiteUrl(localizedPath(`/search?category=${c.slug}`, locale)),
        lastModified: c.createdAt,
        changeFrequency: "daily" as const,
        priority: 0.7,
      }))
    );

    return [...staticPages, ...categoryPages, ...listingPages];
  } catch {
    return staticPages;
  }
}
