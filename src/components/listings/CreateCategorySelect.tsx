"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { X, ChevronLeft } from "lucide-react";
import { CategoryIcon, CATEGORY_GRADIENT } from "@/components/listings/CategoryIcon";
import { AvitoRadioRow } from "@/components/listings/avito-create/AvitoStepUi";
import { cn } from "@/lib/utils";

export type CreateCat = {
  id: string;
  slug: string;
  name: string;
  icon: string;
  imageUrl?: string | null;
};

type TransportItem = {
  id: string;
  slug: string;
  name: string;
  icon: string;
  subtitle?: string;
};

const GOODS_SLUGS = new Set([
  "electronics",
  "home-furniture",
  "clothing",
  "kids",
  "animals",
  "other",
]);

/** Avito-ordered transport rows */
const TRANSPORT_ORDER = [
  { slug: "cars", label: "Автомобили" },
  { slug: "motorcycles", label: "Мотоциклы и мототехника" },
  { slug: "trucks", label: "Грузовики и спецтехника" },
  { slug: "water-transport", label: "Водный транспорт" },
  { slug: "car-parts", label: "Запчасти и аксессуары" },
] as const;

type Level = "root" | "transport" | "goods";

export function CreateCategorySelect({
  categories,
  transportSubcategories,
  closeHref = "/my",
}: {
  categories: CreateCat[];
  transportSubcategories: TransportItem[];
  closeHref?: string;
}) {
  const router = useRouter();
  const [level, setLevel] = useState<Level>("root");

  const bySlug = useMemo(() => {
    const m = new Map<string, CreateCat>();
    for (const c of categories) m.set(c.slug, c);
    return m;
  }, [categories]);

  const transportBySlug = useMemo(() => {
    const m = new Map<string, TransportItem>();
    for (const t of transportSubcategories) m.set(t.slug, t);
    return m;
  }, [transportSubcategories]);

  const rootRows = useMemo(() => {
    const rows: Array<
      | { type: "cat"; cat: CreateCat; title: string }
      | { type: "transport"; cat: CreateCat; title: string }
      | { type: "goods"; title: string; icon: string; imageUrl: string | null }
    > = [];

    const cars = bySlug.get("cars");
    if (cars) rows.push({ type: "transport", cat: cars, title: "Транспорт" });

    const re = bySlug.get("real-estate");
    if (re) rows.push({ type: "cat", cat: re, title: "Недвижимость" });

    const jobs = bySlug.get("jobs");
    if (jobs) rows.push({ type: "cat", cat: jobs, title: "Работа" });

    const services = bySlug.get("services");
    if (services) rows.push({ type: "cat", cat: services, title: "Услуги" });

    const goodsCats = categories.filter((c) => GOODS_SLUGS.has(c.slug));
    if (goodsCats.length) {
      const cover = goodsCats.find((c) => c.slug === "electronics") ?? goodsCats[0];
      rows.push({
        type: "goods",
        title: "Вещи, электроника, хобби, животные",
        icon: cover.icon || "Smartphone",
        imageUrl: cover.imageUrl ?? null,
      });
    }

    return rows;
  }, [bySlug, categories]);

  const transportRows = TRANSPORT_ORDER.map((row) => {
    const item = transportBySlug.get(row.slug) ?? (row.slug === "cars" ? transportSubcategories[0] : undefined);
    if (!item && row.slug !== "cars") return null;
    const fallback = bySlug.get("cars");
    const resolved =
      item ??
      (fallback
        ? { id: fallback.id, slug: "cars", name: row.label, icon: fallback.icon }
        : null);
    if (!resolved) return null;
    return { ...resolved, label: row.label };
  }).filter(Boolean) as Array<TransportItem & { label: string }>;

  const goodsRows = categories.filter((c) => GOODS_SLUGS.has(c.slug));

  function goCreate(slug: string) {
    router.push(`/create/full?category=${encodeURIComponent(slug)}`);
  }

  function onRootClick(row: (typeof rootRows)[number]) {
    if (row.type === "transport") {
      setLevel("transport");
      return;
    }
    if (row.type === "goods") {
      setLevel("goods");
      return;
    }
    goCreate(row.cat.slug);
  }

  const title =
    level === "root" ? "Выберите категорию" : level === "transport" ? "Транспорт" : "Вещи и другое";

  return (
    <div className="min-h-[100dvh] bg-[var(--bg-primary)]">
      <div className="max-w-lg mx-auto px-4 pt-3 pb-10">
        <div className="flex items-center gap-2 mb-4">
          {level === "root" ? (
            <button
              type="button"
              onClick={() => router.push(closeHref)}
              className="p-2 -ml-2 rounded-full hover:bg-[var(--bg-hover)]"
              aria-label="Закрыть"
            >
              <X className="w-6 h-6" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setLevel("root")}
              className="p-2 -ml-2 rounded-full hover:bg-[var(--bg-hover)]"
              aria-label="Назад"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}
        </div>

        <h1 className="text-[28px] font-bold tracking-tight leading-tight mb-5">{title}</h1>

        {level === "root" && (
          <ul className="space-y-0.5">
            {rootRows.map((row, i) => {
              const key = row.type === "goods" ? `goods-${i}` : row.cat.slug;
              const titleText = row.title;
              const icon = row.type === "goods" ? row.icon : row.cat.icon;
              const imageUrl = row.type === "goods" ? row.imageUrl : row.cat.imageUrl;
              const slug = row.type === "goods" ? "goods" : row.cat.slug;

              return (
                <li key={key}>
                  <button
                    type="button"
                    onClick={() => onRootClick(row)}
                    className="w-full flex items-center gap-4 py-3.5 px-1 rounded-2xl hover:bg-[var(--bg-hover)] text-left"
                  >
                    <CatThumb slug={slug} icon={icon} imageUrl={imageUrl} />
                    <span className="text-[17px] font-medium leading-snug">{titleText}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        {level === "transport" && (
          <div className="divide-y divide-[var(--border)]/40">
            {transportRows.map((item) => (
              <AvitoRadioRow
                key={item.slug}
                label={item.label}
                onClick={() => goCreate(item.slug)}
              />
            ))}
          </div>
        )}

        {level === "goods" && (
          <div className="divide-y divide-[var(--border)]/40">
            {goodsRows.map((item) => (
              <AvitoRadioRow key={item.slug} label={item.name} onClick={() => goCreate(item.slug)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CatThumb({
  slug,
  icon,
  imageUrl,
}: {
  slug: string;
  icon: string;
  imageUrl?: string | null;
}) {
  const gradient = CATEGORY_GRADIENT[slug] ?? CATEGORY_GRADIENT.other;
  return (
    <span className={cn("relative w-14 h-14 rounded-2xl overflow-hidden shrink-0 bg-gradient-to-br", gradient)}>
      {imageUrl ? (
        <Image src={imageUrl} alt="" fill unoptimized className="object-cover" sizes="56px" />
      ) : (
        <span className="absolute inset-0 flex items-center justify-center">
          <CategoryIcon name={icon} className="w-7 h-7 text-white" />
        </span>
      )}
    </span>
  );
}
