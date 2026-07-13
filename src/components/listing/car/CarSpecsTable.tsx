"use client";

import { useState } from "react";
import { ChevronDown, ShieldCheck, ShieldAlert } from "lucide-react";
import { Card } from "@/components/ui/Card";
import type { CarDetails } from "@prisma/client";
import type { CarListingExtras } from "@/lib/car-listing-extra";
import { getBodyConditionSummary } from "@/lib/car-listing-extra";
import { formatNumber } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { CarBodyDiagram } from "./CarBodyDiagram";

type Row = { label: string; value: string };

function SpecRows({ rows }: { rows: Row[] }) {
  const visible = rows.filter((r) => r.value);
  if (!visible.length) return null;
  return (
    <div className="divide-y divide-[var(--border)]">
      {visible.map((row) => (
        <div key={row.label} className="grid grid-cols-[minmax(0,44%)_1fr] gap-3 py-3 text-sm">
          <span className="text-[var(--text-muted)]">{row.label}</span>
          <span className="font-medium text-right">{row.value}</span>
        </div>
      ))}
    </div>
  );
}

function buildAllRows(
  car: CarDetails,
  extras: CarListingExtras,
  conditionLabel: string
): Row[] {
  const bodySummary = getBodyConditionSummary(extras);
  return [
    { label: "Год", value: String(car.year) },
    { label: "Поколение", value: car.generation ?? "" },
    { label: "Пробег", value: `${formatNumber(car.mileage)} км` },
    { label: "VIN", value: car.vin ?? "" },
    { label: "ПТС", value: extras.pts ?? "" },
    { label: "Владельцев", value: car.ownersCount ? String(car.ownersCount) : "" },
    { label: "Состояние", value: conditionLabel },
    { label: "Кузов", value: bodySummary.damageLabel },
    { label: "Окраска элементов", value: bodySummary.paintLabel },
    { label: "Состояние кузова", value: extras.bodyConditionNote ?? "" },
    { label: "Модификация", value: extras.modification ?? "" },
    { label: "Объём", value: car.engineVolume ? `${car.engineVolume} л` : "" },
    { label: "Мощность", value: car.power ? `${car.power} л.с.` : "" },
    { label: "Двигатель", value: car.engineType },
    { label: "Коробка", value: car.transmission },
    { label: "Привод", value: car.driveType ?? "" },
    { label: "Комплектация", value: extras.trim ?? "" },
    { label: "Тип кузова", value: car.bodyType ?? "" },
    { label: "Цвет", value: car.color ?? "" },
    { label: "Руль", value: extras.steeringWheel ?? "" },
    { label: "Таможня", value: car.customsCleared ? "Растаможен" : "Не растаможен" },
    { label: "Экокласс", value: extras.ecoClass ?? "" },
  ];
}

const SUMMARY_KEYS = new Set([
  "Год",
  "Пробег",
  "Двигатель",
  "Коробка",
  "Привод",
  "Состояние",
  "Кузов",
]);

export function CarSpecsTable({
  car,
  extras,
  conditionLabel,
}: {
  car: CarDetails;
  extras: CarListingExtras;
  conditionLabel: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const allRows = buildAllRows(car, extras, conditionLabel);
  const summaryRows = allRows.filter((r) => SUMMARY_KEYS.has(r.label) && r.value);
  const damaged = extras.bodyDamaged === true;

  return (
    <Card className="p-5 md:p-6 overflow-hidden premium-card-hover animate-fade-up animate-delay-5">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div>
          <h2 className="font-semibold text-base">Характеристики</h2>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">Основные данные об автомобиле</p>
        </div>
        <span
          className={cn(
            "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shrink-0",
            damaged
              ? "bg-red-500/10 text-red-600 dark:text-red-400 ring-1 ring-red-500/20"
              : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 ring-1 ring-emerald-500/20"
          )}
        >
          {damaged ? (
            <ShieldAlert className="w-3.5 h-3.5" />
          ) : (
            <ShieldCheck className="w-3.5 h-3.5" />
          )}
          {damaged ? "Битая" : "Не битая"}
        </span>
      </div>

      <SpecRows rows={summaryRows} />

      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="mt-4 w-full h-11 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] text-sm font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:border-[var(--accent)]/30 transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.98]"
      >
        {expanded ? "Скрыть подробности" : "Подробные характеристики"}
        <ChevronDown className={cn("w-4 h-4 transition-transform", expanded && "rotate-180")} />
      </button>

      {expanded && (
        <div className="mt-5 pt-5 border-t border-[var(--border)] space-y-5 animate-fade-in">
          <SpecRows rows={allRows} />
          <CarBodyDiagram
            paintedParts={extras.bodyPaint}
            damagedParts={extras.bodyDamage}
            compact
          />
        </div>
      )}
    </Card>
  );
}

export function CarDamageBadge({ extras }: { extras: CarListingExtras }) {
  const damaged = extras.bodyDamaged === true;
  const summary = getBodyConditionSummary(extras);

  return (
    <div
      className={cn(
        "relative overflow-hidden flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-2xl border animate-fade-up animate-delay-2",
        damaged
          ? "border-red-500/25 bg-gradient-to-r from-red-500/[0.06] to-transparent"
          : "border-emerald-500/25 bg-gradient-to-r from-emerald-500/[0.06] to-transparent"
      )}
    >
      <div className="absolute inset-0 listing-shimmer pointer-events-none opacity-30" />
      <div className="relative flex items-center gap-3 min-w-0">
        <div
          className={cn(
            "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-300",
            damaged ? "bg-red-500/15 text-red-600 animate-pulse-ring" : "bg-emerald-500/15 text-emerald-600"
          )}
        >
          {damaged ? <ShieldAlert className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
        </div>
        <div>
          <p className={cn("font-bold text-base", damaged ? "text-red-600 dark:text-red-400" : "text-emerald-700 dark:text-emerald-400")}>
            {damaged ? "Автомобиль битый" : "Не битая"}
          </p>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">
            {summary.paintLabel}
            {extras.bodyConditionNote ? ` · ${extras.bodyConditionNote}` : ""}
          </p>
        </div>
      </div>
    </div>
  );
}
