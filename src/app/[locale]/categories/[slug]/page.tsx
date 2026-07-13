import { notFound } from "next/navigation";
import { BackButton } from "@/components/ui/BackButton";
import { SectionHeader } from "@/components/home/SectionHeader";
import { CategoryHubGrid } from "@/components/listings/CategoryHubGrid";
import { getCategoryHub, getTransportSubcategories } from "@/lib/categories";
import { categoryLabel } from "@/lib/category-label";
import { getTranslations } from "next-intl/server";

type Params = Promise<{ slug: string }>;

export default async function CategoryHubPage({ params }: { params: Params }) {
  const { slug } = await params;
  const tCat = await getTranslations("categories");
  const hub = await getCategoryHub(slug);
  if (!hub) notFound();

  const items =
    slug === "cars"
      ? getTransportSubcategories(hub, hub.children)
      : hub.children.map((c) => ({
          id: c.id,
          slug: c.slug,
          name: categoryLabel(c.slug, c.name, tCat),
          icon: c.icon,
          count: c._count.listings,
          subtitle: "",
        }));

  const hubTitle =
    slug === "cars" ? "Авто и транспорт" : categoryLabel(hub.slug, hub.name, tCat);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 md:py-10 pb-24">
      <BackButton href={slug === "cars" ? "/" : "/categories"} />
      <SectionHeader
        title={hubTitle}
        subtitle={
          slug === "cars"
            ? "Легковые, запчасти, аренда, грузовики, техника — как на Авито"
            : `${items.length} подкатегорий`
        }
      />
      <div className="mt-4">
        <CategoryHubGrid items={items} />
      </div>
    </div>
  );
}
