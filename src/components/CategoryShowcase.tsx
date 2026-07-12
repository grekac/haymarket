"use client";

import Link from "next/link";
import { useState } from "react";
import { Grid3x3, ChevronDown, ChevronUp } from "lucide-react";
import { CategoryPhotoCard } from "./CategoryPhotoCard";

type Category = {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  isFeatured: boolean;
  _count: { listings: number };
};

export function CategoryShowcase({ categories }: { categories: Category[] }) {
  const [showAll, setShowAll] = useState(false);

  const featured = categories.filter((c) => c.isFeatured);
  const other = categories.filter((c) => !c.isFeatured);

  return (
    <section className="py-16 sm:py-20">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="section-title">Что ищете?</h2>
            <p className="section-subtitle">Все разделы с фотографиями</p>
          </div>
          {other.length > 0 && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)] px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] hover:shadow-md transition-all"
            >
              <Grid3x3 className="w-4 h-4" />
              {showAll ? "Скрыть" : `Ещё ${other.length} разделов`}
              {showAll ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          )}
        </div>

        {/* Основные разделы — крупные фото */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-3 sm:gap-4">
          {featured.map((cat, i) => (
            <div
              key={cat.id}
              className={i === 0 ? "col-span-2 sm:col-span-1 lg:row-span-2" : ""}
            >
              <CategoryPhotoCard
                slug={cat.slug}
                name={cat.name}
                imageUrl={cat.imageUrl}
                count={cat._count.listings}
                size={i === 0 ? "lg" : "md"}
                priority={i < 3}
              />
            </div>
          ))}
        </div>

        {/* Остальные разделы — тоже с фото */}
        {showAll && other.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-4">
              Другие разделы
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {other.map((cat) => (
                <CategoryPhotoCard
                  key={cat.id}
                  slug={cat.slug}
                  name={cat.name}
                  imageUrl={cat.imageUrl}
                  count={cat._count.listings}
                  size="sm"
                />
              ))}
            </div>
          </div>
        )}

        {!showAll && other.length > 0 && (
          <div className="mt-6 text-center">
            <Link
              href="/categories"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              Смотреть все {categories.length} разделов с фото
              <ChevronDown className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
