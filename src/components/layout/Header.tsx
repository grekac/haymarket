import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ThemeToggle } from "./ThemeToggle";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { BrandLogo } from "./BrandLogo";
import { HeaderAuth } from "./HeaderAuth";
import { Search, Plus } from "lucide-react";

/** Cookie-free RSC shell — session lives in HeaderAuth client island for ISR. */
export async function Header() {
  const t = await getTranslations("nav");

  return (
    <>
      {/* Mobile top bar */}
      <header className="sticky top-0 z-40 glass border-b border-[var(--border)]/50 md:hidden">
        <div className="px-3 flex items-center gap-2 h-12">
          <Link href="/" className="min-w-0 shrink-0">
            <BrandLogo size={32} withName nameClassName="text-[15px]" />
          </Link>

          <div className="flex-1" />

          <LocaleSwitcher compact />
          <HeaderAuth variant="mobile" />
          <Link
            href="/search"
            className="p-2 rounded-full hover:bg-[var(--bg-hover)] transition-colors"
            aria-label={t("searchPlaceholder")}
          >
            <Search className="w-5 h-5 text-[var(--text-secondary)]" />
          </Link>
        </div>
      </header>

      {/* Desktop top bar */}
      <header className="sticky top-0 z-40 glass border-b border-[var(--border)]/50 hidden md:block">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link href="/" className="shrink-0 group">
            <BrandLogo
              size={36}
              withName
              nameClassName="text-[16px] transition-transform group-hover:opacity-90"
              className="transition-transform group-hover:scale-[1.02]"
            />
          </Link>

          <Link
            href="/search"
            className="flex flex-1 max-w-xl items-center gap-2.5 mx-2 px-4 h-10 rounded-full border border-[var(--border)] bg-[var(--bg-secondary)] text-sm text-[var(--text-muted)] hover:border-[var(--border-hover)] hover:bg-[var(--bg-card)] transition-colors"
          >
            <Search className="w-4 h-4 shrink-0" />
            <span className="truncate">{t("searchPlaceholder")}</span>
          </Link>

          <nav className="flex items-center gap-0.5 shrink-0">
            <LocaleSwitcher compact />
            <ThemeToggle />
            <HeaderAuth variant="desktop" />

            <Link
              href="/create"
              className="ml-1 h-9 px-3.5 rounded-full bg-[var(--accent)] text-[var(--accent-fg)] text-[13px] font-semibold inline-flex items-center gap-1.5 hover:bg-[var(--accent-hover)] active:scale-[0.98] transition-all shadow-[var(--shadow-sm)]"
            >
              <Plus className="w-4 h-4" strokeWidth={2.5} />
              <span>{t("placeAd")}</span>
            </Link>
          </nav>
        </div>
      </header>
    </>
  );
}
