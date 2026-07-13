import { BadgeCheck } from "lucide-react";

export function CarExclusivityBadge({ siteName = "HayMarket" }: { siteName?: string }) {
  return (
    <div className="relative overflow-hidden flex items-start gap-3 p-4 rounded-2xl border border-[var(--accent)]/20 bg-gradient-to-r from-[var(--accent)]/8 via-[var(--bg-card)] to-[var(--accent)]/5 animate-fade-up animate-delay-2">
      <div className="absolute inset-0 listing-shimmer pointer-events-none opacity-50" />
      <div className="relative w-10 h-10 rounded-xl bg-[var(--accent)]/15 flex items-center justify-center shrink-0 animate-pulse-ring">
        <BadgeCheck className="w-5 h-5 text-[var(--accent)]" />
      </div>
      <div className="relative">
        <p className="text-sm font-semibold">Только на {siteName}</p>
        <p className="text-xs text-[var(--text-muted)] mt-0.5 leading-relaxed">
          Эксклюзивное объявление — сверяйте продавца только на нашей площадке.
        </p>
      </div>
    </div>
  );
}
