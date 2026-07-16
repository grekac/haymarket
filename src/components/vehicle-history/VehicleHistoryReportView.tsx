import { Link } from "@/i18n/navigation";
import { CheckCircle2 } from "lucide-react";
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
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-[13px] text-[var(--text-muted)] uppercase tracking-wide">HayPass · отчёт</p>
        <h1 className="text-[28px] font-bold tracking-tight">История автомобиля</h1>
        <p className="text-[14px] text-[var(--text-secondary)]">
          Запрос: <span className="font-semibold text-[var(--text-primary)]">{payload.query.value}</span>
          {" · "}
          {payload.query.type}
        </p>
        {(payload.vehicle.make || payload.vehicle.year) && (
          <p className="text-[16px] font-semibold">
            {[payload.vehicle.make, payload.vehicle.model, payload.vehicle.year].filter(Boolean).join(" · ")}
          </p>
        )}
        {paymentStatus === "PAID" && (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Полный отчёт оплачен
          </span>
        )}
        {showUnlock && (
          <div className="pt-1">
            <UnlockReportButton reportId={reportId} />
          </div>
        )}
      </header>

      <div className="space-y-3">
        {payload.sections.map((section) => (
          <section
            key={section.id}
            className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-4 space-y-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-semibold text-[16px]">{section.title}</h2>
                {section.summary && (
                  <p className="text-[13px] text-[var(--text-muted)] mt-1 leading-relaxed">{section.summary}</p>
                )}
              </div>
              <span className={cn("shrink-0 px-2 py-1 rounded-lg text-[11px] font-semibold", STATUS_CLASS[section.status])}>
                {STATUS_LABEL[section.status]}
              </span>
            </div>
            <p className="text-[11px] text-[var(--text-muted)]">Источник: {section.source}</p>
            {section.items.length > 0 && (
              <ul className="divide-y divide-[var(--border)]">
                {section.items.map((item, i) => (
                  <li key={i} className="py-2.5 flex justify-between gap-3 text-[13px]">
                    <span className="text-[var(--text-secondary)] min-w-0">{item.label}</span>
                    <span className="font-medium text-right shrink-0">{item.value}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>

      <div className="rounded-2xl bg-[var(--bg-secondary)] p-4 space-y-2 text-[12px] text-[var(--text-muted)]">
        {payload.disclaimers.map((d, i) => (
          <p key={i}>• {d}</p>
        ))}
        <p className="pt-1">ID отчёта: {reportId}</p>
      </div>

      <Link
        href="/vehicle-history"
        className="inline-flex text-sm font-semibold text-[var(--accent)] hover:underline"
      >
        Новая проверка
      </Link>
    </div>
  );
}
