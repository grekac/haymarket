"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Scale, X } from "lucide-react";
import { clearCompare, getCompareList } from "@/lib/compare";

export function CompareBar() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const sync = () => setCount(getCompareList().length);
    sync();
    window.addEventListener("haymarket:compare", sync);
    return () => window.removeEventListener("haymarket:compare", sync);
  }, []);

  if (count === 0) return null;

  return (
    <div className="fixed bottom-[calc(52px+env(safe-area-inset-bottom)+8px)] md:bottom-6 left-1/2 -translate-x-1/2 z-40">
      <div className="flex items-center gap-2 pl-4 pr-2 py-2 rounded-full bg-[var(--accent)] text-[var(--accent-fg)] shadow-[var(--shadow-float)]">
        <Scale className="w-4 h-4" />
        <Link href="/compare" className="text-sm font-semibold">
          Сравнить ({count})
        </Link>
        <button
          type="button"
          onClick={clearCompare}
          className="p-1.5 rounded-full hover:bg-white/20"
          aria-label="Очистить"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
