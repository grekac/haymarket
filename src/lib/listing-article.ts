/** Human-facing unique listing article (SKU). Prefer DB `articleNo`. */
export function formatListingArticle(articleNo: number | null | undefined, listingId: string): string {
  if (articleNo != null && articleNo > 0) return String(articleNo);
  // Stable fallback before / without migration backfill
  let h = 2166136261 >>> 0;
  for (let i = 0; i < listingId.length; i++) {
    h ^= listingId.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return String(1_000_000_000 + (h % 900_000_000));
}
