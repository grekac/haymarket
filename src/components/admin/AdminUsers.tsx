"use client";

import { useEffect, useState } from "react";
import { BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";

type User = {
  id: string; name: string; phone: string; role: string;
  isBlocked: boolean; isVerified: boolean;
  ratingAvg: number; ratingCount: number;
  _count: { listings: number };
};

export function AdminUsers() {
  const [items, setItems] = useState<User[]>([]);

  useEffect(() => {
    fetch("/api/admin/users").then((r) => r.json()).then((d) => setItems(d.items ?? []));
  }, []);

  async function toggleBlock(id: string) {
    const res = await fetch(`/api/admin/users/${id}`, { method: "PATCH", body: JSON.stringify({}) });
    const user = await res.json();
    setItems((prev) => prev.map((u) => u.id === id ? { ...u, isBlocked: user.isBlocked } : u));
  }

  async function toggleVerify(id: string) {
    const res = await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "verify" }),
    });
    const user = await res.json();
    setItems((prev) => prev.map((u) => u.id === id ? { ...u, isVerified: user.isVerified } : u));
  }

  return (
    <div>
      <h2 className="font-bold mb-4">Пользователи</h2>
      <div className="space-y-2">
        {items.map((u) => (
          <div key={u.id} className="flex items-center gap-3 p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] text-sm">
            <div className="flex-1">
              <p className="font-medium flex items-center gap-2">
                {u.name}
                {u.role === "ADMIN" && <span className="text-xs bg-[var(--bg-hover)] px-2 py-0.5 rounded">ADMIN</span>}
                {u.isVerified && <BadgeCheck className="w-4 h-4 text-emerald-500" />}
              </p>
              <p className="text-xs text-[var(--text-muted)]">
                {u.phone} · {u._count.listings} объявл.
                {u.ratingCount > 0 && ` · ★ ${u.ratingAvg.toFixed(1)}`}
              </p>
            </div>
            <Button size="sm" variant={u.isVerified ? "primary" : "secondary"} onClick={() => toggleVerify(u.id)}>
              {u.isVerified ? "Снять" : "Вериф."}
            </Button>
            <Button size="sm" variant={u.isBlocked ? "primary" : "danger"} onClick={() => toggleBlock(u.id)}>
              {u.isBlocked ? "Разблок." : "Блок"}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
