import { fixMojibake } from "@/lib/text-encoding";

/** Category label: i18n by slug, else fix broken DB encoding */
export function categoryLabel(
  slug: string,
  dbName: string,
  t?: { has: (key: string) => boolean; (key: string): string }
): string {
  if (t?.has(slug)) return t(slug);
  return fixMojibake(dbName);
}
