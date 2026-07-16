"use client";

import { Link } from "@/i18n/navigation";
import { CheckCircle2, Printer } from "lucide-react";
import { cn } from "@/lib/utils";
import type { HistoryPayload, SectionStatus } from "@/modules/vehicle-history/normalize";
import { UnlockReportButton } from "@/components/vehicle-history/UnlockReportButton";

const STATUS_LABEL: Record<SectionStatus, string> = {
  verified: "Проверено",
  partial: "Частично",
  unavailable: "Нет данных",
  demo: "Demo",
};

const STATUS_CLASS: Record<SectionStatus, string> = {
  verified: "bg-emerald-500/15 text-emerald-600",
  partial: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  unavailable: "bg-[var(--bg-secondary)] text-[var(--text-muted)]",
  demo: "bg-violet-500/15 text-violet-600",
};

export function VehicleHistoryReportView({
  reportId,
  payload,
  paymentStatus,
}: {
  reportId: string;
  payload: HistoryPayload;
  paymentStatus: "FREE" | "UNPAID" | "PAID";
}) {
  const showUnlock = paymentStatus === "FREE" || paymentStatus === "UNPAID";

  return (
    <div className="space-y-6 print:space-y-4">
      <header className="space-y-2 print:space-y-1">
        <p className="text-[13px] text-[var(--text-muted)] uppercase tracking-wide print:text-black">
          HayPass · отчёт
        </p>
        <h1 className="text-[28px] font-bold tracking-tight print:text-[22pt] print:text-black">
          История автомобиля
        </h1>
        <p className="text-[14px] text-[var(--text-secondary)] print:text-black">
          Запрос: <span className="font-semibold text-[var(--text-primary)] print:text-black">{payload.query.value}</span>
          {" · "}
          {payload.query.type}
        </p>
        {(payload.vehicle.make || payload.vehicle.year) && (
          <p className="text-[16px] font-semibold print:text-black">
            {[payload.vehicle.make, payload.vehicle.model, payload.vehicle.year].filter(Boolean).join(" · ")}
          </p>
        )}
        {paymentStatus === "PAID" && (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 print:text-black">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Полный отчёт оплачен
          </span>
        )}
        <div className="flex flex-wrap items-center gap-3 pt-1 print:hidden">
          {showUnlock && <UnlockReportButton reportId={reportId} />}
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          >
            <Printer className="w-3.5 h-3.5" />
            Печать / PDF
          </button>
        </div>
      </header>

      <div className="space-y-3 print:space-y-2">
        {payload.sections.map((section) => (
          <section
            key={section.id}
            className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-4 space-y-3 print:break-inside-avoid print:rounded-none print:border-black print:bg-white print:p-3 print:shadow-none"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-semibold text-[16px] print:text-black">{section.title}</h2>
                {section.summary && (
                  <p className="text-[13px] text-[var(--text-muted)] mt-1 leading-relaxed print:text-neutral-700">
                    {section.summary}
                  </p>
                )}
              </div>
              <span
                className={cn(
                  "shrink-0 px-2 py-1 rounded-lg text-[11px] font-semibold print:border print:border-black print:bg-white print:text-black print:rounded-none",
                  STATUS_CLASS[section.status]
                )}
              >
                {STATUS_LABEL[section.status]}
              </span>
            </div>
            <p className="text-[11px] text-[var(--text-muted)] print:text-neutral-600">Источник: {section.source}</p>
            {section.items.length > 0 && (
              <ul className="divide-y divide-[var(--border)] print:divide-neutral-300">
                {section.items.map((item, i) => (
                  <li key={i} className="py-2.5 flex justify-between gap-3 text-[13px] print:text-black">
                    <span className="text-[var(--text-secondary)] min-w-0 print:text-neutral-800">{item.label}</span>
                    <span className="font-medium text-right shrink-0">{item.value}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>

      <div className="rounded-2xl bg-[var(--bg-secondary)] p-4 space-y-2 text-[12px] text-[var(--text-muted)] print:rounded-none print:border print:border-black print:bg-white print:text-neutral-700">
        {payload.disclaimers.map((d, i) => (
          <p key={i}>• {d}</p>
        ))}
        <p className="pt-1">ID отчёта: {reportId}</p>
      </div>

      <Link
        href="/vehicle-history"
        className="inline-flex text-sm font-semibold text-[var(--accent)] hover:underline print:hidden"
      >
        Новая проверка
      </Link>
    </div>
  );
}
