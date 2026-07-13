import { BadgeCheck } from "lucide-react";

export function CarExclusivityBadge({ siteName = "HayMarket" }: { siteName?: string }) {
  return (
    <div className="flex items-start gap-3 p-4 rounded-2xl border border-[var(--accent)]/25 bg-[var(--accent)]/5">
      <div className="w-9 h-9 rounded-xl bg-[var(--accent)]/15 flex items-center justify-center shrink-0">
        <BadgeCheck className="w-5 h-5 text-[var(--accent)]" />
      </div>
      <div>
        <p className="text-sm font-semibold">Только на {siteName}</p>
        <p className="text-xs text-[var(--text-muted)] mt-0.5 leading-relaxed">
          Объявление опубликовано эксклюзивно на нашей площадке — проверяйте продавца только здесь.
        </p>
      </div>
    </div>
  );
}
