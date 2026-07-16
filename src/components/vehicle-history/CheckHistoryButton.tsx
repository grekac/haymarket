"use client";

import { Link } from "@/i18n/navigation";
import { ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export function CheckHistoryButton({
  vin,
  plate,
  listingId,
  className,
}: {
  vin?: string | null;
  plate?: string | null;
  listingId: string;
  className?: string;
}) {
  const q = (vin || plate || "").trim();
  const href = q
    ? `/vehicle-history?q=${encodeURIComponent(q)}&listingId=${encodeURIComponent(listingId)}`
    : `/vehicle-history?listingId=${encodeURIComponent(listingId)}`;

  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center justify-center gap-2 h-11 px-4 rounded-xl",
        "border border-[var(--border)] bg-[var(--bg-secondary)] text-[14px] font-semibold",
        "text-[var(--text-primary)] hover:bg-[var(--bg-hover)] active:scale-[0.98] transition-all",
        className
      )}
    >
      <ShieldCheck className="w-4 h-4 text-[var(--accent)]" />
      Проверить историю
    </Link>
  );
}
