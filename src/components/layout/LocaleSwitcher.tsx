"use client";

import { useLocale } from "next-intl";
import { usePathname } from "next/navigation";
import { localeLabels, locales, type AppLocale } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

export function LocaleSwitcher({ className }: { className?: string }) {
  const locale = useLocale() as AppLocale;
  const pathname = usePathname();

  const pathWithoutLocale = pathname.replace(/^\/(hy|ru)(?=\/|$)/, "") || "/";

  return (
    <div className={cn("flex items-center rounded-full border border-[var(--border)] p-0.5 bg-[var(--bg-secondary)]", className)}>
      {locales.map((l) => (
        <Link
          key={l}
          href={pathWithoutLocale}
          locale={l}
          className={cn(
            "text-[11px] font-semibold px-2.5 py-1 rounded-full transition-colors",
            locale === l
              ? "bg-[var(--accent)] text-[var(--accent-fg)]"
              : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          )}
        >
          {localeLabels[l]}
        </Link>
      ))}
    </div>
  );
}
