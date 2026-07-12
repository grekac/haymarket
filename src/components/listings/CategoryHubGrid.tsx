import { CategoryCard } from "./CategoryCard";
import { categoryLink } from "@/lib/categories";

export type HubCategoryItem = {
  id: string;
  slug: string;
  name: string;
  icon: string;
  count?: number;
  subtitle?: string;
};

/** Сетка подкатегорий — orb на мобильном, плитки на десктопе */
export function CategoryHubGrid({ items }: { items: HubCategoryItem[] }) {
  return (
    <>
      <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-none snap-x snap-mandatory md:hidden">
        {items.map((item) => (
          <CategoryCard
            key={item.slug}
            slug={item.slug}
            name={item.name}
            icon={item.icon}
            href={categoryLink(item.slug)}
            variant="orb"
            className="min-w-[80px]"
          />
        ))}
      </div>

      <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-4 gap-3">
        {items.map((item) => (
          <CategoryCard
            key={item.slug}
            slug={item.slug}
            name={item.name}
            icon={item.icon}
            href={categoryLink(item.slug)}
            subtitle={item.subtitle}
            variant="tile"
          />
        ))}
      </div>

      <div className="md:hidden mt-4 space-y-2">
        {items.map((item) => (
          <CategoryCard
            key={item.slug}
            slug={item.slug}
            name={item.name}
            icon={item.icon}
            count={item.count}
            href={categoryLink(item.slug)}
            subtitle={item.subtitle}
            variant="row"
            showCount
          />
        ))}
      </div>
    </>
  );
}
