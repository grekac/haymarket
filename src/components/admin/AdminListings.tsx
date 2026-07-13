"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";

type Listing = {
  id: string; title: string; status: string; price: number;
  user: { name: string }; category: { name: string };
};

export function AdminListings() {
  const [items, setItems] = useState<Listing[]>([]);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    fetch("/api/admin/listings")
      .then((r) => r.json())
      .then((d) => {
        setItems(d.items ?? []);
        setPendingCount(d.pendingCount ?? 0);
      });
  }, []);

  async function setStatus(id: string, status: string) {
    await fetch(`/api/admin/listings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setItems((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
    if (status === "ACTIVE") setPendingCount((c) => Math.max(0, c - 1));
  }

  async function remove(id: string) {
    if (!confirm("Удалить?")) return;
    await fetch(`/api/admin/listings/${id}`, { method: "DELETE" });
    setItems((prev) => prev.filter((l) => l.id !== id));
  }

  return (
    <div>
      <h2 className="font-bold mb-1">Объявления</h2>
      {pendingCount > 0 && (
        <p className="text-sm text-amber-600 mb-4">На модерации: {pendingCount}</p>
      )}
      <div className="space-y-2">
        {items.map((l) => (
          <div
            key={l.id}
            className={`flex items-center gap-3 p-4 rounded-xl border text-sm ${
              l.status === "PENDING"
                ? "border-amber-500/40 bg-amber-500/5"
                : "border-[var(--border)] bg-[var(--bg-card)]"
            }`}
          >
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{l.title}</p>
              <p className="text-xs text-[var(--text-muted)]">{l.category.name} · {l.user.name} · {l.status}</p>
            </div>
            {l.status === "PENDING" && <Button size="sm" onClick={() => setStatus(l.id, "ACTIVE")}>Одобрить</Button>}
            {l.status === "PENDING" && <Button size="sm" variant="danger" onClick={() => setStatus(l.id, "REJECTED")}>Отклонить</Button>}
            {l.status === "ACTIVE" && <Button size="sm" variant="secondary" onClick={() => setStatus(l.id, "ARCHIVED")}>Скрыть</Button>}
            <Button size="sm" variant="danger" onClick={() => remove(l.id)}>Удалить</Button>
          </div>
        ))}
      </div>
    </div>
  );
}
