"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const PRESETS_BY_CATEGORY: Record<string, string[]> = {
  "real-estate": [
    "Ещё актуально?",
    "Можно посмотреть?",
    "Торг возможен?",
    "Документы в порядке?",
    "Коммунальные включены?",
  ],
  jobs: [
    "Вакансия открыта?",
    "Можно откликнуться?",
    "Интервью когда?",
    "Удалённая работа?",
    "Соцпакет есть?",
  ],
  services: [
    "Свободны сегодня?",
    "Сколько стоит выезд?",
    "Гарантия на работу?",
    "Материалы включены?",
    "Можно примеры работ?",
  ],
  default: [
    "Ещё продаётся?",
    "Торг возможен?",
    "Можно посмотреть сегодня?",
    "Доставка есть?",
    "Обмен интересен?",
  ],
};

export function CategoryQuickMessages({
  listingId,
  categorySlug,
  presets,
}: {
  listingId: string;
  categorySlug?: string;
  presets?: string[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const messages =
    presets ?? PRESETS_BY_CATEGORY[categorySlug ?? ""] ?? PRESETS_BY_CATEGORY.default;

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

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-[var(--text-secondary)]">Быстрые вопросы</p>
      <div className="flex flex-wrap gap-2">
        {messages.map((text) => (
          <button
            key={text}
            type="button"
            disabled={!!loading}
            onClick={() => send(text)}
            className="px-3 py-2 rounded-full text-sm border border-[var(--border)] bg-[var(--bg-secondary)] hover:border-[var(--accent)]/40 hover:bg-[var(--accent)]/8 transition-colors disabled:opacity-50"
          >
            {loading === text ? "…" : text}
          </button>
        ))}
      </div>
    </div>
  );
}
