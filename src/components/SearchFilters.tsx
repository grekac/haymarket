"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { CITIES } from "@/lib/utils";

type Category = { slug: string; name: string };

export function SearchFilters({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const params = useSearchParams();

  function updateParam(key: string, value: string) {
    const newParams = new URLSearchParams(params.toString());
    if (value) newParams.set(key, value);
    else newParams.delete(key);
    router.push(`/search?${newParams.toString()}`);
  }

  return (
    <div className="space-y-4 text-sm">
      <div>
        <label className="label">Категория</label>
        <select
          value={params.get("category") ?? ""}
          onChange={(e) => updateParam("category", e.target.value)}
          className="input"
        >
          <option value="">Все</option>
          {categories.map((cat) => (
            <option key={cat.slug} value={cat.slug}>{cat.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="label">Город</label>
        <select
          value={params.get("city") ?? ""}
          onChange={(e) => updateParam("city", e.target.value)}
          className="input"
        >
          <option value="">Вся Армения</option>
          {CITIES.map((city) => (
            <option key={city} value={city}>{city}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="label">От</label>
          <input
            type="number"
            placeholder="0"
            defaultValue={params.get("minPrice") ?? ""}
            onBlur={(e) => updateParam("minPrice", e.target.value)}
            className="input"
          />
        </div>
        <div>
          <label className="label">До</label>
          <input
            type="number"
            placeholder="∞"
            defaultValue={params.get("maxPrice") ?? ""}
            onBlur={(e) => updateParam("maxPrice", e.target.value)}
            className="input"
          />
        </div>
      </div>

      <div>
        <label className="label">Сортировка</label>
        <select
          value={params.get("sort") ?? "newest"}
          onChange={(e) => updateParam("sort", e.target.value)}
          className="input"
        >
          <option value="newest">Новые</option>
          <option value="price_asc">Дешевле</option>
          <option value="price_desc">Дороже</option>
        </select>
      </div>
    </div>
  );
}
