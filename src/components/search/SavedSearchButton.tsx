"use client";

import { useState } from "react";
import { Bookmark } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";

export function SavedSearchButton({ filters }: { filters: Record<string, string | undefined> }) {
  const [saved, setSaved] = useState(false);
  const router = useRouter();

  async function save() {
    const name = filters.q || filters.category || "Мой поиск";
    const res = await fetch("/api/saved-searches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, filters, notifyEnabled: true }),
    });
    if (res.status === 401) {
      router.push("/login");
      return;
    }
    if (res.ok) setSaved(true);
  }

  return (
    <Button variant="secondary" size="sm" onClick={save} disabled={saved}>
      <Bookmark className="w-4 h-4" />
      {saved ? "Сохранено" : "Сохранить поиск"}
    </Button>
  );
}
