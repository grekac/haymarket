import { getTranslations } from "next-intl/server";
import { CategoryCard } from "@/components/listings/CategoryCard";
import { BackButton } from "@/components/ui/BackButton";
import { SectionHeader } from "@/components/home/SectionHeader";
import { getHomeCategories } from "@/lib/categories";
import { categoryLabel } from "@/lib/category-label";

export default async function CategoriesPage() {
  const t = await getTranslations("categories");
  let categories: Awaited<ReturnType<typeof getHomeCategories>> = [];
  try {
    categories = await getHomeCategories();
  } catch (error) {
    console.error("[categories] database error:", error);
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 md:py-10">
      <BackButton href="/" />
      <SectionHeader title="Категории" subtitle={`${categories.length} разделов`} />

      <div className="flex flex-col gap-2.5 mt-2">
        {categories.map((cat) => (
          <CategoryCard
            key={cat.id}
            slug={cat.slug}
            name={categoryLabel(cat.slug, cat.name, t)}
            icon={cat.icon}
            count={cat._count.listings}
            childCount={cat._count.children}
            variant="row"
            showCount
          />
        ))}
      </div>
    </div>
  );
}
