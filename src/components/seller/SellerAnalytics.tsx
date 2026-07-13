"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { BarChart3, Eye, Heart, MessageCircle, Zap } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { Card } from "@/components/ui/Card";
import { Link } from "@/i18n/navigation";

type Stats = {
  totalViews: number;
  viewsLast7Days: number;
  viewsByDay: Array<{ date: string; views: number }>;
  activeListings: number;
  totalFavorites: number;
  totalMessages: number;
  activePromotions: number;
  revenueSpent: number;
  listings: Array<{
    id: string;
    title: string;
    views: number;
    viewsLast7Days: number;
    favorites: number;
    messages: number;
    isPromoted: boolean;
    promotedUntil: string | null;
    status: string;
  }>;
};

export function SellerAnalytics() {
  const t = useTranslations("analytics");
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/seller/stats")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setStats(data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="text-sm text-[var(--text-muted)] py-6">{t("loading")}</p>;
  }

  if (!stats) return null;

  const maxDay = Math.max(...stats.viewsByDay.map((d) => d.views), 1);

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-[var(--accent)]" />
          {t("title")}
        </h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { icon: Eye, label: t("totalViews"), value: stats.totalViews },
          { icon: Eye, label: t("views7d"), value: stats.viewsLast7Days },
          { icon: Heart, label: t("favorites"), value: stats.totalFavorites },
          { icon: MessageCircle, label: t("messages"), value: stats.totalMessages },
        ].map(({ icon: Icon, label, value }) => (
          <Card key={label} className="p-4">
            <Icon className="w-4 h-4 text-[var(--text-muted)] mb-2" />
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs text-[var(--text-muted)] mt-1">{label}</p>
          </Card>
        ))}
      </div>

      {stats.viewsByDay.length > 0 && (
        <Card className="p-4 mb-6">
          <p className="text-sm font-medium mb-3">{t("viewsChart")}</p>
          <div className="flex items-end gap-1 h-24">
            {stats.viewsByDay.map((d) => (
              <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full bg-[var(--accent)]/80 rounded-t-md min-h-[4px]"
                  style={{ height: `${Math.max(8, (d.views / maxDay) * 100)}%` }}
                  title={`${d.views}`}
                />
                <span className="text-[9px] text-[var(--text-muted)]">{d.date.slice(5)}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="flex flex-wrap gap-3 text-sm mb-4">
        <span className="px-3 py-1.5 rounded-full bg-[var(--bg-secondary)]">
          {t("activeListings", { count: stats.activeListings })}
        </span>
        <span className="px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-700">
          <Zap className="w-3.5 h-3.5 inline mr-1" />
          {t("activePromotions", { count: stats.activePromotions })}
        </span>
        {stats.revenueSpent > 0 && (
          <span className="px-3 py-1.5 rounded-full bg-[var(--bg-secondary)]">
            {t("spent", { amount: formatPrice(stats.revenueSpent, "AMD") })}
          </span>
        )}
      </div>

      {stats.listings.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-[var(--text-secondary)]">{t("byListing")}</p>
          {stats.listings.slice(0, 5).map((l) => (
            <Link
              key={l.id}
              href={`/listing/${l.id}`}
              className="flex items-center justify-between p-3 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] hover:bg-[var(--bg-hover)] transition-colors"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{l.title}</p>
                <p className="text-xs text-[var(--text-muted)]">
                  {l.views} {t("viewsTotal")} · {l.viewsLast7Days} {t("views7dShort")}
                  {l.isPromoted && ` · ${t("promoted")}`}
                </p>
              </div>
              <div className="text-xs text-[var(--text-muted)] shrink-0 ml-3">
                ♥ {l.favorites} · 💬 {l.messages}
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
