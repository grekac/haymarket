"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { CITIES, PROPERTY_TYPES } from "@/lib/utils";
import { CarSelector, type CarSelection } from "@/components/cars/CarSelector";
import { CarTrimFilter } from "@/components/cars/CarTrimFilter";
import { CarBodyFilter } from "@/components/cars/CarBodyFilter";
import { Input } from "@/components/ui/Input";
import { useState } from "react";

type Cat = { slug: string; name: string };

export function SearchFilters({ categories }: { categories: Cat[] }) {
  const router = useRouter();
  const params = useSearchParams();
  const [carSelection, setCarSelection] = useState<CarSelection | null>(null);

  function set(key: string, value: string) {
    const sp = new URLSearchParams(params.toString());
    if (value) sp.set(key, value);
    else sp.delete(key);
    sp.delete("page");
    router.push(`/search?${sp.toString()}`);
  }

  function applyCarFilter(selection: CarSelection | null) {
    setCarSelection(selection);
    const sp = new URLSearchParams(params.toString());
    sp.delete("page");
    sp.delete("trim");
    sp.delete("body");
    if (selection?.brand) {
      sp.set("brand", selection.brand);
      if (selection.model) sp.set("model", selection.model);
      else sp.delete("model");
      if (selection.generation) sp.set("generation", selection.generation);
      else sp.delete("generation");
    } else {
      sp.delete("brand");
      sp.delete("model");
      sp.delete("generation");
    }
    const next = `/search?${sp.toString()}`;
    const current = `/search?${params.toString()}`;
    if (next !== current) router.push(next);
  }

  const sel =
    "w-full px-3 py-2.5 rounded-xl text-sm bg-[var(--bg-input)] border border-[var(--border)]";
  const isCars = params.get("category") === "cars" || params.get("category") === "new-cars";
  const isRealEstate = params.get("category") === "real-estate";

  return (
    <div className="space-y-4 text-sm sticky top-20">
      <div>
        <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2 block">
          Категория
        </label>
        <select
          value={params.get("category") ?? ""}
          onChange={(e) => set("category", e.target.value)}
          className={sel}
        >
          <option value="">Все</option>
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2 block">
          Город
        </label>
        <select
          value={params.get("city") ?? ""}
          onChange={(e) => set("city", e.target.value)}
          className={sel}
        >
          <option value="">Вся Армения</option>
          {CITIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Price — horizontal */}
      <div>
        <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2 block">
          Цена
        </label>
        <div className="flex gap-2 items-center">
          <Input
            type="number"
            placeholder="От"
            defaultValue={params.get("minPrice") ?? ""}
            onBlur={(e) => set("minPrice", e.target.value)}
            className="rounded-xl"
          />
          <span className="text-[var(--text-muted)] shrink-0">—</span>
          <Input
            type="number"
            placeholder="До"
            defaultValue={params.get("maxPrice") ?? ""}
            onBlur={(e) => set("maxPrice", e.target.value)}
            className="rounded-xl"
          />
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2 block">
          Сортировка
        </label>
        <select
          value={params.get("sort") ?? "newest"}
          onChange={(e) => set("sort", e.target.value)}
          className={sel}
        >
          <option value="newest">Новые</option>
          <option value="price_asc">Дешевле</option>
          <option value="price_desc">Дороже</option>
          <option value="popular">Популярные</option>
        </select>
      </div>

      {isCars && (
        <div className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-3.5">
          <div>
            <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2 block">
              Авто · марка / модель / поколение
            </label>
            <CarSelector
              mode="filter"
              compact
              value={carSelection ?? undefined}
              onChange={applyCarFilter}
            />
            {(params.get("brand") || params.get("model")) && !carSelection && (
              <p className="text-xs text-[var(--text-muted)] mt-2">
                Фильтр: {[params.get("brand"), params.get("model"), params.get("generation")]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            )}
          </div>

          {/* Year + mileage style chips row */}
          <div>
            <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2 block">
              Год выпуска
            </label>
            <div className="flex gap-2 items-center">
              <Input
                type="number"
                placeholder="От"
                defaultValue={params.get("yearFrom") ?? ""}
                onBlur={(e) => set("yearFrom", e.target.value)}
                className="rounded-xl"
              />
              <span className="text-[var(--text-muted)] shrink-0">—</span>
              <Input
                type="number"
                placeholder="До"
                defaultValue={params.get("yearTo") ?? ""}
                onBlur={(e) => set("yearTo", e.target.value)}
                className="rounded-xl"
              />
            </div>
          </div>

          <CarBodyFilter
            modelId={carSelection?.modelId || undefined}
            generation={carSelection?.generation || params.get("generation")}
            value={params.get("body") ?? ""}
            onChange={(body) => set("body", body)}
          />
          <CarTrimFilter
            modelId={carSelection?.modelId || undefined}
            value={params.get("trim") ?? ""}
            onChange={(trim) => set("trim", trim)}
          />
        </div>
      )}

      {isRealEstate && (
        <>
          <div>
            <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2 block">
              Сделка
            </label>
            <select
              value={params.get("dealType") ?? ""}
              onChange={(e) => set("dealType", e.target.value)}
              className={sel}
            >
              <option value="">Все</option>
              <option value="SALE">Продажа</option>
              <option value="RENT">Аренда</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2 block">
              Тип
            </label>
            <select
              value={params.get("propertyType") ?? ""}
              onChange={(e) => set("propertyType", e.target.value)}
              className={sel}
            >
              <option value="">Все</option>
              {PROPERTY_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-[var(--text-muted)] mb-1 block">Комнат</label>
            <select
              value={params.get("rooms") ?? ""}
              onChange={(e) => set("rooms", e.target.value)}
              className={sel}
            >
              <option value="">Любое</option>
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <option key={n} value={String(n)}>
                  {n}+
                </option>
              ))}
            </select>
          </div>
        </>
      )}
    </div>
  );
}
