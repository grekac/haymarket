export const PROMOTION_PACKAGES = {
  basic: { id: "basic", days: 7, amount: 5_000, labelKey: "basic" },
  standard: { id: "standard", days: 14, amount: 9_000, labelKey: "standard" },
  premium: { id: "premium", days: 30, amount: 15_000, labelKey: "premium" },
} as const;

export type PromotionPackageId = keyof typeof PROMOTION_PACKAGES;

export function getPromotionPackage(id: string) {
  return PROMOTION_PACKAGES[id as PromotionPackageId] ?? null;
}

export function isListingPromoted(listing: {
  isPromoted: boolean;
  promotedUntil: Date | string | null;
}) {
  if (!listing.isPromoted) return false;
  if (!listing.promotedUntil) return true;
  return new Date(listing.promotedUntil).getTime() > Date.now();
}

export function promotionDaysLeft(promotedUntil: Date | string | null) {
  if (!promotedUntil) return null;
  const ms = new Date(promotedUntil).getTime() - Date.now();
  if (ms <= 0) return 0;
  return Math.ceil(ms / (24 * 60 * 60 * 1000));
}

export function extendPromotionUntil(current: Date | null, days: number) {
  const base = current && current.getTime() > Date.now() ? current : new Date();
  const until = new Date(base);
  until.setDate(until.getDate() + days);
  return until;
}
