"use client";

import { useState } from "react";
import { Zap } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils";
import { isListingPromoted, promotionDaysLeft, PROMOTION_PACKAGES } from "@/lib/promotion";

const PACKAGES = Object.values(PROMOTION_PACKAGES);

export function PromoteButton({
  listingId,
  isPromoted,
  promotedUntil,
}: {
  listingId: string;
  isPromoted?: boolean;
  promotedUntil?: string | Date | null;
}) {
  const t = useTranslations("promote");
  const active = isListingPromoted({ isPromoted: !!isPromoted, promotedUntil: promotedUntil ?? null });
  const [promoted, setPromoted] = useState(active);
  const [until, setUntil] = useState(promotedUntil ? new Date(promotedUntil) : null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function promote(packageId: string) {
    setLoading(true);
    try {
      const res = await fetch(`/api/listings/${listingId}/promote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ package: packageId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setPromoted(true);
      setUntil(new Date(data.promotedUntil));
      setOpen(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : t("error"));
    } finally {
      setLoading(false);
    }
  }

  const daysLeft = until ? promotionDaysLeft(until) : null;

  if (promoted && daysLeft !== null && daysLeft > 0) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600">
        <Zap className="w-3.5 h-3.5" />
        {t("active", { days: daysLeft })}
      </span>
    );
  }

  return (
    <>
      <Button variant="secondary" size="sm" onClick={() => setOpen(true)} disabled={loading}>
        <Zap className="w-4 h-4" /> {t("button")}
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4 bg-black/40">
          <div className="w-full max-w-md rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] p-5 shadow-xl">
            <h3 className="font-semibold text-lg mb-1">{t("modalTitle")}</h3>
            <p className="text-sm text-[var(--text-muted)] mb-4">{t("modalSubtitle")}</p>
            <div className="space-y-2 mb-4">
              {PACKAGES.map((pkg) => (
                <button
                  key={pkg.id}
                  type="button"
                  disabled={loading}
                  onClick={() => promote(pkg.id)}
                  className="w-full flex items-center justify-between p-4 rounded-xl border border-[var(--border)] hover:border-[var(--accent)] hover:bg-[var(--accent)]/5 transition-colors text-left"
                >
                  <div>
                    <p className="font-medium">{t(`packages.${pkg.labelKey}.name`)}</p>
                    <p className="text-xs text-[var(--text-muted)]">{t(`packages.${pkg.labelKey}.desc`)}</p>
                  </div>
                  <p className="font-bold text-[var(--accent)]">{formatPrice(pkg.amount, "AMD")}</p>
                </button>
              ))}
            </div>
            <p className="text-[11px] text-[var(--text-muted)] mb-3">{t("demoPayment")}</p>
            <Button variant="ghost" className="w-full" onClick={() => setOpen(false)}>
              {t("cancel")}
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
