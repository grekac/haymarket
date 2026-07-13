"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

type Report = {
  id: string;
  reason: string;
  createdAt: string;
  listing: { id: string; title: string; status: string };
  user: { name: string; phone: string };
};

export function AdminReports() {
  const [items, setItems] = useState<Report[]>([]);

  useEffect(() => {
    fetch("/api/admin/reports").then((r) => r.json()).then(setItems).catch(() => {});
  }, []);

  async function resolve(id: string) {
    await fetch(`/api/admin/reports/${id}`, { method: "PATCH" });
    setItems((prev) => prev.filter((r) => r.id !== id));
  }

  return (
    <section className="mt-10">
      <h2 className="text-xl font-bold mb-4">Жалобы ({items.length})</h2>
      {items.length === 0 ? (
        <p className="text-sm text-[var(--text-muted)]">Нет открытых жалоб</p>
      ) : (
        <div className="space-y-2">
          {items.map((r) => (
            <div key={r.id} className="p-4 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] text-sm">
              <Link href={`/listing/${r.listing.id}`} className="font-medium hover:underline">
                {r.listing.title}
              </Link>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                {r.user.name} · {r.reason} · {new Date(r.createdAt).toLocaleString("ru-RU")}
              </p>
              <div className="flex gap-2 mt-3">
                <Button size="sm" onClick={() => resolve(r.id)}>Закрыть</Button>
                <Link href={`/listing/${r.listing.id}`}>
                  <Button size="sm" variant="secondary">Открыть</Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
