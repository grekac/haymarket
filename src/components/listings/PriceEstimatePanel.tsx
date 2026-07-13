import { Sparkles, TrendingDown, TrendingUp, Minus } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import type { PriceEstimateResult } from "@/lib/ai-price-estimate";

const VERDICT_LABELS = {
  good_deal: { label: "Выгодная цена", color: "text-emerald-600", bg: "bg-emerald-500/10", Icon: TrendingDown },
  fair: { label: "Рыночная цена", color: "text-blue-600", bg: "bg-blue-500/10", Icon: Minus },
  above_market: { label: "Выше рынка", color: "text-amber-600", bg: "bg-amber-500/10", Icon: TrendingUp },
} as const;

type Props = {
  listedPrice: number;
  currency?: string;
  aiPriceHint?: number | null;
  aiPriceMin?: number | null;
  aiPriceMax?: number | null;
  estimate?: Pick<PriceEstimateResult, "price" | "priceMin" | "priceMax" | "reasoning" | "verdict" | "comparablesCount" | "source"> | null;
};

export function PriceEstimatePanel({
  listedPrice,
  currency = "AMD",
  aiPriceHint,
  aiPriceMin,
  aiPriceMax,
  estimate,
}: Props) {
  const price = estimate?.price ?? aiPriceHint;
  const min = estimate?.priceMin ?? aiPriceMin;
  const max = estimate?.priceMax ?? aiPriceMax;

  if (!price) return null;

  const verdict =
    estimate?.verdict ??
    (listedPrice > 0
      ? listedPrice / price <= 0.94
        ? "good_deal"
        : listedPrice / price >= 1.08
          ? "above_market"
          : "fair"
      : null);

  const verdictMeta = verdict ? VERDICT_LABELS[verdict] : null;

  return (
    <div className="mt-4 p-4 rounded-2xl border border-[var(--border)] bg-gradient-to-br from-[var(--bg-secondary)] to-[var(--bg-card)]">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-[var(--accent)]/10 flex items-center justify-center shrink-0">
          <Sparkles className="w-4 h-4 text-[var(--accent)]" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold">AI-оценка рынка</p>
            {verdictMeta && (
              <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${verdictMeta.bg} ${verdictMeta.color}`}>
                <verdictMeta.Icon className="w-3 h-3" />
                {verdictMeta.label}
              </span>
            )}
          </div>
          <p className="text-lg font-bold mt-1">~{formatPrice(price, currency)}</p>
          {min && max && (
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Диапазон: {formatPrice(min, currency)} — {formatPrice(max, currency)}
            </p>
          )}
          {estimate?.reasoning && (
            <p className="text-xs text-[var(--text-muted)] mt-2 leading-relaxed">{estimate.reasoning}</p>
          )}
          {estimate?.comparablesCount != null && estimate.comparablesCount > 0 && (
            <p className="text-[11px] text-[var(--text-muted)] mt-1">
              {estimate.comparablesCount} похожих на HayMarket
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

type InlineProps = {
  estimate: {
    price: number;
    priceMin: number;
    priceMax: number;
    reasoning: string;
    comparablesCount: number;
    source: string;
  };
  onApply: () => void;
  loading?: boolean;
};

export function PriceEstimateInline({ estimate, onApply, loading }: InlineProps) {
  return (
    <div className="p-4 rounded-2xl border border-[var(--accent)]/30 bg-[var(--accent)]/5 space-y-3">
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-[var(--accent)]" />
        <p className="text-sm font-semibold">AI-оценка цены</p>
      </div>
      <p className="text-2xl font-bold">{formatPrice(estimate.price, "AMD")}</p>
      <p className="text-xs text-[var(--text-muted)]">
        Диапазон: {formatPrice(estimate.priceMin, "AMD")} — {formatPrice(estimate.priceMax, "AMD")}
      </p>
      <p className="text-xs text-[var(--text-secondary)]">{estimate.reasoning}</p>
      {estimate.comparablesCount > 0 && (
        <p className="text-[11px] text-[var(--text-muted)]">
          {estimate.comparablesCount} похожих объявлений на HayMarket
        </p>
      )}
      <button
        type="button"
        onClick={onApply}
        disabled={loading}
        className="text-sm font-medium text-[var(--accent)] hover:underline"
      >
        Подставить оценку в цену →
      </button>
    </div>
  );
}
