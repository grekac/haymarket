import { adminService } from "@/modules/admin/admin.service";
import { getAdminAnalytics } from "@/lib/analytics";
import { Card } from "@/components/ui/Card";
import { formatPrice, formatDate } from "@/lib/utils";

export async function AdminAnalytics() {
  const [baseStats, analytics] = await Promise.all([
    adminService.getStats(),
    getAdminAnalytics(),
  ]);

  return (
    <section className="mb-10">
      <h2 className="text-xl font-bold mb-4">Аналитика и монетизация</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Выручка (всего)", value: formatPrice(analytics.totalRevenue, "AMD") },
          { label: "Выручка 30 дней", value: formatPrice(analytics.revenueLast30Days, "AMD") },
          { label: "Продвижений активно", value: analytics.activePromotions },
          { label: "Заказов продвижения", value: analytics.promotionOrdersCount },
        ].map((s) => (
          <Card key={s.label} className="p-5 text-center">
            <p className="text-2xl font-extrabold">{s.value}</p>
            <p className="text-sm text-[var(--text-muted)] mt-1">{s.label}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Просмотры сегодня", value: analytics.viewsToday },
          { label: "Просмотры 7 дней", value: analytics.viewsLast7Days },
          { label: "Просмотры всего", value: analytics.totalViews },
          { label: "На модерации", value: baseStats.pendingListings },
        ].map((s) => (
          <Card key={s.label} className="p-4 text-center">
            <p className="text-xl font-bold">{s.value}</p>
            <p className="text-xs text-[var(--text-muted)] mt-1">{s.label}</p>
          </Card>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-5">
          <h3 className="font-semibold mb-3">Топ категории</h3>
          <div className="space-y-2">
            {analytics.topCategories.map((c) => (
              <div key={c.name} className="flex justify-between text-sm">
                <span>{c.name}</span>
                <span className="text-[var(--text-muted)]">{c.count}</span>
              </div>
            ))}
            {!analytics.topCategories.length && (
              <p className="text-sm text-[var(--text-muted)]">Нет данных</p>
            )}
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="font-semibold mb-3">Последние оплаты продвижения</h3>
          <div className="space-y-2">
            {analytics.recentOrders.map((o) => (
              <div key={o.id} className="text-sm border-b border-[var(--border)]/50 pb-2 last:border-0">
                <p className="font-medium truncate">{o.listingTitle}</p>
                <p className="text-xs text-[var(--text-muted)]">
                  {o.userName} · {formatPrice(o.amount, "AMD")} · {o.package} · {formatDate(o.createdAt)}
                </p>
              </div>
            ))}
            {!analytics.recentOrders.length && (
              <p className="text-sm text-[var(--text-muted)]">Пока нет заказов</p>
            )}
          </div>
        </Card>
      </div>
    </section>
  );
}
