import Link from "next/link";
import { CategoryIcon } from "./CategoryIcon";

type Cat = { slug: string; name: string; icon: string; _count?: { listings: number } };

export function CategoryCards({ categories }: { categories: Cat[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
      {categories.map((cat) => (
        <Link
          key={cat.slug}
          href={`/search?category=${cat.slug}`}
          className="flex flex-col items-center gap-2 p-4 rounded-lg border border-[var(--border)] bg-[var(--bg-card)] hover:border-[var(--border-hover)] transition-colors"
        >
          <CategoryIcon name={cat.icon} className="w-5 h-5 text-[var(--text-secondary)]" />
          <div className="text-center">
            <p className="text-xs font-medium leading-tight">{cat.name}</p>
            {cat._count && (
              <p className="text-[11px] text-[var(--text-muted)] mt-0.5">{cat._count.listings}</p>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}
