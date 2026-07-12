import { CategoryPhotoCard } from "./CategoryPhotoCard";

type Category = {
  id: string;
  name: string;
  slug: string;
  imageUrl?: string | null;
  _count: { listings: number };
};

export function CategoryGrid({ categories }: { categories: Category[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
      {categories.map((cat) => (
        <CategoryPhotoCard
          key={cat.id}
          slug={cat.slug}
          name={cat.name}
          imageUrl={cat.imageUrl ?? null}
          count={cat._count.listings}
          size="sm"
        />
      ))}
    </div>
  );
}
