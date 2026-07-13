import { Sparkles, TrendingDown, TrendingUp, Minus, Droplets } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { formatPrice } from "@/lib/utils";
import type { PriceEstimateResult } from "@/lib/ai-price-estimate";

const VERDICT = {
  good_deal: { label: "Выгодная цена", color: "text-emerald-600", bg: "bg-emerald-500/10", Icon: TrendingDown },
  fair: { label: "Рыночная цена", color: "text-blue-600", bg: "bg-blue-500/10", Icon: Minus },
  above_market: { label: "Чуть выше рынка", color: "text-amber-600", bg: "bg-amber-500/10", Icon: TrendingUp },
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

  const tips: string[] = [];
  if (estimate?.reasoning) tips.push(estimate.reasoning);
  if (verdict === "above_market") tips.push("Цена чуть выше рынка — возможен торг.");
  if (verdict === "good_deal") tips.push("Хорошее соотношение цены и года выпуска.");
  if (liquidityNote) tips.push(liquidityNote);
  else if ((estimate?.comparablesCount ?? 0) >= 3)
    tips.push("Хорошая ликвидность модели на рынке Армении.");

  return (
    <Card className="p-5 md:p-6 border-[var(--border)] bg-gradient-to-br from-[var(--bg-card)] to-[var(--bg-secondary)]/50">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-[var(--accent)]/10 flex items-center justify-center shrink-0">
          <Sparkles className="w-5 h-5 text-[var(--accent)]" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-semibold text-base">AI-анализ цены</h2>
            <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${meta.bg} ${meta.color}`}>
              <meta.Icon className="w-3 h-3" />
              {meta.label}
            </span>
          </div>
          <p className="text-2xl font-bold mt-2 tracking-tight">~{formatPrice(price, currency)}</p>
          {min && max && (
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Рынок: {formatPrice(min, currency)} — {formatPrice(max, currency)}
            </p>
          )}
        </div>
      </div>

      {tips.length > 0 && (
        <ul className="mt-4 space-y-2">
          {tips.map((tip, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
              <Droplets className="w-4 h-4 shrink-0 text-[var(--accent)] mt-0.5" />
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
