import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CategoryCard, type CategoryItem } from "./CategoryCard";

type Category = CategoryItem & {
  _count?: { listings: number; children?: number };
};

function toItem(cat: Category): CategoryItem {
  return {
    slug: cat.slug,
    name: cat.name,
    icon: cat.icon,
    count: cat._count?.listings ?? 0,
    childCount: cat._count?.children ?? 0,
  };
}

/** Круглые иконки — Apple-style orb */
export function CategoryShowcase({ categories, compact, orb }: { categories: Category[]; compact?: boolean; orb?: boolean }) {
  const items = categories.map(toItem);

  if (orb) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-none snap-x snap-mandatory md:grid md:grid-cols-5 md:gap-3 md:overflow-visible md:mx-0 md:px-0">
        {items.map((cat) => (
          <CategoryCard key={cat.slug} {...cat} variant="orb" className="md:min-w-0" />
        ))}
      </div>
    );
  }

  if (compact) {
    return (
      <div className="flex gap-3 overflow-x-auto pb-1 -mx-4 px-4 snap-x snap-mandatory scrollbar-none md:grid md:grid-cols-5 md:gap-2 md:overflow-visible md:mx-0 md:px-0">
        {items.map((cat) => (
          <CategoryCard key={cat.slug} {...cat} variant="compact" className="md:min-w-0" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
      {items.map((cat) => (
        <CategoryCard key={cat.slug} {...cat} variant="tile" />
      ))}
    </div>
  );
}

export function CategoryShowcaseHeader() {
  return (
    <Link
      href="/categories"
      className="text-xs font-medium text-[var(--brand)] hover:opacity-80 inline-flex items-center gap-0.5"
    >
      Все
      <ArrowRight className="w-3.5 h-3.5" />
    </Link>
  );
}
