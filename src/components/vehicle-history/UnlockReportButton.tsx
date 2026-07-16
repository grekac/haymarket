"use client";

import { useLocale } from "next-intl";
import { useState } from "react";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils";

const PACKAGES = [
  { id: "basic", amount: 990, currency: "AMD", label: "Базовый отчёт" },
  { id: "full", amount: 2490, currency: "AMD", label: "Полный отчёт" },
] as const;

export function UnlockReportButton({ reportId }: { reportId: string }) {
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function unlock(packageId: string) {
    setLoading(true);
    try {
      const res = await fetch(`/api/vehicle-history/reports/${reportId}/unlock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ package: packageId, locale }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Не удалось открыть отчёт");

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
        return;
      }

      window.location.reload();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Ошибка оплаты");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Button variant="secondary" size="sm" onClick={() => setOpen(true)} disabled={loading}>
        <Lock className="w-4 h-4" /> Открыть полный отчёт
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4 bg-black/40">
          <div className="w-full max-w-md rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] p-5 shadow-xl">
            <h3 className="font-semibold text-lg mb-1">Выберите пакет</h3>
            <p className="text-sm text-[var(--text-muted)] mb-4">
              Оплатите, чтобы открыть расширенные данные отчёта
            </p>
            <div className="space-y-2 mb-4">
              {PACKAGES.map((pkg) => (
                <button
                  key={pkg.id}
                  type="button"
                  disabled={loading}
                  onClick={() => unlock(pkg.id)}
                  className="w-full flex items-center justify-between p-4 rounded-xl border border-[var(--border)] hover:border-[var(--accent)] hover:bg-[var(--accent)]/5 transition-colors text-left"
                >
                  <div>
                    <p className="font-medium">{pkg.label}</p>
                  </div>
                  <p className="font-bold text-[var(--accent)]">
                    {formatPrice(pkg.amount, pkg.currency)}
                  </p>
                </button>
              ))}
            </div>
            <p className="text-[11px] text-[var(--text-muted)] mb-3">
              Оплата через Stripe или demo-режим без ключа
            </p>
            <Button variant="ghost" className="w-full" onClick={() => setOpen(false)}>
              Отмена
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
