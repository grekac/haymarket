import { Eye, Calendar, RefreshCw } from "lucide-react";
import { formatDate, formatNumber } from "@/lib/utils";

const STAT_ITEMS = [
  { key: "created", icon: Calendar, label: "Опубликовано" },
  { key: "updated", icon: RefreshCw, label: "Обновлено" },
  { key: "today", icon: Eye, label: "Сегодня" },
  { key: "total", icon: Eye, label: "Всего" },
] as const;

export function CarListingStats({
  createdAt,
  updatedAt,
  viewsTotal,
  viewsToday,
}: {
  createdAt: Date;
  updatedAt: Date;
  viewsTotal: number;
  viewsToday?: number;
}) {
  const values: Record<string, string> = {
    created: formatDate(createdAt),
    updated: formatDate(updatedAt),
    today: formatNumber(viewsToday ?? 0),
    total: formatNumber(viewsTotal),
  };

  return (
    <div className="p-5 md:p-6 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] premium-card-hover animate-fade-up animate-delay-7">
      <h2 className="font-semibold text-base mb-4">Статистика объявления</h2>
      <div className="grid grid-cols-2 gap-3 text-sm">
        {STAT_ITEMS.map((item, i) => (
          <div
            key={item.key}
            className="flex items-center gap-2.5 p-3 rounded-xl bg-[var(--bg-secondary)]/60 text-[var(--text-secondary)] animate-scale-in"
            style={{ animationDelay: `${i * 0.06}s` }}
          >
            <item.icon className="w-4 h-4 shrink-0 text-[var(--accent)]" />
            <div>
              <p className="text-[11px] text-[var(--text-muted)]">{item.label}</p>
              <p className="font-semibold tabular-nums">{values[item.key]}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
