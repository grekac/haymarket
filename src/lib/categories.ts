import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";

/** Категории-хабы: по клику открывают подкатегории, а не поиск */
export const CATEGORY_HUB_SLUGS = ["cars"] as const;

export type CategoryHubSlug = (typeof CATEGORY_HUB_SLUGS)[number];

export function isCategoryHub(slug: string, childCount = 0): boolean {
  return CATEGORY_HUB_SLUGS.includes(slug as CategoryHubSlug) || childCount > 0;
}

export function categoryLink(slug: string, childCount = 0): string {
  return isCategoryHub(slug, childCount) ? `/categories/${slug}` : `/search?category=${slug}`;
}

/** Подписи для хаба «Авто» — как на Авито */
export const AUTO_HUB_ITEMS: Record<string, string> = {
  cars: "С пробегом и б/у",
  "new-cars": "Из салона, без пробега",
  "car-rental": "Посуточно и на срок",
  "car-parts": "Запчасти и аксессуары",
  trucks: "Грузовики, фуры, спецтехника",
  "machinery-rental": "Тракторы, самосвалы, экскаваторы",
  motorcycles: "Мото, скутеры, квадроциклы",
  "water-transport": "Лодки, катера, гидроциклы",
  buses: "Автобусы и микроавтобусы",
};

export async function getHomeCategories() {
  return unstable_cache(
    () =>
      prisma.category.findMany({
        where: { isActive: true, showOnHome: true },
        orderBy: { sortOrder: "asc" },
        include: {
          _count: { select: { listings: true, children: true } },
        },
      }),
    ["home-categories"],
    { revalidate: 300, tags: ["categories", "home-categories"] }
  )();
}

export async function getCategoryHub(slug: string) {
  const category = await prisma.category.findFirst({
    where: { slug, isActive: true },
    include: {
      children: {
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
        include: { _count: { select: { listings: true } } },
      },
      _count: { select: { listings: true, children: true } },
    },
  });
  if (!category || !isCategoryHub(slug, category._count.children)) return null;
  return category;
}

export async function getLeafCategories() {
  const all = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    include: {
      children: { where: { isActive: true }, orderBy: { sortOrder: "asc" } },
    },
  });

  const hubs = all.filter((c) => isCategoryHub(c.slug, c.children.length));
  const leaves = all.filter((c) => !isCategoryHub(c.slug, c.children.length));

  return { all, hubs, leaves };
}

export function getTransportSubcategories(
  carsHub: { id: string; slug: string; name: string; icon: string; _count?: { listings: number } },
  children: Array<{ id: string; slug: string; name: string; icon: string; _count?: { listings: number } }>
) {
  const passenger = {
    id: carsHub.id,
    slug: carsHub.slug,
    name: "Легковые автомобили",
    icon: carsHub.icon,
    count: carsHub._count?.listings ?? 0,
    subtitle: AUTO_HUB_ITEMS.cars,
    href: "/search?category=cars",
  };

  const rest = children.map((c) => ({
    id: c.id,
    slug: c.slug,
    name: c.name,
    icon: c.icon,
    count: c._count?.listings ?? 0,
    subtitle: AUTO_HUB_ITEMS[c.slug] ?? "",
  }));

  return [passenger, ...rest];
}
