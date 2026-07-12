import { ListingCard } from "./ListingCard";

type Listing = {
  id: string;
  title: string;
  price: number;
  currency: string;
  city: string;
  imageUrl: string | null;
  createdAt: Date;
  category: { name: string; icon?: string };
};

export function ListingGrid({ listings }: { listings: Listing[] }) {
  if (listings.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-4xl mb-3">🔍</p>
        <p className="text-[var(--text-muted)]">Ничего не найдено</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {listings.map((listing) => (
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </div>
  );
}
