import { defineRouting } from "next-intl/routing";

export const locales = ["hy", "ru", "en"] as const;
export type AppLocale = (typeof locales)[number];

export const routing = defineRouting({
  locales,
  defaultLocale: "hy",
  localePrefix: "always",
});

export const localeLabels: Record<AppLocale, string> = {
  hy: "Հայ",
  ru: "Рус",
  en: "Eng",
};

export const openGraphLocales: Record<AppLocale, string> = {
  hy: "hy_AM",
  ru: "ru_RU",
  en: "en_US",
};
