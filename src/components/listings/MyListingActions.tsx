"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";

export function MyListingActions({ listingId }: { listingId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onDelete() {
    if (!confirm("Удалить объявление?")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/listings/${listingId}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Ошибка");
        return;
      }
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-2 shrink-0">
      <Link
        href={`/listing/${listingId}/edit`}
        className="text-xs font-medium text-[var(--accent)] hover:underline"
      >
        Изменить
      </Link>
      <button
        type="button"
        onClick={onDelete}
        disabled={loading}
        className="text-xs font-medium text-red-600 hover:underline disabled:opacity-50"
      >
        Удалить
      </button>
    </div>
  );
}
