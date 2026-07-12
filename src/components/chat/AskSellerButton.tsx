"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export function AskSellerButton({
  listingId,
  className,
  compact,
}: {
  listingId: string;
  className?: string;
  compact?: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function startChat() {
    setLoading(true);
    try {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId }),
      });
      if (res.status === 401) {
        router.push(`/login?next=/listing/${listingId}`);
        return;
      }
      const data = await res.json();
      if (data.error) return;
      router.push(`/messages/${data.id}`);
    } finally {
      setLoading(false);
    }
  }

  if (compact) {
    return (
      <button
        type="button"
        onClick={startChat}
        disabled={loading}
        className={cn(
          "flex-1 h-12 rounded-[16px] bg-[var(--accent)] text-[var(--accent-fg)] font-semibold text-[15px] flex items-center justify-center gap-2 active:scale-[0.98] transition-transform",
          className
        )}
      >
        <MessageCircle className="w-5 h-5" />
        {loading ? "…" : "Написать"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={startChat}
      disabled={loading}
      className={cn(
        "inline-flex items-center gap-2 px-4 py-2.5 rounded-[16px] font-semibold text-[14px] bg-[var(--accent)] text-[var(--accent-fg)] transition-all hover:bg-[var(--accent-hover)] disabled:opacity-60",
        className
      )}
    >
      <MessageCircle className="w-4 h-4" />
      {loading ? "Открываем чат…" : "Написать продавцу"}
    </button>
  );
}
