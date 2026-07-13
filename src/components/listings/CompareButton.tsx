"use client";

import { useEffect, useState } from "react";
import { Scale } from "lucide-react";
import { cn } from "@/lib/utils";
import { addToCompare, getCompareList, type CompareItem } from "@/lib/compare";

type Props = {
  listing: CompareItem;
  className?: string;
  compact?: boolean;
};

export function CompareButton({ listing, className, compact }: Props) {
  const [active, setActive] = useState(false);
  const [hint, setHint] = useState("");

  useEffect(() => {
    const sync = () => setActive(getCompareList().some((x) => x.id === listing.id));
    sync();
    window.addEventListener("haymarket:compare", sync);
    return () => window.removeEventListener("haymarket:compare", sync);
  }, [listing.id]);

  function toggle() {
    if (active) return;
    const result = addToCompare(listing);
    if (result.ok) {
      setActive(true);
      setHint("Добавлено");
    } else {
      setHint(result.message ?? "Ошибка");
    }
    setTimeout(() => setHint(""), 2000);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className={cn(
        "inline-flex items-center gap-2 px-4 py-2.5 rounded-[16px] font-semibold text-[14px] border transition-all duration-200",
        active
          ? "bg-[var(--accent)]/10 border-[var(--accent)]/30 text-[var(--accent)]"
          : "bg-[var(--bg-secondary)] border-[var(--border)]",
        className
      )}
    >
      <Scale className="w-4 h-4" />
      {!compact && (active ? "В сравнении" : "Сравнить")}
      {hint && <span className="text-[11px] font-normal opacity-80">{hint}</span>}
    </button>
  );
}
