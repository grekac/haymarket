"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

type Notification = {
  id: string;
  type: string;
  title: string;
  body: string;
  link: string | null;
  read: boolean;
  createdAt: string;
};

export default function NotificationsPage() {
  const [items, setItems] = useState<Notification[]>([]);

  useEffect(() => {
    fetch("/api/notifications").then((r) => r.json()).then((d) => setItems(d.items ?? []));
  }, []);

  async function markAllRead() {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ readAll: true }),
    });
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6 md:py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">Уведомления</h1>
        <Button variant="ghost" size="sm" onClick={markAllRead}>Прочитать все</Button>
      </div>

      {items.length === 0 ? (
        <p className="text-center text-[var(--text-muted)] py-12">Пока нет уведомлений</p>
      ) : (
        <div className="space-y-2">
          {items.map((n) => (
            <Link
              key={n.id}
              href={n.link ?? "#"}
              className={`block p-4 rounded-xl border transition-all ${n.read ? "border-[var(--border)] opacity-70" : "border-[var(--accent)]/30 bg-[var(--accent)]/5"}`}
            >
              <p className="font-medium text-sm">{n.title}</p>
              <p className="text-sm text-[var(--text-secondary)] mt-1">{n.body}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
