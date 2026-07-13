"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { CategoryFieldGroup } from "@/lib/category-fields";
import { RotateCcw, Save } from "lucide-react";

type Category = {
  id: string;
  name: string;
  slug: string;
};

export function AdminCategoryFields({ categories }: { categories: Category[] }) {
  const [selectedId, setSelectedId] = useState(categories[0]?.id ?? "");
  const [json, setJson] = useState("");
  const [layoutType, setLayoutType] = useState("premium");
  const [source, setSource] = useState<"db" | "static">("static");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const load = useCallback(async (categoryId: string) => {
    if (!categoryId) return;
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch(`/api/admin/categories/${categoryId}/fields`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setJson(JSON.stringify(data.groups, null, 2));
      setLayoutType(data.layoutType ?? "premium");
      setSource(data.source);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Ошибка загрузки");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedId) load(selectedId);
  }, [selectedId, load]);

  async function save() {
    setLoading(true);
    setMessage("");
    try {
      const groups = JSON.parse(json) as CategoryFieldGroup[];
      const res = await fetch(`/api/admin/categories/${selectedId}/fields`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groups, layoutType }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSource("db");
      setMessage("Сохранено");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Ошибка сохранения");
    } finally {
      setLoading(false);
    }
  }

  async function resetToStatic() {
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch(`/api/admin/categories/${selectedId}/fields`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }
      await load(selectedId);
      setMessage("Сброшено к стандартным полям");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Ошибка");
    } finally {
      setLoading(false);
    }
  }

  const selected = categories.find((c) => c.id === selectedId);

  return (
    <Card className="p-5 space-y-4">
      <div>
        <h2 className="font-bold text-lg">Поля категорий</h2>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          Настройка характеристик объявлений без изменения кода. JSON в формате групп полей.
        </p>
      </div>

      <div className="flex flex-wrap gap-3 items-end">
        <div className="min-w-[200px]">
          <label className="text-xs text-[var(--text-muted)] block mb-1">Категория</label>
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="w-full h-10 px-3 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] text-sm"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.slug})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-[var(--text-muted)] block mb-1">Layout</label>
          <select
            value={layoutType}
            onChange={(e) => setLayoutType(e.target.value)}
            className="h-10 px-3 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] text-sm"
          >
            <option value="premium">premium</option>
            <option value="real-estate">real-estate</option>
            <option value="jobs">jobs</option>
            <option value="car">car</option>
          </select>
        </div>
        <span className="text-xs text-[var(--text-muted)] pb-2">
          Источник: {source === "db" ? "админ" : "стандарт"}
          {selected ? ` · ${selected.slug}` : ""}
        </span>
      </div>

      <textarea
        value={json}
        onChange={(e) => setJson(e.target.value)}
        rows={18}
        spellCheck={false}
        className="w-full font-mono text-xs p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] resize-y min-h-[320px]"
        placeholder='[{"title":"Группа","fields":[{"key":"brand","label":"Бренд","type":"text"}]}]'
      />

      <div className="flex flex-wrap gap-2 items-center">
        <Button type="button" onClick={save} disabled={loading || !selectedId}>
          <Save className="w-4 h-4" /> Сохранить
        </Button>
        <Button type="button" variant="secondary" onClick={resetToStatic} disabled={loading || !selectedId}>
          <RotateCcw className="w-4 h-4" /> Сбросить к стандарту
        </Button>
        {message && <span className="text-sm text-[var(--text-secondary)]">{message}</span>}
      </div>
    </Card>
  );
}
