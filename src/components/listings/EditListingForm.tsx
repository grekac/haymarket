"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

type Props = {
  listingId: string;
  title: string;
  description: string;
  price: number;
  city: string;
  district?: string | null;
};

export function EditListingForm({ listingId, title, description, price, city, district }: Props) {
  const router = useRouter();
  const [form, setForm] = useState({
    title,
    description,
    price: String(price),
    city,
    district: district ?? "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/listings/${listingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          price: Number(form.price),
          city: form.city,
          district: form.district || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Ошибка");
      router.push(`/listing/${listingId}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка");
    } finally {
      setLoading(false);
    }
  }

  const fieldClass = "w-full rounded-xl border border-[var(--border)] px-4 py-3 bg-[var(--bg-card)]";

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div>
        <label className="block text-sm font-medium mb-1">Заголовок</label>
        <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={fieldClass} required />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Описание</label>
        <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={5} className={fieldClass} required />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Цена (AMD)</label>
        <input value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className={fieldClass} required />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Город</label>
        <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className={fieldClass} required />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Район</label>
        <input value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} className={fieldClass} />
      </div>
      <div className="flex gap-3">
        <Button type="submit" disabled={loading}>{loading ? "Сохранение…" : "Сохранить"}</Button>
        <Link href={`/listing/${listingId}`} className="text-sm text-[var(--text-muted)] self-center">Отмена</Link>
      </div>
    </form>
  );
}
