import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { favoriteService } from "@/modules/favorites/favorite.service";
import { ListingCard } from "@/components/listings/ListingCard";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

import { BackButton } from "@/components/ui/BackButton";

export default async function FavoritesPage() {
  const user = await getSession();
  if (!user) redirect("/login?next=/favorites");

  const listings = await favoriteService.getUserFavorites(user.id);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 md:py-10">
      <BackButton href="/" />
      <h1 className="text-2xl font-bold mb-6">Избранное</h1>
      {listings.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-[var(--text-muted)] mb-4">Пока пусто</p>
          <Link href="/search"><Button>Найти объявления</Button></Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {listings.map((l) => <ListingCard key={l.id} listing={{ ...l, images: l.images.length ? l.images : [], views: 0, carDetails: null }} />)}
        </div>
      )}
    </div>
  );
}
