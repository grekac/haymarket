"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle } from "lucide-react";

const PRESETS = [
  "Ещё продаётся?",
  "Торг возможен?",
  "Можно посмотреть сегодня?",
  "Обмен интересен?",
  "VIN можно проверить?",
];

export function CarQuickMessages({ listingId }: { listingId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

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
    <div className="p-5 md:p-6 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] premium-card-hover animate-fade-up animate-delay-7">
      <div className="flex items-center gap-2 mb-3">
        <MessageCircle className="w-4 h-4 text-[var(--accent)] animate-float-soft" />
        <h2 className="font-semibold text-base">Быстрые вопросы</h2>
      </div>
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((text, i) => (
          <button
            key={text}
            type="button"
            disabled={!!loading}
            onClick={() => send(text)}
            className="px-3 py-2 rounded-xl text-sm border border-[var(--border)] bg-[var(--bg-secondary)] hover:border-[var(--accent)]/40 hover:bg-[var(--accent)]/8 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 animate-scale-in"
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            {loading === text ? "…" : text}
          </button>
        ))}
      </div>
    </div>
  );
}
