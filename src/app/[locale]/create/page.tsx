import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { CreateCategorySelect } from "@/components/listings/CreateCategorySelect";
import { getCategoryHub, getHomeCategories, getTransportSubcategories } from "@/lib/categories";
import { categoryLabel } from "@/lib/category-label";
import { getTranslations, setRequestLocale } from "next-intl/server";

type Props = { params: Promise<{ locale: string }> };

export default async function CreatePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const user = await getSession();
  if (!user) redirect("/login?next=/create");

  const tCat = await getTranslations("categories");
  const [categories, carsHub] = await Promise.all([
    getHomeCategories(),
    getCategoryHub("cars"),
  ]);

  const transportSubcategories = carsHub
    ? getTransportSubcategories(carsHub, carsHub.children).map((c) => ({
        id: c.id,
        slug: c.slug,
        name: c.name,
        icon: c.icon,
        subtitle: c.subtitle,
      }))
    : [];

  const displayCategories = categories.map((cat) => ({
    id: cat.id,
    slug: cat.slug,
    name: categoryLabel(cat.slug, cat.name, tCat),
    icon: cat.icon,
    imageUrl: cat.imageUrl,
  }));

  return (
    <CreateCategorySelect
      categories={displayCategories}
      transportSubcategories={transportSubcategories}
      closeHref="/my"
    />
  );
}
