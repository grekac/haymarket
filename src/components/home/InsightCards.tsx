import Link from "next/link";
import { MapPin, TrendingDown, Sparkles, Eye, ChevronRight } from "lucide-react";
import type { PersonalInsight } from "@/lib/personalization";
import { cn } from "@/lib/utils";

const ICONS = {
  nearby: MapPin,
  price_drop: TrendingDown,
  match: Sparkles,
  views: Eye,
  new: Sparkles,
};

const ACCENTS = {
  blue: "from-[var(--accent-soft)] to-white border-[var(--brand)]/10",
  emerald: "from-[var(--emerald-soft)] to-white border-[var(--emerald)]/10",
  neutral: "from-[var(--bg-secondary)] to-white border-[var(--border)]",
};

export function InsightCards({ insights }: { insights: PersonalInsight[] }) {
  if (!insights.length) return null;

  return (
    <div className="flex gap-3 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-none snap-x snap-mandatory">
      {insights.map((insight, i) => {
        const Icon = ICONS[insight.type] ?? Sparkles;
        const accent = ACCENTS[insight.accent ?? "blue"];
        return (
          <Link
            key={insight.id}
            href={insight.href}
            className={cn(
              "snap-start shrink-0 w-[260px] p-4 rounded-[20px] border bg-gradient-to-br",
              "shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)]",
              "transition-all duration-300 active:scale-[0.98]",
              accent,
              "animate-fade-up"
            )}
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="w-9 h-9 rounded-full bg-[var(--bg-card)] shadow-sm flex items-center justify-center">
                <Icon className={cn(
                  "w-4 h-4",
                  insight.accent === "emerald" ? "text-[var(--emerald)]" : "text-[var(--brand)]"
                )} />
              </div>
              <ChevronRight className="w-4 h-4 text-[var(--text-muted)] mt-1" />
            </div>
            <p className="font-semibold text-[15px] mt-3 leading-snug tracking-tight">
              {insight.title}
            </p>
            {insight.subtitle && (
              <p className="text-xs text-[var(--text-secondary)] mt-1 line-clamp-2">
                {insight.subtitle}
              </p>
            )}
          </Link>
        );
      })}
    </div>
  );
}
