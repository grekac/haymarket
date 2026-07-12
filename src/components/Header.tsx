import Link from "next/link";
import { Plus } from "lucide-react";
import { SearchBar } from "./SearchBar";
import { UserMenu } from "./UserMenu";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { getSession } from "@/lib/auth";

export async function Header() {
  const user = await getSession();

  return (
    <header className="sticky top-0 z-50">
      <div className="bg-[var(--bg-card)]/70 backdrop-blur-2xl border-b border-[var(--border)]">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center gap-6 h-16">
            <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
              <div className="w-8 h-8 rounded-xl bg-[var(--accent)] flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                <span className="text-white text-sm font-extrabold">H</span>
              </div>
              <span className="text-lg font-bold tracking-tight text-[var(--text-primary)]">
                HayMarket
              </span>
            </Link>

            <div className="hidden md:flex flex-1 max-w-md">
              <SearchBar />
            </div>

            <nav className="flex items-center gap-1 ml-auto">
              <ThemeSwitcher />
              {user ? (
                <UserMenu user={user} />
              ) : (
                <>
                  <Link href="/login" className="btn-ghost hidden sm:inline">
                    Войти
                  </Link>
                  <Link
                    href="/register"
                    className="btn-ghost hidden sm:inline"
                  >
                    Регистрация
                  </Link>
                </>
              )}
              <Link
                href="/create"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-white bg-[var(--accent)] hover:opacity-90 px-4 py-2 rounded-xl shadow-md transition-all ml-1"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Продать</span>
              </Link>
            </nav>
          </div>

          <div className="md:hidden pb-3">
            <SearchBar />
          </div>
        </div>
      </div>
    </header>
  );
}
