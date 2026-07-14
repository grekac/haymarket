import { getTranslations } from "next-intl/server";
import NextLink from "next/link";
import { Link } from "@/i18n/navigation";
import { getSession } from "@/lib/auth";
import { ThemeToggle } from "./ThemeToggle";
import { NotificationBell } from "./NotificationBell";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { BrandLogo } from "./BrandLogo";
import { Search, MessageCircle, Plus, User } from "lucide-react";

export async function Header() {
  const user = await getSession();
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
          {user && <NotificationBell />}
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

            {user ? (
              <>
                <Link
                  href="/messages"
                  className="p-2.5 rounded-full hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                  aria-label={t("messages")}
                  title={t("messages")}
                >
                  <MessageCircle className="w-5 h-5" />
                </Link>
                <NotificationBell />
                <Link
                  href="/profile"
                  className="ml-0.5 h-9 px-2.5 rounded-full hover:bg-[var(--bg-hover)] inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                >
                  <span className="w-7 h-7 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center">
                    <User className="w-3.5 h-3.5" />
                  </span>
                  <span className="max-w-[88px] truncate hidden lg:inline">
                    {user.name.split(" ")[0]}
                  </span>
                </Link>
                {user.role === "ADMIN" && (
                  <NextLink
                    href="/admin"
                    className="px-2.5 py-1.5 rounded-lg text-[12px] font-semibold text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
                  >
                    {t("admin")}
                  </NextLink>
                )}
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="h-9 px-3 rounded-full text-[13px] font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] inline-flex items-center transition-colors"
                >
                  {t("login")}
                </Link>
                <Link
                  href="/register"
                  className="h-9 px-3 rounded-full text-[13px] font-semibold border border-[var(--border)] hover:bg-[var(--bg-hover)] inline-flex items-center transition-colors"
                >
                  {t("register")}
                </Link>
              </>
            )}

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
