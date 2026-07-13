import type { ListingWithRelations } from "@/modules/listings/listing.repository";

export type ListingLayoutType = "car" | "real-estate" | "jobs" | "premium";

export function resolveListingLayout(listing: ListingWithRelations): ListingLayoutType {
  if (listing.carDetails) return "car";
  if (listing.realEstate) return "real-estate";
  if (listing.category.slug === "jobs") return "jobs";
  return "premium";
}
