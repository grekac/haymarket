"use client";

import { useEffect, useState } from "react";
import { FileSearch } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Card } from "@/components/ui/Card";

type ReportSummary = {
  make?: string | null;
  model?: string | null;
  year?: number | null;
};

type MyReport = {
  id: string;
  queryType: string;
  queryNorm: string;
  summary: ReportSummary;
  createdAt: string;
};

const TYPE_LABEL: Record<string, string> = {
  VIN: "VIN",
  PLATE: "Госномер",
  CHASSIS: "Кузов",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function vehicleLabel(summary: ReportSummary) {
  return [summary.make, summary.model, summary.year].filter(Boolean).join(" · ");
}

export function MyVehicleReports() {
  const [reports, setReports] = useState<MyReport[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/api/vehicle-history/my")
      .then(async (r) => {
        if (!r.ok) {
          setError(true);
          setReports([]);
          return;
        }
        const data = await r.json();
        setReports(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        setError(true);
        setReports([]);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section id="haypass" className="mb-8 scroll-mt-20">
        <h2 className="font-bold mb-4 flex items-center gap-2">
          <FileSearch className="w-5 h-5 text-[var(--accent)]" />
          Мои отчёты HayPass
        </h2>
        <p className="text-sm text-[var(--text-muted)] py-2">Загрузка…</p>
      </section>
    );
  }

  if (error) {
    return (
      <section id="haypass" className="mb-8 scroll-mt-20">
        <h2 className="font-bold mb-4 flex items-center gap-2">
          <FileSearch className="w-5 h-5 text-[var(--accent)]" />
          Мои отчёты HayPass
        </h2>
        <Card className="p-4">
          <p className="text-sm text-[var(--text-muted)]">
            Не удалось загрузить отчёты
          </p>
        </Card>
      </section>
    );
  }

  if (!reports || reports.length === 0) {
    return (
      <section id="haypass" className="mb-8 scroll-mt-20">
        <h2 className="font-bold mb-4 flex items-center gap-2">
          <FileSearch className="w-5 h-5 text-[var(--accent)]" />
          Мои отчёты HayPass
        </h2>
        <Card className="p-4">
          <p className="text-sm text-[var(--text-muted)] mb-3">
            У вас пока нет отчётов по истории автомобиля.
          </p>
          <Link
            href="/vehicle-history"
            className="text-sm text-[var(--accent)] font-medium hover:underline"
          >
            Проверить историю авто
          </Link>
        </Card>
      </section>
    );
  }

  return (
    <section id="haypass" className="mb-8 scroll-mt-20">
      <h2 className="font-bold mb-4 flex items-center gap-2">
        <FileSearch className="w-5 h-5 text-[var(--accent)]" />
        Мои отчёты HayPass
      </h2>
      <div className="space-y-2">
        {reports.map((r) => {
          const makeLine = vehicleLabel(r.summary);
          return (
            <Link
              key={r.id}
              href={`/vehicle-history/report/${r.id}`}
              className="flex items-center justify-between p-3 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] hover:bg-[var(--bg-hover)] transition-colors"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{r.queryNorm}</p>
                <p className="text-xs text-[var(--text-muted)]">
                  {TYPE_LABEL[r.queryType] ?? r.queryType}
                  {" · "}
                  {formatDate(r.createdAt)}
                  {makeLine ? ` · ${makeLine}` : ""}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
