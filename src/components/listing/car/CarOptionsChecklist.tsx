import { Check } from "lucide-react";
import { getOptionLabel, OPTION_LABELS } from "@/lib/car-listing-extra";

export function CarOptionsChecklist({ options }: { options?: string[] }) {
  const keys = options?.length ? options : Object.keys(OPTION_LABELS).slice(0, 0);
  const display = keys.length
    ? keys.map((k) => ({ key: k, label: getOptionLabel(k), active: true }))
    : [];

  if (!display.length) return null;

  return (
    <div className="space-y-3">
      <h2 className="font-semibold text-base">Комплектация и опции</h2>
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {display.map((opt) => (
          <li
            key={opt.key}
            className="flex items-center gap-2.5 text-sm text-[var(--text-secondary)]"
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
