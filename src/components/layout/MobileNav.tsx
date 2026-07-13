"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Home, Heart, Plus, MessageCircle, User } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", icon: Home, label: "Главная" },
  { href: "/favorites", icon: Heart, label: "Избранное", badgeKey: "favorites" as const },
  { href: "/create", icon: Plus, label: "Подать", accent: true },
  { href: "/messages", icon: MessageCircle, label: "Чаты", badgeKey: "messages" as const },
  { href: "/profile", icon: User, label: "Профиль" },
];

export function MobileNav() {
  const pathname = usePathname();
  const [badges, setBadges] = useState({ favorites: 0, messages: 0 });

  const hideOnListing = pathname.startsWith("/listing/");
  const hideOnChat = /^\/messages\/[^/]+$/.test(pathname);

  useEffect(() => {
    fetch("/api/nav/badges")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setBadges({ favorites: d.favorites ?? 0, messages: d.messages ?? 0 }))
      .catch(() => {});
  }, [pathname]);

  if (hideOnListing || hideOnChat) return null;

  return (
    <nav className="app-fixed bottom-0 glass border-t border-[var(--border)]/60">
      <div className="flex items-end justify-around h-[52px] px-2 pb-[env(safe-area-inset-bottom)]">
        {NAV.map(({ href, icon: Icon, label, accent, badgeKey }) => {
          const active = pathname === href || (href !== "/" && pathname.startsWith(href));
          const badge = badgeKey ? badges[badgeKey] : 0;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "relative flex flex-col items-center justify-center gap-0.5 min-w-[56px] py-1 transition-all duration-200",
                accent ? "-mt-4" : active ? "text-[var(--brand)]" : "text-[var(--text-muted)]"
              )}
            >
              {accent ? (
                <div className="w-[52px] h-[52px] rounded-full bg-[var(--accent)] text-[var(--accent-fg)] flex items-center justify-center shadow-[var(--shadow-float)] active:scale-95 transition-transform duration-200">
                  <Icon className="w-6 h-6" strokeWidth={2.5} />
                </div>
              ) : (
                <>
                  <div className="relative">
                    <Icon className="w-[22px] h-[22px]" strokeWidth={active ? 2.25 : 1.75} />
                    {badge > 0 && (
                      <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-[var(--danger)] text-white text-[9px] font-bold flex items-center justify-center">
                        {badge > 9 ? "9+" : badge}
                      </span>
                    )}
                  </div>
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
