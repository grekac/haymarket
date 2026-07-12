import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { BackButton } from "@/components/ui/BackButton";
import { QuickCreateWizard } from "@/components/listings/QuickCreateWizard";
import { getCategoryHub, getHomeCategories, getTransportSubcategories } from "@/lib/categories";

export default async function CreatePage() {
  const user = await getSession();
  if (!user) redirect("/login?next=/create");

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
        <h1 className="text-xl font-semibold">Быстрое объявление</h1>
        <Link href="/create/full" className="text-sm text-[var(--text-muted)] hover:underline">
          Полная форма
        </Link>
      </div>
      <QuickCreateWizard
        categories={categories}
        transportSubcategories={transportSubcategories}
      />
    </div>
  );
}
