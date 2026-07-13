import { prisma } from "@/lib/prisma";
import {
  CATEGORY_FIELD_GROUPS,
  type CategoryFieldGroup,
} from "@/lib/category-fields";

const cache = new Map<string, { groups: CategoryFieldGroup[]; layoutType: string; at: number }>();
const TTL_MS = 60_000;

export type CategoryFieldConfig = {
  groups: CategoryFieldGroup[];
  layoutType: string;
  source: "db" | "static";
};

export async function getCategoryFieldConfig(slug: string, categoryId?: string): Promise<CategoryFieldConfig> {
  const cacheKey = categoryId ?? slug;
  const hit = cache.get(cacheKey);
  if (hit && Date.now() - hit.at < TTL_MS) {
    return { groups: hit.groups, layoutType: hit.layoutType, source: "db" };
  }

  if (categoryId) {
    try {
      const row = await prisma.categoryFieldSchema.findUnique({
        where: { categoryId },
      });
      if (row?.schema) {
        const groups = JSON.parse(row.schema) as CategoryFieldGroup[];
        if (Array.isArray(groups) && groups.length) {
          cache.set(cacheKey, { groups, layoutType: row.layoutType, at: Date.now() });
          return { groups, layoutType: row.layoutType, source: "db" };
        }
      }
    } catch {
      /* table may not exist yet */
    }
  }

  const staticGroups = CATEGORY_FIELD_GROUPS[slug] ?? [];
  const layoutType = resolveStaticLayoutType(slug);
  return { groups: staticGroups, layoutType, source: "static" };
}

export async function getCategoryFieldGroupsAsync(slug: string, categoryId?: string): Promise<CategoryFieldGroup[]> {
  const config = await getCategoryFieldConfig(slug, categoryId);
  return config.groups;
}

export async function saveCategoryFieldSchema(
  categoryId: string,
  groups: CategoryFieldGroup[],
  layoutType = "premium"
) {
  const schema = JSON.stringify(groups);
  const row = await prisma.categoryFieldSchema.upsert({
    where: { categoryId },
    create: { categoryId, schema, layoutType },
    update: { schema, layoutType },
  });
  cache.delete(categoryId);
  return row;
}

export function invalidateCategoryFieldCache(categoryId?: string) {
  if (categoryId) cache.delete(categoryId);
  else cache.clear();
}

function resolveStaticLayoutType(slug: string): string {
  if (slug === "real-estate") return "real-estate";
  if (slug === "jobs") return "jobs";
  if (slug === "cars" || slug === "new-cars") return "car";
  return "premium";
}
