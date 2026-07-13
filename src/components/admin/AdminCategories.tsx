"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

type Category = {
  id: string;
  name: string;
  slug: string;
  icon: string;
  sortOrder: number;
  isActive: boolean;
  showOnHome: boolean;
  parent?: { name: string } | null;
  _count: { listings: number; children: number };
};

export function AdminCategories() {
  const [items, setItems] = useState<Category[]>([]);
  const [form, setForm] = useState({ name: "", slug: "", icon: "LayoutGrid", sortOrder: "10" });
  const [loading, setLoading] = useState(false);

  async function load() {
    const res = await fetch("/api/admin/categories");
    if (res.ok) setItems(await res.json());
  }

  useEffect(() => {
    load();
  }, []);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          slug: form.slug,
          icon: form.icon,
          sortOrder: Number(form.sortOrder) || 0,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Ошибка");
        return;
      }
      setForm({ name: "", slug: "", icon: "LayoutGrid", sortOrder: "10" });
      await load();
    } finally {
      setLoading(false);
    }
  }

  async function toggleActive(id: string, isActive: boolean) {
    await fetch(`/api/admin/categories/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !isActive }),
    });
    await load();
  }

  return (
    <section className="mt-10">
      <h2 className="text-xl font-bold mb-4">Категории</h2>

      <Card className="p-5 mb-6">
        <form onSubmit={onCreate} className="grid md:grid-cols-4 gap-3">
          <input
            placeholder="Название"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value, slug: form.slug || e.target.value.toLowerCase().replace(/\s+/g, "-") })}
            className="rounded-xl border border-[var(--border)] px-3 py-2 bg-[var(--bg-card)]"
            required
          />
          <input
            placeholder="slug"
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
            className="rounded-xl border border-[var(--border)] px-3 py-2 bg-[var(--bg-card)]"
            required
          />
          <input
            placeholder="icon (Lucide)"
            value={form.icon}
            onChange={(e) => setForm({ ...form, icon: e.target.value })}
            className="rounded-xl border border-[var(--border)] px-3 py-2 bg-[var(--bg-card)]"
            required
          />
          <Button type="submit" disabled={loading}>Добавить</Button>
        </form>
      </Card>

      <div className="space-y-2">
        {items.map((c) => (
          <div key={c.id} className="flex items-center justify-between p-4 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)]">
            <div>
              <p className="font-medium">{c.name} <span className="text-[var(--text-muted)] text-sm">/{c.slug}</span></p>
              <p className="text-xs text-[var(--text-muted)]">
                {c._count.listings} объявл. · {c._count.children} подкат. · порядок {c.sortOrder}
                {c.parent ? ` · родитель: ${c.parent.name}` : ""}
              </p>
            </div>
            <button
              type="button"
              onClick={() => toggleActive(c.id, c.isActive)}
              className={`text-xs font-medium px-3 py-1.5 rounded-full ${c.isActive ? "bg-emerald-500/15 text-emerald-700" : "bg-red-500/15 text-red-700"}`}
            >
              {c.isActive ? "Активна" : "Скрыта"}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
