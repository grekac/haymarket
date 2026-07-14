"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale } from "next-intl";
import { usePathname } from "next/navigation";
import { ChevronDown, Check, Globe } from "lucide-react";
import { localeLabels, locales, type AppLocale } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

export function LocaleSwitcher({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  const locale = useLocale() as AppLocale;
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const pathWithoutLocale = pathname.replace(/^\/(hy|ru|en)(?=\/|$)/, "") || "/";

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname, locale]);

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "inline-flex items-center gap-1 rounded-full border border-[var(--border)] bg-[var(--bg-secondary)]",
          "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-hover)] transition-colors",
          compact ? "h-8 px-2" : "h-9 px-2.5"
        )}
        aria-label="Language"
        aria-expanded={open}
      >
        <Globe className={cn(compact ? "w-3.5 h-3.5" : "w-4 h-4")} />
        <span className="text-[12px] font-semibold tabular-nums">{localeLabels[locale]}</span>
        <ChevronDown className={cn("opacity-60 transition-transform", open && "rotate-180", compact ? "w-3 h-3" : "w-3.5 h-3.5")} />
      </button>

      {open && (
        <div
          className={cn(
            "absolute right-0 top-[calc(100%+6px)] z-50 min-w-[132px]",
            "rounded-xl border border-[var(--border)] bg-[var(--bg-card)] shadow-[var(--shadow-md)] p-1",
            "animate-fade-in"
          )}
        >
          {locales.map((l) => (
            <Link
              key={l}
              href={pathWithoutLocale}
              locale={l}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center justify-between gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors",
                locale === l
                  ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                  : "text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
              )}
            >
              {localeLabels[l]}
              {locale === l && <Check className="w-3.5 h-3.5" />}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
