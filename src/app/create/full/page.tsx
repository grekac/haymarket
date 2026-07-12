import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { BackButton } from "@/components/ui/BackButton";
import { CreateListingForm } from "@/components/listings/CreateListingForm";
import { getCategoryHub, getHomeCategories, getTransportSubcategories } from "@/lib/categories";

type SearchParams = Promise<{ category?: string }>;

export default async function CreateFullPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const user = await getSession();
  if (!user) redirect("/login?next=/create/full");

  const sp = await searchParams;
  const [categories, carsHub] = await Promise.all([
    getHomeCategories(),
    getCategoryHub("cars"),
  ]);
  const transportSubcategories = carsHub
    ? getTransportSubcategories(carsHub, carsHub.children)
    : [];

  return (
    <div className="max-w-lg mx-auto px-4 py-6 md:py-10">
      <BackButton href="/" />
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">Новое объявление</h1>
        <Link href="/create" className="text-sm text-[var(--text-muted)] hover:underline">
          Быстрое
        </Link>
      </div>
      <CreateListingForm
        categories={categories}
        transportSubcategories={transportSubcategories}
        initialCategorySlug={sp.category}
      />
    </div>
  );
}
