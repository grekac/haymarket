"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";

export function ReviewSection({ targetId, listingId }: { targetId: string; listingId: string }) {
  const [reviews, setReviews] = useState<Array<{ id: string; rating: number; comment: string | null; author: { name: string } }>>([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [sent, setSent] = useState(false);

  useEffect(() => {
    fetch(`/api/reviews?userId=${targetId}`).then((r) => r.json()).then(setReviews);
  }, [targetId]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetId, listingId, rating, comment }),
    });
    if (res.ok) {
      setSent(true);
      const list = await fetch(`/api/reviews?userId=${targetId}`).then((r) => r.json());
      setReviews(list);
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="font-bold">Отзывы о продавце</h3>
      {reviews.length === 0 ? (
        <p className="text-sm text-[var(--text-muted)]">Пока нет отзывов</p>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <div key={r.id} className="p-3 rounded-xl bg-[var(--bg-hover)] text-sm">
              <p className="font-medium">{r.author.name} · {"★".repeat(r.rating)}</p>
              {r.comment && <p className="text-[var(--text-secondary)] mt-1">{r.comment}</p>}
            </div>
          ))}
        </div>
      )}

      {!sent && (
        <form onSubmit={submit} className="space-y-3 pt-2 border-t border-[var(--border)]">
          <p className="text-sm font-medium">Оставить отзыв</p>
          <select
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
            className="px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--bg-input)] text-sm"
          >
            {[5, 4, 3, 2, 1].map((n) => (
              <option key={n} value={n}>{n} звёзд</option>
            ))}
          </select>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Комментарий (необязательно)"
            rows={2}
            className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--bg-input)] text-sm"
          />
          <Button type="submit" size="sm">Отправить отзыв</Button>
        </form>
      )}
    </div>
  );
}
