import { prisma } from "@/lib/prisma";
import { CategoryCard } from "@/components/listings/CategoryCard";
import { BackButton } from "@/components/ui/BackButton";
import { SectionHeader } from "@/components/home/SectionHeader";
import { getHomeCategories } from "@/lib/categories";

export default async function CategoriesPage() {
  const categories = await getHomeCategories();

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 md:py-10">
      <BackButton href="/" />
      <SectionHeader title="Категории" subtitle={`${categories.length} разделов`} />

      <div className="flex flex-col gap-2.5 mt-2">
        {categories.map((cat) => (
          <CategoryCard
            key={cat.id}
            slug={cat.slug}
            name={cat.name}
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
