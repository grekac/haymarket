import { revalidateTag } from "next/cache";

export const CATEGORY_CACHE_TAGS = ["categories", "home-categories"] as const;

export function invalidateCategoryCache() {
  for (const tag of CATEGORY_CACHE_TAGS) {
    revalidateTag(tag);
  }
}
