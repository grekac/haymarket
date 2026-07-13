import { getTranslations } from "next-intl/server";
import NextLink from "next/link";
import { Link } from "@/i18n/navigation";
import { getSession } from "@/lib/auth";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "@/components/ui/Button";
import { NotificationBell } from "./NotificationBell";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { Search, MessageCircle } from "lucide-react";

export async function Header() {
  const user = await getSession();
  const t = await getTranslations("nav");

  return (
    <>
      <header className="sticky top-0 z-40 glass border-b border-[var(--border)]/60 md:hidden">
        <div className="px-4 flex items-center justify-between h-12">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-[12px] bg-[var(--accent)] flex items-center justify-center">
              <span className="text-[var(--accent-fg)] text-xs font-bold">H</span>
            </div>
            <span className="text-[15px] font-semibold tracking-tight">HayMarket</span>
          </Link>
          <div className="flex items-center gap-0.5">
            <LocaleSwitcher />
            {user && (
              <Link href="/messages" className="p-2 rounded-full hover:bg-[var(--bg-hover)] transition-colors">
                <MessageCircle className="w-5 h-5 text-[var(--text-secondary)]" />
              </Link>
            )}
            {user && <NotificationBell />}
            <Link href="/search" className="p-2 rounded-full hover:bg-[var(--bg-hover)] transition-colors">
              <Search className="w-5 h-5 text-[var(--text-secondary)]" />
            </Link>
          </div>
        </div>
      </header>

      <header className="sticky top-0 z-40 glass border-b border-[var(--border)]/60 hidden md:block">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-14 gap-4">
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-9 h-9 rounded-[14px] bg-[var(--accent)] flex items-center justify-center shadow-[var(--shadow-sm)] transition-transform duration-300 group-hover:scale-105">
              <span className="text-[var(--accent-fg)] text-sm font-bold">H</span>
            </div>
            <span className="text-[16px] font-semibold tracking-tight">HayMarket</span>
          </Link>

          <Link
            href="/search"
            className="flex flex-1 max-w-md items-center gap-2.5 px-4 py-2.5 rounded-[18px] border border-[var(--border)] bg-[var(--bg-secondary)] text-sm text-[var(--text-muted)] hover:border-[var(--border-hover)] hover:shadow-[var(--shadow-sm)] transition-all duration-300"
          >
            <Search className="w-4 h-4 shrink-0" />
            <span>{t("searchPlaceholder")}</span>
          </Link>

          <nav className="flex items-center gap-1 shrink-0">
            <LocaleSwitcher className="mr-1" />
            {user && (
              <Link href="/messages">
                <Button variant="ghost" size="sm">{t("messages")}</Button>
              </Link>
            )}
            {user && <NotificationBell />}
            <ThemeToggle />
            {user ? (
              <>
                <Link href="/profile">
                  <Button variant="ghost" size="sm">{user.name.split(" ")[0]}</Button>
                </Link>
                {user.role === "ADMIN" && (
                  <NextLink href="/admin">
                    <Button variant="ghost" size="sm">{t("admin")}</Button>
                  </NextLink>
                )}
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">{t("login")}</Button>
                </Link>
                <Link href="/register">
                  <Button variant="secondary" size="sm">{t("register")}</Button>
                </Link>
              </>
            )}
            <Link href="/create">
              <Button size="sm">{t("post")}</Button>
            </Link>
          </nav>
        </div>
      </header>
    </>
  );
}
