import { Shield } from "lucide-react";
import { SAFETY_TIPS } from "@/lib/safety";

export function SafetyBanner() {
  return (
    <div className="rounded-[20px] border border-[var(--danger)]/20 bg-[var(--danger-soft)] p-4">
      <div className="flex items-start gap-3">
        <Shield className="w-5 h-5 text-[var(--danger)] shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-[14px] text-[var(--danger)]">Безопасная сделка</p>
          <ul className="mt-2 space-y-1 text-[12px] text-[var(--text-secondary)]">
            {SAFETY_TIPS.slice(0, 3).map((t) => (
              <li key={t}>• {t}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
