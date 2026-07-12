"use client";

import { ChevronLeft } from "lucide-react";
import { CategoryIcon, CATEGORY_GRADIENT, CATEGORY_SHADOW } from "./CategoryIcon";
import { cn } from "@/lib/utils";
import type { HubCategoryItem } from "./CategoryHubGrid";

type Props = {
  items: HubCategoryItem[];
  onPick: (item: HubCategoryItem) => void;
  onBack: () => void;
};

/** Выбор подкатегории транспорта — orb на мобильном, плитки на десктопе */
export function TransportSubPicker({ items, onPick, onBack }: Props) {
  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1 text-sm text-[var(--brand)] font-medium"
      >
        <ChevronLeft className="w-4 h-4" />
        Все категории
      </button>
      <div>
        <h2 className="font-semibold text-lg">Транспорт</h2>
        <p className="text-sm text-[var(--text-muted)]">Запчасти, аренда, грузовики, техника и др.</p>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-none snap-x snap-mandatory md:hidden">
        {items.map((item) => {
          const gradient = CATEGORY_GRADIENT[item.slug] ?? CATEGORY_GRADIENT.other;
          const shadow = CATEGORY_SHADOW[item.slug] ?? CATEGORY_SHADOW.other;
          return (
            <button
              key={item.slug}
              type="button"
              onClick={() => onPick(item)}
              className="flex flex-col items-center gap-2 min-w-[80px] snap-start active:scale-95 transition-transform"
            >
              <div
                className={cn(
                  "w-[60px] h-[60px] rounded-full bg-gradient-to-br flex items-center justify-center shadow-md",
                  gradient,
                  shadow
                )}
              >
                <CategoryIcon name={item.icon} className="w-6 h-6 text-white" />
              </div>
              <p className="text-[12px] font-medium text-center leading-tight line-clamp-2 max-w-[80px]">
                {item.name}
              </p>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-2">
        {items.map((item) => {
          const gradient = CATEGORY_GRADIENT[item.slug] ?? CATEGORY_GRADIENT.other;
          return (
            <button
              key={item.slug}
              type="button"
              onClick={() => onPick(item)}
              className="flex items-center gap-3 p-4 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] text-left hover:border-[var(--accent)] hover:shadow-md transition-all md:flex-col md:items-center md:gap-3 md:p-5"
            >
              <div
                className={cn(
                  "w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-br flex items-center justify-center shrink-0 shadow-md",
                  gradient
                )}
              >
                <CategoryIcon name={item.icon} className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <div className="md:text-center">
                <p className="font-semibold text-sm">{item.name}</p>
                {item.subtitle && (
                  <p className="text-xs text-[var(--text-muted)] mt-0.5 line-clamp-2">{item.subtitle}</p>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
