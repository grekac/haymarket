import { Check } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { getOptionLabel, OPTION_LABELS } from "@/lib/car-listing-extra";

export function CarOptionsChecklist({ options }: { options?: string[] }) {
  const keys = options?.length ? options : Object.keys(OPTION_LABELS).slice(0, 0);
  const display = keys.length
    ? keys.map((k) => ({ key: k, label: getOptionLabel(k), active: true }))
    : [];

  if (!display.length) return null;

  return (
    <Card className="p-5 md:p-6">
      <h2 className="font-semibold text-base mb-4">Комплектация и опции</h2>
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {display.map((opt) => (
          <li
            key={opt.key}
            className="flex items-center gap-2.5 text-sm text-[var(--text-secondary)]"
          >
            <span className="w-5 h-5 rounded-md bg-emerald-500/15 flex items-center justify-center shrink-0">
              <Check className="w-3.5 h-3.5 text-emerald-600" />
            </span>
            {opt.label}
          </li>
        ))}
      </ul>
    </Card>
  );
}
