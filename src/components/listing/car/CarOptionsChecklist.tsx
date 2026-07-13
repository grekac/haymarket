import { Check } from "lucide-react";
import { getOptionLabel, OPTION_LABELS } from "@/lib/car-listing-extra";

export function CarOptionsChecklist({ options }: { options?: string[] }) {
  const keys = options?.length ? options : Object.keys(OPTION_LABELS).slice(0, 0);
  const display = keys.length
    ? keys.map((k) => ({ key: k, label: getOptionLabel(k), active: true }))
    : [];

  if (!display.length) return null;

  return (
    <div className="p-5 md:p-6 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] premium-card-hover animate-fade-up animate-delay-6">
      <h2 className="font-semibold text-base mb-4">Комплектация и опции</h2>
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {display.map((opt, i) => (
          <li
            key={opt.key}
            className="flex items-center gap-2.5 text-sm text-[var(--text-secondary)] animate-slide-in-right"
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            <span className="w-6 h-6 rounded-lg bg-emerald-500/12 flex items-center justify-center shrink-0 ring-1 ring-emerald-500/20">
              <Check className="w-3.5 h-3.5 text-emerald-600" />
            </span>
            {opt.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
