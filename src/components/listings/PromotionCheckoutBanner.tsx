"use client";

import { useTranslations } from "next-intl";
import { CheckCircle2, XCircle } from "lucide-react";

export function PromotionCheckoutBanner({ status }: { status?: string }) {
  const t = useTranslations("promote");

  if (status === "success") {
    return (
      <div className="mb-4 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 dark:bg-emerald-950/30 dark:border-emerald-800 p-4 text-sm text-emerald-800 dark:text-emerald-200">
        <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
        <p>{t("checkoutSuccess")}</p>
      </div>
    );
  }

  if (status === "cancel") {
    return (
      <div className="mb-4 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800 p-4 text-sm text-amber-800 dark:text-amber-200">
        <XCircle className="w-5 h-5 shrink-0 mt-0.5" />
        <p>{t("checkoutCancel")}</p>
      </div>
    );
  }

  return null;
}
