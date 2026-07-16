"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { Search, Loader2, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export function VehicleHistorySearchForm({
  defaultQuery = "",
  listingId,
  className,
}: {
  defaultQuery?: string;
  listingId?: string;
  className?: string;
}) {
  const router = useRouter();
  const [query, setQuery] = useState(defaultQuery);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/vehicle-history/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, listingId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Ошибка");
      router.push(`/vehicle-history/report/${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className={cn("space-y-3", className)}>
      <div className="flex items-center gap-2 h-12 px-4 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)]">
        <Search className="w-5 h-5 text-[var(--text-muted)] shrink-0" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="VIN, госномер или номер кузова"
          className="flex-1 bg-transparent outline-none text-[15px] placeholder:text-[var(--text-muted)]"
        />
      </div>
      <button
        type="submit"
        disabled={loading || query.trim().length < 5}
        className="w-full h-12 rounded-2xl bg-[var(--accent)] text-[var(--accent-fg)] font-semibold text-[15px] disabled:opacity-50 inline-flex items-center justify-center gap-2"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
        Проверить историю
      </button>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </form>
  );
}
