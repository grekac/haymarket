"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { CITIES, CONDITIONS } from "@/lib/utils";

type Category = {
  id: string;
  name: string;
  slug: string;
};

export function CreateListingForm({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(e.currentTarget);
    const data = Object.fromEntries(form.entries());

    try {
      const res = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error);

      router.push(`/listing/${json.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-md">{error}</p>
      )}

      <div>
        <label className="label">Название</label>
        <input name="title" required maxLength={120} className="input" />
      </div>

      <div>
        <label className="label">Описание</label>
        <textarea name="description" required rows={4} maxLength={3000} className="input resize-y" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Цена (֏)</label>
          <input name="price" type="number" required min={0} className="input" placeholder="0" />
        </div>
        <div>
          <label className="label">Состояние</label>
          <select name="condition" className="input" defaultValue="used">
            {CONDITIONS.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Категория</label>
          <select name="categoryId" required className="input">
            <option value="">Выбрать</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Город</label>
          <select name="city" required className="input">
            <option value="">Выбрать</option>
            {CITIES.map((city) => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="label">Фото (ссылка)</label>
        <input name="imageUrl" type="url" className="input" placeholder="https://..." />
      </div>

      <button type="submit" disabled={loading} className="btn-primary">
        {loading ? "Публикация..." : "Опубликовать"}
      </button>
    </form>
  );
}
