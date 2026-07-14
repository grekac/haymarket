"use client";

import { Sparkles, TrendingDown, TrendingUp, Minus, Droplets } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import type { PriceEstimateResult } from "@/lib/ai-price-estimate";
import { cn } from "@/lib/utils";

const VERDICT = {
  good_deal: { label: "Выгодная цена", color: "text-emerald-600", bg: "bg-emerald-500/10", bar: "bg-emerald-500", Icon: TrendingDown },
  fair: { label: "Рыночная цена", color: "text-blue-600", bg: "bg-blue-500/10", bar: "bg-blue-500", Icon: Minus },
  above_market: { label: "Чуть выше рынка", color: "text-amber-600", bg: "bg-amber-500/10", bar: "bg-amber-500", Icon: TrendingUp },
} as const;

type Props = {
  listedPrice: number;
  currency: string;
  estimate?: Pick<PriceEstimateResult, "price" | "priceMin" | "priceMax" | "reasoning" | "verdict" | "comparablesCount"> | null;
  aiPriceHint?: number | null;
  aiPriceMin?: number | null;
  aiPriceMax?: number | null;
  liquidityNote?: string;
};

export function CarPriceAnalysis({
  listedPrice,
  currency,
  estimate,
  aiPriceHint,
  aiPriceMin,
  aiPriceMax,
  liquidityNote,
}: Props) {
  const price = estimate?.price ?? aiPriceHint;
  const min = estimate?.priceMin ?? aiPriceMin;
  const max = estimate?.priceMax ?? aiPriceMax;
  if (!price) return null;

  const verdict =
    estimate?.verdict ??
    (listedPrice / price <= 0.94 ? "good_deal" : listedPrice / price >= 1.08 ? "above_market" : "fair");
  const meta = VERDICT[verdict];

  const marketPos =
    min && max ? Math.min(100, Math.max(0, ((listedPrice - min) / (max - min)) * 100)) : 50;

  const tips: string[] = [];
  if (estimate?.reasoning) tips.push(estimate.reasoning);
  if (verdict === "above_market") tips.push("Цена чуть выше рынка — возможен торг.");
  if (verdict === "good_deal") tips.push("Хорошее соотношение цены и года выпуска.");
  if (liquidityNote) tips.push(liquidityNote);
  else if ((estimate?.comparablesCount ?? 0) >= 3)
    tips.push("Хорошая ликвидность модели на рынке Армении.");

  return (
    <section className="space-y-3">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-[var(--accent)]/12 flex items-center justify-center shrink-0">
          <Sparkles className="w-5 h-5 text-[var(--accent)]" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-semibold text-base">AI-анализ цены</h2>
            <span className={cn("inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full", meta.bg, meta.color)}>
              <meta.Icon className="w-3 h-3" />
              {meta.label}
            </span>
          </div>
          <p className="text-2xl font-bold mt-2 tracking-tight tabular-nums">~{formatPrice(price, currency)}</p>
          {min && max && (
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Рынок: {formatPrice(min, currency)} — {formatPrice(max, currency)}
            </p>
          )}
        </div>
      </div>

      {min && max && (
        <div>
          <div className="h-2 rounded-full bg-[var(--bg-secondary)] overflow-hidden">
            <div
              className={cn("h-full rounded-full transition-all duration-700 ease-out", meta.bar)}
              style={{ width: `${marketPos}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-[var(--text-muted)] mt-1.5">
            <span>Ниже рынка</span>
            <span>Выше рынка</span>
          </div>
        </div>
      )}

      {tips.length > 0 && (
        <ul className="space-y-2">
          {tips.map((tip, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
              <Droplets className="w-4 h-4 shrink-0 text-[var(--accent)] mt-0.5" />
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
