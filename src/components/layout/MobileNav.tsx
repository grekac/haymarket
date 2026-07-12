"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Plus, MessageCircle, User } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", icon: Home, label: "Главная" },
  { href: "/search", icon: Search, label: "Поиск" },
  { href: "/create", icon: Plus, label: "Подать", accent: true },
  { href: "/messages", icon: MessageCircle, label: "Чаты" },
  { href: "/profile", icon: User, label: "Профиль" },
];

export function MobileNav() {
  const pathname = usePathname();
  const hideOnListing = pathname.startsWith("/listing/");
  const hideOnChat = /^\/messages\/[^/]+$/.test(pathname);

  if (hideOnListing || hideOnChat) return null;

  return (
    <nav className="app-fixed bottom-0 glass border-t border-[var(--border)]/60">
      <div className="flex items-end justify-around h-[52px] px-2 pb-[env(safe-area-inset-bottom)]">
        {NAV.map(({ href, icon: Icon, label, accent }) => {
          const active = pathname === href || (href !== "/" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 min-w-[56px] py-1 transition-all duration-200",
                accent ? "-mt-4" : active ? "text-[var(--brand)]" : "text-[var(--text-muted)]"
              )}
            >
              {accent ? (
                <div className="w-[52px] h-[52px] rounded-full bg-[var(--accent)] text-[var(--accent-fg)] flex items-center justify-center shadow-[var(--shadow-float)] active:scale-95 transition-transform duration-200">
                  <Icon className="w-6 h-6" strokeWidth={2.5} />
                </div>
              ) : (
                <>
                  <Icon className="w-[22px] h-[22px]" strokeWidth={active ? 2.25 : 1.75} />
                  <span className="text-[10px] font-medium">{label}</span>
                </>
              )}
              {accent && <span className="text-[10px] font-medium text-[var(--brand)]">{label}</span>}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
