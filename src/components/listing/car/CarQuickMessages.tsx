"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const PRESETS = [
  "Ещё продаётся?",
  "Торг возможен?",
  "Можно посмотреть сегодня?",
  "Обмен интересен?",
  "VIN можно проверить?",
];

export function CarQuickMessages({
  listingId,
  presets,
  bare,
}: {
  listingId: string;
  presets?: string[];
  bare?: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const questions = presets?.length ? presets : PRESETS;

  async function send(text: string) {
    setLoading(text);
    try {
      const convRes = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId }),
      });
      if (convRes.status === 401) {
        router.push(`/login?next=/listing/${listingId}`);
        return;
      }
      const conv = await convRes.json();
      if (!conv.id) return;

      await fetch(`/api/conversations/${conv.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text }),
      });
      router.push(`/messages/${conv.id}`);
    } finally {
      setLoading(null);
    }
  }

  const chips = (
    <div className="flex flex-wrap gap-2">
      {questions.map((text) => (
        <button
          key={text}
          type="button"
          disabled={!!loading}
          onClick={() => send(text)}
          className="px-3 py-2 rounded-full text-sm border border-[var(--border)] bg-[var(--bg-secondary)] hover:border-[var(--accent)]/40 hover:bg-[var(--accent)]/8 active:scale-[0.98] transition-all disabled:opacity-50"
        >
          {loading === text ? "…" : text}
        </button>
      ))}
    </div>
  );

  if (bare) return chips;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-[var(--text-secondary)]">Быстрые вопросы</h3>
      {chips}
    </div>
  );
}
