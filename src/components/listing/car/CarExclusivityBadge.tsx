import { BadgeCheck } from "lucide-react";

export function CarExclusivityBadge({ siteName = "HayMarket" }: { siteName?: string }) {
  return (
    <div className="flex items-start gap-3 py-1">
      <BadgeCheck className="w-5 h-5 text-[var(--accent)] shrink-0 mt-0.5" />
      <div>
        <p className="text-sm font-semibold">Только на {siteName}</p>
        <p className="text-xs text-[var(--text-muted)] mt-0.5 leading-relaxed">
          Эксклюзивное объявление — сверяйте продавца только на нашей площадке.
        </p>
      </div>
    </div>
  );
}
