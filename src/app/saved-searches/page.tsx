"use client";

import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

type SavedSearch = {
  id: string;
  name: string;
  filters: string;
  notifyEnabled: boolean;
  createdAt: string;
};

export default function SavedSearchesPage() {
  const [items, setItems] = useState<SavedSearch[]>([]);

  useEffect(() => {
    fetch("/api/saved-searches").then((r) => r.json()).then(setItems);
  }, []);

  async function remove(id: string) {
    await fetch(`/api/saved-searches?id=${id}`, { method: "DELETE" });
    setItems((prev) => prev.filter((s) => s.id !== id));
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6 md:py-10">
      <h1 className="text-xl font-semibold mb-6">Сохранённые поиски</h1>

      {items.length === 0 ? (
        <p className="text-center text-[var(--text-muted)] py-12">
          Сохраняйте поиски на странице результатов — мы пришлём уведомление о новых объявлениях
        </p>
      ) : (
        <div className="space-y-3">
          {items.map((s) => {
            let filters: Record<string, string> = {};
            try { filters = JSON.parse(s.filters); } catch {}
            const qs = new URLSearchParams(filters as Record<string, string>).toString();
            return (
              <div key={s.id} className="flex items-center gap-3 p-4 rounded-xl border border-[var(--border)]">
                <div className="flex-1 min-w-0">
                  <p className="font-medium">{s.name}</p>
                  <a href={`/search?${qs}`} className="text-xs text-[var(--accent)] hover:underline">Открыть поиск</a>
                </div>
                <Button variant="ghost" size="sm" onClick={() => remove(s.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
