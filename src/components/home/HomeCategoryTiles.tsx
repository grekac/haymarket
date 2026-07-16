import Image from "next/image";
import Link from "next/link";
import { categoryLink } from "@/lib/categories";
import { CategoryIcon } from "@/components/listings/CategoryIcon";
import { cn } from "@/lib/utils";

type Cat = {
  slug: string;
  name: string;
  icon: string;
  imageUrl?: string | null;
  _count?: { listings?: number; children?: number };
};

/** Avito-style category tiles for mobile home */
export function HomeCategoryTiles({ categories }: { categories: Cat[] }) {
  const items = [
    {
      slug: "all",
      name: "Все",
      icon: "LayoutGrid",
      imageUrl: null as string | null,
      href: "/categories",
      childCount: 0,
    },
    ...categories.map((c) => ({
      slug: c.slug,
      name: c.name,
      icon: c.icon,
      imageUrl: c.imageUrl ?? null,
      href: categoryLink(c.slug, c._count?.children ?? 0),
      childCount: c._count?.children ?? 0,
    })),
  ];

  return (
    <div className="grid grid-cols-3 gap-2">
      {items.slice(0, 9).map((cat) => (
        <Link
          key={cat.slug}
          href={cat.href}
          className={cn(
            "relative h-[88px] rounded-2xl overflow-hidden",
            "bg-[var(--bg-secondary)] border border-[var(--border)]/50",
            "active:scale-[0.98] transition-transform"
          )}
        >
          <div className="absolute top-2 left-2 right-8 z-10">
            <p className="text-[12px] font-semibold leading-tight line-clamp-2 text-[var(--text-primary)]">
              {cat.name}
            </p>
          </div>

          {cat.imageUrl ? (
            <Image
              src={cat.imageUrl}
              alt=""
              width={72}
              height={72}
              className="absolute -bottom-1 -right-1 w-[68px] h-[68px] object-contain drop-shadow-md"
            />
          ) : (
            <div className="absolute bottom-2 right-2 w-10 h-10 rounded-xl bg-[var(--bg-card)] flex items-center justify-center">
              <CategoryIcon name={cat.icon} className="w-5 h-5 text-[var(--text-secondary)]" />
            </div>
          )}
        </Link>
      ))}
    </div>
  );
}
