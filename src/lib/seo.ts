import type { AppLocale } from "@/i18n/routing";
import { getSiteUrl } from "@/lib/site-url";

export function localizedPath(path: string, locale: AppLocale) {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (normalized === "/") return `/${locale}`;
  return `/${locale}${normalized}`;
}

export function localeAlternates(path: string, locale: AppLocale) {
  const canonical = getSiteUrl(localizedPath(path, locale));
  return {
    canonical,
    languages: {
      hy: getSiteUrl(localizedPath(path, "hy")),
      ru: getSiteUrl(localizedPath(path, "ru")),
      en: getSiteUrl(localizedPath(path, "en")),
      "x-default": getSiteUrl(localizedPath(path, "hy")),
    },
  };
}

export function listingAlternates(id: string, locale: AppLocale) {
  return localeAlternates(`/listing/${id}`, locale);
}
