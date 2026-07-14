import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { AvitoCreateWizard } from "@/components/listings/avito-create/AvitoCreateWizard";
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
  if (!sp.category) redirect("/create");

  const [categories, carsHub] = await Promise.all([
    getHomeCategories(),
    getCategoryHub("cars"),
  ]);
  const transportSubcategories = carsHub
    ? getTransportSubcategories(carsHub, carsHub.children)
    : [];

  return (
    <AvitoCreateWizard
      categories={categories}
      transportSubcategories={transportSubcategories}
      initialCategorySlug={sp.category}
    />
  );
}
