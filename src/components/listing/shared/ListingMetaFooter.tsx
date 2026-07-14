"use client";

import { useState } from "react";
import { Copy, Check, Eye, Link2 } from "lucide-react";
import { formatNumber, formatPublishedAt } from "@/lib/utils";

export function ListingMetaFooter({
  listingId,
  createdAt,
  viewsTotal,
}: {
  listingId: string;
  createdAt: Date | string;
  viewsTotal: number;
}) {
  const [copied, setCopied] = useState<"id" | "link" | null>(null);
  const shortId = listingId.slice(-8).toUpperCase();

  async function copy(kind: "id" | "link") {
    const value = kind === "id" ? listingId : window.location.href;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(kind);
      setTimeout(() => setCopied(null), 1800);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)]/60 px-4 py-3.5 space-y-2.5 text-[13px] text-[var(--text-secondary)]">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
        <span>
          № объявления{" "}
          <button
            type="button"
            onClick={() => copy("id")}
            className="font-semibold text-[var(--text-primary)] tabular-nums inline-flex items-center gap-1 hover:text-[var(--accent)]"
            title="Скопировать номер"
          >
            {shortId}
            {copied === "id" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 opacity-50" />}
          </button>
        </span>
        <span className="text-[var(--border)]">·</span>
        <button
          type="button"
          onClick={() => copy("link")}
          className="inline-flex items-center gap-1 font-medium hover:text-[var(--accent)]"
        >
          {copied === "link" ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-500" /> Ссылка скопирована
            </>
          ) : (
            <>
              <Link2 className="w-3.5 h-3.5" /> Скопировать ссылку
            </>
          )}
        </button>
      </div>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <span>Опубликовано {formatPublishedAt(createdAt)}</span>
        <span className="text-[var(--border)]">·</span>
        <span className="inline-flex items-center gap-1">
          <Eye className="w-3.5 h-3.5" />
          {formatNumber(viewsTotal)} просмотров
        </span>
      </div>
    </div>
  );
}
