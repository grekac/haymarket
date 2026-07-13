import { Eye, Calendar, RefreshCw } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { formatDate, formatNumber } from "@/lib/utils";

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
  return (
    <Card className="p-5 md:p-6">
      <h2 className="font-semibold text-base mb-4">Статистика объявления</h2>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="flex items-center gap-2 text-[var(--text-secondary)]">
          <Calendar className="w-4 h-4 shrink-0" />
          <div>
            <p className="text-[11px] text-[var(--text-muted)]">Опубликовано</p>
            <p className="font-medium">{formatDate(createdAt)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[var(--text-secondary)]">
          <RefreshCw className="w-4 h-4 shrink-0" />
          <div>
            <p className="text-[11px] text-[var(--text-muted)]">Обновлено</p>
            <p className="font-medium">{formatDate(updatedAt)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[var(--text-secondary)]">
          <Eye className="w-4 h-4 shrink-0" />
          <div>
            <p className="text-[11px] text-[var(--text-muted)]">Сегодня</p>
            <p className="font-medium">{formatNumber(viewsToday ?? 0)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[var(--text-secondary)]">
          <Eye className="w-4 h-4 shrink-0" />
          <div>
            <p className="text-[11px] text-[var(--text-muted)]">Всего</p>
            <p className="font-medium">{formatNumber(viewsTotal)}</p>
          </div>
        </div>
      </div>
    </Card>
  );
}
